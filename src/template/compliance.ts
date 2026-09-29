/**
 * Partner voice copy (endorsement quote, Why I Believe, 3 Reasons) is the partner's
 * personal opinion and belief only. It never says what gold and silver do for anyone
 * (protect, preserve, grow, hedge, hold value), never implies a return and never tells
 * the reader what to do with their money. Diversifying is allowed only as the partner's
 * own choice ("I chose to diversify part of my savings"), never as a benefit.
 *
 * Good: "Holding physical gold and silver is a personal choice I made for my family."
 * Bad:  "Physical gold and silver can help diversify what my savings are worth over time."
 *
 * The same list is used by the editor checklist (blocks Publish), the Regenerate check
 * and the partner-page-kit skill (skills/partner-page-kit/scripts/build_page_json.py).
 */
export const PARTNER_COPY_RULES: { re: RegExp; why: string }[] = [
  { re: /\bprotect(s|ed|ing|ion)?\b/i, why: "protection claim" },
  { re: /\bpreserv(e|es|ed|ing|ation)\b/i, why: "preservation claim" },
  { re: /\bsafeguard|\bshield(s|ed|ing)?\b/i, why: "protection claim" },
  { re: /\bhedg(e|es|ing)\b/i, why: "hedge claim" },
  {
    re: /\b(carr(y|ies|ied)|got|gets|see|sees|saw) (families|people|us|savers) through\b|\bthrough (hard|tough|bad|difficult) (times|seasons)\b/i,
    why: "protection claim",
  },
  { re: /\bsafe haven\b|\bsafe(ty|r|st)?\b/i, why: "safety claim" },
  { re: /\bsecur(e|es|ed|ing)\b/i, why: "security claim" },
  {
    re: /\b(can|may|will|could|might|would)\s+help(s)?\s+(you\s+|to\s+|families\s+|your\s+family\s+)?(protect|preserve|diversify|grow|keep|guard|shield|hedge|secure|safeguard|build|save)\b/i,
    why: "says metals help (a benefit claim)",
  },
  { re: /\bgrow(s|th|ing)?\b/i, why: "growth claim" },
  { re: /\b(returns|return on|profits?|gains?|appreciat\w*)\b/i, why: "return claim" },
  {
    re: /\bworth (more|over time)\b|\b(hold|holds|keep|keeps|kept|held) (its|their) (value|worth)\b/i,
    why: "value claim",
  },
  {
    re: /\bstore of (value|wealth)\b|\bbeat(s)? inflation\b|\boutpac\w*|\boutperform\w*/i,
    why: "value claim",
  },
  { re: /\bguarantee\w*|\brisk[- ]free\b|\bno risk\b/i, why: "guarantee" },
  {
    re: /\bwill (rise|go up|double|soar|climb|protect)\b|\bskyrocket\w*|\bprice (target|prediction)/i,
    why: "price prediction",
  },
  { re: /\btax[- ]free\b/i, why: "tax claim" },
  {
    re: /\byou (should|need to|must|have to|ought to)\b|\bdiversify your\b|\b(move|roll over|rollover) your\b/i,
    why: "advice to the reader",
  },
];

/** Returns the reasons a piece of partner voice copy breaks the rules (empty when clean). */
export function partnerCopyIssues(text: string): { match: string; why: string }[] {
  const plain = text.replace(/\*\*/g, "");
  const out: { match: string; why: string }[] = [];
  for (const { re, why } of PARTNER_COPY_RULES) {
    const m = plain.match(re);
    if (m) out.push({ match: m[0], why });
  }
  return out;
}
