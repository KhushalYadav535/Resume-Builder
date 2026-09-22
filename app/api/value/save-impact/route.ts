import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { Resume, WorkExperience, Project } from "@/types";

export const dynamic = "force-dynamic";

const cleanStr = (s: string) =>
  (s || "")
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/^[•\-\*\s"']+|[•\-\*\s"'\.]+$|\s+/g, " ")
    .trim();

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      gapId,
      resumeId,
      sourceType,
      sourceId,
      originalText,
      confirmedBullet,
      problem,
      contribution,
      impact,
    } = body;

    const adminSupabase = createAdminClient();

    // 1. Fetch user's target resume
    let resume: Resume | null = null;

    if (resumeId && typeof resumeId === "string" && resumeId.trim().length > 10) {
      const { data: foundResume } = await adminSupabase
        .from("resumes")
        .select("*")
        .eq("id", resumeId.trim())
        .eq("user_id", user.id)
        .maybeSingle();

      if (foundResume) {
        resume = foundResume;
      }
    }

    // Fallback: If resumeId is missing, empty, or not found, find base resume or latest resume
    if (!resume) {
      const { data: resumes } = await adminSupabase
        .from("resumes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (resumes && resumes.length > 0) {
        resume = resumes.find((r: Resume) => r.is_base_resume) || resumes[0];
      }
    }

    if (!resume) {
      return NextResponse.json(
        { error: "Resume not found or unauthorized" },
        { status: 404 }
      );
    }

    const resumeData = resume.resume_data || {};
    const targetClean = cleanStr(originalText);

    // Extract target index from gapId if available (e.g. "gap-exp-0-8")
    let targetExpIdx = -1;
    let targetBulletIdx = -1;
    if (typeof gapId === "string" && gapId.startsWith("gap-exp-")) {
      const parts = gapId.replace("gap-exp-", "").split("-");
      if (parts.length >= 2) {
        targetExpIdx = parseInt(parts[0], 10);
        targetBulletIdx = parseInt(parts[1], 10);
      }
    }

    let bulletReplaced = false;

    if (sourceType === "workExperience" && Array.isArray(resumeData.workExperience)) {
      resumeData.workExperience = resumeData.workExperience.map(
        (exp: WorkExperience, expIdx: number) => {
          if (!exp.bullets || !Array.isArray(exp.bullets)) return exp;

          const updatedBullets = exp.bullets.map((b: string, bIdx: number) => {
            if (bulletReplaced) return b;

            const bClean = cleanStr(b);
            const isMatch =
              b.trim() === (originalText || "").trim() ||
              (targetClean.length > 5 && bClean === targetClean) ||
              (targetClean.length > 15 && (bClean.includes(targetClean) || targetClean.includes(bClean))) ||
              (targetExpIdx >= 0 && targetBulletIdx >= 0 && expIdx === targetExpIdx && bIdx === targetBulletIdx);

            if (isMatch) {
              bulletReplaced = true;
              return confirmedBullet || b;
            }
            return b;
          });

          return { ...exp, bullets: updatedBullets };
        }
      );

      // Fallback: If not replaced yet, but we have valid target indices
      if (!bulletReplaced && targetExpIdx >= 0 && targetBulletIdx >= 0) {
        if (resumeData.workExperience[targetExpIdx]?.bullets?.[targetBulletIdx] !== undefined) {
          resumeData.workExperience[targetExpIdx].bullets[targetBulletIdx] = confirmedBullet;
          bulletReplaced = true;
        }
      }
    } else if (sourceType === "project" && Array.isArray(resumeData.projects)) {
      resumeData.projects = resumeData.projects.map((proj: Project) => {
        const descClean = cleanStr(proj.description || "");
        if (proj.id === sourceId || (targetClean.length > 10 && descClean.includes(targetClean))) {
          bulletReplaced = true;
          return {
            ...proj,
            description: confirmedBullet || proj.description,
          };
        }
        return proj;
      });
    }

    // 2. Persist updated resume in Supabase via Admin Client
    const { error: updateErr } = await adminSupabase
      .from("resumes")
      .update({
        resume_data: resumeData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", resume.id);

    if (updateErr) {
      console.error("Error updating resume with impact:", updateErr);
      return NextResponse.json(
        { error: "Failed to update resume record in database" },
        { status: 500 }
      );
    }

    // 3. Persist entry in career_journal_entries as an Impact event
    try {
      await adminSupabase.from("career_journal_entries").insert([
        {
          user_id: user.id,
          date: new Date().toISOString().split("T")[0],
          entry_type: "impact",
          content: `${confirmedBullet} (Solved: ${problem} | Impact: ${impact})`,
          source: "prompted",
          tags: ["GuidedImpact", "ValueStage2"],
          extracted_metrics: {
            gapId,
            originalText,
            confirmedBullet,
            sourceId,
            sourceType,
            problem,
            contribution,
            impact,
          },
        },
      ]);
    } catch (journalErr) {
      console.warn("Journal sync note:", journalErr);
    }

    return NextResponse.json({
      success: true,
      message: "Impact confirmed and saved to your career record!",
      updatedBullet: confirmedBullet,
      resumeId: resume.id,
    });
  } catch (err: unknown) {
    console.error("Save impact error:", err);
    return NextResponse.json(
      { error: "Failed to save impact" },
      { status: 500 }
    );
  }
}
