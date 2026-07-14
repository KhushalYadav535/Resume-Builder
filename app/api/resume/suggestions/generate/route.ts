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
    const prompt = `You are a professional resume coach helping job seekers in India across all industries — IT, Software, BFSI, Marketing, Sales, HR, Operations, Healthcare, and more.

Resume text:
---
${resumeText}
---

Current detected role: ${roleToUse || 'General'}
Industry: ${industryToUse || 'General'}

These high-value keywords are MISSING from the resume:
${topMissing.map(k => `- ${k.keyword} (weight: ${k.weight})`).join('\n')}

For each missing keyword/skill, suggest a SPECIFIC way this candidate can add it to their resume. The advice must:
1. Be authentic — based on what the candidate actually seems to have done (don't fabricate)
2. Be actionable — show exactly what sentence to add and where
3. Use simple, natural language — avoid overly corporate/buzzword-heavy phrasing
4. Be relevant to the Indian job market — mention Indian tools, platforms, or contexts where appropriate
5. Be encouraging and human — remember this is a real person trying to improve their career

Return ONLY a valid JSON array:
[
  {
    "type": "missing_keyword" | "missing_skill" | "experience_gap" | "skill_enhancement" | "formatting_improvement",
    "keyword": "the missing keyword or skill name",
    "title": "short, friendly title for this suggestion (5-10 words)",
    "description": "1-2 sentence explanation of why this matters for Indian recruiters",
    "suggestedText": "the exact text to add to the resume (1-2 sentences, in first person, achievement-focused)",
    "category": "technical" | "soft_skill" | "experience" | "education" | "certification",
    "priority": 1-5,
    "whereToAdd": "experience" | "skills" | "summary" | "education" | "certifications"
  }
]

Examples of good suggestions:
- type: "missing_skill", keyword: "MS Excel", suggestedText: "Advanced proficiency in MS Excel including pivot tables, VLOOKUP, and data visualization for MIS reporting"
- type: "experience_gap", keyword: "Team Management", suggestedText: "Led a team of 5 associates, assigning tasks, tracking KPIs, and conducting weekly review meetings"
- type: "skill_enhancement", keyword: "Customer Relationship", suggestedText: "Managed relationships with 50+ enterprise clients resulting in 92% renewal rate"

Return ONLY the JSON array.`;

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
      priority: s.priority || 3,
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
  } catch (error: any) {
    console.error("Generate suggestions error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}
