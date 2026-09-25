import { createServerFn } from "@tanstack/react-start";
import { getRequestHost } from "@tanstack/react-start/server";

import { loadPublishedPageByDomain } from "./published";

/**
 * Resolves the site root. A partner domain connected straight to this project serves its
 * page at "/". Anything else gets a redirect target instead.
 */
export const resolveRoot = createServerFn({ method: "GET" }).handler(async () => {
  const host = getRequestHost({ xForwardedHost: true });
  const page = await loadPublishedPageByDomain(host);
  const bare = host.replace(/:\d+$/, "");
  const isAppHost = bare === "localhost" || bare === "127.0.0.1" || bare.endsWith(".lovable.app");
  return { host, page: page ?? null, isAppHost };
});
