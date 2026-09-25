/**
 * RGG Partner Landing Template - data model.
 *
 * One PageConfig = one partner landing page. Everything that differed between
 * usagovmetals.com and faithmetals.com lives here; the markup and CSS are shared.
 *
 * Text fields marked "Rich" accept a tiny, safe formatting syntax:
 *   **bold**   *italic*   [link text](https://url)   Enter = line break
 * and these tokens, replaced at render time:
 *   {phone}  {partner}  {rgg}  {firstName} (thank-you page only)
 */

export type Rich = string;

export interface BrandConfig {
  /** Partner display name, used in {partner} tokens, alt text and disclosures. */
  partnerName: string;
  partnerLogo: string;
  partnerLogoWidth: number;
  partnerLogoHeight: number;
  rggName: string;
  rggLogo: string;
  rggFooterLogo: string;
  phoneDisplay: string;
  /** E.164, e.g. +18884653049 */
  phoneE164: string;
  email: string;
  address: string;
  addressMapUrl: string;
  privacyUrl: string;
  termsUrl: string;
  amlUrl: string;
  copyrightYear: string;
}

export interface ThemeConfig {
  /** Preset id from THEME_PRESETS, or "custom" once any color is edited by hand. */
  preset: string;
  accent: string;
  accentLight: string;
  accentDark: string;
  navy: string;
  navyDeep: string;
  navyMid: string;
  ink: string;
  body: string;
  muted: string;
  paper: string;
  alt: string;
  line: string;
  /** Light-rays image behind the hero portrait. */
  heroBg: string;
  /** Partner logo height in the top bar, px. */
  partnerLogoHeight: number;
  partnerLogoHeightMobile: number;
}

export interface TrackingConfig {
  /**
   * The HubSpot embed snippet exactly as HubSpot gives it. The portal and form ids are
   * parsed out of it (src/template/hubspot.ts) into the two fields below.
   */
  hubspotEmbed: string;
  hubspotPortalId: string;
  hubspotFormGuid: string;
  hubspotRegion: string;
  /**
   * styled: the template's own form, posted to the HubSpot Forms API (keeps the design,
   *         the Kiflo lead call and the thank-you redirect). Recommended.
   * embed:  HubSpot's own iframe form, dropped into the form column.
   */
  formMode: "styled" | "embed";
  /** Kiflo referral code for this partner; spoken-domain traffic has no ?kfl_ln=. */
  kifloPartnerCode: string;
  debug: boolean;
}

export interface SeoConfig {
  title: string;
  description: string;
  siteName: string;
  ogTitle: string;
  ogDescription: string;
  canonicalUrl: string;
  ogImage: string;
  robots: string;
}

export interface ThankYouConfig {
  seoTitle: string;
  seoDescription: string;
  /**
   * portrait: partner photo on the left, message on the right (same layout as the hero).
   * dark:     centered message on navy.
   * light:    centered message on white.
   */
  style: "portrait" | "dark" | "light";
  /** Portrait style photo. Blank = the hero photo. */
  photo: string;
  /** Script signature under the message (portrait style). Blank name/role = the quote's. */
  showSignature: boolean;
  signatureName: string;
  signatureRole: string;
  /**
   * dark style: script signature line ("Thank you, {firstName}" / "Thank you") above the headline.
   * light style: greetingNamed REPLACES the headline when the first name is known.
   */
  greetingNamed: string;
  greeting: string;
  headline: string;
  body: Rich;
  primaryLabel: string;
  primaryUrl: string;
  showCallButton: boolean;
  callLabel: string;
  note: string;
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

export interface TopbarProps {
  callLabel: string;
}

export interface HeroProps {
  image: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
  headline: string;
  firstLabel: string;
  lastLabel: string;
  phoneLabel: string;
  emailLabel: string;
  submitLabel: string;
  consent: Rich;
}

export interface QuoteProps {
  quote: Rich;
  name: string;
  role: string;
}

export interface CallbandProps {
  headline: string;
  subline: string;
  buttonLabel: string;
}

export type BadgeKind = "bbb" | "google" | "trustpilot" | "consumeraffairs";
export interface Badge {
  kind: BadgeKind;
  url: string;
  label: string;
  /** BBB: big line ("A+ Rating"). Google: rating number ("4.9"). */
  value: string;
}
export interface WhyProps {
  headline: Rich;
  paragraphs: Rich[];
  badges: Badge[];
  note: string;
}

export interface KitProps {
  image: string;
  imageAlt: string;
  headline: string;
  lede: string;
  points: string[];
  buttonLabel: string;
  buttonHref: string;
  footnote: string;
  layout: "balanced" | "wide";
}

export interface ReasonsProps {
  headline: Rich;
  items: Rich[];
  source: string;
  sourceAlign: "left" | "center";
  image: string;
  imageAlt: string;
}

export interface QuestionProps {
  eyebrow: string;
  headline: string;
  paragraphs: Rich[];
  lead: Rich;
  accounts: string[];
  ask: Rich;
  buttonLabel: string;
  altPrefix: string;
  altLinkLabel: string;
  fine: string;
}

export interface OfferProps {
  image: string;
  imageAlt: string;
  eyebrow: string;
  headline: Rich;
  asterisk: boolean;
  buttonLabel: string;
  terms: string;
}

export interface ContentProps {
  background: "paper" | "alt" | "navy";
  eyebrow: string;
  headline: Rich;
  paragraphs: Rich[];
  buttonLabel: string;
  buttonHref: string;
}

export interface SplitProps {
  background: "paper" | "alt";
  imageSide: "left" | "right";
  image: string;
  imageAlt: string;
  eyebrow: string;
  headline: Rich;
  paragraphs: Rich[];
  bullets: string[];
  buttonLabel: string;
  buttonHref: string;
}

export interface FooterProps {
  partnerDisclosure: Rich;
  disclosures: Rich[];
}

export interface CallbarProps {
  label: string;
}

export interface SectionPropsMap {
  topbar: TopbarProps;
  hero: HeroProps;
  quote: QuoteProps;
  callband: CallbandProps;
  why: WhyProps;
  kit: KitProps;
  reasons: ReasonsProps;
  question: QuestionProps;
  offer: OfferProps;
  content: ContentProps;
  split: SplitProps;
  footer: FooterProps;
  callbar: CallbarProps;
}

export type SectionType = keyof SectionPropsMap;

export type Section = {
  [K in SectionType]: {
    id: string;
    type: K;
    hidden?: boolean;
    props: SectionPropsMap[K];
  };
}[SectionType];

export type SectionOf<K extends SectionType> = Extract<Section, { type: K }>;

export interface PageConfig {
  version: 1;
  /** URL slug: the page is served at <site>/<slug>. */
  slug: string;
  /** Internal name shown in the editor. */
  name: string;
  /**
   * The partner's own domain (e.g. SmedleyMetals.com). It 301-redirects to <site>/<slug>,
   * or, if connected to this project directly, serves the page at its root.
   */
  vanityDomain: string;
  brand: BrandConfig;
  theme: ThemeConfig;
  tracking: TrackingConfig;
  seo: SeoConfig;
  sections: Section[];
  thankYou: ThankYouConfig;
}

/** Values available to {token} replacement. */
export interface TokenContext {
  phone: string;
  partner: string;
  rgg: string;
  firstName?: string | undefined;
}
