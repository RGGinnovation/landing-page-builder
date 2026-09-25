import type { CSSProperties } from "react";

import type { ThemeConfig } from "./types";

/** Maps PageConfig.theme to the CSS custom properties used by landing.css. */
export function themeToStyle(t: ThemeConfig): CSSProperties {
  return {
    "--accent": t.accent,
    "--accent-lt": t.accentLight,
    "--accent-dk": t.accentDark,
    "--navy": t.navy,
    "--navy-deep": t.navyDeep,
    "--navy-mid": t.navyMid,
    "--ink": t.ink,
    "--body": t.body,
    "--muted": t.muted,
    "--paper": t.paper,
    "--alt": t.alt,
    "--line": t.line,
    "--hero-img": t.heroBg ? `url("${t.heroBg}")` : "none",
    "--plogo-h": `${t.partnerLogoHeight}px`,
    "--plogo-h-sm": `${t.partnerLogoHeightMobile}px`,
  } as CSSProperties;
}

export const HERO_BACKGROUNDS: { id: string; label: string; src: string }[] = [
  { id: "flag", label: "American flag", src: "/assets/rgg/hero-bg-flag.webp" },
  { id: "sunrise", label: "Sunrise", src: "/assets/rgg/hero-bg-sunrise.webp" },
  { id: "none", label: "Plain", src: "" },
];

type ThemeColors = Omit<ThemeConfig, "preset" | "partnerLogoHeight" | "partnerLogoHeightMobile">;

export interface ThemePreset {
  id: string;
  name: string;
  /** Who it suits, shown under the swatch. */
  vibe: string;
  colors: ThemeColors;
}

const SURFACES = {
  ink: "#141726",
  body: "#3D4254",
  muted: "#6A7186",
  paper: "#FFFFFF",
  alt: "#EDEEF1",
  line: "#DCDEE5",
};

/**
 * Partner themes. Each one sets the accent (buttons, rules, stars, glows) and the dark
 * band color (top bar, hero, call band, footer). Brand rule: no gold, yellow, amber,
 * bronze or brass accents, so none of these sit in that hue range (see isGoldHue).
 */
export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "revelation-navy",
    name: "Revelation Navy",
    vibe: "RGG house style",
    colors: {
      ...SURFACES,
      accent: "#2C66A8",
      accentLight: "#3F7CC2",
      accentDark: "#1F4E85",
      navy: "#072B4E",
      navyDeep: "#041A30",
      navyMid: "#0A3560",
      heroBg: "/assets/rgg/hero-bg-flag.webp",
    },
  },
  {
    id: "patriot-red",
    name: "Patriot Red",
    vibe: "Conservative voices, policy",
    colors: {
      ...SURFACES,
      accent: "#C4162C",
      accentLight: "#DE2A40",
      accentDark: "#9E0F22",
      navy: "#0F1531",
      navyDeep: "#080C20",
      navyMid: "#141C3A",
      heroBg: "/assets/rgg/hero-bg-flag.webp",
    },
  },
  {
    id: "ember",
    name: "Ember",
    vibe: "Ministry, revival, faith media",
    colors: {
      ...SURFACES,
      accent: "#C2381C",
      accentLight: "#DA4F31",
      accentDark: "#982912",
      navy: "#10142E",
      navyDeep: "#080B1E",
      navyMid: "#161A3C",
      heroBg: "/assets/rgg/hero-bg-sunrise.webp",
    },
  },
  {
    id: "royal-purple",
    name: "Royal Purple",
    vibe: "Churches, ministry leaders",
    colors: {
      ...SURFACES,
      accent: "#6541B5",
      accentLight: "#7B58CC",
      accentDark: "#4D2F8F",
      navy: "#141130",
      navyDeep: "#0B0920",
      navyMid: "#1B173F",
      heroBg: "/assets/rgg/hero-bg-sunrise.webp",
    },
  },
  {
    id: "liberty-blue",
    name: "Liberty Blue",
    vibe: "Freedom-first, veterans",
    colors: {
      ...SURFACES,
      accent: "#2457C5",
      accentLight: "#3C71E0",
      accentDark: "#1A3F93",
      navy: "#0C1530",
      navyDeep: "#060C1F",
      navyMid: "#121D3D",
      heroBg: "/assets/rgg/hero-bg-flag.webp",
    },
  },
  {
    id: "frontier-green",
    name: "Frontier Green",
    vibe: "Homesteaders, preppers, outdoors",
    colors: {
      ...SURFACES,
      accent: "#2E7D4F",
      accentLight: "#3F9A65",
      accentDark: "#1F5A38",
      navy: "#0F1A17",
      navyDeep: "#08110E",
      navyMid: "#15241F",
      heroBg: "/assets/rgg/hero-bg-flag.webp",
    },
  },
  {
    id: "crimson",
    name: "Crimson",
    vibe: "Second Amendment, talk radio",
    colors: {
      ...SURFACES,
      accent: "#8F1D33",
      accentLight: "#AC2C44",
      accentDark: "#6E1426",
      navy: "#161216",
      navyDeep: "#0D0A0D",
      navyMid: "#1F191F",
      heroBg: "/assets/rgg/hero-bg-flag.webp",
    },
  },
  {
    id: "charcoal-steel",
    name: "Charcoal Steel",
    vibe: "Retirement educators, finance",
    colors: {
      ...SURFACES,
      accent: "#3E6A96",
      accentLight: "#5283B3",
      accentDark: "#2D5075",
      navy: "#1A1A1A",
      navyDeep: "#111111",
      navyMid: "#242424",
      heroBg: "",
    },
  },
];

export const DEFAULT_PRESET = THEME_PRESETS[0]!;

export function presetById(id: string): ThemePreset | undefined {
  return THEME_PRESETS.find((p) => p.id === id);
}

/** Apply a preset while keeping the partner's logo sizing. */
export function applyPreset(current: ThemeConfig, preset: ThemePreset): ThemeConfig {
  return { ...current, ...preset.colors, preset: preset.id };
}

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1]!, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(hex: string, target: number, amount: number) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const out = rgb.map((c) => Math.round(c + (target - c) * amount));
  return (
    "#" +
    out
      .map((c) => c.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

/** Derive hover (lighter) and pressed (darker) shades from one accent color. */
export function accentShades(accent: string) {
  return {
    accent: accent.toUpperCase(),
    accentLight: mix(accent, 255, 0.14),
    accentDark: mix(accent, 0, 0.22),
  };
}

/** Derive the three dark band shades from one base color. */
export function bandShades(base: string) {
  return { navy: base.toUpperCase(), navyDeep: mix(base, 0, 0.4), navyMid: mix(base, 255, 0.06) };
}

/**
 * True when a color reads as gold, yellow, amber, bronze or brass.
 * Used by the launch checklist to hold custom colors to the brand rule.
 */
export function isGoldHue(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  const [r, g, b] = rgb.map((c) => c / 255) as [number, number, number];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d < 0.12 || max < 0.25) return false; // greys and near-blacks
  let h = 0;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h *= 60;
  if (h < 0) h += 360;
  return h >= 24 && h <= 68;
}
