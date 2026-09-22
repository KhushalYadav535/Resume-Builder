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
      targetUserIds = users.map((u) => u.id);
    } else {
      // Need tier information from profiles
      const { data: profiles, error } = await supabaseAdmin.from("profiles").select("id, tier");
      if (error) throw error;

      if (targetAudience === "free_tier") {
        targetUserIds = profiles
          .filter((p) => !p.tier || p.tier === "free")
          .map((p) => p.id);
      } else if (targetAudience === "premium") {
        targetUserIds = profiles
          .filter((p) => p.tier && p.tier !== "free")
          .map((p) => p.id);
      }
    }

    if (targetUserIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No users matched the target audience.",
        sentCount: 0,
      });
    }

    // 2. Prepare notifications for bulk insert
    const notifications = targetUserIds.map((userId) => ({
      user_id: userId,
      message,
      type,
      link: link ? link.trim() : null,
      is_read: false,
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

    return NextResponse.json({
      success: true,
      message: "Broadcast sent successfully.",
      sentCount,
    });
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
 * Fetches recent broadcasts with recipient statistics and live audience counts.
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

    // 1. Fetch audience counts in parallel
    const [usersRes, profilesRes, notifsRes] = await Promise.all([
      supabaseAdmin.from("user_profiles").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("profiles").select("id, tier"),
      supabaseAdmin
        .from("notifications")
        .select("message, type, link, created_at, is_read")
        .order("created_at", { ascending: false })
        .limit(1000),
    ]);

    const totalUsers = usersRes.count || 0;
    const profiles = profilesRes.data || [];
    const premiumUsers = profiles.filter((p) => p.tier && p.tier !== "free").length;
    const freeUsers = Math.max(0, totalUsers - premiumUsers);

    const audienceCounts = {
      all: totalUsers,
      free: freeUsers,
      premium: premiumUsers,
    };

    // 2. Group & aggregate notifications by message and timestamp
    const rawNotifs = notifsRes.data || [];
    const groupedMap = new Map<string, {
      message: string;
      type: string;
      link: string | null;
      created_at: string;
      sent_count: number;
      read_count: number;
    }>();

    for (const n of rawNotifs) {
      const minute = new Date(n.created_at).toISOString().slice(0, 16);
      const key = `${n.message}---${minute}`;

      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          message: n.message,
          type: n.type,
          link: n.link,
          created_at: n.created_at,
          sent_count: 1,
          read_count: n.is_read ? 1 : 0,
        });
      } else {
        const item = groupedMap.get(key)!;
        item.sent_count += 1;
        if (n.is_read) item.read_count += 1;
      }
    }

    const uniqueBroadcasts = Array.from(groupedMap.values());

    return NextResponse.json({
      broadcasts: uniqueBroadcasts,
      audienceCounts,
    });
  } catch (err: unknown) {
    console.error("Admin Broadcast History Error:", err);
    return NextResponse.json({ error: "Failed to fetch history." }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/broadcast
 * Allows administrators to retract a broadcast message across all user drawers.
 */
export async function DELETE(req: NextRequest) {
  try {
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json({ error: "Forbidden. Admin rights required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const message = searchParams.get("message");

    if (!message) {
      return NextResponse.json({ error: "Missing message parameter to retract." }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_SERVICE_ROLE_KEY!
    );

    const { error, count } = await supabaseAdmin
      .from("notifications")
      .delete({ count: "exact" })
      .eq("message", message);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: `Retracted ${count || 0} notifications successfully.`,
      retractedCount: count || 0,
    });
  } catch (err: unknown) {
    console.error("Admin Broadcast Retract Error:", err);
    return NextResponse.json(
      { error: "Failed to retract broadcast." },
      { status: 500 }
    );
  }
}

