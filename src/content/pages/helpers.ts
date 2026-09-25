import type { PageConfig, SectionPropsMap, SectionType } from "@/template/types";

import { createBasePage } from "./base";

type SectionOverrides = { [K in SectionType]?: Partial<SectionPropsMap[K]> };

/** Build a partner page as "base template + overrides". Keeps partner files short. */
export function definePage(
  p: {
    slug: string;
    name: string;
    vanityDomain?: string;
    brand?: Partial<PageConfig["brand"]>;
    theme?: Partial<PageConfig["theme"]>;
    tracking?: Partial<PageConfig["tracking"]>;
    seo?: Partial<PageConfig["seo"]>;
    thankYou?: Partial<PageConfig["thankYou"]>;
  },
  sections: SectionOverrides = {},
): PageConfig {
  const base = createBasePage({ slug: p.slug, name: p.name });
  return {
    ...base,
    vanityDomain: p.vanityDomain ?? "",
    brand: { ...base.brand, ...p.brand },
    theme: { ...base.theme, ...p.theme },
    tracking: { ...base.tracking, ...p.tracking },
    seo: { ...base.seo, ...p.seo },
    thankYou: { ...base.thankYou, ...p.thankYou },
    sections: base.sections.map((s) => {
      const o = sections[s.type];
      return o ? ({ ...s, props: { ...s.props, ...o } } as typeof s) : s;
    }),
  };
}
