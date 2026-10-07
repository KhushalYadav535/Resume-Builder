import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

export interface CareerContextModel {
  user: {
    id: string;
    email?: string;
    name: string;
  };
  current_position: {
    title: string;
    company: string;
    experienceYears: number;
    targetRole: string;
    scope: string;
  };
  career_summary: {
    headline: string;
    progressionSignal: string;
    topCapabilities: string[];
    evidenceCount: number;
  };
  value_summary: {
    capabilities: "Strong" | "Established" | "Developing";
    experience: "Strong" | "Established" | "Developing";
    impact: "Strong" | "Developing" | "Needs strengthening";
    progression: "Strong" | "Established" | "Developing";
    evidence: "Strong" | "Developing" | "Needs strengthening";
    traceableCount: number;
    pendingReviewCount: number;
    strengthAreas: string[];
  };
  momentum_summary: {
    state: "Building" | "Moving" | "Accelerating" | "Needs Attention";
    trajectory: "up" | "neutral" | "accelerating";
    summary: string;
    signals: string[];
  };
  recent_events: {
    id: string;
    title: string;
    date: string;
    context: string;
    impact: string;
    capability: string;
  }[];
  career_goals: {
    title: string;
    timeframe: string;
    status: string;
    progressPercent: number;
    nextMilestone: string;
  }[];
  navigator_summary: {
    directions: {
      role: string;
      alignment: string;
      alignmentScore: number;
      rationale: string;
    }[];
    availableTools: string[];
  };
  active_threads: {
    id: string;
    title: string;
    intent: string;
    status: string;
    current_stage: string;
    last_activity_at: string;
    next_action: string;
    summary: string;
  }[];
}

const DEFAULT_CAREER_CONTEXT: CareerContextModel = {
  user: {
    id: "guest",
    email: "user@uprole.me",
    name: "Professional",
  },
  current_position: {
    title: "Senior Technology Professional",
    company: "Technology Systems",
    experienceYears: 8,
    targetRole: "Engineering / Product Leadership",
    scope: "Leading cross-functional deliverables, architecture, and team outcomes.",
  },
  career_summary: {
    headline: "Technology & Product Leader",
    progressionSignal: "Consistent upward momentum across strategic initiatives",
    topCapabilities: [
      "System Architecture",
      "Cross-Functional Leadership",
      "Product Strategy",
      "Technical Execution",
      "Process Optimization",
    ],
    evidenceCount: 12,
  },
  value_summary: {
    capabilities: "Strong",
    experience: "Strong",
    impact: "Developing",
    progression: "Strong",
    evidence: "Needs strengthening",
    traceableCount: 14,
    pendingReviewCount: 2,
    strengthAreas: [
      "Technical Execution & Delivery",
      "Cross-Functional Orchestration",
      "High-Impact System Scalability",
    ],
  },
  momentum_summary: {
    state: "Building",
    trajectory: "up",
    summary: "3 meaningful career developments recorded in the last 60 days",
    signals: [
      "Leadership scope expanded across engineering squads",
      "Core system migration delivered with zero disruption",
      "Executive alignment deck presented",
    ],
  },
  recent_events: [
    {
      id: "ev-1",
      title: "Core Platform Migration & Modernization",
      date: "August 2026",
      context: "Led architectural decoupling of monolithic services into microservices.",
      impact: "Reduced system latency by 32% and accelerated release velocity.",
      capability: "System Architecture & Scaled Delivery",
    },
    {
      id: "ev-2",
      title: "Cross-Functional Squad Expansion",
      date: "July 2026",
      context: "Onboarded and mentored 6 engineers across product initiatives.",
      impact: "Eliminated sprint delivery bottlenecks by 40%.",
      capability: "Team Leadership & Talent Development",
    },
  ],
  career_goals: [
    {
      title: "Advance to Next Leadership Tier / Director",
      timeframe: "Next 6–12 months",
      status: "Building readiness",
      progressPercent: 65,
      nextMilestone: "Substantiate direct business revenue and P&L outcomes",
    },
  ],
  navigator_summary: {
    directions: [
      {
        role: "Director of Engineering / Product",
        alignment: "Strong alignment",
        alignmentScore: 92,
        rationale: "Directly matches your track record of multi-team ownership and architectural direction.",
      },
      {
        role: "Principal Architect",
        alignment: "High potential",
        alignmentScore: 88,
        rationale: "Leverages deep technical mastery and high-scale operational resilience.",
      },
    ],
    availableTools: [
      "Promotion Case Builder",
      "Salary Benchmarking",
      "STAR Interview Prep",
      "Precision JD Matcher",
      "Offer Evaluator",
    ],
  },
  active_threads: [
    {
      id: "thread-active-promo",
      title: "Promotion Readiness & Case",
      intent: "PROMOTION",
      status: "ACTIVE",
      current_stage: "EVIDENCE_REVIEW",
      last_activity_at: "2 hours ago",
      next_action: "Review leadership proof points in Journal",
      summary: "You were synthesizing your team expansion and system scale impact into a promotion case.",
    },
  ],
};

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(DEFAULT_CAREER_CONTEXT);
    }

    const adminSupabase = createAdminClient();

    // 1. Resolve user display name from user metadata
    const userName =
      user.user_metadata?.full_name ||
      user.user_metadata?.first_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Professional";

    // 2. Fetch resumes
    const { data: resumes } = await adminSupabase
      .from("resumes")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    // 3. Fetch journal entries
    const { data: journalEntries } = await adminSupabase
      .from("career_journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!resumes || resumes.length === 0) {
      return NextResponse.json({
        ...DEFAULT_CAREER_CONTEXT,
        user: {
          id: user.id,
          email: user.email,
          name: userName,
        },
      });
    }

    const baseResume = resumes.find((r: any) => r.is_base_resume) || resumes[0];
    const resumeData = baseResume?.resume_data || {};
    const workExperience = Array.isArray(resumeData.workExperience) ? resumeData.workExperience : [];
    const skills = resumeData.skills || {};
    const techSkills = Array.isArray(skills.technical) ? skills.technical : [];
    const softSkills = Array.isArray(skills.soft) ? skills.soft : [];
    const allSkills = [...techSkills, ...softSkills];

    const currentExp = workExperience.find((w: any) => w.current) || workExperience[0];
    const roleTitle = currentExp?.role || resumeData.targetRole || "Product & Technology Leader";
    const companyName = currentExp?.company || "Tech Organization";

    const totalYears = workExperience.reduce((acc: number, w: any) => {
      if (w.startDate) return acc + 1.5;
      return acc;
    }, 2);

    const bullets = workExperience.flatMap((w: any) => (Array.isArray(w.bullets) ? w.bullets : []));
    const quantifiedBullets = bullets.filter((b: string) =>
      /\d+%|\$\d+|₹\d+|\d+x|scaled|reduced|increased|improved|transformed|growth/i.test(b)
    );

    const journalList = Array.isArray(journalEntries) ? journalEntries : [];
    const totalEvidenceCount = quantifiedBullets.length + journalList.length;

    // Build synthesized recent events
    const recentEvents =
      journalList.length > 0
        ? journalList.slice(0, 3).map((j: any) => ({
            id: j.id,
            title: j.title || j.summary || "Captured Milestone",
            date: new Date(j.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
            context: j.situation || j.content || "Documented career contribution",
            impact: j.impact || j.result || "Verified professional impact",
            capability: j.category || "Professional Execution",
          }))
        : quantifiedBullets.slice(0, 2).map((b: string, i: number) => ({
            id: `qb-${i}`,
            title: `${roleTitle} Milestone`,
            date: currentExp?.startDate || "Recent",
            context: `Delivered key project at ${companyName}`,
            impact: b,
            capability: allSkills[i] || "Strategic Execution",
          }));

    // Fetch active threads for user from DB
    let activeThreads: any[] = [];
    try {
      const { data: dbThreads } = await adminSupabase
        .from("now_threads")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "ACTIVE")
        .order("last_activity_at", { ascending: false })
        .limit(3);

      if (dbThreads && dbThreads.length > 0) {
        activeThreads = dbThreads.map((t: any) => ({
          id: t.id,
          title: t.title,
          intent: t.intent,
          status: t.status,
          current_stage: t.current_stage || "IN_PROGRESS",
          last_activity_at: t.last_activity_at
            ? new Date(t.last_activity_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
            : "Recent",
          next_action: t.next_action || "Continue career thread",
          summary: `Resuming ${t.title} (${(t.intent || "").replace(/_/g, " ")})`,
        }));
      }
    } catch (e: any) {
      console.warn("now_threads query notice:", e.message);
    }

    if (activeThreads.length === 0) {
      activeThreads = [
        {
          id: "thread-user-promo",
          title: "Promotion Readiness",
          intent: "PROMOTION",
          status: "ACTIVE",
          current_stage: "EVIDENCE_REVIEW",
          last_activity_at: "Today",
          next_action: "Review leadership & impact evidence",
          summary: `Synthesizing ${companyName} achievements for your next level advancement.`,
        },
      ];
    }

    const responseContext: CareerContextModel = {
      user: {
        id: user.id,
        email: user.email,
        name: userName,
      },
      current_position: {
        title: roleTitle,
        company: companyName,
        experienceYears: Math.max(Math.round(totalYears), 3),
        targetRole: resumeData.targetRole || `Senior ${roleTitle}`,
        scope: currentExp?.description || `Managing core responsibilities and strategic deliverables at ${companyName}.`,
      },
      career_summary: {
        headline: resumeData.targetRole || `${roleTitle}`,
        progressionSignal:
          workExperience.length > 1
            ? `Demonstrated upward movement across ${workExperience.length} professional roles`
            : "Consistent high-value execution in current domain",
        topCapabilities: allSkills.slice(0, 6).length > 0 ? allSkills.slice(0, 6) : DEFAULT_CAREER_CONTEXT.career_summary.topCapabilities,
        evidenceCount: Math.max(totalEvidenceCount, 8),
      },
      value_summary: {
        capabilities: allSkills.length >= 6 ? "Strong" : allSkills.length >= 3 ? "Established" : "Developing",
        experience: totalYears >= 8 ? "Strong" : totalYears >= 4 ? "Established" : "Developing",
        impact: quantifiedBullets.length >= 4 ? "Strong" : quantifiedBullets.length >= 2 ? "Developing" : "Needs strengthening",
        progression: workExperience.length >= 3 ? "Strong" : workExperience.length >= 2 ? "Established" : "Developing",
        evidence: totalEvidenceCount >= 10 ? "Strong" : totalEvidenceCount >= 5 ? "Developing" : "Needs strengthening",
        traceableCount: Math.max(totalEvidenceCount, 12),
        pendingReviewCount: 2,
        strengthAreas: allSkills.slice(0, 3).length > 0 ? allSkills.slice(0, 3) : DEFAULT_CAREER_CONTEXT.value_summary.strengthAreas,
      },
      momentum_summary: {
        state: "Building",
        trajectory: "up",
        summary: `${Math.max(journalList.length, 3)} meaningful career advancements substantiated`,
        signals: [
          `Documented impact in ${companyName}`,
          `${Math.round(totalYears)}+ years domain specialization`,
          quantifiedBullets[0] || "Cross-functional scope expanded",
        ],
      },
      recent_events: recentEvents,
      career_goals: [
        {
          title: `Advance to ${resumeData.targetRole || `Director / Lead of ${roleTitle}`}`,
          timeframe: "Next 6–12 months",
          status: "Building readiness",
          progressPercent: 68,
          nextMilestone: "Substantiate executive leadership & business impact evidence",
        },
      ],
      navigator_summary: {
        directions: [
          {
            role: resumeData.targetRole || `Director / Principal ${roleTitle}`,
            alignment: "Strong alignment",
            alignmentScore: 92,
            rationale: `Capitalizes directly on your ${Math.round(totalYears)}+ years track record and quantifiable outcomes at ${companyName}.`,
          },
          {
            role: `Strategic Lead / Head of ${roleTitle.replace(/senior|lead/gi, "").trim() || "Technology"}`,
            alignment: "High potential",
            alignmentScore: 84,
            rationale: "Expands organizational scope and executive cross-functional leadership.",
          },
        ],
        availableTools: [
          "Promotion Case Builder",
          "Salary Benchmarking",
          "STAR Interview Prep",
          "Precision JD Matcher",
          "Offer Evaluator",
        ],
      },
      active_threads: activeThreads,
    };

    return NextResponse.json(responseContext);
  } catch (error: any) {
    console.error("Career Context API error:", error);
    return NextResponse.json(DEFAULT_CAREER_CONTEXT);
  }
}
