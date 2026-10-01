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
    const { statement, category, sourceType } = body;

    const adminSupabase = createAdminClient();
    const journalEntry = {
      user_id: user.id,
      date: new Date().toISOString().split("T")[0],
      entry_type: "skill",
      content: `Confirmed career fact: ${statement || factId}`,
      source: "prompted",
      tags: ["FactReview", "confirm", "CONFIRMED"],
      extracted_metrics: {
        factId,
        action: "confirm",
        status: "CONFIRMED",
        statement,
        category,
        sourceType,
        confirmedAt: new Date().toISOString(),
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
      status: "CONFIRMED",
      message: "Fact confirmed successfully.",
    });
  } catch (err: unknown) {
    console.error("Fact confirm API error:", err);
    return NextResponse.json(
      { error: "Failed to confirm fact" },
      { status: 500 }
    );
  }
}
