import { kifloAutoLinkScript } from "./kiflo";
import type { PageConfig } from "./types";

/**
 * Scripts on every public partner page (landing + thank-you, by slug or by domain).
 * Order matters:
 *   1. Referral auto-link (landing pages only): puts ?kfl_ln=<partner code> in the URL
 *      before Kiflo's SDK reads it.
 *   2. Kiflo snippet, VERBATIM as issued by Kiflo for RGG's account. Required on every
 *      partner page. Do not edit, wrap, defer or make it conditional.
 *   3. HubSpot tracking code (page views + the hubspotutk cookie sent with each submission).
 *   4. HubSpot forms embed loader, only when the page uses the native HubSpot form.
 */
export const KIFLO_SNIPPET = `
    var kjs = window.kjs || function (a) {
            var c = { apiKey: a.apiKey };
            var d = document;
            setTimeout(function () {
                var b = d.createElement("script");
                b.src = a.url || "https://cdn.kiflo.com/k.js", d.getElementsByTagName("script")[0].parentNode.appendChild(b)
            });
            return c;
        }({ apiKey: "5c0ef1cb-8acb-4782-858e-42e2fc672de4" });
`;

export function trackingScripts(c: PageConfig, opts: { landing: boolean }) {
  const portal = encodeURIComponent(c.tracking.hubspotPortalId);
  const scripts: Record<string, unknown>[] = [];
  const autoLink = opts.landing ? kifloAutoLinkScript(c.tracking.kifloPartnerCode) : "";
  if (autoLink) scripts.push({ type: "text/javascript", children: autoLink });
  scripts.push({ type: "text/javascript", children: KIFLO_SNIPPET });
  scripts.push({
    type: "text/javascript",
    id: "hs-script-loader",
    async: true,
    defer: true,
    src: `https://js.hs-scripts.com/${portal}.js`,
  });
  if (c.tracking.formMode === "embed") {
    scripts.push({ src: `https://js.hsforms.net/forms/embed/${portal}.js`, defer: true });
  }
  return scripts;
}
