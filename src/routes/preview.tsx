import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { isToPreview, type FromPreview } from "@/editor/protocol";
import { readLocalDraft, store } from "@/editor/store";
import { LandingPage } from "@/template/LandingPage";
import { ThankYouPage } from "@/template/ThankYouPage";
import type { PageConfig } from "@/template/types";

/**
 * Editor canvas. Rendered inside the /admin iframe (config arrives by postMessage),
 * or opened directly as /preview?slug=<slug>&view=thankyou to see the current DRAFT.
 */
export const Route = createFileRoute("/preview")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    slug: typeof s["slug"] === "string" ? (s["slug"] as string) : undefined,
    view: s["view"] === "thankyou" ? ("thankyou" as const) : undefined,
  }),
  head: () => ({
    meta: [{ title: "Draft preview" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: Preview,
});

function post(msg: FromPreview) {
  window.parent?.postMessage(msg, window.location.origin);
}

function Preview() {
  const search = Route.useSearch();
  const embedded = typeof window !== "undefined" && window.parent !== window;
  const [config, setConfig] = useState<PageConfig | null>(null);
  const [missing, setMissing] = useState(false);
  const [view, setView] = useState<"landing" | "thankyou">(search.view ?? "landing");
  const [selected, setSelected] = useState<string | null>(null);

  // Standalone tab: load the draft (cloud needs an editor session in this browser).
  useEffect(() => {
    if (embedded || !search.slug) return;
    const slug = search.slug;
    if (store.mode === "local") {
      const d = readLocalDraft(slug);
      if (d) setConfig(d);
      else setMissing(true);
      return;
    }
    void store
      .list()
      .then((rows) => {
        const r = rows.find((x) => x.slug === slug);
        if (r) setConfig(r.draft);
        else setMissing(true);
      })
      .catch(() => setMissing(true));
  }, [embedded, search.slug]);

  // Embedded: listen to the editor.
  useEffect(() => {
    if (!embedded) return;
    function onMsg(e: MessageEvent) {
      if (e.origin !== window.location.origin || !isToPreview(e.data)) return;
      setConfig(e.data.config);
      setView((prev) => {
        if (prev !== e.data.view) window.scrollTo(0, 0);
        return e.data.view;
      });
      setSelected(e.data.selectedId);
      const target = e.data.scrollTo;
      if (target) {
        requestAnimationFrame(() =>
          document
            .querySelector(`[data-sid="${CSS.escape(target)}"]`)
            ?.scrollIntoView({ behavior: "smooth", block: "start" }),
        );
      }
    }
    window.addEventListener("message", onMsg);
    post({ type: "rgg:ready" });
    return () => window.removeEventListener("message", onMsg);
  }, [embedded]);

  // Click-to-select + keep links from navigating the canvas.
  useEffect(() => {
    if (!embedded) return;
    function onClick(e: MouseEvent) {
      const t = e.target as HTMLElement;
      if (t.closest("input,button[type=submit],label")) return;
      const a = t.closest("a");
      if (a) e.preventDefault();
      const sec = t.closest<HTMLElement>("[data-sid]");
      if (sec?.dataset["sid"]) post({ type: "rgg:select", id: sec.dataset["sid"] });
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [embedded]);

  // Selection outline.
  useEffect(() => {
    document.querySelectorAll(".is-selected").forEach((n) => n.classList.remove("is-selected"));
    if (selected)
      document.querySelector(`[data-sid="${CSS.escape(selected)}"]`)?.classList.add("is-selected");
  });

  if (!config) {
    return (
      <div style={{ padding: 40, fontFamily: "Inter, sans-serif", color: "#5c5c5c" }}>
        {embedded
          ? "Loading preview…"
          : missing
            ? "Draft not found. Sign in at /admin in this browser, then reopen the preview."
            : search.slug
              ? "Loading draft…"
              : "Open /preview?slug=<page-url>."}
      </div>
    );
  }

  return view === "thankyou" ? (
    <ThankYouPage config={config} preview />
  ) : (
    <LandingPage config={config} preview thankYouHref="#" />
  );
}
