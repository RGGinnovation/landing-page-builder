import { createBasePage } from "@/content/pages/base";
import { APPROVED_HERO_HEADLINE } from "@/template/compliance";
import { parseKifloCode } from "@/template/kiflo";
import { KIT_OPTIONS } from "@/template/kits";
import { DEFAULT_DISCLOSURES, RETIRED_FOOTER_COPY, SECTIONS } from "@/template/registry";
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
    seo: tokenizeAll({ ...base.seo, ...p.seo }),
    thankYou: tokenizeAll({ ...base.thankYou, ...p.thankYou }),
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

/** Retired template copy that implied a benefit or gave tax guidance, and its replacement. */
const RETIRED_COPY: Record<string, string> = {
  "Your First Step To Help Protect Your Savings": APPROVED_HERO_HEADLINE,
  "Your First Step Toward Owning Physical Gold & Silver": APPROVED_HERO_HEADLINE,
  "If you have a 401(k) still sitting with an employer you left years ago, or an IRA you rarely look at, those funds are not locked into the choices you made the day you opened the account. They can hold physical gold and silver.":
    "If you have a 401(k) still sitting with an employer you left years ago, or an IRA you rarely look at, you may have more options than you think, including a tax-advantaged gold IRA that holds physical gold and silver.",
  "Moved directly from one custodian to another, the funds stay tax deferred. No taxes, and no early withdrawal penalty.":
    "Ask how a direct custodian-to-custodian transfer works before you decide anything.",
  // Silver offer terms (retired September 2026).
  "*Bonus silver applies to qualifying purchases only. Minimum purchase, eligible products, and expiration terms apply. Ask your Revelation Gold Group specialist for full details. Not financial advice.":
    "*Bonus silver starts at qualifying purchases of $50,000 in Revelation Gold Group premium coins, with 10% at $100,000 or more. Eligible products and expiration terms apply. Cannot be combined with other offers. Not financial advice.",
};
const RETIRED_OFFER_EYEBROW = /^plus!?\s*if you take action now\s*(…|\.{3})?$/i;
const upgradeText = (t: string) => RETIRED_COPY[t.trim()] ?? t;

/** Early pages stored the literal placeholder in SEO text instead of the {partner} token. */
const tokenize = (t: string) => t.replace(/Partner Name/g, "{partner}");

function tokenizeAll<T extends object>(o: T): T {
  const out = { ...o } as Record<string, unknown>;
  for (const [k, v] of Object.entries(out)) if (typeof v === "string") out[k] = tokenize(v);
  return out as T;
}

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
    case "hero":
      return { ...s, props: { ...s.props, headline: upgradeText(s.props.headline) } };
    case "offer": {
      const terms = upgradeText(s.props.terms);
      // The "Plus! If you take action now" eyebrow was retired (September 2026).
      const eyebrow = RETIRED_OFFER_EYEBROW.test(s.props.eyebrow.trim()) ? "" : s.props.eyebrow;
      return terms === s.props.terms && eyebrow === s.props.eyebrow
        ? s
        : { ...s, props: { ...s.props, terms, eyebrow } };
    }
    case "question":
      return {
        ...s,
        props: {
          ...s.props,
          lead: upgradeText(s.props.lead),
          paragraphs: s.props.paragraphs.map(upgradeText),
        },
      };
    case "footer": {
      // One short disclaimer paragraph replaces the old stock footer copy. Custom text is kept.
      const parts = [s.props.partnerDisclosure, ...s.props.disclosures]
        .map((x) => x.trim())
        .filter(Boolean);
      const retired = new Set(RETIRED_FOOTER_COPY);
      if (
        !parts.length ||
        !parts.some((x) => retired.has(x)) ||
        !parts.every((x) => retired.has(x))
      )
        return s;
      return {
        ...s,
        props: { ...s.props, partnerDisclosure: "", disclosures: [...DEFAULT_DISCLOSURES] },
      };
    }
    default:
      return s;
  }
}
