import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resumeId, suggestionIds, action } = await req.json();

    if (!resumeId || !suggestionIds || !Array.isArray(suggestionIds)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify ownership of the resume first
    const { data: dbResume, error: fetchError } = await supabase
      .from("resumes")
      .select("id")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !dbResume) {
      return NextResponse.json({ error: "Resume not found or access denied" }, { status: 404 });
    }

    if (action === "accept") {
      const { error } = await supabase
        .from("resume_improvement_suggestions")
        .update({ is_accepted: true })
        .in("id", suggestionIds)
        .eq("resume_id", resumeId)
        .eq("user_id", user.id);

      if (error) throw error;
    } else if (action === "reject") {
      const { error } = await supabase
        .from("resume_improvement_suggestions")
        .delete()
        .in("id", suggestionIds)
        .eq("resume_id", resumeId)
        .eq("user_id", user.id);

      if (error) throw error;
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true });

  } catch (error: unknown) {
    console.error("Failed to manage suggestions:", error);
    return NextResponse.json({ error: "Failed to update suggestions. Please try again." }, { status: 500 });
  }
}
