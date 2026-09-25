/**
 * The free guides offered in the editor's "Free guide" dropdown.
 *
 * Picking a guide sets, together:
 *   - the product shot and the copy on the right of the free kit section
 *   - the thank-you page download button link
 * To add or swap a guide: drop the image in /public/assets/rgg/ and edit this list. Nothing else.
 * Product shots are transparent WebP, about 2000px wide.
 */
import type { PageConfig } from "./types";

export interface KitOption {
  id: string;
  label: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  headline: string;
  lede: string;
  points: string[];
  buttonLabel: string;
  /** Thank-you page "Download the guide" link. */
  downloadUrl: string;
  /** Thank-you page message, used unless the editor has written a custom one. */
  thankYouBody: string;
}

export const KIT_OPTIONS: KitOption[] = [
  {
    id: "wealth-guide",
    label: "2026 Wealth Protection Guide (Faithful Steward bonus)",
    src: "/assets/rgg/kit-wealth-guide.webp",
    alt: "The 2026 Wealth Protection Guide and Magazine, with The Faithful Steward guide as a bonus",
    width: 2000,
    height: 1333,
    headline: "Get Started With This Free Gold & Silver Kit",
    lede: "Plain English. No jargon, no sales pitch. Read it at your kitchen table and decide for yourself.",
    points: [
      "How physical gold and silver actually work",
      "What a tax-advantaged gold IRA is, in plain English",
      "The 2026 Wealth Protection Magazine, included",
    ],
    buttonLabel: "Get started with this free kit",
    downloadUrl: "https://wealthguide.revelationgoldgroup.com",
    thankYouBody:
      "Please check your inbox for the 2026 Wealth Protection Guide and Magazine. It can take a few minutes to arrive, and it sometimes lands in the promotions or spam folder.",
  },
  {
    id: "faithful-steward",
    label: "The Faithful Steward (Wealth Guide bonus)",
    src: "/assets/rgg/kit-faithful-steward.webp",
    alt: "The Faithful Steward guide, with the 2026 Wealth Protection Guide as a bonus",
    width: 2000,
    height: 1125,
    headline: "Get Started With This Biblical Stewardship Kit",
    lede: "Plain English. Rooted in Scripture. Read it at your kitchen table and decide for yourself.",
    points: [
      "What the Bible teaches about stewardship",
      "How to make money decisions in peace, not fear",
      "An honest look at gold and silver",
    ],
    buttonLabel: "Get Your Free Kit",
    downloadUrl: "https://steward.revelationgoldgroup.com",
    thankYouBody:
      "Please check your inbox for The Faithful Steward guide. It can take a few minutes to arrive, and it sometimes lands in the promotions or spam folder.",
  },
];

export const DEFAULT_KIT = KIT_OPTIONS[0]!;

export function kitOptionFor(src: string): KitOption | undefined {
  return KIT_OPTIONS.find((k) => k.src === src);
}

/** Thank-you messages that belong to a guide (safe to swap when the guide changes). */
const GUIDE_BODIES = new Set(KIT_OPTIONS.map((k) => k.thankYouBody));

/**
 * Switches a page to a guide: kit image and copy, and the thank-you download link.
 * A custom thank-you message is kept; a guide's stock message is swapped for the new guide's.
 */
export function applyGuide(cfg: PageConfig, guide: KitOption): PageConfig {
  return {
    ...cfg,
    sections: cfg.sections.map((s) =>
      s.type === "kit"
        ? {
            ...s,
            props: {
              ...s.props,
              image: guide.src,
              imageAlt: guide.alt,
              headline: guide.headline,
              lede: guide.lede,
              points: [...guide.points],
              buttonLabel: guide.buttonLabel,
              footnote: "",
            },
          }
        : s,
    ),
    thankYou: {
      ...cfg.thankYou,
      primaryUrl: guide.downloadUrl,
      body: GUIDE_BODIES.has(cfg.thankYou.body) ? guide.thankYouBody : cfg.thankYou.body,
    },
  };
}
