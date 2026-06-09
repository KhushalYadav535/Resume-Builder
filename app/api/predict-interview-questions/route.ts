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
    const systemPrompt = `You are a technical recruiter and interviewer. Analyze the candidate's resume. 
Predict 5 realistic interview questions (behavioral, technical, and experience-specific) they are likely to face.
For each question, provide high-quality suggested answer tips or talking points.
Respond ONLY with a JSON object of this structure:
{
  "questions": [
    {
      "question": "Question text here?",
      "type": "behavioral / technical / experience-specific",
      "suggestedAnswerTips": "Tips on how to structure the answer, what to highlight, etc."
    }
  ]
}`;

    const result = await askAIJSON<PredictedQuestions>(resumeText, systemPrompt);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Predict questions failed:", err);
    return NextResponse.json({ error: err.message || "Failed to predict questions." }, { status: 500 });
  }
}
