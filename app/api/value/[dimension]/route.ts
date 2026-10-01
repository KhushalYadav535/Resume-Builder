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
  { params }: { params: Promise<{ dimension: string }> }
) {
  try {
    const { dimension } = await params;
    const dim = dimension.toLowerCase();

    const allowed = ["capabilities", "impact", "experience", "progression"];
    if (!allowed.includes(dim)) {
      return NextResponse.json(
        { error: `Invalid dimension: ${dimension}. Expected one of: ${allowed.join(", ")}` },
        { status: 400 }
      );
    }

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

    if (dim === "capabilities") {
      return NextResponse.json({
        dimension: "capabilities",
        items: graph.profile.capabilities,
      });
    }

    if (dim === "impact") {
      return NextResponse.json({
        dimension: "impact",
        items: graph.profile.impact,
      });
    }

    if (dim === "experience") {
      return NextResponse.json({
        dimension: "experience",
        data: graph.profile.experience,
      });
    }

    if (dim === "progression") {
      return NextResponse.json({
        dimension: "progression",
        data: graph.profile.progression,
      });
    }

    return NextResponse.json({ error: "Dimension not found" }, { status: 404 });
  } catch (err: unknown) {
    console.error("GET dimension API error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve value dimension" },
      { status: 500 }
    );
  }
}
