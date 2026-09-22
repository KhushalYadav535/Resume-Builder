import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      patternId,
      patternName,
      action, // 'confirm' | 'modify' | 'Confirmed Pattern'
      editedName,
      editedDescription,
      description,
      status,
    } = body;

    const finalName = editedName || patternName;
    const finalDesc = editedDescription || description || "";
    const isConfirm =
      action === "confirm" ||
      action === "Confirmed Pattern" ||
      status === "confirmed" ||
      (!editedName && !editedDescription);

    const journalEntry = {
      user_id: user.id,
      date: new Date().toISOString().split("T")[0],
      entry_type: "skill",
      content: isConfirm
        ? `User confirmed impact pattern: ${finalName}`
        : `User modified impact pattern: ${finalName} — ${finalDesc}`,
      source: "prompted",
      tags: ["Stage4Derivation", "PatternReview", isConfirm ? "confirm" : "modify"],
      extracted_metrics: {
        patternId,
        patternName: finalName,
        description: finalDesc,
        action: isConfirm ? "Confirmed Pattern" : "Modified Pattern Phrasing",
        status: isConfirm ? "confirmed" : "modified",
        confirmedDate: new Date().toISOString(),
      },
    };

    const adminSupabase = createAdminClient();
    const { error: insertError } = await adminSupabase
      .from("career_journal_entries")
      .insert([journalEntry]);

    if (insertError) {
      console.error("Journal insert error in review-pattern:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Impact pattern ${isConfirm ? "confirmed" : "updated"} successfully!`,
      status: isConfirm ? "confirmed" : "modified",
    });
  } catch (err: unknown) {
    console.error("Pattern review error:", err);
    return NextResponse.json(
      { error: "Failed to process pattern review" },
      { status: 500 }
    );
  }
}
