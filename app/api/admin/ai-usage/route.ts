import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { isAdmin } from "@/lib/isAdmin";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/ai-usage
 * Returns list of recent AI requests and aggregated metrics for the AI usage dashboard.
 */
export async function GET(req: NextRequest) {
  try {
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json({ error: "Forbidden. Admin rights required." }, { status: 403 });
    }

    const supabase = await createClient();

    // Query recent 150 AI request logs
    const { data: logs, error: logsError } = await supabase
      .from("ai_requests")
      .select("id, model_used, tokens_estimated, success, created_at, user_profiles(email)")
      .order("created_at", { ascending: false })
      .limit(150);

    if (logsError) {
      console.warn("Error querying ai_requests table (might not be migrated yet):", logsError.message);
      return NextResponse.json({ logs: [], stats: { totalRequests: 0, successCount: 0, failCount: 0, totalTokens: 0, successRate: 0, modelCounts: {} } });
    }

    // Process aggregates
    let totalRequests = logs?.length || 0;
    let successCount = 0;
    let failCount = 0;
    let totalTokens = 0;
    const modelCounts: Record<string, number> = {};

    logs?.forEach((log: any) => {
      if (log.success) {
        successCount++;
      } else {
        failCount++;
      }
      totalTokens += log.tokens_estimated || 0;
      
      const model = log.model_used || "unknown";
      modelCounts[model] = (modelCounts[model] || 0) + 1;
    });

    const successRate = totalRequests > 0 ? Math.round((successCount / totalRequests) * 100) : 100;

    return NextResponse.json({
      success: true,
      logs: logs || [],
      stats: {
        totalRequests,
        successCount,
        failCount,
        totalTokens,
        successRate,
        modelCounts,
      }
    });
  } catch (err: any) {
    console.error("Fetch AI usage logs failed:", err);
    return NextResponse.json({ error: err.message || "Failed to query AI usage statistics." }, { status: 500 });
  }
}
