# Project rules for AI agents (Lovable, Claude, etc.)

RGG Partner Pages: one template, one editor, every partner landing page. Read README.md first.

- Partner pages are DATA (PageConfig in src/template/types.ts). Content changes happen in /admin
  or in the partner_pages table, never by hard-coding partner text in components.
- The template is fixed. Do not restyle src/template/styles/landing.css or the sections in
  src/template/sections/. New styles go at the end of landing.css in the same design language.
- The lead form markup in src/template/sections/hero.tsx (ids rggForm, rggSubmit, rggNote,
  f_kiflo, input names) and src/template/lead-form.ts must stay compatible with HubSpot and Kiflo.
- The Kiflo snippet (src/template/tracking-scripts.ts, key in src/template/constants.ts) must stay
  on every public page. Do not remove it or make it conditional.
- Public routes: /$slug and /$slug/thank-you. Reserved slugs live in RESERVED_SLUGS. Any new
  top-level route must be added there.
- Visitors read pages only through the get_published_page* RPCs. Never grant anon access to the
  partner_pages table.
- Brand: RGG palette only in the editor UI (#1a1a1a, #072b4e, #ebebeb, #ffffff). No gold, yellow,
  amber, bronze or brass anywhere. No em dashes in any copy.
- Compliance: "Not financial advice" stays in the footer disclosures. No return promises,
  guarantees or price predictions in any default or generated copy.

<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history (force pushing, or rebasing/amending/squashing commits
> that are already pushed), as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
