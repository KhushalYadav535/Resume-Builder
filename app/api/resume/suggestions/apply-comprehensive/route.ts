import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { applyComprehensiveSuggestions } from "@/lib/suggestions/applySuggestions";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resumeId, applySuggestionIds } = await req.json();

    if (!resumeId || !applySuggestionIds || !Array.isArray(applySuggestionIds)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get the resume
    const { data: dbResume, error: fetchError } = await supabase
      .from("resumes")
      .select("id, raw_text, resume_data")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !dbResume) {
      return NextResponse.json({ error: "Resume not found or access denied" }, { status: 404 });
    }

    // Get the suggestions that are being applied
    const { data: suggestions, error: suggError } = await supabase
      .from("resume_improvement_suggestions")
      .select("*")
      .in("id", applySuggestionIds)
      .eq("resume_id", resumeId)
      .eq("user_id", user.id);

    if (suggError) throw suggError;

    if (!suggestions || suggestions.length === 0) {
      return NextResponse.json({ error: "No matching suggestions found to apply" }, { status: 400 });
    }

    // Mark as accepted (we map db keys to our ts interface)
    const formattedSuggestions = suggestions.map(s => ({
      id: s.id,
      resumeId: s.resume_id,
      category: s.suggestion_category as any,
      title: s.title,
      description: s.description,
      currentText: s.current_text,
      suggestedText: s.suggested_text,
      section: s.section,
      impactLevel: s.impact_level as any,
      priority: s.priority as any,
      reasoning: "", 
      isAccepted: true, // We are explicitly accepting them
      createdAt: s.created_at
    }));

    // Apply suggestions to text and structure
    const { updatedText, updatedStructured, changesApplied } = applyComprehensiveSuggestions(
      dbResume.raw_text,
      dbResume.resume_data,
      formattedSuggestions
    );

    // Save back to DB
    const { error: updateError } = await supabase
      .from("resumes")
      .update({
        raw_text: updatedText,
        resume_data: updatedStructured,
        updated_at: new Date().toISOString()
      })
      .eq("id", resumeId)
      .eq("user_id", user.id);

    if (updateError) throw updateError;

    // Mark suggestions as accepted in DB
    await supabase
      .from("resume_improvement_suggestions")
      .update({ is_accepted: true })
      .in("id", applySuggestionIds)
      .eq("resume_id", resumeId)
      .eq("user_id", user.id);

    return NextResponse.json({ 
      success: true, 
      changesApplied 
    });

  } catch (error: any) {
    console.error("Failed to apply comprehensive suggestions:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
