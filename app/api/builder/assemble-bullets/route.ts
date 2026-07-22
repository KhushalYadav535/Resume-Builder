import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { role_frame, achievement_tags, achievement_details, story_line, title_context } = body;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `You are an expert resume writer. Assemble highly professional, punchy resume bullet points based on the provided data.
    
    CRITICAL ANTI-HALLUCINATION GUARDRAILS:
    1. You may ONLY quantify using the exact ranges/scales provided in 'achievement_details'. Do NOT invent any numbers, metrics, or percentages that are not explicitly provided.
    2. If a detail says '<10%', you must use '<10%'. If it says '₹1L–10L', use that.
    3. If there is no range_or_scale for an achievement tag, describe the action qualitatively. DO NOT invent a metric.
    4. Group 1-2 related tags into a single bullet to avoid repetition. Do not force 1 bullet per tag.
    5. Output strictly as JSON in the format: { "bullets": [ { "text": "string", "source_tags": ["tag1"] } ] }
    6. Ensure the tone fits a formal resume. Do not use 'I' or 'My'. Start with strong action verbs.`;

    const userPrompt = `
      Title Context: ${title_context.clarified_title || title_context.designation}
      Role Frames: ${JSON.stringify(role_frame)}
      Achievement Tags: ${JSON.stringify(achievement_tags)}
      Achievement Details (USE ONLY THESE METRICS): ${JSON.stringify(achievement_details)}
      User Story Line: ${story_line || 'None provided'}
    `;

    const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`);
    const response = await result.response;
    const text = response.text().trim();
    
    // Strip markdown formatting if Gemini wrapped it in ```json
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();

    return NextResponse.json(JSON.parse(cleanedText));

  } catch (error) {
    console.error('Error assembling bullets:', error);
    // Fallback response for resilience
    return NextResponse.json({
      bullets: [
        { text: "Managed daily operations and led cross-functional initiatives.", source_tags: [] }
      ]
    });
  }
}
