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

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error: any) {
    console.error("Growth API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
