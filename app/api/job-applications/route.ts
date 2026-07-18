import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { askAIJSON } from "@/lib/openrouter";

export const dynamic = "force-dynamic";

async function calculateJDMatchScore(resumeText: string, jdText: string): Promise<number> {
  try {
    const systemPrompt = `You are an ATS alignment engine. Compare the candidate's resume against the target job description.
Estimate a match alignment score from 0 to 100 based on key technical capabilities, methodologies, domain relevance, and experience level.
Respond ONLY with a valid JSON object matching this structure:
{
  "score": 85
}`;
    const prompt = `RESUME CONTENT:\n${resumeText}\n\nJOB DESCRIPTION:\n${jdText}`;
    const result = await askAIJSON<{ score: number }>(prompt, systemPrompt);
    return typeof result?.score === "number" ? Math.max(0, Math.min(100, result.score)) : 50;
  } catch (err) {
    console.error("calculateJDMatchScore failed:", err);
    return 50;
  }
}

// GET - Retrieve all applications for the active user
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in first." }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("job_applications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (err: unknown) {
    console.error("GET job applications failed:", err);
    return NextResponse.json({ error: "Failed to fetch job applications." }, { status: 500 });
  }
}

// POST - Create a new job application
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in first." }, { status: 401 });
    }

    const body = await req.json();
    const { 
      company, 
      role, 
      salary, 
      platform, 
      date, 
      status, 
      notes, 
      reminders,
      resume_id,
      jd_text,
      jd_url,
      jd_match_score
    } = body;

    if (!company || !role || !status) {
      return NextResponse.json({ error: "Missing required fields: company, role, and status are mandatory." }, { status: 400 });
    }

    let calculatedScore = jd_match_score || null;

    // Calculate match score if resume is linked and JD is provided
    if (resume_id && jd_text && !jd_match_score) {
      const { data: resume } = await supabase
        .from("resumes")
        .select("raw_text")
        .eq("id", resume_id)
        .eq("user_id", user.id)
        .single();
      if (resume?.raw_text) {
        calculatedScore = await calculateJDMatchScore(resume.raw_text, jd_text);
      }
    }

    const { data, error } = await supabase
      .from("job_applications")
      .insert({
        user_id: user.id,
        company,
        role,
        salary: salary || null,
        platform: platform || null,
        date: date || new Date().toISOString().split("T")[0],
        status,
        notes: notes || null,
        reminders: reminders || null,
        resume_id: resume_id || null,
        jd_text: jd_text || null,
        jd_url: jd_url || null,
        jd_match_score: calculatedScore,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error("POST job application failed:", err);
    return NextResponse.json({ error: "Failed to add job application." }, { status: 500 });
  }
}

// PUT - Update status or notes of an existing job application
export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in first." }, { status: 401 });
    }

    const body = await req.json();
    const { 
      id, 
      company, 
      role, 
      salary, 
      platform, 
      date, 
      status, 
      notes, 
      reminders,
      resume_id,
      jd_text,
      jd_url,
      jd_match_score
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing job application ID." }, { status: 400 });
    }

    let calculatedScore = jd_match_score;

    // Recalculate match score if resume is linked and JD is provided and score is not set
    if (resume_id && jd_text && !jd_match_score) {
      const { data: resume } = await supabase
        .from("resumes")
        .select("raw_text")
        .eq("id", resume_id)
        .eq("user_id", user.id)
        .single();
      if (resume?.raw_text) {
        calculatedScore = await calculateJDMatchScore(resume.raw_text, jd_text);
      }
    }

    // Verify ownership via RLS or explicit query match
    const { data, error } = await supabase
      .from("job_applications")
      .update({
        company,
        role,
        salary,
        platform,
        date,
        status,
        notes,
        reminders,
        resume_id: resume_id || null,
        jd_text: jd_text || null,
        jd_url: jd_url || null,
        jd_match_score: calculatedScore || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error("PUT job application failed:", err);
    return NextResponse.json({ error: "Failed to update job application." }, { status: 500 });
  }
}

// DELETE - Remove job application
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in first." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing job application ID in query string." }, { status: 400 });
    }

    const { error } = await supabase
      .from("job_applications")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;
    return NextResponse.json({ success: true, message: "Job application deleted." });
  } catch (err: unknown) {
    console.error("DELETE job application failed:", err);
    return NextResponse.json({ error: "Failed to delete job application." }, { status: 500 });
  }
}
