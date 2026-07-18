import { NextRequest, NextResponse } from "next/server";
import { askAIJSON } from "@/lib/openrouter";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

interface GrammarCheckResult {
  hasIssues: boolean;
  suggestions: {
    original: string;
    corrected: string;
    explanation: string;
  }[];
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { text } = await req.json();
    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Missing text to check." }, { status: 400 });
    }

    const systemPrompt = `You are a professional editor. Analyze the provided resume text for grammatical errors, spelling mistakes, passive voice, and weak wording.
Respond ONLY with a JSON object of the following format:
{
  "hasIssues": true/false,
  "suggestions": [
    {
      "original": "original sentence/phrase with issue",
      "corrected": "corrected version",
      "explanation": "brief explanation of the fix"
    }
  ]
}`;

    const result = await askAIJSON<GrammarCheckResult>(text, systemPrompt);
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("Grammar check failed:", err);
    return NextResponse.json({ error: "Failed to perform grammar check." }, { status: 500 });
  }
}
