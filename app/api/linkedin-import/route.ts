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

    const prompt1 = `You are an expert resume data extractor and strict validator. Extract ALL information from this LinkedIn profile PDF text and rigorously clean the data.
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
      "city": "",
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
      "boardOrUniversity": "",
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

STRICT VALIDATION RULES:
1. Role vs Company: Cross-verify that "company" ONLY contains the organization name, and "title" ONLY contains the job designation/role. DO NOT mix them up.
2. Date Standardization: Clean and standardize all "startDate" and "endDate" fields into 'Month Year' format (e.g., 'Jan 2021', 'Aug 2023'). Drop exact days. Use 'Present' for current roles.
3. Smart Relocation: If you find technical skills, tools, or technologies lumped inside a job description or summary, extract them and MOVE them to the "skills" array.
4. Boilerplate Removal: Strip out generic LinkedIn artifacts (like "Show more", "Contact", "Page X of Y", etc.) that may have slipped into the text.
5. Content Quality: For experience descriptions, try to split paragraphs into clean, actionable bullet points in the "bullets" array.
6. Schema Matching: Use "city" instead of location for experience. Use "boardOrUniversity" for education if applicable.
7. If a field has no data, use empty string "" or empty array [].
8. Never truncate valid professional content.
9. IF YOU CANNOT EXTRACT DATA, YOU MUST STILL RETURN A VALID JSON OBJECT MATCHING THE STRUCTURE WITH EMPTY FIELDS. DO NOT OUTPUT ANY EXPLANATORY TEXT.
10. CRITICAL: DO NOT include template placeholder text like "Company Name", "Professional Role", "[Date]", etc. in your output. If a field is unknown, leave it as an empty string.

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

  } catch (err: unknown) {
    console.error("LinkedIn import API failure:", err);
    return NextResponse.json(
      { error: "Unable to import LinkedIn details. Continue manually." },
      { status: 500 }
    );
  }
}
