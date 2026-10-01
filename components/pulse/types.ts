export type QualitativeLevel =
  | "Needs strengthening"
  | "Emerging"
  | "Developing"
  | "Established"
  | "Strong"
  | "Well evidenced";

export interface SnapshotData {
  headline: string;
  currentRole: string;
  organization: string;
  experience: number;
  scope: string;
  capabilities: string[];
  progressionSignal: string;
  evidenceCount: number;
}

export interface CareerValueData {
  capabilities: QualitativeLevel;
  experience: QualitativeLevel;
  impact: QualitativeLevel;
  progression: QualitativeLevel;
  evidence: QualitativeLevel;
  traceableCount: number;
  pendingReviewCount: number;
}

export interface ProgressItem {
  id: string;
  title: string;
  description: string;
  evidenceLink?: string;
  isPrimary?: boolean;
  category?: string;
  date?: string;
}

export interface CareerEventData {
  id: string;
  title: string;
  date: string;
  context: string;
  impact: string;
  capability: string;
}

export interface CareerDirectionData {
  title: string;
  confidence: "High Alignment" | "Moderate Alignment" | "Emerging";
  signals: string[];
  evidence: string[];
}

export interface CareerGoalData {
  title: string;
  timeframe: string;
  status: string;
  progressPercent: number;
  currentMilestoneIndex: number;
  milestones: string[];
  nextMilestone: string;
}

export interface NextBestActionData {
  title: string;
  reason: string;
  goalRelevance: string;
  actionType: "evidence" | "capability" | "goal" | "impact";
  cta: string;
  ctaLink: string;
}

export interface CareerMomentumData {
  state: "Building" | "Moving" | "Accelerating" | "Needs Attention" | "Goal Milestone Reached";
  trajectory: "up" | "neutral" | "accelerating";
  summary: string;
  signals: string[];
}

export interface ExplorationItem {
  id: string;
  role: string;
  alignment: "Strong alignment" | "High potential" | "Emerging opportunity";
  alignmentScore: number;
  rationale: string;
  relevantCapabilities: string[];
}

export interface PulseDashboardData {
  snapshot: SnapshotData;
  careerValue: CareerValueData;
  recentProgress: ProgressItem[];
  recentEvent: CareerEventData | null;
  careerDirection: CareerDirectionData;
  careerGoal: CareerGoalData | null;
  nextBestAction: NextBestActionData;
  momentum: CareerMomentumData;
  careerExploration: ExplorationItem[];
}

export type PulseCardId =
  | "snapshot"
  | "value"
  | "progress"
  | "event"
  | "direction"
  | "goal"
  | "action"
  | "momentum"
  | "explore";

export type ScenarioPreset =
  | "live"
  | "full"
  | "scenarioA_new"
  | "scenarioB_partial"
  | "scenarioC_no_goal"
  | "scenarioD_no_event";

export interface AiTraceabilityContext {
  componentTitle: string;
  claim: string;
  confidence: string;
  reasoning: string[];
  evidenceSources: {
    title: string;
    type: string;
    date?: string;
    snippet: string;
  }[];
}
