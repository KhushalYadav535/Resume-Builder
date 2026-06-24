import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { askAIJSON } from "@/lib/openrouter";

export const dynamic = "force-dynamic";

function cleanLinkedInText(raw: string): string {
  return raw
    .replace(/Contact\n/gi, '')
    .replace(/www\.linkedin\.com\/in\/[^\n]*/gi, '')
    .replace(/\d+ connections/gi, '')
    .replace(/\d+ followers/gi, '')
    .replace(/Show more/gi, '')
    .replace(/Show less/gi, '')
    .replace(/Page \d+ of \d+/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized access. Missing active auth session." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Missing required file parameter: file" },
        { status: 400 }
      );
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    let rawText = "";
    
    if (fileExtension === "pdf") {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const pdfParseImport = await import("pdf-parse");
      const pdfParse = pdfParseImport.default || pdfParseImport;
      const pdfData = await pdfParse(buffer);
      rawText = pdfData.text;
    } else {
       return NextResponse.json({ error: "Only PDF files are supported." }, { status: 400 });
    }

    if (!rawText) {
       return NextResponse.json({ error: "Could not extract text for import." }, { status: 400 });
    }

    const cleanedText = cleanLinkedInText(rawText);

    const prompt1 = `You are a resume data extractor. Extract ALL information from this LinkedIn profile PDF text.
Return ONLY a valid JSON object — no explanation, no markdown, no preamble.

Use EXACTLY this structure:
{
  "personal": {
    "name": "",
    "headline": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin_url": ""
  },
  "summary": "",
  "experience": [
    {
      "company": "",
      "title": "",
      "location": "",
      "startDate": "",
      "endDate": "",
      "is_current": false,
      "description": "",
      "bullets": []
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "field": "",
      "startDate": "",
      "endDate": "",
      "grade": ""
    }
  ],
  "skills": [],
  "certifications": [
    {
      "name": "",
      "issuer": "",
      "date": ""
    }
  ],
  "projects": [
    {
      "name": "",
      "description": "",
      "technologies": []
    }
  ],
  "languages": [
    {
      "language": "",
      "proficiency": ""
    }
  ]
}

Rules:
- Extract EVERY work experience entry, every education entry, every skill
- If a field has no data, use empty string "" or empty array []
- For experience descriptions: include the full text as "description" and also try to split into bullet points in the "bullets" array if line breaks exist
- Never truncate or summarize — extract the complete raw content
- Return ONLY the JSON object, nothing else

LinkedIn PDF text to extract from:
${cleanedText}`;

    const extractedJSON = await askAIJSON<any>(prompt1, "You are a professional LinkedIn profile parser.");

    if (!extractedJSON.experience) extractedJSON.experience = [];
    if (!extractedJSON.skills) extractedJSON.skills = [];

    return NextResponse.json({
      success: true,
      data: extractedJSON,
      validation: null
    });

  } catch (err: any) {
    console.error("LinkedIn import API failure:", err);
    return NextResponse.json(
      { error: err.message || "Unable to import LinkedIn details. Continue manually." },
      { status: 500 }
    );
  }
}
