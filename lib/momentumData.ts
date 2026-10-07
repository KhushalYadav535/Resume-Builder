import {
  CareerDirection,
  CareerGoal,
  CareerPriority,
  WhyThisGoal,
  SuggestedDirection,
  MomentumDashboardData,
  GoalType,
  GoalMilestone,
} from "@/types/momentum";

export const EMPTY_MOMENTUM_DATA: MomentumDashboardData = {
  direction: null,
  activeGoal: null,
  whyThisGoal: {
    summary: "Define your active career goal to see personalized AI reasoning based on your verified experience and stated priorities.",
    experienceFactors: [],
    priorityAlignment: [],
    supportingEvidence: [],
  },
  priorities: [
    {
      id: "pr-growth",
      type: "growth",
      label: "Career Growth & Seniority",
      importance: "high",
      preference: "Advancement into higher responsibility and impact",
      source: "Career Default",
      selected: true,
    },
    {
      id: "pr-comp",
      type: "comp",
      label: "Compensation Growth",
      importance: "high",
      preference: "Competitive compensation aligned with market rates",
      source: "Career Default",
      selected: true,
    },
    {
      id: "pr-learning",
      type: "learning",
      label: "Technical & Skill Mastery",
      importance: "medium",
      preference: "Expanding core capabilities and domain authority",
      source: "Career Default",
      selected: true,
    },
    {
      id: "pr-flex",
      type: "flexibility",
      label: "Work-Life & Remote Flexibility",
      importance: "medium",
      preference: "Sustainable work rhythm with modern flexibility",
      source: "Career Default",
      selected: false,
    },
    {
      id: "pr-leadership",
      type: "leadership",
      label: "Leadership & Scope",
      importance: "high",
      preference: "Leading strategic initiatives and mentoring others",
      source: "Career Default",
      selected: false,
    },
  ],
  progress: {
    completedMilestones: 0,
    totalMilestones: 0,
    milestones: [],
  },
  otherGoals: [],
  suggestedDirections: [],
};

// Aliased for backward compatibility - no longer hardcoded fake data
export const CANONICAL_MOMENTUM_DATA: MomentumDashboardData = EMPTY_MOMENTUM_DATA;

/**
 * Derives a real Momentum dashboard model synthesized from the candidate's ACTUAL
 * uploaded resume and career journal entries.
 */
export function deriveMomentumFromRealProfile(
  user: any,
  resumeData: any,
  journalEntries: any[] = []
): MomentumDashboardData {
  const workExperience = Array.isArray(resumeData?.workExperience) ? resumeData.workExperience : [];
  const skills = resumeData?.skills || {};
  const techSkills = Array.isArray(skills.technical) ? skills.technical : [];
  const softSkills = Array.isArray(skills.soft) ? skills.soft : [];
  const allSkills = [...techSkills, ...softSkills];

  const currentExp = workExperience.find((w: any) => w.current) || workExperience[0];
  const currentRole = currentExp?.role || resumeData?.targetRole || "Technology Professional";
  const currentCompany = currentExp?.company || "Organization";
  const targetRole = resumeData?.targetRole || (currentRole ? `Senior ${currentRole}` : "Lead Professional");

  const bullets = workExperience.flatMap((w: any) => (Array.isArray(w.bullets) ? w.bullets : []));
  const quantifiedBullets = bullets.filter((b: string) =>
    /\d+%|\$\d+|₹\d+|\d+x|scaled|reduced|increased|improved|transformed|growth|led|designed|developed/i.test(b)
  );

  const realEvidence = (quantifiedBullets.length > 0 ? quantifiedBullets : bullets)
    .slice(0, 4)
    .map((bullet: string, idx: number) => ({
      id: `ev-real-${idx + 1}`,
      title: `${currentRole} Delivery`,
      category: allSkills[idx] || "Career Execution",
      snippet: bullet,
    }));

  // Detect domain
  const skillsStr = (allSkills.join(" ") + " " + currentRole).toLowerCase();
  const isEngineering = /software|developer|engineer|react|python|java|javascript|backend|frontend|fullstack|c\+\+|node|vite|html|css|sql/i.test(skillsStr);
  const isDesign = /design|ux|ui|figma|product designer/i.test(skillsStr);
  const isData = /data|machine learning|ai|analyst|analytics|science/i.test(skillsStr);

  let suggestedDirections: SuggestedDirection[] = [];

  if (isEngineering) {
    suggestedDirections = [
      {
        id: "dir-eng-1",
        title: `Senior Full Stack Engineer`,
        trajectory: `${currentRole} → Senior Engineer → Tech Lead`,
        rationale: `Builds directly on your demonstrated capabilities in ${techSkills.slice(0, 3).join(", ") || "software development"} and hands-on system delivery.`,
      },
      {
        id: "dir-eng-2",
        title: `Solutions & Systems Architect`,
        trajectory: `${currentRole} → Cloud Specialist → Solutions Architect`,
        rationale: `Scales your technical problem-solving foundation into high-impact architectural governance and enterprise platform design.`,
      },
      {
        id: "dir-eng-3",
        title: `Engineering Team Lead / Manager`,
        trajectory: `${currentRole} → Tech Lead → Engineering Manager`,
        rationale: `Combines your core technical mastery with team mentorship, cross-functional delivery, and strategic engineering leadership.`,
      },
    ];
  } else if (isDesign) {
    suggestedDirections = [
      {
        id: "dir-des-1",
        title: `Lead Product Designer`,
        trajectory: `${currentRole} → Senior Product Designer → Staff Designer`,
        rationale: `Advances your UX and UI craft into end-to-end design ownership and cross-functional product direction.`,
      },
      {
        id: "dir-des-2",
        title: `Design Systems Architect`,
        trajectory: `${currentRole} → UI Specialist → Design Systems Lead`,
        rationale: `Focuses on reusable UI tokens, multi-platform design architectures, and brand design velocity.`,
      },
    ];
  } else if (isData) {
    suggestedDirections = [
      {
        id: "dir-data-1",
        title: `Lead Data & ML Engineer`,
        trajectory: `${currentRole} → Senior Data Scientist → Lead AI Engineer`,
        rationale: `Leverages your mathematical, analytical, and data pipeline foundation for scalable intelligent platforms.`,
      },
    ];
  } else {
    suggestedDirections = [
      {
        id: "dir-gen-1",
        title: `Senior ${currentRole}`,
        trajectory: `${currentRole} → Senior ${currentRole} → Lead Specialist`,
        rationale: `Natural next step that expands your domain authority, strategic ownership, and compensation potential.`,
      },
      {
        id: "dir-gen-2",
        title: `${currentRole} Lead / Manager`,
        trajectory: `${currentRole} → Team Lead → Department Head`,
        rationale: `Transition from individual execution into strategic team mentorship and organizational impact.`,
      },
    ];
  }

  const experienceFactors = [
    `Verified track record as ${currentRole} at ${currentCompany}`,
    allSkills.length > 0 ? `Demonstrated capabilities in ${allSkills.slice(0, 4).join(", ")}` : "Verified core competencies in your domain",
    bullets.length > 0 ? `Documented deliverables across ${bullets.length} professional achievements` : "Active contributor with solid foundational momentum",
  ];

  const primaryDirection: CareerDirection = {
    id: "dir-real-user",
    title: suggestedDirections[0]?.title || `Advance to Senior ${currentRole}`,
    description: `Advancing capabilities from ${currentRole} toward higher-scope ${targetRole}.`,
    currentPath: currentRole,
    targetPath: targetRole,
    fullTrajectory: [currentRole, `Senior ${currentRole}`, targetRole],
    status: "Active",
    source: "Derived from Real Profile",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return {
    direction: primaryDirection,
    activeGoal: null, // Zero mock data: lets user confirm or set their real goal
    whyThisGoal: {
      summary: `Your experience as ${currentRole} at ${currentCompany} and validated skills in ${techSkills.slice(0, 3).join(", ") || "your core domain"} form a strong foundation for reaching ${targetRole}.`,
      experienceFactors,
      priorityAlignment: [
        "Aligns with career growth and expansion into higher-scope initiatives",
        "Directly leverages your proven project deliverables and technical skills",
      ],
      supportingEvidence: realEvidence,
    },
    priorities: EMPTY_MOMENTUM_DATA.priorities,
    progress: {
      completedMilestones: 0,
      totalMilestones: 0,
      milestones: [],
    },
    otherGoals: [],
    suggestedDirections,
  };
}


/**
 * Generates tailored, domain-specific milestones for any goal type (Spec Section 6 & 7)
 */
export function getDefaultMilestonesForGoalType(
  goalType: GoalType,
  targetRole?: string
): GoalMilestone[] {
  const role = targetRole || "Target Role";
  const now = new Date().toISOString().split("T")[0];

  switch (goalType) {
    case "Promotion":
      return [
        {
          id: `m-${Date.now()}-1`,
          title: `Next-level ${role} competency expectations defined`,
          completed: true,
          stage: "direction",
          completedAt: now,
          sourceType: "Capability development",
        },
        {
          id: `m-${Date.now()}-2`,
          title: "Document direct ₹ ROI metrics & business impact case",
          completed: false,
          stage: "target",
          sourceType: "Evidence captured",
        },
        {
          id: `m-${Date.now()}-3`,
          title: "Establish executive sponsor endorsement & champion",
          completed: false,
          stage: "strategy",
          sourceType: "Networking",
        },
        {
          id: `m-${Date.now()}-4`,
          title: "Formal promotion nomination submitted in review cycle",
          completed: false,
          stage: "strategy",
          sourceType: "Career Event",
        },
        {
          id: `m-${Date.now()}-5`,
          title: `Promotion to ${role} finalized and effective`,
          completed: false,
          stage: "outcome",
          sourceType: "Promotion",
        },
      ];

    case "Salary Increase":
      return [
        {
          id: `m-${Date.now()}-1`,
          title: `Benchmark top-tier ${role} market compensation bands`,
          completed: true,
          stage: "direction",
          completedAt: now,
          sourceType: "Learning",
        },
        {
          id: `m-${Date.now()}-2`,
          title: "Audit verified value deliverables in Career Memory Proof Vault",
          completed: false,
          stage: "target",
          sourceType: "Evidence captured",
        },
        {
          id: `m-${Date.now()}-3`,
          title: "Draft bottom-line leverage pitch & compensation memo",
          completed: false,
          stage: "strategy",
          sourceType: "Capability development",
        },
        {
          id: `m-${Date.now()}-4`,
          title: "Executive compensation negotiation meeting executed",
          completed: false,
          stage: "strategy",
          sourceType: "Career Event",
        },
        {
          id: `m-${Date.now()}-5`,
          title: "Compensation revision finalized and executed",
          completed: false,
          stage: "outcome",
          sourceType: "Compensation change",
        },
      ];

    case "Job Change":
      return [
        {
          id: `m-${Date.now()}-1`,
          title: `Target role and company criteria defined for ${role}`,
          completed: true,
          stage: "direction",
          completedAt: now,
          sourceType: "Opportunity discovered",
        },
        {
          id: `m-${Date.now()}-2`,
          title: "Tailor high-impact resume and proof vault for target openings",
          completed: false,
          stage: "target",
          sourceType: "Evidence captured",
        },
        {
          id: `m-${Date.now()}-3`,
          title: "Submit 5 high-alignment applications via Navigator",
          completed: false,
          stage: "strategy",
          sourceType: "Application",
        },
        {
          id: `m-${Date.now()}-4`,
          title: "Complete multi-stage technical and executive interviews",
          completed: false,
          stage: "strategy",
          sourceType: "Interview",
        },
        {
          id: `m-${Date.now()}-5`,
          title: `Secure and accept offer for ${role}`,
          completed: false,
          stage: "outcome",
          sourceType: "Career Outcome",
        },
      ];

    case "Leadership Transition":
      return [
        {
          id: `m-${Date.now()}-1`,
          title: `Leadership scope & mandate defined for ${role}`,
          completed: true,
          stage: "direction",
          completedAt: now,
          sourceType: "Capability development",
        },
        {
          id: `m-${Date.now()}-2`,
          title: "Document multi-squad strategy & talent mentorship outcomes",
          completed: false,
          stage: "target",
          sourceType: "Evidence captured",
        },
        {
          id: `m-${Date.now()}-3`,
          title: "Align with leadership stakeholders on organization roadmap",
          completed: false,
          stage: "strategy",
          sourceType: "Networking",
        },
        {
          id: `m-${Date.now()}-4`,
          title: `Transition into executive ${role} finalized`,
          completed: false,
          stage: "outcome",
          sourceType: "New responsibility",
        },
      ];

    default:
      return [
        {
          id: `m-${Date.now()}-1`,
          title: `Target role defined: ${role}`,
          completed: true,
          stage: "direction",
          completedAt: now,
          sourceType: "Capability development",
        },
        {
          id: `m-${Date.now()}-2`,
          title: "Capability gaps identified & learning path established",
          completed: false,
          stage: "target",
          sourceType: "Evidence captured",
        },
        {
          id: `m-${Date.now()}-3`,
          title: "Career strategy & execution milestones established",
          completed: false,
          stage: "strategy",
          sourceType: "Opportunity discovered",
        },
        {
          id: `m-${Date.now()}-4`,
          title: `Career outcome achieved for ${role}`,
          completed: false,
          stage: "outcome",
          sourceType: "Career Outcome",
        },
      ];
  }
}

