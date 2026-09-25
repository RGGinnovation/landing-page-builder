import type { PageConfig } from "@/template/types";

import ibtvFaith from "./ibtv-faith";
import usaGovPolicy from "./usa-gov-policy";

/**
 * Sample partner pages bundled with the code. They are served at /<slug> when the
 * database has no page with that slug, and they seed the editor in local mode.
 * With Lovable Cloud on, every real partner page lives in the partner_pages table.
 */
export const PAGES: PageConfig[] = [usaGovPolicy, ibtvFaith];

export function getPage(slug: string): PageConfig | undefined {
  return PAGES.find((p) => p.slug === slug);
}
