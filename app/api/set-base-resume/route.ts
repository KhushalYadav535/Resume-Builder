import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Secure API endpoint to set a user's base resume by ID.
 * POST /api/set-base-resume
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify secure authenticated user session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized access. Missing active auth session." },
        { status: 401 }
      );
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json(
        { error: "Missing required resume parameter: id" },
        { status: 400 }
      );
    }

    // Step 1: Update all resumes to not be the base resume
    const { error: updateAllError } = await supabase
      .from("resumes")
      .update({ is_base_resume: false })
      .eq("user_id", user.id);

    if (updateAllError) {
      throw updateAllError;
    }

    // Step 2: Set the specific resume as the base resume
    const { data, error } = await supabase
      .from("resumes")
      .update({ is_base_resume: true })
      .eq("id", id)
      .eq("user_id", user.id)
      .select();

    if (error) {
      throw error;
    }

    const updatedRecord = data && data.length > 0 ? data[0] : null;
    if (!updatedRecord) {
      return NextResponse.json(
        { error: "Resume record not found or access denied." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Base resume updated successfully.",
      updatedRecord,
    });
  } catch (err: unknown) {
    console.error("Failed to set base resume:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred while setting the base resume." },
      { status: 500 }
    );
  }
}
