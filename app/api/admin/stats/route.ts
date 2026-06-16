import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { isAdmin } from "@/lib/isAdmin";

export const dynamic = "force-dynamic";

/**
 * Secure API endpoint to fetch portfolio analytics.
 * Aggregates counts, average ATS scores, template distributions, and optimization timelines.
 * GET /api/admin/stats
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

    // Verify active logged-in session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized access. Missing active auth session." },
        { status: 401 }
      );
    }

    // Query all resumes owned by this user
    const { data: resumes, error } = await supabase
      .from("resumes")
      .select("id, file_name, ats_score, template_id, created_at, updated_at");

    if (error) {
      throw error;
    }

    const totalResumes = resumes?.length || 0;
    let totalScore = 0;
    let scoredCount = 0;
    const templateCounts: Record<string, number> = {};
    const recentActivity: any[] = [];

    resumes?.forEach((r) => {
      // Calculate scores average
      if (r.ats_score && typeof r.ats_score === "object") {
        const overall = (r.ats_score as any).overall;
        if (typeof overall === "number") {
          totalScore += overall;
          scoredCount++;
        }
      }

      // Aggregate template styles
      const template = r.template_id || "modern";
      templateCounts[template] = (templateCounts[template] || 0) + 1;

      // Add to recent activity timeline
      recentActivity.push({
        id: r.id,
        name: r.file_name,
        atsScore: r.ats_score ? (r.ats_score as any).overall : null,
        template: r.template_id,
        date: r.updated_at || r.created_at,
      });
    });

    const averageATS = scoredCount > 0 ? Math.round(totalScore / scoredCount) : 0;

    // Sort recent activity by date descending and limit to top 5
    recentActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const topActivity = recentActivity.slice(0, 5);

    return NextResponse.json({
      success: true,
      analytics: {
        totalResumes,
        averageATS,
        scoredResumesCount: scoredCount,
        templateDistribution: templateCounts,
        recentActivity: topActivity,
      },
    });
  } catch (err: any) {
    console.error("Failed to gather admin stats:", err);
    return NextResponse.json(
      { error: err.message || "Failed to query stats" },
      { status: 500 }
    );
  }
}
