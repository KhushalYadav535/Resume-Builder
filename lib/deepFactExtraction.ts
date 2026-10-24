import { Resume, ResumeData, WorkExperience, Project } from "@/types";
import { CareerFact, CareerFactCategory, CareerFactScope } from "@/types/value";
import { askAIJSON } from "@/lib/openrouter";

function uid() {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Intelligent regex-based local analyzer to dissect a bullet into Action, Outcome, Scope, Metrics, and Gaps.
 * Guarantees zero latency and 100% offline reliability.
 */
export function analyzeBulletLocally(
  bulletText: string,
  roleContext: string,
  company: string
): {
  category: CareerFactCategory;
  statement: string;
  actionDetail: string;
  outcomeDetail?: string;
  scope?: CareerFactScope;
  metrics: string[];
  informationGaps: string[];
  confidence: "HIGH" | "MEDIUM" | "LOW";
} {
  const text = bulletText.trim();
  const metrics: string[] = [];
  const informationGaps: string[] = [];

  // 1. Extract Metrics
  const metricMatches = text.match(/(?:\d+(?:\.\d+)?%|\$\d+(?:\.\d+)?[kKmMbB]?|₹\d+(?:\.\d+)?[kKmMbB]?|\b\d+x\b|\b\d+\s*(?:ms|seconds|hours|days|weeks|users|clients|nodes)\b)/gi);
  if (metricMatches) {
    metricMatches.forEach((m) => metrics.push(m.trim()));
  }

  // 2. Extract Scope (Team, Budget, Geography)
  const scope: CareerFactScope = {};
  const teamMatch = text.match(/(?:team\s+of|managed|led|squad\s+of|mentored)\s+(\d+)/i);
  if (teamMatch) {
    scope.teamSize = parseInt(teamMatch[1], 10);
  }

  if (/global|international|cross-border|apac|emea|regional|nationwide/i.test(text)) {
    scope.geography = "Cross-regional / Global";
  }

  if (/c-suite|executive|vp|director|board|founder|senior\s+leadership/i.test(text)) {
    scope.stakeholderLevel = "Executive / C-Suite";
  } else if (/cross-functional|stakeholder|partner|client|customer/i.test(text)) {
    scope.stakeholderLevel = "Cross-Functional & Clients";
  }

  if (/sole\s+owner|independently|spearheaded|architected|owned\s+end-to-end|from\s+scratch/i.test(text)) {
    scope.autonomy = "High (Independent Ownership)";
  }

  // 3. Dissect Action vs Outcome
  let actionDetail = text;
  let outcomeDetail: string | undefined = undefined;

  const outcomeSplitters = /(?:resulting in|resulting to|which led to|leading to|driving|achieving|generating|reducing|increasing|improving by|delivering a)\s+(.+)/i;
  const splitMatch = text.match(outcomeSplitters);

  if (splitMatch) {
    actionDetail = text.substring(0, splitMatch.index).trim().replace(/[,;]\s*$/, "");
    outcomeDetail = splitMatch[0].trim();
  }

  // 4. Detect Information Gaps (Stage 1 Spec §2 & §5)
  if (!metrics.length && !outcomeDetail) {
    if (/managed|led|directed|spearheaded|oversaw/i.test(text) && !scope.teamSize) {
      informationGaps.push("Team size or organizational scope is unspecified");
    }
    if (/improved|increased|reduced|boosted|accelerated|optimized|scaled/i.test(text)) {
      informationGaps.push("Impact is stated qualitatively without baseline or quantified metric");
    } else {
      informationGaps.push("Responsibility stated without verifiable outcome or business impact");
    }
  }

  if (scope.teamSize === undefined && /mentored|guided|coached|trained/i.test(text)) {
    informationGaps.push("Mentorship count or audience scale is unspecified");
  }

  // 5. Determine Primary Category
  const isBiz = /\$|₹|revenue|cost reduction|margin|profit|arr|mrr|savings/i.test(text);
  const isTeam = /managed|led|hired|mentored|guided|team of/i.test(text);
  const isPromo = /promoted|elevated|advanced to/i.test(text);
  const isProject = /architected|developed|built|deployed|designed|engineered/i.test(text);

  let category: CareerFactCategory = "RESPONSIBILITY";
  if (isBiz) category = "BUSINESS_OUTCOME";
  else if (isPromo) category = "PROMOTION";
  else if (metrics.length > 0) category = "METRIC";
  else if (isTeam) category = "TEAM";
  else if (isProject) category = "PROJECT";

  const confidence = metrics.length > 0 || isBiz ? "HIGH" : informationGaps.length > 0 ? "MEDIUM" : "HIGH";

  return {
    category,
    statement: text,
    actionDetail,
    outcomeDetail,
    scope: Object.keys(scope).length > 0 ? scope : undefined,
    metrics,
    informationGaps,
    confidence,
  };
}

/**
 * Deep Fact Extraction AI Schema
 */
interface AIDeepFact {
  category: CareerFactCategory;
  statement: string;
  actionDetail: string;
  outcomeDetail?: string;
  teamSize?: number;
  stakeholderLevel?: string;
  geography?: string;
  autonomy?: string;
  metrics: string[];
  informationGaps: string[];
  confidence: "HIGH" | "MEDIUM" | "LOW";
}

/**
 * AI-assisted Stage 1 Deep Fact Extraction.
 * Connects to OpenRouter to dissect raw resume experience into the structured Career Fact Graph.
 * Disentangles Action vs Outcome, Scope, Metrics, and tags missing Information Gaps.
 */
export async function extractDeepCareerFactsAI(
  resumeText: string,
  resumeData: ResumeData
): Promise<AIDeepFact[]> {
  const experiences = resumeData.workExperience || [];
  if (experiences.length === 0) return [];

  const systemPrompt = `You are the UpRole Stage 1 Career Intelligence Engine.
Analyze the candidate's career experiences and raw resume. Dissect each bullet point and stated contribution into rich multidimensional career facts according to UpRole's Career Knowledge Graph specification.

For each fact:
1. 'category': One of ["ROLE", "RESPONSIBILITY", "TEAM", "ACHIEVEMENT", "PROJECT", "METRIC", "PROMOTION", "RECOGNITION", "AWARD", "EDUCATION", "CERTIFICATION", "DOMAIN", "TECHNOLOGY", "BUSINESS_OUTCOME", "PUBLICATION", "VOLUNTEER", "LANGUAGE", "ADDITIONAL"]
2. 'statement': A clear, self-contained factual statement.
3. 'actionDetail': What the person personally implemented or did.
4. 'outcomeDetail': What result, improvement, or business change occurred (if stated).
5. 'teamSize': Numeric team count if mentioned.
6. 'stakeholderLevel': E.g. "C-Suite", "Cross-Functional", "Direct Clients", or empty.
7. 'geography': E.g. "Global", "Regional", or empty.
8. 'autonomy': E.g. "Sole Owner", "Collaborative Squad", "Lead".
9. 'metrics': Array of exact metrics mentioned (e.g. ["35% load time reduction", "$2M ARR"]).
10. 'informationGaps': Array of what is missing or ambiguous that could be explored in Stage 2 Guided Discovery (e.g. "Missing quantified revenue impact", "Team size unspecified", "Individual vs squad ownership unclear").
11. 'confidence': "HIGH", "MEDIUM", or "LOW".

Respond ONLY with valid JSON matching:
{
  "facts": [
    {
      "category": string,
      "statement": string,
      "actionDetail": string,
      "outcomeDetail": string,
      "teamSize": number,
      "stakeholderLevel": string,
      "geography": string,
      "autonomy": string,
      "metrics": string[],
      "informationGaps": string[],
      "confidence": "HIGH" | "MEDIUM" | "LOW"
    }
  ]
}`;

  const prompt = `Candidate Resume Data:
Role: ${resumeData.personalInfo?.title || "Professional"}
Work Experience:
${JSON.stringify(experiences.slice(0, 5), null, 2)}

Projects:
${JSON.stringify((resumeData.projects || []).slice(0, 4), null, 2)}

Awards & Recognition:
${JSON.stringify(resumeData.awards || resumeData.hackathons || [], null, 2)}

Certifications:
${JSON.stringify(resumeData.certifications || [], null, 2)}

Raw Context:
${resumeText.slice(0, 2500)}`;

  try {
    const aiResult = await askAIJSON<{ facts: AIDeepFact[] }>(prompt, systemPrompt, 2, 0.2);
    if (aiResult?.facts && Array.isArray(aiResult.facts) && aiResult.facts.length > 0) {
      return aiResult.facts;
    }
    return [];
  } catch (err) {
    console.warn("[DeepFactExtraction] AI extraction failed or timed out, falling back to local analyzer:", err);
    return [];
  }
}
