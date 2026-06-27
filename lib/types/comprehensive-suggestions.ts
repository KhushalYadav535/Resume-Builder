export type SuggestionCategory = 
  | 'ats_keyword'
  | 'technical_skill'
  | 'soft_skill'
  | 'experience_bullet'
  | 'achievement_quantification'
  | 'action_verb'
  | 'professional_summary'
  | 'education'
  | 'certification'
  | 'project'
  | 'formatting'
  | 'contact_info'
  | 'skills_organization'
  | 'work_experience_structure';

export type ImpactLevel = 'high' | 'medium' | 'low';

export interface ResumeSuggestion {
  id: string;
  resumeId: string;
  category: SuggestionCategory;
  title: string;
  description: string;
  currentText: string | null;
  suggestedText: string;
  section: string;
  impactLevel: ImpactLevel;
  priority: 1 | 2 | 3 | 4 | 5;
  reasoning: string;
  isAccepted: boolean;
  createdAt: string;
}

export interface GroupedSuggestions {
  atsAndKeywords: ResumeSuggestion[];
  softSkills: ResumeSuggestion[];
  experienceBullets: ResumeSuggestion[];
  sections: ResumeSuggestion[];
  formatting: ResumeSuggestion[];
}
