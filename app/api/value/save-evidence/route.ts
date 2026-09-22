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
      resumeId,
      sourceType,
      sourceId,
      recordTitle,
      recordSubtitle,
      evidenceType,
      evidenceLabel,
      detailAnswer,
      supportingSignal,
    } = body;

    // 1. Insert into career_journal as an Evidence event
    const journalEntry = {
      user_id: user.id,
      date: new Date().toISOString().split("T")[0],
      entry_type:
        evidenceType === "promotion"
          ? "promotion"
          : evidenceType === "award"
          ? "award"
          : evidenceType === "manager" || evidenceType === "customer"
          ? "feedback"
          : "win",
      content: `${evidenceLabel} for ${recordTitle} at ${recordSubtitle}: ${detailAnswer}. (${supportingSignal})`,
      source: "prompted",
      tags: ["Stage3Evidence", "ProofVault", evidenceType || "evidence"],
      extracted_metrics: {
        evidenceType,
        evidenceLabel,
        detailAnswer,
        supportingSignal,
        recordTitle,
        recordSubtitle,
      },
    };

    try {
      const adminSupabase = createAdminClient();
      await adminSupabase.from("career_journal_entries").insert([journalEntry]);
    } catch (journalErr) {
      console.warn("Journal sync note:", journalErr);
    }

    return NextResponse.json({
      success: true,
      message: "Evidence successfully linked to your career record!",
      entry: journalEntry,
    });
  } catch (err: unknown) {
    console.error("Save evidence error:", err);
    return NextResponse.json(
      { error: "Failed to save evidence" },
      { status: 500 }
    );
  }
}
