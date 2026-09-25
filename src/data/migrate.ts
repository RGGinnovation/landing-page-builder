import { createBasePage } from "@/content/pages/base";
import { parseKifloCode } from "@/template/kiflo";
import { KIT_OPTIONS } from "@/template/kits";
import { SECTIONS, SILVER_OFFER_DISCLAIMER } from "@/template/registry";
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
    )
    .map(upgradeSection);
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

const STEWARD = KIT_OPTIONS.find((k) => k.id === "faithful-steward")!;
const OLD_STEWARD_HEADLINES = new Set(["Get Your Free Faithful Steward Guide"]);
const OLD_STEWARD_BUTTONS = new Set(["get my free guide"]);

/** One-way content upgrades for pages saved before a template change (idempotent). */
function upgradeSection(s: Section): Section {
  switch (s.type) {
    case "why": {
      // "Why I Believe" is one paragraph.
      const paras = s.props.paragraphs.map((x) => x.trim()).filter(Boolean);
      return paras.length > 1 ? { ...s, props: { ...s.props, paragraphs: [paras.join(" ")] } } : s;
    }
    case "kit": {
      // Biblical Stewardship Kit wording for the Faithful Steward guide.
      if (s.props.image !== STEWARD.src) return s;
      const props = { ...s.props };
      if (OLD_STEWARD_HEADLINES.has(props.headline)) props.headline = STEWARD.headline;
      if (OLD_STEWARD_BUTTONS.has(props.buttonLabel.trim().toLowerCase()))
        props.buttonLabel = STEWARD.buttonLabel;
      return { ...s, props };
    }
    case "footer": {
      // Silver offer terms in every footer.
      const has = s.props.disclosures.some((d) => d.startsWith("Valid on qualifying orders only"));
      return has
        ? s
        : {
            ...s,
            props: { ...s.props, disclosures: [...s.props.disclosures, SILVER_OFFER_DISCLAIMER] },
          };
    }
    default:
      return s;
  }
}
