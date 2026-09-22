import { createClient } from "@supabase/supabase-js";

/**
 * Creates a server-side Supabase admin client using the service role key.
 * Used for database writes (e.g. updating resume data, logging journal entries)
 * after the user session has already been authenticated.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey =
    process.env.NEXT_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
