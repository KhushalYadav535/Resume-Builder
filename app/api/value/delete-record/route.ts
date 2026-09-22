import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { Resume } from "@/types";

export const dynamic = "force-dynamic";

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
    const { resumeId, category, recordId } = body;

    if (!resumeId || !category || !recordId) {
      return NextResponse.json(
        { error: "Missing resumeId, category, or recordId" },
        { status: 400 }
      );
    }

    const { data: resume, error: fetchErr } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();

    if (fetchErr || !resume) {
      return NextResponse.json(
        { error: "Resume not found or unauthorized" },
        { status: 404 }
      );
    }

    const resumeData = { ...resume.resume_data };
    let deletedCount = 0;

    switch (category) {
      case "employment":
        if (resumeData.workExperience) {
          const before = resumeData.workExperience.length;
          resumeData.workExperience = resumeData.workExperience.filter(
            (_: any, idx: number) => (_.id || `exp-${idx}`) !== recordId
          );
          deletedCount = before - resumeData.workExperience.length;
        }
        break;

      case "projects":
        if (resumeData.projects) {
          const before = resumeData.projects.length;
          resumeData.projects = resumeData.projects.filter(
            (_: any, idx: number) => (_.id || `proj-${idx}`) !== recordId
          );
          deletedCount = before - resumeData.projects.length;
        }
        break;

      case "certifications":
        if (resumeData.certifications) {
          const before = resumeData.certifications.length;
          resumeData.certifications = resumeData.certifications.filter(
            (_: any, idx: number) => (_.id || `cert-${idx}`) !== recordId
          );
          deletedCount = before - resumeData.certifications.length;
        }
        break;

      case "education":
        if (resumeData.education) {
          const before = resumeData.education.length;
          resumeData.education = resumeData.education.filter(
            (_: any, idx: number) => (_.id || `edu-${idx}`) !== recordId
          );
          deletedCount = before - resumeData.education.length;
        }
        break;

      case "additional":
        if (resumeData.languagesKnown) {
          const before = resumeData.languagesKnown.length;
          resumeData.languagesKnown = resumeData.languagesKnown.filter(
            (_: any, idx: number) => (_.id || `lang-${idx}`) !== recordId
          );
          deletedCount = before - resumeData.languagesKnown.length;
        }
        break;

      case "skills": {
        const isTech = recordId.startsWith("tech-");
        const idx = parseInt(recordId.split("-")[1] || "0", 10);
        if (isTech && resumeData.skills?.technical) {
          resumeData.skills.technical.splice(idx, 1);
          deletedCount = 1;
        } else if (!isTech && resumeData.skills?.soft) {
          resumeData.skills.soft.splice(idx, 1);
          deletedCount = 1;
        }
        break;
      }

      case "achievements":
        // Campus achievements
        if (recordId.startsWith("campus-") && resumeData.campusAchievements) {
          const idx = parseInt(recordId.split("-")[1] || "0", 10);
          resumeData.campusAchievements.splice(idx, 1);
          deletedCount = 1;
        }
        break;

      case "awards":
        if (recordId.startsWith("hack-") && resumeData.hackathons) {
          const idx = parseInt(recordId.split("-")[1] || "0", 10);
          resumeData.hackathons.splice(idx, 1);
          deletedCount = 1;
        } else if (recordId.startsWith("contest-") && resumeData.codingContests) {
          const idx = parseInt(recordId.split("-")[1] || "0", 10);
          resumeData.codingContests.splice(idx, 1);
          deletedCount = 1;
        }
        break;

      default:
        return NextResponse.json(
          { error: `Unknown category: ${category}` },
          { status: 400 }
        );
    }

    if (deletedCount === 0) {
      return NextResponse.json(
        { error: "Record not found in this category" },
        { status: 404 }
      );
    }

    const { error: updateErr } = await supabase
      .from("resumes")
      .update({
        resume_data: resumeData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", resumeId);

    if (updateErr) {
      return NextResponse.json(
        { error: "Failed to update resume" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Record deleted successfully",
      deletedCount,
    });
  } catch (err: unknown) {
    console.error("Delete record error:", err);
    return NextResponse.json(
      { error: "Failed to delete record" },
      { status: 500 }
    );
  }
}
