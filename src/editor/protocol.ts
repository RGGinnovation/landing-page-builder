import type { PageConfig } from "@/template/types";

/** postMessage protocol between /builder (parent) and /preview (iframe). */
export type ToPreview = {
  type: "rgg:render";
  config: PageConfig;
  view: "landing" | "thankyou";
  selectedId: string | null;
  scrollTo?: string | null;
};

export type FromPreview = { type: "rgg:ready" } | { type: "rgg:select"; id: string };

export function isFromPreview(d: unknown): d is FromPreview {
  const t = (d as { type?: string })?.type;
  return t === "rgg:ready" || t === "rgg:select";
}

export function isToPreview(d: unknown): d is ToPreview {
  return (d as { type?: string })?.type === "rgg:render";
}
