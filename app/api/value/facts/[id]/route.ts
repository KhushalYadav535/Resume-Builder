import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { Resume } from "@/types";
import {
  parseJournalReviewLogs,
  extractCareerFactsFromResume,
  buildDerivationGraph,
} from "@/lib/valueDerivationEngine";

export const dynamic = "force-dynamic";

// GET /api/value/facts/:id (Spec §30)
export async function GET(
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

    const { searchParams } = new URL(req.url);
    const resumeId = searchParams.get("resumeId");

    let resumeQuery = supabase
      .from("resumes")
      .select("*")
      .eq("user_id", user.id);

    if (resumeId) {
      resumeQuery = resumeQuery.eq("id", resumeId);
    } else {
      resumeQuery = resumeQuery.order("created_at", { ascending: false });
    }

    const { data: resumes, error } = await resumeQuery;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const activeResume: Resume | null =
      resumes && resumes.length > 0
        ? resumes.find((r: Resume) => r.is_base_resume) || resumes[0]
        : null;

    const adminSupabase = createAdminClient();
    const { data: journalEntries } = await adminSupabase
      .from("career_journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    const journalList = Array.isArray(journalEntries) ? journalEntries : [];
    const reviewLogs = parseJournalReviewLogs(journalList);
    const facts = extractCareerFactsFromResume(activeResume, journalList, reviewLogs);

    // Build graph to populate reverse relations (contributesTo)
    buildDerivationGraph(facts, activeResume, journalList, reviewLogs);

    const fact = facts.find((f) => f.id === factId);
    if (!fact) {
      return NextResponse.json({ error: "Fact not found" }, { status: 404 });
    }

    return NextResponse.json({ fact });
  } catch (err: unknown) {
    console.error("Fact GET error:", err);
    return NextResponse.json({ error: "Failed to fetch fact details" }, { status: 500 });
  }
}

// Handles POST for confirm/reject, or PATCH for edit
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
    const action = body.action || "confirm"; // 'confirm' | 'reject' | 'edit'
    const { statement, rejectionReason, category, sourceType } = body;

    const status = action === "confirm" ? "CONFIRMED" : action === "edit" ? "EDITED" : "REJECTED";

    // Persist to career_journal_entries
    const adminSupabase = createAdminClient();
    const journalEntry = {
      user_id: user.id,
      date: new Date().toISOString().split("T")[0],
      entry_type: action === "reject" ? "gap" : "skill",
      content:
        action === "confirm"
          ? `Confirmed career fact: ${statement || factId}`
          : action === "edit"
          ? `Edited career fact: ${statement}`
          : `Rejected career fact: ${statement || factId} (Reason: ${rejectionReason || "Not accurate"})`,
      source: "prompted",
      tags: ["FactReview", action, status],
      extracted_metrics: {
        factId,
        action,
        status,
        statement,
        editedText: statement,
        rejectionReason,
        category,
        sourceType,
        confirmedAt: new Date().toISOString(),
      },
    };

    const { error: insertError } = await adminSupabase
      .from("career_journal_entries")
      .insert([journalEntry]);

    if (insertError) {
      console.error("Error inserting fact review journal entry:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      factId,
      status,
      message: `Fact ${status.toLowerCase()} successfully.`,
    });
  } catch (err: unknown) {
    console.error("Fact review POST error:", err);
    return NextResponse.json(
      { error: "Failed to process fact review" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    if (!statement || typeof statement !== "string") {
      return NextResponse.json({ error: "Statement is required" }, { status: 400 });
    }

    const adminSupabase = createAdminClient();
    const journalEntry = {
      user_id: user.id,
      date: new Date().toISOString().split("T")[0],
      entry_type: "skill",
      content: `Edited career fact: ${statement}`,
      source: "prompted",
      tags: ["FactReview", "edit", "EDITED"],
      extracted_metrics: {
        factId,
        action: "edit",
        status: "EDITED",
        statement,
        editedText: statement,
        category,
        sourceType,
        editedAt: new Date().toISOString(),
      },
    };

    const { error } = await adminSupabase
      .from("career_journal_entries")
      .insert([journalEntry]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      factId,
      status: "EDITED",
      statement,
      message: "Fact updated successfully.",
    });
  } catch (err: unknown) {
    console.error("Fact review PATCH error:", err);
    return NextResponse.json(
      { error: "Failed to edit fact" },
      { status: 500 }
    );
  }
}
