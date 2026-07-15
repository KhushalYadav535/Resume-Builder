import { NextRequest, NextResponse } from "next/server";
import { askAI } from "@/lib/openrouter";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { resumeId } = await req.json();
    if (!resumeId) {
      return NextResponse.json({ error: "Missing resumeId." }, { status: 400 });
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

    const resumeText = JSON.stringify(resume.resume_data);
    const systemPrompt = `You are a master executive communication coach and storytelling expert. 
Write a highly compelling, narrative-focused "Tell me about yourself" elevator pitch script (approx. 200-300 words) using the candidate's resume data.
Ensure the pitch:
1. Opens with a strong, memorable hook about their core professional identity.
2. Weaves together their most impressive achievements and quantifiable impacts naturally.
3. Highlights their unique value proposition and current career trajectory.
4. Concludes with a forward-looking statement that seamlessly transitions into why they are excited about their next opportunity.
Make it sound conversational, confident, authentic, and natural to deliver in under 2 minutes. Do NOT use overly flowery language; keep it punchy and impactful.
Return ONLY the raw script text. No intro/outro conversational remarks.`;

    const result = await askAI(resumeText, systemPrompt);
    return NextResponse.json({ script: result.trim() });
  } catch (err: any) {
    console.error("Career story failed:", err);
    return NextResponse.json({ error: err.message || "Failed to generate career story." }, { status: 500 });
  }
}
