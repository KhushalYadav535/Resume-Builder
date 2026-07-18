import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify authenticated session
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const resumeId = searchParams.get("resumeId");

    if (!resumeId) {
      return NextResponse.json({ error: "resumeId is required" }, { status: 400 });
    }

    // Verify user owns this resume
    const { data: resume, error: authError } = await supabase
      .from("resumes")
      .select("id")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();

    if (authError || !resume) {
      return NextResponse.json({ error: "Resume not found or access denied" }, { status: 404 });
    }

    // Fetch accepted suggestions
    const { data: suggestions, error: suggError } = await supabase
      .from("resume_improvement_suggestions")
      .select("*")
      .eq("resume_id", resumeId)
      .eq("user_id", user.id)
      .eq("is_accepted", true)
      .order("created_at", { ascending: false });

    if (suggError) {
      console.error("Error fetching accepted suggestions:", suggError);
      return NextResponse.json({ error: "Failed to fetch suggestions" }, { status: 500 });
    }

    // Format them to match the frontend ResumeSuggestion interface
    const formattedSuggestions = (suggestions || []).map(s => ({
      id: s.id,
      resumeId: s.resume_id,
      category: s.suggestion_category,
      title: s.title,
      description: s.description,
      currentText: s.current_text,
      suggestedText: s.suggested_text,
      section: s.section,
      impactLevel: s.impact_level,
      priority: s.priority,
      reasoning: "", // Not stored heavily
      isAccepted: true,
      createdAt: s.created_at
    }));

    return NextResponse.json({ suggestions: formattedSuggestions }, { status: 200 });

  } catch (err: unknown) {
    console.error("Failed to fetch accepted suggestions:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred while fetching suggestions." },
      { status: 500 }
    );
  }
}
