import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { Resume } from "@/types";
import {
  parseJournalReviewLogs,
  extractCareerFactsFromResume,
} from "@/lib/valueDerivationEngine";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const resumeId = searchParams.get("resumeId");
    const statusFilter = searchParams.get("status")?.toUpperCase();
    const categoryFilter = searchParams.get("category")?.toUpperCase();
    const sourceTypeFilter = searchParams.get("sourceType");
    const careerEventIdFilter = searchParams.get("careerEventId");
    const searchQuery = searchParams.get("q")?.toLowerCase();

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
    let facts = extractCareerFactsFromResume(activeResume, journalList, reviewLogs);

    // Apply Filters
    if (statusFilter && statusFilter !== "ALL") {
      facts = facts.filter((f) => f.status === statusFilter);
    }

    if (categoryFilter && categoryFilter !== "ALL") {
      facts = facts.filter((f) => f.category === categoryFilter);
    }

    if (sourceTypeFilter && sourceTypeFilter !== "ALL") {
      facts = facts.filter((f) => f.sourceType.toLowerCase() === sourceTypeFilter.toLowerCase());
    }

    if (careerEventIdFilter) {
      facts = facts.filter((f) => f.careerEventId === careerEventIdFilter);
    }

    if (searchQuery) {
      facts = facts.filter(
        (f) =>
          f.statement.toLowerCase().includes(searchQuery) ||
          f.sourceTitle.toLowerCase().includes(searchQuery) ||
          f.category.toLowerCase().includes(searchQuery)
      );
    }

    return NextResponse.json({
      facts,
      totalCount: facts.length,
      confirmedCount: facts.filter((f) => f.status === "CONFIRMED" || f.status === "EDITED").length,
      extractedCount: facts.filter((f) => f.status === "EXTRACTED").length,
      rejectedCount: facts.filter((f) => f.status === "REJECTED").length,
    });
  } catch (err: unknown) {
    console.error("Facts GET API error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve facts" },
      { status: 500 }
    );
  }
}
