import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/now/threads/[id] (Spec Section 27: Resume thread)
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Thread ID is required" }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: thread, error } = await admin
      .from("now_threads")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, thread });
  } catch (err: any) {
    console.error("GET /api/now/threads/[id] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/now/threads/[id] (Spec Section 27: Complete or update thread)
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Thread ID is required" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const { status, next_action, current_stage } = body;

    const admin = createAdminClient();
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (status) {
      updatePayload.status = status;
      if (status === "COMPLETED") {
        updatePayload.completed_at = new Date().toISOString();
      }
    }
    if (next_action !== undefined) updatePayload.next_action = next_action;
    if (current_stage !== undefined) updatePayload.current_stage = current_stage;

    const { data, error } = await admin
      .from("now_threads")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, thread: data });
  } catch (err: any) {
    console.error("PATCH /api/now/threads/[id] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
