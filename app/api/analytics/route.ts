import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { isAdmin } from "@/lib/isAdmin";

export const dynamic = "force-dynamic";

/**
 * Platform Analytics API
 * GET /api/analytics
 * Returns overall system usage, signup & upload trends, templates, and scores.
 */
export async function GET(req: NextRequest) {
  try {
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json(
        { error: "Forbidden: Administrator permissions required." },
        { status: 403 }
      );
    }

    const supabase = await createClient();

    // 1. Total Users
    const { count: totalUsers, error: userError } = await supabase
      .from("user_profiles")
      .select("*", { count: "exact", head: true });

    if (userError) throw userError;

    // 2. Total Resumes
    const { count: totalResumes, error: resumeError } = await supabase
      .from("resumes")
      .select("*", { count: "exact", head: true });

    if (resumeError) throw resumeError;

    // 3. Resumes Uploaded Today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const { count: uploadedToday, error: uploadTodayError } = await supabase
      .from("resumes")
      .select("*", { count: "exact", head: true })
      .gte("created_at", todayStart.toISOString());

    if (uploadTodayError) throw uploadTodayError;

    // 4. AI Analysis Count (resumes with ats_score)
    const { count: aiAnalysesCount, error: aiError } = await supabase
      .from("resumes")
      .select("*", { count: "exact", head: true })
      .not("ats_score", "is", null);

    if (aiError) throw aiError;

    // 5. Deep Analysis Count (resumes with content_review)
    const { count: deepAnalysisCount, error: deepError } = await supabase
      .from("resumes")
      .select("*", { count: "exact", head: true })
      .not("content_review", "is", null);

    if (deepError) throw deepError;

    // 6. Average ATS Score & Template Distribution & Storage calculation
    const { data: resumes, error: listError } = await supabase
      .from("resumes")
      .select("ats_score, template_id, raw_text, created_at");

    if (listError) throw listError;

    let totalScore = 0;
    let scoredCount = 0;
    let textLength = 0;
    const templateCounts: Record<string, number> = {
      modern: 0,
      professional: 0,
      executive: 0,
      minimal: 0,
      creative: 0,
    };
    
    const uploadHistory: Record<string, number> = {};

    resumes?.forEach((r) => {
      // ATS Score sum
      if (r.ats_score && typeof r.ats_score === "object") {
        const overall = (r.ats_score as any).overall;
        if (typeof overall === "number") {
          totalScore += overall;
          scoredCount++;
        }
      }

      // Template choice distribution
      const template = r.template_id || "modern";
      templateCounts[template] = (templateCounts[template] || 0) + 1;

      // Storage estimate
      if (r.raw_text) {
        textLength += r.raw_text.length;
      }

      // Upload history group by day
      if (r.created_at) {
        const dateKey = new Date(r.created_at).toISOString().split("T")[0];
        uploadHistory[dateKey] = (uploadHistory[dateKey] || 0) + 1;
      }
    });

    const averageATS = scoredCount > 0 ? Math.round(totalScore / scoredCount) : 0;
    const storageUsedKb = Math.round(textLength / 1024);
    const storageUsedLabel = storageUsedKb > 1024 
      ? `${(storageUsedKb / 1024).toFixed(1)} MB` 
      : `${storageUsedKb} KB`;

    // 7. Signups History
    const { data: profiles, error: profileError } = await supabase
      .from("user_profiles")
      .select("created_at");

    if (profileError) throw profileError;

    const signupHistory: Record<string, number> = {};
    profiles?.forEach((p) => {
      if (p.created_at) {
        const dateKey = new Date(p.created_at).toISOString().split("T")[0];
        signupHistory[dateKey] = (signupHistory[dateKey] || 0) + 1;
      }
    });

    // Format histories as lists for charting
    const formatHistory = (historyObj: Record<string, number>) => {
      return Object.entries(historyObj)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-7); // Last 7 days
    };

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: totalUsers || 0,
        totalResumes: totalResumes || 0,
        uploadedToday: uploadedToday || 0,
        aiAnalysesCount: aiAnalysesCount || 0,
        deepAnalysisCount: deepAnalysisCount || 0,
        averageATS,
        templateDistribution: templateCounts,
        storageUsed: storageUsedLabel,
        signupsHistory: formatHistory(signupHistory),
        uploadsHistory: formatHistory(uploadHistory),
      },
    });
  } catch (err: any) {
    console.error("Platform stats fetch failed:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
