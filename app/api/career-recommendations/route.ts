import { NextRequest, NextResponse } from "next/server";
import { askAIJSON } from "@/lib/openrouter";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

interface CareerRecommendations {
  recommendations: {
    roleTitle: string;
    marketDemand: "High" | "Medium" | "Low";
    averageSalaryRange: string; // e.g. ₹ 8 - 12 LPA
    whyGoodFit: string;
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
    const systemPrompt = `You are a premier executive career strategist and industry analyst with deep expertise in the global and Indian job markets (IT, BFSI, Marketing, Sales, Healthcare, etc.).

Based on the candidate's resume data, synthesize and propose 3 highly strategic, realistic next-step career paths. For each path:
1. Provide a precise, industry-standard role title (e.g., "Senior Product Manager", "Lead Data Engineer").
2. Estimate accurate, realistic salary ranges (e.g., "₹ 15 - 25 LPA" or "$ 120k - $ 150k" depending on the implied region).
3. Deliver a sharp, compelling rationale (2-3 sentences max) on why this path is an optimal fit, referencing specific, transferable skills or milestones from their resume.
4. Focus on roles they can credibly pivot to or be promoted into within the next 1-2 years.

Respond ONLY with a valid JSON object matching this exact schema. Do not include markdown blocks or any other text outside the JSON:
{
  "recommendations": [
    {
      "roleTitle": "Specific Job Title",
      "marketDemand": "High | Medium | Low",
      "averageSalaryRange": "Salary Range",
      "whyGoodFit": "Strategic, encouraging 2-3 sentence explanation directly tying their past experience to this future role."
    }
  ]
}`;

    const result = await askAIJSON<CareerRecommendations>(resumeText, systemPrompt);
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("Career recommendations failed:", err);
    return NextResponse.json({ error: "Failed to generate career recommendations." }, { status: 500 });
  }
}
