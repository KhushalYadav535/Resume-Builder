import { NextRequest, NextResponse } from "next/server";
import { askAIJSON } from "@/lib/openrouter";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

interface SkillGapResult {
  matchedSkills: string[];
  missingSkills: string[];
  recommendedCourses: string[];
  gapPercentage: number;
  estimatedWeeksToClose: number;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { resumeId, targetRole } = await req.json();
    if (!resumeId || !targetRole) {
      return NextResponse.json({ error: "Missing resumeId or targetRole." }, { status: 400 });
    }

    const { data: resume, error: resError } = await supabase
      .from("resumes")
      .select("resume_data")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();

    if (resError || !resume) {
      return NextResponse.json({ error: "Resume not found." }, { status: 404 });
    }

    const prompt = `Candidate Resume Data:\n${JSON.stringify(resume.resume_data)}\n\nTarget Job Role:\n${targetRole}`;
    const systemPrompt = `You are a highly experienced technical recruiter and career development advisor. 
Analyze the candidate's resume data against the standard industry requirements for the provided Target Job Role.
Perform a rigorous and strict evaluation of their current skills versus what is actually demanded by top-tier employers for this role.

1. Extract matched skills (what they have that is relevant).
2. Identify critical missing skills (what they lack but is essential for the target role). Be highly critical.
3. Recommend 3-5 specific, modern learning topics or certifications they should pursue to bridge the gap.
4. Calculate a strict gap percentage (0-100%, where 0% means perfectly qualified and 100% means completely unqualified).
5. Estimate the total number of weeks of focused learning needed to close the gap (be realistic: 1-52 weeks).

Respond ONLY with a valid JSON object of this exact structure, with no markdown formatting outside the JSON:
{
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["missing1", "missing2"],
  "recommendedCourses": ["Specific Certification/Topic 1", "Specific Certification/Topic 2"],
  "gapPercentage": 45,
  "estimatedWeeksToClose": 6
}`;

    const result = await askAIJSON<SkillGapResult>(prompt, systemPrompt);
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("Skill gap analysis failed:", err);
    return NextResponse.json({ error: "Failed to perform skill gap analysis." }, { status: 500 });
  }
}
