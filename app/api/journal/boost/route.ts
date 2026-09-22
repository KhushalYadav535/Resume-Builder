import { NextResponse } from "next/server";
import { askAI } from "@/lib/openrouter";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { content, entry_type } = body;

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json({ error: "Content is required." }, { status: 400 });
    }

    const systemPrompt = `You are UpRole's Executive Career Strategist.
UpRole is a Career Advancement Platform. UpRole's foundational rule is:
"Do not manufacture confidence. Uncover evidence that creates confidence."

Your task is to take a professional's raw career journal draft and polish it into an executive-ready statement emphasizing:
1. Impact: What changed because of their work? (Quantifiable or tangible outcome).
2. Evidence: Clear facts, deliverables, or recognition without fluffy exaggerations.
3. Capability: The core skills and competencies exhibited.

If numbers or metrics are implied, keep them realistic or bracketed like [X%] if estimated.
Keep the statement concise (1-3 sentences maximum).

Also provide 2 to 4 relevant keyword tags (e.g., ["System Design", "Cost Optimization", "Leadership"]).`;

    const userPrompt = `Event Category: ${entry_type || "win"}
Raw Draft: "${content.trim()}"

Respond STRICTLY with valid JSON in this exact structure:
{
  "enhancedContent": "Polished, impact-focused statement...",
  "suggestedTags": ["Tag1", "Tag2", "Tag3"]
}`;

    const responseText = await askAI(systemPrompt, userPrompt);
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response format");

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json({
      success: true,
      enhancedContent: parsed.enhancedContent || content,
      suggestedTags: Array.isArray(parsed.suggestedTags) ? parsed.suggestedTags : [],
    });
  } catch (error: unknown) {
    console.error("Journal Boost API error:", error);
    return NextResponse.json({ error: "Failed to polish entry. Please try again." }, { status: 500 });
  }
}
