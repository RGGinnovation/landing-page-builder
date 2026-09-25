import { getPage as getBundledPage } from "@/content/pages";
import { supabase } from "@/data/supabase";
import type { PageConfig } from "@/template/types";

import { migrate } from "./migrate";

/**
 * Public read path for partner pages. Runs on the server (SSR) and in the browser.
 * Uses the two security-definer RPCs from the migration, so anonymous visitors can read
 * the PUBLISHED snapshot of a page and nothing else (never drafts, never other columns).
 */
export async function loadPublishedPage(slug: string): Promise<PageConfig | undefined> {
  const s = slug.toLowerCase();
  if (supabase) {
    const { data, error } = await supabase.rpc("get_published_page", { p_slug: s });
    if (error) console.error("[pages] get_published_page", error.message);
    if (data) return migrate(data as PageConfig);
  }
  const bundled = getBundledPage(s);
  return bundled ? migrate(bundled) : undefined;
}

/** For a partner domain connected straight to this project: resolve "/" by hostname. */
export async function loadPublishedPageByDomain(host: string): Promise<PageConfig | undefined> {
  const h = host
    .toLowerCase()
    .replace(/^www\./, "")
    .replace(/:\d+$/, "");
  if (!h) return undefined;
  if (supabase) {
    const { data, error } = await supabase.rpc("get_published_page_by_domain", { p_domain: h });
    if (error) console.error("[pages] get_published_page_by_domain", error.message);
    if (data) return migrate(data as PageConfig);
  }
  const { PAGES } = await import("@/content/pages");
  const p = PAGES.find((x) => x.vanityDomain.toLowerCase() === h);
  return p ? migrate(p) : undefined;
}
