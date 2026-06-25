import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { askAIJSON } from "@/lib/openrouter";

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
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const { text, context, targetJobDescription } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "No text provided to rewrite." },
        { status: 400 }
      );
    }

    const hasJD = !!targetJobDescription && targetJobDescription.trim().length > 0;

    const prompt = `You are a world-class professional resume writer and ATS optimization expert.

TASK: Rewrite the following resume text into 3 highly optimized variations. Each variation must:
- Use strong, active action verbs (e.g., Spearheaded, Engineered, Orchestrated, Delivered)
- Include quantified metrics and impact wherever possible (e.g., "reduced latency by 40%", "managed team of 8")
- Be concise, direct, and ATS-friendly
- Sound natural and professional — not robotic or generic

SECTION CONTEXT: ${context || "Resume section"}

ORIGINAL TEXT TO REWRITE:
"${text}"

${hasJD ? `TARGET JOB DESCRIPTION (align rewrites with these keywords and requirements):
${targetJobDescription}

IMPORTANT: Each rewrite MUST naturally incorporate relevant keywords from this job description while maintaining authenticity. Do NOT fabricate skills or experience the original text doesn't imply.` : ""}

Return a JSON object with this exact structure:
{
  "suggestions": [
    "First optimized rewrite...",
    "Second optimized rewrite...",
    "Third optimized rewrite..."
  ]
}

Rules:
1. Each suggestion should be a distinctly different rewrite, not just minor word swaps
2. Keep each suggestion roughly the same length as the original (±20%)
3. Output ONLY valid JSON. No markdown, no backticks, no explanation.`;

    const result = await askAIJSON<RewriteSuggestion>(
      prompt,
      "You are a professional resume rewriting expert. You output ONLY valid JSON."
    );

    // Validate the result
    if (!result.suggestions || !Array.isArray(result.suggestions) || result.suggestions.length === 0) {
      throw new Error("AI returned invalid suggestion format.");
    }

    return NextResponse.json({ suggestions: result.suggestions });
  } catch (err: any) {
    console.error("AI Rewrite failed:", err);
    return NextResponse.json(
      { error: "Rewrite failed: " + (err.message || String(err)) },
      { status: 500 }
    );
  }
}
