export interface ResumeSections {
  summary: string[];
  experience: string[];
  education: string[];
  projects: string[];
  skills: string[];
  certifications: string[];
  languages: string[];
}

/**
 * Segregates raw resume text into distinct logical sections by scanning lines for header keywords.
 * Runs completely locally on the server (fast, free, rate-limit immune).
 */
export function parseSections(text: string): ResumeSections {
  const sections: ResumeSections = {
    summary: [],
    experience: [],
    education: [],
    projects: [],
    skills: [],
    certifications: [],
    languages: [],
  };

  // Keywords that identify section boundaries
  const headers = {
    summary: [/^\s*(?:summary|objective|profile|professional summary|about me|executive summary)\b/i],
    experience: [/^\s*(?:experience|employment|work history|professional history|employment history|work experience|career history|background)\b/i],
    education: [/^\s*(?:education|academic background|academic details|academia|studies|qualifications)\b/i],
    projects: [/^\s*(?:projects|personal projects|key projects|academic projects|technical projects|portfolio)\b/i],
    skills: [/^\s*(?:skills|technical skills|technologies|expertise|core competencies|competencies|skills & tools)\b/i],
    certifications: [/^\s*(?:certifications|certificates|licenses|awards|credentials|achievements|courses)\b/i],
    languages: [/^\s*(?:languages\s*known|languages|language skills|spoken languages|linguistic skills|language proficiency)\b/i],
  };

  const lines = text.split("\n").map(l => l.trim());
  let currentSection: keyof ResumeSections | null = null;

  for (const line of lines) {
    if (!line) continue;

    // Check if the current line acts as a section header
    let matchedHeader = false;
    for (const [sectionKey, regexes] of Object.entries(headers)) {
      for (const regex of regexes) {
        // Must be relatively short to avoid matching sentences starting with keywords
        if (regex.test(line) && line.split(/\s+/).length < 5) {
          currentSection = sectionKey as keyof ResumeSections;
          matchedHeader = true;
          break;
        }
      }
      if (matchedHeader) break;
    }

    if (matchedHeader) continue;

    // Distribute text to appropriate section
    if (currentSection) {
      sections[currentSection].push(line);
    } else {
      // Default initial lines before any header are categorized under professional summary
      sections.summary.push(line);
    }
  }

  return sections;
}
