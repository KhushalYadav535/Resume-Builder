import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { askAIJSON } from "@/lib/openrouter";
import { ResumeSuggestion } from "@/lib/types/comprehensive-suggestions";

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

    const prompt = `You are an elite executive resume writer and ATS optimization expert with 15+ years of experience. Your task is to analyze the candidate's resume and generate highly personalized, context-aware improvements.

ABOUT THIS PERSON:
- Target Role/Detected Role: ${detectedRole || 'General'}
- Industry Focus: ${detectedIndustry || 'Technology'}

RESUME TEXT:
---
${resumeText}
---

INSTRUCTIONS:
You must provide highly personalized, custom suggestions for incorporating improvement dimensions. Do NOT provide generic feedback (e.g., "Add metrics to your experience" or "use stronger action verbs").
Instead:
1. Examine their exact resume sentences.
2. Formulate specific rewrite suggestions using the candidate's own words.
3. Explain why this matters for their specific career trajectory, target role, or experience level.
4. For suggestions modifying existing text, set "currentText" to the exact string from the resume (no paraphrasing) so it can be programmatically matched, and "suggestedText" to the complete, rewritten sentence.
5. Highlight Indian job market trends (e.g. Naukri/LinkedIn SEO) where appropriate.
6. CRITICAL: Do NOT include any emojis (e.g. 🚀, ✅, ✨, etc.) or special symbol icons in any string returned (including the "title", "description", and "suggestedText"). All values must be plain, professional, text-only characters, suitable for direct insertion into a standard corporate resume.

Analyze across these 12 dimensions:
1️⃣ ATS KEYWORDS & TECHNICAL SKILLS (e.g. gaps in stack)
2️⃣ SOFT SKILLS & COMPETENCIES (contextualizing leadership/communication)
3️⃣ EXPERIENCE BULLET POINT OPTIMIZATION (rewriting weak bullets)
4️⃣ ACHIEVEMENT QUANTIFICATION (specific metrics calculated/inferred from context)
5️⃣ ACTION VERB IMPROVEMENT (replacing passive verbs with strong action verbs)
6️⃣ PROFESSIONAL SUMMARY (compelling value positioning)
7️⃣ EDUCATION SECTION (coursework/honors)
8️⃣ CERTIFICATIONS & CREDENTIALS (AWS, GCP, etc.)
9️⃣ PROJECTS SECTION (technical details, tools, impact)
🔟 FORMATTING & STRUCTURE (readability, order)
1️⃣1️⃣ CONTACT INFO & PERSONAL BRAND (LinkedIn/Naukri SEO)
1️⃣2️⃣ WORK EXPERIENCE ORGANIZATION (chronology, growth)

Return ONLY a valid JSON array matching this schema:
[
  {
    "category": "ats_keyword" | "technical_skill" | "soft_skill" | "experience_bullet" | 
                "achievement_quantification" | "action_verb" | "professional_summary" | 
                "education" | "certification" | "project" | "formatting" | "contact_info" | 
                "skills_organization" | "work_experience_structure",
    "title": "Short, highly personalized title (e.g., 'Quantify UX teaching impact at UX Club')",
    "description": "Specific explanation of why this matters for their profile and how it upgrades their presentation.",
    "currentText": "The exact current text from the resume to be replaced, or null if adding new content.",
    "suggestedText": "The complete, custom rewritten version incorporating the improvement.",
    "section": "summary" | "experience" | "education" | "skills" | "certifications" | "projects" | "contact" | "general",
    "impactLevel": "high" | "medium" | "low",
    "priority": 1-5,
    "reasoning": "Detailed breakdown of the changes and how it enhances ATS / human review."
  }
]

Now analyze the provided resume and return a JSON array with 10-12 highly-impactful comprehensive suggestions.

RETURN ONLY VALID JSON ARRAY. NO PREAMBLE. NO MARKDOWN.`;

    const aiResponse = await askAIJSON<any[]>(
      prompt,
      "You are a professional resume coach. You only respond with JSON arrays."
    );

    if (!Array.isArray(aiResponse)) {
      throw new Error("AI did not return a valid array of suggestions");
    }

    // Insert into DB
    const insertData = aiResponse.map(s => ({
      resume_id: resumeId,
      user_id: user.id,
      suggestion_category: s.category || s.suggestion_category || 'ats_keyword',
      title: s.title || 'Resume Upgrade Recommended',
      description: s.description || 'Improvement details',
      current_text: s.currentText || s.current_text || null,
      suggested_text: s.suggestedText || s.suggested_text || s.suggestion || 'Upgrade recommended text',
      section: s.section || 'general',
      impact_level: s.impactLevel || s.impact_level ? String(s.impactLevel || s.impact_level).toLowerCase() : "medium",
      priority: Math.min(5, Math.max(1, Math.floor(Number(s.priority) || 3))),
      is_accepted: false
    }));

    const { data: inserted, error: dbError } = await supabase
      .from("resume_improvement_suggestions")
      .insert(insertData)
      .select();

    if (dbError) {
      console.error("Supabase insert error for comprehensive suggestions:", dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

    // Sort by priority and impact for initial response
    const impactValues: Record<string, number> = { 'high': 3, 'medium': 2, 'low': 1 };
    const sortedSuggestions = (inserted as any[]).sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return impactValues[b.impact_level] - impactValues[a.impact_level];
    });

    // Map to frontend representation
    const frontendSuggestions: ResumeSuggestion[] = sortedSuggestions.map(s => ({
      id: s.id,
      resumeId: s.resume_id,
      category: s.suggestion_category as any,
      title: s.title,
      description: s.description,
      currentText: s.current_text,
      suggestedText: s.suggested_text,
      section: s.section,
      impactLevel: s.impact_level as any,
      priority: s.priority as any,
      reasoning: "AI generated reasoning", // Could optionally store this in DB if desired, but user didn't ask for DB column for it
      isAccepted: s.is_accepted,
      createdAt: s.created_at
    }));

    return NextResponse.json({
      suggestions: frontendSuggestions,
      totalSuggestions: frontendSuggestions.length,
      estimatedNewScore: 100 // We can calculate this dynamically on frontend based on selected items
    });

  } catch (error: unknown) {
    console.error("Comprehensive analysis error:", error);
    return NextResponse.json(
      { error: "Failed to generate suggestions. Please try again." },
      { status: 500 }
    );
  }
}
