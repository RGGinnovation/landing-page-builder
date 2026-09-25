import { PAGES } from "@/content/pages";
import { migrate } from "@/data/migrate";
import { ASSET_BUCKET, cloudEnabled, supabase } from "@/integrations/supabase/client";
import type { PageConfig } from "@/template/types";

/**
 * Where partner pages are stored.
 *   cloud: Lovable Cloud (Supabase) table partner_pages + partner-assets bucket. Shared by the team.
 *   local: this browser only. Used until Cloud is switched on; public routes cannot see these drafts.
 */
export interface PageRecord {
  slug: string;
  name: string;
  draft: PageConfig;
  published: PageConfig | null;
  publishedAt: string | null;
  updatedAt: string;
}

export type PageStatus = "draft" | "published" | "changed";

/** JSON with sorted keys: Postgres jsonb does not keep key order, so plain stringify can't compare. */
export function stableStringify(v: unknown): string {
  if (Array.isArray(v)) return "[" + v.map(stableStringify).join(",") + "]";
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    return (
      "{" +
      Object.keys(o)
        .filter((k) => o[k] !== undefined)
        .sort()
        .map((k) => JSON.stringify(k) + ":" + stableStringify(o[k]))
        .join(",") +
      "}"
    );
  }
  return JSON.stringify(v);
}

export function samePage(a: PageConfig, b: PageConfig) {
  return stableStringify(a) === stableStringify(b);
}

export function statusOf(r: PageRecord): PageStatus {
  if (!r.published) return "draft";
  return samePage(r.published, r.draft) ? "published" : "changed";
}

export interface PageStore {
  mode: "cloud" | "local";
  list(): Promise<PageRecord[]>;
  saveDraft(page: PageConfig): Promise<void>;
  create(page: PageConfig): Promise<void>;
  publish(page: PageConfig): Promise<PageRecord>;
  unpublish(slug: string): Promise<void>;
  rename(oldSlug: string, page: PageConfig): Promise<void>;
  remove(slug: string): Promise<void>;
  uploadImage(file: File, slug: string): Promise<string>;
}

export function slugify(s: string) {
  return (
    s
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "partner"
  );
}

export function normalizeDomain(d: string) {
  return d
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");
}

/** Minimal shape check for imported JSON. */
export function isPageConfig(v: unknown): v is PageConfig {
  const p = v as PageConfig;
  return (
    !!p &&
    p.version === 1 &&
    typeof p.slug === "string" &&
    Array.isArray(p.sections) &&
    !!p.brand &&
    !!p.theme &&
    !!p.tracking
  );
}

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

/* ------------------------------------------------------------------ */
/* Cloud                                                               */
/* ------------------------------------------------------------------ */

type Row = {
  slug: string;
  name: string;
  draft: PageConfig;
  published: PageConfig | null;
  published_at: string | null;
  updated_at: string;
};

function fromRow(r: Row): PageRecord {
  return {
    slug: r.slug,
    name: r.name,
    draft: migrate(r.draft),
    published: r.published ? migrate(r.published) : null,
    publishedAt: r.published_at,
    updatedAt: r.updated_at,
  };
}

function friendly(e: { message: string; code?: string } | null): never {
  const msg = e?.message ?? "Unknown error";
  if (e?.code === "23505" && /vanity_domain/.test(msg))
    throw new Error("That vanity domain is already used by another partner page.");
  if (e?.code === "23505") throw new Error("A page with that URL already exists.");
  if (e?.code === "42501") throw new Error("Your account does not have editor access.");
  throw new Error(msg);
}

function rowFor(page: PageConfig) {
  return {
    slug: page.slug,
    name: page.name,
    draft: page,
    vanity_domain: normalizeDomain(page.vanityDomain) || null,
  };
}

const cloudStore: PageStore = {
  mode: "cloud",
  async list() {
    const { data, error } = await supabase!
      .from("partner_pages")
      .select("slug,name,draft,published,published_at,updated_at")
      .order("name");
    if (error) friendly(error);
    return (data as Row[]).map(fromRow);
  },
  async saveDraft(page) {
    const { error } = await supabase!
      .from("partner_pages")
      .update(rowFor(page))
      .eq("slug", page.slug);
    if (error) friendly(error);
  },
  async create(page) {
    const { error } = await supabase!.from("partner_pages").insert(rowFor(page));
    if (error) friendly(error);
  },
  async publish(page) {
    const { data, error } = await supabase!
      .from("partner_pages")
      .update({ ...rowFor(page), published: page, published_at: new Date().toISOString() })
      .eq("slug", page.slug)
      .select("slug,name,draft,published,published_at,updated_at")
      .single();
    if (error) friendly(error);
    return fromRow(data as Row);
  },
  async unpublish(slug) {
    const { error } = await supabase!
      .from("partner_pages")
      .update({ published: null, published_at: null })
      .eq("slug", slug);
    if (error) friendly(error);
  },
  async rename(oldSlug, page) {
    const { data, error } = await supabase!
      .from("partner_pages")
      .select("published,published_at")
      .eq("slug", oldSlug)
      .single();
    if (error) friendly(error);
    const old = data as { published: PageConfig | null; published_at: string | null };
    // Free the vanity domain on the old row first (unique constraint), then move.
    const clear = await supabase!
      .from("partner_pages")
      .update({ vanity_domain: null })
      .eq("slug", oldSlug);
    if (clear.error) friendly(clear.error);
    const ins = await supabase!.from("partner_pages").insert({
      ...rowFor(page),
      published: old.published ? { ...old.published, slug: page.slug } : null,
      published_at: old.published_at,
    });
    if (ins.error) friendly(ins.error);
    const del = await supabase!.from("partner_pages").delete().eq("slug", oldSlug);
    if (del.error) friendly(del.error);
  },
  async remove(slug) {
    const { error } = await supabase!.from("partner_pages").delete().eq("slug", slug);
    if (error) friendly(error);
  },
  async uploadImage(file, slug) {
    const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `${slug}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
    const { error } = await supabase!.storage
      .from(ASSET_BUCKET)
      .upload(path, file, { cacheControl: "31536000", upsert: false, contentType: file.type });
    if (error) throw new Error(error.message);
    return supabase!.storage.from(ASSET_BUCKET).getPublicUrl(path).data.publicUrl;
  },
};

/* ------------------------------------------------------------------ */
/* Local (this browser)                                                */
/* ------------------------------------------------------------------ */

const KEY = "rgg-partner-pages:v2";
const MAX_UPLOAD = 700 * 1024;

function readAll(): Record<string, PageRecord> {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const all = JSON.parse(raw) as Record<string, PageRecord>;
      for (const r of Object.values(all)) {
        r.draft = migrate(r.draft);
        if (r.published) r.published = migrate(r.published);
      }
      return all;
    }
  } catch {
    /* private mode or corrupted: start fresh */
  }
  const seeded: Record<string, PageRecord> = {};
  const now = new Date().toISOString();
  for (const p of PAGES) {
    const page = migrate(clone(p));
    seeded[p.slug] = {
      slug: p.slug,
      name: p.name,
      draft: page,
      published: clone(page),
      publishedAt: now,
      updatedAt: now,
    };
  }
  return seeded;
}

function writeAll(all: Record<string, PageRecord>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch (e) {
    throw new Error(
      "This browser is out of storage (uploaded images are kept inline in local mode). Turn on Lovable Cloud, or use smaller images.",
      { cause: e },
    );
  }
}

function assertDomainFree(all: Record<string, PageRecord>, page: PageConfig) {
  const d = normalizeDomain(page.vanityDomain);
  if (!d) return;
  const clash = Object.values(all).find(
    (r) => r.slug !== page.slug && normalizeDomain(r.draft.vanityDomain) === d,
  );
  if (clash) throw new Error(`That vanity domain is already used by “${clash.name}”.`);
}

const localStore: PageStore = {
  mode: "local",
  async list() {
    return Object.values(readAll()).sort((a, b) => a.name.localeCompare(b.name));
  },
  async saveDraft(page) {
    const all = readAll();
    const r = all[page.slug];
    if (!r) throw new Error("Page not found.");
    assertDomainFree(all, page);
    all[page.slug] = { ...r, name: page.name, draft: page, updatedAt: new Date().toISOString() };
    writeAll(all);
  },
  async create(page) {
    const all = readAll();
    if (all[page.slug]) throw new Error("A page with that URL already exists.");
    const now = new Date().toISOString();
    all[page.slug] = {
      slug: page.slug,
      name: page.name,
      draft: page,
      published: null,
      publishedAt: null,
      updatedAt: now,
    };
    writeAll(all);
  },
  async publish(page) {
    const all = readAll();
    assertDomainFree(all, page);
    const now = new Date().toISOString();
    const r: PageRecord = {
      slug: page.slug,
      name: page.name,
      draft: page,
      published: clone(page),
      publishedAt: now,
      updatedAt: now,
    };
    all[page.slug] = r;
    writeAll(all);
    return r;
  },
  async unpublish(slug) {
    const all = readAll();
    const r = all[slug];
    if (r) all[slug] = { ...r, published: null, publishedAt: null };
    writeAll(all);
  },
  async rename(oldSlug, page) {
    const all = readAll();
    if (all[page.slug]) throw new Error("A page with that URL already exists.");
    const old = all[oldSlug];
    delete all[oldSlug];
    all[page.slug] = {
      slug: page.slug,
      name: page.name,
      draft: page,
      published: old?.published ? { ...old.published, slug: page.slug } : null,
      publishedAt: old?.publishedAt ?? null,
      updatedAt: new Date().toISOString(),
    };
    writeAll(all);
  },
  async remove(slug) {
    const all = readAll();
    delete all[slug];
    writeAll(all);
  },
  async uploadImage(file) {
    if (file.size > MAX_UPLOAD)
      throw new Error(
        `That file is ${(file.size / 1024).toFixed(0)} KB. In local mode keep uploads under 700 KB (WebP works best). With Lovable Cloud on, any size up to 10 MB works.`,
      );
    return await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = () => reject(new Error("Could not read that file."));
      r.readAsDataURL(file);
    });
  },
};

export const store: PageStore = cloudEnabled ? cloudStore : localStore;

/** Synchronous local read for /preview?slug= opened in its own tab (local mode). */
export function readLocalDraft(slug: string): PageConfig | undefined {
  return readAll()[slug]?.draft;
}
