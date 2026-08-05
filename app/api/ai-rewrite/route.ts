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
 * Uses strict anti-hallucination rules and applies the humanization layer.
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
    const billingCheck = await checkAndDeductCredits(user.id, 5, "AI Resume Edit");
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

    const prompt = `You are an executive resume copywriter specializing in authentic, high-impact resume bullet rewrites.

TASK: Rewrite the following resume text into exactly 3 variations based on strict optimization dimensions.

RULES:
- NO HALLUCINATIONS: You MUST NOT invent metrics, accuracy percentages, team sizes, or revenue numbers not present in original text.
- NO TEMPLATE PLACEHOLDERS: Do NOT output placeholders like "Company Name", "Professional Role", etc.
- AUTHENTIC HUMAN TONE: Write in clean, natural human phrasing. Avoid robotic AI cliché buzzwords.

SECTION CONTEXT: ${context || "Resume section"}

ORIGINAL TEXT TO REWRITE:
"${text}"

${hasJD ? `TARGET JOB DESCRIPTION:
${targetJobDescription}` : ""}

${hasATS ? `ATS MISSING KEYWORDS:
${atsMissingKeywords.join(", ")}` : ""}

Return a JSON object with this exact structure:
{
  "suggestions": [
    "Variation 1: [ATS Optimized rewrite text...]",
    "Variation 2: [Leadership & Impact Focused rewrite text...]",
    "Variation 3: [Concise & Punchy rewrite text...]"
  ]
}

Output ONLY valid JSON.`;

    const result = await askAIJSON<RewriteSuggestion>(
      prompt,
      "You are a professional resume copywriter who strictly adheres to truthfulness and natural human phrasing."
    );
    
    // Post-process with humanization layer to bypass AI detectors and clean cliché buzzwords
    const { humanizeText } = await import("@/lib/humanizer");
    const humanizedSuggestions = (result?.suggestions || []).map((s) => humanizeText(s));

    return NextResponse.json({
      suggestions: humanizedSuggestions,
    });
  } catch (err: any) {
    console.error("AI Rewrite error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate rewrite suggestions." },
      { status: 500 }
    );
  }
}
