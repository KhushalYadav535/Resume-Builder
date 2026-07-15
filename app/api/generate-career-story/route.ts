import { NextRequest, NextResponse } from "next/server";
import { askAI } from "@/lib/openrouter";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { resumeId, tone } = await req.json();
    if (!resumeId) {
      return NextResponse.json({ error: "Missing resumeId." }, { status: 400 });
    }

    const toneValue = tone ?? 50;

    const { data: resume, error: resError } = await supabase
      .from("resumes")
      .select("resume_data")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();

    if (resError || !resume) {
      return NextResponse.json({ error: "Resume not found." }, { status: 404 });
    }

    const { data: journalEntries } = await supabase
      .from("career_journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    const resumeText = JSON.stringify(resume.resume_data);
    const journalText = journalEntries ? JSON.stringify(journalEntries) : "No journal entries found.";
    
    let toneInstruction = "professional and confident";
    if (toneValue < 25) toneInstruction = "humble, modest, and collaborative";
    else if (toneValue < 50) toneInstruction = "factual, direct, and outcome-oriented";
    else if (toneValue < 75) toneInstruction = "confident, professional, and composed";
    else toneInstruction = "bold, assertive, and visionary";

    const systemPrompt = `You are a master executive communication coach and storytelling expert. 
Write a highly compelling, narrative-focused "Tell me about yourself" elevator pitch script (approx. 200-300 words) using the candidate's resume data and career journal entries.
Ensure the pitch:
1. Opens with a strong, memorable hook about their core professional identity.
2. Weaves together their most impressive achievements from both the resume and journal.
3. Highlights their unique value proposition and current career trajectory.
4. Concludes with a forward-looking statement that seamlessly transitions into why they are excited about their next opportunity.
5. The tone MUST BE exactly: ${toneInstruction}.

Make it sound conversational and natural to deliver in under 2 minutes. Do NOT use overly flowery language; keep it punchy and impactful.
Return ONLY the raw script text. No intro/outro conversational remarks.`;

    const result = await askAI(`Resume: ${resumeText}\n\nJournal Entries: ${journalText}`, systemPrompt);
    return NextResponse.json({ script: result.trim() });
  } catch (err: any) {
    console.error("Career story failed:", err);
    return NextResponse.json({ error: err.message || "Failed to generate career story." }, { status: 500 });
  }
}
