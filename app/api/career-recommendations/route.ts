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
    const systemPrompt = `You are a career counselor. Based on the candidate's resume, suggest 3 suitable next-step target career paths.
For each path, estimate the Indian market demand, salary ranges in LPA (₹ Lakhs Per Annum), and why it's a good fit.
Respond ONLY with a JSON object of this structure:
{
  "recommendations": [
    {
      "roleTitle": "Recommended role name",
      "marketDemand": "High / Medium / Low",
      "averageSalaryRange": "₹ X - Y LPA",
      "whyGoodFit": "Explanation of alignment"
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
