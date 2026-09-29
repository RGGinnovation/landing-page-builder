# stewardshipmetals.com (theDove)

Restored static site: the approved theDove Stewardship design (August 2026 mockup), with the
new crosses banner and The Faithful Steward cover. Plain HTML, no build step. Deploy the folder
as is to any static host and point stewardshipmetals.com at it.

- `index-single-file.html`: the whole site in one file (styles, script, images and the
  thank-you view built in). Upload it as `index.html` on any host. Nothing else is needed.
- `index.html` + `assets/` + `thank-you/index.html`: the same site as separate files.
- Lead form posts to HubSpot (portal 44817109) and Kiflo, same script as faithmetals.com.
- HubSpot form: 84d9c53b-f2c1-4500-9526-eb42106cc292 (set).
- Before launch, set theDove's Kiflo referral code: replace `PASTE_KIFLO_CODE` in
  `KIFLO_PARTNER_CODE` (in `assets/lead-form.js`, and in the script inside `index-single-file.html`).
- The Kiflo snippet in both pages is Kiflo's code verbatim. Do not edit it.
