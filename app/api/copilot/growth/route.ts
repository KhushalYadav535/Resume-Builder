import { NextResponse } from "next/server";
import { askAI } from "@/lib/openrouter";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const { type } = body;

    // Fetch journal entries for context
    const { data: journalEntries } = await supabase
      .from("career_journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(10);
      
    const contextStr = journalEntries && journalEntries.length > 0 
      ? JSON.stringify(journalEntries) 
      : "No recent career journal entries available.";

    if (type === "promotion") {
      const { targetRole, tone } = body;
      let toneInstruction = "professional and confident";
      if (tone < 25) toneInstruction = "humble and collaborative";
      else if (tone > 75) toneInstruction = "bold and assertive";

      const prompt = `As an executive coach, draft an internal promotion request or 1:1 talking points for a user aiming for the role of ${targetRole}.
      Use their recent career journal wins as evidence: ${contextStr}
      The tone MUST BE exactly: ${toneInstruction}.
      Do NOT include intro/outro pleasantries, just provide the script/talking points directly.`;
      
      const responseText = await askAI("Write promotion case.", prompt);
      return NextResponse.json({ script: responseText.trim() });
    }

    if (type === "networking") {
      const { targetPerson, context } = body;
      const prompt = `As a career coach, write a short, highly effective LinkedIn connection request (under 300 characters) OR a short cold outreach email to: ${targetPerson}.
      Context/Reason: ${context}
      User Background Context: ${contextStr}
      Do NOT include intro/outro pleasantries, just provide the message directly.`;
      
      const responseText = await askAI("Write networking message.", prompt);
      return NextResponse.json({ script: responseText.trim() });
    }

    if (type === "negotiation") {
      const { offerDetails, targetSalary, tone } = body;
      let toneInstruction = "professional, gracious, and confident";
      if (tone < 25) toneInstruction = "very humble, expressing immense gratitude while gently asking";
      else if (tone > 75) toneInstruction = "firm, assertive, and willing to walk away";

      const prompt = `As an expert salary negotiator, draft a counter-offer email.
      The company offered: ${offerDetails}
      The candidate wants: ${targetSalary}
      Candidate's recent wins/value (to leverage if needed): ${contextStr}
      Tone MUST BE: ${toneInstruction}.
      Do NOT include placeholders like [Your Name] if possible, just write the body of the email.`;
      
      const responseText = await askAI("Write negotiation script.", prompt);
      return NextResponse.json({ script: responseText.trim() });
    }

    if (type === "gap-story") {
      const { gapReason, learning, whatYouDid, tone } = body;
      let toneInstruction = "professional, positive, and forward-looking";
      if (tone && tone < 25) toneInstruction = "humble and reflective";
      else if (tone && tone > 75) toneInstruction = "confident and growth-oriented";

      const prompt = `As an expert career coach, help this professional frame their career gap in a positive, authentic way for interviews and resumes.

Reason for gap: ${gapReason}
What they did during the gap: ${whatYouDid || "Not specified"}
What they learned: ${learning || "Not specified"}
Recent career context (from journal): ${contextStr}

Draft a 3-5 sentence professional narrative following this structure:
1. What happened (honest, brief, non-defensive)
2. What they actively did during this time
3. What they gained/learned and how it makes them stronger

Tone: ${toneInstruction}
Do NOT use clichés like "silver lining" or "blessing in disguise". Be concrete and professional.
Return ONLY the narrative paragraph, no intros or outros.`;

      const responseText = await askAI("Write gap narrative.", prompt);
      return NextResponse.json({ script: responseText.trim() });
    }

    if (type === "offer-eval") {
      const { offerSalary, offerDetails, priority, targetRole } = body;
      const prompt = `As an expert compensation consultant and career strategist, evaluate this job offer:

Offered Salary/Compensation: ${offerSalary}
Full Offer Details: ${offerDetails || "Not provided"}
Candidate's Priority: ${priority} (growth | compensation | wlb)
Target Role Context: ${targetRole || "Not specified"}
Candidate's Recent Wins (from journal): ${contextStr}

Provide a structured evaluation with:
1. Whether the offer is competitive based on market standards for this role
2. Specific negotiation leverage points based on their wins/experience
3. 2-3 concrete recommendations (what to ask for, what to clarify)
4. Plain language verdict: Accept, Negotiate, or Walk Away — and why

Be direct, practical, and specific. No generic advice. Max 200 words.
Return only the evaluation text, no JSON.`;

      const responseText = await askAI("Evaluate job offer.", prompt);
      return NextResponse.json({ evaluation: responseText.trim() });
    }

    if (type === "learning-path") {
      const { targetRole, missingSkills, gapPercentage } = body;
      const prompt = `As an expert career development coach and learning strategist, create a prioritized learning path for this professional.

Target Role: ${targetRole}
Missing Skills (ranked by importance): ${JSON.stringify(missingSkills)}
Current Gap Percentage: ${gapPercentage}%
User's existing strengths (from journal): ${contextStr}

For each missing skill, provide a specific, actionable learning recommendation with real resources (Coursera, Udemy, official docs, etc.). Rank them by ROI for getting the target role.

Respond STRICTLY with a valid JSON array:
[
  {
    "skill": "skill name",
    "priority": "high | medium | low",
    "estimatedWeeks": number (integer, 1-12),
    "whyItMatters": "1 sentence on why recruiters care about this",
    "recommendation": "specific course, book, or project to do",
    "platform": "Coursera | Udemy | YouTube | GitHub | Official Docs | Other",
    "url": "direct URL if known, else null"
  }
]`;

      const responseText = await askAI("Create learning path.", prompt);
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("Invalid AI response format");
      return NextResponse.json({ learningPath: JSON.parse(jsonMatch[0]) });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error: unknown) {
    console.error("Growth API error:", error);
    return NextResponse.json({ error: "Failed to process request. Please try again." }, { status: 500 });
  }
}
