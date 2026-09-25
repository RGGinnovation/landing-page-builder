import { publicSiteUrl } from "./constants";
import { fill } from "./rich";
import type { PageConfig } from "./types";

type Meta = Record<string, string>;

function tokens(c: PageConfig) {
  return { phone: c.brand.phoneDisplay, partner: c.brand.partnerName, rgg: c.brand.rggName };
}

export function landingHead(c: PageConfig) {
  const t = tokens(c);
  const s = c.seo;
  const canonical = s.canonicalUrl || (publicSiteUrl() ? `${publicSiteUrl()}/${c.slug}` : "");
  const meta: Meta[] = [
    { title: fill(s.title, t) },
    { name: "description", content: fill(s.description, t) },
    { name: "robots", content: s.robots || "index,follow" },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: fill(s.siteName, t) },
    { property: "og:title", content: fill(s.ogTitle || s.title, t) },
    { property: "og:description", content: fill(s.ogDescription || s.description, t) },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "theme-color", content: c.theme.navyDeep },
  ];
  if (canonical) meta.push({ property: "og:url", content: canonical });
  if (s.ogImage) {
    meta.push(
      { property: "og:image", content: s.ogImage },
      { name: "twitter:image", content: s.ogImage },
    );
  }
  return {
    meta,
    links: canonical ? [{ rel: "canonical", href: canonical }] : [],
  };
}

export function thankYouHead(c: PageConfig) {
  const t = tokens(c);
  const ty = c.thankYou;
  return {
    meta: [
      { title: fill(ty.seoTitle, t) },
      { name: "description", content: fill(ty.seoDescription, t) },
      { name: "robots", content: "noindex,follow" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: fill(ty.headline, t) },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: c.theme.navyDeep },
    ] as Meta[],
  };
}
