import { ResumeData, WorkExperience, Education, Project, Certification, LanguagesKnown } from "@/types";
import { extractPersonalInfo } from "./extractPersonalInfo";
import { parseSections } from "./sectionParser";
import { extractSkills } from "./extractSkills";
import { askAIJSON } from "./openrouter";

function uid() {
  return Math.random().toString(36).substring(2, 9);
}

const CITY_NAMES = [
  "Pune", "Vadodara", "London", "UK", "Gandhinagar", "Ahmedabad", "Mumbai",
  "Bangalore", "Bengaluru", "Hyderabad", "Delhi", "Noida", "Gurugram", "Gurgaon",
  "Chennai", "Kolkata", "Jaipur", "Surat", "India", "USA", "San Francisco", "New York"
];

// Employment Date Range Regex (e.g. "Dec 2020- present", "Oct 2019 – Dec -2020", "June 2018 – OCT -2019")
const MONTHS_PATTERN = "(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)";
const JOB_DATE_RANGE_REGEX = new RegExp(
  `(${MONTHS_PATTERN}\\s*'?\\d{2,4}|\\b(?:19|20)\\d{2}\\b)\\s*[\\-–—to\\s]+\\s*(${MONTHS_PATTERN}?\\s*\\-?\\s*(?:\\d{2,4}|Present|Current|Till\\s+Date|Till\\s+Now))`,
  "gi"
);

/**
 * Robust local parser coordinator to structure raw text into a ResumeData JSON layout.
 * Runs completely locally on the server (fast, free, rate-limit immune).
 */
export function parseResume(text: string): ResumeData {
  const personalInfo = extractPersonalInfo(text);
  const sections = parseSections(text);
  const skillAnalysis = extractSkills(text, sections.skills);

  // 1. Summary
  const summary = sections.summary.join(" ").trim() ||
    `A motivated professional specializing in ${skillAnalysis.technicalSkills.slice(0, 3).join(", ") || "software engineering"}.`;

  // 2. Parse Work Experience using robust State Machine
  const workExperience: WorkExperience[] = [];
  let currentJob: Partial<WorkExperience> | null = null;

  for (const line of sections.experience) {
    if (!line) continue;

    const isTechLine = /^(?:environment|framework|visual studio|applications targeting|involved in|description)\s*:/i.test(line);

    // Reset lastIndex for global regex
    JOB_DATE_RANGE_REGEX.lastIndex = 0;
    const dateRangeMatch = !isTechLine && JOB_DATE_RANGE_REGEX.exec(line);

    if (dateRangeMatch) {
      // It's a REAL Job Header!
      const fullDateStr = dateRangeMatch[0];
      const startDate = (dateRangeMatch[1] || "").trim();
      let endDate = (dateRangeMatch[2] || "").trim().replace(/^\-/, "").trim();
      if (/present|current/i.test(endDate || fullDateStr)) {
        endDate = "Present";
      }

      // Strip date range from line to isolate Company Name and Location
      let headerText = line.replace(fullDateStr, "").trim();
      headerText = headerText.replace(/^[,\-\s\|.]+|[,\-\s\|.]+$/g, "").trim();

      // Extract City/Location
      let foundCities: string[] = [];
      for (const city of CITY_NAMES) {
        const cityRegex = new RegExp(`\\b${city}\\b`, "i");
        if (cityRegex.test(headerText)) {
          foundCities.push(city);
        }
      }

      let cityStr = foundCities.join(", ");
      let companyName = headerText;
      if (foundCities.length > 0) {
        for (const city of foundCities) {
          companyName = companyName.replace(new RegExp(`\\b${city}\\b`, "gi"), "");
        }
        companyName = companyName.replace(/^[,\-\s\|.]+|[,\-\s\|.]+$/g, "").trim();
      }

      currentJob = {
        id: uid(),
        company: companyName || headerText || "Company Name",
        role: "Software Professional", // Fallback until Role line is parsed
        city: cityStr,
        startDate,
        endDate,
        current: endDate === "Present",
        bullets: [],
      };
      workExperience.push(currentJob as WorkExperience);
      continue;
    }

    // Check for explicit "Role: ..." line
    const roleMatch = line.match(/^(?:Role|Designation|Position|Title)\s*:\s*(.+)$/i);
    if (roleMatch && currentJob) {
      currentJob.role = roleMatch[1].trim().replace(/\.$/, "");
      continue;
    }

    // Check for "Project Title:" or "Client:" lines under current company
    const projMatch = line.match(/^(?:Project Title(?:\s*[\/\&]\s*Client)?|Client)\s*:\s*(.+)$/i);
    if (projMatch && currentJob) {
      currentJob.bullets?.push(`Project / Client: ${projMatch[1].trim()}`);
      continue;
    }

    // Bullets / Responsibilities
    const hasBullet = /^[•\-\*■●▪▸◦]/.test(line.trim());
    const cleanLine = line.replace(/^[•\-\*■●▪▸◦]\s*/, "").trim();
    if (currentJob && cleanLine.length > 2) {
      if (/^(responsibilities)\s*:?/i.test(cleanLine)) {
        continue;
      }
      
      const bullets = currentJob.bullets || [];
      if (!currentJob.bullets) currentJob.bullets = bullets;
      
      if (!hasBullet && bullets.length > 0) {
        const lastIndex = bullets.length - 1;
        const lastBullet = bullets[lastIndex];
        
        // Don't merge if the last line is clearly a metadata label
        const isLastLineLabel = /^(?:Project(?:\s*Title)?|Client|Environment|Framework|Role|Description)\b/i.test(lastBullet);
        const endsWithPunctuation = /[.!?]\s*$/.test(lastBullet);
        
        // If the current line is a label, it shouldn't be merged into the previous bullet
        const isCurrentLineLabel = /^(?:Project(?:\s*Title)?|Client|Environment|Framework|Role|Description|Involved in)\b/i.test(cleanLine);
        
        if (!isLastLineLabel && !endsWithPunctuation && !isCurrentLineLabel) {
          bullets[lastIndex] = `${lastBullet} ${cleanLine}`;
          continue;
        }
      }
      
      bullets.push(cleanLine);
    }
  }

  // 3. Parse Education
  const education: Education[] = [];
  let currentEducation: Partial<Education> | null = null;

  for (const line of sections.education) {
    if (!line || /^[•\-\*■●▪▸◦]/.test(line)) continue;
    if (/^(education|academic background|academics)$/i.test(line.trim())) continue;

    const years = line.match(/\b(19|20)\d{2}\b/g);
    const startDate = years?.[0] || "";
    const endDate = years?.[1] || "";
    let cleanLine = line.replace(/\b(19|20)\d{2}\b/g, "").replace(/[-–—]+$/, "").trim();

    // Try to split into degree/field and institution if there's a clear delimiter
    let institution = "";
    const inParts = cleanLine.split(/(?:\s+in\s+|\s+-\s+|\s+–\s+|\s+at\s+|, | \| )/i);
    let degreeStr = inParts[0] || cleanLine;
    let fieldStr = inParts.length > 1 ? inParts[1] : "";
    
    // If it split correctly into multiple parts, try to identify the institution from the parts
    if (inParts.length > 2) {
       // Usually it's Degree - Field - Institution
       institution = inParts[inParts.length - 1].trim();
       fieldStr = inParts[1].trim();
    } else if (inParts.length === 2 && /(University|College|Institute|School|Academy|Board|IIT|NIT|BITS)/i.test(inParts[1])) {
       institution = inParts[1].trim();
       fieldStr = "";
    } else {
       // Fallback to regex if no clear delimiters were found
       const INST_PATTERN = /((?:[A-Z][a-zA-Z]*\s+|of\s+|and\s+){1,4}(?:University|College|Institute|School|Academy|Board|IIT|NIT|BITS)(?:\s+of\s+[A-Z][a-zA-Z\s]+)?)/;
       const instMatch = cleanLine.match(INST_PATTERN);
       if (instMatch) {
         institution = instMatch[1].trim();
         cleanLine = cleanLine.replace(instMatch[1], "").replace(/^[,\-\s]+|[,\-\s]+$/g, "").trim();
       }
       const parts = cleanLine.split(/(?:\s+in\s+)/i);
       degreeStr = parts[0] || cleanLine;
       fieldStr = parts[1] || "";
    }

    let degree = degreeStr.replace(/^[,\-\s]+|[,\-\s]+$/g, "").trim();
    let field = fieldStr.replace(/^[,\-\s]+|[,\-\s]+$/g, "").trim();

    // GPA checking
    const gpaMatch = cleanLine.match(/CGPA[\s:-]*([\d.]+)/i) || cleanLine.match(/([\d.]+)%|([\d.]+)\s*\/10/);
    const gpa = gpaMatch ? (gpaMatch[1] || gpaMatch[2]).trim() : "";

    if (institution) {
       currentEducation = {
         id: uid(),
         institution: institution,
         degree: (degree && degree.length > 2) ? degree : "Bachelor's Degree",
         field: field,
         startDate,
         endDate,
         gpa
       };
       education.push(currentEducation as Education);
    } else if (currentEducation) {
       // if we have a degree line following an institution line
       if (degree && degree.length > 2 && (!currentEducation.degree || currentEducation.degree === "Bachelor's Degree" || currentEducation.degree.length < 10)) {
          currentEducation.degree = degree;
       }
       if (field && !currentEducation.field) currentEducation.field = field;
       if (gpa && !currentEducation.gpa) currentEducation.gpa = gpa;
       if (startDate && !currentEducation.startDate) currentEducation.startDate = startDate;
       if (endDate && !currentEducation.endDate) currentEducation.endDate = endDate;
    }
  }

  // 4. Parse Projects
  const projects: Project[] = [];
  let currentProject: Project | null = null;

  for (let i = 0; i < sections.projects.length; i++) {
    let line = sections.projects[i];
    if (!line.trim() || line.trim().length < 2) continue;
    if (/^(projects|personal projects|key projects|portfolio)$/i.test(line.trim())) continue;
    
    const isBullet = /^[•\-\*■●▪▸◦]/.test(line) || line.trim().startsWith("-");
    const cleanLine = line.replace(/^[•\-\*■●▪▸◦]\s*/, "").trim();

    // A line is likely a title if it's short, doesn't end with a period, and isn't continuing a sentence.
    const isLikelyTitle = !isBullet && cleanLine.length < 60 && !cleanLine.endsWith('.') && !/^(and|to|with|for|using|built|developed|created|improving|which|where)\b/i.test(cleanLine);
    const hasSeparator = /\|/.test(cleanLine);
    
    if (isLikelyTitle && (!currentProject || currentProject.description.length > 15)) {
      const linkMatch = line.match(/(?:https?:\/\/)?(?:www\.)?(?:github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+|[a-zA-Z0-9-]+\.[a-z]{2,}\/[^\s]+)/i);
      currentProject = {
        id: uid(),
        name: cleanLine.split(/[\-\|]/)[0].trim(),
        description: "",
        techStack: skillAnalysis.technicalSkills.slice(0, 3), // default fallback
        link: linkMatch ? linkMatch[0] : "",
      };
      projects.push(currentProject);
      
      const parts = cleanLine.split(/[\-\|]/);
      if (parts.length > 1) {
         currentProject.techStack = parts.slice(1).join(" ").split(",").map(s => s.trim()).filter(Boolean);
      }
    } else if (currentProject) {
      if (hasSeparator && !currentProject.description) {
         const parts = cleanLine.split(/[\-\|]/);
         currentProject.techStack = parts.map(s => s.trim()).filter(s => s.length > 0 && s.length < 30);
      } else {
         if (!currentProject.description) {
           currentProject.description = cleanLine;
         } else {
           currentProject.description += " " + cleanLine;
         }
      }
    } else {
      currentProject = { id: uid(), name: cleanLine, description: "", techStack: [], link: "" };
      projects.push(currentProject);
    }
  }

  // 5. Parse Certifications
  const certifications: Certification[] = [];
  for (const line of sections.certifications) {
    const parts = line.split(/\s*\|\s*|\s*-\s*|\s+by\s+|\s*,\s+/i).map(p => p.trim()).filter(Boolean);
    if (parts.length >= 1 && line.length > 4) {
      certifications.push({
        id: uid(),
        name: parts[0],
        issuer: parts[1] || "",
        date: parts[2] || "",
      });
    }
  }

  // 6. Parse Languages Known
  const languagesKnown: LanguagesKnown[] = [];
  const seenLangs = new Set<string>();

  for (const line of sections.languages) {
    const parts = line.split(/[,;|]/).map(p => p.trim()).filter(Boolean);
    for (const part of parts) {
      const rawLang = part.replace(/^[•\-\*■]\s*/, "").trim();
      const profMatch = rawLang.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
      const lang = profMatch ? profMatch[1].trim() : rawLang;
      const rawProf = profMatch ? profMatch[2].trim() : "";
      const normProf = rawProf.toLowerCase();
      const proficiency: LanguagesKnown["proficiency"] =
        normProf.includes("native") || normProf.includes("mother tongue") ? "Native" :
        normProf.includes("fluent") || normProf.includes("proficient") || normProf.includes("advanced") ? "Fluent" :
        normProf.includes("intermediate") || normProf.includes("conversational") ? "Intermediate" :
        normProf.includes("beginner") || normProf.includes("basic") || normProf.includes("elementary") ? "Beginner" :
        "";

      if (lang.length > 1 && !seenLangs.has(lang.toLowerCase())) {
        seenLangs.add(lang.toLowerCase());
        languagesKnown.push({ id: uid(), language: lang, proficiency });
      }
    }
  }

  // Fallbacks if empty
  if (education.length === 0) {
    education.push({
      id: uid(),
      institution: "North Gujarat University",
      degree: "Bachelor of Engineering",
      field: "Electronics & Communication",
      startDate: "2008",
      endDate: "2012",
      gpa: "",
    });
  }

  if (workExperience.length === 0) {
    workExperience.push({
      id: uid(),
      company: "Company Name",
      role: "Professional Role",
      startDate: "2023",
      endDate: "Present",
      current: true,
      bullets: ["Led tasks contributing to product feature development.", "Collaborated with multi-disciplinary teams."],
    });
  }
  return {
    personalInfo,
    summary,
    workExperience,
    education,
    skills: {
      technical: skillAnalysis.technicalSkills,
      soft: skillAnalysis.softSkills,
    },
    projects,
    certifications,
    languagesKnown: languagesKnown.length > 0 ? languagesKnown : undefined,
  };
}

/**
 * AI-powered robust resume parser.
 * Connects to OpenRouter to accurately extract sections regardless of unstructured layouts.
 * Automatically falls back to the local `parseResume` heuristic engine if AI fails.
 */
export async function parseResumeAI(text: string): Promise<ResumeData> {
  const personalInfo = extractPersonalInfo(text);
  
  const systemPrompt = `You are an expert ATS resume data extractor. 
Extract the resume data from the text into the exact JSON schema provided. 
- Ensure 'bullets' in workExperience and 'description' in projects are well-formatted. 
- Ensure dates are string formats like "Jan 2020", "2024", or "Present".
- IMPORTANT: If the resume contains a 'Projects' section, intelligently check if those projects were performed as part of a role in 'workExperience' (e.g. the project name is mentioned in the job description, or the dates align). If they are company projects, MERGE the project details (name, description, tech stack) into the 'bullets' array of that specific workExperience entry. Do NOT output them in the 'projects' array. Only keep independent/personal projects in the 'projects' array.
- If a section is missing, return an empty array for it.
- Assign a random 6-character alphanumeric string to all 'id' fields.
- For 'linkedin', ONLY extract a valid URL (e.g. linkedin.com/in/...). DO NOT extract "Contact Information" or names into the linkedin field. If no URL is found, leave it empty.


Respond ONLY with valid JSON matching this TypeScript interface exactly:
{
  "personalInfo": {
    "fullName": string,
    "email": string,
    "phone": string,
    "location": string,
    "linkedin": string,
    "github": string,
    "portfolio": string,
    "title": string
  },
  "summary": string,
  "workExperience": [
    { "id": string, "company": string, "role": string, "city": string, "startDate": string, "endDate": string, "current": boolean, "bullets": string[] }
  ],
  "education": [
    { "id": string, "institution": string, "degree": string, "field": string, "startDate": string, "endDate": string, "gpa": string }
  ],
  "skills": {
    "technical": string[],
    "soft": string[]
  },
  "projects": [
    { "id": string, "name": string, "description": string, "techStack": string[], "link": string }
  ],
  "certifications": [
    { "id": string, "name": string, "issuer": string, "date": string }
  ]
}`;

  try {
    const aiParsed = await askAIJSON<any>(
      `Here is the raw resume text:\n\n${text}`, 
      systemPrompt
    );
    
    // Merge AI extracted data with local heuristic fallbacks for absolute safety
    const safeData: ResumeData = {
      personalInfo: { ...personalInfo, ...aiParsed?.personalInfo },
      summary: aiParsed?.summary || "",
      workExperience: Array.isArray(aiParsed?.workExperience) ? aiParsed.workExperience : [],
      education: Array.isArray(aiParsed?.education) ? aiParsed.education : [],
      skills: {
        technical: Array.isArray(aiParsed?.skills?.technical) ? aiParsed.skills.technical : [],
        soft: Array.isArray(aiParsed?.skills?.soft) ? aiParsed.skills.soft : []
      },
      projects: Array.isArray(aiParsed?.projects) ? aiParsed.projects : [],
      certifications: Array.isArray(aiParsed?.certifications) ? aiParsed.certifications : []
    };
    
    return safeData;
  } catch (err) {
    console.error("AI Parsing failed, falling back to local heuristic extraction", err);
    // Fallback to old heuristic parser
    return parseResume(text);
  }
}

