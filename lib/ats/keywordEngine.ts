import * as fs from 'fs';
import * as path from 'path';
import type { Industry } from './roleDetector';

export interface KeywordMatch {
  keyword: string;
  weight: number;
  layer: 'base' | 'dynamic';
  matchedText: string;    // the exact text that matched
}

export interface KeywordEngineResult {
  industry: Industry;
  matches: KeywordMatch[];
  totalPossibleScore: number;
  achievedScore: number;
  missingHighValueKeywords: { keyword: string; weight: number }[];  // keywords with weight >= 8 that were NOT found
}

interface JsonKeyword {
  keyword: string;
  weight: number;
  aliases?: string[];
  is_active?: boolean;
  expires_on?: string;
}

export function runKeywordEngine(
  resumeText: string,
  industry: Industry
): KeywordEngineResult {
  let baseKeywords: JsonKeyword[] = [];
  let dynamicKeywords: JsonKeyword[] = [];
  
  const basePath = path.join(process.cwd(), 'keywords', 'base', `${industry}.json`);
  const dynamicPath = path.join(process.cwd(), 'keywords', 'dynamic', `${industry}.json`);

  // Load base
  try {
    if (fs.existsSync(basePath)) {
      const data = JSON.parse(fs.readFileSync(basePath, 'utf8'));
      baseKeywords = data.keywords || [];
    }
  } catch (err) {
    console.error(`Error loading base keywords for ${industry}:`, err);
  }

  // Load dynamic
  try {
    if (industry !== 'general' && fs.existsSync(dynamicPath)) {
      const data = JSON.parse(fs.readFileSync(dynamicPath, 'utf8'));
      dynamicKeywords = data.keywords || [];
    }
  } catch (err) {
    console.error(`Error loading dynamic keywords for ${industry}:`, err);
  }

  const today = new Date();
  
  // Filter active dynamic
  const activeDynamicKeywords = dynamicKeywords.filter(k => {
    if (k.is_active === false) return false;
    if (k.expires_on) {
      const expiryDate = new Date(k.expires_on);
      if (expiryDate < today) return false;
    }
    return true;
  });

  const matches: KeywordMatch[] = [];
  let totalPossibleScore = 0;
  let achievedScore = 0;
  const missingHighValueKeywords: { keyword: string; weight: number }[] = [];

  const lowerText = resumeText.toLowerCase();

  // Helper to check match
  function processKeywordList(list: JsonKeyword[], layer: 'base' | 'dynamic') {
    for (const item of list) {
      totalPossibleScore += item.weight;
      
      const kw = item.keyword;
      const aliases = item.aliases || [];
      const searchTerms = [kw, ...aliases];
      
      let matchedText = '';
      
      for (const term of searchTerms) {
        const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`\\b${escaped}\\b`, 'i');
        const match = resumeText.match(regex);
        if (match) {
          matchedText = match[0]; // Capture the exact text that matched from the original string
          break;
        }
      }
      
      if (matchedText) {
        achievedScore += item.weight;
        matches.push({
          keyword: item.keyword,
          weight: item.weight,
          layer,
          matchedText
        });
      } else {
        if (item.weight >= 8) {
          missingHighValueKeywords.push({ keyword: item.keyword, weight: item.weight });
        }
      }
    }
  }

  processKeywordList(baseKeywords, 'base');
  processKeywordList(activeDynamicKeywords, 'dynamic');

  return {
    industry,
    matches,
    totalPossibleScore,
    achievedScore,
    missingHighValueKeywords
  };
}
