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

/** Retired default Why sentences (implied a benefit) and their personal-choice replacement. */
const OLD_WHY_SENTENCES = [
  "That is why I partnered with **Revelation Gold Group**, a faith-driven firm that shows families how physical gold and silver may help protect retirement and savings.",
  "That is why I partnered with **Revelation Gold Group**, a faith-driven firm that helps families understand how physical gold and silver may help protect their retirement and savings.",
  "That is exactly why I partnered with **Revelation Gold Group**, a faith-driven firm that walks families through how physical gold and silver may help protect retirement and savings.",
  "That is why I work with **Revelation Gold Group**, a faith-driven firm that shows families, in plain English, how physical gold and silver may help protect their savings.",
  "That is the reason I partnered with **Revelation Gold Group**, a faith-driven firm that explains how physical gold and silver may help protect retirement and savings.",
];
const NEW_WHY_SENTENCE =
  "Owning physical gold and silver is a personal choice I made for my own family, and when I looked for a company to work with, I chose **Revelation Gold Group**, a faith-driven firm.";

const STEWARD = KIT_OPTIONS.find((k) => k.id === "faithful-steward")!;
const OLD_STEWARD_HEADLINES = new Set(["Get Your Free Faithful Steward Guide"]);
const OLD_STEWARD_BUTTONS = new Set(["get my free guide"]);

/** One-way content upgrades for pages saved before a template change (idempotent). */
function upgradeSection(s: Section): Section {
  switch (s.type) {
    case "why": {
      // "Why I Believe" is one paragraph.
      let paras = s.props.paragraphs.map((x) => x.trim()).filter(Boolean);
      if (paras.length > 1) paras = [paras.join(" ")];
      // Personal choice only: swap the retired benefit sentence for the current one.
      const fixed = paras.map((x) =>
        OLD_WHY_SENTENCES.reduce((t, o) => t.replace(o, NEW_WHY_SENTENCE), x),
      );
      const changed =
        fixed.length !== s.props.paragraphs.length ||
        fixed.some((x, i) => x !== s.props.paragraphs[i]);
      return changed ? { ...s, props: { ...s.props, paragraphs: fixed } } : s;
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
