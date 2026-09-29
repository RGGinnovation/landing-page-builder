/**
 * "Fill from JSON": loads a partner-landing-page skill file (or a plain page export) into
 * the page that is open in the editor.
 *
 * Filled: partner name, vanity domain, colors and theme, hero background, logo size, HubSpot
 * form and Kiflo code (when the file has them), quote and signature, Why I Believe, 3 Reasons,
 * free guide, call band, hero headline and photo description, thank-you page and SEO.
 * Kept as they are: the page link (slug), photo, logo, thank-you photo, section visibility,
 * and the fixed template parts (401(k), offer, footer, top bar, call bar).
 */
import { migrate } from "@/data/migrate";
import type { PageConfig, Section, SectionType } from "@/template/types";

import { isPageConfig } from "./store";

export const KIT_FORMATS = ["rgg-partner-landing-page", "rgg-partner-page-kit"];

export interface KitFile {
  format?: string;
  page?: unknown;
  status?: { copyReady?: boolean; errors?: string[]; todo?: string[] };
}

/** The page inside a skill file, or the file itself when it is a plain page export. */
export function pageFromFile(raw: unknown): PageConfig {
  const kit = raw as KitFile;
  const data = KIT_FORMATS.includes(kit?.format ?? "") ? kit.page : raw;
  if (!isPageConfig(data)) throw new Error("That file is not a partner page or page kit.");
  return migrate(data);
}

/** Section props copied from the file, per section type. Other types keep the current page. */
const COPY: Partial<Record<SectionType, string[]>> = {
  hero: ["headline", "imageAlt"],
  quote: ["quote", "name", "role"],
  callband: ["headline", "subline", "buttonLabel"],
  why: ["headline", "paragraphs"],
  kit: ["image", "imageAlt", "headline", "lede", "points", "buttonLabel", "footnote"],
  reasons: ["headline", "items", "source", "sourceAlign"],
};

export function fillFromFile(
  current: PageConfig,
  raw: unknown,
): { page: PageConfig; name: string; suggestedSlug: string; errors: string[]; todo: number } {
  const src = pageFromFile(raw);
  const kit = raw as KitFile;
  const nonEmpty = (a: string, b: string) => (a && a.trim() ? a : b);

  const sections = current.sections.map((s) => {
    const keys = COPY[s.type];
    const from = src.sections.find((x) => x.type === s.type);
    if (!keys || !from) return s;
    const props = { ...(s.props as unknown as Record<string, unknown>) };
    for (const k of keys) {
      const v = (from.props as unknown as Record<string, unknown>)[k];
      if (v !== undefined && !(k === "imageAlt" && v === "")) props[k] = structuredClone(v);
    }
    return { ...s, props } as unknown as Section;
  });

  const t = src.tracking;
  const page: PageConfig = {
    ...current,
    name: src.name || current.name,
    vanityDomain: nonEmpty(src.vanityDomain, current.vanityDomain),
    brand: { ...current.brand, partnerName: src.brand.partnerName || current.brand.partnerName },
    // Every color, the hero background and the logo size come from the file.
    theme: { ...src.theme },
    tracking: {
      ...current.tracking,
      ...(t.hubspotEmbed.trim()
        ? {
            hubspotEmbed: t.hubspotEmbed,
            hubspotPortalId: t.hubspotPortalId,
            hubspotFormGuid: t.hubspotFormGuid,
            hubspotRegion: t.hubspotRegion,
          }
        : {}),
      kifloPartnerCode: nonEmpty(t.kifloPartnerCode, current.tracking.kifloPartnerCode),
    },
    seo: {
      ...current.seo,
      title: src.seo.title,
      description: src.seo.description,
      ogTitle: src.seo.ogTitle,
      ogDescription: src.seo.ogDescription,
      siteName: src.seo.siteName,
    },
    thankYou: { ...src.thankYou, photo: current.thankYou.photo },
    sections,
  };

  return {
    page: migrate(page),
    name: src.brand.partnerName || src.name,
    suggestedSlug: src.slug,
    errors: kit?.status?.errors ?? [],
    todo: kit?.status?.todo?.length ?? 0,
  };
}
