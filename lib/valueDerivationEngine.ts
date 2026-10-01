import { Resume, WorkExperience, Project, Education, Certification } from "@/types";
import {
  CareerFact,
  CareerEvidence,
  CareerInterpretation,
  CareerInterpretationType,
  CareerInterpretationStatus,
  CareerInterpretationConfidence,
  EvidenceFactItem,
  ExperienceDimension,
  ProgressionSignalItem,
  StrengtheningArea,
  EvidenceSummary,
  CareerValueResponse,
} from "@/types/value";

export interface ReviewLogMap {
  facts: Record<string, { status: "CONFIRMED" | "EDITED" | "REJECTED"; editedText?: string; reason?: string }>;
  interpretations: Record<string, { status: "ACCEPTED" | "EDITED" | "REJECTED"; editedTitle?: string; editedDesc?: string; note?: string }>;
}

export function parseJournalReviewLogs(journalEntries: any[]): ReviewLogMap {
  const map: ReviewLogMap = {
    facts: {},
    interpretations: {},
  };

  journalEntries.forEach((entry) => {
    const tags = Array.isArray(entry.tags) ? entry.tags : [];
    const metrics = entry.extracted_metrics || {};

    // Fact Review
    if (tags.includes("FactReview") || metrics.factId) {
      const factId = metrics.factId;
      if (factId) {
        map.facts[factId] = {
          status: metrics.status || "CONFIRMED",
          editedText: metrics.editedText || metrics.statement,
          reason: metrics.rejectionReason,
        };
      }
    }

    // Capability / Interpretation / Pattern Review
    if (
      tags.includes("CapabilityReview") ||
      tags.includes("PatternReview") ||
      tags.includes("InterpretationReview") ||
      metrics.capabilityId ||
      metrics.patternId ||
      metrics.interpretationId
    ) {
      const interpId = metrics.interpretationId || metrics.capabilityId || metrics.patternId;
      if (interpId) {
        const action = metrics.action;
        let status: "ACCEPTED" | "EDITED" | "REJECTED" = "ACCEPTED";
        if (action === "reject" || metrics.status === "rejected") status = "REJECTED";
        else if (action === "edit" || metrics.status === "modified") status = "EDITED";
        else status = "ACCEPTED";

        map.interpretations[interpId] = {
          status,
          editedTitle: metrics.editedName || metrics.patternName || metrics.capabilityName,
          editedDesc: metrics.editedDescription || metrics.description,
          note: metrics.userNote || metrics.note,
        };
      }
    }
  });

  return map;
}

export function extractCareerFactsFromResume(
  resume: Resume | null,
  journalEntries: any[],
  reviewLogs: ReviewLogMap
): CareerFact[] {
  const facts: CareerFact[] = [];
  const resumeData = resume?.resume_data;
  const fileName = resume?.file_name || "Primary Resume";
  const sourceId = resume?.id;
  const extractedAt = resume?.created_at || new Date().toISOString();

  if (resumeData) {
    const expList = resumeData.workExperience || [];

    // 1. Work Experience Roles & Bullets
    expList.forEach((w: WorkExperience, expIdx: number) => {
      const company = w.company || "Organization";
      const role = w.role || "Role";
      const dateRange = `${w.startDate || ""} - ${w.current ? "Present" : w.endDate || ""}`.trim();
      const sourceTitle = `${role} · ${company}`;

      // Fact: Role
      const roleFactId = `fact-role-${expIdx}`;
      const roleLog = reviewLogs.facts[roleFactId];
      facts.push({
        id: roleFactId,
        category: "ROLE",
        statement: roleLog?.editedText || `Served as ${role} at ${company} (${dateRange || "Tenure"}).`,
        originalStatement: `Served as ${role} at ${company} (${dateRange || "Tenure"}).`,
        sourceType: "Resume",
        sourceId,
        sourceTitle,
        sourceDate: dateRange,
        status: roleLog?.status || "CONFIRMED",
        confidence: "HIGH",
        extractedAt,
      });

      // Fact: Promotion (if prior role exists at same company or mentions promotion)
      const nextRoleAtSameCompany = expList[expIdx + 1]?.company?.toLowerCase() === company.toLowerCase();
      const mentionsPromotion = /promoted|elevated|advanced to|transitioned to/i.test(role + " " + (w.bullets?.join(" ") || ""));
      if (nextRoleAtSameCompany || mentionsPromotion) {
        const promoFactId = `fact-promo-${expIdx}`;
        const promoLog = reviewLogs.facts[promoFactId];
        facts.push({
          id: promoFactId,
          category: "PROMOTION",
          statement: promoLog?.editedText || `Promoted to ${role} at ${company}.`,
          originalStatement: `Promoted to ${role} at ${company}.`,
          sourceType: "Resume",
          sourceId,
          sourceTitle,
          sourceDate: dateRange,
          status: promoLog?.status || "EXTRACTED",
          confidence: "HIGH",
          extractedAt,
        });
      }

      // Fact: Team Size if stated
      if (w.teamSize && w.teamSize > 0) {
        const teamFactId = `fact-team-${expIdx}`;
        const teamLog = reviewLogs.facts[teamFactId];
        facts.push({
          id: teamFactId,
          category: "TEAM",
          statement: teamLog?.editedText || `Led a cross-functional team of ${w.teamSize} members at ${company}.`,
          originalStatement: `Led a cross-functional team of ${w.teamSize} members at ${company}.`,
          sourceType: "Resume",
          sourceId,
          sourceTitle,
          sourceDate: dateRange,
          status: teamLog?.status || "EXTRACTED",
          confidence: "HIGH",
          extractedAt,
        });
      }

      // Fact: Bullets (Responsibilities, Metrics, Achievements, Business Outcomes)
      (w.bullets || []).forEach((b: string, bIdx: number) => {
        const bulletText = b.trim();
        if (!bulletText) return;

        const bulletFactId = `fact-bullet-${expIdx}-${bIdx}`;
        const bulletLog = reviewLogs.facts[bulletFactId];

        // Classify category based on text analysis
        const isBiz = /\$|₹|revenue|cost reduction|margin|profit|arr|mrr|cost savings/i.test(bulletText);
        const isMetric = /\d+%|\$\d+|₹\d+|\d+x|reduced|increased|improved|scaled|saved|growth/i.test(bulletText);
        const isTeam = /managed|led|hired|mentored|guided|team of/i.test(bulletText);
        const isPromo = /promoted|elevated/i.test(bulletText);
        const isProject = /architected|developed|built|deployed|designed|engineered/i.test(bulletText);

        const category = isBiz
          ? "BUSINESS_OUTCOME"
          : isPromo
          ? "PROMOTION"
          : isMetric
          ? "METRIC"
          : isTeam
          ? "TEAM"
          : isProject
          ? "PROJECT"
          : "RESPONSIBILITY";

        facts.push({
          id: bulletFactId,
          category,
          statement: bulletLog?.editedText || bulletText,
          originalStatement: bulletText,
          sourceType: "Resume",
          sourceId,
          sourceTitle,
          sourceDate: dateRange,
          status: bulletLog?.status || "EXTRACTED",
          confidence: isMetric || isBiz ? "HIGH" : "MEDIUM",
          extractedAt,
        });
      });
    });

    // 2. Projects
    (resumeData.projects || []).forEach((p: Project, pIdx: number) => {
      const projName = p.name || "Engineering Project";
      const projFactId = `fact-proj-${pIdx}`;
      const projLog = reviewLogs.facts[projFactId];

      facts.push({
        id: projFactId,
        category: "PROJECT",
        statement: projLog?.editedText || `${projName}: ${p.description || "Delivered project architecture."}`,
        originalStatement: `${projName}: ${p.description || "Delivered project architecture."}`,
        sourceType: "Resume",
        sourceId,
        sourceTitle: `Project · ${projName}`,
        status: projLog?.status || "EXTRACTED",
        confidence: "HIGH",
        extractedAt,
      });

      const projTech = p.techStack || (p as any).technologies || [];
      if (projTech.length > 0) {
        const techFactId = `fact-proj-tech-${pIdx}`;
        const techLog = reviewLogs.facts[techFactId];
        facts.push({
          id: techFactId,
          category: "TECHNOLOGY",
          statement: techLog?.editedText || `Built with stack: ${projTech.join(", ")}.`,
          originalStatement: `Built with stack: ${projTech.join(", ")}.`,
          sourceType: "Resume",
          sourceId,
          sourceTitle: `Project · ${projName}`,
          status: techLog?.status || "CONFIRMED",
          confidence: "HIGH",
          extractedAt,
        });
      }
    });

    // 3. Technical & Soft Skills
    const techSkills = resumeData.skills?.technical || [];
    if (techSkills.length > 0) {
      const skillFactId = `fact-skills-tech`;
      const skillLog = reviewLogs.facts[skillFactId];
      facts.push({
        id: skillFactId,
        category: "TECHNOLOGY",
        statement: skillLog?.editedText || `Demonstrated technical stack: ${techSkills.slice(0, 10).join(", ")}.`,
        originalStatement: `Demonstrated technical stack: ${techSkills.slice(0, 10).join(", ")}.`,
        sourceType: "Resume",
        sourceId,
        sourceTitle: fileName,
        status: skillLog?.status || "CONFIRMED",
        confidence: "HIGH",
        extractedAt,
      });
    }

    // 4. Education
    (resumeData.education || []).forEach((edu: Education, eIdx: number) => {
      const eduFactId = `fact-edu-${eIdx}`;
      const eduLog = reviewLogs.facts[eduFactId];
      const eduTitle = `${edu.degree || "Degree"} from ${edu.institution || "University"}`;
      const eduEnd = edu.endDate || (edu as any).graduationDate || "Completed";

      facts.push({
        id: eduFactId,
        category: "EDUCATION",
        statement: eduLog?.editedText || `${eduTitle} (${eduEnd}).`,
        originalStatement: `${eduTitle} (${eduEnd}).`,
        sourceType: "Resume",
        sourceId,
        sourceTitle: edu.institution || "Academic Institution",
        status: eduLog?.status || "CONFIRMED",
        confidence: "HIGH",
        extractedAt,
      });
    });

    // 5. Certifications
    (resumeData.certifications || []).forEach((cert: Certification, cIdx: number) => {
      const certFactId = `fact-cert-${cIdx}`;
      const certLog = reviewLogs.facts[certFactId];
      facts.push({
        id: certFactId,
        category: "CERTIFICATION",
        statement: certLog?.editedText || `${cert.name} issued by ${cert.issuer || "Accredited Body"}.`,
        originalStatement: `${cert.name} issued by ${cert.issuer || "Accredited Body"}.`,
        sourceType: "Resume",
        sourceId,
        sourceTitle: cert.issuer || "Certification Authority",
        status: certLog?.status || "CONFIRMED",
        confidence: "HIGH",
        extractedAt,
      });
    });

    // 6. Hackathons & Competitions (RECOGNITION)
    (resumeData.hackathons || []).forEach((h: string, hIdx: number) => {
      const hFactId = `fact-hackathon-${hIdx}`;
      const hLog = reviewLogs.facts[hFactId];
      facts.push({
        id: hFactId,
        category: "RECOGNITION",
        statement: hLog?.editedText || h,
        originalStatement: h,
        sourceType: "Resume",
        sourceId,
        sourceTitle: "Hackathon / Competition Award",
        status: hLog?.status || "CONFIRMED",
        confidence: "HIGH",
        extractedAt,
      });
    });

    (resumeData.campusAchievements || []).forEach((ach: string, aIdx: number) => {
      const aFactId = `fact-ach-${aIdx}`;
      const aLog = reviewLogs.facts[aFactId];
      facts.push({
        id: aFactId,
        category: "RECOGNITION",
        statement: aLog?.editedText || ach,
        originalStatement: ach,
        sourceType: "Resume",
        sourceId,
        sourceTitle: "Academic / Campus Distinction",
        status: aLog?.status || "CONFIRMED",
        confidence: "HIGH",
        extractedAt,
      });
    });
  }

  // 7. Journal Entries as Career Event Facts
  journalEntries.forEach((entry, jIdx) => {
    const tags = Array.isArray(entry.tags) ? entry.tags : [];
    // Ignore internal review actions as raw facts
    if (tags.includes("FactReview") || tags.includes("CapabilityReview") || tags.includes("PatternReview") || tags.includes("InterpretationReview")) {
      return;
    }

    const type = entry.entry_type || "win";
    let category: CareerFact["category"] = "ACHIEVEMENT";
    if (type === "promotion") category = "PROMOTION";
    else if (type === "skill") category = "DOMAIN";
    else if (type === "impact") category = "BUSINESS_OUTCOME";
    else if (type === "award" || type === "win") category = "RECOGNITION";
    else if (type === "project") category = "PROJECT";

    const jFactId = `fact-journal-${entry.id || jIdx}`;
    const jLog = reviewLogs.facts[jFactId];

    facts.push({
      id: jFactId,
      category,
      statement: jLog?.editedText || entry.content,
      originalStatement: entry.content,
      sourceType: "Career Event",
      sourceId: entry.id,
      careerEventId: entry.id,
      sourceTitle: entry.linked_role ? `Journal · ${entry.linked_role}` : `Career Event · ${entry.date || "Recorded"}`,
      sourceDate: entry.date,
      status: jLog?.status || "CONFIRMED",
      confidence: "HIGH",
      extractedAt: entry.created_at || new Date().toISOString(),
    });
  });

  return facts;
}

export function buildDerivationGraph(
  facts: CareerFact[],
  resume: Resume | null,
  journalEntries: any[],
  reviewLogs: ReviewLogMap
): CareerValueResponse {
  // Only CONFIRMED or EDITED or EXTRACTED (unrejected) facts can feed the derivation engine
  const activeFacts = facts.filter((f) => f.status !== "REJECTED");
  const confirmedFacts = facts.filter((f) => f.status === "CONFIRMED" || f.status === "EDITED");

  // Build Supporting Evidence Collections
  const leadershipFacts = activeFacts.filter(
    (f) =>
      f.category === "TEAM" ||
      /managed|led|hired|mentored|team of|director|manager|lead|squad/i.test(f.statement)
  );

  const architectureFacts = activeFacts.filter(
    (f) =>
      f.category === "PROJECT" ||
      f.category === "TECHNOLOGY" ||
      /architect|concurrency|latency|microservices|distributed|pipeline|cloud|backend|infrastructure/i.test(f.statement)
  );

  const processFacts = activeFacts.filter((f) =>
    /process|workflow|automat|pipeline|reporting|bottleneck|efficiency|cycle time|streamlined/i.test(f.statement)
  );

  const commercialImpactFacts = activeFacts.filter(
    (f) =>
      f.category === "METRIC" ||
      /\$|₹|revenue|cost|saved|growth|retention|conversion|roi|margin|scale/i.test(f.statement)
  );

  const coordinationFacts = activeFacts.filter((f) =>
    /stakeholder|cross-functional|partnered|aligned|client|coordinat|roadmap|collaborat/i.test(f.statement)
  );

  // Evidence Items (Level 3)
  const evidenceMap: Record<string, CareerEvidence> = {
    "ev-leadership": {
      id: "ev-leadership",
      statement: leadershipFacts.length > 0
        ? `Proven team leadership and talent guidance across organizational initiatives.`
        : `Demonstrated technical collaboration and squad mentorship.`,
      type: "Team Leadership at Scale",
      factIds: leadershipFacts.map((f) => f.id),
      facts: leadershipFacts,
    },
    "ev-architecture": {
      id: "ev-architecture",
      statement: `Production system architecture with high concurrency resilience and scalable distributed services.`,
      type: "High-Scale Technical Architecture",
      factIds: architectureFacts.map((f) => f.id),
      facts: architectureFacts,
    },
    "ev-process": {
      id: "ev-process",
      statement: `Systematic bottleneck elimination, automated build pipelines, and workflow modernization.`,
      type: "Operational Efficiency & Automation",
      factIds: processFacts.map((f) => f.id),
      facts: processFacts,
    },
    "ev-commercial": {
      id: "ev-commercial",
      statement: `Translating technical capabilities into measurable business growth, margin expansion, and cost efficiencies.`,
      type: "Commercial Impact & Value Optimization",
      factIds: commercialImpactFacts.map((f) => f.id),
      facts: commercialImpactFacts,
    },
    "ev-coordination": {
      id: "ev-coordination",
      statement: `Synthesizing technical constraints into executive roadmaps and aligning multi-disciplinary stakeholders.`,
      type: "Cross-Functional Stakeholder Alignment",
      factIds: coordinationFacts.map((f) => f.id),
      facts: coordinationFacts,
    },
  };

  // Helper to format supporting evidence for an interpretation (Rule 1 & Rule 5: rejected facts cannot support active evidence)
  const getSupportingEvidence = (evIds: string[]) => {
    return evIds
      .map((evId) => evidenceMap[evId])
      .filter(Boolean)
      .map((ev) => ({
        evidenceId: ev.id,
        statement: ev.statement,
        facts: ev.facts ? ev.facts.filter((f) => f.status !== "REJECTED").slice(0, 3) : [],
      }))
      .filter((ev) => ev.facts.length > 0);
  };

  const makeInterpretation = (
    id: string,
    type: CareerInterpretationType,
    defaultTitle: string,
    defaultDesc: string,
    confidence: CareerInterpretationConfidence,
    evidenceIds: string[]
  ): CareerInterpretation => {
    const review = reviewLogs.interpretations[id];
    const evidence = getSupportingEvidence(evidenceIds);
    // Rule 6: Depleted evidence automatically downgrades confidence to DEVELOPING
    const effectiveConfidence: CareerInterpretationConfidence =
      evidence.length === 0 ? "DEVELOPING" : confidence;

    return {
      id,
      type,
      title: review?.editedTitle || defaultTitle,
      description: review?.editedDesc || defaultDesc,
      status: review?.status || "SUGGESTED",
      confidence: effectiveConfidence,
      evidenceIds,
      supportingEvidence: evidence,
    };
  };

  // Interpretations: Capabilities (Dimension 1)
  const capabilities: CareerInterpretation[] = [
    makeInterpretation(
      "cap-tech-leadership",
      "CAPABILITY",
      "Technical Leadership & Mentorship",
      "Demonstrated ability to guide engineering teams, structure development practices, unblock technical delivery, and mentor engineers.",
      leadershipFacts.length >= 2 ? "HIGH" : "MODERATE",
      ["ev-leadership"]
    ),
    makeInterpretation(
      "cap-architecture",
      "CAPABILITY",
      "High-Scale System Architecture",
      "Designing robust, fault-tolerant backend architectures, microservices ecosystems, and data pipelines built for zero-downtime reliability.",
      architectureFacts.length >= 2 ? "HIGH" : "MODERATE",
      ["ev-architecture"]
    ),
    makeInterpretation(
      "cap-process-optimization",
      "CAPABILITY",
      "Process Improvement & Workflow Automation",
      "Identifying organizational and engineering bottlenecks, replacing manual overhead with automated pipelines, and accelerating delivery cycles.",
      processFacts.length >= 2 ? "HIGH" : "MODERATE",
      ["ev-process"]
    ),
    makeInterpretation(
      "cap-stakeholder-alignment",
      "CAPABILITY",
      "Stakeholder Alignment & Product Execution",
      "Bridging business priorities with technical execution, communicating trade-offs to senior leadership, and driving roadmap clarity.",
      coordinationFacts.length >= 1 ? "HIGH" : "DEVELOPING",
      ["ev-coordination"]
    ),
    makeInterpretation(
      "cap-commercial-value",
      "CAPABILITY",
      "Commercial Impact & Value Optimization",
      "Translating technology innovations into measurable top-line revenue acceleration, infrastructure cost savings, and business sustainability.",
      commercialImpactFacts.length >= 2 ? "HIGH" : "MODERATE",
      ["ev-commercial"]
    ),
  ].filter((c) => reviewLogs.interpretations[c.id]?.status !== "REJECTED");

  // Interpretations: Impact (Dimension 2)
  const impact: CareerInterpretation[] = [
    makeInterpretation(
      "imp-operational-velocity",
      "IMPACT",
      "Operational Velocity & Delivery Acceleration",
      "Consistently eliminated deployment bottlenecks and accelerated team release cadence through automation and systematic workflow hygiene.",
      processFacts.length > 0 ? "HIGH" : "MODERATE",
      ["ev-process"]
    ),
    makeInterpretation(
      "imp-system-resilience",
      "IMPACT",
      "High-Throughput Reliability & Zero Downtime",
      "Modernized infrastructure and optimized database query patterns to maintain high uptime and handle heavy concurrent traffic.",
      architectureFacts.length > 0 ? "HIGH" : "MODERATE",
      ["ev-architecture"]
    ),
    makeInterpretation(
      "imp-business-outcomes",
      "IMPACT",
      "Measurable Commercial Growth & Cost Reduction",
      "Directly influenced operational margins and customer retention by deploying high-value features with verifiable business metrics.",
      commercialImpactFacts.length > 0 ? "HIGH" : "MODERATE",
      ["ev-commercial"]
    ),
    makeInterpretation(
      "imp-strategic-ownership",
      "IMPACT",
      "End-to-End Strategic Initiative Ownership",
      "Steered multi-team initiatives from inception to post-launch monitoring with clear milestone execution and accountable outcomes.",
      coordinationFacts.length > 0 ? "HIGH" : "DEVELOPING",
      ["ev-coordination"]
    ),
  ].filter((i) => reviewLogs.interpretations[i.id]?.status !== "REJECTED");

  // Dimension 3: Experience
  const expList = resume?.resume_data?.workExperience || [];
  const rolesCount = expList.length;
  const organizations = Array.from(new Set(expList.map((e) => e.company).filter(Boolean)));
  
  // Approximate total years
  const totalYears = Math.max(
    rolesCount > 0 ? rolesCount * 2 : 1,
    expList.reduce((acc, curr) => acc + (curr.startDate && curr.endDate ? 2 : 1.5), 0)
  );

  const industries = Array.from(
    new Set(
      expList.map((e) => {
        if (/health|med/i.test(e.company + " " + e.role)) return "Healthcare & MedTech";
        if (/fin|bank|pay|crypto/i.test(e.company + " " + e.role)) return "Fintech & Banking";
        if (/ecom|retail|shop/i.test(e.company + " " + e.role)) return "E-Commerce & Retail";
        if (/cloud|saas|ai|software/i.test(e.company + " " + e.role)) return "Cloud Platforms & SaaS";
        return "Technology & Software";
      })
    )
  );

  const topDomains = Array.from(
    new Set([
      "Distributed Systems",
      "Full-Stack Web Engineering",
      "Cloud Architecture",
      "Team Leadership",
    ])
  );

  const experience: ExperienceDimension = {
    totalYears: Math.round(totalYears),
    rolesCount,
    industries,
    topDomains,
    organizations,
    narrative: `${rolesCount} verified professional roles across ${organizations.length} organizations, spanning ${industries.join(", ")}. Demonstrates broad organizational context, cross-industry adaptability, and diverse team environments.`,
  };

  // Dimension 4: Progression
  const progressionSignals: ProgressionSignalItem[] = expList.map((w, idx) => {
    const isCurrent = w.current || idx === 0;
    const prevCompany = expList[idx + 1]?.company;
    return {
      id: `prog-signal-${idx}`,
      title: `${w.role} at ${w.company}`,
      description: isCurrent
        ? "Current position: Leading active initiatives with high autonomy and strategic delivery ownership."
        : `Expanded scope and engineering responsibilities transitioning ${prevCompany ? `from ${prevCompany}` : "across career milestones"}.`,
      direction: idx === 0 ? "up" : "expanded",
      evidence: w.bullets?.[0] || `Key contributor at ${w.company}.`,
      source: `Resume · ${w.company}`,
    };
  });

  const progression = {
    signals: progressionSignals,
    evolutionSummary: "Demonstrates consistent trajectory from specialized hands-on implementation towards larger organizational scope, team leadership, and cross-functional business accountability.",
  };

  // Area 2: Value Pattern (Synthesized recurring career pattern)
  const patternId = "pattern-primary-synthesis";
  const patternReview = reviewLogs.interpretations[patternId];
  const valuePatterns: CareerInterpretation[] = [
    {
      id: patternId,
      type: "VALUE_PATTERN" as const,
      title:
        patternReview?.editedTitle ||
        "Strategic Problem Solver & Scalable Engineering Leader",
      description:
        patternReview?.editedDesc ||
        "Across your career, you have repeatedly moved from solving core technical challenges to taking ownership of broader business, architecture, and team outcomes.",
      status: (patternReview?.status || "SUGGESTED") as CareerInterpretationStatus,
      confidence: "HIGH" as const,
      evidenceIds: ["ev-leadership", "ev-architecture", "ev-process"],
      supportingEvidence: [
        {
          evidenceId: "ev-leadership",
          statement: leadershipFacts[0]?.statement || "Managed engineering team delivery across multi-timezone squads.",
          facts: leadershipFacts.slice(0, 2),
        },
        {
          evidenceId: "ev-architecture",
          statement: architectureFacts[0]?.statement || "Architected high-throughput services with fault-tolerant reliability.",
          facts: architectureFacts.slice(0, 2),
        },
        {
          evidenceId: "ev-process",
          statement: processFacts[0]?.statement || "Automated deployment workflows and streamlined operational velocity.",
          facts: processFacts.slice(0, 2),
        },
      ],
    },
  ].filter((p) => reviewLogs.interpretations[p.id]?.status !== "REJECTED");

  // Area 3: Evidence Foundation
  const evidenceSummary: EvidenceSummary = {
    confirmedFacts: confirmedFacts.length,
    evidenceItems: Object.keys(evidenceMap).length,
    careerEvents: journalEntries.length + rolesCount,
    totalFacts: facts.length,
  };

  // Area 4: Areas to Strengthen (Non-judgmental gap analysis)
  const strengtheningAreas: StrengtheningArea[] = [
    {
      dimension: "Technical Leadership & Mentorship",
      level: leadershipFacts.length >= 2 ? "Strong evidence" : "Moderate evidence",
      explanation:
        leadershipFacts.length >= 2
          ? "Robust records of team leadership, mentorship, and squad coordination."
          : "Demonstrated technical contribution; additional records on formal team size or hiring would further substantiate organizational scale.",
      suggestedAction: "Log a mentorship or team milestone in Career Journal",
      actionLink: "/career-journal",
    },
    {
      dimension: "High-Scale Technical Architecture",
      level: architectureFacts.length >= 2 ? "Strong evidence" : "Moderate evidence",
      explanation:
        architectureFacts.length >= 2
          ? "Solid evidence of scalable backend, cloud systems, and architectural design."
          : "Architecture experience stated; adding quantified system uptime or latency benchmarks will clarify technical scale.",
      suggestedAction: "Add an architecture benchmark or system diagram",
      actionLink: "/career-journal",
    },
    {
      dimension: "Commercial Impact & Value Optimization",
      level: commercialImpactFacts.length >= 2 ? "Strong evidence" : "Moderate evidence",
      explanation:
        commercialImpactFacts.length >= 2
          ? "Verifiable financial or metric-based impact recorded across career roles."
          : "Substantiated deliverables recorded; capturing exact revenue, savings, or user adoption metrics will elevate commercial value.",
      suggestedAction: "Record an achievement with quantified business outcome",
      actionLink: "/career-journal",
    },
    {
      dimension: "Strategic Product & Executive Ownership",
      level: coordinationFacts.length >= 2 ? "Moderate evidence" : "Limited evidence currently available",
      explanation:
        "Limited evidence currently recorded for long-term product roadmapping or executive decision-making. Adding strategic milestones provides balanced representation.",
      suggestedAction: "Add a career event for a strategic initiative led",
      actionLink: "/career-journal",
    },
  ];

  return {
    profile: {
      capabilities,
      impact,
      experience,
      progression,
    },
    valuePatterns,
    evidenceSummary,
    strengtheningAreas,
    activeResumeId: resume?.id,
  };
}
