import { NextRequest, NextResponse } from "next/server";
import { askAIJSON } from "@/lib/openrouter";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

interface NaukriTipsResult {
  tips: {
    area: string;      // e.g. "Headline", "Key Skills", "Notice Period"
    tip: string;       // detailed suggestion
    priority: "High" | "Medium" | "Low";
  }[];
}

/**
 * POST /api/naukri-tips
 * Analyzes resume and generates Indian job-portal (Naukri.com) optimizing tips.
 */
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

    // Fetch resume
    const { data: resume, error } = await supabase
      .from("resumes")
      .select("raw_text, resume_data")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();

    if (error || !resume) {
      return NextResponse.json({ error: "Resume record not found." }, { status: 404 });
    }

    const prompt = `You are an expert recruiter specialized in the Indian job market, particularly Naukri.com, Shine.com, and LinkedIn India.
Analyze the following resume details and generate 4-5 actionable tips to optimize recruiter search rankings (indexing), resume headline matching, and key skills tags for Indian job portals.

RESUME CONTENT:
${resume.raw_text}

Respond ONLY with a JSON object in this exact format:
{
  "tips": [
    {
      "area": "Area of Profile (e.g. Profile Summary, Key Skills tags, Notice Period, Headline)",
      "tip": "Actionable advice on how to improve indexing or formatting",
      "priority": "High" or "Medium" or "Low"
    }
  ]
}`;

    const systemPrompt = "You are an Indian recruitment expert. You write actionable portal tips. You output ONLY valid JSON.";
    const result = await askAIJSON<NaukriTipsResult>(prompt, systemPrompt);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Naukri tips generation failed:", err);
    return NextResponse.json({ error: err.message || "Failed to generate job portal optimization tips." }, { status: 500 });
  }
}
