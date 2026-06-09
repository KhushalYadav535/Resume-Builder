import { createClient } from "@/utils/supabase/server";

/**
 * Server-side helper to fetch the authenticated user.
 * Safe to call inside Next.js Server Components, Server Actions, and API Routes.
 */
export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return null;
    return user;
  } catch (err) {
    console.error("Error fetching current user from server context:", err);
    return null;
  }
}
