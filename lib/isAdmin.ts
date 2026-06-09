import { createClient } from "@/utils/supabase/server";

/**
 * Server utility to verify if the currently authenticated user is an administrator.
 * Resolves to true only if the user session exists and their role inside public.user_profiles is 'admin'.
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return false;
    }

    const { data: profile, error: dbError } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (dbError || !profile) {
      console.warn("isAdmin: Failed to fetch profile for user:", user.id, dbError?.message);
      return false;
    }

    return profile.role === "admin";
  } catch (err) {
    console.error("isAdmin: Unexpected check error:", err);
    return false;
  }
}
