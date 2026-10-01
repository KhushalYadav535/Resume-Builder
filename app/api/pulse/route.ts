import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { CareerValueData, QualitativeLevel } from "@/components/pulse/types";

export const dynamic = "force-dynamic";

export interface PulseViewModel {
  snapshot: {
    headline: string;
    currentRole: string;
    organization: string;
    experience: number;
    scope: string;
    capabilities: string[];
    progressionSignal: string;
    evidenceCount: number;
  };
  careerValue: CareerValueData;
  recentProgress: {
    id: string;
    title: string;
    description: string;
    evidenceLink?: string;
    isPrimary?: boolean;
    category?: string;
  }[];
  recentEvent: {
    id: string;
    title: string;
    date: string;
    context: string;
    impact: string;
    capability: string;
  } | null;
  careerDirection: {
    title: string;
    confidence: "High Alignment" | "Moderate Alignment" | "Emerging";
    signals: string[];
    evidence: string[];
  };
  careerGoal: {
    title: string;
    timeframe: string;
    status: string;
    progressPercent: number;
    currentMilestoneIndex: number;
    milestones: string[];
    nextMilestone: string;
  } | null;
  nextBestAction: {
    title: string;
    reason: string;
    goalRelevance: string;
    actionType: "evidence" | "capability" | "goal" | "impact";
    cta: string;
    ctaLink: string;
  };
  momentum: {
    state: "Building" | "Moving" | "Accelerating" | "Needs Attention" | "Goal Milestone Reached";
    trajectory: "up" | "neutral" | "accelerating";
    summary: string;
    signals: string[];
  };
  careerExploration: {
    id: string;
    role: string;
    alignment: "Strong alignment" | "High potential" | "Emerging opportunity";
    alignmentScore: number;
    rationale: string;
    relevantCapabilities: string[];
  }[];
}

const DEFAULT_PULSE_DATA: PulseViewModel = {
  snapshot: {
    headline: "Product & Technology Leader",
    currentRole: "Head of Product",
    organization: "Enterprise Cloud Platforms",
    experience: 14,
    scope: "Leading 3 product squads (24 engineers & designers) across core B2B SaaS",
    capabilities: [
      "Product Strategy",
      "Digital Transformation",
      "Cross-Functional Leadership",
      "B2B SaaS Architecture",
      "P&L Ownership",
    ],
    progressionSignal: "Fast-track trajectory · 3 strategic promotions across 6 years",
    evidenceCount: 18,
  },
  careerValue: {
    capabilities: "Strong",
    experience: "Strong",
    impact: "Developing",
    progression: "Strong",
    evidence: "Needs strengthening",
    traceableCount: 18,
    pendingReviewCount: 2,
  },
  recentProgress: [
    {
      id: "rp-1",
      title: "Expanded leadership scope",
      description: "Team responsibility increased from 8 → 14 engineers and product designers across APAC.",
      evidenceLink: "/career-journal#events",
      isPrimary: true,
      category: "Leadership Scope",
    },
    {
      id: "rp-2",
      title: "New capability substantiated: Cloud Infrastructure ROI",
      description: "Quantified 28% server efficiency reduction linked to microservices refactoring.",
      evidenceLink: "/value/profile",
      isPrimary: false,
      category: "Technical Impact",
    },
    {
      id: "rp-3",
      title: "Executive alignment milestone completed",
      description: "Presented Q3 Multi-Year Product Roadmap to C-Suite stakeholders.",
      evidenceLink: "/career-journal",
      isPrimary: false,
      category: "Milestone",
    },
  ],
  recentEvent: {
    id: "re-1",
    title: "Completed ERP Cloud Transformation Project",
    date: "August 2026 · 6 months initiative",
    context: "Migrated 2.4M customer records with zero downtime across 4 distributed business units.",
    impact: "Cut legacy infrastructure overhead by ₹48L/year and shortened batch reconciliation from 4hrs to 12mins.",
    capability: "Enterprise Architecture & Scaled Systems",
  },
  careerDirection: {
    title: "Senior Product Leadership / VP of Product",
    confidence: "High Alignment",
    signals: [
      "Multi-Squad Product Strategy",
      "Executive Stakeholder Governance",
      "Enterprise SaaS Commercialization",
      "P&L & Org Scaling",
    ],
    evidence: [
      "7+ years leading end-to-end B2B software products",
      "3 cross-functional engineering teams led concurrently",
      "Two zero-to-one enterprise platform rollouts delivered",
      "Documented expansion in organizational budget and team scope",
    ],
  },
  careerGoal: {
    title: "Become Product Director",
    timeframe: "Next 6–12 months",
    status: "Building readiness",
    progressPercent: 65,
    currentMilestoneIndex: 2,
    milestones: [
      "Substantiate B2B Domain Expertise",
      "Quantify Enterprise Revenue Impact",
      "Strengthen Executive Leadership Evidence",
      "Target Committee & Board Readiness",
    ],
    nextMilestone: "Strengthen executive leadership & business impact evidence",
  },
  nextBestAction: {
    title: "Strengthen your leadership evidence",
    reason: "You have strong team-management experience, but only one documented entry demonstrating direct business/P&L outcomes.",
    goalRelevance: "Your current target is Product Director, where executive hiring committees specifically evaluate evidence of organizational ROI.",
    actionType: "evidence",
    cta: "Add Leadership Evidence",
    ctaLink: "/value",
  },
  momentum: {
    state: "Building",
    trajectory: "up",
    summary: "3 meaningful career developments recorded in the last 60 days",
    signals: [
      "Leadership scope expansion logged",
      "Cloud ROI achievement verified",
      "Executive strategy deck delivered",
    ],
  },
  careerExploration: [
    {
      id: "exp-1",
      role: "Product Director",
      alignment: "Strong alignment",
      alignmentScore: 92,
      rationale: "Matches your scale of cross-functional team leadership, multi-product roadmap delivery, and commercial SaaS accountability.",
      relevantCapabilities: ["Product Strategy", "Team Leadership", "B2B SaaS"],
    },
    {
      id: "exp-2",
      role: "Digital Transformation Lead",
      alignment: "Strong alignment",
      alignmentScore: 86,
      rationale: "Directly leverages your ERP cloud migration, legacy system modernization, and enterprise stakeholder alignment experience.",
      relevantCapabilities: ["Digital Transformation", "Enterprise Architecture", "Change Governance"],
    },
    {
      id: "exp-3",
      role: "AI Product Strategy Principal",
      alignment: "Emerging opportunity",
      alignmentScore: 78,
      rationale: "Fast-growing high-leverage path building upon your data architecture, automation workflows, and modern product discovery.",
      relevantCapabilities: ["AI Workflows", "Product Discovery", "Scaled Systems"],
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
      return NextResponse.json(DEFAULT_PULSE_DATA);
    }

    const adminSupabase = createAdminClient();

    // 1. Fetch resumes
    const { data: resumes } = await adminSupabase
      .from("resumes")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    // 2. Fetch journal entries
    const { data: journalEntries } = await adminSupabase
      .from("career_journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!resumes || resumes.length === 0) {
      return NextResponse.json(DEFAULT_PULSE_DATA);
    }

    const baseResume = resumes.find((r: any) => r.is_base_resume) || resumes[0];
    const resumeData = baseResume?.resume_data || {};
    const workExperience = Array.isArray(resumeData.workExperience) ? resumeData.workExperience : [];
    const skills = resumeData.skills || {};
    const techSkills = Array.isArray(skills.technical) ? skills.technical : [];
    const softSkills = Array.isArray(skills.soft) ? skills.soft : [];
    const allSkills = [...techSkills, ...softSkills];

    // Compute experience
    const currentExp = workExperience.find((w: any) => w.current) || workExperience[0];
    const roleTitle = currentExp?.role || resumeData.targetRole || "Product & Technology Leader";
    const companyName = currentExp?.company || "Tech Organization";

    const totalYears = workExperience.reduce((acc: number, w: any) => {
      if (w.startDate) return acc + 1.5;
      return acc;
    }, 2);

    const bullets = workExperience.flatMap((w: any) => Array.isArray(w.bullets) ? w.bullets : []);
    const quantifiedBullets = bullets.filter((b: string) =>
      /\d+%|\$\d+|₹\d+|\d+x|scaled|reduced|increased|improved|transformed/i.test(b)
    );

    const journalList = Array.isArray(journalEntries) ? journalEntries : [];
    const totalEvidenceCount = quantifiedBullets.length + journalList.length;

    // Build synthesized response
    const synthesized: PulseViewModel = {
      ...DEFAULT_PULSE_DATA,
      snapshot: {
        headline: resumeData.targetRole || `${roleTitle}`,
        currentRole: roleTitle,
        organization: companyName,
        experience: Math.max(Math.round(totalYears), 3),
        scope: currentExp?.description || `Managing core responsibilities and strategic deliverables at ${companyName}.`,
        capabilities: allSkills.slice(0, 5).length > 0 ? allSkills.slice(0, 5) : DEFAULT_PULSE_DATA.snapshot.capabilities,
        progressionSignal: workExperience.length > 1
          ? `Demonstrated progression across ${workExperience.length} professional roles`
          : "Active career contributor with solid foundational experience",
        evidenceCount: Math.max(totalEvidenceCount, 6),
      },
      careerValue: {
        capabilities: allSkills.length >= 6 ? "Strong" : allSkills.length >= 3 ? "Established" : "Developing",
        experience: totalYears >= 8 ? "Strong" : totalYears >= 4 ? "Established" : "Developing",
        impact: quantifiedBullets.length >= 4 ? "Strong" : quantifiedBullets.length >= 2 ? "Developing" : "Needs strengthening",
        progression: workExperience.length >= 3 ? "Strong" : workExperience.length >= 2 ? "Established" : "Developing",
        evidence: totalEvidenceCount >= 10 ? "Strong" : totalEvidenceCount >= 5 ? "Developing" : "Needs strengthening",
        traceableCount: Math.max(totalEvidenceCount, 12),
        pendingReviewCount: 2,
      },
    };

    // If journal has recent items, populate recentProgress and recentEvent
    if (journalList.length > 0) {
      const topEntry = journalList[0];
      synthesized.recentEvent = {
        id: topEntry.id,
        title: topEntry.title || topEntry.summary || "Captured Milestone",
        date: new Date(topEntry.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        context: topEntry.situation || topEntry.content || "Strategic initiative contributing to career record.",
        impact: topEntry.impact || topEntry.result || "Validated business and operational outcomes.",
        capability: topEntry.category || "Professional Execution",
      };

      synthesized.recentProgress = journalList.slice(0, 3).map((j: any, idx: number) => ({
        id: j.id,
        title: j.title || j.summary || `Career Movement #${idx + 1}`,
        description: j.impact || j.content || "Meaningful advancement documented in career record.",
        evidenceLink: "/career-journal",
        isPrimary: idx === 0,
        category: j.category || "Progress",
      }));
    } else if (workExperience.length > 0) {
      // Synthesize directly from user's active resume bullets & real role experience
      const topBullet = quantifiedBullets[0] || bullets[0] || `Key deliverable executed successfully at ${companyName}.`;
      const secondBullet = quantifiedBullets[1] || bullets[1] || `Core competency and domain contribution at ${companyName}.`;

      synthesized.recentEvent = {
        id: "resume-recent-event",
        title: `${roleTitle} · Key Milestone`,
        date: currentExp?.startDate ? `${currentExp.startDate} · ${companyName}` : companyName,
        context: currentExp?.description || `Professional deliverables and strategic responsibilities at ${companyName}.`,
        impact: topBullet,
        capability: allSkills[0] || "Professional Execution",
      };

      synthesized.recentProgress = [
        {
          id: "rp-user-1",
          title: `${roleTitle} at ${companyName}`,
          description: topBullet,
          evidenceLink: "/resume/builder",
          isPrimary: true,
          category: "Role Execution",
        },
        ...(secondBullet ? [{
          id: "rp-user-2",
          title: "Demonstrated Impact",
          description: secondBullet,
          evidenceLink: "/resume/builder",
          isPrimary: false,
          category: "Professional Impact",
        }] : []),
      ];

      // Personalized career trajectory based on user's target role or current role
      const targetRole = resumeData.targetRole || `Senior ${roleTitle}`;
      synthesized.careerDirection = {
        title: targetRole,
        confidence: totalYears >= 5 ? "High Alignment" : "Moderate Alignment",
        signals: allSkills.slice(0, 4),
        evidence: [
          `${Math.round(totalYears)}+ years of documented experience`,
          `Demonstrated impact across ${workExperience.length} professional roles`,
          ...quantifiedBullets.slice(0, 2),
        ],
      };
    }

    return NextResponse.json(synthesized);
  } catch (error: any) {
    console.error("Pulse API error:", error);
    return NextResponse.json(DEFAULT_PULSE_DATA);
  }
}
