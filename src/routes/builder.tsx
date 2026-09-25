import { createFileRoute, redirect } from "@tanstack/react-router";

/** Old editor URL. */
export const Route = createFileRoute("/builder")({
  beforeLoad: () => {
    throw redirect({ to: "/admin", search: { page: undefined } });
  },
});
