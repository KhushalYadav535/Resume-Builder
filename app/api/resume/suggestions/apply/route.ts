import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { calculateDynamicATS } from "@/lib/ats";

export const dynamic = "force-dynamic";

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

    const { resumeId, applySuggestionIds } = await req.json();
    if (!resumeId || !Array.isArray(applySuggestionIds) || applySuggestionIds.length === 0) {
      return NextResponse.json({ error: "Missing required fields or empty suggestion list." }, { status: 400 });
    }

    // 1. Fetch the resume from Supabase
    const { data: dbResume, error: fetchError } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !dbResume) {
      return NextResponse.json({ error: "Resume record not found or access denied." }, { status: 404 });
    }

    // 2. Fetch all accepted suggestions from resume_suggestions where id IN applySuggestionIds
    const { data: suggestions, error: suggestionsError } = await supabase
      .from("resume_suggestions")
      .select("*")
      .eq("resume_id", resumeId)
      .eq("is_accepted", true)
      .in("id", applySuggestionIds);

    if (suggestionsError) {
      throw suggestionsError;
    }

    if (!suggestions || suggestions.length === 0) {
      return NextResponse.json({ error: "No accepted suggestions found for the provided IDs." }, { status: 404 });
    }

    // 3. Intelligently merge suggestions into the resume
    let structuredData = dbResume.resume_data;
    if (typeof structuredData === "string") {
      try {
        structuredData = JSON.parse(structuredData);
      } catch (e) {
        structuredData = {};
      }
    }

    // Deep copy to avoid mutating original if it fails partway
    const updatedResumeData = JSON.parse(JSON.stringify(structuredData));

    for (const suggestion of suggestions) {
      const textToAdd = suggestion.suggested_text;
      const category = suggestion.category;
      
      // We mapped whereToAdd from the AI response, but we might only have category in the DB.
      // We can infer where to add it based on category.
      const whereToAdd: string = category === 'technical' || category === 'soft_skill' ? 'skills' : 
                         category === 'education' ? 'education' :
                         category === 'certification' ? 'certifications' : 'experience';

      if (whereToAdd === 'skills') {
        const type = category === 'soft_skill' ? 'soft' : 'technical';
        if (!updatedResumeData.skills) updatedResumeData.skills = { technical: [], soft: [] };
        if (!updatedResumeData.skills[type]) updatedResumeData.skills[type] = [];
        if (!updatedResumeData.skills[type].includes(textToAdd)) {
          updatedResumeData.skills[type].push(textToAdd);
        }
      } else if (whereToAdd === 'experience') {
        if (!updatedResumeData.workExperience) updatedResumeData.workExperience = [];
        if (updatedResumeData.workExperience.length > 0) {
          // Append to most recent experience entry
          if (!updatedResumeData.workExperience[0].bullets) updatedResumeData.workExperience[0].bullets = [];
          if (!updatedResumeData.workExperience[0].bullets.includes(textToAdd)) {
            updatedResumeData.workExperience[0].bullets.push(textToAdd);
          }
        } else {
          // Create dummy experience to hold the bullet
          updatedResumeData.workExperience.push({
            id: Date.now().toString(),
            company: "Company Name",
            role: "Role",
            startDate: "",
            endDate: "",
            current: false,
            bullets: [textToAdd]
          });
        }
      } else if (whereToAdd === 'summary') {
        if (!updatedResumeData.summary) updatedResumeData.summary = "";
        updatedResumeData.summary = `${textToAdd} ${updatedResumeData.summary}`.trim();
      } else if (whereToAdd === 'education') {
        if (!updatedResumeData.education) updatedResumeData.education = [];
        if (updatedResumeData.education.length > 0) {
          if (!updatedResumeData.education[0].academicAchievements) updatedResumeData.education[0].academicAchievements = "";
          updatedResumeData.education[0].academicAchievements += `\n${textToAdd}`;
        }
      } else if (whereToAdd === 'certifications') {
        if (!updatedResumeData.certifications) updatedResumeData.certifications = [];
        updatedResumeData.certifications.push({
          id: Date.now().toString(),
          name: textToAdd,
          issuer: "",
          date: ""
        });
      }
    }

    // Flatten to raw text for ATS recalculation
    const rawText = [
      updatedResumeData.personalInfo?.fullName || "",
      updatedResumeData.personalInfo?.email || "",
      updatedResumeData.personalInfo?.phone || "",
      updatedResumeData.summary || "",
      ...(updatedResumeData.workExperience?.flatMap((w: any) => [w.company, w.role, ...(w.bullets || [])]) || []),
      ...(updatedResumeData.education?.map((e: any) => `${e.degree || ""} in ${e.field || ""} at ${e.institution || ""} ${e.academicAchievements || ""}`) || []),
      ...(updatedResumeData.skills?.technical || []),
      ...(updatedResumeData.skills?.soft || []),
      ...(updatedResumeData.certifications?.map((c: any) => c.name) || [])
    ].join("\n");

    // 5. Recalculate ATS score
    const newAtsScore = calculateDynamicATS(rawText);

    // 6. Update the resume in Supabase
    const { data: updatedResume, error: updateError } = await supabase
      .from("resumes")
      .update({
        raw_text: rawText,
        resume_data: updatedResumeData,
        ats_score: newAtsScore,
        updated_at: new Date().toISOString()
      })
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Delete the applied suggestions so they don't show up again
    await supabase.from("resume_suggestions").delete().in("id", applySuggestionIds);

    return NextResponse.json({
      success: true,
      resume: updatedResume
    });
  } catch (error: any) {
    console.error("Apply suggestions error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to apply suggestions" },
      { status: 500 }
    );
  }
}
