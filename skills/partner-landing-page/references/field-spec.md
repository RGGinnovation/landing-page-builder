# Partner page fields: spec and rules

This file lists every field in the RGG Partner Pages editor (partner.revelationgoldgroup.com/admin),
in the order the editor shows them. The `key` is the key used in `fields` in input.json.
Live pages already built with these rules include /petekaliner, /tonishuppe, /emmadowd,
/king-dude and /asor.

## 1. Basic info

| Field | key | Rule |
| --- | --- | --- |
| Partner name | `partnerName` | The name the audience knows: the person's name ("Pete Kaliner", "Toni Shuppe") or an on-air nickname they use ("King Dude"). It fills `{partner}` in titles and the footer. |
| Page link | `slug` | Lowercase letters, digits and hyphens. Default: first and last name joined with no hyphen (`petekaliner`, `tonishuppe`). Use a brand or nickname slug only if the audience knows them by it (`king-dude`, `asor`). Never a reserved slug (assets/rules.json). |
| Vanity domain | `vanityDomain` | The HubSpot contact `website` if it is a *metals.com domain (e.g. kalinermetals.com), with `vanityDomainConfirmed: true`. If the contact's `website` is some other domain the partner owns, do not assume it redirects: propose `lastnamemetals.com` with `vanityDomainConfirmed` false and add a to-do to check the other domain first. |

## 2. Logo & photo

| Field | key | Rule |
| --- | --- | --- |
| Partner logo | `logoUrl` (+ `logoWidth`, `logoIntrinsicHeight`) | A direct image URL. It sits top left on a dark navy bar beside the RGG wordmark, so it needs a light or white version (transparent PNG or SVG). Fill from JSON copies it onto the page when the page has no logo yet. Leave it blank rather than use an unverified URL. |
| Logo size | `logoHeight` | Height in pixels on desktop, 28 to 48. Wide wordmarks 30 to 36; square or stacked marks 42 to 48. |
| Partner photo | `photoUrl` (+ `photoWidth`, `photoHeight`) | A direct image URL, chosen by the Photo standard below. Fill from JSON copies it onto the page when the page has no photo yet. Put the alternates in `assets.photoAlternates`. |
| Photo description | `photoAlt` | "Full Name, role at Organization". Plain description with no claims. |

### Photo standard
The hero shows the partner as a cut-out, head to waist, on a dark gradient. Rank the candidates
by:
1. **Source:** official only (their site, press kit, show page, verified social).
2. **Framing:** head and shoulders to waist, facing the camera, both shoulders in frame.
3. **Size:** at least 800px tall, portrait orientation.
4. **Background:** plain or easy to remove. Set `needsCutout` in `assets.photo`.
5. **Tone:** attire and expression that suit a trusted faith and finance audience.

## 3. Lead form & tracking

| Field | key | Rule |
| --- | --- | --- |
| HubSpot form | `hubspotFormGuid` | The partner's own form GUID in portal 44817109. Find it from the HubSpot forms list, then from notes (see SKILL.md, HubSpot form). The script builds the standard embed code from it. Record `hubspot.form` as `{guid, name, source}`. You can put a full embed snippet in `hubspotEmbed` instead. Leave both blank when nothing is found. |
| Form style | (fixed) | RGG styled form. |
| Kiflo referral code | `kifloCode` (+ `kifloCodeConfirmed`) | The team enters this by hand. Leave it blank unless a HubSpot note or the company's `kiflo_*` properties state the exact code: then set it with `kifloCodeConfirmed: true`. Never propose or guess a code, and never copy one from examples. |

## 4. Quote & signature (draft for partner approval)

| Field | key | Rule |
| --- | --- | --- |
| Quote | `quote` | 1 or 2 sentences, 25 to 45 words, first person, no quote marks. Their own belief, ending on why they partnered with Revelation Gold Group. A personal fact in it (e.g. "buying silver since 2008") must be in `claims` with a source. |
| Signature name | `signatureName` | Their personal name, which renders in a script font: "Pete Kaliner". |
| Title under the signature | `signatureRole` | "Role, Organization": "Host, The Pete Kaliner Show", "Founder, A Sea of Red". Check it against the official source. If they hold several roles, use the public-facing one this audience knows them by (their show, book or brand), not an RGG title from HubSpot. Avoid a politically charged organization unless it is central to how they introduce themselves, and add a to-do when roles conflict. |

## 5. Why I Believe (draft for partner approval)

| Field | key | Rule |
| --- | --- | --- |
| Headline | (fixed) | "Why I Believe in / Revelation Gold Group". |
| Paragraph | `whyParagraph` | One paragraph of 110 to 160 words, first person, in their voice. `**bold**` is the only formatting. |

Write it in this order:
1. **Opener:** in their register, addressed to their audience ("Dude Nation, ...", "If you're
   like most Flames fans I know, ..."). It names a feeling, never a promise.
2. **Personal choice:** owning physical gold and silver is a choice they made (only if a source says they own metals; otherwise frame it as a belief, "I believe in owning something real", and add a to-do to confirm), tied to their
   own identity or mission. Never what metals do. Example: "I'm a lowercase-L libertarian,
   and I don't trust the people spending my money. I've bought silver since the 2008 crash
   ... I picked **Revelation Gold Group**."
3. **Vetting:** they met the team, asked hard questions, and felt no pressure.
4. **Trust facts, exactly as written:**
   - `**Revelation Gold Group**`
   - `**BBB Accredited Business with an A+ rating**`
   - `**4.9 star Google rating across 256 reviews**`
   - verified reviews on Trustpilot

   The ratings are perishable, and the kit adds a to-do to verify them.
5. **Close:** "Now they want to help you."

Describe Revelation Gold Group as "faith-driven" only when the partner is faith-forward.

## 6. 3 Reasons

| Field | key | Rule |
| --- | --- | --- |
| Headline | `reasonsHeadline` | "3 Reasons I Choose\nGold & Silver". |
| Reasons | `reasons` (exactly 3) | 1 or 2 sentences each, first person. Pattern: a fact or observation from their world, then their own belief or choice. Example: "I have watched gas and groceries climb, and holding physical gold and silver is a personal choice I made to diversify my family's savings." Themes: national debt, inflation, central bank gold buying, dollar purchasing power, physical versus paper. Their angle comes first: policy, faith, family, sport or business. |
| Source line | `reasonsSource` | "Source: U.S. Treasury, Debt to the Penny, September 2026." Required whenever a reason has a number. Leave it blank when none does. |

Central bank buying can be referenced without a number ("buying gold at a record pace").

## 7. Free guide

| Field | key | Rule |
| --- | --- | --- |
| Guide | `guide` | Use `faithful-steward` when the partner or audience is faith-forward (a ministry, a faith brand, faith stated publicly). Use `wealth-guide` for everyone else. The guide sets the kit copy, the thank-you download link and message, and the page title. |

## 8. Theme

| Field | key | Rule |
| --- | --- | --- |
| Brand accent | `brandAccent` | The partner's signature color as hex, from their logo, site buttons or artwork. It drives buttons, numbers, stars and rules, and it can never be gold, yellow, amber, bronze or brass. For a gold or orange brand, take their next brand color, or `#2C66A8` (RGG blue). |
| Brand band | `brandBand` | The partner's darkest brand color as hex, used for the top bar, hero, call band and footer, all with white text. If it is too light the site darkens it, and the script warns; prefer a truly dark brand shade. |
| Preset (fallback) | `themePreset` | Only when no brand colors are found. Use `revelation-navy`, or pick the nearest of: `revelation-navy`, `patriot-red`, `ember`, `royal-purple`, `liberty-blue`, `frontier-green`, `crimson` or `charcoal-steel`. A gold or orange brand maps to `ember` or `revelation-navy`. Never gold. |
| Hero background | `heroBackground` | `flag` for patriot, policy, 2A or veterans. `sunrise` for faith, ministry or hope. `none` for finance or minimal. When they are both faith and patriot, follow how they introduce themselves first. |

## 8b. Call band (tailored)

| Field | key | Rule |
| --- | --- | --- |
| Headline | `callbandHeadline` | Short, in their register, inviting a call. Default "Have a question first?". Example for Mike Church: "Dude Nation, have a question first?" |
| Subline | `callbandSubline` | Short. Default "Talk to a real person." No claims. |

## 9. Thank-you page

| Field | key | Rule |
| --- | --- | --- |
| Layout | `thankYouStyle` | `portrait` (dark, the default), `portrait-light`, `dark` or `light`. |
| Greeting with first name | `thankYouGreetingNamed` | Leave it blank to keep "Thank you, {firstName}". |
| Greeting without a name | `thankYouGreeting` | Leave it blank to keep "Thank you". |
| Headline | `thankYouHeadline` | Short and in their voice. Default: "Your kit is on its way." |
| Note | `thankYouNote` | One short line in their voice under the buttons. Default: "Questions? A Revelation Gold Group specialist can walk you through it, with nothing to buy." |
| Message | `thankYouMessage` | Optional. Leave it blank to use the guide's message. If you write one: 2 or 3 sentences that name the guide, say to check the inbox and the promotions or spam folder, and say a representative can answer questions. No claims. |

## 10. Advanced

| Field | key | Rule |
| --- | --- | --- |
| Page title | `seoTitle` | Leave it blank. The script sets "Free Gold & Silver Kit" or "Free Biblical Stewardship Kit", then "\| {partner} & Revelation Gold Group". |
| Meta description | `seoDescription` | 140 to 160 characters, naming the partner's audience and the guide, e.g. "Pete Kaliner Show listeners can request the free 2026 Wealth Protection Guide from Revelation Gold Group. A plain English look at gold and silver. Nothing to buy." |

## Fixed by the template (never write these)

- **Hero headline:** "Your First Step Toward Owning Physical Gold & Silver".
- **Lead form:** the form labels, the consent text and the mobile call bar.
- **401(k) section:** it points to a tax-advantaged gold IRA and asking how a direct transfer
  works, with no tax claims.
- **Silver offer and its terms.**
- **Footer disclaimer:** one short left-aligned paragraph that starts "Not financial advice."
  and covers the paid partner disclosure, risk, no implied return, no insurance and the silver
  offer terms.
- **Company details:** the phone number (888) 465-3049, the address and the legal links.
