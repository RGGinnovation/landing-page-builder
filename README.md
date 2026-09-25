# RGG Partner Pages

One template, one editor, every partner landing page, hosted from one Lovable project.

| URL | What it is |
| --- | --- |
| `<site>/admin` | The editor. Team sign-in, partner list, field form, live preview, **Publish now**. |
| `<site>/<slug>` | A partner's public landing page, e.g. `partner.revelationgoldgroup.com/smedley`. |
| `<site>/<slug>/thank-you` | Where that page's form lands after a submission. |
| `LastNameMetals.com` | The partner's vanity domain. 301-redirects to `<site>/<slug>`. |

Every public page carries the Kiflo snippet and the HubSpot tracking code automatically.

---

## What an editor changes (everything else is the fixed RGG template)

| Group | Fields |
| --- | --- |
| Basic info | Partner name, page link (slug), vanity domain |
| Logo & photo | Top-left partner logo (+ size), hero photo |
| Lead form & tracking | HubSpot embed code (paste as is), form style, Kiflo referral code |
| Quote & signature | Quote under the hero, signature name (script font), title |
| Why I Believe | Headline and paragraphs, each with **Regenerate** (light rewrite) |
| Free guide | 2026 Wealth Protection Guide or The Faithful Steward. Sets the image, the copy beside it, and the thank-you download link (wealthguide. / steward.revelationgoldgroup.com) |
| Theme | 8 partner presets or a custom accent + band color, hero background |
| Thank-you page | Layout, photo, greeting, headline, message, button, signature, note |
| Advanced | SEO, section show/hide, all template copy, RGG phone |

A launch checklist blocks **Publish now** until the page has a real partner name, logo, photo,
quote, HubSpot form, Kiflo code, and a non-gold accent.

### Regenerate

Rewrites a Why I Believe paragraph slightly so no two partner pages read the same.
Uses Lovable AI when it is on; every rewrite is checked (same numbers and ratings, no em dashes,
no guarantees or return language, similar length). If AI is off or a rewrite fails the check, it
swaps in pre-approved alternate sentences from `src/editor/rephrase.ts`. Undo reverts it.

### HubSpot form

Paste the embed code HubSpot gives you. The editor reads the portal and form id out of it.
- **RGG styled form** (default): the template's own form posts to that HubSpot form through the
  Forms API (a native submission: timeline, workflows and notifications fire as usual), creates the
  Kiflo lead, then opens `/<slug>/thank-you` with the visitor's first name.
- **HubSpot embed**: HubSpot's own form in the form column. The page still creates the Kiflo lead
  and redirects on HubSpot's success event.

Add a hidden `kiflo_tracking_code` property to each HubSpot form to store Kiflo's tracking code on
the contact. If it is missing the lead still goes through (the form retries without it).

---

## Live project

| | |
| --- | --- |
| Lovable project | https://lovable.dev/projects/255b6b17-6650-4a36-9c39-0f05b8461fc4 |
| Published | https://rgg-partner-pages.lovable.app (editor at `/admin`) |
| Target domain | https://partner.revelationgoldgroup.com (connect in Lovable → Settings → Domains) |

Already done on that project: code imported, Lovable Cloud on, migration applied (tables, RLS,
RPCs, `partner-assets` bucket), Lovable AI key provisioned, email sign-in on with auto-confirm,
project knowledge set from AGENTS.md, published.

## Hand-off to Lovable

1. **Import.** In Lovable, create the project from this GitHub repo (it is Lovable's TanStack Start
   template, so it runs as is).
2. **Cloud.** Prompt Lovable: *"Enable Lovable Cloud and run the migration in
   supabase/migrations/20260925120000_partner_pages.sql."* This creates the `partner_pages` table,
   the editor check, the two public read functions and the `partner-assets` image bucket.
3. **Auth.** In Cloud → Authentication, keep Email on. Set the Site URL to
   `https://partner.revelationgoldgroup.com` and add `https://partner.revelationgoldgroup.com/admin`
   as a redirect URL. Anyone with an `@revelationgoldgroup.com` email can edit;
   add other editors as rows in `partner_page_editors`.
4. **AI.** Prompt Lovable: *"Enable Lovable AI."* That provides `LOVABLE_API_KEY` for Regenerate.
5. **Domain.** In Lovable → Settings → Domains, connect `partner.revelationgoldgroup.com`. At the
   DNS host for revelationgoldgroup.com, add the record Lovable shows for the `partner` subdomain.
   The code already uses this domain for page links (override with `VITE_PUBLIC_SITE_URL` for
   staging). The bare `partner.revelationgoldgroup.com/` redirects to revelationgoldgroup.com
   (`VITE_ROOT_REDIRECT`).
6. **Publish** the Lovable project, open `<site>/admin`, sign up with a company email, and load
   the two sample pages from the empty partner list to confirm everything.

### Per partner (about five minutes)

1. `/admin` → **+** → partner name → page link (usually their last name).
2. Upload logo and photo, paste the HubSpot embed code, enter the Kiflo referral code.
3. Quote and signature, **Regenerate** Why I Believe, pick the guide image and a theme.
4. Check the thank-you page tab, clear the checklist, **Publish now**.
5. At the registrar: 301 redirect `LastNameMetals.com` and `www.` to `<site>/<slug>`.

Alternative to the redirect: connect the partner domain to this Lovable project and enter it as the
page's vanity domain. The site then serves that page at the domain's root (and `/thank-you`).

---

## Code map

```
src/template/               THE TEMPLATE (shared by the public site and the editor preview)
  types.ts                  PageConfig: everything that varies per partner
  sections/                 Top bar, hero + form, quote, why, kit, reasons, 401(k), offer, footer
  LandingPage.tsx           Renders a PageConfig
  ThankYouPage.tsx          Thank-you page (photo + message, centered dark, centered light)
  lead-form.ts              HubSpot Forms API + Kiflo lead, and the native-embed listener
  tracking-scripts.ts       Kiflo snippet + HubSpot tracking, on every public page
  constants.ts              Kiflo key, HubSpot portal, site URL, reserved slugs
  theme.ts                  Theme presets, color helpers, gold-hue guard
  kits.ts                   Free guides: image, kit copy, thank-you download link
  hubspot.ts                Embed-code parser
  styles/landing.css        Production CSS, scoped under .lp
src/editor/                 The /admin editor (form, fields, store, auth, checklist, regenerate)
src/data/                   Public read path (published pages by slug or by domain), migrations
src/routes/                 $slug, $slug/thank-you, admin, preview, index (domain root)
src/content/pages/          Base template + two sample partners (USA Gov Policy, IBTV)
supabase/migrations/        Database, security and storage
```

Local dev: `bun install && bun run dev`, then open http://localhost:5173/admin. Without Cloud env
vars the editor runs in local mode (drafts in the browser, sample pages served publicly).

## Open items

- **Sample IBTV theme**: production faithmetals.com uses an amber accent. The sample uses the Ember
  preset instead (brand rule: no gold or amber).
- **Silver offer**: the terms line is still the production placeholder. Replace it with approved
  terms before running the "Up to 10% in free silver" headline.
- **Perishable figures** in the template copy: the $40 trillion national debt line (source line
  says U.S. Treasury, Debt to the Penny, September 2026) and the Google rating and review count.
  Re-verify before each new launch.
