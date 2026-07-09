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
  let updatedStructured = resumeStructured ? JSON.parse(JSON.stringify(resumeStructured)) : {};
  let changesApplied = 0;

  for (const suggestion of suggestions) {
    if (!suggestion.isAccepted) continue;

    let appliedToText = false;
    let appliedToStructured = false;

    // Strategy 1: Explicit Replace (Bullet point rewrites, summary replacements)
    if (suggestion.currentText && suggestion.currentText.trim() !== "") {
      const current = suggestion.currentText.trim();
      
      // Update text representation
      if (updatedText.includes(current)) {
        updatedText = updatedText.replace(current, suggestion.suggestedText);
        appliedToText = true;
      } else {
        // Fallback: case-insensitive or whitespace-normalized replace
        const normalizedCurrent = current.replace(/\s+/g, ' ').toLowerCase();
        const normalizedText = updatedText.replace(/\s+/g, ' ').toLowerCase();
        
        if (normalizedText.includes(normalizedCurrent)) {
          try {
            const escapedCurrent = current.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const flexibleRegex = new RegExp(escapedCurrent.split(/\s+/).join('\\s+'), 'i');
            if (flexibleRegex.test(updatedText)) {
              updatedText = updatedText.replace(flexibleRegex, suggestion.suggestedText);
              appliedToText = true;
            }
          } catch (e) {
            // regex generation failed, skip
          }
        }
      }

      // Recursively replace inside updatedStructured
      const replaceResult = recursiveReplace(updatedStructured, current, suggestion.suggestedText);
      if (replaceResult.replaced) {
        updatedStructured = replaceResult.newObj;
        appliedToStructured = true;
      }
    }

    // Strategy 2: Append to Section (Keywords, Certifications, New Projects)
    if (!suggestion.currentText) {
      const sectionName = (suggestion.section || "general").toLowerCase();

      // Text representation update
      const escapedSectionName = sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      try {
        const sectionRegex = new RegExp(`(?<=\\n|^)(#+\\s*)?${escapedSectionName}\\s*(:|\\n)`, 'i');
        const match = updatedText.match(sectionRegex);
        
        if (match && match.index !== undefined) {
          const insertPos = match.index + match[0].length;
          updatedText = 
            updatedText.substring(0, insertPos) + 
            `\n- ${suggestion.suggestedText}` + 
            updatedText.substring(insertPos);
        } else {
          if (!updatedText.includes("### AI Additions")) {
            updatedText += "\n\n### AI Additions";
          }
          updatedText += `\n- [${suggestion.category}] ${suggestion.suggestedText}`;
        }
        appliedToText = true;
      } catch (regexErr) {
        if (!updatedText.includes("### AI Additions")) {
          updatedText += "\n\n### AI Additions";
        }
        updatedText += `\n- [${suggestion.category}] ${suggestion.suggestedText}`;
        appliedToText = true;
      }

      // Structured representation update
      if (
        sectionName === "skills" || 
        suggestion.category === "ats_keyword" || 
        suggestion.category === "technical_skill" || 
        suggestion.category === "soft_skill"
      ) {
        if (!updatedStructured.skills) {
          updatedStructured.skills = { technical: [], soft: [] };
        }
        if (!Array.isArray(updatedStructured.skills.technical)) {
          updatedStructured.skills.technical = [];
        }
        // Extract comma-separated skills
        const skillsList = suggestion.suggestedText.split(/,|\n/).map(s => s.trim()).filter(s => s.length > 0 && s.length < 30);
        if (skillsList.length > 0) {
          for (const skill of skillsList) {
            if (!updatedStructured.skills.technical.includes(skill)) {
              updatedStructured.skills.technical.push(skill);
              appliedToStructured = true;
            }
          }
        } else {
          if (!updatedStructured.skills.technical.includes(suggestion.suggestedText)) {
            updatedStructured.skills.technical.push(suggestion.suggestedText);
            appliedToStructured = true;
          }
        }
      } else if (sectionName === "summary") {
        if (!updatedStructured.summary) {
          updatedStructured.summary = suggestion.suggestedText;
          appliedToStructured = true;
        } else if (!updatedStructured.summary.includes(suggestion.suggestedText)) {
          updatedStructured.summary += "\n\n" + suggestion.suggestedText;
          appliedToStructured = true;
        }
      } else if (sectionName === "certifications") {
        if (!Array.isArray(updatedStructured.certifications)) {
          updatedStructured.certifications = [];
        }
        updatedStructured.certifications.push({
          id: `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: suggestion.suggestedText,
          issuer: "",
          date: ""
        });
        appliedToStructured = true;
      } else if (sectionName === "contact" || suggestion.category === "contact_info") {
        if (!updatedStructured.personalInfo) {
          updatedStructured.personalInfo = {};
        }
        const text = (suggestion.suggestedText || "").toLowerCase();
        const title = (suggestion.title || "").toLowerCase();
        
        if (title.includes("headline") || text.includes("headline")) {
          let headlineVal = suggestion.suggestedText;
          if (headlineVal.toLowerCase().startsWith("add '") && headlineVal.endsWith("' as your headline")) {
            headlineVal = headlineVal.substring(5, headlineVal.length - 18);
          } else if (headlineVal.toLowerCase().startsWith("add ") && headlineVal.toLowerCase().includes("as your headline")) {
            const match = headlineVal.match(/add\s+['"]?([^'"]+)['"]?\s+as\s+your\s+headline/i);
            if (match) headlineVal = match[1];
          }
          updatedStructured.personalInfo.headline = headlineVal;
          appliedToStructured = true;
        } else if (title.includes("linkedin") || text.includes("linkedin.com")) {
          updatedStructured.personalInfo.linkedin = suggestion.suggestedText;
          appliedToStructured = true;
        } else if (title.includes("phone") || title.includes("mobile")) {
          updatedStructured.personalInfo.phone = suggestion.suggestedText;
          appliedToStructured = true;
        } else if (title.includes("email")) {
          updatedStructured.personalInfo.email = suggestion.suggestedText;
          appliedToStructured = true;
        }
      }
    }

    if (appliedToText || appliedToStructured) {
      changesApplied++;
    }
  }

  return {
    updatedText,
    updatedStructured,
    changesApplied
  };
}

function recursiveReplace(obj: any, currentText: string, suggestedText: string): { replaced: boolean, newObj: any } {
  let replaced = false;
  const currentTrimmed = currentText.trim();
  const escapedCurrent = currentTrimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const flexibleRegex = new RegExp(escapedCurrent.split(/\s+/).join('\\s+'), 'i');

  if (typeof obj === 'string') {
    if (obj.includes(currentTrimmed)) {
      return { replaced: true, newObj: obj.replace(currentTrimmed, suggestedText) };
    }
    if (flexibleRegex.test(obj)) {
      return { replaced: true, newObj: obj.replace(flexibleRegex, suggestedText) };
    }
    return { replaced: false, newObj: obj };
  }

  if (Array.isArray(obj)) {
    const newArray = [];
    for (const item of obj) {
      const res = recursiveReplace(item, currentText, suggestedText);
      newArray.push(res.newObj);
      if (res.replaced) replaced = true;
    }
    return { replaced, newObj: newArray };
  }

  if (typeof obj === 'object' && obj !== null) {
    const newObj: any = {};
    for (const key in obj) {
      const res = recursiveReplace(obj[key], currentText, suggestedText);
      newObj[key] = res.newObj;
      if (res.replaced) replaced = true;
    }
    return { replaced, newObj };
  }

  return { replaced: false, newObj: obj };
}
