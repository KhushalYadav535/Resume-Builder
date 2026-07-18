import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();

    // 1. Total Resumes Optimized
    const { count: totalResumes, error: resumeError } = await supabase
      .from("resumes")
      .select("*", { count: "exact", head: true });

    if (resumeError) throw resumeError;

    // 2. AI Runs (total analyses run)
    const { count: aiRunsCount, error: aiError } = await supabase
      .from("resumes")
      .select("*", { count: "exact", head: true })
      .not("ats_score", "is", null);

    if (aiError) throw aiError;

    // 3. Average ATS score of optimized resumes
    const { data: resumes, error: listError } = await supabase
      .from("resumes")
      .select("ats_score")
      .not("ats_score", "is", null);

    if (listError) throw listError;

    let totalScore = 0;
    let scoredCount = 0;

    resumes?.forEach((r) => {
      if (r.ats_score && typeof r.ats_score === "object") {
        const overall = (r.ats_score as any).overall;
        if (typeof overall === "number") {
          totalScore += overall;
          scoredCount++;
        }
      }
    });

    const averageATS = scoredCount > 0 ? Math.round(totalScore / scoredCount) : 75;

    return NextResponse.json({
      success: true,
      stats: {
        totalResumes: totalResumes || 0,
        aiRunsCount: aiRunsCount || 0,
        averageATS: averageATS
      }
    });
  } catch (error: unknown) {
    console.error("Failed to fetch public stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats. Please try again." },
      { status: 500 }
    );
  }
}
