import type { ComponentType } from "react";

import { RICH_HELP, type Field } from "./fields";
import { DEFAULT_KIT } from "./kits";
import {
  Callband,
  Content,
  Kit,
  Offer,
  Question,
  Quote,
  Reasons,
  Split,
  Why,
} from "./sections/blocks";
import { Callbar, Footer, Topbar } from "./sections/chrome";
import { Hero } from "./sections/hero";
import type { Section, SectionPropsMap, SectionType } from "./types";

export interface SectionDef<K extends SectionType> {
  type: K;
  label: string;
  description: string;
  /** Only one allowed per page (form ids, fixed chrome). */
  singleton?: boolean;
  /** Pinned to top/bottom and cannot be reordered. */
  pinned?: "top" | "bottom";
  component: ComponentType<{ sid: string; props: SectionPropsMap[K] }>;
  fields: Field[];
  defaults: () => SectionPropsMap[K];
}

const img = (key: string, label: string, help?: string): Field =>
  help ? { key, label, type: "image", help } : { key, label, type: "image" };
const txt = (key: string, label: string, help?: string): Field =>
  help ? { key, label, type: "text", help } : { key, label, type: "text" };
const rich = (key: string, label: string, rows = 3): Field => ({
  key,
  label,
  type: "rich",
  rows,
  help: RICH_HELP,
});
const richList = (key: string, label: string, itemLabel = "Paragraph"): Field => ({
  key,
  label,
  type: "stringList",
  rich: true,
  itemLabel,
  help: RICH_HELP,
});

type Registry = { [K in SectionType]: SectionDef<K> };

export const SECTIONS: Registry = {
  topbar: {
    type: "topbar",
    label: "Top bar",
    description: "Partner logo + RGG wordmark lockup and click-to-call.",
    singleton: true,
    pinned: "top",
    component: Topbar,
    fields: [
      txt("callLabel", "Call label"),
      { key: "_h", label: "Logos and phone number are set under Brand.", type: "heading" },
    ],
    defaults: () => ({ callLabel: "Questions? Call" }),
  },

  hero: {
    type: "hero",
    label: "Hero + lead form",
    description: "Partner portrait over the light-rays background, with the HubSpot lead form.",
    singleton: true,
    component: Hero,
    fields: [
      txt("headline", "Headline"),
      img("image", "Partner portrait", "Transparent PNG/WebP cut-out, about 820px wide."),
      txt("imageAlt", "Portrait alt text"),
      { key: "imageWidth", label: "Portrait width (px)", type: "number" },
      { key: "imageHeight", label: "Portrait height (px)", type: "number" },
      {
        key: "_f",
        label: "Form",
        type: "heading",
        help: "Field names and validation are fixed for HubSpot.",
      },
      txt("firstLabel", "First name label"),
      txt("lastLabel", "Last name label"),
      txt("phoneLabel", "Phone label"),
      txt("emailLabel", "Email label"),
      txt("submitLabel", "Button label"),
      rich("consent", "Consent / TCPA text", 6),
    ],
    defaults: () => ({
      image: "/assets/partners/_base/hero-portrait.svg",
      imageAlt: "{partner}",
      imageWidth: 820,
      imageHeight: 986,
      headline: "Your First Step To Help Protect Your Savings",
      firstLabel: "First Name",
      lastLabel: "Last Name",
      phoneLabel: "Phone Number",
      emailLabel: "Email",
      submitLabel: "Get started with this free kit",
      consent: DEFAULT_CONSENT,
    }),
  },

  quote: {
    type: "quote",
    label: "Endorsement quote",
    description: "Partner quote with script signature.",
    component: Quote,
    fields: [
      rich("quote", "Quote (no quote marks needed)", 4),
      txt("name", "Signature name"),
      txt("role", "Role / title"),
    ],
    defaults: () => ({
      quote:
        "One or two sentences in the partner's own words about why they partnered with Revelation.",
      name: "Partner Name",
      role: "Title, Organization",
    }),
  },

  callband: {
    type: "callband",
    label: "Call band",
    description: "Navy band with a big click-to-call button.",
    component: Callband,
    fields: [
      txt("headline", "Headline"),
      txt("subline", "Sub line"),
      txt("buttonLabel", "Button label"),
    ],
    defaults: () => ({
      headline: "Have a question first?",
      subline: "Talk to a real person.",
      buttonLabel: "Call {phone}",
    }),
  },

  why: {
    type: "why",
    label: "Why I believe (trust badges)",
    description: "First-person copy next to the BBB / Google / Trustpilot / ConsumerAffairs wall.",
    component: Why,
    fields: [
      rich("headline", "Headline", 2),
      richList("paragraphs", "Paragraphs"),
      {
        key: "badges",
        label: "Badges",
        type: "list",
        itemLabel: "Badge",
        summary: (b) => String(b["kind"] ?? ""),
        newItem: () => ({ kind: "google", url: "", label: "", value: "" }),
        fields: [
          {
            key: "kind",
            label: "Type",
            type: "select",
            options: [
              { value: "bbb", label: "BBB" },
              { value: "google", label: "Google rating" },
              { value: "trustpilot", label: "Trustpilot" },
              { value: "consumeraffairs", label: "ConsumerAffairs" },
            ],
          },
          { key: "url", label: "Link (blank = not clickable)", type: "url" },
          txt("label", "Caption"),
          txt("value", "Value", "BBB: big line (A+ Rating). Google: rating (4.9)."),
        ],
      },
      txt("note", "Footnote under badges"),
    ],
    defaults: () => ({
      headline: "Why I Believe in\nRevelation Gold Group",
      paragraphs: [
        "If you are worried about your savings right now, you are not alone. That is why I partnered with **Revelation Gold Group**, a faith-driven firm that shows families how physical gold and silver may help protect retirement and savings.",
        "I did my homework, I met the team, and I asked every question I would want you to ask. They answered all of them in plain English, and nobody pushed me toward a decision.",
        "A **BBB Accredited Business with an A+ rating**, a **4.9 star Google rating across 256 reviews**, and verified reviews on Trustpilot. They have helped families all over the country. Now they want to help you.",
      ],
      badges: DEFAULT_BADGES.map((b) => ({ ...b })),
      note: "Ratings and review counts are current as of September 2026 and are published by the rating bodies named above.",
    }),
  },

  kit: {
    type: "kit",
    label: "Free kit",
    description: "Product shot of the guide with checklist and CTA.",
    component: Kit,
    fields: [
      img("image", "Kit image"),
      txt("imageAlt", "Image alt text"),
      txt("headline", "Headline"),
      { key: "lede", label: "Lede", type: "textarea", rows: 2 },
      { key: "points", label: "Checklist", type: "stringList", itemLabel: "Point" },
      txt("buttonLabel", "Button label"),
      { key: "buttonHref", label: "Button link", type: "url", placeholder: "#request" },
      txt("footnote", "Small caps note under the button (blank = none)"),
      {
        key: "layout",
        label: "Layout",
        type: "select",
        options: [
          { value: "balanced", label: "Balanced (USA Gov Policy)" },
          { value: "wide", label: "Wide image (Faith Metals)" },
        ],
      },
    ],
    defaults: () => ({
      image: DEFAULT_KIT.src,
      imageAlt: DEFAULT_KIT.alt,
      headline: DEFAULT_KIT.headline,
      lede: DEFAULT_KIT.lede,
      points: [...DEFAULT_KIT.points],
      buttonLabel: DEFAULT_KIT.buttonLabel,
      buttonHref: "#request",
      footnote: "",
      layout: "balanced",
    }),
  },

  reasons: {
    type: "reasons",
    label: "3 reasons",
    description: "Numbered reasons with the gold coin pair.",
    component: Reasons,
    fields: [
      rich("headline", "Headline", 2),
      richList("items", "Reasons", "Reason"),
      txt("source", "Source line"),
      {
        key: "sourceAlign",
        label: "Source alignment",
        type: "select",
        options: [
          { value: "left", label: "Left" },
          { value: "center", label: "Center" },
        ],
      },
      img("image", "Image"),
      txt("imageAlt", "Image alt text"),
    ],
    defaults: () => ({
      headline: "3 Reasons I Choose\nGold & Silver",
      items: [
        "The national debt has blown past **$40 trillion**, and nobody in Washington has a plan to pay it down.",
        "Inflation has quietly taken a bite out of what every dollar saved will actually buy.",
        "Gold and silver are real, physical assets. They are not somebody else’s promise to pay later.",
      ],
      source: "Source: U.S. Treasury, Debt to the Penny, September 2026.",
      sourceAlign: "left",
      image: "/assets/rgg/coin-pair.webp",
      imageAlt: "American Gold Buffalo one ounce .9999 fine gold coins, obverse and reverse",
    }),
  },

  question: {
    type: "question",
    label: "401(k) question",
    description: "Dark rollover explainer with the account-type grid.",
    component: Question,
    fields: [
      txt("eyebrow", "Eyebrow"),
      txt("headline", "Headline"),
      richList("paragraphs", "Paragraphs"),
      rich("lead", "Lead (white) paragraph"),
      { key: "accounts", label: "Account grid", type: "stringList", itemLabel: "Account" },
      rich("ask", "Prompt above button", 2),
      txt("buttonLabel", "Call button label"),
      txt("altPrefix", "Secondary link prefix"),
      txt("altLinkLabel", "Secondary link label (blank = hide)"),
      { key: "fine", label: "Fine print", type: "textarea", rows: 3 },
    ],
    defaults: () => ({
      eyebrow: "A question worth asking",
      headline: "Do you have a 401(k) sitting with a job you left?",
      paragraphs: [
        "If you have a 401(k) still sitting with an employer you left years ago, or an IRA you rarely look at, those funds are not locked into the choices you made the day you opened the account. They can hold physical gold and silver.",
      ],
      lead: "Moved directly from one custodian to another, the funds stay tax deferred. No taxes, and no early withdrawal penalty.",
      accounts: [
        "Old 401(k)",
        "Traditional or Roth IRA",
        "403(b)",
        "Thrift Savings Plan",
        "457(b)",
        "SEP or SIMPLE IRA",
      ],
      ask: "Have questions about a retirement account?\nSpeak with a representative now.",
      buttonLabel: "Call {phone}",
      altPrefix: "Or",
      altLinkLabel: "request the guide first",
      fine: "Eligibility depends on your plan and your custodian. Revelation Gold Group does not provide tax, legal, or investment advice. Consult your own advisors before any transfer.",
    }),
  },

  offer: {
    type: "offer",
    label: "Silver offer",
    description: "Promotion with coin image. Terms must be approved before launch.",
    component: Offer,
    fields: [
      img("image", "Image"),
      txt("imageAlt", "Image alt text"),
      txt("eyebrow", "Eyebrow"),
      rich("headline", "Headline", 2),
      { key: "asterisk", label: "Show asterisk", type: "toggle" },
      txt("buttonLabel", "Button label"),
      { key: "terms", label: "Offer terms", type: "textarea", rows: 4 },
    ],
    defaults: () => ({
      image: "/assets/rgg/coin-trio.webp",
      imageAlt: "Peace Dollar silver coins, obverse and reverse",
      eyebrow: "Plus! If you take action now…",
      headline: "Get Up To 10%\nIn Free Silver",
      asterisk: true,
      buttonLabel: "Get started with this free kit",
      terms:
        "*Bonus silver applies to qualifying purchases only. Minimum purchase, eligible products, and expiration terms apply. Ask your Revelation Gold Group specialist for full details. Not financial advice.",
    }),
  },

  content: {
    type: "content",
    label: "Text block",
    description: "Centered heading, paragraphs and optional button. Light, grey or navy.",
    component: Content,
    fields: [
      {
        key: "background",
        label: "Background",
        type: "select",
        options: [
          { value: "paper", label: "White" },
          { value: "alt", label: "Light grey" },
          { value: "navy", label: "Navy" },
        ],
      },
      txt("eyebrow", "Eyebrow"),
      rich("headline", "Headline", 2),
      richList("paragraphs", "Paragraphs"),
      txt("buttonLabel", "Button label (blank = hide)"),
      { key: "buttonHref", label: "Button link", type: "url", placeholder: "#request" },
    ],
    defaults: () => ({
      background: "paper",
      eyebrow: "",
      headline: "A new section heading",
      paragraphs: ["Write a short paragraph here."],
      buttonLabel: "",
      buttonHref: "#request",
    }),
  },

  split: {
    type: "split",
    label: "Image + text",
    description: "Two-column image and copy with optional checklist and button.",
    component: Split,
    fields: [
      {
        key: "background",
        label: "Background",
        type: "select",
        options: [
          { value: "paper", label: "White" },
          { value: "alt", label: "Light grey" },
        ],
      },
      {
        key: "imageSide",
        label: "Image side",
        type: "select",
        options: [
          { value: "left", label: "Left" },
          { value: "right", label: "Right" },
        ],
      },
      img("image", "Image"),
      txt("imageAlt", "Image alt text"),
      txt("eyebrow", "Eyebrow"),
      rich("headline", "Headline", 2),
      richList("paragraphs", "Paragraphs"),
      { key: "bullets", label: "Checklist", type: "stringList", itemLabel: "Point" },
      txt("buttonLabel", "Button label (blank = hide)"),
      { key: "buttonHref", label: "Button link", type: "url", placeholder: "#request" },
    ],
    defaults: () => ({
      background: "paper",
      imageSide: "left",
      image: "/assets/rgg/coin-pair.webp",
      imageAlt: "",
      eyebrow: "",
      headline: "Image and text section",
      paragraphs: ["Describe the idea in a sentence or two."],
      bullets: [],
      buttonLabel: "",
      buttonHref: "#request",
    }),
  },

  footer: {
    type: "footer",
    label: "Footer + disclosures",
    description: "RGG contact line, partner disclosure, compliance copy, legal links.",
    singleton: true,
    pinned: "bottom",
    component: Footer,
    fields: [
      rich("partnerDisclosure", "Partner disclosure", 4),
      richList("disclosures", "Compliance paragraphs"),
      { key: "_h", label: "Contact details and legal links are set under Brand.", type: "heading" },
    ],
    defaults: () => ({
      partnerDisclosure:
        "{partner} is a marketing partner of Revelation Gold Group and may be compensated for referrals made through this page. {partner} does not provide financial, tax, or investment advice. All products and services on this page are offered by Revelation Gold Group.",
      disclosures: [...DEFAULT_DISCLOSURES],
    }),
  },

  callbar: {
    type: "callbar",
    label: "Mobile call bar",
    description: "Sticky click-to-call bar on phones.",
    singleton: true,
    pinned: "bottom",
    component: Callbar,
    fields: [txt("label", "Button label")],
    defaults: () => ({ label: "Call {phone}" }),
  },
};

export const SECTION_ORDER: SectionType[] = [
  "topbar",
  "hero",
  "quote",
  "callband",
  "why",
  "kit",
  "reasons",
  "question",
  "offer",
  "content",
  "split",
  "footer",
  "callbar",
];

export function newId(type: string) {
  return type + "-" + Math.random().toString(36).slice(2, 8);
}

export function createSection<K extends SectionType>(type: K): Section {
  const def = SECTIONS[type] as SectionDef<K>;
  return { id: newId(type), type, props: def.defaults() } as unknown as Section;
}

/* ------------------------------------------------------------------ */
/* Shared default copy                                                 */
/* ------------------------------------------------------------------ */

export const DEFAULT_CONSENT =
  "By clicking the button above, you agree to our [Privacy Policy](https://revelationgoldgroup.com/policy) and [Terms\u00A0&\u00A0Conditions](https://revelationgoldgroup.com/terms-of-service) and authorize Revelation Gold Group, or someone acting on their behalf, to contact you by email, text message, and recorded and artificial voice message using automated telephone technology, including auto dialers, at the number you provided above. Consent is not a condition of any purchase. Message and data rates may apply. You may opt out at any time by replying STOP to any text message.";

export const DEFAULT_BADGES = [
  {
    kind: "bbb" as const,
    url: "https://www.bbb.org/us/ca/beverly-hills/profile/gold-sellers/revelation-gold-group-1216-1000029316",
    label: "Accredited Business",
    value: "A+ Rating",
  },
  {
    kind: "google" as const,
    url: "https://www.google.com/maps/search/?api=1&query=Revelation%20Gold%20Group%20Beverly%20Hills",
    label: "256 Google Reviews",
    value: "4.9",
  },
  {
    kind: "trustpilot" as const,
    url: "https://www.trustpilot.com/review/revelationgoldgroup.com",
    label: "Verified Client Reviews",
    value: "",
  },
  { kind: "consumeraffairs" as const, url: "", label: "Listed on ConsumerAffairs", value: "" },
];

export const DEFAULT_DISCLOSURES = [
  "Not financial advice. Revelation Gold Group does not provide tax, legal, accounting, or investment advice. Nothing on this page is a recommendation to buy or sell any asset. Consult your own tax, legal, and financial advisors before entering into any transaction. Revelation Gold Group and its representatives are not registered or licensed by any government agency as investment advisors or broker dealers.",
  "The purchase of precious metals involves risk. Prices fluctuate and can decline substantially. Premiums vary by product. Past performance does not guarantee future results, and no return of any kind is promised or implied. Precious metals produce no income and are not insured by the FDIC, the SIPC, or any government agency. Direct investment in precious metals, whether held personally or through an individual retirement account, is not suitable for all investors. Revelation Gold Group views physical precious metals as a long term holding with a recommended minimum horizon of three to five years or more. All decisions rest solely with the customer.",
];
