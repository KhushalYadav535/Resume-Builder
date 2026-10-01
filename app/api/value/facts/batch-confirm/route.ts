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

    const body = await req.json().catch(() => ({}));
    const { facts } = body; // Array of { id, statement, category, sourceType }

    if (!Array.isArray(facts) || facts.length === 0) {
      return NextResponse.json({ error: "No facts provided" }, { status: 400 });
    }

    const adminSupabase = createAdminClient();
    const today = new Date().toISOString().split("T")[0];
    const timestamp = new Date().toISOString();

    const journalEntries = facts.map((f: any) => ({
      user_id: user.id,
      date: today,
      entry_type: "skill",
      content: `Batch confirmed career fact: ${f.statement || f.id}`,
      source: "prompted",
      tags: ["FactReview", "confirm", "CONFIRMED"],
      extracted_metrics: {
        factId: f.id,
        action: "confirm",
        status: "CONFIRMED",
        statement: f.statement,
        category: f.category,
        sourceType: f.sourceType,
        confirmedAt: timestamp,
      },
    }));

    const { error } = await adminSupabase
      .from("career_journal_entries")
      .insert(journalEntries);

    if (error) {
      console.error("Batch confirm insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      confirmedCount: facts.length,
      message: `Successfully confirmed ${facts.length} facts.`,
    });
  } catch (err: unknown) {
    console.error("Batch confirm error:", err);
    return NextResponse.json(
      { error: "Failed to batch confirm facts" },
      { status: 500 }
    );
  }
}
