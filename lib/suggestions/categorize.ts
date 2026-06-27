import { ResumeSuggestion, GroupedSuggestions } from "@/lib/types/comprehensive-suggestions";

export function groupSuggestions(suggestions: ResumeSuggestion[]): GroupedSuggestions {
  return {
    atsAndKeywords: suggestions.filter(s => 
      ['ats_keyword', 'technical_skill'].includes(s.category)
    ),
    
    softSkills: suggestions.filter(s => 
      s.category === 'soft_skill'
    ),
    
    experienceBullets: suggestions.filter(s => 
      ['experience_bullet', 'action_verb', 'achievement_quantification'].includes(s.category)
    ),
    
    sections: suggestions.filter(s =>
      ['professional_summary', 'education', 'certification', 'project', 'contact_info'].includes(s.category)
    ),
    
    formatting: suggestions.filter(s =>
      ['formatting', 'work_experience_structure', 'skills_organization'].includes(s.category)
    )
  };
}
