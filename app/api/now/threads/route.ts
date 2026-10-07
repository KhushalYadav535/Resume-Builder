import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

// GET /api/now/threads?status=ACTIVE (Spec Section 27)
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ threads: [] });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "ACTIVE";

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("now_threads")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", status)
      .order("last_activity_at", { ascending: false })
      .limit(10);

    if (error) {
      // If table does not exist yet, return empty list gracefully
      console.warn("now_threads fetch note:", error.message);
      return NextResponse.json({ threads: [] });
    }

    return NextResponse.json({ threads: data || [] });
  } catch (err: any) {
    console.error("GET /api/now/threads error:", err);
    return NextResponse.json({ threads: [] });
  }
}

// POST /api/now/threads (Create or update thread)
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await req.json().catch(() => ({}));
    const {
      id,
      title,
      intent,
      status = "ACTIVE",
      current_stage,
      next_action,
      context_snapshot,
      response_snapshot,
    } = body;

    if (!id || !title || !intent) {
      return NextResponse.json(
        { error: "id, title, and intent are required." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const nowIso = new Date().toISOString();

    const payload = {
      id,
      user_id: user?.id || null,
      title,
      intent,
      status,
      current_stage: current_stage || "INTENT_DETECTED",
      updated_at: nowIso,
      last_activity_at: nowIso,
      context_snapshot: context_snapshot || {},
      response_snapshot: response_snapshot || {},
      next_action: next_action || null,
    };

    const { data, error } = await admin
      .from("now_threads")
      .upsert(payload, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      console.warn("now_threads upsert note:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 200 });
    }

    return NextResponse.json({ success: true, thread: data });
  } catch (err: any) {
    console.error("POST /api/now/threads error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
