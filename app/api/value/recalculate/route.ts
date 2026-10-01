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
    const { resumeId } = body;

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
    const valueResponse = buildDerivationGraph(facts, activeResume, journalList, reviewLogs);

    return NextResponse.json({
      success: true,
      message: "Career Value successfully recalculated from confirmed facts graph.",
      ...valueResponse,
    });
  } catch (err: unknown) {
    console.error("Recalculate API error:", err);
    return NextResponse.json(
      { error: "Failed to recalculate Career Value" },
      { status: 500 }
    );
  }
}
