import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { calculateDynamicATS } from "@/lib/ats";

export const dynamic = "force-dynamic";

// Simple server-side sanitizer that doesn't depend on DOM
function sanitizeStr(input: string | undefined | null): string {
  if (!input) return "";
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/javascript:/gi, "");
}

function sanitizeDeep<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "string") return sanitizeStr(obj) as any;
  if (Array.isArray(obj)) return obj.map(item => sanitizeDeep(item)) as any;
  if (typeof obj === "object") {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = sanitizeDeep(value);
    }
    return result as T;
  }
  return obj;
}

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
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
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

    const fileName = sanitizeStr(rawFileName || file_name || "Untitled Resume");
    const resumeText = sanitizeStr(rawResumeText || raw_text || "");
    const structuredResume = sanitizeDeep(rawStructuredResume || resume_data || {});
    
    // Auto-calculate ATS score if omitted (bridges the Builder ATS score gap)
    let atsScore = rawAtsScore !== undefined ? rawAtsScore : (ats_score !== undefined ? ats_score : null);
    if (atsScore == null && resumeText) {
      try {
        atsScore = calculateDynamicATS(resumeText);
      } catch (err) {
        console.error("Failed to automatically compute ATS score during save:", err);
      }
    }

    const payload = {
      file_name: fileName,
      raw_text: resumeText,
      resume_data: structuredResume,
      ats_score: atsScore,
      content_review: content_review || null,
      jd_match: jd_match || null,
      template_id: template_id || "standard",
      updated_at: new Date().toISOString()
    };

    let resultData;

    if (id) {
      // OVERWRITE EXISTING RECORD (Enforces owner-RLS check)
      const { data, error } = await supabase
        .from("resumes")
        .update(payload)
        .eq("id", id)
        .eq("user_id", user.id)
        .select();

      if (error) {
        console.error("Supabase update error:", (error instanceof Error ? error.message : "Unknown error"), error.details, error.hint);
        throw error;
      }
      if (!data || data.length === 0) {
        // ID didn't match any owned row — insert as new
        const { count } = await supabase
          .from("resumes")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        const { data: insertData, error: insertError } = await supabase
          .from("resumes")
          .insert([{ user_id: user.id, is_base_resume: count === 0, ...payload }])
          .select();
        if (insertError) {
          console.error("Supabase insert (fallback) error:", insertError.message, insertError.details, insertError.hint);
          throw insertError;
        }
        resultData = insertData;
      } else {
        resultData = data;
      }
    } else {
      // INSERT NEW RECORD
      const { count } = await supabase
        .from("resumes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      const { data, error } = await supabase
        .from("resumes")
        .insert([{ user_id: user.id, is_base_resume: count === 0, ...payload }])
        .select();

      if (error) {
        console.error("Supabase insert error:", (error instanceof Error ? error.message : "Unknown error"), error.details, error.hint);
        throw error;
      }
      resultData = data;
    }

    // Return the saved row data
    const savedRecord = resultData && resultData.length > 0 ? resultData[0] : null;
    if (!savedRecord) {
      throw new Error("Database failed to return saved record.");
    }

    return NextResponse.json(savedRecord);
  } catch (err: unknown) {
    console.error("Failed to save resume:", err);
    return NextResponse.json(
      { error: "Failed to save resume. Please try again." },
      { status: 500 }
    );
  }
}
