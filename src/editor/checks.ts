import { RESERVED_SLUGS } from "@/template/constants";
import { isGuid } from "@/template/hubspot";
import { isGoldHue } from "@/template/theme";
import type { PageConfig, SectionOf, SectionType } from "@/template/types";

export interface Issue {
  level: "error" | "warn";
  message: string;
  /** Editor group to open when clicked. */
  target: GroupId;
}

export type GroupId =
  "basic" | "photos" | "form" | "quote" | "why" | "guide" | "theme" | "thankyou" | "advanced";

/** Launch checklist. Errors block "Publish now". */
export function checkPage(c: PageConfig): Issue[] {
  const out: Issue[] = [];
  const err = (message: string, target: GroupId) => out.push({ level: "error", message, target });
  const warn = (message: string, target: GroupId) => out.push({ level: "warn", message, target });

  if (!c.name.trim() || /partner name/i.test(c.brand.partnerName))
    err("Partner name is still the placeholder.", "basic");
  if (RESERVED_SLUGS.has(c.slug)) err(`“/${c.slug}” is reserved. Pick another URL.`, "basic");

  const t = c.tracking;
  if (!isGuid(t.hubspotFormGuid)) err("Paste the partner's HubSpot form embed code.", "form");
  if (!/^\d+$/.test(t.hubspotPortalId)) err("HubSpot portal id is missing.", "form");
  if (!t.kifloPartnerCode.trim() || t.kifloPartnerCode.startsWith("PASTE_"))
    err("Kiflo referral code is empty. Leads would arrive unassigned.", "form");

  if (c.brand.partnerLogo.includes("/_base/")) err("Upload the partner logo.", "photos");

  const find = <K extends SectionType>(type: K) =>
    c.sections.find((s) => s.type === type && !s.hidden) as SectionOf<K> | undefined;

  const hero = find("hero");
  if (hero && hero.props.image.includes("/_base/")) err("Upload the partner photo.", "photos");

  const quote = find("quote");
  if (
    quote &&
    (/partner name/i.test(quote.props.name) || /partner's own words/i.test(quote.props.quote))
  )
    err("Quote and signature are placeholder copy.", "quote");

  const kit = find("kit");
  if (kit && kit.props.image.includes("-pending"))
    err("The selected guide image is not uploaded yet.", "guide");

  const offer = find("offer");
  if (offer && !offer.props.terms.trim()) err("Silver offer has no terms.", "advanced");

  const accentFields = [c.theme.accent, c.theme.accentLight, c.theme.accentDark];
  if (accentFields.some(isGoldHue))
    err(
      "Accent color is in the gold / amber range. Brand rule: no gold. Pick another shade.",
      "theme",
    );

  const ty = c.thankYou;
  if (ty.style === "portrait" && ty.showSignature && /partner name/i.test(ty.signatureName))
    warn("Thank-you signature is still the placeholder.", "thankyou");

  const allText = JSON.stringify(c);
  if (/\u2014/.test(allText))
    warn("Copy contains an em dash. House style: use a period or comma.", "advanced");

  if (!c.vanityDomain.trim()) warn("No vanity domain yet (e.g. SmedleyMetals.com).", "basic");
  return out;
}
