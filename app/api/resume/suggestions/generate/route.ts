import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { calculateDynamicATS } from "@/lib/ats";
import { askAIJSON } from "@/lib/openrouter";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify authenticated session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized access. Missing active auth session." },
        { status: 401 }
      );
    }

    const { resumeId, resumeText, detectedRole, detectedIndustry } = await req.json();
    if (!resumeId || !resumeText) {
      return NextResponse.json({ error: "Missing required fields (resumeId or resumeText)." }, { status: 400 });
    }

    // Verify ownership
    const { data: dbResume, error: fetchError } = await supabase
      .from("resumes")
      .select("id")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !dbResume) {
      return NextResponse.json({ error: "Resume record not found or access denied." }, { status: 404 });
    }

    // 1. Calculate what's missing using keywordEngine (via calculateDynamicATS)
    const atsResult = calculateDynamicATS(resumeText);
    const missingKeywords = atsResult.missingKeywordDetails || [];
    const roleToUse = detectedRole || atsResult.detectedRole;
    const industryToUse = detectedIndustry || atsResult.detectedIndustry;

    if (missingKeywords.length === 0) {
      return NextResponse.json({ suggestions: [], estimatedNewScore: atsResult.overall, totalSuggestions: 0 });
    }

    // Sort by weight descending
    missingKeywords.sort((a, b) => b.weight - a.weight);

    // Limit to top 8 missing keywords to keep the prompt reasonable and focused
    const topMissing = missingKeywords.slice(0, 8);

    // 2. Call AI via OpenRouter
    const prompt = `You are an elite executive resume writer and ATS optimization specialist with 15+ years of experience. Your task is to analyze the candidate's resume and generate highly personalized, context-aware suggestions for incorporating missing high-value keywords.

RESUME TEXT:
---
${resumeText}
---

TARGET/DETECTED ROLE: ${roleToUse || 'General'}
INDUSTRY: ${industryToUse || 'General'}

MISSING HIGH-VALUE KEYWORDS (ATS TARGETS):
${topMissing.map(k => `- ${k.keyword} (weight: ${k.weight})`).join('\n')}

INSTRUCTIONS:
You must provide highly personalized, custom suggestions for incorporating these missing keywords. Do NOT provide generic feedback (e.g., "Add keyword to your experience" or "use stronger action verbs").
Instead:
1. Examine their exact resume sentences.
2. Formulate specific rewrite suggestions using the candidate's own words.
3. Explain why this matters for their specific career trajectory, target role, or experience level.
4. Highlight Indian job market trends (e.g. Naukri/LinkedIn SEO) where appropriate.
5. Make the rewrite flow naturally.
6. CRITICAL: Do NOT include any emojis (e.g. 🚀, ✅, ✨, etc.) or special symbol icons in any string returned (including the "title", "description", and "suggestedText"). All values must be plain, professional, text-only characters, suitable for direct insertion into a standard corporate resume.

Return ONLY a valid JSON array matching this schema:
[
  {
    "type": "missing_keyword" | "missing_skill" | "experience_gap" | "skill_enhancement" | "formatting_improvement",
    "keyword": "the missing keyword or skill name",
    "title": "Short, highly personalized title (e.g., 'Integrate Kubernetes to your microservices bullet')",
    "description": "Specific explanation of why this matters for their target role and how it upgrades their presentation.",
    "suggestedText": "The complete, custom rewritten version incorporating the keyword (e.g. 'Orchestrated containerized microservices with Kubernetes, improving deployment frequency by 40%')",
    "category": "technical" | "soft_skill" | "experience" | "education" | "certification",
    "priority": 1-5,
    "whereToAdd": "experience" | "skills" | "summary" | "education" | "certifications"
  }
]

Now analyze the provided resume and return a JSON array of highly-impactful personalized suggestions.

RETURN ONLY VALID JSON ARRAY. NO PREAMBLE. NO MARKDOWN.`;

    const aiResponse = await askAIJSON<any[]>(
      prompt,
      "You are a professional resume coach helping Indian job seekers across all industries. You write clear, practical, authentic improvement suggestions. You output ONLY valid JSON arrays."
    );

    if (!Array.isArray(aiResponse) || aiResponse.length === 0) {
      throw new Error("Invalid AI response format");
    }

    // 3. Store each suggestion in the database
    const suggestionsToInsert = aiResponse.map(s => ({
      resume_id: resumeId,
      user_id: user.id,
      suggestion_type: s.type || 'missing_keyword',
      title: s.title || `Add ${s.keyword}`,
      description: s.description || 'Improve your resume by adding this missing keyword.',
      suggested_text: s.suggestedText || s.keyword,
      category: s.category || 'technical',
      priority: Math.min(5, Math.max(1, Math.floor(Number(s.priority) || 3))),
      is_accepted: false,
    }));

    const { data: insertedSuggestions, error: insertError } = await supabase
      .from("resume_suggestions")
      .insert(suggestionsToInsert)
      .select();

    if (insertError) {
      // If there's a unique constraint violation (they re-ran the generation), we should ignore duplicates
      if (insertError.code !== '23505') { 
        console.error("Error inserting suggestions:", insertError);
        return NextResponse.json(
          { error: "Database error while saving suggestions. Ensure resume_suggestions table exists." },
          { status: 500 }
        );
      }
    }

    // Refetch all active (unaccepted) suggestions for this resume
    const { data: allSuggestions, error: fetchAllError } = await supabase
      .from("resume_suggestions")
      .select("*")
      .eq("resume_id", resumeId)
      .eq("is_accepted", false)
      .order("priority", { ascending: false });

    if (fetchAllError) {
      throw fetchAllError;
    }
    
    const formattedSuggestions = (allSuggestions || []).map(row => {
      // Recover whereToAdd from the AI response by matching suggested_text, or default to skills/experience
      const originalAi = aiResponse.find(ai => ai.suggestedText === row.suggested_text);
      return {
        id: row.id,
        resumeId: row.resume_id,
        suggestionType: row.suggestion_type,
        title: row.title,
        description: row.description,
        suggestedText: row.suggested_text,
        category: row.category,
        priority: row.priority,
        whereToAdd: originalAi?.whereToAdd || (row.category === 'technical' ? 'skills' : 'experience'),
        isAccepted: row.is_accepted,
        createdAt: row.created_at,
      };
    });

    const estimatedNewScore = Math.min(100, atsResult.overall + Math.round(formattedSuggestions.length * 1.5));

    return NextResponse.json({
      suggestions: formattedSuggestions,
      estimatedNewScore,
      totalSuggestions: formattedSuggestions.length
    });
  } catch (error: unknown) {
    console.error("Generate suggestions error:", error);
    return NextResponse.json(
      { error: "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}
