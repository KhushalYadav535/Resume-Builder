import { NextRequest, NextResponse } from "next/server";
import { askAIJSON } from "@/lib/openrouter";
import { createClient } from "@/utils/supabase/server";
import { checkAndDeductCredits } from "@/lib/billing";

export const dynamic = "force-dynamic";

interface StarAnswer {
  question: string;
  type: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  fullAnswer: string;
  journalEvidence: string;
}

interface MockInterviewResult {
  starAnswers: StarAnswer[];
  readinessScore: number;
  readinessSummary: string;
  strengthAreas: string[];
  improvementAreas: string[];
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // --- CREDIT CONSUMPTION GUARD (30 credits per mock interview) ---
    const billingCheck = await checkAndDeductCredits(user.id, 30, "Mock Interview");
    if (!billingCheck.allowed) {
      return NextResponse.json(
        { error: billingCheck.error || "Insufficient credits. Mock Interview costs 30 credits." },
        { status: 402 }
      );
    }
    // ----------------------------------------------------------------

    const { resumeId, questions } = await req.json();
    if (!resumeId || !questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: "Missing resumeId or questions." }, { status: 400 });
    }

    // Fetch resume
    const { data: resume, error: resError } = await supabase
      .from("resumes")
      .select("resume_data")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();

    if (resError || !resume) {
      return NextResponse.json({ error: "Resume not found." }, { status: 404 });
    }

    // Fetch journal entries for STAR evidence
    const { data: journalEntries } = await supabase
      .from("career_journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(20);

    const resumeText = JSON.stringify(resume.resume_data);
    const journalText =
      journalEntries && journalEntries.length > 0
        ? JSON.stringify(journalEntries)
        : "No journal entries available.";

    const questionsText = questions
      .map((q: { question: string; type: string }, i: number) => `Q${i + 1} [${q.type}]: ${q.question}`)
      .join("\n");

    const systemPrompt = `You are an elite executive interview coach. You help candidates prepare STAR-format answers that are specific, evidence-backed, and compelling.

Your task:
1. For each interview question, draft a complete STAR-format answer using the candidate's resume and journal entries as source material.
2. If journal data exists, quote or reference specific entries as evidence.
3. Calculate an overall readiness score (0-100%) based on how well their background supports the questions.
4. Identify 2-3 strength areas and 2-3 areas for improvement.

RULES:
- Never fabricate metrics or achievements not in the resume/journal
- Keep each full answer to 150-200 words (spoken pace ~60-90 seconds)
- Be specific — reference actual projects, roles, or skills from their data
- The fullAnswer should be written in first person, natural spoken English

Resume Data:
${resumeText}

Journal Entries:
${journalText}

Interview Questions:
${questionsText}

Respond ONLY with a valid JSON object:
{
  "starAnswers": [
    {
      "question": "exact question",
      "type": "behavioral | technical | experience-specific",
      "situation": "S: one sentence context",
      "task": "T: one sentence challenge/goal",
      "action": "A: 2-3 sentences on specific actions taken",
      "result": "R: quantified or specific outcome",
      "fullAnswer": "Complete spoken answer (150-200 words, first person)",
      "journalEvidence": "Which journal entry or resume section was used as source (or 'Resume data only' if no journal)"
    }
  ],
  "readinessScore": 0-100,
  "readinessSummary": "2-3 sentence plain-language assessment of interview readiness",
  "strengthAreas": ["area1", "area2"],
  "improvementAreas": ["area1", "area2"]
}`;

    const result = await askAIJSON<MockInterviewResult>(
      "Generate STAR answers for interview questions.",
      systemPrompt
    );

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("Mock interview failed:", err);
    return NextResponse.json(
      { error: "Failed to generate mock interview answers." },
      { status: 500 }
    );
  }
}
