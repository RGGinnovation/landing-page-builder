/**
 * Regenerates the partner-page-kit skill's assets from the app code, so the skill always
 * builds pages with the live template, guides, themes and compliance rules.
 *
 *   bun skills/sync-skill-assets.ts
 *
 * Run it after any change to the template defaults, kits, theme presets, reserved slugs or
 * src/template/compliance.ts, then repackage the skill.
 */
import { writeFileSync } from "fs";
import { createBasePage } from "@/content/pages/base";
import { PARTNER_COPY_RULES } from "@/template/compliance";
import { DEFAULT_SITE_URL, HUBSPOT_PORTAL_ID, RESERVED_SLUGS } from "@/template/constants";
import { KIT_OPTIONS } from "@/template/kits";
import { HERO_BACKGROUNDS, THEME_PRESETS } from "@/template/theme";

const dir = "skills/partner-page-kit/assets/";
const write = (name: string, data: unknown) =>
  writeFileSync(dir + name, JSON.stringify(data, null, 2) + "\n");

write("page-template.json", createBasePage({ slug: "new-partner", name: "New partner" }));
write("guides.json", KIT_OPTIONS);
write("theme-presets.json", { presets: THEME_PRESETS, heroBackgrounds: HERO_BACKGROUNDS });
write("rules.json", {
  site: DEFAULT_SITE_URL,
  hubspotPortalId: HUBSPOT_PORTAL_ID,
  reservedSlugs: [...RESERVED_SLUGS].sort(),
  partnerCopyRules: PARTNER_COPY_RULES.map((r) => ({ pattern: r.re.source, why: r.why })),
});
console.log("Synced skill assets from app code.");
