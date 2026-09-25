import { HUBSPOT_PORTAL_ID } from "@/template/constants";
import { DEFAULT_KIT } from "@/template/kits";
import { createSection } from "@/template/registry";
import { DEFAULT_PRESET } from "@/template/theme";
import type { PageConfig, SectionType } from "@/template/types";

/**
 * THE BASE TEMPLATE.
 * Shared RGG brand, compliance copy and section order extracted from
 * usagovmetals.com + faithmetals.com, with partner slots left as placeholders.
 * Every new partner page starts as a copy of this.
 */

export const BASE_ORDER: SectionType[] = [
  "topbar",
  "hero",
  "quote",
  "callband",
  "why",
  "kit",
  "reasons",
  "question",
  "offer",
  "footer",
  "callbar",
];

export function createBasePage(overrides?: Partial<Pick<PageConfig, "slug" | "name">>): PageConfig {
  return {
    version: 1,
    slug: overrides?.slug ?? "new-partner",
    name: overrides?.name ?? "New partner",
    vanityDomain: "",
    brand: {
      partnerName: "Partner Name",
      partnerLogo: "/assets/partners/_base/partner-logo.svg",
      partnerLogoWidth: 520,
      partnerLogoHeight: 119,
      rggName: "Revelation Gold Group",
      rggLogo: "/assets/rgg/rgg-wordmark.webp",
      rggFooterLogo: "/assets/rgg/rgg-wordmark-footer.webp",
      phoneDisplay: "(888) 465-3049",
      phoneE164: "+18884653049",
      email: "Info@RevelationGoldGroup.com",
      address: "9440 Santa Monica Blvd, Suite 301, Beverly Hills, CA 90210",
      addressMapUrl:
        "https://maps.google.com/?q=9440+Santa+Monica+Blvd+Suite+301+Beverly+Hills+CA+90210",
      privacyUrl: "https://revelationgoldgroup.com/policy",
      termsUrl: "https://revelationgoldgroup.com/terms-of-service",
      amlUrl: "https://www.taxfreegoldira.com/aml-policy-anti-money-laundering",
      copyrightYear: "2026",
    },
    theme: {
      preset: DEFAULT_PRESET.id,
      ...DEFAULT_PRESET.colors,
      partnerLogoHeight: 34,
      partnerLogoHeightMobile: 25,
    },
    tracking: {
      hubspotEmbed: "",
      hubspotPortalId: HUBSPOT_PORTAL_ID,
      hubspotFormGuid: "",
      hubspotRegion: "na1",
      formMode: "styled",
      kifloPartnerCode: "",
      debug: false,
    },
    seo: {
      title: "Free 2026 Gold & Silver Kit | Partner Name & Revelation Gold Group",
      description:
        "Partner Name readers and listeners can request the free 2026 Wealth Protection Guide and Magazine from Revelation Gold Group. A plain English look at owning physical gold and silver. Nothing to buy.",
      siteName: "Partner Name x Revelation Gold Group",
      ogTitle: "Free 2026 Gold & Silver Kit",
      ogDescription:
        "A plain English guide to owning physical gold and silver, free for the Partner Name audience. Nothing to buy.",
      canonicalUrl: "",
      ogImage: "",
      robots: "index,follow",
    },
    thankYou: {
      seoTitle: "Your Kit Is On Its Way | Partner Name & Revelation Gold Group",
      seoDescription:
        "Thank you for requesting the free 2026 Wealth Protection Guide and Magazine. Check your inbox for the download, or call Revelation Gold Group at {phone}.",
      style: "portrait",
      photo: "",
      showSignature: true,
      signatureName: "",
      signatureRole: "",
      greetingNamed: "Thank you, {firstName}",
      greeting: "Thank you",
      headline: "Your kit is on its way.",
      body: DEFAULT_KIT.thankYouBody,
      primaryLabel: "Download the guide",
      primaryUrl: DEFAULT_KIT.downloadUrl,
      showCallButton: true,
      callLabel: "Call {phone}",
      note: "Questions? A Revelation Gold Group specialist can walk you through it, with nothing to buy.",
    },
    sections: BASE_ORDER.map((t) => createSection(t)).map((s, i) => ({
      ...s,
      id: `${s.type}-${i}`,
    })),
  };
}

export default createBasePage({ slug: "base", name: "Base template" });
