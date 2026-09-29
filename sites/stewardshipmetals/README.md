# stewardshipmetals.com (theDove)

Restored static site: the approved theDove Stewardship design (August 2026 mockup), with the
new crosses banner and The Faithful Steward cover. Plain HTML, no build step. Deploy the folder
as is to any static host and point stewardshipmetals.com at it.

- `index.html`: landing page. `thank-you/index.html`: thank-you page.
- Lead form posts to HubSpot (portal 44817109) and Kiflo, same script as faithmetals.com.
- Before launch, set two values at the top of `assets/lead-form.js`:
  - `FORM_GUID`: the HubSpot form GUID (replace `PASTE_HUBSPOT_FORM_GUID`).
  - `KIFLO_PARTNER_CODE`: theDove's Kiflo referral code (replace `PASTE_KIFLO_CODE`).
- The Kiflo snippet in both pages is Kiflo's code verbatim. Do not edit it.
