import { presetById } from "@/template/theme";

import { definePage } from "./helpers";

/** usagovmetals.com - rebuilt on the base template. Copy is verbatim from production. */
export default definePage(
  {
    slug: "usa-gov-policy",
    name: "USA Gov Policy",
    vanityDomain: "usagovmetals.com",
    brand: {
      partnerName: "USA Gov Policy",
      partnerLogo: "/assets/partners/usa-gov-policy/partner-logo.webp",
      partnerLogoWidth: 520,
      partnerLogoHeight: 119,
    },
    theme: {
      preset: "patriot-red",
      ...presetById("patriot-red")!.colors,
      partnerLogoHeight: 34,
      partnerLogoHeightMobile: 25,
    },
    tracking: {
      hubspotEmbed:
        '<script src="https://js.hsforms.net/forms/embed/44817109.js" defer></script>\n<div class="hs-form-frame" data-region="na1" data-form-id="fe16e5fe-a39a-414e-90dc-ad07416fbe39" data-portal-id="44817109"></div>',
      hubspotFormGuid: "fe16e5fe-a39a-414e-90dc-ad07416fbe39",
      kifloPartnerCode: "usa-gov-policy",
    },
    seo: {
      title: "Free 2026 Gold & Silver Kit | USA Gov Policy & Revelation Gold Group",
      description:
        "USA Gov Policy readers and listeners can request the free 2026 Wealth Protection Guide and Magazine from Revelation Gold Group. A plain English look at owning physical gold and silver. Nothing to buy.",
      siteName: "USA Gov Policy x Revelation Gold Group",
      ogDescription:
        "A plain English guide to owning physical gold and silver, free for the USA Gov Policy audience. Nothing to buy.",
      canonicalUrl: "",
      ogImage: "https://usagovmetals.com/assets/og-image.jpg",
    },
    thankYou: {
      seoTitle: "Your Kit Is On Its Way | USA Gov Policy & Revelation Gold Group",
    },
  },
  {
    hero: {
      image: "/assets/partners/usa-gov-policy/hero-portrait.webp",
      imageAlt: "Frank Vernuccio, Editor-in-Chief of the New York Analysis of Policy & Government",
      imageWidth: 820,
      imageHeight: 986,
      submitLabel: "Get started with this free kit",
    },
    quote: {
      quote:
        "For decades I have written about Washington’s spending, the debt it leaves behind, and what it costs ordinary Americans. Gold and silver have outlasted every policy failure I have covered. That is why I partnered with Revelation.",
      name: "Frank Vernuccio",
      role: "Editor-in-Chief, New York Analysis of Policy & Government",
    },
    why: {
      paragraphs: [
        "If you are worried about your savings right now, you are not alone. That is why I partnered with **Revelation Gold Group**, a faith-driven firm that shows families how physical gold and silver may help protect retirement and savings.",
        "I do not lend our name out. I did my homework, I met the team, and I asked every question I would want you to ask. They answered all of them in plain English, and nobody pushed me toward a decision.",
        "A **BBB Accredited Business with an A+ rating**, a **4.9 star Google rating across 256 reviews**, and verified reviews on Trustpilot. They have helped families all over the country. Now they want to help you.",
      ],
    },
    kit: {
      layout: "balanced",
    },
    reasons: {
      items: [
        "The national debt has blown past **$40 trillion**. Not one plan to pay it back has ever reached a floor vote.",
        "Inflation is not weather. It is policy. And it takes from the savers who did everything right.",
        "Gold and silver are real. You can hold them in your hand. They are nobody’s promise and nobody’s IOU.",
      ],
      sourceAlign: "left",
    },
  },
);
