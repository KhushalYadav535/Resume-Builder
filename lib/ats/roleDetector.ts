import * as fs from 'fs';
import * as path from 'path';

export type Industry =
  | 'software_engineering'
  | 'ai_engineering'
  | 'data_science'
  | 'finance'
  | 'marketing'
  | 'product_management'
  | 'human_resources'
  | 'sales'
  | 'operations'
  | 'healthcare'
  | 'legal'
  | 'education'
  | 'hospitality'
  | 'manufacturing'
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

  // HR
  'hr manager': 'human_resources',
  'human resources': 'human_resources',
  'talent acquisition': 'human_resources',
  'recruiter': 'human_resources',
  'hr business partner': 'human_resources',
  'hrbp': 'human_resources',
  'payroll': 'human_resources',
  'talent management': 'human_resources',
  'learning and development': 'human_resources',
  'l&d': 'human_resources',

  // Sales
  'sales manager': 'sales',
  'account executive': 'sales',
  'business development': 'sales',
  'sales executive': 'sales',
  'key account manager': 'sales',
  'inside sales': 'sales',
  'channel sales': 'sales',
  'sales representative': 'sales',
  'bdm': 'sales',
  'area sales manager': 'sales',

  // Operations
  'operations manager': 'operations',
  'supply chain': 'operations',
  'logistics manager': 'operations',
  'warehouse manager': 'operations',
  'procurement': 'operations',
  'inventory manager': 'operations',
  'operations head': 'operations',
  'facility manager': 'operations',

  // Healthcare
  'doctor': 'healthcare',
  'physician': 'healthcare',
  'nurse': 'healthcare',
  'clinical research': 'healthcare',
  'pharmacovigilance': 'healthcare',
  'medical officer': 'healthcare',
  'hospital administrator': 'healthcare',
  'medical affairs': 'healthcare',
  'pharmacist': 'healthcare',
  'lab technician': 'healthcare',

  // Legal
  'lawyer': 'legal',
  'advocate': 'legal',
  'legal counsel': 'legal',
  'company secretary': 'legal',
  'compliance officer': 'legal',
  'legal advisor': 'legal',
  'legal manager': 'legal',
  'contract manager': 'legal',
  'cs trainee': 'legal',

  // Education
  'teacher': 'education',
  'professor': 'education',
  'academic': 'education',
  'lecturer': 'education',
  'training manager': 'education',
  'instructional designer': 'education',
  'curriculum developer': 'education',
  'corporate trainer': 'education',
  'faculty': 'education',

  // Hospitality
  'hotel manager': 'hospitality',
  'front office': 'hospitality',
  'food and beverage': 'hospitality',
  'f&b manager': 'hospitality',
  'housekeeping': 'hospitality',
  'chef': 'hospitality',
  'travel agent': 'hospitality',
  'resort manager': 'hospitality',
  'revenue manager': 'hospitality',

  // Manufacturing
  'production engineer': 'manufacturing',
  'quality engineer': 'manufacturing',
  'manufacturing engineer': 'manufacturing',
  'plant manager': 'manufacturing',
  'process engineer': 'manufacturing',
  'maintenance engineer': 'manufacturing',
  'industrial engineer': 'manufacturing',
  'tool engineer': 'manufacturing',
  'cnc operator': 'manufacturing',
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
  // New education mappings
  'mba hr': 'human_resources',
  'mba human resources': 'human_resources',
  'pgdm hr': 'human_resources',
  'mba sales': 'sales',
  'mba operations': 'operations',
  'mbbs': 'healthcare',
  'bsc nursing': 'healthcare',
  'b pharm': 'healthcare',
  'bds': 'healthcare',
  'llb': 'legal',
  'llm': 'legal',
  'b.ed': 'education',
  'm.ed': 'education',
  'hotel management': 'hospitality',
  'b.sc hotel': 'hospitality',
  'be mechanical': 'manufacturing',
  'diploma mechanical': 'manufacturing',
  'be production': 'manufacturing',
};

/**
 * Auto-discovers all available industries by reading the keywords/base directory.
 * This supports custom categories added via admin panel without code changes.
 */
export function getAvailableIndustries(): string[] {
  try {
    const basePath = path.join(process.cwd(), 'keywords', 'base');
    const files = fs.readdirSync(basePath);
    return files
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace('.json', ''));
  } catch {
    return ['software_engineering', 'ai_engineering', 'data_science', 'finance', 'marketing', 'product_management', 'general'];
  }
}

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
  // Auto-discover all industries from the filesystem
  const INDUSTRIES = getAvailableIndustries();
  let bestIndustry: string | null = null;
  let maxHits = 0;

  for (const industry of INDUSTRIES) {
    if (industry === 'general') continue;
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
          const escapedKw = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          if (new RegExp(`\\b${escapedKw}\\b`, 'i').test(lowerText)) {
            matched = true;
          } else {
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
      industry: bestIndustry as Industry,
      confidence: 70,
      detectedFrom: 'skills',
      detectedRole: bestIndustry.replace(/_/g, ' ')
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
