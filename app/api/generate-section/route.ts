import { NextRequest, NextResponse } from "next/server";
import { askAI } from "@/lib/openrouter";
import { industryPrompts } from "@/lib/industryPrompts";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { section, context, industryMode = "IT" } = await req.json();
    const industryGuideline = industryPrompts[industryMode] || industryPrompts.IT;

    const prompts: Record<string, string> = {
      summary: `Write a compelling professional summary for a resume based on this info:
${context}
Write 3-4 sentences. Be specific, confident, and highlight key value proposition. No generic fluff.
Industry Guidelines: ${industryGuideline}
Return ONLY the summary text.`,

      bullet: `Improve this resume bullet point to be more impactful:
"${context}"
Make it: start with a strong action verb, include measurable impact, and be concise (under 20 words).
Industry Guidelines: ${industryGuideline}
Return ONLY the improved bullet point.`,

      skills: `Based on this job role/experience: "${context}"
Suggest 10 relevant technical skills and 5 soft skills for a resume.
Industry Guidelines: ${industryGuideline}
Return as plain text, comma separated: "Technical: skill1, skill2... | Soft: skill1, skill2..."`,
    };

    const prompt = prompts[section] || `Improve this resume section content: ${context}\nIndustry Guidelines: ${industryGuideline}`;
    
    const systemPrompt = `You are an expert resume writer specializing in ${industryMode} industry recruitment norms. Be direct and impactful. Adhere to: ${industryGuideline}`;
    const result = await askAI(prompt, systemPrompt);

    return NextResponse.json({ result: result.trim() });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to generate content" }, { status: 500 });
  }
}
