import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase"; // Use the proxy client

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Missing share token." }, { status: 400 });
    }

    // Resolve the share token publicly (is_public must be true)
    const { data: share, error: shareError } = await supabase
      .from("resume_shares")
      .select("*")
      .eq("token", token)
      .eq("is_public", true)
      .maybeSingle();

    if (shareError || !share) {
      return NextResponse.json({ error: "Shared resume not found, or it was made private by the owner." }, { status: 404 });
    }

    // Increment view counter
    const { error: updateError } = await supabase
      .from("resume_shares")
      .update({
        views_count: (share.views_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", share.id);

    if (updateError) {
      console.warn("Could not increment views_count:", updateError);
    }

    // Retrieve resume details
    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("file_name, resume_data, template_id")
      .eq("id", share.resume_id)
      .maybeSingle();

    if (resumeError || !resume) {
      return NextResponse.json({ error: "The associated resume could not be retrieved." }, { status: 404 });
    }

    return NextResponse.json({
      file_name: resume.file_name,
      resume_data: resume.resume_data,
      template_id: resume.template_id || share.template_id || "modern",
    });
  } catch (err: any) {
    console.error("Public share retrieval failed:", err);
    return NextResponse.json({ error: err.message || "Failed to retrieve shared resume." }, { status: 500 });
  }
}
