# Research playbook: from one link to a verified partner profile

The page only works if it sounds like the partner and says nothing untrue about them. Research
until you can answer every question below with a source, or say plainly that it is unknown.

## 1. Identity (do this first)

- Open the link and find the person behind it: full name, the name the audience knows them by,
  their role, and their organization or show.
- Confirm with **two independent sources**, for example the site's About page plus a station
  page, a publisher page, LinkedIn, Wikipedia or local press.
- Watch for ambiguity. Shared names, team nicknames and similar show titles are common.
  Example: A Sea of Red is a Liberty University Flames site in Lynchburg, VA, not a Calgary
  Flames site. If two people share the name, pin down which one is linked to the URL.
- Record the result in `partner.identityCheck` as `[{fact, source}]`.

## 2. The link's own site

Read, in this order: the About page or host bio, the show, book, ministry or services pages,
the blog, Substack or newsletter archive (read the 3 most recent posts), the press or media
kit, and the contact page.

Capture:
- The bio in their own words.
- Credentials and history (years on air, career, books).
- Location.
- Mission and mottos.
- The audience they describe.
- Products or services.
- Their brand colors.
- The header logo file.

## 3. Public footprint

Search for:
- `"<name>" <show>`
- `"<name>" interview`
- `"<name>" podcast`
- `"<name>" about`
- `site:x.com <handle>`
- their YouTube channel description.

Also check Instagram and Facebook bios, Apple Podcasts or Spotify show descriptions, Wikipedia,
trade press (Radio Insight, Barrett Media for radio hosts), and local news.

Capture:
- Their audience's name for itself ("Dude Nation", "Crusaders").
- Signature phrases.
- Recurring themes.
- Faith: whether it is stated publicly, and how. This decides `faithForward`.
- Anything controversial that a reviewer should know.

## 4. HubSpot (read only, portal 44817109)

1. Search CONTACT by full name. If that misses, search again by last name, then by domain or
   show name. Partners carry `hs_lead_status` = "Partner".
2. Read `firstname`, `lastname`, `jobtitle`, `company`, `website` (often the vanity domain,
   e.g. KalinerMetals.com), `email` and `hs_lead_status`.
3. Read **every** NOTE associated with the contact.
   - Nadia's prospect profiles use six sections: About, Shows, Social Media, Audience, Where Do
     We Fit, Relevant Links. They are the best single source.
   - Meeting notes hold facts the partner told us (e.g. "has bought silver since the 2008
     crash").
   - Notes also hold guidance for us (e.g. "let faith come from him").
4. Company record: search once. If it exists, read the `kiflo_*` properties. Many partners
   have none, and that is normal.
5. Never create or update anything in HubSpot.

Put in the output: the contact URL, the notes that shaped the copy (`hubspot.keyNotes`) and any
guidance (`hubspot.guidance`). Leave out anything RGG wrote for them, such as ghost-written
posts or our own decks: that is our voice, not theirs.

## 5. Voice samples

Collect 5 to 10 **verbatim** lines with sources: headlines they wrote, bio lines, post
openings, tweets, and quotes in interviews. Prefer their writing over third-party summaries.
Then write the 5-line voice profile (see voice-and-compliance.md).

## 6. Assets

**Photo:** find the top pick plus 2 alternates by the Photo standard in field-spec.md. Give
direct image URLs with their width and height when you can read them. Say whether a
background cut-out is needed.

**Logo:** find a light or white version for the dark navy header, as a transparent PNG or
SVG. If only a dark logo exists, say so.

**Brand colors:** record 1 to 3 hex values in `assets.brandColors`, with where each came from.
Read them from, in order:
1. The logo file.
2. The site's `<meta name="theme-color">`, header background and button colors in its CSS.
3. Their show artwork or social banner.

The darkest one becomes `brandBand` and the signature one `brandAccent`. Skip anything gold,
yellow, amber, bronze or brass.

## 7. When pages will not load

After two failed fetches on a host, stop retrying that host:
- Work from search snippets and HubSpot, and list the host in `blocked`.
- For the photo and logo, give the page URLs where they live and name who to ask (the partner,
  or the assistant listed in HubSpot).
- Treat snippet-only quotes as lower confidence. Keep them out of the quote unless HubSpot or a
  second source confirms them.

## 8. Done when

- Identity is confirmed by two sources.
- There are 5 or more voice samples.
- `faithForward` is decided, with a reason.
- Every claim you plan to use has a source.
- The photo, logo and colors are found, or there is a clear to-do.
- HubSpot has been read in full.
