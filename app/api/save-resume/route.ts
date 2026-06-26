import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { calculateDynamicATS } from "@/lib/ats";
import { sanitizeObject, sanitizeInput } from "@/lib/sanitization";

export const dynamic = "force-dynamic";

/**
 * Consolidated API route to save or update resumes.
 * Automatically runs local ATS scoring if ats_score is not supplied (e.g. from Builder).
 * POST /api/save-resume
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Fetch the current logged-in user securely
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If no authenticated user exists, block saving and return error
    if (!user) {
      throw new Error("User not authenticated");
    }

    const body = await req.json();
    const { 
      id, // Expose existing ID to support overwrites
      file_name, fileName: rawFileName,
      raw_text, resumeText: rawResumeText,
      resume_data, structuredResume: rawStructuredResume,
      ats_score, atsScore: rawAtsScore,
      content_review, jd_match, template_id 
    } = body;

    const fileName = sanitizeInput(rawFileName || file_name || "Untitled Resume");
    const resumeText = sanitizeInput(rawResumeText || raw_text || "");
    const structuredResume = sanitizeObject(rawStructuredResume || resume_data || {});
    
    // Auto-calculate ATS score if omitted (bridges the Builder ATS score gap)
    let atsScore = rawAtsScore !== undefined ? rawAtsScore : (ats_score !== undefined ? ats_score : null);
    if (atsScore == null && resumeText) {
      try {
        atsScore = calculateDynamicATS(resumeText);
      } catch (err) {
        console.error("Failed to automatically compute ATS score during save:", err);
      }
    }

    let resultData;

    if (id) {
      // OVERWRITE EXISTING RECORD (Enforces owner-RLS check)
      const { data, error } = await supabase
        .from("resumes")
        .update({
          file_name: fileName,
          raw_text: resumeText,
          resume_data: structuredResume,
          ats_score: atsScore,
          content_review: content_review || null,
          jd_match: jd_match || null,
          template_id: template_id || "modern",
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select();

      if (error) throw error;
      resultData = data;
    } else {
      // INSERT NEW RECORD
      const { data, error } = await supabase
        .from("resumes")
        .insert([
          {
            user_id: user.id,
            file_name: fileName,
            raw_text: resumeText,
            resume_data: structuredResume,
            ats_score: atsScore,
            content_review: content_review || null,
            jd_match: jd_match || null,
            template_id: template_id || "modern",
            updated_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) throw error;
      resultData = data;
    }

    // Add Debug Logs
    console.log("Logged user:", user?.id);
    console.log("Save operation complete. Row count:", resultData?.length);

    // Return the saved row data
    const savedRecord = resultData && resultData.length > 0 ? resultData[0] : null;
    if (!savedRecord) {
      throw new Error("Database failed to return saved record.");
    }

    return NextResponse.json(savedRecord);
  } catch (err: any) {
    console.error("Failed to save resume:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred while saving the resume." },
      { status: 500 }
    );
  }
}
