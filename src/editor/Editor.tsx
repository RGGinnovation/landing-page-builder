import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  AlertTriangle,
  ChevronDown,
  Copy,
  Download,
  ExternalLink,
  Eye,
  LogOut,
  Monitor,
  MoreHorizontal,
  Plus,
  Redo2,
  Search,
  Smartphone,
  Trash2,
  Undo2,
  Upload,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Toaster } from "@/components/ui/sonner";
import { PAGES } from "@/content/pages";
import { createBasePage } from "@/content/pages/base";
import { migrate } from "@/data/migrate";
import { publicSiteUrl, RESERVED_SLUGS } from "@/template/constants";
import type { PageConfig, SectionType } from "@/template/types";

import { signOut, useAuth } from "./auth";
import { checkPage, type GroupId } from "./checks";
import { Segmented, TextInput, UploadContext, Field } from "./fields";
import { Form } from "./Form";
import { Login, NoAccess } from "./Login";
import { setAt, type Path } from "./path";
import { isFromPreview, type ToPreview } from "./protocol";
import {
  isPageConfig,
  samePage,
  slugify,
  statusOf,
  store,
  type PageRecord,
  type PageStatus,
} from "./store";
import { useHistory } from "./useHistory";

type Device = "desktop" | "mobile";
const DEVICE_W: Record<Device, number> = { desktop: 1280, mobile: 390 };

/** Preview click (section type) -> editor group. */
const SECTION_GROUP: Partial<Record<SectionType | "thankyou", GroupId>> = {
  topbar: "photos",
  hero: "photos",
  quote: "quote",
  why: "why",
  kit: "guide",
  thankyou: "thankyou",
};

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

export function Editor() {
  const auth = useAuth();
  if (auth.status === "loading") return <Splash text="Loading…" />;
  if (auth.status === "signed-out") return <Login />;
  if (auth.status === "signed-in" && !auth.editor)
    return <NoAccess email={auth.session.user.email ?? ""} />;
  const email = auth.status === "signed-in" ? (auth.session.user.email ?? "") : "";
  return <Workspace email={email} />;
}

function Splash({ text }: { text: string }) {
  return (
    <div className="flex h-screen items-center justify-center bg-[#ebebeb] text-[13px] text-[#5c5c5c]">
      {text}
    </div>
  );
}

function StatusDot({ status }: { status: PageStatus }) {
  const cls =
    status === "published"
      ? "bg-[#072b4e]"
      : status === "changed"
        ? "border-2 border-[#072b4e] bg-white"
        : "border-2 border-[#9a9a9a] bg-white";
  return <span className={`inline-block size-2 shrink-0 rounded-full ${cls}`} />;
}

const STATUS_LABEL: Record<PageStatus, string> = {
  published: "Published",
  changed: "Unpublished changes",
  draft: "Draft",
};

function Workspace({ email }: { email: string }) {
  const search = useSearch({ from: "/admin" });
  const navigate = useNavigate({ from: "/admin" });
  const [records, setRecords] = useState<PageRecord[]>([]);
  const [loaded, setLoaded] = useState(false);
  const h = useHistory<PageConfig | null>(null);
  const cfg = h.value;
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">("saved");
  const [openGroups, setOpenGroups] = useState<Set<GroupId>>(new Set(["basic", "photos"]));
  const [device, setDevice] = useState<Device>("desktop");
  const [view, setView] = useState<"landing" | "thankyou">("landing");
  const [selectedSid, setSelectedSid] = useState<string | null>(null);
  const [scrollReq, setScrollReq] = useState<{ id: string; n: number } | null>(null);
  const [filter, setFilter] = useState("");
  const [newOpen, setNewOpen] = useState<null | { source: string }>(null);
  const [publishing, setPublishing] = useState(false);
  const [blockers, setBlockers] = useState<string[] | null>(null);
  const loadedSlug = useRef<string | null>(null);
  const siteUrl = publicSiteUrl();

  const current = records.find((r) => r.slug === cfg?.slug);

  /* ---------------- load ---------------- */

  const openPage = useCallback(
    (r: PageRecord | undefined) => {
      if (!r) return;
      loadedSlug.current = r.slug;
      h.reset(clone(r.draft));
      setView("landing");
      void navigate({ search: { page: r.slug }, replace: true });
    },
    [h, navigate],
  );

  useEffect(() => {
    (async () => {
      try {
        const list = await store.list();
        setRecords(list);
        openPage(list.find((r) => r.slug === search.page) ?? list[0]);
      } catch (e) {
        toast.error((e as Error).message);
      } finally {
        setLoaded(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- autosave ---------------- */

  useEffect(() => {
    if (!cfg || cfg.slug !== loadedSlug.current) return;
    const rec = records.find((r) => r.slug === cfg.slug);
    if (rec && samePage(rec.draft, cfg)) return;
    setSaveState("saving");
    const t = setTimeout(async () => {
      try {
        await store.saveDraft(cfg);
        setSaveState("saved");
        setRecords((rs) =>
          rs.map((r) =>
            r.slug === cfg.slug
              ? { ...r, name: cfg.name, draft: cfg, updatedAt: new Date().toISOString() }
              : r,
          ),
        );
      } catch (e) {
        setSaveState("error");
        toast.error((e as Error).message);
      }
    }, 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg]);

  /* ---------------- editing ---------------- */

  const update = useCallback(
    (path: Path, value: unknown) => {
      if (!cfg) return;
      h.set(setAt(cfg, path, value), path.join("."));
    },
    [cfg, h],
  );
  const replace = useCallback((next: PageConfig) => h.set(next, "replace"), [h]);

  function toggleGroup(id: GroupId) {
    setOpenGroups((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  function focusGroup(id: GroupId) {
    setOpenGroups((s) => new Set(s).add(id));
    requestAnimationFrame(() =>
      document
        .getElementById(`group-${id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }

  function focusSection(type: SectionType | "thankyou") {
    if (!cfg) return;
    if (type === "thankyou") {
      setView("thankyou");
      setSelectedSid("thankyou");
      return;
    }
    setView("landing");
    const s = cfg.sections.find((x) => x.type === type);
    if (s) {
      setSelectedSid(s.id);
      setScrollReq({ id: s.id, n: Date.now() });
    }
  }

  /* ---------------- pages ---------------- */

  const uploader = useCallback(
    (file: File) => store.uploadImage(file, cfg?.slug ?? "misc"),
    [cfg?.slug],
  );

  async function createPage(name: string, slug: string, source: string) {
    const from =
      source === "__base"
        ? createBasePage()
        : clone(records.find((r) => r.slug === source)?.draft ?? createBasePage());
    // A copy keeps the design and copy, never the source partner's form, Kiflo code or domain:
    // those would credit leads to the wrong partner.
    const page: PageConfig = migrate({
      ...from,
      slug,
      name,
      vanityDomain: "",
      brand: { ...from.brand, partnerName: name },
      tracking: { ...from.tracking, hubspotEmbed: "", hubspotFormGuid: "", kifloPartnerCode: "" },
    });
    await store.create(page);
    const list = await store.list();
    setRecords(list);
    openPage(list.find((r) => r.slug === slug));
    setOpenGroups(new Set(["basic", "photos"]));
    toast.success(`Created “${name}”`);
  }

  async function loadSamples() {
    try {
      for (const p of PAGES) await store.create(migrate(clone(p)));
      const list = await store.list();
      setRecords(list);
      openPage(list[0]);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function commitSlug(slug: string): Promise<boolean> {
    if (!cfg || slug === cfg.slug) return true;
    if (RESERVED_SLUGS.has(slug)) {
      toast.error(`“/${slug}” is reserved.`);
      return false;
    }
    if (records.some((r) => r.slug === slug)) {
      toast.error("Another page already uses that link.");
      return false;
    }
    if (
      current?.published &&
      !window.confirm(`The live link /${cfg.slug} will stop working. Change it to /${slug}?`)
    )
      return false;
    try {
      const next = { ...cfg, slug };
      await store.rename(cfg.slug, next);
      const list = await store.list();
      setRecords(list);
      openPage(list.find((r) => r.slug === slug));
      toast.success(`Link changed to /${slug}`);
      return true;
    } catch (e) {
      toast.error((e as Error).message);
      return false;
    }
  }

  async function publish() {
    if (!cfg) return;
    const errors = checkPage(cfg).filter((i) => i.level === "error");
    if (errors.length) {
      setBlockers(errors.map((e) => e.message));
      return;
    }
    setPublishing(true);
    try {
      const rec = await store.publish(cfg);
      setRecords((rs) => rs.map((r) => (r.slug === rec.slug ? rec : r)));
      setSaveState("saved");
      if (store.mode === "cloud") toast.success(`Live at ${siteUrl}/${cfg.slug}`);
      else
        toast.message("Marked published in this browser. Turn on Lovable Cloud to put pages live.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setPublishing(false);
    }
  }

  async function unpublish() {
    if (!cfg || !window.confirm(`Take ${siteUrl}/${cfg.slug} offline?`)) return;
    await store.unpublish(cfg.slug);
    setRecords(await store.list());
    toast.success("Unpublished");
  }

  async function remove() {
    if (!cfg || !window.confirm(`Delete “${cfg.name}”? This cannot be undone.`)) return;
    await store.remove(cfg.slug);
    const list = await store.list();
    setRecords(list);
    if (list[0]) openPage(list[0]);
    else h.reset(null);
  }

  function exportJson() {
    if (!cfg) return;
    const blob = new Blob([JSON.stringify(cfg, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${cfg.slug}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const importRef = useRef<HTMLInputElement>(null);
  async function importJson(file: File | undefined) {
    if (!file) return;
    try {
      const data: unknown = JSON.parse(await file.text());
      if (!isPageConfig(data)) throw new Error("That file is not a partner page export.");
      let slug = data.slug;
      let n = 2;
      while (records.some((r) => r.slug === slug)) slug = `${data.slug}-${n++}`;
      await store.create(migrate({ ...data, slug }));
      const list = await store.list();
      setRecords(list);
      openPage(list.find((r) => r.slug === slug));
      toast.success(`Imported “${data.name}”`);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  /* ---------------- keyboard ---------------- */

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement;
      if (t.closest("input,textarea,select,[contenteditable]")) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) h.redo();
        else h.undo();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [h]);

  /* ---------------- preview wiring ---------------- */

  const frameRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    function onMsg(e: MessageEvent) {
      if (e.origin !== window.location.origin || !isFromPreview(e.data)) return;
      if (e.data.type === "rgg:ready") setReady(true);
      if (e.data.type === "rgg:select") {
        const id = e.data.id;
        setSelectedSid(id);
        const type =
          id === "thankyou"
            ? "thankyou"
            : (cfgRef.current?.sections.find((s) => s.id === id)?.type ?? null);
        const group = type ? (SECTION_GROUP[type] ?? "advanced") : "advanced";
        focusGroup(group);
      }
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  const cfgRef = useRef(cfg);
  cfgRef.current = cfg;

  const lastScroll = useRef(0);
  useEffect(() => {
    if (!ready || !cfg || !frameRef.current?.contentWindow) return;
    const scroll = scrollReq && scrollReq.n !== lastScroll.current ? scrollReq.id : null;
    if (scrollReq) lastScroll.current = scrollReq.n;
    const msg: ToPreview = {
      type: "rgg:render",
      config: cfg,
      view,
      selectedId: selectedSid,
      scrollTo: scroll,
    };
    frameRef.current.contentWindow.postMessage(msg, window.location.origin);
  }, [ready, cfg, view, selectedSid, scrollReq]);

  const canvasRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 800, h: 700 });
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const ro = new ResizeObserver(
      ([en]) => en && setBox({ w: en.contentRect.width, h: en.contentRect.height }),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, [loaded]);
  const dw = DEVICE_W[device];
  const scale = Math.min(1, (box.w - 40) / dw);
  const frameH = (box.h - 40) / scale;

  const issues = useMemo(() => (cfg ? checkPage(cfg) : []), [cfg]);
  const errorCount = issues.filter((i) => i.level === "error").length;
  const status: PageStatus = current
    ? statusOf({ ...current, draft: cfg ?? current.draft })
    : "draft";
  const liveUrl = cfg ? `${siteUrl}/${cfg.slug}` : "";

  const visible = records.filter(
    (r) =>
      !filter ||
      r.name.toLowerCase().includes(filter.toLowerCase()) ||
      r.slug.includes(filter.toLowerCase()),
  );

  if (!loaded) return <Splash text="Loading partner pages…" />;

  return (
    <UploadContext.Provider value={uploader}>
      <div className="flex h-screen flex-col overflow-hidden bg-[#ebebeb] text-[#1a1a1a]">
        <Toaster position="bottom-center" />

        {/* ============ TOP BAR ============ */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[#d6d6d6] bg-white px-4">
          <div className="flex w-[244px] shrink-0 items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[#072b4e] text-[12px] font-bold tracking-wide text-white">
              RGG
            </div>
            <div className="leading-tight">
              <div className="text-[13px] font-semibold">Partner Pages</div>
              <div className="text-[10.5px] text-[#6b6b6b]">Revelation Gold Group</div>
            </div>
          </div>

          {cfg && (
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="truncate text-[14px] font-semibold">
                {cfg.name || "Untitled partner"}
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 text-[12px] text-[#5c5c5c]">
                <StatusDot status={status} />
                {STATUS_LABEL[status]}
              </span>
              <span className="shrink-0 text-[11.5px] text-[#9a9a9a]">
                {saveState === "saving"
                  ? "Saving…"
                  : saveState === "error"
                    ? "Not saved"
                    : "Draft saved"}
              </span>
            </div>
          )}
          {!cfg && <div className="flex-1" />}

          {cfg && (
            <div className="flex shrink-0 items-center gap-1.5">
              <IconBtn title="Undo (Ctrl/Cmd+Z)" disabled={!h.canUndo} onClick={h.undo}>
                <Undo2 className="size-4" />
              </IconBtn>
              <IconBtn title="Redo (Shift+Ctrl/Cmd+Z)" disabled={!h.canRedo} onClick={h.redo}>
                <Redo2 className="size-4" />
              </IconBtn>

              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#d6d6d6] px-3 text-[12.5px] font-medium hover:bg-[#f5f5f5]"
                  >
                    <AlertTriangle className="size-4" />
                    {errorCount ? `${errorCount} to fix` : "Ready"}
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-0">
                  <div className="border-b px-4 py-3 text-[13px] font-semibold">
                    Launch checklist
                  </div>
                  {issues.length === 0 && (
                    <div className="px-4 py-4 text-[12.5px] text-[#5c5c5c]">
                      All set. Ready to publish.
                    </div>
                  )}
                  <ul className="max-h-80 overflow-auto py-1">
                    {issues.map((i, n) => (
                      <li key={n}>
                        <button
                          type="button"
                          className="flex w-full items-start gap-2 px-4 py-2 text-left text-[12.5px] hover:bg-[#f5f5f5]"
                          onClick={() => focusGroup(i.target)}
                        >
                          <span
                            className={
                              "mt-1.5 size-1.5 shrink-0 rounded-full " +
                              (i.level === "error" ? "bg-[#1a1a1a]" : "bg-[#9a9a9a]")
                            }
                          />
                          <span>
                            {i.message}
                            {i.level === "warn" && (
                              <span className="text-[#9a9a9a]"> (optional)</span>
                            )}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </PopoverContent>
              </Popover>

              <a
                href={`/preview?slug=${encodeURIComponent(cfg.slug)}`}
                target="_blank"
                rel="noopener"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#d6d6d6] px-3 text-[12.5px] font-medium hover:bg-[#f5f5f5]"
                title="Open the draft in a new tab"
              >
                <Eye className="size-4" /> Preview
              </a>
              {current?.published && store.mode === "cloud" && (
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#d6d6d6] px-3 text-[12.5px] font-medium hover:bg-[#f5f5f5]"
                >
                  <ExternalLink className="size-4" /> View live
                </a>
              )}

              <div className="flex">
                <button
                  type="button"
                  onClick={() => void publish()}
                  disabled={publishing || status === "published"}
                  className="h-9 rounded-l-lg bg-[#072b4e] px-4 text-[12.5px] font-semibold text-white transition-colors hover:bg-[#0a3a66] disabled:opacity-60"
                >
                  {publishing
                    ? "Publishing…"
                    : status === "published"
                      ? "Published"
                      : "Publish now"}
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="h-9 rounded-r-lg border-l border-white/20 bg-[#072b4e] px-2 text-white hover:bg-[#0a3a66]"
                      aria-label="More"
                    >
                      <ChevronDown className="size-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem
                      onClick={() => {
                        void navigator.clipboard.writeText(liveUrl);
                        toast.success("Link copied");
                      }}
                    >
                      <Copy className="size-4" /> Copy page link
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setNewOpen({ source: cfg.slug })}>
                      <Plus className="size-4" /> Duplicate page
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={exportJson}>
                      <Download className="size-4" /> Export JSON
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => importRef.current?.click()}>
                      <Upload className="size-4" /> Import JSON
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {current?.published && (
                      <DropdownMenuItem onClick={() => void unpublish()}>
                        <MoreHorizontal className="size-4" /> Unpublish
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => void remove()}>
                      <Trash2 className="size-4" /> Delete page
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <input
                  ref={importRef}
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={(e) => {
                    void importJson(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>
          )}
        </header>

        <div className="flex min-h-0 flex-1">
          {/* ============ PARTNER LIST ============ */}
          <aside className="flex w-[260px] shrink-0 flex-col border-r border-[#d6d6d6] bg-[#f5f5f5]">
            <div className="flex items-center justify-between px-4 pb-2 pt-4">
              <div className="text-[13px] font-semibold">
                Partners <span className="font-normal text-[#9a9a9a]">{records.length}</span>
              </div>
              <button
                type="button"
                onClick={() => setNewOpen({ source: "__base" })}
                className="inline-flex size-7 items-center justify-center rounded-md hover:bg-[#e3e3e3]"
                title="New partner page"
              >
                <Plus className="size-4" />
              </button>
            </div>
            <div className="px-3 pb-2">
              <div className="flex h-8 items-center gap-2 rounded-md border border-[#d6d6d6] bg-white px-2">
                <Search className="size-3.5 text-[#9a9a9a]" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-[12.5px] outline-none placeholder:text-[#9a9a9a]"
                  placeholder="Search partners…"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
              </div>
            </div>
            <nav className="min-h-0 flex-1 overflow-auto px-2 pb-2">
              {visible.map((r) => {
                const active = r.slug === cfg?.slug;
                const st = statusOf(active && cfg ? { ...r, draft: cfg } : r);
                return (
                  <button
                    key={r.slug}
                    type="button"
                    onClick={() => openPage(r)}
                    className={
                      "mb-0.5 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors " +
                      (active ? "bg-white shadow-sm" : "hover:bg-[#ebebeb]")
                    }
                  >
                    <StatusDot status={st} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium">
                        {active && cfg ? cfg.name : r.name}
                      </span>
                      <span className="block truncate text-[11px] text-[#9a9a9a]">/{r.slug}</span>
                    </span>
                  </button>
                );
              })}
              {records.length === 0 && (
                <div className="px-3 py-6 text-center text-[12px] text-[#6b6b6b]">
                  No partner pages yet.
                  <br />
                  <button
                    type="button"
                    className="mt-2 font-medium text-[#072b4e] hover:underline"
                    onClick={() => setNewOpen({ source: "__base" })}
                  >
                    Create the first one
                  </button>
                  <br />
                  <button
                    type="button"
                    className="mt-1 font-medium text-[#072b4e] hover:underline"
                    onClick={() => void loadSamples()}
                  >
                    or load the 2 sample pages
                  </button>
                </div>
              )}
            </nav>
            <div className="border-t border-[#d6d6d6] px-4 py-3 text-[11px] text-[#6b6b6b]">
              {store.mode === "cloud" ? (
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate" title={email}>
                    {email}
                  </span>
                  <button
                    type="button"
                    onClick={() => void signOut()}
                    title="Sign out"
                    className="hover:text-[#1a1a1a]"
                  >
                    <LogOut className="size-3.5" />
                  </button>
                </div>
              ) : (
                <span>
                  <b className="text-[#1a1a1a]">Local mode.</b> Drafts stay in this browser. Turn on
                  Lovable Cloud to share and publish.
                </span>
              )}
            </div>
          </aside>

          {/* ============ FORM ============ */}
          <main className="w-[480px] shrink-0 overflow-auto border-r border-[#d6d6d6] bg-white">
            {cfg ? (
              <Form
                key={cfg.slug}
                cfg={cfg}
                update={update}
                replace={replace}
                open={openGroups}
                toggle={toggleGroup}
                issues={issues}
                siteUrl={siteUrl}
                onSlugCommit={commitSlug}
                onFocusSection={focusSection}
              />
            ) : (
              <div className="p-10 text-center text-[13px] text-[#6b6b6b]">
                Pick a partner or create a new page.
              </div>
            )}
          </main>

          {/* ============ PREVIEW ============ */}
          <section className="flex min-w-0 flex-1 flex-col">
            <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-[#d6d6d6] bg-[#f5f5f5] px-4">
              <Segmented
                size="sm"
                value={view}
                onChange={(v) => {
                  setView(v);
                  setSelectedSid(v === "thankyou" ? "thankyou" : null);
                }}
                options={[
                  { value: "landing", label: "Landing page" },
                  { value: "thankyou", label: "Thank-you page" },
                ]}
              />
              <Segmented
                size="sm"
                value={device}
                onChange={setDevice}
                options={[
                  { value: "desktop", label: "Desktop", icon: <Monitor className="size-3.5" /> },
                  { value: "mobile", label: "Mobile", icon: <Smartphone className="size-3.5" /> },
                ]}
              />
            </div>
            <div ref={canvasRef} className="relative min-h-0 flex-1 overflow-hidden">
              {cfg && (
                <div
                  className="absolute left-1/2 top-5 origin-top overflow-hidden rounded-lg bg-white shadow-[0_8px_40px_rgba(26,26,26,0.12)]"
                  style={{
                    width: dw,
                    height: frameH,
                    transform: `translateX(-50%) scale(${scale})`,
                  }}
                >
                  <iframe
                    ref={frameRef}
                    title="Page preview"
                    src="/preview"
                    className="size-full border-0"
                  />
                </div>
              )}
            </div>
          </section>
        </div>

        <NewPageDialog
          open={!!newOpen}
          source={newOpen?.source ?? "__base"}
          records={records}
          onClose={() => setNewOpen(null)}
          onCreate={async (name, slug, source) => {
            try {
              await createPage(name, slug, source);
              setNewOpen(null);
            } catch (e) {
              toast.error((e as Error).message);
            }
          }}
        />

        <Dialog open={!!blockers} onOpenChange={(o) => !o && setBlockers(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Not ready to publish</DialogTitle>
              <DialogDescription>
                Fix these first. The page stays saved as a draft.
              </DialogDescription>
            </DialogHeader>
            <ul className="space-y-1.5 text-[13px]">
              {blockers?.map((b, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#1a1a1a]" /> {b}
                </li>
              ))}
            </ul>
            <DialogFooter>
              <button
                type="button"
                className="h-9 rounded-lg bg-[#072b4e] px-4 text-[13px] font-semibold text-white"
                onClick={() => {
                  const first = issues.find((i) => i.level === "error");
                  setBlockers(null);
                  if (first) focusGroup(first.target);
                }}
              >
                Show me
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </UploadContext.Provider>
  );
}

function IconBtn(p: {
  title: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={p.title}
      disabled={p.disabled}
      onClick={p.onClick}
      className="inline-flex size-9 items-center justify-center rounded-lg text-[#1a1a1a] hover:bg-[#f5f5f5] disabled:opacity-30"
    >
      {p.children}
    </button>
  );
}

function NewPageDialog(p: {
  open: boolean;
  source: string;
  records: PageRecord[];
  onClose: () => void;
  onCreate: (name: string, slug: string, source: string) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [source, setSource] = useState(p.source);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (p.open) {
      const src = p.records.find((r) => r.slug === p.source);
      setName(src ? `${src.name} copy` : "");
      setSlug(src ? `${src.slug}-copy` : "");
      setSlugTouched(!!src);
      setSource(p.source);
    }
  }, [p.open, p.source, p.records]);

  const finalSlug = slugify(slugTouched ? slug : name);
  const taken = p.records.some((r) => r.slug === finalSlug);
  const reserved = RESERVED_SLUGS.has(finalSlug);
  const site = publicSiteUrl().replace(/^https?:\/\//, "");

  return (
    <Dialog open={p.open} onOpenChange={(o) => !o && p.onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New partner page</DialogTitle>
          <DialogDescription>
            Starts from the RGG template. Fill in the partner fields after.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Field label="Partner name" required>
            <TextInput value={name} onChange={setName} placeholder="e.g. Karon Smedley" />
          </Field>
          <Field
            label="Page link"
            help={
              taken
                ? "That link is taken."
                : reserved
                  ? "That link is reserved."
                  : "Short and memorable: usually the partner's last name."
            }
          >
            <TextInput
              prefix={site + "/"}
              value={slugTouched ? slug : slugify(name || "")}
              onChange={(v) => {
                setSlugTouched(true);
                setSlug(v);
              }}
            />
          </Field>
          <Field label="Start from">
            <select
              className="h-10 w-full rounded-lg border border-[#d6d6d6] bg-white px-3 text-[13.5px]"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            >
              <option value="__base">RGG template (blank partner fields)</option>
              {p.records.map((r) => (
                <option key={r.slug} value={r.slug}>
                  Copy of {r.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <DialogFooter>
          <button
            type="button"
            className="h-9 rounded-lg px-4 text-[13px] font-medium hover:bg-[#f5f5f5]"
            onClick={p.onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!name.trim() || taken || reserved || busy}
            className="h-9 rounded-lg bg-[#072b4e] px-4 text-[13px] font-semibold text-white disabled:opacity-50"
            onClick={async () => {
              setBusy(true);
              await p.onCreate(name.trim(), finalSlug, source);
              setBusy(false);
            }}
          >
            {busy ? "Creating…" : "Create page"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
