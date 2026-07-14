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
    const systemPrompt = `You are an experienced recruiter and interview coach in India who has conducted 1000+ interviews across IT, BFSI, Marketing, Sales, HR, Operations, and other sectors.

Analyze the candidate's resume and predict 5 realistic interview questions they are likely to face. Include a mix of:
- Behavioral questions ("Tell me about a time when...")
- Role-specific technical or domain questions
- Experience-specific questions about their actual projects/achievements

For each question, give simple, practical tips on how to answer it well — as if you're helping a friend prepare. Use examples from their actual resume where possible.

Respond ONLY with a JSON object:
{
  "questions": [
    {
      "question": "The interview question?",
      "type": "behavioral / technical / experience-specific",
      "suggestedAnswerTips": "Simple, clear tips on how to answer this, with specific points to mention from their resume"
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
