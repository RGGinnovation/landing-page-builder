import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

// The editor is browser-only (auth session, iframe preview, uploads): no SSR.
const Editor = lazy(() => import("@/editor/Editor").then((m) => ({ default: m.Editor })));

export const Route = createFileRoute("/admin")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    page: typeof s["page"] === "string" ? (s["page"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Partner Pages | Revelation Gold Group" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminRoute,
});

function AdminRoute() {
  return (
    <Suspense fallback={<div className="p-10 text-sm text-[#5c5c5c]">Loading editor…</div>}>
      <Editor />
    </Suspense>
  );
}
