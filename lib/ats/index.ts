import { detectRole } from './roleDetector';
import { runKeywordEngine } from './keywordEngine';
import { calculateWeightedScore } from './weightEngine';
import { calculateATS } from '../calculateATS';
import type { ATSScore } from '@/types';

export interface DynamicATSResult extends ATSScore {
  score: number;
  detectedIndustry: string;
  detectedRole: string;
  confidence: number;
  india_keyword_matches: string[];
  keywordMatches: { keyword: string; weight: number; layer: 'base' | 'dynamic'; matchedText: string }[];
  missingKeywordDetails: { keyword: string; weight: number }[];
  sections: {
    hasExperience: boolean;
    hasEducation: boolean;
    hasSkills: boolean;
    hasSummary: boolean;
    hasProjects: boolean;
    hasCertifications: boolean;
  };
  formatting: {
    hasEmail: boolean;
    hasPhone: boolean;
    hasLocation: boolean;
  };
}

export function calculateDynamicATS(resumeText: string): DynamicATSResult {
  const roleResult = detectRole(resumeText);
  const engineResult = runKeywordEngine(resumeText, roleResult.industry);
  const score = calculateWeightedScore(
    engineResult.achievedScore,
    engineResult.totalPossibleScore,
    roleResult.confidence
  );

  const oldResult = calculateATS(resumeText);

  // Section detection (keep existing logic from calculateATS.ts)
  const text = resumeText.toLowerCase();
  const sections = {
    hasExperience: /experience|employment|work history/i.test(text),
    hasEducation: /education|academic|qualification/i.test(text),
    hasSkills: /skills|technologies|competencies/i.test(text),
    hasSummary: /summary|objective|profile|about/i.test(text),
    hasProjects: /projects|portfolio/i.test(text),
    hasCertifications: /certification|certificate|certified/i.test(text),
  };

  const formatting = {
    hasEmail: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(resumeText),
    hasPhone: /(\+91|0)?[6-9]\d{9}/.test(resumeText),
    hasLocation: /mumbai|delhi|bangalore|hyderabad|pune|chennai|kolkata|india/i.test(resumeText),
  };
  
  // Combine new score with the other breakdown metrics from the old result
  const overall = Math.min(
    100,
    Math.max(
      15, // Maintain standard minimum
      Math.round(
        0.25 * oldResult.breakdown.sections +
        0.25 * oldResult.breakdown.formatting +
        0.25 * oldResult.breakdown.readability +
        0.25 * score
      )
    )
  );

  return {
    ...oldResult,
    overall,
    breakdown: {
      ...oldResult.breakdown,
      keywords: score,
    },
    matchedKeywords: engineResult.matches.map(m => m.keyword),
    missingKeywords: engineResult.missingHighValueKeywords.map(m => m.keyword),
    keywordMatches: engineResult.matches,
    missingKeywordDetails: engineResult.missingHighValueKeywords,
    score,
    detectedIndustry: roleResult.industry,
    detectedRole: roleResult.detectedRole,
    confidence: roleResult.confidence,
    india_keyword_matches: engineResult.matches
      .filter(m => m.layer === 'dynamic')
      .map(m => m.keyword),
    sections,
    formatting,
  };
}
