import { KIFLO_API_KEY } from "./constants";
import type { PageConfig } from "./types";

/**
 * Scripts on every public partner page (not /admin or /preview):
 *   1. Kiflo SDK, verbatim from Kiflo, with RGG's account key. Always present: it sets the
 *      partner attribution cookie that the lead form reads on submit.
 *   2. HubSpot tracking code (page views + the hubspotutk cookie sent with each submission).
 *   3. HubSpot forms embed loader, only when the page uses the native HubSpot form.
 */
export const KIFLO_SNIPPET = `var kjs = window.kjs || function (a) {
        var c = { apiKey: a.apiKey };
        var d = document;
        setTimeout(function () {
            var b = d.createElement("script");
            b.src = a.url || "https://cdn.kiflo.com/k.js", d.getElementsByTagName("script")[0].parentNode.appendChild(b)
        });
        return c;
    }({ apiKey: ${JSON.stringify(KIFLO_API_KEY)} });`;

export function trackingScripts(c: PageConfig) {
  const portal = encodeURIComponent(c.tracking.hubspotPortalId);
  const scripts: Record<string, unknown>[] = [
    { type: "text/javascript", children: KIFLO_SNIPPET },
    {
      type: "text/javascript",
      id: "hs-script-loader",
      async: true,
      defer: true,
      src: `https://js.hs-scripts.com/${portal}.js`,
    },
  ];
  if (c.tracking.formMode === "embed") {
    scripts.push({ src: `https://js.hsforms.net/forms/embed/${portal}.js`, defer: true });
  }
  return scripts;
}
