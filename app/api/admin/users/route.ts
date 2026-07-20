import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { isAdmin } from "@/lib/isAdmin";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/users
 * Returns list of all registered users by querying auth.users via service_role client.
 * Falls back to user_profiles only if the service_role key is unavailable.
 * Auto-backfills user_profiles rows for users created before the trigger was applied.
 */
export async function GET(req: NextRequest) {
  try {
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json({ error: "Forbidden. Admin rights required." }, { status: 403 });
    }

    const supabase = await createClient();

    // Use admin client with service_role key to read all auth.users
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.NEXT_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceKey) {
      // Admin client bypasses RLS — can read auth.users directly
      const adminClient = createAdminClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      // Fetch all auth users (paginated, max 1000)
      const { data: authData, error: authError } = await adminClient.auth.admin.listUsers({ perPage: 1000 });

      if (!authError && authData?.users) {
        const authUsers = authData.users;

        // Fetch existing profiles
        const { data: profiles } = await supabase
          .from("user_profiles")
          .select("id, email, role, created_at, has_completed_onboarding");

        const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

        // Build merged user list
        const missingProfiles: any[] = [];
        const mergedUsers = authUsers.map((u: any) => {
          const profile = profileMap.get(u.id);
          if (!profile) {
            // Track users with no profile row — we'll backfill them
            missingProfiles.push({
              id: u.id,
              email: u.email ?? "",
              role: "user",
              has_completed_onboarding: false,
            });
          }
          return {
            id: u.id,
            email: u.email ?? profile?.email ?? "",
            role: profile?.role ?? "user",
            created_at: u.created_at ?? profile?.created_at,
            has_completed_onboarding: profile?.has_completed_onboarding ?? false,
          };
        });

        // Backfill missing profile rows (fire and forget — don't block the response)
        if (missingProfiles.length > 0) {
          supabase
            .from("user_profiles")
            .upsert(missingProfiles, { onConflict: "id", ignoreDuplicates: true })
            .then(({ error }) => {
              if (error) console.warn("Profile backfill partial error:", error.message);
            });
        }

        // Sort newest first
        mergedUsers.sort((a: any, b: any) =>
          new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
        );
        return NextResponse.json(mergedUsers);
      }
      // Fall through to profiles-only query if auth.admin fails
    }

    // Fallback: read user_profiles only (works without service_role key)
    const { data: users, error } = await supabase
      .from("user_profiles")
      .select("id, email, role, created_at, has_completed_onboarding")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Error querying user profiles:", (error instanceof Error ? error.message : "Unknown error"));
      return NextResponse.json([]);
    }

    return NextResponse.json(users || []);
  } catch (err: unknown) {
    console.error("Fetch admin users failed:", err);
    return NextResponse.json({ error: "Failed to fetch users." }, { status: 500 });
  }
}


/**
 * POST /api/admin/users
 * Updates a user profile's role.
 * Body: { userId: string, role: string }
 */
export async function POST(req: NextRequest) {
  try {
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json({ error: "Forbidden. Admin rights required." }, { status: 403 });
    }

    const supabase = await createClient();
    const body = await req.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json({ error: "Missing required fields: userId or role." }, { status: 400 });
    }

    // Role validation
    if (role !== "admin" && role !== "user" && role !== "suspended") {
      return NextResponse.json({ error: "Invalid role value. Must be 'admin', 'user', or 'suspended'." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("user_profiles")
      .update({ role })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, user: data });
  } catch (err: unknown) {
    console.error("Update user role failed:", err);
    return NextResponse.json({ error: "Failed to update user role." }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/users
 * Deletes a user profile (Soft-delete / block from frontend view).
 * Body: { userId: string }
 */
export async function DELETE(req: NextRequest) {
  try {
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json({ error: "Forbidden. Admin rights required." }, { status: 403 });
    }

    const supabase = await createClient();
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing required field: userId." }, { status: 400 });
    }

    const { error } = await supabase
      .from("user_profiles")
      .delete()
      .eq("id", userId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Delete user failed:", err);
    return NextResponse.json({ error: "Failed to delete user." }, { status: 500 });
  }
}
