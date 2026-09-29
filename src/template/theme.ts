import type { CSSProperties } from "react";

import type { ThemeConfig } from "./types";

/** Maps PageConfig.theme to the CSS custom properties used by landing.css. */
export function themeToStyle(input: ThemeConfig): CSSProperties {
  const t = readableTheme(input);
  return {
    "--accent": t.accent,
    "--accent-lt": t.accentLight,
    "--accent-dk": t.accentDark,
    "--on-accent": t.onAccent,
    "--on-accent-lt": t.onAccentLight,
    "--accent-ink": t.accentInk,
    "--accent-glow": t.accentGlow,
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

/* ------------------------------------------------------------------ */
/* Readability: every text stays legible whatever colors are chosen    */
/* ------------------------------------------------------------------ */

function luminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const [r, g, b] = rgb.map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two hex colors (1 to 21). */
export function contrast(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m) as [number, number];
  return (x + 0.05) / (y + 0.05);
}

/** Moves a color toward black (target 0) or white (255) until it meets every contrast floor. */
function until(hex: string, target: 0 | 255, ok: (c: string) => boolean): string {
  if (!hexToRgb(hex)) return hex;
  let c = hex.toUpperCase();
  for (let i = 0; i < 40 && !ok(c); i++) c = mix(c, target, 0.06);
  return c;
}

const WHITE = "#FFFFFF";
const BAND_TEXT = 12; // white on the dark bands; as dark as the presets, so the softer greys there stay AA
const TEXT = 4.5; // WCAG AA for body text

/**
 * Returns the theme with the dark bands and text colors adjusted just enough for WCAG AA
 * legibility, plus the derived colors landing.css uses for text on and next to the accent:
 * onAccent (button labels), accentInk (accent text on light backgrounds) and accentGlow
 * (accent text on the dark bands). Presets pass through unchanged apart from the derived colors.
 */
export function readableTheme(t: ThemeConfig) {
  const navy = until(t.navy, 0, (c) => contrast(WHITE, c) >= BAND_TEXT);
  const navyDeep = until(t.navyDeep, 0, (c) => contrast(WHITE, c) >= BAND_TEXT);
  const navyMid = until(t.navyMid, 0, (c) => contrast(WHITE, c) >= BAND_TEXT);
  const lights = [t.paper, t.alt];
  const onLight = (c: string) => lights.every((l) => contrast(c, l) >= TEXT);
  const ink = until(t.ink, 0, onLight);
  const body = until(t.body, 0, onLight);
  const muted = until(t.muted, 0, onLight);
  const best = (bg: string) => (contrast(WHITE, bg) >= contrast(ink, bg) ? WHITE : ink);
  // Button fills: nudge darker only when neither white nor ink reaches AA on them.
  const labelOk = (c: string) => contrast(best(c), c) >= TEXT;
  const accent = until(t.accent, 0, labelOk);
  const accentLight = until(t.accentLight, 0, labelOk);
  return {
    ...t,
    accent: accent === t.accent.toUpperCase() ? t.accent : accent,
    accentLight: accentLight === t.accentLight.toUpperCase() ? t.accentLight : accentLight,
    navy: navy === t.navy.toUpperCase() ? t.navy : navy,
    navyDeep: navyDeep === t.navyDeep.toUpperCase() ? t.navyDeep : navyDeep,
    navyMid: navyMid === t.navyMid.toUpperCase() ? t.navyMid : navyMid,
    ink: ink === t.ink.toUpperCase() ? t.ink : ink,
    body: body === t.body.toUpperCase() ? t.body : body,
    muted: muted === t.muted.toUpperCase() ? t.muted : muted,
    onAccent: best(accent),
    onAccentLight: best(accentLight),
    accentInk: until(t.accent, 0, onLight),
    accentGlow: until(t.accentLight, 255, (c) =>
      [navy, navyDeep, navyMid].every((d) => contrast(c, d) >= TEXT),
    ),
  };
}

/** Theme colors the page will render differently from what was chosen (for the checklist). */
export function readabilityAdjustments(t: ThemeConfig): string[] {
  const r = readableTheme(t);
  const keys = ["navy", "navyDeep", "navyMid", "ink", "body", "muted"] as const;
  return keys.filter((k) => r[k].toUpperCase() !== t[k].toUpperCase());
}
