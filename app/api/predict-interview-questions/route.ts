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
    const systemPrompt = `You are an elite talent acquisition specialist and executive interview coach. You have extensive experience interviewing candidates across global and Indian markets (IT, BFSI, Marketing, Sales, Healthcare, etc.).

Analyze the candidate's resume data and predict 5 realistic, challenging interview questions they are likely to face. Ensure a mix of:
1. Behavioral questions (e.g., STAR method scenarios, leadership, conflict resolution)
2. Role-specific technical or domain-knowledge questions
3. Experience-specific questions scrutinizing their actual projects and achievements

For each question, provide highly actionable, precise talking points and strategies for answering. Advise the candidate on how to frame their response using specific data points or experiences extracted directly from their resume to build a compelling narrative.

Respond ONLY with a valid JSON object matching this schema exactly, and do not include markdown blocks or any other text outside the JSON:
{
  "questions": [
    {
      "question": "The predicted interview question",
      "type": "behavioral | technical | experience-specific",
      "suggestedAnswerTips": "Strategic advice and talking points on how to answer, explicitly linking back to their resume contents."
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
