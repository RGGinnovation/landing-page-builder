import { createFileRoute, notFound } from "@tanstack/react-router";

import { loadPublishedPage } from "@/data/published";
import { thankYouHead } from "@/template/head";
import { ThankYouPage } from "@/template/ThankYouPage";
import { trackingScripts } from "@/template/tracking-scripts";

/** <site>/<slug>/thank-you: where the lead form lands after a successful submission. */
export const Route = createFileRoute("/$slug/thank-you")({
  loader: async ({ params }) => {
    const page = await loadPublishedPage(params.slug);
    if (!page) throw notFound();
    return page;
  },
  head: ({ loaderData }) =>
    loaderData
      ? { ...thankYouHead(loaderData), scripts: trackingScripts(loaderData, { landing: false }) }
      : {},
  component: PartnerThankYou,
});

function PartnerThankYou() {
  return <ThankYouPage config={Route.useLoaderData()} />;
}
