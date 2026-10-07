export type CareerFactCategory =
  | "ROLE"
  | "RESPONSIBILITY"
  | "TEAM"
  | "ACHIEVEMENT"
  | "PROJECT"
  | "METRIC"
  | "PROMOTION"
  | "RECOGNITION"
  | "EDUCATION"
  | "CERTIFICATION"
  | "DOMAIN"
  | "TECHNOLOGY"
  | "BUSINESS_OUTCOME";

export type CareerFactStatus = "EXTRACTED" | "CONFIRMED" | "EDITED" | "REJECTED";

export type CareerFactSourceType =
  | "Resume"
  | "Career Event"
  | "User Entry"
  | "Document"
  | "AI Discovery";

export interface FactContribution {
  interpretationId: string;
  interpretationTitle: string;
  dimension: "capabilities" | "impact" | "experience" | "progression";
  evidenceId: string;
  evidenceTitle: string;
}

export interface CareerFact {
  id: string;
  category: CareerFactCategory;
  statement: string;
  originalStatement?: string;
  sourceType: CareerFactSourceType;
  sourceId?: string; // resume id or career event id
  sourceTitle: string; // e.g. "Software Engineer @ Acme Corp" or "Resume.pdf"
  sourceDate?: string; // e.g. "2023 - Present"
  careerEventId?: string;
  extractedFromContext?: string; // e.g. "Experience — ABC Technologies, Engineering Director"
  status: CareerFactStatus;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  extractedAt?: string;
  confirmedAt?: string;
  editedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  updatedAt?: string;
  contributesTo?: FactContribution[];
}

export type EvidenceConfidence =
  | "Strong evidence"
  | "Moderate evidence"
  | "Limited evidence";

export interface DimensionSupport {
  dimension: "capabilities" | "impact" | "experience" | "progression";
  label: string; // e.g., "Leadership", "Delivery ownership", "Increasing responsibility"
  interpretationId?: string;
}

export interface CareerEvidence {
  id: string;
  statement: string;
  type: string; // e.g. "Team Leadership at Scale", "Operational Efficiency"
  factIds: string[];
  facts?: CareerFact[];
  confidence?: EvidenceConfidence;
  supports?: DimensionSupport[];
  factCount?: number;
}

export type CareerInterpretationType =
  | "CAPABILITY"
  | "IMPACT"
  | "EXPERIENCE"
  | "PROGRESSION"
  | "VALUE_PATTERN";

export type CareerInterpretationStatus =
  | "ACCEPTED"
  | "EDITED"
  | "REJECTED"
  | "SUGGESTED";

export type CapabilityClassification = "DEMONSTRATED" | "EMERGING" | "SUGGESTED";

export type CareerInterpretationConfidence = "HIGH" | "MODERATE" | "DEVELOPING";

export interface EvidenceFactItem {
  evidenceId: string;
  statement: string;
  facts: CareerFact[];
  confidence?: EvidenceConfidence;
  supports?: DimensionSupport[];
}

export interface CareerInterpretation {
  id: string;
  type: CareerInterpretationType;
  title: string;
  description: string;
  status: CareerInterpretationStatus;
  confidence: CareerInterpretationConfidence;
  classification?: CapabilityClassification; // Spec §5: Demonstrated (●) | Emerging (◐) | Suggested (○)
  evidenceIds: string[];
  supportingEvidence?: EvidenceFactItem[];
  userNote?: string;
  sourceBadge?: string;
  dimension?: "capabilities" | "impact" | "experience" | "progression";
  isStale?: boolean; // Spec §31: Marked stale when underlying facts are modified/rejected
  staleReason?: string;
  needsRecalculation?: boolean;
}

export interface ExperienceDimension {
  totalYears: number;
  rolesCount: number;
  industries: string[];
  topDomains: string[];
  organizations: string[];
  narrative: string;
}

export interface ProgressionSignalItem {
  id: string;
  title: string;
  description: string;
  direction: "up" | "lateral" | "expanded";
  evidence: string;
  source: string;
}

export interface StrengtheningArea {
  dimension: string;
  level: "Strong evidence" | "Moderate evidence" | "Limited evidence currently available";
  explanation: string;
  suggestedAction: string;
  actionLink: string;
}

export interface EvidenceSummary {
  confirmedFacts: number;
  evidenceItems: number;
  careerEvents: number;
  totalFacts: number;
}

export interface RecalculationDiff {
  itemTitle: string;
  dimension: string;
  previousStatus: string;
  newStatus: string;
  reason: string;
}

export interface SourceDetail {
  id: string;
  name: string;
  type: CareerFactSourceType;
  uploadedAt?: string;
  summary: {
    totalFacts: number;
    confirmedFacts: number;
    editedFacts: number;
    rejectedFacts: number;
  };
  categories: {
    category: CareerFactCategory;
    label: string;
    count: number;
    facts: CareerFact[];
  }[];
}

export interface CareerValueResponse {
  profile: {
    capabilities: CareerInterpretation[];
    impact: CareerInterpretation[];
    experience: ExperienceDimension;
    progression: {
      signals: ProgressionSignalItem[];
      evolutionSummary: string;
    };
  };
  valuePatterns: CareerInterpretation[];
  evidenceSummary: EvidenceSummary;
  strengtheningAreas: StrengtheningArea[];
  activeResumeId?: string;
  message?: string;
  recalculationDiffs?: RecalculationDiff[];
}

export type ValueNavigationTab =
  | "overview"
  | "capabilities"
  | "impact"
  | "experience"
  | "progression"
  | "facts";
