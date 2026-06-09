import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { askAIJSON } from "@/lib/openrouter";

export const dynamic = "force-dynamic";

// Simple robust CSV parser for browser environments/Next APIs
function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let currentToken = "";

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentToken += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentToken.trim());
      currentToken = "";
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(currentToken.trim());
      if (row.length > 0 && row.some(cell => cell !== "")) {
        lines.push(row);
      }
      row = [];
      currentToken = "";
    } else {
      currentToken += char;
    }
  }
  if (currentToken || row.length > 0) {
    row.push(currentToken.trim());
    lines.push(row);
  }
  return lines;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify active logged-in user session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized access. Missing active auth session." },
        { status: 401 }
      );
    }

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File;

      if (!file) {
        return NextResponse.json(
          { error: "Missing required file parameter: file" },
          { status: 400 }
        );
      }

      const fileText = await file.text();
      const rows = parseCSV(fileText);

      if (rows.length < 2) {
        return NextResponse.json(
          { error: "Empty or invalid CSV file." },
          { status: 400 }
        );
      }

      const headers = rows[0].map((h) => h.toLowerCase().trim());
      const firstRow = rows[1];

      const getVal = (headerName: string) => {
        const idx = headers.findIndex((h) => h.includes(headerName.toLowerCase()));
        return idx !== -1 && firstRow[idx] ? firstRow[idx] : "";
      };

      // Map LinkedIn Profile.csv columns:
      // First Name, Last Name, Headline, Summary, Zip Code, Geo Location, Address, Twitter Handles, Websites
      const firstName = getVal("first name");
      const lastName = getVal("last name");
      const fullName = [firstName, lastName].filter(Boolean).join(" ");
      const headline = getVal("headline");
      const summary = getVal("summary");
      const location = getVal("geo location") || getVal("address") || getVal("zip code") || "";
      const websitesRaw = getVal("websites") || "";

      let linkedinUrl = "";
      if (websitesRaw) {
        const websites = websitesRaw.split(/[\s,]+/);
        const found = websites.find((w) => w.includes("linkedin.com"));
        if (found) linkedinUrl = found;
      }

      const parsedData = {
        personal: {
          name: fullName,
          email: "",
          phone: "",
          location: location,
          linkedin: linkedinUrl,
          headline: headline,
        },
        summary: summary,
        experience: [],
        education: [],
        skills: [],
        certifications: [],
        projects: [],
      };

      return NextResponse.json({
        success: true,
        data: parsedData,
      });
    } else {
      // Option A: Text Paste
      const { rawText, source } = await req.json();

      if (source !== "paste" || !rawText) {
        return NextResponse.json(
          { error: "Missing rawText or source parameter." },
          { status: 400 }
        );
      }

      const prompt = `You are a resume parser. Extract ALL information from this LinkedIn profile text.
Return a JSON object with EXACTLY this structure:
{
  personal: {
    name: string,
    email: string (empty if not found),
    phone: string (empty if not found),
    location: string,
    linkedin: string,
    headline: string
  },
  summary: string (the About section, full text),
  experience: [
    {
      company: string,
      title: string,
      location: string,
      startDate: string,
      endDate: string (or "Present"),
      bullets: string[] (each responsibility or achievement as a separate string)
    }
  ],
  education: [
    {
      institution: string,
      degree: string,
      field: string,
      startDate: string,
      endDate: string,
      grade: string (CGPA or percentage if mentioned)
    }
  ],
  skills: string[] (all skills listed),
  certifications: [
    {
      name: string,
      issuer: string,
      date: string
    }
  ],
  projects: [
    {
      name: string,
      description: string,
      technologies: string[]
    }
  ]
}
Return ONLY valid JSON. No explanation. No markdown. No preamble.
If a field has no data, use empty string or empty array.
Extract every single work experience entry, every education entry, every skill.

LinkedIn Profile Text:
${rawText}`;

      const parsedResume = await askAIJSON<any>(
        prompt,
        "You are a professional LinkedIn profile parser. You output ONLY valid JSON."
      );

      return NextResponse.json({
        success: true,
        data: parsedResume,
      });
    }
  } catch (err: any) {
    console.error("LinkedIn import API failure:", err);
    return NextResponse.json(
      { error: err.message || "Unable to import LinkedIn details. Continue manually." },
      { status: 500 }
    );
  }
}
