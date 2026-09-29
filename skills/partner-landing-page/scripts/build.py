#!/usr/bin/env python3
"""
Builds the two partner landing page deliverables from one research file:

    <slug>.landing-page.json   one downloadable JSON: research, colors, review status and
                               the import-ready page (editor: Publish menu > Import JSON)
    <slug>-landing-page.md     the same content as a readable sheet: every field to paste,
                               the colors, and every line of the page top to bottom

Usage:
    python build.py input.json [out_dir]

input.json follows references/output-format.md. The script builds the page on the
live RGG template (assets/), applies the guide, theme and SEO rules, runs every
compliance and completeness check, and prints ERRORS (fix and rerun) and TODO items
(things only a person can supply, such as the HubSpot form or Kiflo confirmation).
Exit code 1 while any ERROR remains.
"""
import copy
import datetime as dt
import json
import re
import sys
from pathlib import Path

ASSETS = Path(__file__).resolve().parent.parent / "assets"
FORMAT = "rgg-partner-landing-page"
FORMAT_VERSION = 3


def load(name):
    return json.loads((ASSETS / name).read_text())


RULES = load("rules.json")
SITE = RULES["site"]
PORTAL = RULES["hubspotPortalId"]
COPY_RULES = [(re.compile(r["pattern"], re.I), r["why"]) for r in RULES["partnerCopyRules"]]
RESERVED = set(RULES["reservedSlugs"])

TRUST_FACTS = [
    "**BBB Accredited Business with an A+ rating**",
    "**4.9 star Google rating across 256 reviews**",
]
FAITH_WORDS = re.compile(
    r"\b(God|Lord|faith\w*|Scripture|biblical|Bible|Christ|Jesus|church|pray\w*|steward\w*|blessed)\b",
    re.I,
)
PRODUCT_NAMES = re.compile(r"Wealth Protection (Guide|Magazine)", re.I)
DASHES = re.compile("[—–]")

REQUIRED = [
    "partnerName", "slug", "quote", "signatureName", "signatureRole", "whyParagraph",
    "reasons", "guide", "heroBackground", "thankYouStyle", "photoAlt",
    "seoDescription",
]
# Supplied by people or systems outside the research: they block publishing, not the kit.
HUMAN_ITEMS = {
    "photoUrl": "Hero photo: none found. Upload one (transparent PNG cut-out) in Logo & photo.",
    "logoUrl": "Partner logo: none found. Upload a light or white logo in Logo & photo.",
}
GUID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", re.I)


def hubspot_embed(guid, portal=None, region="na1"):
    """The standard HubSpot embed for a form in the RGG portal (same as every live page)."""
    portal = portal or PORTAL
    return (
        f'<script src="https://js.hsforms.net/forms/embed/{portal}.js" defer></script>\n'
        f'<div class="hs-form-frame" data-region="{region}" data-form-id="{guid}" '
        f'data-portal-id="{portal}"></div>'
    )


# ---- colors: mirrors src/template/theme.ts (accentShades, bandShades, readableTheme)

def _rgb(h):
    m = re.fullmatch(r"#?([0-9a-fA-F]{6})", (h or "").strip())
    if not m:
        return None
    n = int(m.group(1), 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]


def _hex(rgb):
    return "#" + "".join(f"{max(0, min(255, round(c))):02X}" for c in rgb)


def mix(h, target, amount):
    rgb = _rgb(h)
    return _hex([c + (target - c) * amount for c in rgb]) if rgb else h


def accent_shades(a):
    return {"accent": a.upper(), "accentLight": mix(a, 255, 0.14), "accentDark": mix(a, 0, 0.22)}


def band_shades(b):
    return {"navy": b.upper(), "navyDeep": mix(b, 0, 0.4), "navyMid": mix(b, 255, 0.06)}


def _lum(h):
    rgb = _rgb(h) or [0, 0, 0]
    v = [(c / 255) / 12.92 if c / 255 <= 0.03928 else ((c / 255 + 0.055) / 1.055) ** 2.4 for c in rgb]
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]


def contrast(a, b):
    x, y = sorted([_lum(a), _lum(b)], reverse=True)
    return (x + 0.05) / (y + 0.05)


def _until(h, target, ok):
    c = (h or "").upper()
    if not _rgb(c):
        return c
    for _ in range(40):
        if ok(c):
            break
        c = mix(c, target, 0.06)
    return c


def readable(t):
    """What the site renders (theme.ts readableTheme): every text meets WCAG AA."""
    band = {k: _until(t[k], 0, lambda c: contrast("#FFFFFF", c) >= 12) for k in ("navy", "navyDeep", "navyMid")}
    lights = [t["paper"], t["alt"]]
    on_light = lambda c: all(contrast(c, l) >= 4.5 for l in lights)
    ink = _until(t["ink"], 0, on_light)
    best = lambda bg: "#FFFFFF" if contrast("#FFFFFF", bg) >= contrast(ink, bg) else ink
    label_ok = lambda c: contrast(best(c), c) >= 4.5
    accent = _until(t["accent"], 0, label_ok)
    accent_lt = _until(t["accentLight"], 0, label_ok)
    return {
        **band,
        "accent": accent, "accentLight": accent_lt,
        "ink": ink, "body": _until(t["body"], 0, on_light), "muted": _until(t["muted"], 0, on_light),
        "onAccent": best(accent), "onAccentLight": best(accent_lt),
        "accentInk": _until(t["accent"], 0, on_light),
        "accentGlow": _until(t["accentLight"], 255, lambda c: all(contrast(c, d) >= 4.5 for d in band.values())),
    }


def color_report(t):
    r = readable(t)
    rows = [
        ("Button label on accent", r["onAccent"], r["accent"]),
        ("Button label on hover", r["onAccentLight"], r["accentLight"]),
        ("Accent text on white", r["accentInk"], t["paper"]),
        ("Accent text on grey", r["accentInk"], t["alt"]),
        ("Accent text on dark band", r["accentGlow"], r["navy"]),
        ("White text on band", "#FFFFFF", r["navy"]),
        ("White text on deep band", "#FFFFFF", r["navyDeep"]),
        ("Headings on white", r["ink"], t["paper"]),
        ("Body text on white", r["body"], t["paper"]),
        ("Small text on grey", r["muted"], t["alt"]),
    ]
    adjusted = [k for k in ("navy", "navyDeep", "navyMid") if r[k].upper() != t[k].upper()]
    return {
        "chosen": {k: t[k] for k in ("accent", "accentLight", "accentDark", "navy", "navyDeep", "navyMid")},
        "rendered": r,
        "adjustedForReadability": adjusted,
        "checks": [{"pair": n, "text": a, "background": b, "ratio": round(contrast(a, b), 2),
                    "pass": contrast(a, b) >= 4.5} for n, a, b in rows],
    }


def slugify(s):
    return re.sub(r"[^a-z0-9]+", "-", (s or "").lower()).strip("-")[:60]


def section(page, type_):
    return next(s for s in page["sections"] if s["type"] == type_)


def words(s):
    return len(re.findall(r"[A-Za-z0-9$%'.]+", (s or "").replace("**", "")))


def sentences(s):
    return len([x for x in re.split(r"(?<=[.!?])\s+", (s or "").strip()) if x])


# --------------------------------------------------------------------------- build


def build_page(f):
    page = copy.deepcopy(load("page-template.json"))
    guides = {g["id"]: g for g in load("guides.json")}
    themes = load("theme-presets.json")
    presets = {p["id"]: p for p in themes["presets"]}
    backgrounds = {b["id"]: b["src"] for b in themes["heroBackgrounds"]}

    name = (f.get("partnerName") or "").strip()
    page["slug"] = slugify(f.get("slug") or name) or "partner"
    page["name"] = name or page["name"]
    page["vanityDomain"] = (f.get("vanityDomain") or "").strip().lower().removeprefix("www.")

    b = page["brand"]
    if name:
        b["partnerName"] = name
    if f.get("logoUrl"):
        b["partnerLogo"] = f["logoUrl"]
        b["partnerLogoWidth"] = int(f.get("logoWidth") or 520)
        b["partnerLogoHeight"] = int(f.get("logoIntrinsicHeight") or 119)

    t = page["theme"]
    preset = presets.get(f.get("themePreset") or "")
    if preset:
        t.update(preset["colors"])
        t["preset"] = preset["id"]
    # The partner's own brand colors (custom theme) take precedence over a preset.
    if _rgb(f.get("brandAccent") or ""):
        t.update(accent_shades(f["brandAccent"]))
        t["preset"] = "custom"
    if _rgb(f.get("brandBand") or ""):
        t.update(band_shades(f["brandBand"]))
        t["preset"] = "custom"
    if f.get("logoHeight"):
        h = int(f["logoHeight"])
        t["partnerLogoHeight"] = h
        t["partnerLogoHeightMobile"] = round(h * 0.76)
    if f.get("heroBackground"):
        t["heroBg"] = backgrounds.get(f["heroBackground"], f["heroBackground"])

    tr = page["tracking"]
    embed = f.get("hubspotEmbed") or ""
    if not embed and GUID.match((f.get("hubspotFormGuid") or "").strip()):
        embed = hubspot_embed(f["hubspotFormGuid"].strip())
    if embed:
        tr["hubspotEmbed"] = embed
        m = re.search(r'data-form-id\s*=\s*["\']([^"\']+)', embed) or re.search(
            r'formId\s*:\s*["\']([^"\']+)', embed
        ) or re.search(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}", embed, re.I)
        if m:
            tr["hubspotFormGuid"] = m.group(1) if m.groups() else m.group(0)
        p = re.search(r'(?:data-portal-id\s*=\s*["\']|portalId\s*:\s*["\'])(\d+)', embed)
        tr["hubspotPortalId"] = p.group(1) if p else PORTAL
    if f.get("kifloCode"):
        code = f["kifloCode"].strip()
        q = re.search(r"[?&]kfl_ln=([^&#\s]+)", code)
        tr["kifloPartnerCode"] = q.group(1) if q else code

    hero = section(page, "hero")["props"]
    if f.get("photoUrl"):
        hero["image"] = f["photoUrl"]
        hero["imageWidth"] = int(f.get("photoWidth") or 820)
        hero["imageHeight"] = int(f.get("photoHeight") or 986)
    if f.get("photoAlt"):
        hero["imageAlt"] = f["photoAlt"]

    quote = section(page, "quote")["props"]
    for k_in, k_out in (("quote", "quote"), ("signatureName", "name"), ("signatureRole", "role")):
        if f.get(k_in):
            quote[k_out] = f[k_in].strip()

    callband = section(page, "callband")["props"]
    if f.get("callbandHeadline"):
        callband["headline"] = f["callbandHeadline"].strip()
    if f.get("callbandSubline"):
        callband["subline"] = f["callbandSubline"].strip()

    if f.get("whyParagraph"):
        section(page, "why")["props"]["paragraphs"] = [f["whyParagraph"].strip()]

    reasons = section(page, "reasons")["props"]
    if f.get("reasonsHeadline"):
        reasons["headline"] = f["reasonsHeadline"]
    if f.get("reasons"):
        reasons["items"] = [r.strip() for r in f["reasons"] if r.strip()]
    reasons["source"] = f.get("reasonsSource", "") or ""

    guide = guides.get(f.get("guide") or "wealth-guide", guides["wealth-guide"])
    steward = guide["id"] == "faithful-steward"
    kit = section(page, "kit")["props"]
    kit.update(
        image=guide["src"], imageAlt=guide["alt"], headline=guide["headline"], lede=guide["lede"],
        points=list(guide["points"]), buttonLabel=guide["buttonLabel"], footnote="",
    )

    kit_name = "Biblical Stewardship Kit" if steward else "Gold & Silver Kit"
    guide_name = "The Faithful Steward guide" if steward else "the free 2026 Wealth Protection Guide and Magazine"
    ty = page["thankYou"]
    ty.update(
        primaryUrl=guide["downloadUrl"],
        body=guide["thankYouBody"],
        seoTitle="Your Kit Is On Its Way | {partner} & Revelation Gold Group",
        seoDescription=f"Thank you for requesting {guide_name}. Check your inbox for the download, "
        "or call Revelation Gold Group at {phone}.",
    )
    for k_in, k_out in (
        ("thankYouStyle", "style"), ("thankYouGreetingNamed", "greetingNamed"),
        ("thankYouGreeting", "greeting"), ("thankYouHeadline", "headline"),
        ("thankYouMessage", "body"), ("thankYouNote", "note"),
    ):
        if f.get(k_in):
            ty[k_out] = f[k_in]

    seo = page["seo"]
    seo["title"] = f.get("seoTitle") or f"Free {kit_name} | {{partner}} & Revelation Gold Group"
    seo["ogTitle"] = f"Free {kit_name}"
    seo["siteName"] = "{partner} x Revelation Gold Group"
    if f.get("seoDescription"):
        seo["description"] = seo["ogDescription"] = f["seoDescription"].strip()
    return page, guide


# --------------------------------------------------------------------------- checks


def check(kit, page, guide):
    f = kit.get("fields", {})
    partner = kit.get("partner", {})
    errors, warnings, todo = [], [], []
    E, W, T = errors.append, warnings.append, todo.append

    for k in REQUIRED:
        if not f.get(k):
            E(f"Missing field: {k}")
    slug = page["slug"]
    if slug in RESERVED or not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", slug):
        E(f"Page link '{slug}' is reserved or malformed.")

    all_text = json.dumps({"fields": f, "page": page}, ensure_ascii=False)
    if DASHES.search(all_text):
        E("Em or en dash found. Use a period, comma or colon.")
    if re.search(r"partner name", json.dumps(page, ensure_ascii=False), re.I):
        E("The page still contains the placeholder 'Partner Name'.")

    # Personal opinion and belief only: no benefit, return, protection or advice language.
    voice = [("quote", f.get("quote")), ("whyParagraph", f.get("whyParagraph"))]
    voice += [(f"reasons[{i + 1}]", r) for i, r in enumerate(f.get("reasons") or [])]
    voice += [(k, f.get(k)) for k in (
        "thankYouHeadline", "thankYouMessage", "thankYouNote", "seoDescription", "photoAlt",
        "callbandHeadline", "callbandSubline")]
    voice.append(("hero headline", section(page, "hero")["props"]["headline"]))
    for key, text in voice:
        if not text:
            continue
        plain = PRODUCT_NAMES.sub("", text.replace("**", ""))
        for rx, why in COPY_RULES:
            m = rx.search(plain)
            if m:
                E(f"{key}: \"{m.group(0)}\" is flagged ({why}). Rewrite as the partner's own opinion or choice, with no implied return or advice.")

    q = f.get("quote") or ""
    if q and not 25 <= words(q) <= 45:
        W(f"quote is {words(q)} words (target 25 to 45).")
    if re.search(r"^[\"“]|[\"”]$", q.strip()):
        E("quote: remove the quote marks (the page adds them).")
    why = f.get("whyParagraph") or ""
    if why:
        if not 100 <= words(why) <= 170:
            W(f"whyParagraph is {words(why)} words (target 110 to 160).")
        for fact in TRUST_FACTS + ["**Revelation Gold Group**"]:
            if fact not in why:
                E(f"whyParagraph must include {fact} exactly as written.")
        if "Trustpilot" not in why:
            E("whyParagraph must mention verified reviews on Trustpilot.")
    rs = f.get("reasons") or []
    if rs and len(rs) != 3:
        E(f"reasons: exactly 3 needed, found {len(rs)}.")
    for i, r in enumerate(rs):
        if sentences(r) > 2:
            W(f"reasons[{i + 1}] has {sentences(r)} sentences (max 2).")
    if any(re.search(r"\d", r.replace("401(k)", "")) for r in rs) and not f.get("reasonsSource"):
        E("A reason uses a number but reasonsSource is empty. Add the named source and month, or drop the number.")
    for fig in kit.get("figures") or []:
        if not fig.get("source") or not fig.get("checked"):
            E(f"Figure '{fig.get('text')}' needs a source and the date it was checked.")
    for c in kit.get("claims") or []:
        if not c.get("source"):
            E(f"Claim about the partner has no source: '{c.get('text')}'. Source it (web or HubSpot) or remove it from the copy.")

    # Specific personal facts (years, counts) in the copy must appear in claims or figures.
    ledger = " ".join(str(c.get("text", "")) for c in (kit.get("claims") or []) + (kit.get("figures") or []))
    for key, text in (("quote", q), ("whyParagraph", why)):
        for m in re.finditer(r"\b(19|20)\d{2}\b|\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|twenty|thirty)\s+(years?|decades?)\b", text or "", re.I):
            token = m.group(0)
            if token.lower() not in ledger.lower() and not (m.group(1) and token in ledger):
                W(f"{key} states \"{token}\" but no claim or figure mentions it. Add the claim with its source, or remove it.")
    if re.search(r"\bI(?:'ve| have)? (?:own|bought|buy|hold|have held|have owned)\b[^.]*\b(gold|silver|metal)", " ".join([q, why] + rs), re.I) and not re.search(r"\b(own|bought|buy|hold)\w*\b.*\b(gold|silver|metal)", ledger, re.I):
        W("The copy says the partner owns or buys metals, but no claim sources it. Source it or frame it as a belief and add a to-do.")

    faith_forward = bool(partner.get("faithForward"))
    partner_voice = " ".join([q, why] + rs)
    if not faith_forward and FAITH_WORDS.search(partner_voice):
        W(f"Faith language (\"{FAITH_WORDS.search(partner_voice).group(0)}\") in the copy of a partner whose public frame is not faith. Let faith come from them: remove it unless they use it themselves.")
    if faith_forward and guide["id"] != "faithful-steward":
        W("Faith-forward audience but the Wealth Guide is selected. Faithful Steward is the default for faith audiences.")
    if not faith_forward and guide["id"] == "faithful-steward":
        W("Faithful Steward guide selected for a partner whose public frame is not faith. Confirm.")

    # Colors: the partner's own, and readable everywhere.
    theme = page["theme"]
    if theme.get("preset") in (None, "", "custom") and not (_rgb(f.get("brandAccent") or "") and _rgb(f.get("brandBand") or "")):
        if not f.get("themePreset"):
            E("Colors: give brandAccent and brandBand (the partner's own colors) or a themePreset.")
        elif theme.get("preset") == "custom":
            W("Only one brand color given; the other comes from the preset. Give both for a fully custom theme.")
    if not f.get("brandAccent") and not kit.get("assets", {}).get("brandColors"):
        W("No partner brand colors recorded. The theme is a preset, not tailored to the partner.")
    rep = color_report(theme)
    if rep["adjustedForReadability"]:
        W(f"Band color {theme['navy']} is too light for white text; the site darkens it to {rep['rendered']['navy']}. Use a darker brand color for an exact match.")
    for row in rep["checks"]:
        if not row["pass"]:
            E(f"Colors: {row['pair']} is {row['ratio']}:1 (needs 4.5:1).")

    sd = f.get("seoDescription") or ""
    if sd and not 120 <= len(sd) <= 165:
        W(f"seoDescription is {len(sd)} characters (target 140 to 160).")
    if len(partner.get("identityCheck") or []) < 2:
        W("Identity not confirmed by two independent sources (partner.identityCheck).")
    if len(partner.get("voiceSamples") or []) < 5:
        W("Fewer than 5 verbatim voice samples. The copy may not sound like the partner.")

    for k, msg in HUMAN_ITEMS.items():
        if not f.get(k):
            T(msg)
    tr = page["tracking"]
    if not tr.get("hubspotFormGuid"):
        T("HubSpot form: none found for this partner. In HubSpot, Marketing > Forms, clone the latest partner form, name it '<Partner> Landing Page', then paste its embed code in Lead form & tracking.")
    elif not GUID.match(tr["hubspotFormGuid"]):
        E(f"HubSpot form id '{tr['hubspotFormGuid']}' is not a valid form GUID.")
    form = (kit.get("hubspot") or {}).get("form") or {}
    if tr.get("hubspotFormGuid") and not form.get("source"):
        W("HubSpot form has no recorded source (hubspot.form.source). Say where the form id came from.")
    if f.get("kifloCode") and not f.get("kifloCodeConfirmed"):
        E("kifloCode is set but not confirmed by a source. Leave it blank: the team enters the Kiflo code.")
    if not f.get("kifloCode"):
        T("Kiflo referral code: enter it in Lead form & tracking (the team adds this).")
    T(f"Kiflo: the partner's link must target {SITE}/{slug} or Kiflo drops every visit and lead.")
    T("Partner approval: the quote and Why I Believe paragraph are drafts in the partner's voice (FTC endorsement rules). Get written approval before publishing.")
    T("Perishable: verify the BBB rating, Google rating and review count, and any figure in 3 Reasons, before launch.")
    if page["vanityDomain"] and not f.get("vanityDomainConfirmed"):
        T(f"Vanity domain {page['vanityDomain']} is proposed. Confirm it is registered, then 301 redirect it to {SITE}/{slug}.")
    for extra in kit.get("todo") or []:
        T(extra)
    return errors, warnings, todo


# --------------------------------------------------------------------------- output


def links(page):
    slug = page["slug"]
    code = page["tracking"]["kifloPartnerCode"]
    return {
        "page": f"{SITE}/{slug}",
        "thankYou": f"{SITE}/{slug}/thank-you",
        "referral": f"{SITE}/{slug}?kfl_ln={code}" if code else "",
        "kifloLinkTarget": f"{SITE}/{slug}",
        "vanityDomain": page["vanityDomain"],
    }


def block(label, value, note=""):
    if value in (None, "", []):
        value = "(not found: see To do)"
    if isinstance(value, list):
        value = "\n".join(str(v) for v in value)
    out = f"**{label}**" + (f"  \n{note}" if note else "") + f"\n```\n{value}\n```\n"
    return out


def full_page_lines(page):
    b = page["brand"]
    tok = {"{partner}": b["partnerName"], "{phone}": b["phoneDisplay"], "{rgg}": b["rggName"]}

    def fill(x):
        x = str(x or "")
        for k, v in tok.items():
            x = x.replace(k, v)
        return x.replace("**", "")

    out = []
    add = lambda label, text, fixed=False: text and out.append(f"- **{label}**{' (fixed)' if fixed else ''}: {fill(text)}")
    for s in page["sections"]:
        if s.get("hidden"):
            continue
        p, t = s["props"], s["type"]
        if t == "topbar":
            add("Top bar", f"{b['partnerName']} x Revelation Gold Group. {p.get('callLabel', '')} {b['phoneDisplay']}", True)
        elif t == "hero":
            add("Hero headline", p["headline"], True)
            add("Form", f"{p['firstLabel']}, {p['lastLabel']}, {p['phoneLabel']}, {p['emailLabel']}. Button: {p['submitLabel']}", True)
            add("Consent", p["consent"], True)
        elif t == "quote":
            add("Quote", f"\u201c{p['quote']}\u201d, {p['name']}, {p['role']}")
        elif t == "callband":
            add("Call band", f"{p['headline']} {p['subline']} Button: {p['buttonLabel']}")
        elif t == "why":
            add("Why I Believe headline", p["headline"].replace("\n", " "), True)
            for para in p["paragraphs"]:
                add("Why I Believe", para.replace("\n\n", " "))
            add("Trust badges", ", ".join(f"{x.get('label')} {x.get('value', '')}".strip() for x in p.get("badges", [])), True)
            add("Badge note", p.get("note"), True)
        elif t == "kit":
            add("Guide headline", p["headline"], True)
            add("Guide text", p["lede"], True)
            add("Guide checklist", "; ".join(p["points"]), True)
            add("Guide button", p["buttonLabel"], True)
        elif t == "reasons":
            add("3 Reasons headline", p["headline"].replace("\n", " "))
            for i, x in enumerate(p["items"], 1):
                add(f"Reason {i}", x)
            add("Source line", p.get("source"))
        elif t == "question":
            add("401(k) eyebrow", p["eyebrow"], True)
            add("401(k) headline", p["headline"], True)
            for para in p["paragraphs"]:
                add("401(k) text", para, True)
            add("401(k) lead", p["lead"], True)
            add("401(k) accounts", ", ".join(p["accounts"]), True)
            add("401(k) ask", p["ask"].replace("\n", " "), True)
            add("401(k) fine print", p["fine"], True)
        elif t == "offer":
            add("Offer", f"{p['eyebrow']} {p['headline'].replace(chr(10), ' ')}", True)
            add("Offer terms", p["terms"], True)
        elif t == "footer":
            add("Footer disclosure", p.get("partnerDisclosure"), True)
            for d in p["disclosures"]:
                add("Footer disclaimer", d, True)
        elif t == "callbar":
            add("Mobile call bar", p["label"], True)
    ty = page["thankYou"]
    out += ["", "Thank-you page:"]
    add("Greeting", f"{ty['greetingNamed']} / {ty['greeting']}")
    add("Headline", ty["headline"])
    add("Message", ty["body"])
    add("Download button", f"{ty['primaryLabel']} ({ty['primaryUrl']})", True)
    add("Note", ty["note"])
    return out + [""]


def markdown(kit, page, guide, status, errors, warnings, todo):
    f = kit.get("fields", {})
    p = kit.get("partner", {})
    a = kit.get("assets", {})
    r = kit.get("rationale", {})
    hs = kit.get("hubspot", {})
    L = links(page)
    ready = "READY TO PASTE" if status["copyReady"] else "NOT READY: fix the errors below"
    md = [f"# {f.get('partnerName') or page['name']}: landing page\n",
          f"Status: **{ready}**. Publish blockers left: {len(todo)}.\n",
          f"- Page: {L['page']}",
          f"- Referral link: {L['referral'] or '(needs Kiflo code)'}",
          f"- Kiflo link target (set in Kiflo): {L['kifloLinkTarget']}",
          f"- HubSpot: {hs.get('contactUrl') or 'no contact found'}",
          f"- Researched from: {kit.get('input', {}).get('link', '')}\n"]
    if errors:
        md += ["## Errors (the kit is not done)"] + [f"- {e}" for e in errors] + [""]
    md += ["## To do before publishing"] + [f"- [ ] {t}" for t in todo] + [""]
    if warnings:
        md += ["## Review notes"] + [f"- {w}" for w in warnings] + [""]
    md += ["## Who they are",
           f"{p.get('bio', '')}\n",
           f"- Known as: {p.get('knownAs', '')}",
           f"- Role: {p.get('role', '')}, {p.get('organization', '')}",
           f"- Audience: {p.get('audience', '')}",
           f"- Faith-forward in public: {'yes' if p.get('faithForward') else 'no'}. {p.get('faithNote', '')}\n",
           "## Voice profile"] + [f"- {v}" for v in p.get("voiceProfile", [])] + [""]
    md += ["## 1. Basic info",
           block("Partner name", f.get("partnerName")),
           block("Page link", page["slug"], r.get("slug", "")),
           block("Vanity domain", page["vanityDomain"])]
    photo = a.get("photo") or {}
    alts = a.get("photoAlternates") or []
    logo = a.get("logo") or {}
    md += ["## 2. Logo & photo",
           block("Partner logo (URL)", f.get("logoUrl"), logo.get("why", "")),
           block("Logo size (px tall)", f.get("logoHeight")),
           block("Partner photo (URL)", f.get("photoUrl"),
                 (photo.get("why", "") + (" Needs a background cut-out." if photo.get("needsCutout") else ""))),
           ]
    if alts:
        md += ["Alternates:"] + [f"- {x.get('url')} ({x.get('why', '')})" for x in alts] + [""]
    md += [block("Photo description", f.get("photoAlt"))]
    form = hs.get("form") or {}
    tr = page["tracking"]
    md += ["## 3. Lead form & tracking",
           block("HubSpot form embed code", tr["hubspotEmbed"] or "(no form found: see To do)",
                 (f"Form: {form.get('name', '')} ({tr['hubspotFormGuid']}), from {form.get('source', '')}"
                  if tr["hubspotFormGuid"] else "")),
           block("Kiflo referral code", tr["kifloPartnerCode"] or "(the team adds this)")]
    md += ["## 4. Quote & signature (DRAFT FOR PARTNER APPROVAL)",
           block("Quote", f.get("quote")),
           block("Signature name", f.get("signatureName")),
           block("Title under the signature", f.get("signatureRole"))]
    md += ["## 5. Why I Believe (DRAFT FOR PARTNER APPROVAL)",
           block("Paragraph", f.get("whyParagraph"))]
    rs = f.get("reasons") or ["", "", ""]
    md += ["## 6. 3 Reasons",
           block("Headline", section(page, "reasons")["props"]["headline"])]
    md += [block(f"Reason {i + 1}", x) for i, x in enumerate(rs)]
    md += [block("Source line", f.get("reasonsSource") or "(no figures used: leave blank)")]
    md += ["## 7. Free guide",
           block("Guide", guide["label"], r.get("guide", ""))]
    th = page["theme"]
    rep = color_report(th)
    md += ["## 8. Theme and colors"]
    if th.get("preset") == "custom":
        md += ["Theme: **Custom** (the partner's own colors). In the editor pick Custom, then paste:",
               block("Accent color (buttons, numbers, stars)", th["accent"], r.get("brandAccent", "")),
               block("Band color (top bar, hero, call band, footer)", th["navy"], r.get("brandBand", ""))]
    else:
        md += [block("Preset", th.get("preset"), r.get("themePreset", ""))]
    md += [block("Hero background", f.get("heroBackground"), r.get("heroBackground", ""))]
    md += ["Readability (every pair must be 4.5:1 or more; the site enforces this automatically):", "",
           "| Where | Text | Background | Ratio |", "| --- | --- | --- | --- |"]
    md += [f"| {c['pair']} | {c['text']} | {c['background']} | {c['ratio']}:1 {'ok' if c['pass'] else 'FAIL'} |" for c in rep["checks"]]
    md += [""]
    ty = page["thankYou"]
    md += ["## 9. Thank-you page",
           block("Layout", ty["style"], r.get("thankYouStyle", "")),
           block("Greeting with first name", ty["greetingNamed"]),
           block("Greeting without a name", ty["greeting"]),
           block("Headline", ty["headline"]),
           block("Message", ty["body"])]
    seo = page["seo"]
    md += ["## 10. Advanced",
           block("Page title", seo["title"]),
           block("Meta description", seo["description"])]
    cb = section(page, "callband")["props"]
    md += ["## 11. Call band (tailored)",
           block("Headline", cb["headline"]),
           block("Subline", cb["subline"])]
    md += ["## Every line on the page, top to bottom", "",
           "This is exactly what visitors will read. Fixed template lines are marked (fixed).", ""]
    md += full_page_lines(page)
    md += ["## Facts used in the copy, with sources"]
    md += [f"- {c.get('text')} ({c.get('source')})" for c in kit.get("claims") or []] or ["- none"]
    md += [f"- {x.get('text')} ({x.get('source')}, checked {x.get('checked')})" for x in kit.get("figures") or []]
    md += ["", "## HubSpot"]
    md += [f"- {n.get('date', '')}: {n.get('point', '')}" for n in hs.get("keyNotes") or []] or ["- nothing relevant"]
    md += [f"- Guidance: {g}" for g in hs.get("guidance") or []]
    md += ["", "## Voice samples"] + [f"- \"{v.get('text')}\" ({v.get('source')})" for v in p.get("voiceSamples") or []]
    md += ["", "## Sources"] + [f"- {s.get('url')}: {s.get('usedFor', '')}" for s in kit.get("sources") or []]
    if kit.get("blocked"):
        md += ["", "Could not open (used search results instead): " + ", ".join(kit["blocked"])]
    return "\n".join(md) + "\n"


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(2)
    kit = json.loads(Path(sys.argv[1]).read_text())
    out_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else Path(".")
    out_dir.mkdir(parents=True, exist_ok=True)

    page, guide = build_page(kit.get("fields", {}))
    errors, warnings, todo = check(kit, page, guide)
    status = {"copyReady": not errors, "publishReady": not errors and not todo,
              "errors": errors, "warnings": warnings, "todo": todo}
    out = {
        "format": FORMAT,
        "formatVersion": FORMAT_VERSION,
        "generatedAt": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "input": kit.get("input", {}),
        "links": links(page),
        "status": status,
        "partner": kit.get("partner", {}),
        "hubspot": kit.get("hubspot", {}),
        "assets": kit.get("assets", {}),
        "rationale": kit.get("rationale", {}),
        "colors": color_report(page["theme"]),
        "claims": kit.get("claims", []),
        "figures": kit.get("figures", []),
        "sources": kit.get("sources", []),
        "blocked": kit.get("blocked", []),
        "fields": kit.get("fields", {}),
        "page": page,
    }
    slug = page["slug"]
    jp = out_dir / f"{slug}.landing-page.json"
    mp = out_dir / f"{slug}-landing-page.md"
    jp.write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n")
    mp.write_text(markdown(kit, page, guide, status, errors, warnings, todo))

    print(f"Wrote {jp}\nWrote {mp}")
    print(f"Page link: {out['links']['page']}")
    if out["links"]["referral"]:
        print(f"Referral link: {out['links']['referral']}")
    for e in errors:
        print("ERROR:", e)
    for w in warnings:
        print("WARN:", w)
    for t in todo:
        print("TODO:", t)
    print("COPY READY" if not errors else f"{len(errors)} ERROR(S): fix and rerun")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
