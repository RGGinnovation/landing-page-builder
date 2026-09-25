/**
 * Values that are the same on every partner page. Change them here, once.
 */

/** RGG's Kiflo account. The Kiflo snippet runs on every public page with this key. */
export const KIFLO_API_KEY = "5c0ef1cb-8acb-4782-858e-42e2fc672de4";

/** RGG's HubSpot portal (tracking code + form submissions). */
export const HUBSPOT_PORTAL_ID = "44817109";

/**
 * The public site that hosts every partner page, e.g. https://partners.revelationgoldgroup.com.
 * Pages live at <PUBLIC_SITE_URL>/<slug>. Set VITE_PUBLIC_SITE_URL in the project env.
 * Falls back to the current origin in the browser.
 */
export function publicSiteUrl(): string {
  const env = import.meta.env["VITE_PUBLIC_SITE_URL"] as string | undefined;
  if (env) return env.replace(/\/+$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

/** Where the bare site root sends visitors who are not on a partner domain. */
export const ROOT_REDIRECT =
  (import.meta.env["VITE_ROOT_REDIRECT"] as string | undefined) ||
  "https://revelationgoldgroup.com";

/** Slugs that collide with app routes. */
export const RESERVED_SLUGS = new Set([
  "admin",
  "builder",
  "preview",
  "login",
  "api",
  "assets",
  "thank-you",
  "p",
  "favicon.png",
  "robots.txt",
]);
