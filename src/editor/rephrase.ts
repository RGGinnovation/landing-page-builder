/**
 * Offline "regenerate" for the Why I Believe paragraphs.
 *
 * Every sentence of the base copy belongs to a group of pre-approved alternates that say
 * the same thing in different words. Regenerating swaps each recognized sentence for a
 * different member of its group and leaves partner-specific sentences untouched. Facts,
 * ratings and bold phrases are identical across a group, so the copy stays compliant.
 *
 * Used when the AI rewrite is unavailable, and as the safety net when an AI rewrite fails
 * the compliance check (see checkRewrite).
 */

const GROUPS: string[][] = [
  [
    "If you are worried about your savings right now, you are not alone.",
    "If you are uneasy about your savings right now, you are not the only one.",
    "If what is happening to your savings keeps you up at night, you are not alone.",
    "A lot of families are worried about their savings right now, and you are not alone.",
    "If you have been watching your savings and feeling uneasy, you are not alone.",
  ],
  [
    "That is why I partnered with **Revelation Gold Group**, a faith-driven firm that shows families how physical gold and silver may help protect retirement and savings.",
    "That is why I partnered with **Revelation Gold Group**, a faith-driven firm that helps families understand how physical gold and silver may help protect their retirement and savings.",
    "That is exactly why I partnered with **Revelation Gold Group**, a faith-driven firm that walks families through how physical gold and silver may help protect retirement and savings.",
    "That is why I work with **Revelation Gold Group**, a faith-driven firm that shows families, in plain English, how physical gold and silver may help protect their savings.",
    "That is the reason I partnered with **Revelation Gold Group**, a faith-driven firm that explains how physical gold and silver may help protect retirement and savings.",
  ],
  [
    "I did my homework, I met the team, and I asked every question I would want you to ask.",
    "I did my research, I met the team, and I asked every question I would want you to ask.",
    "I took my time, sat down with the team, and asked every hard question you would want answered.",
    "I vetted them myself. I met the team and asked every question I would want you to ask.",
    "Before I said yes, I met the team and asked every question I would want you to ask.",
  ],
  [
    "They answered all of them in plain English, and nobody pushed me toward a decision.",
    "They answered every one in plain English, and nobody pressured me toward a decision.",
    "Every answer came in plain English, and no one ever pushed me to decide.",
    "They gave me straight answers in plain English, with no pressure and no sales pitch.",
    "I got clear, plain English answers to all of them, and nobody rushed me.",
  ],
  [
    "A **BBB Accredited Business with an A+ rating**, a **4.9 star Google rating across 256 reviews**, and verified reviews on Trustpilot.",
    "They are a **BBB Accredited Business with an A+ rating**, with a **4.9 star Google rating across 256 reviews** and verified reviews on Trustpilot.",
    "Consider the record: a **BBB Accredited Business with an A+ rating**, a **4.9 star Google rating across 256 reviews**, and verified reviews on Trustpilot.",
  ],
  [
    "They have helped families all over the country.",
    "They have helped families across the country.",
    "They have worked with families from coast to coast.",
    "Families all over the country have already worked with them.",
  ],
  [
    "Now they want to help you.",
    "Now they would like to help you, too.",
    "Now they are ready to help you.",
    "Now it is your turn.",
  ],
];

/** Small phrase swaps for sentences that are not in a group. Applied one at a time. */
const PHRASES: [string, string][] = [
  ["you are not alone", "you are not the only one"],
  ["did my homework", "did my research"],
  ["nobody pushed me", "nobody pressured me"],
  ["all over the country", "across the country"],
  ["plain English", "plain language"],
  ["I met the team", "I sat down with the team"],
  ["every question", "every hard question"],
  ["right now", "these days"],
];

function norm(s: string) {
  return s
    .replace(/\*\*/g, "")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

const INDEX = new Map<string, number>();
GROUPS.forEach((g, gi) => g.forEach((s) => INDEX.set(norm(s), gi)));

function pickOther<T>(list: T[], current: T): T {
  const others = list.filter((x) => x !== current);
  return others[Math.floor(Math.random() * others.length)] ?? current;
}

/** Splits on sentence ends that are followed by a space and a capital or bold marker. */
function sentences(p: string) {
  return p.split(/(?<=[.!?])\s+(?=[A-Z*"“])/);
}

export function rephraseOffline(text: string): { text: string; changed: boolean } {
  const parts = sentences(text.trim());
  let changed = false;
  const out = parts.map((s) => {
    const gi = INDEX.get(norm(s));
    if (gi === undefined) return s;
    const group = GROUPS[gi]!;
    const current = group.find((x) => norm(x) === norm(s)) ?? s;
    const next = pickOther(group, current);
    if (next !== current) changed = true;
    return next;
  });
  let result = out.join(" ");
  if (!changed) {
    const candidates = PHRASES.flatMap(([a, b]) => [
      [a, b],
      [b, a],
    ]).filter(([a]) => result.includes(a!));
    const swap = candidates[Math.floor(Math.random() * candidates.length)];
    if (swap) {
      result = result.replace(swap[0]!, swap[1]!);
      changed = true;
    }
  }
  return { text: result, changed };
}

/* ------------------------------------------------------------------ */
/* Compliance check for any rewrite (AI or offline)                    */
/* ------------------------------------------------------------------ */

const BANNED = [
  /\bguarantee/i,
  /\brisk[- ]free\b/i,
  /\bno risk\b/i,
  /\bsafe haven\b/i,
  /\bwill (rise|go up|double|soar|protect)\b/i,
  /\b(returns?|profits?|gains?)\b/i,
  /\bskyrocket/i,
  /\bprice (target|prediction)/i,
  /\btax[- ]free\b/i,
];

function numbers(s: string) {
  return (s.match(/\d[\d,.]*/g) ?? [])
    .map((n) => n.replace(/[,.]$/, ""))
    .sort()
    .join("|");
}

/** Returns null when the rewrite is acceptable, otherwise the reason it was rejected. */
export function checkRewrite(original: string, rewrite: string): string | null {
  const r = rewrite.trim();
  if (!r) return "empty";
  if (/[\u2014\u2013]/.test(r)) return "dash";
  if (numbers(original) !== numbers(r)) return "numbers changed";
  for (const re of BANNED)
    if (re.test(r) && !re.test(original)) return "banned phrase " + re.source;
  const len = original.length || 1;
  if (r.length > len * 1.5 + 40 || r.length < len * 0.5) return "length";
  return null;
}

/** House style clean-up applied to every rewrite. */
export function tidy(s: string) {
  return s
    .replace(/\s*[\u2014\u2013]\s*/g, ", ")
    .replace(/^["“]|["”]$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
