import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { parseResume } from "@/lib/resumeParser";
import { calculateDynamicATS } from "@/lib/ats";
import { sanitizeInput, sanitizeObject } from "@/lib/sanitization";

export const dynamic = "force-dynamic";

/**
 * Consolidated API route to perform full resume analysis LOCALLY.
 * Performs personal info parsing, section separation, skills extraction, and ATS scoring locally.
 * Commits the resulting structure directly to Supabase.
 * POST /api/analyze-resume
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify authenticated session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized access. Missing active auth session." },
        { status: 401 }
      );
    }

    let { resumeText, fileName } = await req.json();
    if (!resumeText) {
      return NextResponse.json({ error: "No resume text provided" }, { status: 400 });
    }
    resumeText = sanitizeInput(resumeText);
    fileName = sanitizeInput(fileName);

    // Stage 1, 2 & 3: Run all processing completely LOCALLY (fast, free, 0 rate-limits!)
    const structuredResume = parseResume(resumeText);
    const atsScore = calculateDynamicATS(resumeText);

    // Save to Supabase DB immediately
    const { data, error } = await supabase
      .from("resumes")
      .insert([
        {
          user_id: user.id,
          file_name: fileName || (structuredResume.personalInfo.fullName ? `${structuredResume.personalInfo.fullName}'s Resume` : "Untitled Resume"),
          raw_text: resumeText,
          resume_data: structuredResume,
          ats_score: atsScore,
          content_review: null,
          jd_match: null,
          template_id: "modern",
        }
      ])
      .select();

    // Debug logs
    console.log("Logged user:", user?.id);
    console.log("Local insert result:", data);
    console.error("Supabase local error:", error);

    if (error) {
      throw error;
    }

    const savedRecord = data && data.length > 0 ? data[0] : null;
    if (!savedRecord) {
      throw new Error("Database failed to return saved record.");
    }

    return NextResponse.json(savedRecord);
  } catch (err: any) {
    console.error("Failed local resume analysis:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred while parsing the resume." },
      { status: 500 }
    );
  }
}
