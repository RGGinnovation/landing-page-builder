import { Check, Copy, Info, Monitor, Sparkles } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

import { KIT_OPTIONS, kitOptionFor } from "@/template/kits";
import { parseHubspotEmbed, isGuid } from "@/template/hubspot";
import { SECTIONS } from "@/template/registry";
import {
  HERO_BACKGROUNDS,
  THEME_PRESETS,
  accentShades,
  applyPreset,
  bandShades,
  isGoldHue,
} from "@/template/theme";
import type { PageConfig, Section, SectionOf, SectionType, ThemeConfig } from "@/template/types";

import type { GroupId, Issue } from "./checks";
import {
  Field,
  Group,
  ImageUpload,
  Pill,
  RegenerateButton,
  Segmented,
  Select,
  SmallButton,
  TextArea,
  TextInput,
  Toggle,
} from "./fields";
import { FieldEditor } from "./FieldEditor";
import type { Path } from "./path";
import { accessToken } from "./auth";
import { regenerateParagraph } from "./regenerate.functions";
import { rephraseOffline } from "./rephrase";

interface Props {
  cfg: PageConfig;
  update: (path: Path, value: unknown) => void;
  replace: (next: PageConfig) => void;
  open: Set<GroupId>;
  toggle: (id: GroupId) => void;
  issues: Issue[];
  siteUrl: string;
  /** Applies a new slug (renames the page). Resolves false if it failed. */
  onSlugCommit: (slug: string) => Promise<boolean>;
  onFocusSection: (sectionType: SectionType | "thankyou") => void;
}

function sectionIndex(cfg: PageConfig, type: SectionType) {
  return cfg.sections.findIndex((s) => s.type === type);
}

function sectionOf<K extends SectionType>(cfg: PageConfig, type: K) {
  return cfg.sections.find((s) => s.type === type) as SectionOf<K> | undefined;
}

function IssueBadge({ issues, id }: { issues: Issue[]; id: GroupId }) {
  const mine = issues.filter((i) => i.target === id);
  if (!mine.length) return null;
  const errors = mine.filter((i) => i.level === "error").length;
  return (
    <Pill tone={errors ? "charcoal" : "muted"}>
      {errors ? `${errors} to fix` : `${mine.length} note`}
    </Pill>
  );
}

function IssueList({ issues, id }: { issues: Issue[]; id: GroupId }) {
  const mine = issues.filter((i) => i.target === id);
  if (!mine.length) return null;
  return (
    <ul className="space-y-1 rounded-lg bg-[#f5f5f5] px-3 py-2.5">
      {mine.map((i, n) => (
        <li key={n} className="flex items-start gap-2 text-[12px] text-[#1a1a1a]">
          <span
            className={
              "mt-1.5 size-1.5 shrink-0 rounded-full " +
              (i.level === "error" ? "bg-[#1a1a1a]" : "bg-[#9a9a9a]")
            }
          />
          {i.message}
        </li>
      ))}
    </ul>
  );
}

export function Form(p: Props) {
  const { cfg, update, issues, open, toggle } = p;
  const g = (
    id: GroupId,
    title: string,
    subtitle: string,
    children: ReactNode,
    focus?: SectionType | "thankyou",
  ) => (
    <Group
      id={id}
      title={title}
      subtitle={subtitle}
      open={open.has(id)}
      onToggle={() => {
        toggle(id);
        if (!open.has(id) && focus) p.onFocusSection(focus);
      }}
      badge={<IssueBadge issues={issues} id={id} />}
    >
      <IssueList issues={issues} id={id} />
      {children}
    </Group>
  );

  return (
    <div>
      {g(
        "basic",
        "Basic info",
        "Partner name, page link and vanity domain",
        <BasicInfo {...p} />,
        "hero",
      )}
      {g("photos", "Logo & photo", "Top-left logo and the hero photo", <Photos {...p} />, "hero")}
      {g(
        "form",
        "Lead form & tracking",
        "HubSpot form code and Kiflo referral code",
        <FormTracking {...p} />,
        "hero",
      )}
      {g(
        "quote",
        "Quote & signature",
        "The endorsement under the hero",
        <QuoteGroup {...p} />,
        "quote",
      )}
      {g(
        "why",
        "Why I Believe",
        "Regenerate so no two partner pages read the same",
        <WhyGroup {...p} />,
        "why",
      )}
      {g(
        "guide",
        "Free guide image",
        "Pick the magazine shown in the free kit section",
        <GuideGroup {...p} />,
        "kit",
      )}
      {g("theme", "Theme", "Match the partner's colors and vibe", <ThemeGroup {...p} />, "hero")}
      {g(
        "thankyou",
        "Thank-you page",
        "What people see after they submit",
        <ThankYouGroup {...p} />,
        "thankyou",
      )}
      {g("advanced", "Advanced", "SEO, section visibility and template copy", <Advanced {...p} />)}
      <div className="px-6 py-8 text-center text-[11.5px] text-[#9a9a9a]">
        Everything not listed above is fixed by the RGG template.
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function BasicInfo({ cfg, update, siteUrl, onSlugCommit, replace }: Props) {
  const [slug, setSlug] = useState(cfg.slug);
  const [lastCfgSlug, setLastCfgSlug] = useState(cfg.slug);
  if (lastCfgSlug !== cfg.slug) {
    setLastCfgSlug(cfg.slug);
    setSlug(cfg.slug);
  }
  const url = `${siteUrl}/${cfg.slug}`;
  const cleaned = slug
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const dirty = cleaned !== cfg.slug;

  return (
    <>
      <Field
        label="Partner name"
        required
        help="Shown in the disclosure, alt text and page titles."
      >
        <TextInput
          value={cfg.brand.partnerName}
          onChange={(v) => replace({ ...cfg, name: v, brand: { ...cfg.brand, partnerName: v } })}
          placeholder="e.g. IBTV Faith Network"
        />
      </Field>
      <Field
        label="Page link"
        required
        help={
          dirty ? (
            <span className="flex items-center gap-2">
              <span>
                Changing the link breaks the old one. Update the vanity domain redirect after.
              </span>
            </span>
          ) : (
            "This is the public link. The partner's vanity domain redirects here."
          )
        }
        aside={
          !dirty && (
            <span className="flex gap-1">
              <button
                type="button"
                className="inline-flex items-center gap-1 text-[11.5px] font-medium text-[#072b4e] hover:underline"
                onClick={() => {
                  void navigator.clipboard.writeText(url);
                  toast.success("Link copied");
                }}
              >
                <Copy className="size-3" /> Copy
              </button>
            </span>
          )
        }
      >
        <div className="flex gap-2">
          <div className="min-w-0 flex-1">
            <TextInput
              prefix={siteUrl.replace(/^https?:\/\//, "") + "/"}
              value={slug}
              onChange={setSlug}
            />
          </div>
          {dirty && (
            <SmallButton
              onClick={async () => {
                if (!cleaned) return;
                const ok = await onSlugCommit(cleaned);
                if (!ok) setSlug(cfg.slug);
              }}
            >
              <Check className="size-3.5" /> Save link
            </SmallButton>
          )}
        </div>
      </Field>
      <Field
        label="Vanity domain"
        help={
          <>
            The domain we buy for the partner, e.g. <b>SmedleyMetals.com</b>. At the registrar, set
            a 301 redirect from it (and www.) to <b className="break-all">{url}</b>.
          </>
        }
      >
        <TextInput
          value={cfg.vanityDomain}
          onChange={(v) => update(["vanityDomain"], v)}
          placeholder="LastNameMetals.com"
        />
      </Field>
    </>
  );
}

/* ------------------------------------------------------------------ */

function Photos({ cfg, update, replace }: Props) {
  const hi = sectionIndex(cfg, "hero");
  const hero = sectionOf(cfg, "hero");
  return (
    <>
      <Field
        label="Partner logo"
        required
        help="Top left, next to the RGG wordmark. Light logo on transparent works best."
      >
        <ImageUpload
          dark
          value={cfg.brand.partnerLogo}
          hint="PNG, WebP or SVG"
          onChange={(src, size) =>
            replace({
              ...cfg,
              brand: {
                ...cfg.brand,
                partnerLogo: src,
                ...(size ? { partnerLogoWidth: size.w, partnerLogoHeight: size.h } : {}),
              },
            })
          }
        />
      </Field>
      <Field
        label="Logo size"
        aside={
          <span className="text-[11.5px] tabular-nums text-[#6b6b6b]">
            {cfg.theme.partnerLogoHeight}px tall
          </span>
        }
      >
        <input
          type="range"
          min={20}
          max={72}
          step={1}
          value={cfg.theme.partnerLogoHeight}
          onChange={(e) => {
            const h = Number(e.target.value);
            replace({
              ...cfg,
              theme: {
                ...cfg.theme,
                partnerLogoHeight: h,
                partnerLogoHeightMobile: Math.round(h * 0.76),
              },
            });
          }}
          className="w-full accent-[#072b4e]"
        />
      </Field>
      {hero && (
        <Field
          label="Partner photo"
          required
          help="Hero section, left of the form. A cut-out (transparent background) portrait, about 820px wide."
        >
          <ImageUpload
            value={hero.props.image}
            hint="transparent PNG or WebP"
            onChange={(src, size) => {
              const props = {
                ...hero.props,
                image: src,
                ...(size ? { imageWidth: size.w, imageHeight: size.h } : {}),
              };
              update(["sections", hi, "props"], props);
            }}
          />
        </Field>
      )}
      {hero && (
        <Field label="Photo description" help="Alt text for screen readers and search.">
          <TextInput
            value={hero.props.imageAlt}
            onChange={(v) => update(["sections", hi, "props", "imageAlt"], v)}
            placeholder="Karon Smedley, co-founder of IBTV Faith Network"
          />
        </Field>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */

function FormTracking({ cfg, replace, update }: Props) {
  const t = cfg.tracking;
  const ok = isGuid(t.hubspotFormGuid) && /^\d+$/.test(t.hubspotPortalId);
  return (
    <>
      <Field
        label="HubSpot form embed code"
        required
        help="HubSpot → Marketing → Forms → the partner's form → Share → Embed code. Paste it as is."
      >
        <TextArea
          mono
          rows={4}
          value={t.hubspotEmbed}
          placeholder={
            '<script src="https://js.hsforms.net/forms/embed/44817109.js" defer></script>\n<div class="hs-form-frame" data-region="na1" data-form-id="…" data-portal-id="44817109"></div>'
          }
          onChange={(v) => {
            const ids = parseHubspotEmbed(v);
            replace({
              ...cfg,
              tracking: {
                ...t,
                hubspotEmbed: v,
                hubspotFormGuid: ids.formId ?? (v.trim() ? t.hubspotFormGuid : ""),
                hubspotPortalId: ids.portalId ?? t.hubspotPortalId,
                hubspotRegion: ids.region ?? t.hubspotRegion,
              },
            });
          }}
        />
      </Field>
      <div
        className={
          "flex items-start gap-2 rounded-lg px-3 py-2.5 text-[12px] " +
          (ok ? "bg-[#072b4e]/[0.06] text-[#072b4e]" : "bg-[#f5f5f5] text-[#5c5c5c]")
        }
      >
        {ok ? (
          <Check className="mt-0.5 size-3.5 shrink-0" />
        ) : (
          <Info className="mt-0.5 size-3.5 shrink-0" />
        )}
        <div className="min-w-0">
          {ok ? (
            <>
              Connected. Portal <b>{t.hubspotPortalId}</b> · Form{" "}
              <b className="font-mono text-[11px]">{t.hubspotFormGuid}</b> ·{" "}
              {t.hubspotRegion || "na1"}
            </>
          ) : (
            "No form id found yet. Paste the full embed code, or just the form id."
          )}
        </div>
      </div>
      <Field
        label="Form style"
        help={
          t.formMode === "styled"
            ? "Recommended. The template's own form posts straight into this HubSpot form, sends the lead to Kiflo, and opens the thank-you page with the visitor's first name."
            : "HubSpot's own form in the form column. Set its redirect in HubSpot if you use this; the page still creates the Kiflo lead on success."
        }
      >
        <Segmented
          value={t.formMode}
          onChange={(v) => update(["tracking", "formMode"], v)}
          options={[
            { value: "styled", label: "RGG styled form" },
            { value: "embed", label: "HubSpot embed" },
          ]}
        />
      </Field>
      <Field
        label="Kiflo referral code"
        required
        help="The partner's referral code in Kiflo. Vanity-domain visitors have no ?kfl_ln= link, so this code is what credits the lead to the partner. The Kiflo tracking script loads on every page automatically."
      >
        <TextInput
          value={t.kifloPartnerCode}
          onChange={(v) => update(["tracking", "kifloPartnerCode"], v.trim())}
          placeholder="e.g. karon-smedley"
          mono
        />
      </Field>
      <Toggle
        checked={t.debug}
        onChange={(v) => update(["tracking", "debug"], v)}
        label="Console debug logging"
        help="Logs the HubSpot and Kiflo calls in the browser console. Leave off for live pages."
      />
    </>
  );
}

/* ------------------------------------------------------------------ */

function QuoteGroup({ cfg, update }: Props) {
  const qi = sectionIndex(cfg, "quote");
  const q = sectionOf(cfg, "quote");
  if (!q) return <p className="text-[12px] text-[#6b6b6b]">This page has no quote section.</p>;
  return (
    <>
      <Field
        label="Quote"
        required
        help="The partner's own words. Quote marks are added automatically."
      >
        <TextArea
          rows={4}
          value={q.props.quote}
          onChange={(v) => update(["sections", qi, "props", "quote"], v)}
        />
      </Field>
      <Field label="Signature name" required help="Rendered in the script signature font.">
        <TextInput
          value={q.props.name}
          onChange={(v) => update(["sections", qi, "props", "name"], v)}
          placeholder="Karon Smedley"
        />
      </Field>
      <Field label="Title under the signature">
        <TextInput
          value={q.props.role}
          onChange={(v) => update(["sections", qi, "props", "role"], v)}
          placeholder="Co-Founder, IBTV Faith Network"
        />
      </Field>
    </>
  );
}

/* ------------------------------------------------------------------ */

function WhyGroup({ cfg, update }: Props) {
  const wi = sectionIndex(cfg, "why");
  const w = sectionOf(cfg, "why");
  const [busy, setBusy] = useState<Set<number>>(new Set());
  const [source, setSource] = useState<Record<number, string>>({});
  if (!w)
    return <p className="text-[12px] text-[#6b6b6b]">This page has no Why I Believe section.</p>;
  const paragraphs = w.props.paragraphs;

  async function regenerate(indexes: number[]) {
    setBusy(new Set(indexes));
    let next = [...paragraphs];
    const labels: Record<number, string> = {};
    const token = await accessToken();
    await Promise.all(
      indexes.map(async (i) => {
        const text = paragraphs[i] ?? "";
        try {
          const r = await regenerateParagraph({
            data: {
              text,
              partnerName: cfg.brand.partnerName,
              siblings: paragraphs.filter((_, j) => j !== i),
              accessToken: token,
            },
          });
          next[i] = r.text;
          labels[i] =
            r.source === "ai" ? "AI rewrite" : r.source === "library" ? "Approved alternate" : "";
          if (r.note) toast.message(r.note);
        } catch (e) {
          // Server unreachable (or not signed in): fall back to the approved library in the browser.
          const off = rephraseOffline(text);
          next[i] = off.text;
          labels[i] = off.changed ? "Approved alternate" : "";
          if (!off.changed) toast.error((e as Error).message);
        }
      }),
    );
    next = next.map((s) => s ?? "");
    update(["sections", wi, "props", "paragraphs"], next);
    setSource((s) => ({ ...s, ...labels }));
    setBusy(new Set());
  }

  return (
    <>
      <Field label="Headline">
        <TextArea
          rows={2}
          value={w.props.headline}
          onChange={(v) => update(["sections", wi, "props", "headline"], v)}
        />
      </Field>
      <div className="flex items-center justify-between rounded-lg bg-[#f5f5f5] px-3 py-2">
        <div className="flex items-center gap-2 text-[12px] text-[#1a1a1a]">
          <Sparkles className="size-3.5 text-[#072b4e]" />
          Lightly rewrites the copy. Facts and ratings stay the same.
        </div>
        <RegenerateButton
          busy={busy.size > 1}
          label="Regenerate all"
          onClick={() => void regenerate(paragraphs.map((_, i) => i))}
        />
      </div>
      {paragraphs.map((text, i) => (
        <Field
          key={i}
          label={`Paragraph ${i + 1}`}
          aside={
            <span className="flex items-center gap-2">
              {source[i] && <span className="text-[11px] text-[#6b6b6b]">{source[i]}</span>}
              <RegenerateButton busy={busy.has(i)} onClick={() => void regenerate([i])} />
            </span>
          }
          help={
            i === paragraphs.length - 1
              ? "**bold** marks the highlighted phrases. Undo (Ctrl/Cmd+Z) reverts a regenerate."
              : undefined
          }
        >
          <TextArea
            rows={4}
            value={text}
            onChange={(v) =>
              update(
                ["sections", wi, "props", "paragraphs"],
                paragraphs.map((x, j) => (j === i ? v : x)),
              )
            }
          />
        </Field>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */

function GuideGroup({ cfg, update }: Props) {
  const ki = sectionIndex(cfg, "kit");
  const k = sectionOf(cfg, "kit");
  if (!k) return <p className="text-[12px] text-[#6b6b6b]">This page has no free guide section.</p>;
  const current = kitOptionFor(k.props.image);
  return (
    <>
      <Field label="Guide" help="Swap or add guide images in src/template/kits.ts.">
        <Select
          value={current?.id ?? "__custom"}
          onChange={(id) => {
            const opt = KIT_OPTIONS.find((o) => o.id === id);
            if (opt)
              update(["sections", ki, "props"], { ...k.props, image: opt.src, imageAlt: opt.alt });
          }}
          options={[
            ...KIT_OPTIONS.map((o) => ({ value: o.id, label: o.label })),
            ...(current ? [] : [{ value: "__custom", label: "Custom image (Advanced)" }]),
          ]}
        />
      </Field>
      <div className="overflow-hidden rounded-xl border border-[#e3e3e3] bg-[#f7f7f7] p-3">
        <img src={k.props.image} alt="" className="mx-auto max-h-44 object-contain" />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */

function Swatch({ band, accent }: { band: string; accent: string }) {
  return (
    <div className="relative h-12 w-full overflow-hidden rounded-md" style={{ background: band }}>
      <div
        className="absolute bottom-2 left-2 h-3 w-10 rounded-sm"
        style={{ background: accent }}
      />
      <div className="absolute right-2 top-2 h-1.5 w-6 rounded-full bg-white/70" />
    </div>
  );
}

function ColorRow(p: { label: string; value: string; onChange: (v: string) => void }) {
  const valid = /^#[0-9a-f]{6}$/i.test(p.value);
  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        aria-label={p.label}
        className="h-9 w-10 shrink-0 cursor-pointer rounded-md border border-[#d6d6d6] bg-white p-0.5"
        value={valid ? p.value : "#000000"}
        onChange={(e) => p.onChange(e.target.value.toUpperCase())}
      />
      <div className="min-w-0 flex-1 text-[12.5px] font-medium text-[#1a1a1a]">{p.label}</div>
      <input
        className="h-9 w-28 rounded-md border border-[#d6d6d6] px-2 font-mono text-[12px] outline-none focus:border-[#072b4e]"
        value={p.value}
        onChange={(e) => {
          const v = e.target.value.trim();
          if (/^#[0-9a-f]{6}$/i.test(v)) p.onChange(v.toUpperCase());
        }}
      />
    </div>
  );
}

function ThemeGroup({ cfg, replace }: Props) {
  const t = cfg.theme;
  const set = (patch: Partial<ThemeConfig>) => replace({ ...cfg, theme: { ...t, ...patch } });
  const bg = HERO_BACKGROUNDS.find((b) => b.src === t.heroBg)?.id ?? "custom";
  return (
    <>
      <div className="grid grid-cols-2 gap-2.5">
        {THEME_PRESETS.map((pr) => {
          const active = t.preset === pr.id;
          return (
            <button
              key={pr.id}
              type="button"
              onClick={() => replace({ ...cfg, theme: applyPreset(t, pr) })}
              className={
                "rounded-xl border p-2 text-left transition-all " +
                (active
                  ? "border-[#072b4e] ring-2 ring-[#072b4e]/20"
                  : "border-[#e3e3e3] hover:border-[#b5b5b5]")
              }
            >
              <Swatch band={pr.colors.navyDeep} accent={pr.colors.accent} />
              <div className="mt-2 flex items-center gap-1 text-[12.5px] font-semibold text-[#1a1a1a]">
                {pr.name}
                {active && <Check className="size-3.5 text-[#072b4e]" />}
              </div>
              <div className="text-[11px] leading-tight text-[#6b6b6b]">{pr.vibe}</div>
            </button>
          );
        })}
      </div>
      <div className="space-y-2.5 rounded-xl border border-[#e3e3e3] p-3">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6b6b6b]">
          Custom {t.preset === "custom" && <span className="text-[#072b4e]">· active</span>}
        </div>
        <ColorRow
          label="Accent (buttons, rules)"
          value={t.accent}
          onChange={(v) => set({ ...accentShades(v), preset: "custom" })}
        />
        <ColorRow
          label="Dark band (hero, bars)"
          value={t.navy}
          onChange={(v) => set({ ...bandShades(v), preset: "custom" })}
        />
        {isGoldHue(t.accent) && (
          <p className="text-[11.5px] text-[#1a1a1a]">
            That accent reads as gold or amber. Brand rule: no gold. Publishing is blocked until it
            changes.
          </p>
        )}
      </div>
      <Field label="Hero background">
        <Segmented
          value={bg as "flag" | "sunrise" | "none" | "custom"}
          onChange={(id) => {
            const b = HERO_BACKGROUNDS.find((x) => x.id === id);
            if (b) set({ heroBg: b.src });
          }}
          options={HERO_BACKGROUNDS.map((b) => ({
            value: b.id as "flag" | "sunrise" | "none",
            label: b.label,
          }))}
        />
      </Field>
    </>
  );
}

/* ------------------------------------------------------------------ */

function ThankYouGroup({ cfg, update }: Props) {
  const ty = cfg.thankYou;
  const set = (k: keyof typeof ty, v: unknown) => update(["thankYou", k], v);
  const hero = sectionOf(cfg, "hero");
  const quote = sectionOf(cfg, "quote");
  return (
    <>
      <Field label="Layout">
        <Segmented
          value={ty.style}
          onChange={(v) => set("style", v)}
          options={[
            { value: "portrait", label: "Photo + message" },
            { value: "dark", label: "Centered dark" },
            { value: "light", label: "Centered light" },
          ]}
        />
      </Field>
      {ty.style === "portrait" && (
        <Field
          label="Photo"
          help={ty.photo ? undefined : "Using the hero photo. Upload to use a different one."}
        >
          <ImageUpload
            value={ty.photo || hero?.props.image || ""}
            hint="transparent PNG or WebP"
            onChange={(src) => set("photo", src)}
            {...(ty.photo ? { onClear: () => set("photo", ""), clearLabel: "Use hero photo" } : {})}
          />
        </Field>
      )}
      <Field label="Greeting with first name" help="{firstName} is filled from the form.">
        <TextInput value={ty.greetingNamed} onChange={(v) => set("greetingNamed", v)} />
      </Field>
      <Field label="Greeting without a name">
        <TextInput value={ty.greeting} onChange={(v) => set("greeting", v)} />
      </Field>
      <Field label="Headline">
        <TextInput value={ty.headline} onChange={(v) => set("headline", v)} />
      </Field>
      <Field label="Message">
        <TextArea rows={4} value={ty.body} onChange={(v) => set("body", v)} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Button label" help="Blank hides it.">
          <TextInput value={ty.primaryLabel} onChange={(v) => set("primaryLabel", v)} />
        </Field>
        <Field label="Button link">
          <TextInput value={ty.primaryUrl} onChange={(v) => set("primaryUrl", v)} />
        </Field>
      </div>
      <Toggle
        checked={ty.showCallButton}
        onChange={(v) => set("showCallButton", v)}
        label="Show call button"
      />
      {ty.style === "portrait" && (
        <>
          <Toggle
            checked={ty.showSignature}
            onChange={(v) => set("showSignature", v)}
            label="Partner signature"
            help="Script signature under the message."
          />
          {ty.showSignature && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Signature name">
                <TextInput
                  value={ty.signatureName}
                  onChange={(v) => set("signatureName", v)}
                  placeholder={quote?.props.name ?? ""}
                />
              </Field>
              <Field label="Title">
                <TextInput
                  value={ty.signatureRole}
                  onChange={(v) => set("signatureRole", v)}
                  placeholder={quote?.props.role ?? ""}
                />
              </Field>
            </div>
          )}
        </>
      )}
      <Field label="Small note">
        <TextInput value={ty.note} onChange={(v) => set("note", v)} />
      </Field>
    </>
  );
}

/* ------------------------------------------------------------------ */

const ADVANCED_SEO = [
  { key: "title", label: "Page title" },
  { key: "description", label: "Meta description", area: true },
  { key: "ogImage", label: "Social share image URL" },
] as const;

function Advanced({ cfg, update, replace }: Props) {
  const [openSection, setOpenSection] = useState<string | null>(null);
  return (
    <>
      <div className="space-y-4">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6b6b6b]">
          Search & sharing
        </div>
        {ADVANCED_SEO.map((f) => (
          <Field key={f.key} label={f.label}>
            {"area" in f ? (
              <TextArea
                rows={3}
                value={cfg.seo[f.key]}
                onChange={(v) => update(["seo", f.key], v)}
              />
            ) : (
              <TextInput value={cfg.seo[f.key]} onChange={(v) => update(["seo", f.key], v)} />
            )}
          </Field>
        ))}
        <Field label="Search engines">
          <Segmented
            value={cfg.seo.robots.startsWith("noindex") ? "noindex,follow" : "index,follow"}
            onChange={(v) => update(["seo", "robots"], v)}
            options={[
              { value: "index,follow", label: "Allow indexing" },
              { value: "noindex,follow", label: "Hide from search" },
            ]}
          />
        </Field>
      </div>
      <div className="space-y-2">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6b6b6b]">
          Sections
        </div>
        <p className="text-[11.5px] text-[#6b6b6b]">
          Template copy shared by every page. Change it only when this partner needs something
          different.
        </p>
        {cfg.sections.map((s: Section, i) => {
          const def = SECTIONS[s.type];
          const isOpen = openSection === s.id;
          return (
            <div key={s.id} className="rounded-lg border border-[#e3e3e3]">
              <div className="flex items-center gap-2 px-3 py-2">
                <button
                  type="button"
                  className="min-w-0 flex-1 truncate text-left text-[12.5px] font-medium text-[#1a1a1a]"
                  onClick={() => setOpenSection(isOpen ? null : s.id)}
                >
                  {def.label}
                </button>
                {!def.pinned && s.type !== "hero" && (
                  <Toggle
                    checked={!s.hidden}
                    onChange={(v) =>
                      replace({
                        ...cfg,
                        sections: cfg.sections.map((x) =>
                          x.id === s.id ? ({ ...x, hidden: !v } as Section) : x,
                        ),
                      })
                    }
                    label=""
                  />
                )}
              </div>
              {isOpen && (
                <div className="border-t border-[#e3e3e3] p-3">
                  <FieldEditor
                    fields={def.fields}
                    value={s.props}
                    base={["sections", i, "props"]}
                    onChange={update}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="space-y-3">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6b6b6b]">
          RGG contact
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Phone (display)">
            <TextInput
              value={cfg.brand.phoneDisplay}
              onChange={(v) => update(["brand", "phoneDisplay"], v)}
            />
          </Field>
          <Field label="Phone (dial)">
            <TextInput
              value={cfg.brand.phoneE164}
              onChange={(v) => update(["brand", "phoneE164"], v)}
            />
          </Field>
        </div>
      </div>
      <p className="flex items-center gap-1.5 text-[11.5px] text-[#6b6b6b]">
        <Monitor className="size-3.5" /> Tip: click any part of the preview to jump to its fields.
      </p>
    </>
  );
}
