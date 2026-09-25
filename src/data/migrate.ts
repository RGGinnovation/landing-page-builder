import { createBasePage } from "@/content/pages/base";
import { parseKifloCode } from "@/template/kiflo";
import { SECTIONS } from "@/template/registry";
import type { PageConfig, Section } from "@/template/types";

/**
 * Brings a stored page up to the current PageConfig shape: any field added to the
 * template after the page was saved gets its base-template default. Safe to run on
 * every read.
 */
export function migrate(input: PageConfig): PageConfig {
  const base = createBasePage({ slug: input.slug, name: input.name });
  const p = input as Partial<PageConfig>;
  const sections: Section[] = (p.sections ?? base.sections)
    .filter((s) => !!SECTIONS[s.type])
    .map(
      (s) =>
        ({ ...s, props: { ...SECTIONS[s.type].defaults(), ...(s.props as object) } }) as Section,
    );
  const tracking = { ...base.tracking, ...p.tracking };
  tracking.kifloPartnerCode = parseKifloCode(tracking.kifloPartnerCode);
  // Pages saved before the Kiflo key became a constant carry a now-unused field.
  delete (tracking as Record<string, unknown>)["kifloApiKey"];
  return {
    ...base,
    ...p,
    version: 1,
    vanityDomain: p.vanityDomain ?? "",
    brand: { ...base.brand, ...p.brand },
    theme: { ...base.theme, ...p.theme, preset: p.theme?.preset ?? "custom" },
    tracking,
    seo: { ...base.seo, ...p.seo },
    thankYou: { ...base.thankYou, ...p.thankYou },
    sections,
  };
}
