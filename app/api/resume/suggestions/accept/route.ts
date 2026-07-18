import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

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

    const { resumeId, suggestionIds, action } = await req.json();
    if (!resumeId || !Array.isArray(suggestionIds) || !action) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // Verify ownership of the resume
    const { data: dbResume, error: fetchError } = await supabase
      .from("resumes")
      .select("id")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !dbResume) {
      return NextResponse.json({ error: "Resume record not found or access denied." }, { status: 404 });
    }

    if (action === 'accept') {
      const { error: updateError } = await supabase
        .from("resume_suggestions")
        .update({ is_accepted: true })
        .in("id", suggestionIds)
        .eq("resume_id", resumeId); // Belt and braces

      if (updateError) {
        throw updateError;
      }
    } else if (action === 'reject') {
      const { error: deleteError } = await supabase
        .from("resume_suggestions")
        .delete()
        .in("id", suggestionIds)
        .eq("resume_id", resumeId);

      if (deleteError) {
        throw deleteError;
      }
    } else {
      return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    }

    // Return the updated list of accepted suggestions
    const { data: acceptedSuggestions, error: acceptedError } = await supabase
      .from("resume_suggestions")
      .select("*")
      .eq("resume_id", resumeId)
      .eq("is_accepted", true);

    if (acceptedError) {
      throw acceptedError;
    }

    const formattedSuggestions = (acceptedSuggestions || []).map(row => ({
      id: row.id,
      resumeId: row.resume_id,
      suggestionType: row.suggestion_type,
      title: row.title,
      description: row.description,
      suggestedText: row.suggested_text,
      category: row.category,
      priority: row.priority,
      isAccepted: row.is_accepted,
      createdAt: row.created_at,
    }));

    return NextResponse.json({
      success: true,
      count: suggestionIds.length,
      acceptedSuggestions: formattedSuggestions
    });
  } catch (error: unknown) {
    console.error("Accept/reject suggestions error:", error);
    return NextResponse.json(
      { error: "Failed to process suggestions" },
      { status: 500 }
    );
  }
}
