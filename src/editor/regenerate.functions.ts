import { createClient } from "@supabase/supabase-js";
import { createServerFn } from "@tanstack/react-start";

import { checkRewrite, rephraseOffline, tidy } from "./rephrase";

/**
 * "Regenerate" for a Why I Believe paragraph: a light AI rewrite of the current text.
 *
 * Uses the Lovable AI Gateway (LOVABLE_API_KEY is provisioned automatically when Lovable
 * Cloud is on; override the model with AI_MODEL). Every rewrite is checked (same numbers,
 * no em dashes, no return promises or guarantees, similar length). If the AI is not
 * configured, fails, or produces something that does not pass, the approved-alternates
 * library is used instead, so the button always returns compliant copy.
 */

interface Input {
  text: string;
  partnerName: string;
  /** The other paragraphs, so the rewrite does not repeat them. */
  siblings: string[];
  accessToken?: string | undefined;
}

export interface RegenerateResult {
  text: string;
  source: "ai" | "library" | "unchanged";
  note?: string;
}

const SYSTEM = `You lightly rephrase one paragraph of a landing page for Revelation Gold Group, a faith-based precious metals firm. The paragraph is written in the first person by a partner (a media host or ministry leader) who endorses the firm.

Rules:
- Keep the meaning, the first-person voice, and roughly the same length (within 15 percent).
- Change the wording noticeably but lightly: new phrasing and sentence rhythm, same message.
- Keep every fact exactly: names, numbers, ratings, review counts, the BBB, Google and Trustpilot references.
- Keep markdown bold (**like this**) around the same facts and around "Revelation Gold Group" if it was bold.
- Plain, warm, direct American English. No jargon, no hype, no exclamation marks.
- Never use em dashes or en dashes. Use periods or commas.
- Never promise returns, profits, growth, safety or protection. Never say "guarantee", "risk-free" or "safe haven". Never predict prices. Keep hedged wording like "may help protect".
- No tax, legal or investment advice.
- Output only the rewritten paragraph. No quotes, no preface.`;

async function verifyEditor(token: string | undefined): Promise<boolean> {
  // VITE_* values are inlined at build time, so they exist on the server too.
  const url =
    (import.meta.env["VITE_SUPABASE_URL"] as string | undefined) ?? process.env["SUPABASE_URL"];
  const key =
    (import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string | undefined) ??
    (import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined) ??
    process.env["SUPABASE_PUBLISHABLE_KEY"] ??
    process.env["SUPABASE_ANON_KEY"];
  // Local mode (no Cloud): nothing to verify against.
  if (!url || !key) return true;
  if (!token) return false;
  const sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error } = await sb.rpc("is_page_editor");
  return !error && data === true;
}

async function aiRewrite(d: Input): Promise<string | null> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return null;
  const model = process.env["AI_MODEL"] || "google/gemini-2.5-flash";
  const user = [
    `Partner: ${d.partnerName}`,
    d.siblings.length
      ? `Other paragraphs on the page (do not repeat them):\n${d.siblings.join("\n\n")}`
      : "",
    `Paragraph to rephrase:\n${d.text}`,
  ]
    .filter(Boolean)
    .join("\n\n");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      temperature: 0.9,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) {
    console.error("[regenerate] AI gateway", res.status, await res.text().catch(() => ""));
    return null;
  }
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const out = json.choices?.[0]?.message?.content;
  return out ? tidy(out) : null;
}

export const regenerateParagraph = createServerFn({ method: "POST" })
  .inputValidator((d: Input) => {
    if (typeof d?.text !== "string" || d.text.length > 3000) throw new Error("Invalid paragraph");
    return {
      text: d.text,
      partnerName: String(d.partnerName ?? "").slice(0, 120),
      siblings: Array.isArray(d.siblings)
        ? d.siblings.slice(0, 6).map((s) => String(s).slice(0, 3000))
        : [],
      accessToken: d.accessToken,
    };
  })
  .handler(async ({ data }): Promise<RegenerateResult> => {
    if (!(await verifyEditor(data.accessToken)))
      throw new Error("Sign in as an editor to regenerate.");

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const out = await aiRewrite(data);
        if (out === null) break;
        const reason = checkRewrite(data.text, out);
        if (!reason && out !== data.text) return { text: out, source: "ai" };
        console.warn("[regenerate] rejected AI rewrite:", reason);
      } catch (e) {
        console.error("[regenerate]", e);
        break;
      }
    }
    const off = rephraseOffline(data.text);
    return off.changed
      ? { text: off.text, source: "library" }
      : {
          text: data.text,
          source: "unchanged",
          note: "No approved alternates match this paragraph. Edit it by hand, or turn on Lovable AI.",
        };
  });
