import { ResumeSuggestion } from "@/lib/types/comprehensive-suggestions";

export function applyComprehensiveSuggestions(
  resumeText: string,
  resumeStructured: any,
  suggestions: ResumeSuggestion[]
): {
  updatedText: string;
  updatedStructured: any;
  changesApplied: number;
} {
  let updatedText = resumeText || "";
  let changesApplied = 0;

  for (const suggestion of suggestions) {
    if (!suggestion.isAccepted) continue;

    // Strategy 1: Explicit Replace (Bullet point rewrites, summary replacements)
    if (suggestion.currentText && suggestion.currentText.trim() !== "") {
      const current = suggestion.currentText.trim();
      // We do a simple string replace. If it's found, we replace it.
      if (updatedText.includes(current)) {
        updatedText = updatedText.replace(current, suggestion.suggestedText);
        changesApplied++;
        continue;
      }
      
      // Fallback: case insensitive or whitespace normalized replace
      const normalizedCurrent = current.replace(/\s+/g, ' ').toLowerCase();
      const normalizedText = updatedText.replace(/\s+/g, ' ').toLowerCase();
      
      if (normalizedText.includes(normalizedCurrent)) {
        try {
          const escapedCurrent = current.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const flexibleRegex = new RegExp(escapedCurrent.split(/\s+/).join('\\s+'), 'i');
          if (flexibleRegex.test(updatedText)) {
            updatedText = updatedText.replace(flexibleRegex, suggestion.suggestedText);
            changesApplied++;
            continue;
          }
        } catch (e) {
          // regex generation failed, skip
        }
      }
    }

    // Strategy 2: Append to Section (Keywords, Certifications, New Projects)
    if (!suggestion.currentText) {
      const sectionName = (suggestion.section || "general").toLowerCase();
      const escapedSectionName = sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      try {
        const sectionRegex = new RegExp(`(?<=\\n|^)(#+\\s*)?${escapedSectionName}\\s*(:|\\n)`, 'i');
        const match = updatedText.match(sectionRegex);
        
        if (match && match.index !== undefined) {
          // Insert after the section header
          const insertPos = match.index + match[0].length;
          updatedText = 
            updatedText.substring(0, insertPos) + 
            `\n- ${suggestion.suggestedText}` + 
            updatedText.substring(insertPos);
        } else {
          // Just append to the end of the document under a new AI additions block
          if (!updatedText.includes("### AI Additions")) {
            updatedText += "\n\n### AI Additions";
          }
          updatedText += `\n- [${suggestion.category}] ${suggestion.suggestedText}`;
        }
        changesApplied++;
      } catch (regexErr) {
        // Fallback if regex fails completely
        if (!updatedText.includes("### AI Additions")) {
          updatedText += "\n\n### AI Additions";
        }
        updatedText += `\n- [${suggestion.category}] ${suggestion.suggestedText}`;
        changesApplied++;
      }
    }
  }

  return {
    updatedText,
    updatedStructured: resumeStructured,
    changesApplied
  };
}
