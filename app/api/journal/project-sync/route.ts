import { NextResponse } from "next/server";
import { askAI } from "@/lib/openrouter";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    // Auth check — prevent unauthenticated AI quota abuse
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { contextText } = body;

    if (!contextText || typeof contextText !== "string" || !contextText.trim()) {
      return NextResponse.json({ error: "contextText is required." }, { status: 400 });
    }

    const prompt = `As an expert career coach, take the following meeting agenda, project title, or calendar event context:
    Context: "${contextText}"
    
    Generate ONE highly specific, thought-provoking question to prompt the user to journal about this event.
    The goal is to get them to record a win, a challenge overcome, or a skill learned that they could use on a resume later.
    Make the prompt short (max 2 sentences) and address the user as "you".
    
    Examples:
    - "What was the toughest stakeholder alignment you achieved during the Q3 Roadmap Planning?"
    - "Did you hit any specific latency targets during the Database Migration project?"
    
    Respond STRICTLY with a valid JSON object in this exact format:
    {
      "prompt": "The generated question."
    }`;
    
    const responseText = await askAI("Generate project journal prompt.", prompt);
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response format");
    
    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (error: unknown) {
    console.error("Project Sync API error:", error);
    return NextResponse.json({ error: "Failed to generate journal prompt. Please try again." }, { status: 500 });
  }
}
