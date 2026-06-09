import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Secure API endpoint to delete a user's resume by ID.
 * POST /api/delete-resume
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

    // Execute deletion strictly scoped to the active user to enforce RLS
    const { data, error } = await supabase
      .from("resumes")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
      .select();

    if (error) {
      throw error;
    }

    const deletedRecord = data && data.length > 0 ? data[0] : null;
    if (!deletedRecord) {
      return NextResponse.json(
        { error: "Resume record not found or access denied." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Resume deleted successfully.",
      deletedRecord,
    });
  } catch (err: any) {
    console.error("Failed to delete resume:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete resume" },
      { status: 500 }
    );
  }
}
