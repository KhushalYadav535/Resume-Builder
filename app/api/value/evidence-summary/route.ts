import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

export interface EvidenceSummaryData {
  totalEvidence: number;
  impactCount: number;
  recognitionCount: number;
  progressionCount: number;
  feedbackCount: number;
  recentEntries: {
    type: string;
    content: string;
    date: string;
    tags: string[];
  }[];
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminSupabase = createAdminClient();
    const { data: entries, error } = await adminSupabase
      .from("career_journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const list = Array.isArray(entries) ? entries : [];

    let impactCount = 0;
    let recognitionCount = 0;
    let progressionCount = 0;
    let feedbackCount = 0;

    list.forEach((entry: any) => {
      const type = entry.entry_type || "";
      const tags = entry.tags || [];

      if (type === "impact" || tags.includes("GuidedImpact")) {
        impactCount++;
      }
      if (type === "award" || tags.includes("Stage3Evidence")) {
        recognitionCount++;
      }
      if (type === "promotion" || type === "win") {
        progressionCount++;
      }
      if (type === "feedback") {
        feedbackCount++;
      }
    });

    const summary: EvidenceSummaryData = {
      totalEvidence: list.length,
      impactCount,
      recognitionCount,
      progressionCount,
      feedbackCount,
      recentEntries: list.slice(0, 5).map((e: any) => ({
        type: e.entry_type || "unknown",
        content: e.content || "",
        date: e.date || e.created_at?.split("T")[0] || "",
        tags: e.tags || [],
      })),
    };

    return NextResponse.json({ summary });
  } catch (err: unknown) {
    console.error("Evidence summary error:", err);
    return NextResponse.json(
      { error: "Failed to fetch evidence summary" },
      { status: 500 }
    );
  }
}
