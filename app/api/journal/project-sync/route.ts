import { NextResponse } from "next/server";
import { askAI } from "@/lib/openrouter";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { contextText } = body;

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
  } catch (error: any) {
    console.error("Project Sync API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
