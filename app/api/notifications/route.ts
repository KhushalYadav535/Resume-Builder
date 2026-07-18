import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/notifications
 * Retrieves all notifications for the authenticated user, ordered by created_at DESC.
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Notifications table query warning (might not be migrated yet):", (error instanceof Error ? error.message : "Unknown error"));
      return NextResponse.json([]); // Graceful fallback
    }

    return NextResponse.json(data || []);
  } catch (err: unknown) {
    console.error("Fetch notifications failed:", err);
    return NextResponse.json({ error: "Failed to fetch notifications. Please try again." }, { status: 500 });
  }
}

/**
 * POST /api/notifications
 * Marks notifications as read.
 * Body options:
 * - { id: string } : Mark specific notification as read.
 * - { markAllRead: true } : Mark all notifications for the user as read.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const { id, markAllRead } = body;

    if (markAllRead) {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id);

      if (error) {
        console.warn("Could not mark all notifications as read:", (error instanceof Error ? error.message : "Unknown error"));
        return NextResponse.json({ success: false, bypassed: true });
      }

      return NextResponse.json({ success: true });
    }

    if (id) {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        console.warn("Could not mark notification as read:", (error instanceof Error ? error.message : "Unknown error"));
        return NextResponse.json({ success: false, bypassed: true });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid request body parameters." }, { status: 400 });
  } catch (err: unknown) {
    console.error("Update notifications failed:", err);
    return NextResponse.json({ error: "Failed to update notification. Please try again." }, { status: 500 });
  }
}
