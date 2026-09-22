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
      capabilityId,
      capabilityName,
      action, // 'confirm' | 'edit' | 'reject'
      editedName,
      editedDescription,
      rejectionReason,
      userNote,
    } = body;

    const finalStatus =
      action === "confirm" ? "confirmed" : action === "edit" ? "modified" : "rejected";
    const finalName = editedName || capabilityName;

    // Persist review action into career_journal_entries
    const journalEntry = {
      user_id: user.id,
      date: new Date().toISOString().split("T")[0],
      entry_type: action === "reject" ? "gap" : "skill",
      content:
        action === "confirm"
          ? `User confirmed capability: ${finalName}`
          : action === "edit"
          ? `User refined capability: ${finalName} - ${editedDescription || ""}`
          : `User rejected capability hypothesis: ${finalName} (Reason: ${rejectionReason || "Not accurate"})`,
      source: "prompted",
      tags: ["Stage4Derivation", "CapabilityReview", action],
      extracted_metrics: {
        capabilityId,
        capabilityName: finalName,
        action,
        status: finalStatus,
        description: editedDescription,
        rejectionReason,
        userNote,
        confirmedDate: new Date().toISOString(),
      },
    };

    const adminSupabase = createAdminClient();
    const { error: insertError } = await adminSupabase
      .from("career_journal_entries")
      .insert([journalEntry]);

    if (insertError) {
      console.error("Journal insert error in review-capability:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Capability ${action === "confirm" ? "confirmed" : action === "edit" ? "updated" : "rejected"} successfully!`,
      status: finalStatus,
    });
  } catch (err: unknown) {
    console.error("Capability review error:", err);
    return NextResponse.json(
      { error: "Failed to process capability review" },
      { status: 500 }
    );
  }
}
