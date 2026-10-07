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

// GET /api/value/evidence/:id (Spec §11-15 & §30)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: evidenceId } = await params;
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

    // Search across all derived interpretations to locate the evidence cluster
    let foundEvidenceItem: any = null;
    let foundInterpretation: any = null;

    const allInterpretations = [
      ...graph.profile.capabilities,
      ...graph.profile.impact,
      ...graph.valuePatterns,
    ];

    for (const interp of allInterpretations) {
      const match = interp.supportingEvidence?.find(
        (ev) => ev.evidenceId === evidenceId || ev.evidenceId.toLowerCase() === evidenceId.toLowerCase()
      );
      if (match) {
        foundEvidenceItem = match;
        foundInterpretation = interp;
        break;
      }
    }

    if (!foundEvidenceItem) {
      // Check fallback IDs
      const prefix = evidenceId.startsWith("ev-") ? evidenceId : `ev-${evidenceId}`;
      for (const interp of allInterpretations) {
        const match = interp.supportingEvidence?.find((ev) => ev.evidenceId === prefix);
        if (match) {
          foundEvidenceItem = match;
          foundInterpretation = interp;
          break;
        }
      }
    }

    if (!foundEvidenceItem) {
      return NextResponse.json({ error: "Evidence not found" }, { status: 404 });
    }

    return NextResponse.json({
      evidence: {
        id: foundEvidenceItem.evidenceId,
        title: foundEvidenceItem.statement,
        statement: foundEvidenceItem.statement,
        confidence: foundEvidenceItem.confidence || "Strong evidence",
        supports: foundEvidenceItem.supports || [
          {
            dimension: foundInterpretation?.dimension || "capabilities",
            label: foundInterpretation?.title || "Career Capability",
            interpretationId: foundInterpretation?.id,
          },
        ],
        facts: foundEvidenceItem.facts || [],
        parentInterpretation: foundInterpretation
          ? {
              id: foundInterpretation.id,
              title: foundInterpretation.title,
              type: foundInterpretation.type,
              status: foundInterpretation.status,
            }
          : null,
      },
    });
  } catch (err: unknown) {
    console.error("Evidence GET error:", err);
    return NextResponse.json({ error: "Failed to fetch evidence details" }, { status: 500 });
  }
}
