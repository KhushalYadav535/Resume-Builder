import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { isAdmin } from "@/lib/isAdmin";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/users
 * Returns list of all user profiles in the database.
 */
export async function GET(req: NextRequest) {
  try {
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json({ error: "Forbidden. Admin rights required." }, { status: 403 });
    }

    const supabase = await createClient();
    const { data: users, error } = await supabase
      .from("user_profiles")
      .select("id, email, role, created_at, has_completed_onboarding")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Error querying user profiles (might not be migrated yet):", (error instanceof Error ? error.message : "Unknown error"));
      return NextResponse.json([]); // Graceful fallback
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
