import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a browser-compatible Supabase client.
 * Persists the session in cookies and localStorage automatically.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
