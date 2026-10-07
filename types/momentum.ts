/**
 * UpRole — Momentum Dashboard Types
 * Conforming to Development Specification — MVP (d:/resume/Uprole-Momentum-Dashboard-Specs.txt)
 */

export type DirectionStatus = "Active" | "Exploring" | "Paused" | "Achieved" | "Archived";

export interface CareerDirection {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  currentPath?: string;
  targetPath?: string;
  fullTrajectory?: string[]; // e.g. ["Engineering", "Product", "Product Leadership"]
  status: DirectionStatus;
  source: string;
  createdAt: string;
  updatedAt: string;
}

export type GoalType =
  | "Job Change"
  | "Promotion"
  | "Role Change"
  | "Salary Increase"
  | "Designation Change"
  | "Leadership Transition"
  | "Industry Change"
  | "Location Change"
  | "Career Return"
  | "Independent / Consulting"
  | "Skill / Capability Development"
  | "Other";

export type GoalStatus =
  | "Draft"
  | "Exploring"
  | "Active"
  | "In Progress"
  | "Paused"
  | "Achieved"
  | "Abandoned"
  | "Archived";

export type GoalStage = "direction" | "target" | "strategy" | "outcome";

export type ProgressSource =
  | "Career Event"
  | "Capability development"
  | "Evidence captured"
  | "Opportunity discovered"
  | "Application"
  | "Interview"
  | "Networking"
  | "Learning"
  | "Recognition"
  | "Promotion"
  | "Compensation change"
  | "New responsibility"
  | "Career Outcome";

export interface GoalMilestone {
  id: string;
  title: string;
  completed: boolean;
  stage?: GoalStage;
  completedAt?: string;
  sourceType?: ProgressSource;
  evidenceSnippet?: string;
}

export interface CareerGoal {
  id: string;
  userId?: string;
  title: string;
  targetRole: string;
  currentRole: string;
  targetHorizon: string; // e.g. "6–12 months"
  goalType: GoalType;
  status: GoalStatus;
  isPrimary: boolean;
  stage: GoalStage; // Direction -> Target -> Strategy -> Outcome
  objective?: string; // Spec Section 19: Career Objective
  strategyOverview?: string; // Spec Section 19: Career Strategy
  milestones: GoalMilestone[];
  reasonSummary?: string;
  supportingEvidenceCount?: number;
  supportingEvidence?: {
    id: string;
    title: string;
    category: string;
    snippet: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface CareerPriority {
  id: string;
  userId?: string;
  type: string;
  label: string;
  importance: "high" | "medium" | "low";
  preference?: string;
  source: string;
  selected: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface WhyThisGoal {
  summary: string;
  experienceFactors: string[];
  priorityAlignment: string[];
  supportingEvidence: {
    id: string;
    title: string;
    category: string;
    snippet: string;
  }[];
}

export interface SuggestedDirection {
  id: string;
  title: string;
  trajectory: string;
  rationale: string;
}

export interface MomentumDashboardData {
  direction: CareerDirection | null;
  activeGoal: CareerGoal | null;
  whyThisGoal: WhyThisGoal;
  priorities: CareerPriority[];
  progress: {
    completedMilestones: number;
    totalMilestones: number;
    milestones: GoalMilestone[];
  };
  otherGoals: CareerGoal[];
  suggestedDirections: SuggestedDirection[];
}
