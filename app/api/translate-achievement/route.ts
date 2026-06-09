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

    const systemPrompt = `You are an expert resume writer specialized in the Indian job market. 
Your task is to rewrite the provided resume achievement bullet point to express financial impact, budget, scale, or metrics in Indian currency context. 
Use Indian currency symbol ₹ (Rupee) and terms like Lakhs, Crores, or LPA (Lakhs Per Annum) where appropriate. 
Keep the rewritten bullet point professional, action-oriented, concise, and impact-driven.
Return ONLY the rewritten bullet point text. No explanation, no intro, no conversational text.`;

    const result = await askAI(bullet, systemPrompt);

    return NextResponse.json({ result: result.trim() });
  } catch (err: any) {
    console.error("Translate achievement failed:", err);
    return NextResponse.json({ error: err.message || "Failed to translate achievement." }, { status: 500 });
  }
}
