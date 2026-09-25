import { KIT_OPTIONS } from "./kits";

/** Built-in asset library shown in the editor's image picker. Files live in /public/assets. */
export const ASSET_LIBRARY: { group: string; items: { label: string; src: string }[] }[] = [
  {
    group: "RGG brand",
    items: [
      { label: "RGG wordmark", src: "/assets/rgg/rgg-wordmark.webp" },
      { label: "RGG wordmark (footer)", src: "/assets/rgg/rgg-wordmark-footer.webp" },
      { label: "Gold Buffalo coin pair", src: "/assets/rgg/coin-pair.webp" },
      { label: "Peace Dollar silver trio", src: "/assets/rgg/coin-trio.webp" },
    ],
  },
  { group: "Free guides", items: KIT_OPTIONS.map((k) => ({ label: k.label, src: k.src })) },
  {
    group: "Hero backgrounds",
    items: [
      { label: "American flag", src: "/assets/rgg/hero-bg-flag.webp" },
      { label: "Sunrise", src: "/assets/rgg/hero-bg-sunrise.webp" },
    ],
  },
  {
    group: "Sample partners",
    items: [
      { label: "USA Gov Policy logo", src: "/assets/partners/usa-gov-policy/partner-logo.webp" },
      { label: "Frank Vernuccio", src: "/assets/partners/usa-gov-policy/hero-portrait.webp" },
      { label: "IBTV logo", src: "/assets/partners/ibtv-faith/partner-logo.webp" },
      { label: "Karon Smedley", src: "/assets/partners/ibtv-faith/hero-portrait.webp" },
    ],
  },
  {
    group: "Placeholders",
    items: [
      { label: "Partner logo", src: "/assets/partners/_base/partner-logo.svg" },
      { label: "Partner portrait", src: "/assets/partners/_base/hero-portrait.svg" },
    ],
  },
];
