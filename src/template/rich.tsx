import { createContext, useContext, type ElementType } from "react";

import type { BrandConfig, TokenContext, TrackingConfig } from "./types";

/* ------------------------------------------------------------------ */
/* Render context: brand + tokens + preview flag, available to sections */
/* ------------------------------------------------------------------ */

export interface RenderCtx {
  brand: BrandConfig;
  tracking: TrackingConfig;
  tokens: TokenContext;
  preview: boolean;
  thankYouHref: string;
}

export const RenderContext = createContext<RenderCtx | null>(null);

export function useRender(): RenderCtx {
  const ctx = useContext(RenderContext);
  if (!ctx) throw new Error("Section rendered outside <LandingPage>");
  return ctx;
}

export function telHref(brand: BrandConfig) {
  return "tel:" + brand.phoneE164.replace(/[^+\d]/g, "");
}

/* ------------------------------------------------------------------ */
/* Tokens + safe inline formatting                                     */
/* ------------------------------------------------------------------ */

export function fill(text: string, t: TokenContext): string {
  return (text ?? "")
    .replace(/\{phone\}/g, t.phone)
    .replace(/\{partner\}/g, t.partner)
    .replace(/\{rgg\}/g, t.rgg)
    .replace(/\{firstName\}/g, t.firstName ?? "");
}

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeUrl(u: string) {
  const url = u.trim();
  if (/^(https?:|mailto:|tel:|#|\/)/i.test(url)) return url;
  return "#";
}

/** **bold**, *italic*, [text](url), newline -> <br>. Everything else is escaped. */
export function richToHtml(text: string, t: TokenContext): string {
  let s = esc(fill(text, t));
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label: string, url: string) => {
    const href = safeUrl(url.replace(/&amp;/g, "&"));
    const ext = /^https?:/i.test(href);
    return `<a href="${esc(href)}"${ext ? ' target="_blank" rel="noopener"' : ""}>${label}</a>`;
  });
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  s = s.replace(/\r?\n/g, "<br>");
  return s;
}

type RichProps = {
  text: string;
  as?: ElementType;
  className?: string;
};

/** Renders a Rich field. Default tag is <span>. */
export function R({ text, as: Tag = "span", className }: RichProps) {
  const { tokens } = useRender();
  return (
    <Tag className={className} dangerouslySetInnerHTML={{ __html: richToHtml(text, tokens) }} />
  );
}

/** Plain text with tokens filled. */
export function useFill() {
  const { tokens } = useRender();
  return (s: string) => fill(s, tokens);
}
