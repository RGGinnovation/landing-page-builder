import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Lovable Cloud (Supabase) client. Lovable sets these env vars when Cloud is enabled.
 * If they are missing the app runs in "local mode": drafts in this browser, public
 * routes serve the sample pages bundled in src/content/pages.
 */
const url = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
const key =
  (import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string | undefined) ||
  (import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined);

export const cloudEnabled = !!(url && key);

const isBrowser = typeof window !== "undefined";

export const supabase: SupabaseClient | null = cloudEnabled
  ? createClient(url!, key!, {
      auth: isBrowser
        ? { persistSession: true, autoRefreshToken: true, storage: window.localStorage }
        : { persistSession: false, autoRefreshToken: false },
    })
  : null;

/** Public bucket for partner logos and portraits (created by the migration). */
export const ASSET_BUCKET = "partner-assets";
