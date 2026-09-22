import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export interface ImpactInterpretation {
  problem: string;
  contribution: string;
  potentialImpact: string;
  evidenceStatus: string;
  suggestedBulletRewrite: string;
  confidence: "High" | "Medium" | "Inferred";
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      gapId,
      originalText,
      recordTitle,
      recordSubtitle,
      step1Answer,
      step2Answer,
      step3Answer,
    } = body;

    const problem = step1Answer?.trim() || "Unspecified friction or operational challenge";
    const contribution = step2Answer?.trim() || "Led key technical execution";
    const outcome = step3Answer?.trim() || "Demonstrated measurable improvement";

    // Determine evidence status
    const hasNumbers = /\d+|%|\$|₹|hours|x/i.test(outcome);
    const evidenceStatus = hasNumbers
      ? "User-confirmed with quantified impact metric"
      : "User-reported qualitative improvement (unquantified)";

    const confidence = hasNumbers ? "High" : "Medium";

    // Generate polished STAR bullet point combining original action + problem + outcome
    const suggestedBulletRewrite = `${contribution} to address ${problem.toLowerCase()}, resulting in ${outcome.toLowerCase()}.`;

    const interpretation: ImpactInterpretation = {
      problem,
      contribution,
      potentialImpact: outcome,
      evidenceStatus,
      suggestedBulletRewrite,
      confidence,
    };

    return NextResponse.json({ interpretation });
  } catch (err: unknown) {
    console.error("Interpretation error:", err);
    return NextResponse.json(
      { error: "Failed to interpret impact" },
      { status: 500 }
    );
  }
}
