import { NextRequest, NextResponse } from "next/server";
import { askAIJSON } from "@/lib/openrouter";
import { createClient } from "@/utils/supabase/server";
import { JDMatch } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify authenticated session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized access. Missing active auth session." },
        { status: 401 }
      );
    }

    const { resumeData, jobDescription } = await req.json();

    if (!resumeData || !jobDescription) {
      return NextResponse.json(
        { error: "Missing resumeData or jobDescription in request body" },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a Senior Talent Acquisition Specialist and ATS Expert.
Your task is to analyze a candidate's resume data against a specific Job Description (JD).
Return a precise JSON output conforming to the following structure:
{
  "matchScore": <number between 0 and 100>,
  "matchedKeywords": [<string>, ...],
  "missingKeywords": [<string>, ...],
  "suggestions": [<string>, ...],
  "priorityAdditions": [<string>, <string>, <string>]
}

Rules:
1. matchScore: Be critical. 90+ means exact match, 70-80 means good match, <60 means poor match.
2. matchedKeywords: Keywords from the JD that are present in the resume (hard skills, soft skills, tools).
3. missingKeywords: Critical keywords from the JD that are missing from the resume.
4. suggestions: 3-5 specific, actionable suggestions on how to rephrase or add bullet points to better match the JD requirements.
5. priorityAdditions: The top 3 most important missing skills or experiences the candidate must add to pass the ATS for this specific job.`;

    const userPrompt = `--- TARGET JOB DESCRIPTION ---
${jobDescription}

--- CANDIDATE RESUME DATA ---
${JSON.stringify(resumeData, null, 2)}

Analyze the match and return the JSON.`;

    const result = await askAIJSON<JDMatch>(userPrompt, systemPrompt);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Failed JD Match analysis:", err);
    return NextResponse.json(
      { error: "Failed to analyze JD Match: " + (err.message || String(err)) },
      { status: 500 }
    );
  }
}
