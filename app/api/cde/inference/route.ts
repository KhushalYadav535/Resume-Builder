import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is not set. Returning mock extracted facts.");
      return NextResponse.json({
        facts: { mock_extracted: true, hint: "Set GEMINI_API_KEY in your environment." }
      });
    }

    const { text, promptHint } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      You are an AI fact extractor for a career discovery engine.
      The user was asked to answer a question and gave the following response:
      "${text}"

      ${promptHint ? `Extraction Instructions: ${promptHint}` : 'Extract any relevant structured career facts from this.'}

      Return ONLY a JSON object containing the extracted facts. The keys should be clear, concise labels (e.g., 'metrics', 'technologies', 'leadership_roles').
      Do NOT wrap the output in markdown blocks like \`\`\`json. Return just the raw JSON object.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text().trim();
    
    // Attempt to parse JSON
    let facts = {};
    try {
      // Remove any trailing/leading backticks if the model ignores the instruction
      const cleaned = responseText.replace(/^```json/g, '').replace(/^```/g, '').replace(/```$/g, '').trim();
      facts = JSON.parse(cleaned);
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON", responseText);
    }

    return NextResponse.json({ facts });
  } catch (error) {
    console.error('Error in inference API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
