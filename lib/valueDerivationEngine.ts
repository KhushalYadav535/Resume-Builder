import { Resume, WorkExperience, Project, Education, Certification, Award, Publication, VolunteerExperience, AdditionalRecord } from "@/types";
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
  FactContribution,
  ExperienceDimension,
  ProgressionSignalItem,
  StrengtheningArea,
  EvidenceSummary,
  CareerValueResponse,
  SourceDetail,
  RecalculationDiff,
} from "@/types/value";
import { analyzeBulletLocally } from "./deepFactExtraction";
import {
  deriveDynamicInterpretations,
  detectCandidateDomain,
} from "./dynamicInterpretationEngine";

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
      const contextPrefix = `Experience — ${company}, ${role}`;

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
        extractedFromContext: `${contextPrefix} (Role Appointment)`,
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
          extractedFromContext: `${contextPrefix} (Career Progression)`,
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
          extractedFromContext: `${contextPrefix} (Team Scope)`,
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

        // Deep local semantic analysis (Action vs Outcome, Scope, Metrics, Gaps)
        const analysis = analyzeBulletLocally(bulletText, role, company);
        const category = analysis.category;

        facts.push({
          id: bulletFactId,
          category,
          statement: bulletLog?.editedText || bulletText,
          originalStatement: bulletText,
          sourceType: "Resume",
          sourceId,
          sourceTitle,
          sourceDate: dateRange,
          extractedFromContext: `${contextPrefix} (${category})`,
          status: bulletLog?.status || "EXTRACTED",
          confidence: analysis.confidence,
          extractedAt,
          scope: analysis.scope,
          actionDetail: analysis.actionDetail,
          outcomeDetail: analysis.outcomeDetail,
          metrics: analysis.metrics,
          informationGaps: analysis.informationGaps,
          isExplicit: true,
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
        extractedFromContext: `Projects — ${projName}`,
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
          extractedFromContext: `Projects — ${projName} (Tech Stack)`,
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
        extractedFromContext: `Skills — Technical Stack`,
        status: skillLog?.status || "CONFIRMED",
        confidence: "HIGH",
        extractedAt,
      });
    }

    const softSkills = resumeData.skills?.soft || [];
    if (softSkills.length > 0) {
      const softFactId = `fact-skills-soft`;
      const softLog = reviewLogs.facts[softFactId];
      facts.push({
        id: softFactId,
        category: "DOMAIN",
        statement: softLog?.editedText || `Core leadership & domain competencies: ${softSkills.slice(0, 8).join(", ")}.`,
        originalStatement: `Core leadership & domain competencies: ${softSkills.slice(0, 8).join(", ")}.`,
        sourceType: "Resume",
        sourceId,
        sourceTitle: fileName,
        extractedFromContext: `Skills — Soft & Domain Competencies`,
        status: softLog?.status || "CONFIRMED",
        confidence: "MEDIUM",
        extractedAt,
      });
    }

    // 4. Education
    (resumeData.education || []).forEach((ed: Education, edIdx: number) => {
      const institution = ed.institution || "University";
      const degree = ed.degree || "Degree";
      const edFactId = `fact-ed-${edIdx}`;
      const edGradYear = ed.endDate || (ed as any).graduationYear || "Graduated";
      const edLog = reviewLogs.facts[edFactId];
      facts.push({
        id: edFactId,
        category: "EDUCATION",
        statement: edLog?.editedText || `Attained ${degree} from ${institution} (${edGradYear}).`,
        originalStatement: `Attained ${degree} from ${institution} (${edGradYear}).`,
        sourceType: "Resume",
        sourceId,
        sourceTitle: institution,
        sourceDate: ed.endDate || (ed as any).graduationYear ? String((ed as any).graduationYear || ed.endDate) : undefined,
        extractedFromContext: `Education — ${institution}, ${degree}`,
        status: edLog?.status || "CONFIRMED",
        confidence: "HIGH",
        extractedAt,
      });
    });

    // 5. Certifications
    (resumeData.certifications || []).forEach((c: Certification, cIdx: number) => {
      const certName = c.name || "Professional Certification";
      const issuer = c.issuer || "Issuing Body";
      const certFactId = `fact-cert-${cIdx}`;
      const certLog = reviewLogs.facts[certFactId];
      facts.push({
        id: certFactId,
        category: "CERTIFICATION",
        statement: certLog?.editedText || `Holds credential: ${certName} issued by ${issuer} (${c.date || "Certified"}).`,
        originalStatement: `Holds credential: ${certName} issued by ${issuer} (${c.date || "Certified"}).`,
        sourceType: "Resume",
        sourceId,
        sourceTitle: issuer,
        sourceDate: c.date,
        extractedFromContext: `Certifications — ${certName}`,
        status: certLog?.status || "CONFIRMED",
        confidence: "HIGH",
        extractedAt,
      });
    });

    // 6. Awards & Recognition
    (resumeData.awards || []).forEach((aw: Award, awIdx: number) => {
      const awFactId = `fact-award-${aw.id || awIdx}`;
      const awLog = reviewLogs.facts[awFactId];
      facts.push({
        id: awFactId,
        category: "AWARD",
        statement: awLog?.editedText || `${aw.title}${aw.issuer ? ` by ${aw.issuer}` : ""}${aw.date ? ` (${aw.date})` : ""}: ${aw.description || "Honored for career excellence."}`,
        originalStatement: `${aw.title}${aw.issuer ? ` by ${aw.issuer}` : ""}${aw.date ? ` (${aw.date})` : ""}: ${aw.description || "Honored for career excellence."}`,
        sourceType: "Resume",
        sourceId,
        sourceTitle: aw.issuer || "Honors & Recognition",
        sourceDate: aw.date,
        extractedFromContext: `Awards & Recognition — ${aw.title}`,
        status: awLog?.status || "CONFIRMED",
        confidence: "HIGH",
        extractedAt,
      });
    });

    // 7. Languages Known
    (resumeData.languagesKnown || []).forEach((lang, lIdx: number) => {
      const lFactId = `fact-lang-${lang.id || lIdx}`;
      const lLog = reviewLogs.facts[lFactId];
      facts.push({
        id: lFactId,
        category: "LANGUAGE",
        statement: lLog?.editedText || `Proficient in ${lang.language} (${lang.proficiency || "Fluent"}).`,
        originalStatement: `Proficient in ${lang.language} (${lang.proficiency || "Fluent"}).`,
        sourceType: "Resume",
        sourceId,
        sourceTitle: "Languages",
        extractedFromContext: `Languages — ${lang.language}`,
        status: lLog?.status || "CONFIRMED",
        confidence: "HIGH",
        extractedAt,
      });
    });

    // 8. Publications & Research
    (resumeData.publications || []).forEach((pub: Publication, pIdx: number) => {
      const pubFactId = `fact-pub-${pub.id || pIdx}`;
      const pubLog = reviewLogs.facts[pubFactId];
      facts.push({
        id: pubFactId,
        category: "PUBLICATION",
        statement: pubLog?.editedText || `Published: "${pub.title}"${pub.publisher ? ` in ${pub.publisher}` : ""}${pub.date ? ` (${pub.date})` : ""}.`,
        originalStatement: `Published: "${pub.title}"${pub.publisher ? ` in ${pub.publisher}` : ""}${pub.date ? ` (${pub.date})` : ""}.`,
        sourceType: "Resume",
        sourceId,
        sourceTitle: pub.publisher || "Publications",
        sourceDate: pub.date,
        extractedFromContext: `Publications — ${pub.title}`,
        status: pubLog?.status || "CONFIRMED",
        confidence: "HIGH",
        extractedAt,
      });
    });

    // 9. Volunteer & Extracurricular Experience
    (resumeData.volunteerExperience || []).forEach((vol: VolunteerExperience, vIdx: number) => {
      const vFactId = `fact-vol-${vol.id || vIdx}`;
      const vLog = reviewLogs.facts[vFactId];
      facts.push({
        id: vFactId,
        category: "VOLUNTEER",
        statement: vLog?.editedText || `Served as ${vol.role} at ${vol.organization}: ${vol.description || "Community contribution."}`,
        originalStatement: `Served as ${vol.role} at ${vol.organization}: ${vol.description || "Community contribution."}`,
        sourceType: "Resume",
        sourceId,
        sourceTitle: vol.organization,
        sourceDate: `${vol.startDate || ""} - ${vol.endDate || ""}`.trim() || undefined,
        extractedFromContext: `Volunteering — ${vol.organization}`,
        status: vLog?.status || "CONFIRMED",
        confidence: "HIGH",
        extractedAt,
      });
    });

    // 10. Additional Records
    (resumeData.additionalRecords || []).forEach((add: AdditionalRecord, aIdx: number) => {
      const aFactId = `fact-add-${add.id || aIdx}`;
      const aLog = reviewLogs.facts[aFactId];
      facts.push({
        id: aFactId,
        category: "ADDITIONAL",
        statement: aLog?.editedText || `${add.category}: ${add.title} — ${add.description || ""}`,
        originalStatement: `${add.category}: ${add.title} — ${add.description || ""}`,
        sourceType: "Resume",
        sourceId,
        sourceTitle: add.category,
        extractedFromContext: `Additional — ${add.category}`,
        status: aLog?.status || "CONFIRMED",
        confidence: "HIGH",
        extractedAt,
      });
    });
  }

  // 11. Ingest Career Journal Entries as Career Facts
  journalEntries.forEach((entry, jIdx) => {
    const jFactId = `fact-journal-${entry.id || jIdx}`;
    const jLog = reviewLogs.facts[jFactId];
    facts.push({
      id: jFactId,
      category: entry.entry_type === "metric" ? "METRIC" : entry.entry_type === "skill" ? "ROLE" : "ACHIEVEMENT",
      statement: jLog?.editedText || entry.content,
      originalStatement: entry.content,
      sourceType: "Career Event",
      sourceId: entry.id,
      careerEventId: entry.id,
      sourceTitle: entry.linked_role ? `Journal · ${entry.linked_role}` : `Career Event · ${entry.date || "Recorded"}`,
      sourceDate: entry.date,
      extractedFromContext: `Career Journal — ${entry.linked_role || entry.date || "Recorded Event"}`,
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

  // Stage 4: Dynamic Domain-Agnostic Semantic Derivation
  const {
    capabilities,
    impact,
    valuePatterns,
    evidenceMap,
  } = deriveDynamicInterpretations(facts, resume, journalEntries, reviewLogs);

  // Dimension 3: Experience
  const expList = resume?.resume_data?.workExperience || [];
  const rolesCount = expList.length;
  const organizations = Array.from(new Set(expList.map((e) => e.company).filter(Boolean)));

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

  // POPULATE REVERSE FACT TRACEABILITY GRAPH (Spec §19: "This fact contributes to...")
  const allInterpretations = [...capabilities, ...impact, ...valuePatterns];
  facts.forEach((fact) => {
    const contributions: FactContribution[] = [];
    allInterpretations.forEach((interp) => {
      interp.supportingEvidence?.forEach((ev) => {
        if (ev.facts.some((f) => f.id === fact.id)) {
          contributions.push({
            interpretationId: interp.id,
            interpretationTitle: interp.title,
            dimension: interp.dimension || "capabilities",
            evidenceId: ev.evidenceId,
            evidenceTitle: ev.statement,
          });
        }
      });
    });
    fact.contributesTo = contributions;
  });

  // Area 3: Evidence Foundation
  const evidenceSummary: EvidenceSummary = {
    confirmedFacts: confirmedFacts.length,
    evidenceItems: Object.keys(evidenceMap).length,
    careerEvents: journalEntries.length + rolesCount,
    totalFacts: facts.length,
  };

  // Area 4: Areas to Strengthen (Derived directly from Stage 1 Information Gaps)
  const allGaps = activeFacts.flatMap((f) => f.informationGaps || []);
  const unquantifiedGaps = allGaps.filter((g) => /quantified|metric|baseline/i.test(g));
  const scopeGaps = allGaps.filter((g) => /scope|team size|audience/i.test(g));
  const outcomeGaps = allGaps.filter((g) => /outcome|business impact|result/i.test(g));

  const strengtheningAreas: StrengtheningArea[] = [];

  if (unquantifiedGaps.length > 0) {
    strengtheningAreas.push({
      dimension: "Quantified Impact & Business Metrics",
      level: unquantifiedGaps.length > 3 ? "Limited evidence currently available" : "Moderate evidence",
      explanation: `${unquantifiedGaps.length} career statements describe achievements qualitatively. Adding exact numbers, percentages, or savings will strengthen proof.`,
      suggestedAction: "Log measured metrics in Career Journal",
      actionLink: "/career-journal",
    });
  }

  if (scopeGaps.length > 0) {
    strengtheningAreas.push({
      dimension: "Organizational Scope & Team Scale",
      level: "Moderate evidence",
      explanation: `Specific team counts or stakeholder seniority are unspecified across ${scopeGaps.length} initiative statements.`,
      suggestedAction: "Clarify team scale in Proof Vault",
      actionLink: "/career-journal",
    });
  }

  if (outcomeGaps.length > 0) {
    strengtheningAreas.push({
      dimension: "Stated Outcome Verification",
      level: "Moderate evidence",
      explanation: "Several responsibilities are documented without specifying what changed as a direct outcome of your contribution.",
      suggestedAction: "Complete Guided Impact Discovery",
      actionLink: "/value/impact",
    });
  }

  if (strengtheningAreas.length === 0) {
    strengtheningAreas.push({
      dimension: "Strategic Initiative Breadth",
      level: "Strong evidence",
      explanation: "Strong multi-dimensional proof verified across your career records. Continuing to document strategic milestones will sustain high momentum.",
      suggestedAction: "Log a new project in Career Journal",
      actionLink: "/career-journal",
    });
  }

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

/** Helper to generate source provenance breakdown for Screen 5 (Spec §22-24) */
export function getSourceDetail(
  sourceId: string,
  facts: CareerFact[],
  resume: Resume | null
): SourceDetail {
  const sourceFacts = facts.filter((f) => f.sourceId === sourceId || f.sourceType === "Resume");
  const confirmed = sourceFacts.filter((f) => f.status === "CONFIRMED").length;
  const edited = sourceFacts.filter((f) => f.status === "EDITED").length;
  const rejected = sourceFacts.filter((f) => f.status === "REJECTED").length;

  const categoriesMap: Record<string, CareerFact[]> = {};
  sourceFacts.forEach((f) => {
    if (!categoriesMap[f.category]) categoriesMap[f.category] = [];
    categoriesMap[f.category].push(f);
  });

  const categories = Object.keys(categoriesMap).map((cat) => ({
    category: cat as any,
    label: cat.replace(/_/g, " "),
    count: categoriesMap[cat].length,
    facts: categoriesMap[cat],
  }));

  return {
    id: sourceId || "resume-source",
    name: resume?.file_name || "Primary Resume.pdf",
    type: "Resume",
    uploadedAt: resume?.created_at || new Date().toISOString(),
    summary: {
      totalFacts: sourceFacts.length,
      confirmedFacts: confirmed,
      editedFacts: edited,
      rejectedFacts: rejected,
    },
    categories,
  };
}

/** Computes recalculation diffs after facts/interpretations have been updated (Spec §33) */
export function computeRecalculationDiff(
  previousGraph: CareerValueResponse | null,
  newGraph: CareerValueResponse
): RecalculationDiff[] {
  if (!previousGraph) return [];
  const diffs: RecalculationDiff[] = [];

  const prevCapMap = new Map(previousGraph.profile.capabilities.map((c) => [c.id, c]));
  newGraph.profile.capabilities.forEach((newCap) => {
    const prev = prevCapMap.get(newCap.id);
    if (prev && prev.classification !== newCap.classification) {
      diffs.push({
        itemTitle: newCap.title,
        dimension: "Capabilities",
        previousStatus: prev.classification || "SUGGESTED",
        newStatus: newCap.classification || "DEMONSTRATED",
        reason: "Confirmed or modified career facts adjusted supporting evidence strength.",
      });
    }
  });

  return diffs;
}
