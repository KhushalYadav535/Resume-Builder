import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { askAIJSON } from "@/lib/openrouter";

export const dynamic = "force-dynamic";

export interface ImpactInterpretation {
  problem: string;
  contribution: string;
  potentialImpact: string;
  evidenceStatus: string;
  suggestedBulletRewrite: string;
  confidence: "High" | "Medium" | "Inferred";
  discoveryPrompt?: string;
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

    const problem = step1Answer?.trim() || "Operational bottleneck or technical constraint";
    const contribution = step2Answer?.trim() || "Spearheaded technical implementation and workflow hygiene";
    const outcome = step3Answer?.trim() || "Delivered measurable quality and performance improvement";

    // Determine evidence status
    const hasNumbers = /\d+|%|\$|₹|hours|x|days|users/i.test(outcome);
    const evidenceStatus = hasNumbers
      ? "User-confirmed with quantified impact metric"
      : "User-reported qualitative improvement (unquantified)";

    const confidence = hasNumbers ? "High" : "Medium";

    // Fallback template
    let suggestedBulletRewrite = `${contribution} to resolve ${problem.toLowerCase()}, achieving ${outcome.toLowerCase()}.`;
    let discoveryPrompt = hasNumbers
      ? "Would you like to highlight this verified achievement on your primary resume?"
      : "Could you estimate the percentage or time saved to turn this into a strong quantified metric?";

    // Attempt AI-assisted STAR polish
    try {
      const systemPrompt = `You are an expert executive resume editor and career value interpreter.
Synthesize the candidate's Situation/Problem, Task/Contribution, and Outcome into one punchy, high-impact STAR resume bullet point.
- Start with a strong action verb (e.g. Engineered, Spearheaded, Architected, Streamlined, Accelerated, Delivered).
- Clearly link the action to the resolved problem and business outcome.
- Maintain professional tone, active voice, and crisp phrasing.
- If numbers or metrics are provided in the outcome, preserve them prominently.

Respond ONLY with valid JSON:
{
  "bulletRewrite": string,
  "discoveryPrompt": string
}`;

      const aiResponse = await askAIJSON<{ bulletRewrite: string; discoveryPrompt: string }>(
        `Problem/Context: ${problem}\nContribution/Action: ${contribution}\nOutcome/Result: ${outcome}\nOriginal Context: ${originalText || recordTitle || ""}`,
        systemPrompt,
        1,
        0.2
      );

      if (aiResponse?.bulletRewrite) {
        suggestedBulletRewrite = aiResponse.bulletRewrite;
      }
      if (aiResponse?.discoveryPrompt) {
        discoveryPrompt = aiResponse.discoveryPrompt;
      }
    } catch (aiErr) {
      console.warn("AI STAR rewrite fallback used:", aiErr);
    }

    const interpretation: ImpactInterpretation = {
      problem,
      contribution,
      potentialImpact: outcome,
      evidenceStatus,
      suggestedBulletRewrite,
      confidence,
      discoveryPrompt,
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
