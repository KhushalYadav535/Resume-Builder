import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { askAIJSON } from "@/lib/openrouter";
import { ContentReview, JDMatch } from "@/types";

export const dynamic = "force-dynamic";

interface DeepAnalysisResult {
  contentReview: ContentReview;
  jdMatch: JDMatch | null;
}

/**
 * API route to perform heavy LLM AI Enhancement on-demand.
 * Updates the existing resume row in Supabase with content review and JD match insights.
 * POST /api/analyze-resume/deep
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify authenticated session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized access. Missing active auth session." },
        { status: 401 }
      );
    }

    const { resumeId, jobDescription } = await req.json();
    if (!resumeId) {
      return NextResponse.json({ error: "No resume ID provided" }, { status: 400 });
    }

    // Retrieve the existing locally parsed resume from the database
    const { data: dbResume, error: fetchError } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .eq("user_id", user.id) // Security check: Ensure they own the resume
      .single();

    if (fetchError || !dbResume) {
      return NextResponse.json(
        { error: "Resume record not found or access denied." },
        { status: 404 }
      );
    }

    const hasJD = !!jobDescription && jobDescription.trim().length > 0;

    // Build the consolidated prompt for deep AI enhancement
    const prompt = `You are a world-class executive recruiter and professional resume writer.
Audit the following resume text for quality, achievements, active action verbs, and quantified metrics.

RESUME RAW TEXT:
${dbResume.raw_text}

${hasJD ? `JOB DESCRIPTION FOR ALIGNMENT:
${jobDescription}` : ""}

Analyze the resume and return a single, structured JSON object matching this exact TypeScript structure:

interface ContentReviewSection {
  section: string; // e.g. Work Experience, Summary
  issues: string[]; // specific issues with active voice or metrics
  suggestions: string[]; // concrete improvement tips
  improvedVersion?: string; // rewritten version of a weak bullet point or section
}

interface ContentReview {
  overallFeedback: string; // 2-3 sentence strategic critique
  sections: ContentReviewSection[];
  actionVerbSuggestions: string[]; // e.g. ["Replace 'responsible for X' with 'Spearheaded X'"]
  quantificationTips: string[]; // e.g. ["Specify how much revenue was generated or size of team led"]
}

interface JDMatch {
  matchScore: number; // 0-100 score
  matchedKeywords: string[]; // keywords from JD present in resume
  missingKeywords: string[]; // critical missing keywords
  suggestions: string[]; // suggestions to align resume to this specific JD
  priorityAdditions: string[]; // top 5 most important missing terms
}

interface DeepAnalysisResult {
  contentReview: ContentReview;
  jdMatch: JDMatch | null; // return null if no job description was provided
}

Instructions:
1. **contentReview**: Rewrite weak points. Focus on replacing passive language with strong action verbs (e.g. Spearheaded, Directed, Engineered) and highlighting where quantified impact/metrics are missing. Keep the suggestions and rewrites high-impact and concise. To prevent truncation and response size failures, limit the "sections" array to at most 3 sections (preferably Summary, Work Experience, and Projects).
2. **jdMatch**: ${hasJD ? "Compare the resume against the provided Job Description. Generate a precise keyword match gap analysis." : "Set this to null."}`;

    // Execute heavy LLM reasoning using strictly free OpenRouter failover chain
    const aiResult = await askAIJSON<DeepAnalysisResult>(
      prompt,
      "You are a professional CV writing expert and recruiter. You output ONLY valid JSON."
    );

    // Save AI results into the database record
    const { data: updatedData, error: updateError } = await supabase
      .from("resumes")
      .update({
        content_review: aiResult.contentReview,
        jd_match: aiResult.jdMatch || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", resumeId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json(updatedData);
  } catch (err: any) {
    console.error("Deep AI Analysis failed:", err);
    return NextResponse.json(
      { error: "Deep analysis failed: " + (err.message || String(err)) },
      { status: 500 }
    );
  }
}
