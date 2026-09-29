# Partner page fields: spec and examples

Every field in the RGG Partner Pages editor (partner.revelationgoldgroup.com/admin), in the
order the editor shows them. The `key` column is the key used in `fields.json` for
`scripts/build_page_json.py`.

## 1. Basic info

| Field | key | Rule |
| --- | --- | --- |
| Partner name | `partnerName` | The on-air or brand name the audience knows: show, ministry or person. e.g. "The Mike Church Show", "IBTV Faith Network". |
| Page link | `slug` | Lowercase, hyphens, short and memorable. The partner's on-air nickname or last name beats the full show name. e.g. `king-dude`, `smedley`. Never `admin`, `preview`, `builder`, `login`, `api`, `assets`, `thank-you`, `p`. |
| Vanity domain | `vanityDomain` | HubSpot contact `website` if it is a *metals.com domain (e.g. kingdudemetals.com). Otherwise propose `LastNameMetals.com` and mark "availability unchecked". |

## 2. Logo & photo

| Field | key | Rule |
| --- | --- | --- |
| Partner logo | `logoUrl` (+ `logoWidth`, `logoIntrinsicHeight`) | Sits top left on a DARK navy bar next to the RGG wordmark. Needs a light or white version, transparent PNG/SVG. Header logo from the partner site, press kit, or show artwork. If only a dark logo exists, say so. |
| Logo size | `logoHeight` | Pixels tall on desktop, 28 to 48. Wide wordmarks 30 to 36, square or stacked marks 42 to 48. |
| Partner photo | `photoUrl` (+ `photoWidth`, `photoHeight`) | See Photo standard below. |
| Photo description | `photoAlt` | "Full Name, role at Organization". |

### Photo standard

The hero shows the partner as a cut-out standing left of the form, head to waist, on a dark
gradient. Rank candidates by:

1. Official source: partner's own site, press or media kit, show page, verified social.
2. Framing: head and shoulders to waist, facing camera or slightly angled, both shoulders in frame.
3. Resolution: at least 800px tall. Portrait orientation.
4. Background: plain or easily removed. Busy backgrounds need a cut-out.
5. Expression and attire that fit a trusted financial and faith audience.

Give the top 3 with direct image URLs and one line each on why. When only the pages can be
found (image URLs cannot be opened or verified), list the page URLs where the photo lives, best
first, and name who to ask for an official headshot (the partner or their assistant, from
HubSpot). HubSpot notes that are only attachments (launch decks) may hold an approved photo:
point to them. Say whether it needs a
background removal (transparent PNG is required for the final page). If the Canva connector is
available, offer to run its background removal on the winner.

## 3. Lead form & tracking

| Field | key | Rule |
| --- | --- | --- |
| HubSpot form embed code | `hubspotEmbed` | The partner's own HubSpot form embed (portal 44817109). HubSpot tools here cannot list forms, so search HubSpot notes for a form link or id. If none, output: "Create in HubSpot: Marketing > Forms > clone the latest partner form, name it '<Partner> Landing Page', then Share > Embed code." |
| Form style | (fixed) | RGG styled form. Do not change. |
| Kiflo referral code | `kifloCode` | The partner's code in Kiflo. Look in HubSpot notes and, if a company record exists, its `kiflo_*` properties (many partners have no company record; that is normal, rely on notes). If not found, propose the slugified show or partner name and label it **PROPOSED, NOT CONFIRMED**: confirm in Kiflo. Never take a code from examples in this skill or the repo README; those are illustrations, not data. |

Always print the two links the team needs:
- Referral link: `https://partner.revelationgoldgroup.com/<slug>?kfl_ln=<code>`
- Kiflo link target (set in Kiflo, required or Kiflo drops every lead): `https://partner.revelationgoldgroup.com/<slug>`

## 4. Quote & signature

| Field | key | Rule |
| --- | --- | --- |
| Quote | `quote` | 1 or 2 sentences, 25 to 45 words, first person, in the partner's voice. No quote marks (added by the page). Ends on why they partnered with Revelation Gold Group. Label it DRAFT FOR PARTNER APPROVAL. |
| Signature name | `signatureName` | How they sign: "Mike Church", "Karon Smedley". Rendered in a script font, so keep it the personal name. |
| Title under the signature | `signatureRole` | "Host, The Mike Church Show". |

Example (IBTV): "Our family has always believed in owning something real. For us, gold and
silver are part of being good stewards, and that is why I partnered with Revelation Gold Group."

Opinion and personal belief only, as everywhere in partner copy (voice-and-compliance.md):
no claim about what metals do, no implied return, no advice.

## 5. Why I Believe

| Field | key | Rule |
| --- | --- | --- |
| Headline | (fixed) | "Why I Believe in / Revelation Gold Group". |
| Paragraph | `whyParagraph` | ONE paragraph, 110 to 160 words, first person, partner's voice. |

Structure, in this order:
1. An opener that speaks to the partner's audience and what they worry about.
2. Why the partner chose RGG, tied to the partner's own mission or show theme (this is the part that makes each page unique). Owning metals is framed as the partner's personal choice ("a personal choice I made for my family"), never as what metals do.
3. How they vetted RGG: met the team, asked hard questions, no pressure.
4. The trust facts, kept exactly as written, bold markers included: `**Revelation Gold Group**`, `**BBB Accredited Business with an A+ rating**`, `**4.9 star Google rating across 256 reviews**`, verified reviews on Trustpilot. These ratings are perishable: note "verify BBB and Google counts before launch".
5. A short close ("Now they want to help you.").

No benefit language at all: not "will protect", not "may help protect". Opinion and personal
choice only (voice-and-compliance.md). `**bold**` is the only formatting.

## 6. 3 Reasons

| Field | key | Rule |
| --- | --- | --- |
| Headline | `reasonsHeadline` | Default "3 Reasons I Choose\nGold & Silver". |
| Reasons | `reasons` (array of 3) | Each 1 or 2 sentences, first person, in the partner's voice and angle (policy host: spending and debt; ministry: stewardship and faith; homesteader: self-reliance). Draw on the core themes: national debt, inflation, central bank gold buying, dollar purchasing power, physical versus paper. Pattern: a fact or observation, then the partner's own belief or choice ("...so I chose to keep part of my savings in something real"). Never a benefit ("can help diversify", "may help protect", "worth over time"). |
| Source line | `reasonsSource` | Named source and date for any figure used, e.g. "Source: U.S. Treasury, Debt to the Penny, September 2026." Blank only if no figures. |

Any number must be verified now (national debt: fiscaldata.treasury.gov Debt to the Penny;
central bank buying: World Gold Council). If a figure cannot be verified, rewrite the reason
without the number rather than publish an unverified figure.

## 7. Free guide

| Field | key | Rule |
| --- | --- | --- |
| Guide | `guide` | `faithful-steward` for faith, ministry or church audiences. `wealth-guide` for everyone else. This also sets the kit copy and the thank-you download link automatically. |

## 8. Theme

| Field | key | Rule |
| --- | --- | --- |
| Preset | `themePreset` | Match the partner's brand colors to the nearest preset in `assets/theme-presets.json`: `revelation-navy`, `patriot-red`, `ember`, `royal-purple`, `liberty-blue`, `frontier-green`, `crimson`, `charcoal-steel`. Never gold, yellow, amber, bronze or brass. A gold or orange brand maps to `ember` or `revelation-navy`. |
| Hero background | `heroBackground` | `flag` (patriot, policy, 2A, veterans), `sunrise` (faith, ministry, hope), `none` (finance, minimal). |

When a partner is both faith and patriot, decide by how they introduce themselves first (the
tagline or first line of their bio). Faith-first: `sunrise`. Country or politics first: `flag`.
The guide follows the audience: any meaningfully faith-based audience gets `faithful-steward`.

## 9. Thank-you page

| Field | key | Rule |
| --- | --- | --- |
| Layout | `thankYouStyle` | `portrait` (dark, default), `portrait-light`, `dark`, `light`. The photo and signature default to the hero photo and the quote signature, so they need no separate values. |
| Greeting with first name | `thankYouGreetingNamed` | Keep `Thank you, {firstName}` unless the partner has a signature greeting. |
| Greeting without a name | `thankYouGreeting` | "Thank you". |
| Headline | `thankYouHeadline` | Short, in voice. "Your kit is on its way." |
| Message | `thankYouMessage` | 2 or 3 sentences in the partner's voice: check your inbox, it may land in promotions or spam, a representative can walk you through it. Name the guide chosen. |

## 10. Advanced (optional)

| Field | key | Rule |
| --- | --- | --- |
| Page title | `seoTitle` | "Free Gold & Silver Kit | <Partner> & Revelation Gold Group" (or "Free Biblical Stewardship Kit" for the Faithful Steward guide). |
| Meta description | `seoDescription` | One or two sentences, 140 to 160 characters, naming the partner's audience and the guide. |

Fixed by the template (never generate): hero headline, form labels, consent text, call band,
401(k) section, silver offer, footer disclosures, phone and address.
