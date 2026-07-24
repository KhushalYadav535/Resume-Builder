import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { parseResume, parseResumeAI } from "@/lib/resumeParser";
import { calculateDynamicATS } from "@/lib/ats";
import { sanitizeInput, sanitizeObject } from "@/lib/sanitization";
import { checkAndDeductCredits } from "@/lib/billing";
import { CREDIT_COSTS } from "@/lib/creditCosts";

export const dynamic = "force-dynamic";

// Helper for fuzzy name matching
function normalizeStr(str: string | undefined | null) {
  return (str || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function isNameMatch(name1: string, name2: string) {
  if (!name1 || !name2) return false;
  const n1 = normalizeStr(name1);
  const n2 = normalizeStr(name2);
  if (n1 === n2) return true;
  if (n1.includes(n2) || n2.includes(n1)) return true;
  const w1 = name1.toLowerCase().split(/\s+/).filter(w => w.length >= 3);
  const w2 = name2.toLowerCase().split(/\s+/).filter(w => w.length >= 3);
  return w1.some(w => w2.includes(w));
}

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

    let { resumeText, fileName, pdfUrl } = await req.json();
    if (!resumeText) {
      return NextResponse.json({ error: "No resume text provided" }, { status: 400 });
    }
    resumeText = sanitizeInput(resumeText);
    fileName = sanitizeInput(fileName);

    // Stage 1: Run processing (uses local fast parsing)
    // Run this BEFORE billing so we can validate identity for free
    const structuredResume = parseResume(resumeText);
    if (pdfUrl) {
      (structuredResume as any).pdf_url = pdfUrl;
    }
    const atsScore = calculateDynamicATS(resumeText);

    // Stage 2: Identity Validation Against Base Resume
    const { data: baseResumes } = await supabase
      .from("resumes")
      .select("resume_data, id")
      .eq("user_id", user.id)
      .eq("is_base_resume", true)
      .limit(1);

    // Fallback if no resume is explicitly marked as base
    let baseResumeData = baseResumes && baseResumes.length > 0 ? baseResumes[0].resume_data : null;
    if (!baseResumeData) {
      const { data: oldestResumes } = await supabase
        .from("resumes")
        .select("resume_data, id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(1);
      if (oldestResumes && oldestResumes.length > 0) {
        baseResumeData = oldestResumes[0].resume_data;
      }
    }

    if (baseResumeData) {
      const baseEmail = baseResumeData?.personalInfo?.email || "";
      const baseName = baseResumeData?.personalInfo?.fullName || "";
      const newEmail = structuredResume.personalInfo.email || "";
      const newName = structuredResume.personalInfo.fullName || "";

      let isMatch = false;

      // 1. Check if emails match (if both exist)
      let emailMatch = false;
      if (baseEmail && newEmail && baseEmail.toLowerCase() === newEmail.toLowerCase()) {
        emailMatch = true;
      }

      // 2. Check if names match (if both exist)
      let nameMatch = false;
      if (baseName && newName && baseName !== "Untitled Candidate" && newName !== "Untitled Candidate") {
        if (isNameMatch(baseName, newName)) {
          nameMatch = true;
        }
      }

      // If either matches, or both are blank but we matched on something else, it's valid.
      // Strict rule: if emails exist and don't match, block it.
      if (baseEmail && newEmail && !emailMatch) {
        isMatch = false;
      } else if (nameMatch || emailMatch) {
        isMatch = true;
      } else if (!baseEmail && !baseName) {
        // Edge case: Base resume was completely blank. Let them establish identity now.
        isMatch = true;
      }

      if (!isMatch) {
        return NextResponse.json(
          { error: "Identity Mismatch: You can only upload resumes belonging to the same person as your base resume." },
          { status: 400 }
        );
      }
    }

    // --- CREDIT CONSUMPTION GUARD ---
    // Moved down here so users aren't charged for rejected identity mismatches
    const billingCheck = await checkAndDeductCredits(user.id, CREDIT_COSTS.ANALYZE_RESUME, "ATS Optimization Check");
    if (!billingCheck.allowed) {
      return NextResponse.json(
        { error: billingCheck.error || "Insufficient credits." },
        { status: 403 }
      );
    }
    // --------------------------------
    
    // Check if this is the first resume
    const { count } = await supabase
      .from("resumes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    // Save to Supabase DB immediately
    const { data, error } = await supabase
      .from("resumes")
      .insert([
        {
          user_id: user.id,
          file_name: fileName ? fileName : (structuredResume.personalInfo.fullName ? `${structuredResume.personalInfo.fullName}'s Resume` : "Untitled Resume"),
          raw_text: resumeText,
          resume_data: structuredResume,
          ats_score: atsScore,
          content_review: null,
          jd_match: null,
          template_id: "standard",
          is_base_resume: count === 0,
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
  } catch (err: unknown) {
    console.error("Failed local resume analysis:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred while parsing the resume." },
      { status: 500 }
    );
  }
}
