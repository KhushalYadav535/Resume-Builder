import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: factId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { statement, rejectionReason, category, sourceType } = body;

    const adminSupabase = createAdminClient();
    const journalEntry = {
      user_id: user.id,
      date: new Date().toISOString().split("T")[0],
      entry_type: "gap",
      content: `Rejected career fact: ${statement || factId} (Reason: ${rejectionReason || "Not accurate"})`,
      source: "prompted",
      tags: ["FactReview", "reject", "REJECTED"],
      extracted_metrics: {
        factId,
        action: "reject",
        status: "REJECTED",
        statement,
        rejectionReason,
        category,
        sourceType,
        rejectedAt: new Date().toISOString(),
      },
    };

    const { error: insertError } = await adminSupabase
      .from("career_journal_entries")
      .insert([journalEntry]);

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      factId,
      status: "REJECTED",
      message: "Fact rejected successfully. Excluded from active Career Value.",
    });
  } catch (err: unknown) {
    console.error("Fact reject API error:", err);
    return NextResponse.json(
      { error: "Failed to reject fact" },
      { status: 500 }
    );
  }
}
