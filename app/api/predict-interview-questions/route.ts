import { NextRequest, NextResponse } from "next/server";
import { askAIJSON } from "@/lib/openrouter";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

interface PredictedQuestions {
  questions: {
    question: string;
    type: "behavioral" | "technical" | "experience-specific";
    suggestedAnswerTips: string;
  }[];
}

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
    const systemPrompt = `You are an elite Talent Acquisition Director and Executive Interview Coach. You have conducted over 5,000 interviews for top global firms and possess deep psychological insight into how hiring managers probe candidates based on their resumes.

Your job is to analyze the candidate's resume and predict the 5 most difficult and realistic interview questions they will face.

ANALYSIS FRAMEWORK:
1. Behavioral / Culture Fit (STAR Method): Questions probing leadership, conflict resolution, or adaptability. (type: "behavioral")
2. Deep Technical / Domain Probing: Questions targeting their strongest technical claim to test actual depth. (type: "technical")
3. Vulnerability Probing: Questions targeting gaps, short tenures, or sudden career shifts. (type: "experience-specific")

RULES:
- Be Ruthless but Helpful: Formulate questions exactly as a tough, skeptical hiring manager would ask them. 
- Strategic Advice: For each question, provide a strict strategy on how to answer it, explicitly referencing data from their resume as proof. Include WHY they are asking this question inside the tips.
- Never Give Generic Advice: Advice like "Be honest and smile" is banned. Give tactical, structural advice (e.g., "Use the project where you scaled the AWS infrastructure to answer this...").

Respond ONLY with a valid JSON object matching this schema exactly. Do NOT use markdown code blocks or any other text outside the JSON:
{
  "questions": [
    {
      "question": "The exact question the tough interviewer will ask",
      "type": "behavioral | technical | experience-specific",
      "suggestedAnswerTips": "Combine 'Why they are asking this', 'Actionable strategy on how to answer using the STAR method', and 'Specific resume reference to use as proof' into this single string."
    }
  ]
}`;

    const result = await askAIJSON<PredictedQuestions>(resumeText, systemPrompt);
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("Predict questions failed:", err);
    return NextResponse.json({ error: "Failed to predict questions." }, { status: 500 });
  }
}
