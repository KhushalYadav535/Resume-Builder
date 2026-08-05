import { NextRequest, NextResponse } from "next/server";
import { askAI } from "@/lib/openrouter";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { bullet } = await req.json();
    if (!bullet || !bullet.trim()) {
      return NextResponse.json({ error: "Missing bullet text." }, { status: 400 });
    }

    const { checkAndDeductCredits } = await import("@/lib/billing");
    const { CREDIT_COSTS } = await import("@/lib/creditCosts");
    const billing = await checkAndDeductCredits(user.id, 5, "Translate Achievement");
    if (!billing.allowed) {
      return NextResponse.json({ error: billing.error }, { status: 403 });
    }

    const { getUserBaseResume } = await import("@/lib/userResumeContext");
    const { contextFormatted: userDbResume } = await getUserBaseResume(supabase, user.id);

    const systemPrompt = `You are an expert executive resume writer specialized in the Indian job market. 
Your task is to rewrite the provided resume achievement bullet point to express financial impact, budget, scale, or metrics in Indian currency context. 
STRICT PERSONALIZATION RULES:
1. Base the rewrite strictly on the candidate's actual background and uploaded database resume.
2. DO NOT invent fake metric numbers, fake percentages, or fake companies not present in candidate's original text or base resume.
3. Use Indian currency symbol ₹ (Rupee) and terms like Lakhs, Crores, or LPA where appropriate. 
4. Keep the rewritten bullet point professional, action-oriented, concise, and impact-driven.
5. Return ONLY the rewritten bullet point text. No explanation, no intro, no conversational text.

${userDbResume}`;

    const rawResult = await askAI(bullet, systemPrompt);
    const { humanizeText } = await import("@/lib/humanizer");
    const humanizedResult = humanizeText(rawResult);

    return NextResponse.json({ result: humanizedResult.trim() });
  } catch (err: unknown) {
    console.error("Translate achievement failed:", err);
    return NextResponse.json({ error: "Failed to translate achievement." }, { status: 500 });
  }
}
