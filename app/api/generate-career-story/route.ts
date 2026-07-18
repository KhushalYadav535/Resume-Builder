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

    const { resumeId, tone, audience } = await req.json();
    if (!resumeId) {
      return NextResponse.json({ error: "Missing resumeId." }, { status: 400 });
    }

    const toneValue = tone ?? 50;
    const audienceType = audience || "interview";

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

    const audienceInstructions: Record<string, { format: string; lengthNote: string }> = {
      interview: {
        format: "A 60-90 second spoken 'Tell me about yourself' answer. Use contractions. Open with a hook, then 2-3 career highlights, then pivot to why you are here.",
        lengthNote: "150-200 words",
      },
      recruiter: {
        format: "A LinkedIn InMail or cold DM to a recruiter. Lead with your value proposition in the first line. Mention the type of role you are targeting and why now. End with a clear ask.",
        lengthNote: "100-130 words, punchy and direct",
      },
      linkedin: {
        format: "A LinkedIn 'About' section. Start with a strong first-person hook. Describe your professional identity, top 2-3 achievements, and what you are building towards. Use short paragraphs.",
        lengthNote: "200-250 words, scannable and professional",
      },
      networking: {
        format: "A casual 30-second networking intro. Conversational and warm. Who you are, what you do, and one specific memorable thing — not a resume recitation.",
        lengthNote: "80-100 words",
      },
    };

    const { format, lengthNote } = audienceInstructions[audienceType] || audienceInstructions.interview;

    const systemPrompt = `You are a master executive communication coach. You specialize in crafting the perfect professional narrative for different audiences.

Target audience: ${audienceType.toUpperCase()}
Format required: ${format}
Length: ${lengthNote}
Tone: ${toneInstruction}

RULES:
- Never invent facts. Use only what is in the resume and journal data provided.
- Write in first person, natural spoken/written English.
- No bullet points or headers — flowing prose only.
- Do NOT start with "I am a..." — use a more engaging opening.

Return ONLY the raw script text. No JSON, no intro remarks, no markdown.`;

    const result = await askAI(`Resume: ${resumeText}\n\nJournal Entries: ${journalText}`, systemPrompt);
    return NextResponse.json({ script: result.trim() });
  } catch (err: unknown) {
    console.error("Career story failed:", err);
    return NextResponse.json({ error: "Failed to generate career story." }, { status: 500 });
  }
}
