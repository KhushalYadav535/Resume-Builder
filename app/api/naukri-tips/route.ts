import { NextRequest, NextResponse } from "next/server";
import { askAIJSON } from "@/lib/openrouter";
import { createClient } from "@/utils/supabase/server";
import { checkAndDeductCredits } from "@/lib/billing";
import { CREDIT_COSTS } from "@/lib/creditCosts";

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

    // --- CREDIT CONSUMPTION GUARD ---
    const billingCheck = await checkAndDeductCredits(user.id, CREDIT_COSTS.NAUKRI_SEO_TIPS, "Naukri/LinkedIn SEO Tips");
    if (!billingCheck.allowed) {
      return NextResponse.json(
        { error: billingCheck.error || "Insufficient credits." },
        { status: 403 }
      );
    }
    // --------------------------------

    const resumeRole = (resume.resume_data as any)?.workExperience?.[0]?.role || "professional";
    const resumeName = (resume.resume_data as any)?.personalInfo?.fullName || "the candidate";

    const prompt = `You are a senior recruiter with 10+ years of experience in the Indian job market across IT, BFSI, Marketing, HR, Operations, Healthcare, and other sectors. You specialize in optimizing profiles on Naukri.com, Shine.com, Monster India, and LinkedIn India.

Analyze the resume below and generate 5 highly specific, actionable tips to help ${resumeName} (a ${resumeRole}) get more recruiter calls. Focus on:
- Making the profile appear in more recruiter searches (keyword indexing)
- Writing a stronger Naukri headline that immediately shows value
- Optimizing Key Skills tags for Indian ATS systems
- Formatting notice period / availability for Indian recruiters
- Salary expectations and location preferences that Indian portals favor

IMPORTANT: Be specific to the candidate's actual role and industry. Do NOT give generic advice. Mention actual keywords, phrases, or skills they should add based on their background.

RESUME CONTENT:
${resume.raw_text}

Respond ONLY with a JSON object:
{
  "tips": [
    {
      "area": "Specific area (e.g. Naukri Headline, Key Skills, Notice Period, Profile Summary, Location Preference)",
      "tip": "Specific, actionable advice with example text if possible",
      "priority": "High" or "Medium" or "Low"
    }
  ]
}`;

    const systemPrompt = `You are a senior Indian recruitment expert who helps job seekers across all industries — IT, BFSI, Marketing, Sales, HR, Operations, Healthcare — get more recruiter calls on Indian portals like Naukri.com. You give specific, practical advice tailored to the candidate's actual background. You output ONLY valid JSON.`;
    const result = await askAIJSON<NaukriTipsResult>(prompt, systemPrompt);

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("Naukri tips generation failed:", err);
    return NextResponse.json({ error: "Failed to generate job portal optimization tips." }, { status: 500 });
  }
}
