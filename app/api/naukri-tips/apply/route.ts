import { NextRequest, NextResponse } from "next/server";
import { askAIJSON } from "@/lib/openrouter";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

interface TipPatch {
  field: "summary" | "skills_technical" | "skills_soft" | "headline";
  currentValue: string;
  suggestedValue: string;
  explanation: string;
}

/**
 * POST /api/naukri-tips/apply
 * Takes a Naukri/LinkedIn SEO tip and generates a concrete, ready-to-apply
 * resume patch using AI. Returns the field to update and the suggested new value.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { resumeId, tipArea, tipText } = await req.json();

    if (!resumeId || !tipArea || !tipText) {
      return NextResponse.json(
        { error: "Missing required fields: resumeId, tipArea, tipText." },
        { status: 400 }
      );
    }

    // Fetch the resume data
    const { data: resume, error } = await supabase
      .from("resumes")
      .select("resume_data, raw_text")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();

    if (error || !resume) {
      return NextResponse.json({ error: "Resume not found." }, { status: 404 });
    }

    const resumeData = resume.resume_data as any;
    const currentSummary = resumeData?.summary || "";
    const currentTechnicalSkills = (resumeData?.skills?.technical || []).join(", ");
    const currentSoftSkills = (resumeData?.skills?.soft || []).join(", ");
    const currentRole = resumeData?.workExperience?.[0]?.role || "";
    const candidateName = resumeData?.personalInfo?.fullName || "the candidate";

    const prompt = `You are an expert at optimizing Indian job seeker profiles on Naukri.com and LinkedIn India.

The candidate's name is ${candidateName}, currently working as ${currentRole}.

OPTIMIZATION TIP TO APPLY:
Area: ${tipArea}
Tip: ${tipText}

CURRENT RESUME DATA:
- Professional Summary: "${currentSummary}"
- Technical Skills: ${currentTechnicalSkills}
- Soft Skills: ${currentSoftSkills}

Based on the tip above, generate a CONCRETE improvement to one specific field in their resume. The improvement should:
1. Directly implement the tip given
2. Be realistic and authentic (don't invent skills or experience)
3. Be optimized for Naukri.com search visibility and Indian recruiters
4. Sound natural and professional in English

Respond ONLY with this JSON structure:
{
  "field": "summary" | "skills_technical" | "skills_soft" | "headline",
  "currentValue": "the current text for that field",
  "suggestedValue": "the improved text that implements the tip",
  "explanation": "1 sentence explaining what changed and why it helps"
}

IMPORTANT:
- If field is "summary": rewrite/improve the professional summary
- If field is "skills_technical": return a comma-separated list of technical skills (add missing ones from the tip)
- If field is "skills_soft": return a comma-separated list of soft skills
- If field is "headline": suggest a strong Naukri headline (e.g. "Senior React Developer | 5 Years Experience | NodeJS | AWS")
- Keep it concise and practical`;

    const result = await askAIJSON<TipPatch>(
      prompt,
      "You are an Indian job portal optimization expert. You output ONLY valid JSON."
    );

    return NextResponse.json({ patch: result });
  } catch (err: unknown) {
    console.error("Naukri tip apply failed:", err);
    return NextResponse.json(
      { error: "Failed to generate tip patch." },
      { status: 500 }
    );
  }
}
