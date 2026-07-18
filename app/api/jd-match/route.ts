import { NextRequest, NextResponse } from "next/server";
import { askAIJSON } from "@/lib/openrouter";
import { createClient } from "@/utils/supabase/server";
import { JDMatch } from "@/types";
import { checkAndDeductCredits } from "@/lib/billing";

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

    // --- CREDIT CONSUMPTION GUARD ---
    const billingCheck = await checkAndDeductCredits(user.id, 10, "JD Matching");
    if (!billingCheck.allowed) {
      return NextResponse.json(
        { error: billingCheck.error || "Insufficient credits." },
        { status: 403 }
      );
    }
    // --------------------------------

    const { resumeData, jobDescription } = await req.json();

    if (!resumeData || !jobDescription) {
      return NextResponse.json(
        { error: "Missing resumeData or jobDescription in request body" },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a Senior Talent Acquisition Specialist and ATS Expert with deep knowledge of Indian recruitment practices across IT, BFSI, Marketing, Sales, HR, Operations, and other sectors.

Your task is to analyze a candidate's resume against a specific Job Description (JD) and give an honest, helpful assessment. Think like an Indian recruiter who is deciding whether to call this candidate for an interview.

Return a precise JSON output:
{
  "matchScore": <number 0-100>,
  "matchedKeywords": [<skills/tools/experiences from JD found in resume>],
  "missingKeywords": [<critical skills/tools/requirements from JD missing from resume>],
  "suggestions": [<3-5 specific, actionable suggestions on what to add or rephrase>],
  "priorityAdditions": [<top 3 most important things the candidate should add to pass ATS and get shortlisted>]
}

Guidelines:
1. matchScore: Be honest. 85+ = strong match, 65-84 = moderate (may get called), below 65 = needs significant improvement
2. matchedKeywords: Only include keywords clearly present in the resume
3. missingKeywords: Focus on must-have skills, tools, or qualifications mentioned explicitly in the JD
4. suggestions: Write them as simple, direct advice (e.g., "Add your experience with X to the work experience section")
5. priorityAdditions: Pick the 3 things that will have the biggest impact on getting shortlisted`;

    const userPrompt = `--- TARGET JOB DESCRIPTION ---
${jobDescription}

--- CANDIDATE RESUME DATA ---
${JSON.stringify(resumeData, null, 2)}

Analyze the match and return the JSON.`;

    const result = await askAIJSON<JDMatch>(userPrompt, systemPrompt);

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("Failed JD Match analysis:", err);
    return NextResponse.json(
      { error: "Failed to analyze JD Match: " },
      { status: 500 }
    );
  }
}
