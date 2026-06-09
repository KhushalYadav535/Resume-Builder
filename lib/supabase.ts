import { createClient, SupabaseClient } from "@supabase/supabase-js";

let clientInstance: SupabaseClient | null = null;

/**
 * Lazily retrieves or initializes the Supabase client instance.
 * Performs validation checks at runtime (property-access time) instead of
 * module-load time. This ensures Next.js build and static optimization stages
 * do not crash if environment variables are not configured in the build environment.
 */
function getSupabaseClient(): SupabaseClient {
  if (clientInstance) return clientInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    const missing: string[] = [];
    if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
    if (!supabaseAnonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");

    throw new Error(
      `Supabase Client Error: Missing required environment variable(s): ${missing.join(", ")}. ` +
      `Please ensure these are defined in your local .env.local file or production deployment configuration.`
    );
  }

  clientInstance = createClient(supabaseUrl, supabaseAnonKey);
  return clientInstance;
}

/**
 * A proxy wrapper around the Supabase client.
 * Using a proxy allows us to defer initialization and environment variable
 * validation until the client is actually queried. This allows the Next.js
 * project to build and compile successfully without needing environment variables.
 *
 * This keeps the existing `import { supabase } from "@/lib/supabase"` imports
 * working transparently without any syntax or logic changes in existing routes/files.
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(target, prop, receiver) {
    const client = getSupabaseClient();
    const value = Reflect.get(client, prop);
    
    // Bind methods to the underlying SupabaseClient to preserve the correct 'this' context
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
