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
  status: CareerFactStatus;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  extractedAt?: string;
  confirmedAt?: string;
  editedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

export interface CareerEvidence {
  id: string;
  statement: string;
  type: string; // e.g. "Team Leadership at Scale", "Operational Efficiency"
  factIds: string[];
  facts?: CareerFact[];
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

export type CareerInterpretationConfidence = "HIGH" | "MODERATE" | "DEVELOPING";

export interface EvidenceFactItem {
  evidenceId: string;
  statement: string;
  facts: CareerFact[];
}

export interface CareerInterpretation {
  id: string;
  type: CareerInterpretationType;
  title: string;
  description: string;
  status: CareerInterpretationStatus;
  confidence: CareerInterpretationConfidence;
  evidenceIds: string[];
  supportingEvidence?: EvidenceFactItem[];
  userNote?: string;
  sourceBadge?: string;
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
}

export type ValueNavigationTab =
  | "overview"
  | "capabilities"
  | "impact"
  | "experience"
  | "progression"
  | "facts";
