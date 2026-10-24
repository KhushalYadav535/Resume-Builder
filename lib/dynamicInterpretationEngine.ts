import { Resume, WorkExperience, Project } from "@/types";
import {
  CareerFact,
  CareerEvidence,
  CareerInterpretation,
  CareerInterpretationType,
  CareerInterpretationStatus,
  CapabilityClassification,
  CareerInterpretationConfidence,
  EvidenceFactItem,
  EvidenceConfidence,
  DimensionSupport,
} from "@/types/value";
import { askAIJSON } from "@/lib/openrouter";

export interface ReviewLogMap {
  facts: Record<string, { status: "CONFIRMED" | "EDITED" | "REJECTED"; editedText?: string; reason?: string }>;
  interpretations: Record<string, { status: "ACCEPTED" | "EDITED" | "REJECTED"; editedTitle?: string; editedDesc?: string; note?: string }>;
}

export interface CandidateDomainInfo {
  domainCategory: string;
  archetype: string;
  isEarlyCareer: boolean;
  keySkills: string[];
}

/**
 * Detect candidate's domain and career level to ensure completely domain-agnostic interpretation.
 */
export function detectCandidateDomain(
  resume: Resume | null,
  facts: CareerFact[]
): CandidateDomainInfo {
  const resumeData = resume?.resume_data;
  const targetRole = resumeData?.personalInfo?.title || resumeData?.targetRole || "";
  const expList = resumeData?.workExperience || [];
  const currentRole = expList.find((w) => w.current)?.role || expList[0]?.role || targetRole || "";
  const allText = (currentRole + " " + targetRole + " " + facts.map((f) => f.statement).join(" ")).toLowerCase();

  const isEarlyCareer = /intern|junior|entry|trainee|fresher|student/i.test(currentRole) || expList.length <= 1;
  const skills = [
    ...(resumeData?.skills?.technical || []),
    ...(resumeData?.skills?.soft || []),
  ];

  if (/react|angular|vue|frontend|front-end|ui\/ux|html|css|javascript|typescript|web\s+developer/i.test(allText)) {
    return {
      domainCategory: "Frontend & Full-Stack Web Development",
      archetype: isEarlyCareer ? "Full-Stack Web Engineering Specialist" : "Senior Frontend & Web Systems Architect",
      isEarlyCareer,
      keySkills: skills.slice(0, 5),
    };
  }

  if (/backend|microservice|distributed|cloud|aws|kafka|docker|spring|java|golang|python|api|sql|database/i.test(allText)) {
    return {
      domainCategory: "High-Scale Backend & Distributed Systems",
      archetype: isEarlyCareer ? "Backend Engineering & API Specialist" : "Distributed Systems Architect & Platform Leader",
      isEarlyCareer,
      keySkills: skills.slice(0, 5),
    };
  }

  if (/data\s+scientist|machine\s+learning|ai|deep\s+learning|nlp|analytics|bi|tableau|sql|python/i.test(allText)) {
    return {
      domainCategory: "Data Science, Analytics & Machine Learning",
      archetype: "Data-Driven Intelligence & ML Specialist",
      isEarlyCareer,
      keySkills: skills.slice(0, 5),
    };
  }

  if (/product\s+manager|product\s+owner|roadmap|scrum|agile|user\s+stories|ux\s+research/i.test(allText)) {
    return {
      domainCategory: "Product Management & User Experience",
      archetype: "Strategic Product Owner & Delivery Lead",
      isEarlyCareer,
      keySkills: skills.slice(0, 5),
    };
  }

  if (/sales|revenue|account\s+exec|quota|business\s+development|pipeline|closing|b2b/i.test(allText)) {
    return {
      domainCategory: "Commercial Sales, Revenue & Enterprise Growth",
      archetype: "High-Velocity Commercial Growth & Client Leader",
      isEarlyCareer,
      keySkills: skills.slice(0, 5),
    };
  }

  if (/marketing|seo|content|social\s+media|campaign|brand|growth|conversion|demand\s+gen/i.test(allText)) {
    return {
      domainCategory: "Omnichannel Marketing & Growth Acquisition",
      archetype: "Growth Marketing & Brand Strategist",
      isEarlyCareer,
      keySkills: skills.slice(0, 5),
    };
  }

  if (/finance|accounting|audit|p&l|tax|financial\s+model|budget|valuation/i.test(allText)) {
    return {
      domainCategory: "Financial Strategy, Accounting & P&L Analysis",
      archetype: "Financial Planning & Risk Analysis Specialist",
      isEarlyCareer,
      keySkills: skills.slice(0, 5),
    };
  }

  if (/operations|supply\s+chain|logistics|procurement|vendor|lean|six\s+sigma/i.test(allText)) {
    return {
      domainCategory: "Operations, Supply Chain & Process Optimization",
      archetype: "Operational Streamlining & Process Leader",
      isEarlyCareer,
      keySkills: skills.slice(0, 5),
    };
  }

  if (/clinical|medical|doctor|hospital|patient|nursing|healthcare/i.test(allText)) {
    return {
      domainCategory: "Healthcare, Clinical Operations & Patient Care",
      archetype: "Clinical Practitioner & Healthcare Specialist",
      isEarlyCareer,
      keySkills: skills.slice(0, 5),
    };
  }

  return {
    domainCategory: "Professional Strategy & Execution",
    archetype: isEarlyCareer ? "Emerging Professional Contributor" : "Cross-Functional Strategic Leader",
    isEarlyCareer,
    keySkills: skills.slice(0, 5),
  };
}

/**
 * Helper to calculate qualitative evidence confidence (Spec §15)
 */
export function calculateDynamicEvidenceConfidence(factsList: CareerFact[]): EvidenceConfidence {
  const confirmedCount = factsList.filter((f) => f.status === "CONFIRMED" || f.status === "EDITED").length;
  const hasQuantified = factsList.some((f) => f.metrics && f.metrics.length > 0);

  if (factsList.length >= 3 || (factsList.length >= 2 && (confirmedCount >= 1 || hasQuantified))) {
    return "Strong evidence";
  }
  if (factsList.length >= 1 || confirmedCount >= 1) {
    return "Moderate evidence";
  }
  return "Limited evidence";
}

/**
 * Helper for 3-tier Capability Classification (Spec §5)
 */
export function deriveCapabilityClassification(
  reviewStatus: CareerInterpretationStatus | undefined,
  confidence: CareerInterpretationConfidence,
  evidenceList: EvidenceFactItem[]
): CapabilityClassification {
  if (reviewStatus === "ACCEPTED" || reviewStatus === "EDITED") {
    return "DEMONSTRATED";
  }
  if (confidence === "HIGH" && evidenceList.length >= 1) {
    return "DEMONSTRATED";
  }
  if (confidence === "MODERATE" && evidenceList.length >= 1) {
    return "EMERGING";
  }
  return "SUGGESTED";
}

/**
 * Check if any underlying facts for given evidence were modified/rejected (Spec §31 Stale state)
 */
export function checkStaleState(evidenceList: CareerEvidence[], reviewLogs: ReviewLogMap) {
  for (const ev of evidenceList) {
    if (!ev.facts) continue;
    for (const fact of ev.facts) {
      const log = reviewLogs.facts[fact.id];
      if (log && (log.status === "REJECTED" || log.status === "EDITED")) {
        return {
          isStale: true,
          reason: `Underlying fact "${fact.statement.slice(0, 45)}..." was recently ${log.status.toLowerCase()}. Recalculation recommended.`,
        };
      }
    }
  }
  return { isStale: false, reason: undefined };
}

/**
 * Dynamic, domain-agnostic semantic evidence clustering.
 * Takes active career facts and groups them into rich contextual clusters tailored to the candidate's actual work.
 */
export function buildDynamicEvidenceClusters(
  activeFacts: CareerFact[],
  domainInfo: CandidateDomainInfo
): Record<string, CareerEvidence> {
  const { domainCategory, isEarlyCareer, keySkills } = domainInfo;
  const primarySkill = keySkills[0] || "Execution";
  const secondSkill = keySkills[1] || "Solution Delivery";

  // 1. Technical / Domain Craft Facts
  const craftFacts = activeFacts.filter((f) =>
    f.category === "PROJECT" ||
    f.category === "TECHNOLOGY" ||
    f.category === "PUBLICATION" ||
    /develop|architect|engineer|implement|design|built|code|stack|system|analysis|research|create|author/i.test(f.statement)
  );

  // 2. Operational Delivery & Workflow Velocity Facts
  const deliveryFacts = activeFacts.filter((f) =>
    f.category === "RESPONSIBILITY" ||
    /deadline|agile|sprint|deliver|schedule|streamline|optimi|deploy|workflow|pipeline|bottleneck|cycle|speed|fast/i.test(f.statement)
  );

  // 3. Collaboration, Teamwork & Leadership Facts
  const collaborationFacts = activeFacts.filter((f) =>
    f.category === "TEAM" ||
    f.category === "VOLUNTEER" ||
    /team|collaborat|partner|mentor|guide|stakeholder|cross-functional|lead|coordinate|align|review/i.test(f.statement)
  );

  // 4. Commercial, Metric & Business Outcome Facts
  const impactFacts = activeFacts.filter((f) =>
    f.category === "METRIC" ||
    f.category === "BUSINESS_OUTCOME" ||
    f.category === "ACHIEVEMENT" ||
    f.category === "AWARD" ||
    /\d+%|\$|₹|\b\d+x\b|revenue|cost|margin|growth|user|adoption|satisfaction|retention|conversion|impact/i.test(f.statement)
  );

  // 5. Autonomy & High Ownership Facts
  const ownershipFacts = activeFacts.filter((f) =>
    /owner|spearhead|initi|independ|from scratch|solve|mission-critical|resolv|handle/i.test(f.statement)
  );

  const evidenceMap: Record<string, CareerEvidence> = {};

  // Cluster 1: Domain Craft
  const craftTitle = isEarlyCareer
    ? `${domainCategory} & Project Implementation`
    : `${domainCategory} Architecture & Technical Mastery`;
  evidenceMap["ev-domain-craft"] = {
    id: "ev-domain-craft",
    type: craftTitle,
    statement: craftFacts.length > 0
      ? `Demonstrated hands-on implementation across ${primarySkill} and ${secondSkill} project deliverables.`
      : `Core functional deliverables and technical execution in ${domainCategory}.`,
    factIds: craftFacts.map((f) => f.id),
    facts: craftFacts,
    confidence: calculateDynamicEvidenceConfidence(craftFacts),
    supports: [
      { dimension: "capabilities", label: craftTitle, interpretationId: "cap-domain-craft" },
      { dimension: "impact", label: "Reliable Functional Execution & High Quality Delivery", interpretationId: "imp-functional-quality" },
      { dimension: "progression", label: "Increasing Functional Depth & Architectural Autonomy" },
    ],
    factCount: craftFacts.length,
  };

  // Cluster 2: Operational Delivery
  evidenceMap["ev-operational-delivery"] = {
    id: "ev-operational-delivery",
    type: "Delivery Ownership & Execution Velocity",
    statement: `Consistent track record of adhering to sprint goals, resolving bottlenecks, and meeting tight delivery milestones.`,
    factIds: deliveryFacts.map((f) => f.id),
    facts: deliveryFacts,
    confidence: calculateDynamicEvidenceConfidence(deliveryFacts),
    supports: [
      { dimension: "capabilities", label: "Execution Velocity & Workflow Ownership", interpretationId: "cap-execution-velocity" },
      { dimension: "impact", label: "Milestone Delivery on Tight Deadlines", interpretationId: "imp-velocity-deadlines" },
      { dimension: "progression", label: "Operational Velocity & Project Delivery Discipline" },
    ],
    factCount: deliveryFacts.length,
  };

  // Cluster 3: Collaboration & Leadership
  const collabTitle = isEarlyCareer
    ? "Cross-Functional Collaboration & Code Contribution"
    : "Team Leadership, Mentorship & Stakeholder Alignment";
  evidenceMap["ev-collaboration"] = {
    id: "ev-collaboration",
    type: collabTitle,
    statement: collaborationFacts.length > 0
      ? `Effective partnership with peers and cross-functional teams to align project deliverables and incorporate feedback.`
      : `Collaborative execution and structured stakeholder communication across milestones.`,
    factIds: collaborationFacts.map((f) => f.id),
    facts: collaborationFacts,
    confidence: calculateDynamicEvidenceConfidence(collaborationFacts),
    supports: [
      { dimension: "capabilities", label: collabTitle, interpretationId: "cap-collaboration" },
      { dimension: "impact", label: "Cross-Functional Synchronization & Alignment", interpretationId: "imp-collaboration-alignment" },
      { dimension: "progression", label: "Expanding Collaborative Scope & Team Influence" },
    ],
    factCount: collaborationFacts.length,
  };

  // Cluster 4: Measurable Business & User Impact
  evidenceMap["ev-business-impact"] = {
    id: "ev-business-impact",
    type: "Quantified Value & User Impact",
    statement: impactFacts.length > 0
      ? `Delivering features and fixes that improve customer experience, user adoption, and operational reliability.`
      : `Translating project deliverables into tangible user and organizational benefits.`,
    factIds: impactFacts.map((f) => f.id),
    facts: impactFacts,
    confidence: calculateDynamicEvidenceConfidence(impactFacts),
    supports: [
      { dimension: "capabilities", label: "Impact Optimization & Business Outcome Awareness", interpretationId: "cap-business-impact" },
      { dimension: "impact", label: "Measurable System & User Growth", interpretationId: "imp-business-growth" },
      { dimension: "progression", label: "Value-Driven Focus & Outcome Accountability" },
    ],
    factCount: impactFacts.length,
  };

  // Cluster 5: Autonomy & Ownership
  evidenceMap["ev-autonomy"] = {
    id: "ev-autonomy",
    type: "Problem Solving & Initiative Autonomy",
    statement: `Proactive identification of issues, self-managed task ownership, and accountable technical resolution.`,
    factIds: ownershipFacts.map((f) => f.id),
    facts: ownershipFacts,
    confidence: calculateDynamicEvidenceConfidence(ownershipFacts),
    supports: [
      { dimension: "capabilities", label: "Autonomous Problem Solving & Initiative Ownership", interpretationId: "cap-autonomy-ownership" },
      { dimension: "impact", label: "Friction Reduction & Independent Issue Resolution", interpretationId: "imp-independent-resolution" },
      { dimension: "progression", label: "Increasing Autonomy & Strategic Trust" },
    ],
    factCount: ownershipFacts.length,
  };

  return evidenceMap;
}

/**
 * Stage 4 Dynamic Interpretation Generator.
 * Derives domain-agnostic capabilities, impact patterns, discovery prompts, and value narratives.
 */
export function deriveDynamicInterpretations(
  facts: CareerFact[],
  resume: Resume | null,
  journalEntries: any[],
  reviewLogs: ReviewLogMap
): {
  capabilities: CareerInterpretation[];
  impact: CareerInterpretation[];
  valuePatterns: CareerInterpretation[];
  evidenceMap: Record<string, CareerEvidence>;
} {
  const activeFacts = facts.filter((f) => f.status !== "REJECTED");
  const domainInfo = detectCandidateDomain(resume, activeFacts);
  const evidenceMap = buildDynamicEvidenceClusters(activeFacts, domainInfo);

  // Helper to format supporting evidence for an interpretation
  const getSupportingEvidence = (evIds: string[]): EvidenceFactItem[] => {
    return evIds
      .map((evId) => evidenceMap[evId])
      .filter(Boolean)
      .map((ev) => ({
        evidenceId: ev.id,
        statement: ev.statement,
        facts: ev.facts ? ev.facts.filter((f) => f.status !== "REJECTED").slice(0, 4) : [],
        confidence: ev.confidence,
        supports: ev.supports,
      }))
      .filter((ev) => ev.facts.length > 0);
  };

  const makeInterpretation = (
    id: string,
    type: CareerInterpretationType,
    dimension: "capabilities" | "impact" | "experience" | "progression",
    defaultTitle: string,
    defaultDesc: string,
    discoveryPrompt: string,
    evidenceIds: string[],
    domainCategory?: string
  ): CareerInterpretation => {
    const review = reviewLogs.interpretations[id];
    const evidence = getSupportingEvidence(evidenceIds);
    const evItems = evidenceIds.map((eid) => evidenceMap[eid]).filter(Boolean);

    // Calculate effective confidence
    let confidence: CareerInterpretationConfidence = "DEVELOPING";
    const totalSupportingFacts = evidence.reduce((sum, e) => sum + e.facts.length, 0);
    const hasQuantified = evidence.some((e) => e.facts.some((f) => f.metrics && f.metrics.length > 0));

    if (totalSupportingFacts >= 3 || (totalSupportingFacts >= 2 && hasQuantified)) {
      confidence = "HIGH";
    } else if (totalSupportingFacts >= 1) {
      confidence = "MODERATE";
    }

    const classification = deriveCapabilityClassification(review?.status, confidence, evidence);
    const staleInfo = checkStaleState(evItems, reviewLogs);

    return {
      id,
      type,
      dimension,
      domainCategory: domainCategory || domainInfo.domainCategory,
      title: review?.editedTitle || defaultTitle,
      description: review?.editedDesc || defaultDesc,
      status: review?.status || "SUGGESTED",
      confidence,
      classification,
      evidenceIds,
      supportingEvidence: evidence,
      discoveryPrompt,
      evidenceSummarySnippet: `${totalSupportingFacts} supporting career statements verified across ${evidence.length} evidence clusters.`,
      isStale: staleInfo.isStale,
      staleReason: staleInfo.reason,
      needsRecalculation: staleInfo.isStale,
    };
  };

  const { domainCategory, isEarlyCareer, keySkills } = domainInfo;
  const pSkill = keySkills[0] || "Core Technical Stack";
  const sSkill = keySkills[1] || "Modern Tooling";

  // 1. Dynamic Capabilities (Domain Agnostic)
  const capabilities: CareerInterpretation[] = [
    makeInterpretation(
      "cap-domain-craft",
      "CAPABILITY",
      "capabilities",
      isEarlyCareer
        ? `${domainCategory} & Modern Implementation`
        : `${domainCategory} & Scalable Architecture`,
      `Demonstrated capability to design, implement, and deliver functional solutions using ${pSkill} and ${sSkill}. Backed by hands-on project deliverables and verified codebase contributions.`,
      `We see you built key modules using ${pSkill}. Were you also responsible for database architecture or third-party service integration?`,
      ["ev-domain-craft"]
    ),
    makeInterpretation(
      "cap-execution-velocity",
      "CAPABILITY",
      "capabilities",
      "Execution Velocity & Milestone Delivery",
      `Consistently adheres to engineering roadmaps, delivers high-priority features on schedule, and unblocks technical bottlenecks within sprint commitments.`,
      `What was the most challenging deadline you successfully met, and what specific technical strategy enabled on-time delivery?`,
      ["ev-operational-delivery"]
    ),
    makeInterpretation(
      "cap-collaboration",
      "CAPABILITY",
      "capabilities",
      isEarlyCareer
        ? "Cross-Functional Collaboration & Code Quality"
        : "Cross-Functional Alignment & Technical Mentorship",
      `Effectively partners across engineering squads, participates in structured design walkthroughs and code reviews, and translates requirements into clean, maintainable deliverables.`,
      `Did your collaborative work involve direct client interaction or cross-departmental coordination?`,
      ["ev-collaboration"]
    ),
    makeInterpretation(
      "cap-business-impact",
      "CAPABILITY",
      "capabilities",
      "Value-Driven Engineering & User Impact",
      `Focuses development efforts on measurable outcomes, improving application responsiveness, user satisfaction, and deployment reliability.`,
      `Did your project feature deliveries lead to measurable improvements in user retention, page load speed, or conversion?`,
      ["ev-business-impact"]
    ),
    makeInterpretation(
      "cap-autonomy-ownership",
      "CAPABILITY",
      "capabilities",
      "Autonomous Problem Solving & Deliverable Ownership",
      `Demonstrates high self-direction, breaking down ambiguous requirements into actionable tasks and driving features from initial setup to production deployment.`,
      `Were there initiatives where you independently spearheaded the technology choice or architectural blueprint?`,
      ["ev-autonomy"]
    ),
  ].filter((c) => reviewLogs.interpretations[c.id]?.status !== "REJECTED");

  // 2. Dynamic Impact Patterns (Domain Agnostic)
  const impact: CareerInterpretation[] = [
    makeInterpretation(
      "imp-velocity-deadlines",
      "IMPACT",
      "impact",
      "On-Time Release Velocity & Execution Discipline",
      `Consistently deployed mission-critical features within tight project timelines, maintaining delivery momentum without compromising software hygiene.`,
      `How much time or operational overhead was saved through your streamlined delivery workflow?`,
      ["ev-operational-delivery"]
    ),
    makeInterpretation(
      "imp-functional-quality",
      "IMPACT",
      "impact",
      "User Experience & High-Reliability Deliverables",
      `Engineered accessible, responsive interfaces and robust backend logic, delivering seamless end-user interactions across devices and platforms.`,
      `Did user feedback or performance benchmarks reflect noticeable stability improvements post-deployment?`,
      ["ev-domain-craft"]
    ),
    makeInterpretation(
      "imp-independent-resolution",
      "IMPACT",
      "impact",
      "Friction Reduction & Independent Ownership",
      `Proactively resolved operational challenges, eliminated manual errors, and took full accountability for end-to-end deliverables.`,
      `What was the primary business friction point eliminated through your independent solution?`,
      ["ev-autonomy"]
    ),
    makeInterpretation(
      "imp-business-growth",
      "IMPACT",
      "impact",
      "Scalable System Adoption & Business Value",
      `Created robust tools and platforms that scaled user engagement and supported organizational objectives.`,
      `Can you quantify the active users or organizational adoption scale influenced by this work?`,
      ["ev-business-impact"]
    ),
  ].filter((i) => reviewLogs.interpretations[i.id]?.status !== "REJECTED");

  // 3. Dynamic Value Pattern (Overall Career Archetype)
  const patternId = "pattern-primary-synthesis";
  const patternReview = reviewLogs.interpretations[patternId];
  const valuePatterns: CareerInterpretation[] = [
    {
      id: patternId,
      type: "VALUE_PATTERN" as const,
      dimension: "capabilities" as const,
      domainCategory: domainInfo.domainCategory,
      title:
        patternReview?.editedTitle ||
        `${domainInfo.archetype}`,
      description:
        patternReview?.editedDesc ||
        `Across your documented experiences, you have consistently demonstrated strong ownership, moving from core implementation to delivering reliable outcomes on tight milestones.`,
      status: (patternReview?.status || "SUGGESTED") as CareerInterpretationStatus,
      confidence: "HIGH" as const,
      classification: "DEMONSTRATED" as CapabilityClassification,
      evidenceIds: ["ev-domain-craft", "ev-operational-delivery", "ev-autonomy"],
      supportingEvidence: getSupportingEvidence(["ev-domain-craft", "ev-operational-delivery"]),
      discoveryPrompt: `What is the most significant career achievement you would like highlighted in your professional narrative?`,
    },
  ].filter((p) => reviewLogs.interpretations[p.id]?.status !== "REJECTED");

  return {
    capabilities,
    impact,
    valuePatterns,
    evidenceMap,
  };
}
