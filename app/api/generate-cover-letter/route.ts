import { NextRequest, NextResponse } from "next/server";
import { askAI } from "@/lib/openrouter";
import { createClient } from "@/utils/supabase/server";
import { checkAndDeductCredits } from "@/lib/billing";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // --- CREDIT CONSUMPTION GUARD ---
    const billingCheck = await checkAndDeductCredits(user.id, 20, "Cover Letter Generation");
    if (!billingCheck.allowed) {
      return NextResponse.json(
        { error: billingCheck.error || "Insufficient credits." },
        { status: 403 }
      );
    }
    // --------------------------------

    const { resumeId, jobDescription } = await req.json();
    if (!resumeId || !jobDescription) {
      return NextResponse.json({ error: "Missing resumeId or jobDescription." }, { status: 400 });
    }

    // Fetch resume record
    const { data: resume, error: resError } = await supabase
      .from("resumes")
      .select("resume_data")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();

    if (resError || !resume) {
      return NextResponse.json({ error: "Resume not found or access denied." }, { status: 404 });
    }

    const resumeContent = JSON.stringify(resume.resume_data);
    const prompt = `Resume Content:\n${resumeContent}\n\nJob Description:\n${jobDescription}`;

    const systemPrompt = `You are a seasoned recruiter and resume writer. 
Write a highly professional, tailored cover letter using the candidate's resume details and the target Job Description.
Ensure it uses a standard business format, focuses on matching achievements, remains concise (under 400 words), and highlights local currency/metrics if applicable.
Return ONLY the cover letter text. No chat intro, no markdown code blocks. Just the raw letter text.`;

    const result = await askAI(prompt, systemPrompt);
    return NextResponse.json({ letter: result.trim() });
  } catch (err: any) {
    console.error("Cover letter generation failed:", err);
    return NextResponse.json({ error: err.message || "Failed to generate cover letter." }, { status: 500 });
  }
}
