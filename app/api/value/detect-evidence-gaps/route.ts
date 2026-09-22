import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { Resume, WorkExperience, Project } from "@/types";

export const dynamic = "force-dynamic";

export interface EvidenceGap {
  id: string;
  sourceType: "workExperience" | "project" | "achievement";
  sourceId: string;
  recordTitle: string;
  recordSubtitle: string;
  originalText: string;
  evidenceCategory:
    | "recognition"
    | "manager_feedback"
    | "customer_appreciation"
    | "expanded_responsibility"
    | "progression";
  promptTitle: string;
  promptContext: string;
  whyAsking: string;
  cardOptions: {
    id: string;
    label: string;
    desc: string;
  }[];
  followUpQuestions: Record<
    string,
    {
      title: string;
      subtitle: string;
      chips: string[];
      allowCustomText: boolean;
      customPlaceholder?: string;
    }
  >;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { resumeId } = body;

    let resumeQuery = supabase
      .from("resumes")
      .select("*")
      .eq("user_id", user.id);

    if (resumeId) {
      resumeQuery = resumeQuery.eq("id", resumeId);
    } else {
      resumeQuery = resumeQuery.order("created_at", { ascending: false });
    }

    const { data: resumes, error } = await resumeQuery;

    if (error || !resumes || resumes.length === 0) {
      return NextResponse.json({ gaps: [] });
    }

    const activeResume: Resume =
      resumes.find((r: Resume) => r.is_base_resume) || resumes[0];
    const data = activeResume.resume_data;

    if (!data) {
      return NextResponse.json({ gaps: [] });
    }

    const detectedGaps: EvidenceGap[] = [];

    // Common card options for Screen S2
    const defaultCards = [
      { id: "manager", label: "Manager appreciation", desc: "Verbal or written praise from your lead" },
      { id: "review", label: "Performance review", desc: "Formal appraisal rating or review endorsement" },
      { id: "award", label: "Award or certificate", desc: "Spot award, quarterly excellence, or certificate" },
      { id: "customer", label: "Customer appreciation", desc: "Direct client praise, testimonial or repeat business" },
      { id: "leadership", label: "Leadership acknowledgement", desc: "Mention by VP/Director/C-suite in town hall or email" },
      { id: "promotion", label: "Promotion", desc: "Designation upgrade or formal band promotion" },
      { id: "scope", label: "Additional responsibility", desc: "Larger team, territory, budget, or new decision authority" },
      { id: "none", label: "No formal recognition", desc: "Standard execution without formal recognition" },
    ];

    // Follow-ups tailored to each selection for Screen S3
    const defaultFollowUps = {
      manager: {
        title: "What did your manager appreciate most?",
        subtitle: "Choose the primary attribute recognized:",
        chips: [
          "Technical excellence & problem solving",
          "Reliability under tight deadlines",
          "Mentorship of junior team members",
          "Initiative beyond core job description",
          "Cross-functional stakeholder communication",
        ],
        allowCustomText: true,
        customPlaceholder: "e.g. Highlighted in quarterly all-hands...",
      },
      review: {
        title: "How was this reflected in your review?",
        subtitle: "Select the outcome from your performance evaluation:",
        chips: [
          "Exceeded expectations (top tier rating)",
          "Directly cited as primary annual accomplishment",
          "Led to accelerated appraisal increment",
          "Recommended for leadership track",
        ],
        allowCustomText: true,
        customPlaceholder: "e.g. Rated 'Far Exceeds' in annual cycle...",
      },
      award: {
        title: "What award or honor was granted?",
        subtitle: "Select the recognition format:",
        chips: [
          "Spot Award / Star of the Month",
          "Quarterly Engineering Excellence Award",
          "Hackathon / Innovation Contest Winner",
          "Company-wide Annual Excellence Award",
        ],
        allowCustomText: true,
        customPlaceholder: "e.g. Awarded 'Best Innovator Q3'...",
      },
      customer: {
        title: "How was customer appreciation expressed?",
        subtitle: "Select the client feedback format:",
        chips: [
          "Direct client testimonial / thank you email",
          "Renewed contract / expanded account revenue",
          "Specifically requested on future client engagements",
          "Improved CSAT or NPS score",
        ],
        allowCustomText: true,
        customPlaceholder: "e.g. Received praise letter from Client CTO...",
      },
      leadership: {
        title: "How was leadership acknowledgement shared?",
        subtitle: "Select how leadership acknowledged your work:",
        chips: [
          "Shoutout in company-wide town hall",
          "Selected to present at executive demo / review",
          "Special bonus or executive spot bonus",
          "Invited to strategic planning committee",
        ],
        allowCustomText: true,
        customPlaceholder: "e.g. Commended by VP of Engineering...",
      },
      promotion: {
        title: "What changed before or with the promotion?",
        subtitle: "Select the scope and title transition:",
        chips: [
          "Promoted to Senior / Lead level",
          "Took over decision authority for architecture",
          "Began reporting directly to Director/VP",
          "Received title change reflecting expanded ownership",
        ],
        allowCustomText: true,
        customPlaceholder: "e.g. Promoted from SDE-2 to Senior SDE...",
      },
      scope: {
        title: "What changed in your responsibilities?",
        subtitle: "Select the primary scope increase:",
        chips: [
          "Managed a larger engineering team (+3 to 8 engineers)",
          "Took ownership of a new product or technical domain",
          "Managed a larger customer or revenue portfolio",
          "Authorized to approve architecture & release decisions",
        ],
        allowCustomText: true,
        customPlaceholder: "e.g. Expanded to lead 2 squads...",
      },
      none: {
        title: "Self-Reported Execution",
        subtitle: "Confirm how this work was delivered:",
        chips: [
          "Delivered independently as part of standard roadmap",
          "Quiet high-impact delivery without formal ceremony",
          "Work was internal optimization",
        ],
        allowCustomText: false,
      },
    };

    // Scan experiences for evidence gaps
    (data.workExperience || []).forEach((exp: WorkExperience, expIdx: number) => {
      const bullets = exp.bullets || [];

      bullets.forEach((bullet: string, bIdx: number) => {
        const isProcessOrAccomplishment =
          /improved|increased|reduced|delivered|built|automated|architected|launched/i.test(
            bullet
          );

        if (isProcessOrAccomplishment) {
          detectedGaps.push({
            id: `ev-exp-${expIdx}-${bIdx}`,
            sourceType: "workExperience",
            sourceId: exp.id || `exp-${expIdx}`,
            recordTitle: exp.role || "Role",
            recordSubtitle: exp.company || "Company",
            originalText: bullet,
            evidenceCategory: "recognition",
            promptTitle: "Was your contribution recognised?",
            promptContext: `You mentioned: "${bullet}" at ${exp.company}. Did anyone acknowledge or reward this outcome?`,
            whyAsking:
              "Recognition, awards, and manager endorsements provide third-party proof that validates your career impact.",
            cardOptions: defaultCards,
            followUpQuestions: defaultFollowUps,
          });
        }
      });

      // If role mentions leading or current role has >1 yr tenure, detect expanded scope
      if (/lead|senior|manager|principal|architect/i.test(exp.role || "")) {
        detectedGaps.push({
          id: `ev-scope-${expIdx}`,
          sourceType: "workExperience",
          sourceId: exp.id || `exp-${expIdx}`,
          recordTitle: exp.role || "Role",
          recordSubtitle: exp.company || "Company",
          originalText: exp.role || "",
          evidenceCategory: "expanded_responsibility",
          promptTitle: "Did your responsibilities expand in this role?",
          promptContext: `In your role as ${exp.role} at ${exp.company}, did your team, decision authority, or scope increase over time?`,
          whyAsking:
            "Documenting scope growth shows progressive trust from leadership before formal title changes.",
          cardOptions: defaultCards,
          followUpQuestions: defaultFollowUps,
        });
      }
    });

    // Scan projects for client/customer praise
    (data.projects || []).forEach((proj: Project, projIdx: number) => {
      if (proj.name) {
        detectedGaps.push({
          id: `ev-proj-${projIdx}`,
          sourceType: "project",
          sourceId: proj.id || `proj-${projIdx}`,
          recordTitle: proj.name,
          recordSubtitle: "Project Deliverable",
          originalText: proj.description || proj.name,
          evidenceCategory: "customer_appreciation",
          promptTitle: "How was this project received?",
          promptContext: `You built "${proj.name}". Did users, clients, or leadership provide feedback or recognition?`,
          whyAsking:
            "External validation proves that your deliverables solved real business problems.",
          cardOptions: defaultCards,
          followUpQuestions: defaultFollowUps,
        });
      }
    });

    // Prioritize top 5 evidence gaps
    const prioritized = detectedGaps.slice(0, 5);

    return NextResponse.json({
      gaps: prioritized,
      totalGaps: detectedGaps.length,
      resumeId: activeResume.id,
    });
  } catch (err: unknown) {
    console.error("Evidence gap detection error:", err);
    return NextResponse.json(
      { error: "Failed to detect evidence gaps" },
      { status: 500 }
    );
  }
}
