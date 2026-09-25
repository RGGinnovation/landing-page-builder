import { createFileRoute, redirect } from "@tanstack/react-router";

import { resolveRoot } from "@/data/host.functions";
import { ROOT_REDIRECT } from "@/template/constants";
import { landingHead } from "@/template/head";
import { LandingPage } from "@/template/LandingPage";
import { trackingScripts } from "@/template/tracking-scripts";

/**
 * "/" on a partner domain that is connected to this project: that partner's page.
 * "/" anywhere else: the editor on Lovable/localhost, revelationgoldgroup.com in production.
 * (The usual setup is simpler: the partner domain 301-redirects to <site>/<slug>.)
 */
export const Route = createFileRoute("/")({
  loader: async () => {
    const r = await resolveRoot();
    if (r.page) return r.page;
    if (r.isAppHost) throw redirect({ to: "/admin", search: { page: undefined } });
    throw redirect({ href: ROOT_REDIRECT });
  },
  head: ({ loaderData }) =>
    loaderData
      ? { ...landingHead(loaderData), scripts: trackingScripts(loaderData, { landing: true }) }
      : {},
  component: DomainLanding,
});

function DomainLanding() {
  const page = Route.useLoaderData();
  return <LandingPage config={page} thankYouHref="/thank-you" />;
}
