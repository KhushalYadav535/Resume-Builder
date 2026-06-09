import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// GET - Retrieve sharing status and metrics for a specific resume
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const resumeId = searchParams.get("resumeId");

    if (!resumeId) {
      return NextResponse.json({ error: "Missing resume ID parameter." }, { status: 400 });
    }

    // Verify ownership of the resume
    const { data: resume, error: resError } = await supabase
      .from("resumes")
      .select("id")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();

    if (resError || !resume) {
      return NextResponse.json({ error: "Resume not found or access denied." }, { status: 404 });
    }

    const { data: shareLink, error: shareError } = await supabase
      .from("resume_shares")
      .select("*")
      .eq("resume_id", resumeId)
      .maybeSingle();

    return NextResponse.json(shareLink || { active: false, message: "No active share link found." });
  } catch (err: any) {
    console.error("GET share status failed:", err);
    return NextResponse.json({ error: err.message || "Failed to retrieve share status." }, { status: 500 });
  }
}

// POST - Create or toggle public sharing token for a resume
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { resumeId, isPublic = true } = await req.json();

    if (!resumeId) {
      return NextResponse.json({ error: "Missing resume ID." }, { status: 400 });
    }

    // Verify ownership
    const { data: resume, error: resError } = await supabase
      .from("resumes")
      .select("id")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();

    if (resError || !resume) {
      return NextResponse.json({ error: "Resume not found or access denied." }, { status: 404 });
    }

    // Check if a share token already exists
    const { data: existingShare } = await supabase
      .from("resume_shares")
      .select("*")
      .eq("resume_id", resumeId)
      .maybeSingle();

    if (existingShare) {
      // Toggle visibility or update existing
      const { data, error } = await supabase
        .from("resume_shares")
        .update({
          is_public: isPublic,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingShare.id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    } else {
      // Create new share token
      const token = crypto.randomBytes(16).toString("hex");

      const { data, error } = await supabase
        .from("resume_shares")
        .insert({
          resume_id: resumeId,
          token,
          is_public: isPublic,
          views_count: 0,
          downloads_count: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    }
  } catch (err: any) {
    console.error("POST share toggle failed:", err);
    return NextResponse.json({ error: err.message || "Failed to toggle share settings." }, { status: 500 });
  }
}
