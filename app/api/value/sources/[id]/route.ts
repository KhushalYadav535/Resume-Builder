import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { Resume } from "@/types";
import {
  parseJournalReviewLogs,
  extractCareerFactsFromResume,
  getSourceDetail,
} from "@/lib/valueDerivationEngine";

export const dynamic = "force-dynamic";

// GET /api/value/sources/:id (Spec §22-24 & §30)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sourceId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let resumeQuery = supabase
      .from("resumes")
      .select("*")
      .eq("user_id", user.id);

    if (sourceId && sourceId !== "default" && sourceId !== "resume-source") {
      resumeQuery = resumeQuery.eq("id", sourceId);
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

    const sourceDetail = getSourceDetail(sourceId, facts, activeResume);

    return NextResponse.json({ source: sourceDetail });
  } catch (err: unknown) {
    console.error("Source GET error:", err);
    return NextResponse.json({ error: "Failed to fetch source provenance" }, { status: 500 });
  }
}
