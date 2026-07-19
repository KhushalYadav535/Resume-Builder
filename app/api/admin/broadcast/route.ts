import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/isAdmin";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json({ error: "Forbidden. Admin rights required." }, { status: 403 });
    }

    const body = await req.json();
    const { message, type, link, targetAudience } = body;

    if (!message || !type || !targetAudience) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_SERVICE_ROLE_KEY!
    );

    let targetUserIds: string[] = [];

    // 1. Fetch audience
    if (targetAudience === "all_users") {
      const { data: users, error } = await supabaseAdmin.from("user_profiles").select("id");
      if (error) throw error;
      targetUserIds = users.map(u => u.id);
    } else {
      // Need tier information from profiles
      const { data: profiles, error } = await supabaseAdmin.from("profiles").select("id, tier");
      if (error) throw error;

      if (targetAudience === "free_tier") {
        targetUserIds = profiles.filter(p => p.tier === "free").map(p => p.id);
      } else if (targetAudience === "premium") {
        targetUserIds = profiles.filter(p => p.tier !== "free").map(p => p.id);
      }
    }

    if (targetUserIds.length === 0) {
      return NextResponse.json({ success: true, message: "No users matched the target audience.", sentCount: 0 });
    }

    // 2. Prepare notifications for bulk insert
    const notifications = targetUserIds.map((userId) => ({
      user_id: userId,
      message,
      type,
      link: link || null,
      is_read: false
    }));

    // 3. Insert in batches of 1000 to prevent payload limits
    const BATCH_SIZE = 1000;
    let sentCount = 0;

    for (let i = 0; i < notifications.length; i += BATCH_SIZE) {
      const batch = notifications.slice(i, i + BATCH_SIZE);
      const { error: insertErr } = await supabaseAdmin.from("notifications").insert(batch);
      if (insertErr) {
        console.error("Batch insert error:", insertErr);
        throw insertErr;
      }
      sentCount += batch.length;
    }

    return NextResponse.json({ success: true, message: "Broadcast sent successfully.", sentCount });
  } catch (err: unknown) {
    console.error("Admin Broadcast Error:", err);
    return NextResponse.json(
      { error: "Failed to send broadcast." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/broadcast
 * Optional: Fetch recent broadcasts for the history table.
 * Since we don't have a "broadcasts" table, we can just aggregate recent unique messages from the notifications table.
 */
export async function GET(req: NextRequest) {
  try {
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json({ error: "Forbidden. Admin rights required." }, { status: 403 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_SERVICE_ROLE_KEY!
    );

    // Group by message to reconstruct broadcast history
    // We can just fetch the latest 500 notifications and deduplicate them by message+created_at (approx)
    const { data: rawNotifs, error } = await supabaseAdmin
      .from("notifications")
      .select("message, type, link, created_at")
      .order("created_at", { ascending: false })
      .limit(1000);

    if (error) throw error;

    // Deduplicate
    const uniqueBroadcasts: any[] = [];
    const seen = new Set();

    for (const n of (rawNotifs || [])) {
      // Use message and date (truncated to minute) as unique key
      const minute = new Date(n.created_at).toISOString().slice(0, 16);
      const key = `${n.message}-${minute}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        uniqueBroadcasts.push({
          message: n.message,
          type: n.type,
          link: n.link,
          created_at: n.created_at
        });
      }
    }

    return NextResponse.json(uniqueBroadcasts);
  } catch (err: unknown) {
    console.error("Admin Broadcast History Error:", err);
    return NextResponse.json({ error: "Failed to fetch history." }, { status: 500 });
  }
}
