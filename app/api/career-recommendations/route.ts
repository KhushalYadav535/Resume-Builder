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
    const systemPrompt = `You are a senior career counselor who has helped thousands of Indian professionals grow their careers across IT, BFSI, Marketing, Sales, HR, Operations, Healthcare, and other sectors. You understand the Indian job market deeply — including tier 1/2 city opportunities, remote jobs, startup vs. corporate preferences, and realistic salary benchmarks in LPA.

Based on the candidate's resume, suggest 3 realistic, next-step career paths that match their background. For each path:
- Give a specific role title that actually exists on Naukri.com / LinkedIn India
- Estimate real Indian salary ranges in LPA (be realistic, not inflated)
- Explain clearly and simply why this is a good fit based on their experience
- Focus on paths they can realistically achieve in the next 1-2 years

Respond ONLY with a JSON object:
{
  "recommendations": [
    {
      "roleTitle": "Specific job title",
      "marketDemand": "High / Medium / Low",
      "averageSalaryRange": "₹ X - Y LPA",
      "whyGoodFit": "Clear, encouraging 2-3 sentence explanation"
    }
  ]
}`;

    const result = await askAIJSON<CareerRecommendations>(resumeText, systemPrompt);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Career recommendations failed:", err);
    return NextResponse.json({ error: err.message || "Failed to generate career recommendations." }, { status: 500 });
  }
}
