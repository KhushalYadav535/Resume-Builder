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

    const prompt = `You are an elite executive resume writer and ATS optimization expert with 15+ years of experience helping professionals land top-tier positions.

Analyze this resume comprehensively across 12 dimensions and suggest improvements for EACH:

═══════════════════════════════════════════════════════════════════════════════════════

RESUME:
---
${resumeText}
---

Detected Role: ${detectedRole || 'General'}
Industry: ${detectedIndustry || 'Technology'}

═══════════════════════════════════════════════════════════════════════════════════════

ANALYSIS FRAMEWORK:

1️⃣ ATS KEYWORDS & TECHNICAL SKILLS
   - Missing high-value keywords for the role
   - Technical stack gaps
   - Framework/tool coverage
   
2️⃣ SOFT SKILLS & COMPETENCIES
   - Leadership, Communication, Problem-solving, etc.
   - Team skills (collaboration, mentoring)
   - Domain-specific competencies
   
3️⃣ EXPERIENCE BULLET POINT OPTIMIZATION
   - Weak/passive bullets that should be rewritten
   - Missing specific examples
   - Bullets lacking measurable impact
   - Current: "Responsible for X" → Suggested: "Led X, achieved Y"
   
4️⃣ ACHIEVEMENT QUANTIFICATION
   - Bullets without numbers (percentages, money, time saved)
   - Unquantified impact statements
   - Missing metrics that strengthen credibility
   
5️⃣ ACTION VERB IMPROVEMENT
   - Overused verbs (used, made, did) → Strong verbs (architected, accelerated, optimized)
   - Weak verb choices
   
6️⃣ PROFESSIONAL SUMMARY
   - Is it compelling? Does it showcase unique value?
   - Missing key positioning
   - Too generic or too long
   - Opportunity: "Senior Software Engineer" → "Full-Stack Architect who scaled systems to 100K+ users"
   
7️⃣ EDUCATION SECTION
   - Missing relevant coursework, honors, relevant projects
   - Incomplete degree information
   - Not highlighting achievements (GPA, scholarships, thesis)
   
8️⃣ CERTIFICATIONS & CREDENTIALS
   - Recommended certifications for the role (AWS, GCP, Kubernetes, etc.)
   - Licensing or domain-specific creds
   - Skills validation certifications
   
9️⃣ PROJECTS SECTION
   - Projects that don't showcase relevant skills
   - Incomplete project descriptions
   - Missing technical details or impact metrics
   - Opportunity to add personal projects that fill skill gaps
   
🔟 FORMATTING & STRUCTURE
   - ATS compliance issues (weird spacing, symbols, tables)
   - Readability improvements (section order, grouping)
   - Length optimization (too long, missing key sections)
   - Font consistency, bullet point structure
   
1️⃣1️⃣ CONTACT INFO & PERSONAL BRAND (including Naukri/LinkedIn SEO)
   - Include 1-2 suggestions specifically for "Indian Portals (Naukri/LinkedIn) SEO" if applicable. Explicitly mention "Naukri/LinkedIn SEO" in the title or description.
   - Missing LinkedIn, GitHub, portfolio links
   - Outdated phone/email format
   - Missing professional branding elements
   
1️⃣2️⃣ WORK EXPERIENCE ORGANIZATION
   - Chronological issues or gaps not explained
   - Company descriptions missing
   - Roles not clearly differentiated
   - Progression/growth not evident

═══════════════════════════════════════════════════════════════════════════════════════

For EACH suggestion, return:

[
  {
    "category": "ats_keyword" | "technical_skill" | "soft_skill" | "experience_bullet" | 
                "achievement_quantification" | "action_verb" | "professional_summary" | 
                "education" | "certification" | "project" | "formatting" | "contact_info" | 
                "skills_organization" | "work_experience_structure",
    
    "title": "Short, actionable title (5-10 words)",
    
    "description": "Why this matters. 1-2 sentences explaining the benefit",
    
    "currentText": "If applicable, the exact current text from resume (or null)",
    
    "suggestedText": "The improved version (or specific instruction for improvement)",
    
    "section": "Which resume section: summary | experience | education | skills | 
               certifications | projects | contact | general",
    
    "impactLevel": "high" | "medium" | "low",
    
    "priority": 1-5 (5 = most important for role and ATS scoring),
    
    "reasoning": "Why you suggest this specific improvement"
  }
]

GUIDELINES FOR SUGGESTIONS:

- Authenticity first: Never suggest fabricating experience
- Specificity: "Add specific metrics" not "make it better"
- Impact-focused: Prioritize by how much it improves ATS score or hiring chances
- Actionable: User should be able to implement immediately
- Varied: Don't all be "add more keywords" — provide true comprehensive coaching
- IMPORTANT for currentText: When suggesting bullet rewrites, currentText MUST exactly match a portion of text from the resume provided above so we can programmatically find and replace it. Do not paraphrase currentText.

EXAMPLE SUGGESTIONS (model your response exactly as a single JSON array like this):

[
  {
    "category": "experience_bullet",
    "title": "Strengthen impact of AWS deployment experience",
    "description": "Current bullet is passive. Rewrite with stronger action verb and quantify the scale/impact",
    "currentText": "Responsible for AWS infrastructure management",
    "suggestedText": "Architected and deployed AWS infrastructure supporting 100K+ daily active users, reducing deployment time by 60%",
    "section": "experience",
    "impactLevel": "high",
    "priority": 5,
    "reasoning": "High-value keywords (architected, AWS, scale metrics) and quantification strengthen both ATS and human review"
  },
  {
    "category": "achievement_quantification",
    "title": "Add specific ROI metrics to marketing campaign bullet",
    "description": "Quantify the business impact with concrete numbers. Metrics make achievements credible and impressive",
    "currentText": "Led successful marketing campaigns",
    "suggestedText": "Led 12 marketing campaigns generating $2.4M in revenue with 34% average conversion rate",
    "section": "experience",
    "impactLevel": "high",
    "priority": 4,
    "reasoning": "Numbers provide credibility and are remembered better by hiring managers"
  },
  {
    "category": "contact_info",
    "title": "Naukri/LinkedIn SEO: Add profile headline",
    "description": "Indian job portals rank candidates based on keyword density in the headline. Make sure your profile headline matches your target role.",
    "currentText": null,
    "suggestedText": "Add 'Senior Frontend Engineer | React | Next.js' as your headline",
    "section": "contact",
    "impactLevel": "medium",
    "priority": 4,
    "reasoning": "Search visibility on portals like Naukri heavily relies on headline keywords."
  }
]

═══════════════════════════════════════════════════════════════════════════════════════

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
      suggestion_category: s.category,
      title: s.title,
      description: s.description,
      current_text: s.currentText || null,
      suggested_text: s.suggestedText,
      section: s.section,
      impact_level: s.impactLevel ? String(s.impactLevel).toLowerCase() : "medium",
      priority: s.priority,
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

  } catch (error: any) {
    console.error("Comprehensive analysis error:", error);
    return NextResponse.json(
      { error: "Failed to generate comprehensive suggestions: " + error.message },
      { status: 500 }
    );
  }
}
