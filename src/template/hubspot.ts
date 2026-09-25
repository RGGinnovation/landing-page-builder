/**
 * Reads the portal id, form id and region out of a HubSpot form embed snippet.
 *
 * Handles both formats HubSpot hands out:
 *   New:    <script src="https://js.hsforms.net/forms/embed/44817109.js" defer></script>
 *           <div class="hs-form-frame" data-region="na1" data-form-id="..." data-portal-id="44817109"></div>
 *   Legacy: hbspt.forms.create({ region: "na1", portalId: "44817109", formId: "..." });
 * A bare form GUID also works.
 */
export interface HubspotIds {
  portalId: string;
  formId: string;
  region: string;
}

const GUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

function pick(src: string, patterns: RegExp[]): string {
  for (const re of patterns) {
    const m = re.exec(src);
    if (m?.[1]) return m[1];
  }
  return "";
}

export function parseHubspotEmbed(snippet: string): Partial<HubspotIds> {
  const s = (snippet || "").trim();
  if (!s) return {};
  const formId = pick(s, [
    /data-form-id\s*=\s*["']([^"']+)["']/i,
    /formId\s*:\s*["']([^"']+)["']/i,
    /\/forms\/[^"'\s]*?\/(\b[0-9a-f-]{36}\b)/i,
  ]);
  const portalId = pick(s, [
    /data-portal-id\s*=\s*["'](\d+)["']/i,
    /portalId\s*:\s*["']?(\d+)["']?/i,
    /forms\/embed\/(?:v2\/)?(?:[a-z0-9-]+\/)?(\d+)\.js/i,
    /js\.hs-scripts\.com\/(\d+)\.js/i,
  ]);
  const region = pick(s, [
    /data-region\s*=\s*["']([a-z0-9]+)["']/i,
    /region\s*:\s*["']([a-z0-9]+)["']/i,
  ]);
  const out: Partial<HubspotIds> = {};
  const guid = formId || (GUID.exec(s)?.[0] ?? "");
  if (guid) out.formId = guid;
  if (portalId) out.portalId = portalId;
  if (region) out.region = region;
  return out;
}

export function isGuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v.trim());
}

/** Rebuilds the canonical embed snippet from ids (shown in the editor for reference). */
export function embedSnippet(ids: HubspotIds) {
  return (
    `<script src="https://js.hsforms.net/forms/embed/${ids.portalId}.js" defer></script>\n` +
    `<div class="hs-form-frame" data-region="${ids.region || "na1"}" data-form-id="${ids.formId}" data-portal-id="${ids.portalId}"></div>`
  );
}
