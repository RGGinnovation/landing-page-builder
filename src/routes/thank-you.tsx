import { createFileRoute, redirect } from "@tanstack/react-router";

import { resolveRoot } from "@/data/host.functions";
import { ROOT_REDIRECT } from "@/template/constants";
import { thankYouHead } from "@/template/head";
import { ThankYouPage } from "@/template/ThankYouPage";
import { trackingScripts } from "@/template/tracking-scripts";

/** Thank-you page for a partner domain connected straight to this project. */
export const Route = createFileRoute("/thank-you")({
  loader: async () => {
    const r = await resolveRoot();
    if (r.page) return r.page;
    throw redirect({ href: ROOT_REDIRECT });
  },
  head: ({ loaderData }) =>
    loaderData ? { ...thankYouHead(loaderData), scripts: trackingScripts(loaderData) } : {},
  component: DomainThankYou,
});

function DomainThankYou() {
  return <ThankYouPage config={Route.useLoaderData()} />;
}
