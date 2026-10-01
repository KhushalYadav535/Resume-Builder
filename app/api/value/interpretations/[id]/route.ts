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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: interpretationId } = await params;
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
    const graph = buildDerivationGraph(facts, activeResume, journalList, reviewLogs);

    const allInterpretations = [
      ...graph.profile.capabilities,
      ...graph.profile.impact,
      ...graph.valuePatterns,
    ];

    const interpretation = allInterpretations.find((item) => item.id === interpretationId);

    if (!interpretation) {
      return NextResponse.json({ error: "Interpretation not found" }, { status: 404 });
    }

    const evidence = interpretation.supportingEvidence || [];
    const factList = evidence.flatMap((e) => e.facts || []);

    return NextResponse.json({
      interpretation,
      evidence,
      facts: factList,
    });
  } catch (err: unknown) {
    console.error("GET interpretation error:", err);
    return NextResponse.json(
      { error: "Failed to fetch interpretation" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: interpretationId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const {
      action, // 'accept' | 'edit' | 'reject'
      title,
      description,
      userNote,
      rejectionReason,
      type = "CAPABILITY",
    } = body;

    const status = action === "reject" ? "REJECTED" : action === "edit" ? "EDITED" : "ACCEPTED";

    const adminSupabase = createAdminClient();
    const journalEntry = {
      user_id: user.id,
      date: new Date().toISOString().split("T")[0],
      entry_type: action === "reject" ? "gap" : "skill",
      content:
        action === "accept"
          ? `Accepted AI interpretation: ${title}`
          : action === "edit"
          ? `Edited AI interpretation: ${title} - ${description}`
          : `Rejected AI interpretation: ${title} (Reason: ${rejectionReason || "Not representative"})`,
      source: "prompted",
      tags: ["InterpretationReview", type, action, status],
      extracted_metrics: {
        interpretationId,
        type,
        action,
        status,
        editedName: title,
        editedDescription: description,
        userNote,
        rejectionReason,
        reviewedAt: new Date().toISOString(),
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
      interpretationId,
      status,
      message: `Interpretation ${status.toLowerCase()} successfully.`,
    });
  } catch (err: unknown) {
    console.error("Interpretation review error:", err);
    return NextResponse.json(
      { error: "Failed to review interpretation" },
      { status: 500 }
    );
  }
}
