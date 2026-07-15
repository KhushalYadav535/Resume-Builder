import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    let extractedText = "";

    // For simplicity, we extract text via Gemini directly if it's an image
    // If it's a PDF, we might need a parser, but Gemini Pro Vision supports PDFs too via parts if passed correctly.
    if (file.type.startsWith("image/") || file.type === "application/pdf") {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Extract the core career achievement, praise, or learning from this document. 
      Format it as a concise, first-person statement suitable for a career journal. 
      Do not add extra conversational text.`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: buffer.toString("base64"),
            mimeType: file.type
          }
        }
      ]);
      extractedText = result.response.text();
    } else if (file.type === "text/plain") {
      const text = buffer.toString("utf-8");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Extract the core career achievement, praise, or learning from this text:
      "${text}"
      
      Format it as a concise, first-person statement suitable for a career journal. 
      Do not add extra conversational text.`;
      const result = await model.generateContent(prompt);
      extractedText = result.response.text();
    } else {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    return NextResponse.json({ success: true, extractedText: extractedText.trim() });
  } catch (error: any) {
    console.error("Error extracting data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
