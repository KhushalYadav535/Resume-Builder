import { NextRequest, NextResponse } from "next/server";
import { askAIJSON } from "@/lib/openrouter";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

interface SkillGapResult {
  matchedSkills: string[];
  missingSkills: string[];
  recommendedCourses: string[];
  gapPercentage: number;
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
    const systemPrompt = `You are a skills development advisor. Compare the candidate's skills against standard requirements for the target role.
Analyze the matched skills, find critical missing skills, recommend 3 specific topics/courses they should learn, and calculate a gap percentage (0-100%).
Respond ONLY with a JSON object of this structure:
{
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["missing1", "missing2"],
  "recommendedCourses": ["course/topic name 1", "course/topic name 2"],
  "gapPercentage": 45
}`;

    const result = await askAIJSON<SkillGapResult>(prompt, systemPrompt);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Skill gap analysis failed:", err);
    return NextResponse.json({ error: err.message || "Failed to perform skill gap analysis." }, { status: 500 });
  }
}
