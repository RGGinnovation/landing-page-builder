# Output format

You write **one** file, `input.json`. `scripts/build.py` turns it into the two
deliverables. A complete worked example, with real verified data, is
`assets/example-input.json` (Pete Kaliner). Copy its shape, not its facts.

## input.json

```jsonc
{
  "input": { "link": "https://...", "name": "optional" },

  "partner": {
    "fullName": "", "knownAs": "", "role": "", "organization": "",
    "audience": "who they reach, in one line",
    "faithForward": false,            // true only if their own public frame is faith
    "faithNote": "why, with source",
    "bio": "2 to 4 plain sentences, facts only",
    "identityCheck": [{ "fact": "", "source": "url" }],   // at least 2 independent sources
    "voiceProfile": ["5 short lines"],
    "voiceSamples": [{ "text": "verbatim", "source": "url" }],  // 5 to 10
    "socials": { "x": "", "youtube": "", "facebook": "", "instagram": "", "podcast": "" }
  },

  "hubspot": {
    "found": true, "contactUrl": "", "leadStatus": "", "website": "",
    "keyNotes": [{ "date": "YYYY-MM-DD", "point": "" }],
    "guidance": ["binding guidance from notes, e.g. let faith come from him"]
  },

  "assets": {
    "photo": { "url": "", "width": 0, "height": 0, "source": "", "needsCutout": true, "why": "" },
    "photoAlternates": [{ "url": "", "why": "" }],
    "logo": { "url": "", "width": 0, "height": 0, "source": "", "onDark": true, "why": "" },
    "brandColors": [{ "hex": "#hex", "where": "logo, header, buttons, artwork", "source": "url" }]
  },

  "fields": { /* every key in field-spec.md */ },

  "rationale": { "slug": "", "guide": "", "themePreset": "", "heroBackground": "", "thankYouStyle": "" },
  "claims":  [{ "text": "personal fact used in the copy", "source": "url or HubSpot note + date" }],
  "figures": [{ "text": "the number", "source": "named source", "checked": "YYYY-MM-DD" }],
  "sources": [{ "url": "", "usedFor": "" }],
  "blocked": ["hosts that would not load"],
  "todo":    ["extra items only a person can do, e.g. confirm company name with the partner"]
}
```

## The downloadable file: `<slug>.landing-page.json`

```jsonc
{
  "format": "rgg-partner-landing-page",   // the editor's Import JSON recognizes this
  "formatVersion": 3,
  "generatedAt": "UTC timestamp",
  "input": {...},
  "links": { "page", "thankYou", "referral", "kifloLinkTarget", "vanityDomain" },
  "status": {
    "copyReady": true,      // no ERRORs: every field is written and compliant
    "publishReady": false,  // also no TODOs left (form, Kiflo, approval, uploads)
    "errors": [], "warnings": [], "todo": []
  },
  "partner": {...}, "hubspot": {...}, "assets": {...}, "rationale": {...},
  "colors": {               // chosen vs rendered colors and every readability check
    "chosen": {...}, "rendered": {...}, "adjustedForReadability": [],
    "checks": [{ "pair", "text", "background", "ratio", "pass" }]
  },
  "claims": [...], "figures": [...], "sources": [...], "blocked": [...],
  "fields": {...},          // the flat field values, keyed as in field-spec.md
  "page": { ... }           // the full PageConfig on the live template, import-ready
}
```

- **Fill from JSON** (the button on every page in /admin) reads `page` and fills the open page:
  - Filled: partner name, vanity domain, all colors and the theme, hero background, logo size,
    HubSpot form and Kiflo code (if present), quote and signature, Why I Believe, 3 Reasons,
    guide, call band, hero headline and photo description, thank-you page and SEO.
  - Kept: the page link, photo, logo, thank-you photo and the fixed template sections.
- `page` is also what Publish menu > Import JSON uses to create a new page. It is built on `assets/page-template.json`, so the fixed
  parts (hero headline, 401(k) section, silver offer, footer disclaimer) are always current.
- `fields` plus `status` are what a future editor feature can read to prefill fields and show
  the to-do list.
- The sheet `<slug>-landing-page.md` is rendered from the same data, so the two never disagree.

## Keeping the assets current

The assets are generated from the app. After any change to the template, guides, themes,
reserved slugs or `src/template/compliance.ts`, run this in the app repo, then repackage the
skill:

```bash
bun skills/sync-skill-assets.ts
```
