import { presetById } from "@/template/theme";

import { definePage } from "./helpers";

/**
 * faithmetals.com, rebuilt on the base template. Copy is verbatim from production.
 * Theme: production uses an amber accent; this sample uses the Ember preset (brand rule: no gold/amber).
 */
export default definePage(
  {
    slug: "ibtv-faith",
    name: "IBTV Faith Network",
    vanityDomain: "faithmetals.com",
    brand: {
      partnerName: "IBTV Faith Network",
      partnerLogo: "/assets/partners/ibtv-faith/partner-logo.webp",
      partnerLogoWidth: 360,
      partnerLogoHeight: 270,
    },
    theme: {
      preset: "ember",
      ...presetById("ember")!.colors,
      partnerLogoHeight: 42,
      partnerLogoHeightMobile: 32,
    },
    tracking: {
      hubspotEmbed:
        '<script src="https://js.hsforms.net/forms/embed/44817109.js" defer></script>\n<div class="hs-form-frame" data-region="na1" data-form-id="aa16d11f-7a58-47fd-9cd3-ee1ef9ed0e45" data-portal-id="44817109"></div>',
      hubspotFormGuid: "aa16d11f-7a58-47fd-9cd3-ee1ef9ed0e45",
      kifloPartnerCode: "karon-smedley",
    },
    seo: {
      title: "Free 2026 Gold & Silver Kit | IBTV Faith Network & Revelation Gold Group",
      description:
        "IBTV Faith Network viewers can request the free 2026 Wealth Protection Guide and Magazine from Revelation Gold Group. A plain English look at owning physical gold and silver. Nothing to buy.",
      siteName: "IBTV Faith Network x Revelation Gold Group",
      ogDescription:
        "A plain English guide to owning physical gold and silver, free for IBTV Faith Network viewers. Nothing to buy.",
      canonicalUrl: "",
      ogImage: "https://faithmetals.com/assets/og-image.jpg",
    },
    thankYou: {
      seoTitle: "Your kit is on its way | IBTV Faith Network x Revelation Gold Group",
      seoDescription:
        "Thank you for requesting the free 2026 Gold & Silver Kit. Check your inbox for the download link.",
      style: "portrait",
      greetingNamed: "Thank you, {firstName}",
      headline: "Your kit is on its way.",
      body: "Check your inbox for an email from Revelation Gold Group. Your free kit can take a few minutes to arrive, so if you do not see it, please check your spam or promotions folder.",
      note: "",
    },
  },
  {
    hero: {
      image: "/assets/partners/ibtv-faith/hero-portrait.webp",
      imageAlt: "Karon Smedley, co-founder of IBTV Faith Network",
      imageWidth: 820,
      imageHeight: 1341,
      submitLabel: "SEND ME MY FREE GUIDE",
    },
    quote: {
      // DRAFT COPY on production too: replace with Karon's approved sentence before launch.
      quote:
        "Our family has always believed in owning something real. Gold and silver have carried families through hard seasons for generations, and that is why I partnered with Revelation Gold Group.",
      name: "Karon Smedley",
      role: "Co-Founder, IBTV Faith Network",
    },
    why: {
      paragraphs: [
        "If you are worried about your savings right now, you are not alone. That is why I partnered with **Revelation Gold Group**, a faith-driven firm that shows families how physical gold and silver may help protect retirement and savings.",
        "I only put the IBTV name beside people I would send my own family to. I did my homework, I met the team, and I asked every question I would want you to ask. They answered all of them in plain English, and nobody pushed me toward a decision.",
        "A **BBB Accredited Business with an A+ rating**, a **4.9 star Google rating across 256 reviews**, and verified reviews on Trustpilot. They have helped families all over the country. Now they want to help you.",
      ],
    },
    kit: {
      image: "/assets/rgg/kit-wealth-guide.webp",
      imageAlt:
        "The 2026 Wealth Protection Guide, the Wealth Protection Magazine, and the bonus Faithful Steward guide",
      headline: "Get Your Free Faithful Steward Guide",
      lede: "Plain English. Rooted in Scripture. Read it at your kitchen table and decide for yourself.",
      points: [
        "What the Bible teaches about stewardship",
        "How to make money decisions in peace, not fear",
        "An honest look at gold and silver",
      ],
      buttonLabel: "GET MY FREE GUIDE",
      footnote: "FREE TO IBTV VIEWERS",
      layout: "wide",
    },
    reasons: {
      items: [
        "Inflation has quietly taken a bite out of what every dollar I saved will actually buy.",
        "The national debt has blown past **$40 trillion**, and nobody in Washington has a plan to pay it down.",
        "Gold and silver are real, physical assets. They are not somebody else’s promise to pay me later.",
      ],
      sourceAlign: "center",
    },
  },
);
