export interface ResumeSections {
  summary: string[];
  experience: string[];
  education: string[];
  projects: string[];
  skills: string[];
  certifications: string[];
  awards: string[];
  publications: string[];
  languages: string[];
  volunteer: string[];
  additional: string[];
  ignored: string[];
}

/**
 * Segregates raw resume text into distinct logical sections by scanning lines for header keywords.
 * Handles typos like "SUMMERY", ALL-CAPS, Title-Case, and common header variations.
 * Ensures all resume information is cleanly segregated into its proper head.
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
    awards: [],
    publications: [],
    languages: [],
    volunteer: [],
    additional: [],
    ignored: [],
  };

  const headers: Record<keyof ResumeSections, RegExp[]> = {
    summary: [
      /^(?:summary|objective|profile|professional summery|professional summary|executive summary|about me|career summary|career objective|overview)$/i,
    ],
    experience: [
      /^(?:professional\s*experience|work\s*experience|employment\s*history|work\s*history|professional\s*history|career\s*history|experience|employment|background|internship|internships|work\s*&\s*training\s*experience|duties\s*(?:and|&)\s*responsibilities|roles?\s*(?:and|&)\s*responsibilities|project\s*details|project\s*experience|projects\s*undertaken|project\s*summary|experience\s*summary|commercial\s*experience|assignments?|work\s*experience\s*details|project\s*profile|projects?\s*handled|company\s*projects?|client\s*projects?|key\s*projects?|live\s*projects?)$/i,
    ],
    education: [
      /^(?:education|academic background|academic details|academic qualifications|educational qualifications|education qualifications|qualifications|academics|educational background|academic credentials|scholastic profiles?|scholastic background|scholastic credentials?|professional qualifications?)$/i,
    ],
    projects: [
      /^(?:projects?(?:\s*(?:&|and|\/)\s*(?:portfolio|experience|work))?|personal\s*projects?|key\s*projects?|academic\s*projects?|technical\s*projects?|portfolio|software\s*projects?)$/i,
    ],
    skills: [
      /^(?:technical\s*skills?|skills?(?:\s*(?:&|and|\/)\s*(?:tools?|technologies|abilities|competencies))?|technologies(?:\s*(?:&|and|\/)\s*tools?)?|expertise|core\s*competencies|competencies|tools?\s*(?:&|and|\/)\s*technologies|key\s*skills?|programming\s*languages(?:\s*(?:&|and)\s*tools?)?)$/i,
    ],
    certifications: [
      /^(?:certifications?(?:\s*(?:&|and|\/)\s*(?:licenses?|credentials?|courses?))?|certificates?|licenses?|credentials?|courses?|trainings?)$/i,
    ],
    awards: [
      /^(?:awards?(?:\s*(?:&|and|\/)\s*(?:recognition|recognitions?|honors?|honours?|ach[ie]{2}vements?|accolades?))?|honors?(?:\s*(?:&|and|\/)\s*(?:awards?|distinctions?|recognition))?|honours?|ach[ie]{2}vements?|accolades?|recognitions?(?:\s*(?:&|and|\/)\s*ach[ie]{2}vements?)?|hackathons?|competitions?|coding\s*contests?|accomplishments?|distinctions?)$/i,
    ],
    publications: [
      /^(?:publications?(?:\s*(?:&|and|\/)\s*(?:research|papers?|patents?))?|research(?:\s*(?:&|and|\/)\s*(?:publications?|development))?|research(?:\s+papers?)?|papers?|patents?|articles?|conferences?)$/i,
    ],
    languages: [
      /^(?:languages?\s*known|languages?|language\s*skills?|spoken\s*languages?|linguistic\s*skills?)$/i,
    ],
    volunteer: [
      /^(?:volunteer(?:ing|\s*work)?(?:\s*(?:&|and|\/)\s*(?:community|leadership|service))?|community(?:\s*(?:&|and|\/)\s*volunteer(?:ing)?)?|community\s*(?:service|work)?|social\s*work|extracurricular(?:s|\s*activities)?|leadership\s*(?:activities|roles)?|clubs\s*(?:&|and)\s*societies)$/i,
    ],
    additional: [
      /^(?:additional\s*(?:information|details)?|other\s*details|interests?|hobbies|key\s*interests?|memberships?|affiliations?|speaking|talks)$/i,
    ],
    ignored: [
      /^(?:references?|declaration|disclaimer|personal\s*details|personal\s*information)$/i,
    ],
  };

  const lines = text.split("\n").map(l => l.trim());
  let currentSection: keyof ResumeSections | null = null;

  for (const line of lines) {
    if (!line) continue;

    // Clean trailing punctuation and colon
    const normalized = line.toLowerCase().replace(/[:\-–—_*#•`'"\t]+$/, "").trim();
    const wordCount = normalized.split(/\s+/).length;

    // Direct check for inline education lines: "Educational Background: Bachelor of Engineering..."
    const inlineEduMatch = line.match(/^Educational\s*Background\s*[:\t|-]+\s*(.+)$/i);
    if (inlineEduMatch) {
      sections.education.push(inlineEduMatch[1].trim());
      continue;
    }

    // Direct check for table format: "Qualification | Institute | Year of Passing"
    if (/^(?:qualifications?|degrees?)\s*\|\s*(?:institutes?|university|board)\s*\|\s*(?:years?|passing\s*year|year\s*of\s*passing)/i.test(normalized)) {
      currentSection = "education";
      sections.education.push(line);
      continue;
    }

    // Direct check for piped skill table lines: "Languages | Dot Net Core, C#..."
    if (/^(?:languages?|databases?|other\s*tools(?:\/tech)?|tools(?:\s*(?:and|&)|\/)\s*tech|project\s*mgt\.?\s*tools|source\s*control|diagramming\s*tools?|scripting(?:\/framework)?|operating\s*systems?)\s*\|/i.test(normalized)) {
      currentSection = "skills";
      sections.skills.push(line);
      continue;
    }

    // Direct check for "Significant Project(s) Developed in/into ..." or piped table headers
    if (
      /^[`'"\s]*significant\s*projects?\s*developed\s*(?:in|into)\b/i.test(line) ||
      /^organization\s*\|\s*duration\s*\|\s*role/i.test(normalized) ||
      /^project\s*title\s*\|\s*client\s*\|\s*platform\s*\|\s*role/i.test(normalized) ||
      /^assignment\s*\|\s*details\s*\|\s*responsibilities/i.test(normalized)
    ) {
      currentSection = "experience";
      sections.experience.push(line);
      continue;
    }

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
      sections.ignored.push(line);
    }
  }

  return sections;
}
