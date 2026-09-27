#!/usr/bin/env python3
"""
Turns a filled fields file into a partner page JSON that imports straight into the
RGG Partner Pages editor (partner.revelationgoldgroup.com/admin -> Publish menu -> Import JSON).

Usage:
    python build_page_json.py fields.json [output.json]

fields.json holds the flat field values (see references/field-spec.md for every key).
Anything left out keeps the RGG template default. The script also runs the house-style
checks (no em dashes, no gold theme, no banned claims) and prints warnings.
"""
import copy
import json
import re
import sys
from pathlib import Path

ASSETS = Path(__file__).resolve().parent.parent / "assets"
SITE = "https://partner.revelationgoldgroup.com"

BANNED = [
    r"\bguarantee",
    r"\brisk[- ]free\b",
    r"\bsafe haven\b",
    r"\bwill (rise|go up|double|soar)\b",
    r"\bprofits?\b",
    r"\bskyrocket",
    r"\btax[- ]free\b",
]


def load(name):
    return json.loads((ASSETS / name).read_text())


def slugify(s):
    s = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
    return s[:60] or "partner"


def section(page, type_):
    return next(s for s in page["sections"] if s["type"] == type_)


def build(f):
    page = copy.deepcopy(load("page-template.json"))
    guides = {g["id"]: g for g in load("guides.json")}
    themes = load("theme-presets.json")
    presets = {p["id"]: p for p in themes["presets"]}
    backgrounds = {b["id"]: b["src"] for b in themes["heroBackgrounds"]}

    name = f.get("partnerName", "").strip()
    slug = slugify(f.get("slug") or name)
    page["slug"] = slug
    page["name"] = name or page["name"]
    page["vanityDomain"] = f.get("vanityDomain", "").strip().lower().removeprefix("www.")

    b = page["brand"]
    if name:
        b["partnerName"] = name
    if f.get("logoUrl"):
        b["partnerLogo"] = f["logoUrl"]
        b["partnerLogoWidth"] = int(f.get("logoWidth") or 520)
        b["partnerLogoHeight"] = int(f.get("logoIntrinsicHeight") or 119)

    t = page["theme"]
    preset = presets.get(f.get("themePreset", ""), None)
    if preset:
        t.update(preset["colors"])
        t["preset"] = preset["id"]
    if f.get("logoHeight"):
        h = int(f["logoHeight"])
        t["partnerLogoHeight"] = h
        t["partnerLogoHeightMobile"] = round(h * 0.76)
    bg = f.get("heroBackground")
    if bg:
        t["heroBg"] = backgrounds.get(bg, bg)

    tr = page["tracking"]
    embed = f.get("hubspotEmbed", "")
    if embed:
        tr["hubspotEmbed"] = embed
        m = re.search(r'data-form-id\s*=\s*["\']([^"\']+)', embed) or re.search(
            r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}", embed, re.I
        )
        if m:
            tr["hubspotFormGuid"] = m.group(1) if m.groups() else m.group(0)
        p = re.search(r'data-portal-id\s*=\s*["\'](\d+)', embed)
        if p:
            tr["hubspotPortalId"] = p.group(1)
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
            quote[k_out] = f[k_in]

    why = section(page, "why")["props"]
    if f.get("whyParagraph"):
        why["paragraphs"] = [f["whyParagraph"].strip()]

    reasons = section(page, "reasons")["props"]
    if f.get("reasonsHeadline"):
        reasons["headline"] = f["reasonsHeadline"]
    if f.get("reasons"):
        reasons["items"] = [r.strip() for r in f["reasons"] if r.strip()]
    if "reasonsSource" in f:
        reasons["source"] = f["reasonsSource"]

    guide = guides.get(f.get("guide", "wealth-guide"), guides["wealth-guide"])
    kit = section(page, "kit")["props"]
    kit.update(
        image=guide["src"],
        imageAlt=guide["alt"],
        headline=guide["headline"],
        lede=guide["lede"],
        points=list(guide["points"]),
        buttonLabel=guide["buttonLabel"],
        footnote="",
    )

    ty = page["thankYou"]
    ty["primaryUrl"] = guide["downloadUrl"]
    ty["body"] = guide["thankYouBody"]
    steward = guide["id"] == "faithful-steward"
    kit_name = "Biblical Stewardship Kit" if steward else "Gold & Silver Kit"
    guide_name = "The Faithful Steward guide" if steward else "the 2026 Wealth Protection Guide and Magazine"
    ty["seoDescription"] = (
        f"Thank you for requesting {guide_name}. Check your inbox for the download, "
        "or call Revelation Gold Group at {phone}."
    )
    mapping = {
        "thankYouStyle": "style",
        "thankYouGreetingNamed": "greetingNamed",
        "thankYouGreeting": "greeting",
        "thankYouHeadline": "headline",
        "thankYouMessage": "body",
        "thankYouNote": "note",
    }
    for k_in, k_out in mapping.items():
        if f.get(k_in):
            ty[k_out] = f[k_in]
    if name:
        ty["seoTitle"] = f"Your Kit Is On Its Way | {name} & Revelation Gold Group"

    seo = page["seo"]
    seo["ogTitle"] = f"Free {kit_name}"
    if f.get("seoTitle"):
        seo["title"] = f["seoTitle"]
    if f.get("seoDescription"):
        seo["description"] = f["seoDescription"]
        seo["ogDescription"] = f["seoDescription"]
    if name:
        seo["siteName"] = f"{name} x Revelation Gold Group"
        if "Partner Name" in seo["title"]:
            seo["title"] = f"Free {kit_name} | {name} & Revelation Gold Group"
        if "Partner Name" in seo["description"]:
            seo["description"] = seo["description"].replace("Partner Name", name)
        seo["ogDescription"] = seo["ogDescription"].replace("Partner Name", name)
    return page


def checks(page, f):
    warn = []
    text = json.dumps(page, ensure_ascii=False)
    if "—" in text or "–" in text:
        warn.append("Em or en dash found. Replace with a period or comma.")
    copy_text = " ".join(
        str(f.get(k, "")) for k in ("quote", "whyParagraph", "thankYouMessage", "seoDescription")
    ) + " " + " ".join(f.get("reasons", []))
    for pat in BANNED:
        if re.search(pat, copy_text, re.I):
            warn.append(f"Banned claim pattern in copy: {pat}")
    t = page["theme"]
    if t.get("preset") == "custom" or not f.get("themePreset"):
        warn.append("No theme preset set. Pick one from theme-presets.json (never gold or amber).")
    for k in ("hubspotEmbed", "kifloCode", "photoUrl", "logoUrl", "quote", "whyParagraph"):
        if not f.get(k):
            warn.append(f"Missing: {k}")
    return warn


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    fields = json.loads(Path(sys.argv[1]).read_text())
    page = build(fields)
    out = Path(sys.argv[2]) if len(sys.argv) > 2 else Path(f"{page['slug']}.json")
    out.write_text(json.dumps(page, indent=2, ensure_ascii=False))
    print(f"Wrote {out}")
    code = page["tracking"]["kifloPartnerCode"]
    print(f"Page link:      {SITE}/{page['slug']}")
    if code:
        print(f"Referral link:  {SITE}/{page['slug']}?kfl_ln={code}")
    for w in checks(page, fields):
        print("WARNING:", w)


if __name__ == "__main__":
    main()
