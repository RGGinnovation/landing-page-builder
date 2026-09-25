import { publicSiteUrl } from "./constants";

/**
 * Kiflo helpers shared by the public pages and the editor.
 *
 * A partner's Kiflo referral link is <site>/<slug>?kfl_ln=<code>. Kiflo's SDK (k.js) reads
 * ?kfl_ln= on landing, records the click and sets its attribution cookie; the lead form then
 * sends that cookie and the code with every submission.
 */

/** Accepts a bare code ("the-mike-church-show") or any URL containing ?kfl_ln=<code>. */
export function parseKifloCode(input: string): string {
  const s = (input || "").trim();
  if (!s) return "";
  const m = /[?&]kfl_ln=([^&#\s]+)/i.exec(s);
  const raw = m ? m[1]! : s;
  let code = raw;
  try {
    code = decodeURIComponent(raw);
  } catch {
    /* keep raw */
  }
  return code.trim().replace(/\s+/g, "-");
}

export function kifloReferralLink(slug: string, code: string, site = publicSiteUrl()) {
  const c = parseKifloCode(code);
  return c ? `${site}/${slug}?kfl_ln=${encodeURIComponent(c)}` : `${site}/${slug}`;
}

/**
 * Inline script for partner landing pages. Runs before Kiflo's SDK loads: when a visitor
 * arrives without ?kfl_ln= (typed the vanity domain, a bare link, a QR code), it adds this
 * page's referral code to the address bar so k.js records the visit and sets its cookie
 * exactly as if the partner's referral link had been clicked. A real ?kfl_ln= always wins.
 */
export function kifloAutoLinkScript(code: string) {
  const c = parseKifloCode(code);
  if (!c) return "";
  return `(function(){try{var u=new URL(window.location.href);if(!u.searchParams.get("kfl_ln")){u.searchParams.set("kfl_ln",${JSON.stringify(c)});window.history.replaceState(window.history.state,"",u.pathname+u.search+u.hash);}}catch(e){}})();`;
}

export type KifloLinkStatus =
  { ok: true } | { ok: false; reason: "not-registered" | "rejected" | "network"; detail: string };

/**
 * Asks Kiflo whether it has a referral link for this page + code, the same way k.js does when a
 * visitor lands with ?kfl_ln=. Kiflo only credits visits and leads when the partner's link in
 * Kiflo targets this exact page URL. Records one visit in Kiflo, so run it on demand only.
 */
export async function checkKifloLink(
  apiKey: string,
  slug: string,
  code: string,
): Promise<KifloLinkStatus> {
  const c = parseKifloCode(code);
  const link = kifloReferralLink(slug, c);
  try {
    const res = await fetch("https://api.kiflo.com/v3/js", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        Authorization: "AppId " + apiKey,
        "Kiflo-Referral-Code": c,
        "Kiflo-Referrer-Url": link,
      },
      body: JSON.stringify({
        action: "event",
        payload: { type: "visit", referralCode: c, currentUrl: link, sourceUrl: "" },
      }),
    });
    if (res.ok) return { ok: true };
    const body = await res.text();
    if (res.status === 404) return { ok: false, reason: "not-registered", detail: body };
    return { ok: false, reason: "rejected", detail: `HTTP ${res.status} ${body}` };
  } catch (e) {
    return { ok: false, reason: "network", detail: (e as Error).message };
  }
}
