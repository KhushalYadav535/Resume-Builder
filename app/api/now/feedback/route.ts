import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

// POST /api/now/feedback (Spec Section 27)
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await req.json().catch(() => ({}));
    const { block_id, thread_id, decision, edited_text, block_title, source } = body;

    if (!decision || !["ACCEPT", "EDIT", "REJECT"].includes(decision)) {
      return NextResponse.json({ error: "Valid decision (ACCEPT, EDIT, REJECT) is required" }, { status: 400 });
    }

    const admin = createAdminClient();

    // 1. Record feedback in now_feedback table if it exists
    if (user) {
      try {
        await admin.from("now_feedback").insert({
          user_id: user.id,
          thread_id: thread_id || null,
          block_id: block_id || null,
          decision,
          edited_text: edited_text || null,
        });
      } catch (e: any) {
        console.warn("now_feedback insert notice:", e.message);
      }

      // 2. If user accepted or edited a milestone/capability, sync to career_journal_entries (Spec Section 25)
      if ((decision === "ACCEPT" || decision === "EDIT") && edited_text) {
        try {
          await admin.from("career_journal_entries").insert({
            user_id: user.id,
            title: block_title || "Confirmed Career Milestone",
            situation: `Synthesized via Now (${source || "VALUE"})`,
            action: "Verified & confirmed in career workspace",
            impact: edited_text,
            category: source || "EXECUTION",
          });
        } catch (e: any) {
          console.warn("journal writeback notice:", e.message);
        }
      }
    }

    return NextResponse.json({ success: true, decision, synced_to_journal: decision !== "REJECT" });
  } catch (err: any) {
    console.error("POST /api/now/feedback error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
