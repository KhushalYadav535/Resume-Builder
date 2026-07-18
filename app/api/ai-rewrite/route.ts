import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { askAIJSON } from "@/lib/openrouter";
import { apiLimiter, getIP } from "@/lib/rateLimit";
import { checkAndDeductCredits } from "@/lib/billing";

export const dynamic = "force-dynamic";

interface RewriteSuggestion {
  suggestions: string[];
}

/**
 * POST /api/ai-rewrite
 * Generates 2-3 AI-powered rewrite suggestions for a specific text block.
 * Optionally uses a target Job Description to tailor the rewrites.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    try {
      await apiLimiter.check(20, getIP(req));
    } catch {
      return NextResponse.json(
        { error: "Too many AI rewrite requests. Please try again later." },
        { status: 429 }
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // --- CREDIT CONSUMPTION GUARD ---
    const billingCheck = await checkAndDeductCredits(user.id, 10, "AI Resume Edit");
    if (!billingCheck.allowed) {
      return NextResponse.json(
        { error: billingCheck.error || "Insufficient credits." },
        { status: 403 }
      );
    }
    // --------------------------------

    const { text, context, targetJobDescription, atsMissingKeywords, atsIndustry } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "No text provided to rewrite." },
        { status: 400 }
      );
    }

    const hasJD = !!targetJobDescription && targetJobDescription.trim().length > 0;
    const hasATS = atsMissingKeywords && atsMissingKeywords.length > 0;

    const prompt = `You are a master resume copywriter and ATS algorithm specialist. You specialize in transforming weak, passive resume bullet points into high-impact, metric-driven achievements that score in the top 1% of ATS parsing engines (Workday, Greenhouse, Lever).

TASK: Rewrite the following resume text into exactly 3 variations based on strict optimization dimensions.

ANALYSIS FRAMEWORK:
1. Action-Verb Led: Every variation must begin with a high-impact, specific action verb (e.g., Architected, Spearheaded, Orchestrated).
2. Outcome-First Structure: Structure bullets to highlight the *result* first, followed by the *method*.
3. JD & ATS Alignment: Weave in target keywords naturally without keyword stuffing.

RULES:
- No Hallucinations: You must NOT invent numbers, team sizes, or revenue impacts. If a metric is implied, you may add a placeholder like [XX]%, but never a fake number.
- Distinct Variations:
  Variation 1: Highly technical and keyword-dense (best for ATS).
  Variation 2: Leadership & impact focused (best for Hiring Managers).
  Variation 3: Concise and punchy (best for quick scanning).

SECTION CONTEXT: ${context || "Resume section"}

ORIGINAL TEXT TO REWRITE:
"${text}"

${hasJD ? `TARGET JOB DESCRIPTION (align rewrites with these keywords and requirements):
${targetJobDescription}

IMPORTANT: Each rewrite MUST naturally incorporate relevant keywords from this job description while maintaining authenticity.` : ""}

${hasATS ? `ATS OPTIMIZATION CONTEXT:
The user is targeting the "${atsIndustry || "relevant"}" industry. The resume is currently missing these critical ATS keywords:
${atsMissingKeywords.join(", ")}

IMPORTANT: Naturally weave as many of these missing ATS keywords into the rewrite as possible.` : ""}

Return a JSON object with this exact structure (do NOT use nested objects for variations, keep it as an array of 3 string variations to match the expected schema):
{
  "suggestions": [
    "Variation 1: [Technical & ATS Optimized rewrite text...]",
    "Variation 2: [Leadership & Impact Focused rewrite text...]",
    "Variation 3: [Concise & Punchy rewrite text...]"
  ]
}

Output ONLY valid JSON. No markdown, no backticks, no explanation.`;

    const result = await askAIJSON<RewriteSuggestion>(
      prompt,
      "You are a professional resume rewriting expert. You output ONLY valid JSON."
    );

    // Validate the result
    if (!result.suggestions || !Array.isArray(result.suggestions) || result.suggestions.length === 0) {
      throw new Error("AI returned invalid suggestion format.");
    }

    return NextResponse.json({ suggestions: result.suggestions });
  } catch (err: unknown) {
    console.error("AI Rewrite failed:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred while rewriting the text." },
      { status: 500 }
    );
  }
}
