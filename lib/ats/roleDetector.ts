import * as fs from 'fs';
import * as path from 'path';

export type Industry =
  | 'software_engineering'
  | 'ai_engineering'
  | 'data_science'
  | 'finance'
  | 'marketing'
  | 'product_management'
  | 'general';

export interface RoleDetectionResult {
  industry: Industry;
  confidence: number;        // 0-100
  detectedFrom: 'title' | 'skills' | 'education' | 'fallback';
  detectedRole: string;      // e.g. "Software Engineer", "AI Engineer"
}

const TITLE_MAP: Record<string, Industry> = {
  // Software
  'software engineer': 'software_engineering',
  'frontend developer': 'software_engineering',
  'backend developer': 'software_engineering',
  'full stack': 'software_engineering',
  'fullstack': 'software_engineering',
  'web developer': 'software_engineering',
  'devops': 'software_engineering',
  'sre': 'software_engineering',
  'mobile developer': 'software_engineering',
  'ios developer': 'software_engineering',
  'android developer': 'software_engineering',

  // AI / ML
  'machine learning': 'ai_engineering',
  'ml engineer': 'ai_engineering',
  'ai engineer': 'ai_engineering',
  'nlp engineer': 'ai_engineering',
  'deep learning': 'ai_engineering',
  'llm engineer': 'ai_engineering',
  'generative ai': 'ai_engineering',

  // Data
  'data scientist': 'data_science',
  'data analyst': 'data_science',
  'data engineer': 'data_science',
  'business analyst': 'data_science',
  'bi developer': 'data_science',
  'analytics': 'data_science',

  // Finance
  'investment banker': 'finance',
  'financial analyst': 'finance',
  'chartered accountant': 'finance',
  'ca ': 'finance',
  'equity analyst': 'finance',
  'risk analyst': 'finance',
  'credit analyst': 'finance',
  'fintech': 'finance',
  'banking': 'finance',

  // Marketing
  'digital marketing': 'marketing',
  'growth hacker': 'marketing',
  'seo': 'marketing',
  'content marketing': 'marketing',
  'performance marketing': 'marketing',
  'brand manager': 'marketing',

  // Product
  'product manager': 'product_management',
  'product owner': 'product_management',
  'program manager': 'product_management',
  'scrum master': 'product_management',
};

const EDUCATION_MAP: Record<string, Industry> = {
  'computer science': 'software_engineering',
  'information technology': 'software_engineering',
  'b.tech': 'software_engineering',
  'be computer': 'software_engineering',
  'mba finance': 'finance',
  'ca final': 'finance',
  'chartered': 'finance',
  'mba marketing': 'marketing',
  'statistics': 'data_science',
  'mathematics': 'data_science',
  'economics': 'finance',
};

const INDUSTRIES: Industry[] = [
  'software_engineering',
  'ai_engineering',
  'data_science',
  'finance',
  'marketing',
  'product_management'
];

export function detectRole(resumeText: string): RoleDetectionResult {
  const lowerText = resumeText.toLowerCase();
  
  // Step 1: Title matching (highest confidence)
  // Scan the first 500 characters of the resume text
  const first500 = lowerText.substring(0, 500);
  for (const [title, industry] of Object.entries(TITLE_MAP)) {
    if (first500.includes(title)) {
      return {
        industry,
        confidence: 90,
        detectedFrom: 'title',
        detectedRole: title
      };
    }
  }

  // Step 2: Skill fingerprinting (medium confidence)
  // If no title match, count how many keywords from each industry's base JSON appear in the full resume text.
  let bestIndustry: Industry | null = null;
  let maxHits = 0;

  for (const industry of INDUSTRIES) {
    try {
      const filePath = path.join(process.cwd(), 'keywords', 'base', `${industry}.json`);
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContent);
        const keywords = data.keywords || [];
        
        let hits = 0;
        for (const item of keywords) {
          const kw = item.keyword.toLowerCase();
          const aliases = (item.aliases || []).map((a: string) => a.toLowerCase());
          
          let matched = false;
          // Check keyword
          const escapedKw = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          if (new RegExp(`\\b${escapedKw}\\b`, 'i').test(lowerText)) {
            matched = true;
          } else {
            // Check aliases
            for (const alias of aliases) {
              const escapedAlias = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
              if (new RegExp(`\\b${escapedAlias}\\b`, 'i').test(lowerText)) {
                matched = true;
                break;
              }
            }
          }
          
          if (matched) hits++;
        }
        
        if (hits > maxHits) {
          maxHits = hits;
          bestIndustry = industry;
        }
      }
    } catch (e) {
      console.error(`Error reading base keywords for ${industry}:`, e);
    }
  }

  if (bestIndustry && maxHits > 0) {
    return {
      industry: bestIndustry,
      confidence: 70,
      detectedFrom: 'skills',
      detectedRole: bestIndustry.replace('_', ' ')
    };
  }

  // Step 3: Education matching (low confidence fallback)
  for (const [edu, industry] of Object.entries(EDUCATION_MAP)) {
    if (lowerText.includes(edu)) {
      return {
        industry,
        confidence: 40,
        detectedFrom: 'education',
        detectedRole: edu
      };
    }
  }

  // Fallback
  return {
    industry: 'general',
    confidence: 20,
    detectedFrom: 'fallback',
    detectedRole: 'general'
  };
}
