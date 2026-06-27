export interface ResumeSuggestion {
  id: string;
  resumeId: string;
  suggestionType: 
    | 'missing_keyword'
    | 'missing_skill'
    | 'experience_gap'
    | 'skill_enhancement'
    | 'formatting_improvement';
  title: string;
  description: string;
  suggestedText: string;
  category: 'technical' | 'soft_skill' | 'experience' | 'education' | 'certification';
  priority: 1 | 2 | 3 | 4 | 5;
  whereToAdd: 'experience' | 'skills' | 'summary' | 'education' | 'certifications';
  isAccepted: boolean;
  createdAt: string;
}

export interface SuggestionsResponse {
  suggestions: ResumeSuggestion[];
  estimatedNewScore: number;
  totalSuggestions: number;
}
