---
name: partner-page-kit
description: Builds a ready-to-paste field sheet (plus a one-click import file) for a Revelation Gold Group partner landing page from just a name and a website. Digs through HubSpot (partner contact, company, call notes), researches the partner's site and socials, picks the best hero photo and logo, matches a theme, and writes the quote, Why I Believe paragraph, 3 Reasons and thank-you copy in the partner's own voice. Use this whenever someone wants to set up, prefill, draft or "get everything ready" for a partner or prospect page on partner.revelationgoldgroup.com, asks for landing page copy, a photo or logo for a partner, or says things like "build the page kit for Karon Smedley, ibtvnetwork.com", "prep Mike Church's landing page", "fill the fields for this new partner", even if they don't say "skill" or "kit".
---

# Partner Page Kit

Input: a partner or prospect **name** and **domain** (e.g. "Mike Church, mikechurch.com").
Output, ready for the RGG Partner Pages editor at partner.revelationgoldgroup.com/admin:

1. `<slug>-page-kit.md`: every editor field in editor order, each value in its own code
   block so it copies in one click.
2. `<slug>.json`: the same page as an import file (editor: Publish menu > Import JSON).
3. The best photo and logo, with direct links (and downloaded files when the tools allow).

The team should be able to open the editor and paste top to bottom without thinking.

Read `references/field-spec.md` (every field, its rules and examples) and
`references/voice-and-compliance.md` (voice capture, compliance, house style) before writing.

## Workflow

Run steps 1 and 2 in parallel when you can. They are independent.

### 1. HubSpot (portal 44817109)

- Find the contact: `search_crm_objects` on CONTACT with the person's name (and again with the
  domain or show name if the first search misses). Partners carry `hs_lead_status` = "Partner".
  Pull `firstname`, `lastname`, `jobtitle`, `company`, `website`, `email`, `hs_lead_status`.
  `website` often holds the vanity domain already (e.g. kingdudemetals.com).
- Find the company (COMPANY, by name or domain) and read its `kiflo_*` properties
  (`kiflo_partner_id`, `kiflo_status`, `kiflo_program`). Many partners have no company record:
  one search is enough, then move on.
- Read the notes: NOTE objects associated with the contact, newest first, `hs_note_body`.
  Look for: how they describe themselves, audience, what they care about, agreed page details,
  Kiflo code, HubSpot form links, vanity domain, anything the partner asked for or objected to.
- Record the HubSpot record link for the sheet.

Only read HubSpot. Do not create or update records.

### 2. Web research

- Fetch the domain's home and About pages, and the show or ministry page. Note the bio in their
  own words, show name, format, where they broadcast, audience, mission.
- Search for their socials and media (YouTube, X, Substack, podcast pages) and gather 5 to 10
  voice samples (see voice-and-compliance.md).
- Photo: find the best hero portrait by the Photo standard in field-spec.md. Give the top 3
  with direct image URLs. Try the site's About or press page first, then show artwork and
  verified social profiles. If the Canva connector is available, offer background removal.
- Logo: find a light or white version for a dark header (site header SVG/PNG, press kit).
- Brand colors: note the site's dominant colors to choose the theme preset.

If pages will not load, do not keep retrying: after two failed fetches on a host, work from
search results and HubSpot, say so once in the sheet, and for the photo and logo list the page
URLs to take them from plus who to ask (partner or assistant from HubSpot).

### 3. Verify perishable figures

For any figure in 3 Reasons, check the current value (national debt: fiscaldata.treasury.gov
Debt to the Penny) and write the source line with source and month. If you cannot verify,
write the reason without the number.

### 4. Write the fields

Follow field-spec.md for every field, in the partner's voice. Write a short voice profile
first and keep it at the top of the sheet so the reviewer can see why the copy sounds the way
it does. Pick the guide (faith audience: Faithful Steward; otherwise Wealth Guide), theme
preset and hero background with a one-line reason each.

### 5. Build the import file

Save the values to `fields.json` (keys in field-spec.md) and run:

```bash
python scripts/build_page_json.py fields.json <slug>.json
```

Fix every WARNING it prints (em dashes, banned claims, missing fields) and rerun until clean,
or list what is still missing in the sheet.

### 6. Deliver

Write `<slug>-page-kit.md` using the template below and give the user both files. If a file
tool is available, send them; otherwise print the sheet.

## Sheet template

Use this exact structure. One code block per value, so each one copies cleanly. Plain
language labels matching the editor.

````markdown
# <Partner name>: page kit

Page link: https://partner.revelationgoldgroup.com/<slug>
Referral link: https://partner.revelationgoldgroup.com/<slug>?kfl_ln=<code>
Kiflo link target (set in Kiflo): https://partner.revelationgoldgroup.com/<slug>
HubSpot: <contact link>

**To do before publishing:** <short list: partner approval of quote and paragraph, HubSpot form, Kiflo code confirm, photo cut-out, anything missing>

## Voice profile
<5 short lines>

## 1. Basic info
**Partner name**
```
...
```
**Page link**
```
...
```
**Vanity domain**
```
...
```

## 2. Logo & photo
**Partner logo** (URL, then why)
**Logo size**
**Partner photo** (top pick URL + 2 alternates, one line each; cut-out needed? yes/no)
**Photo description**

## 3. Lead form & tracking
**HubSpot form embed code** (or the exact steps to create it)
**Kiflo referral code**

## 4. Quote & signature  (DRAFT FOR PARTNER APPROVAL)
**Quote** / **Signature name** / **Title under the signature**

## 5. Why I Believe  (DRAFT FOR PARTNER APPROVAL)
**Paragraph**

## 6. 3 Reasons
**Headline** / **Reason 1** / **Reason 2** / **Reason 3** / **Source line**

## 7. Free guide
**Guide** (name + one-line reason)

## 8. Theme
**Preset** (name + reason) / **Hero background** (choice + reason)

## 9. Thank-you page
**Layout** / **Greeting with first name** / **Greeting without a name** / **Headline** / **Message**

## 10. Advanced
**Page title** / **Meta description**

## Sources
<every URL used, and the HubSpot records read>
````

## Quality bar

- Every value is final text, ready to paste. No placeholders, except where data truly does
  not exist, and then say exactly what to get and where.
- House style holds everywhere: no em dashes, no gold themes, no guarantees or predictions.
- Trust facts and ratings unchanged and flagged as perishable.
- The partner would recognize themselves in the copy.
