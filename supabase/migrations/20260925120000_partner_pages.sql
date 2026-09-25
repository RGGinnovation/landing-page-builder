-- RGG Partner Pages: storage for every partner landing page.
-- Run once when Lovable Cloud is enabled (Lovable applies files in supabase/migrations).
--
--   draft      what the editor autosaves (team only)
--   published  the live snapshot served at <site>/<slug> (copied from draft on "Publish now")

create table if not exists public.partner_pages (
  slug          text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name          text not null,
  draft         jsonb not null,
  published     jsonb,
  published_at  timestamptz,
  vanity_domain text unique,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  updated_by    uuid references auth.users(id) on delete set null
);

create index if not exists partner_pages_vanity_domain_idx on public.partner_pages (lower(vanity_domain));

-- Who can edit: anyone signed in with a company email, plus anyone listed in partner_page_editors.
create table if not exists public.partner_page_editors (
  email      text primary key,
  added_at   timestamptz not null default now()
);

create or replace function public.is_page_editor() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(
    (auth.jwt() ->> 'email') ilike '%@revelationgoldgroup.com'
    or exists (select 1 from public.partner_page_editors e where lower(e.email) = lower(auth.jwt() ->> 'email')),
    false
  );
$$;

alter table public.partner_pages enable row level security;
alter table public.partner_page_editors enable row level security;

drop policy if exists "editors read pages" on public.partner_pages;
create policy "editors read pages" on public.partner_pages
  for select to authenticated using (public.is_page_editor());
drop policy if exists "editors write pages" on public.partner_pages;
create policy "editors write pages" on public.partner_pages
  for all to authenticated using (public.is_page_editor()) with check (public.is_page_editor());

drop policy if exists "editors read editors" on public.partner_page_editors;
create policy "editors read editors" on public.partner_page_editors
  for select to authenticated using (public.is_page_editor());

create or replace function public.touch_partner_pages() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  new.updated_by = auth.uid();
  return new;
end $$;

drop trigger if exists partner_pages_touch on public.partner_pages;
create trigger partner_pages_touch before insert or update on public.partner_pages
  for each row execute function public.touch_partner_pages();

-- Public read path. Visitors never touch the table: these return the published snapshot only.
create or replace function public.get_published_page(p_slug text) returns jsonb
language sql stable security definer set search_path = public as $$
  select published from public.partner_pages
  where slug = lower(p_slug) and published is not null;
$$;

create or replace function public.get_published_page_by_domain(p_domain text) returns jsonb
language sql stable security definer set search_path = public as $$
  select published from public.partner_pages
  where lower(vanity_domain) = lower(regexp_replace(p_domain, '^www\.', ''))
    and published is not null
  limit 1;
$$;

revoke all on function public.get_published_page(text) from public;
revoke all on function public.get_published_page_by_domain(text) from public;
grant execute on function public.get_published_page(text) to anon, authenticated;
grant execute on function public.get_published_page_by_domain(text) to anon, authenticated;
grant execute on function public.is_page_editor() to authenticated;

-- Partner logos and portraits. Public read, editors write.
insert into storage.buckets (id, name, public)
values ('partner-assets', 'partner-assets', true)
on conflict (id) do nothing;

drop policy if exists "partner assets public read" on storage.objects;
create policy "partner assets public read" on storage.objects
  for select using (bucket_id = 'partner-assets');
drop policy if exists "partner assets editor write" on storage.objects;
create policy "partner assets editor write" on storage.objects
  for insert to authenticated with check (bucket_id = 'partner-assets' and public.is_page_editor());
drop policy if exists "partner assets editor update" on storage.objects;
create policy "partner assets editor update" on storage.objects
  for update to authenticated using (bucket_id = 'partner-assets' and public.is_page_editor());
drop policy if exists "partner assets editor delete" on storage.objects;
create policy "partner assets editor delete" on storage.objects
  for delete to authenticated using (bucket_id = 'partner-assets' and public.is_page_editor());
