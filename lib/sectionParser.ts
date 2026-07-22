export interface ResumeSections {
  summary: string[];
  experience: string[];
  education: string[];
  projects: string[];
  skills: string[];
  certifications: string[];
  languages: string[];
  ignored: string[];
}

/**
 * Segregates raw resume text into distinct logical sections by scanning lines for header keywords.
 * Handles typos like "SUMMERY", ALL-CAPS, Title-Case, and common header variations.
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
    ignored: [],
  };

  const headers: Record<keyof ResumeSections, RegExp[]> = {
    summary: [
      /^(?:summary|objective|profile|professional summery|professional summary|executive summary|about me|career summary|career objective|overview)$/i,
    ],
    experience: [
      /^(?:professional experience|work experience|employment history|work history|professional history|career history|experience|employment|background|internship|internships)$/i,
    ],
    education: [
      /^(?:education|academic background|academic details|academic qualifications|educational qualifications|qualifications|academics|educational background)$/i,
    ],
    projects: [
      /^(?:projects?|personal projects?|key projects?|academic projects?|technical projects?|portfolio|software projects?)$/i,
    ],
    skills: [
      /^(?:technical skills?|skills?|technologies|expertise|core competencies|competencies|skills? & tools?|tools? & technologies|key skills?)$/i,
    ],
    certifications: [
      /^(?:certifications?|certificates?|licenses?|awards?|credentials?|achievements?|courses?|trainings?)$/i,
    ],
    languages: [
      /^(?:languages?\s*known|languages?|language skills?|spoken languages?|linguistic skills?)$/i,
    ],
    ignored: [
      /^(?:hobbies|interests|volunteer work|volunteering|references|declaration|personal details|personal information|extra-?curricular|activities|strengths|weaknesses|personal profile)$/i,
    ],
  };

  const lines = text.split("\n").map(l => l.trim());
  let currentSection: keyof ResumeSections | null = null;

  for (const line of lines) {
    if (!line) continue;

    // Clean trailing punctuation and colon
    const normalized = line.toLowerCase().replace(/[:\-–—_*#•]+$/, "").trim();
    const wordCount = normalized.split(/\s+/).length;

    let matchedHeader = false;
    for (const [sectionKey, regexes] of Object.entries(headers)) {
      for (const regex of regexes) {
        if (regex.test(normalized) && wordCount <= 6) {
          currentSection = sectionKey as keyof ResumeSections;
          matchedHeader = true;
          break;
        }
      }
      if (matchedHeader) break;
    }

    if (matchedHeader) continue;

    if (currentSection) {
      sections[currentSection].push(line);
    } else {
      sections.summary.push(line);
    }
  }

  return sections;
}
