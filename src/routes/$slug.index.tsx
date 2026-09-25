import { createFileRoute, notFound } from "@tanstack/react-router";

import { loadPublishedPage } from "@/data/published";
import { landingHead } from "@/template/head";
import { LandingPage } from "@/template/LandingPage";
import { trackingScripts } from "@/template/tracking-scripts";

/**
 * THE PUBLIC PARTNER PAGE: <site>/<slug>, e.g. partner.revelationgoldgroup.com/smedley.
 * This is the link each partner's vanity domain redirects to.
 */
export const Route = createFileRoute("/$slug/")({
  loader: async ({ params }) => {
    const page = await loadPublishedPage(params.slug);
    if (!page) throw notFound();
    return page;
  },
  head: ({ loaderData }) =>
    loaderData ? { ...landingHead(loaderData), scripts: trackingScripts(loaderData) } : {},
  component: PartnerLanding,
});

function PartnerLanding() {
  const page = Route.useLoaderData();
  return <LandingPage config={page} thankYouHref={`/${page.slug}/thank-you`} />;
}
