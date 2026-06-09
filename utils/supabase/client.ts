import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a browser-compatible Supabase client.
 * Persists the session in cookies and localStorage automatically.
 *
 * During `next build` static prerendering, NEXT_PUBLIC_* env vars may be
 * empty in worker processes. We provide safe placeholder values so the
 * client can be instantiated without crashing — no real requests are made
 * during prerendering.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key"
  );
}

