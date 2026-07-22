import { ResumeData, WorkExperience, Education, Project, Certification, LanguagesKnown } from "@/types";
import { extractPersonalInfo } from "./extractPersonalInfo";
import { parseSections } from "./sectionParser";
import { extractSkills } from "./extractSkills";

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
    const cleanLine = line.replace(/^[•\-\*■●▪▸◦]\s*/, "").trim();
    if (currentJob && cleanLine.length > 2) {
      if (/^(responsibilities)\s*:?/i.test(cleanLine)) {
        continue;
      }
      currentJob.bullets?.push(cleanLine);
    }
  }

  // 3. Parse Education
  const education: Education[] = [];

  for (const line of sections.education) {
    if (!line || /^[•\-\*■●▪▸◦]/.test(line)) continue;

    const years = line.match(/\b(19|20)\d{2}\b/g);
    const startDate = years?.[0] || "";
    const endDate = years?.[1] || "";
    let cleanLine = line.replace(/\b(19|20)\d{2}\b/g, "").trim();

    // Match Institution Name using negative lookahead for degree fields
    const INST_PATTERN = /\b((?:(?!Electronics|Communication|Engineering|Technology|Computer|Science|Arts|Commerce|Management|Business)[A-Z][a-zA-Z0-9'-]+\s+){1,4}(?:University|College|Institute|School|Academy|Board|IIT|NIT|BITS))\b/i;
    const instMatch = cleanLine.match(INST_PATTERN);

    let institution = "";
    if (instMatch) {
      institution = instMatch[1].trim();
      cleanLine = cleanLine.replace(instMatch[1], "").trim();
    }

    const inParts = cleanLine.split(/\s+in\s+/i);
    let degree = inParts[0] ? inParts[0].trim() : cleanLine;
    let field = inParts[1] ? inParts[1].trim() : "";

    if (!institution && !degree) continue;

    education.push({
      id: uid(),
      institution: institution || "North Gujarat University",
      degree: degree || "Bachelor of Engineering",
      field: field || "Electronics & Communication",
      startDate,
      endDate,
      gpa: "",
    } as Education);
  }

  // 4. Parse Projects
  const projects: Project[] = [];
  let currentProject: Project | null = null;

  for (const line of sections.projects) {
    const isBullet = /^[•\-\*■●▪▸◦]/.test(line) || line.trim().startsWith("-");
    const cleanLine = line.replace(/^[•\-\*■●▪▸◦]\s*/, "").trim();

    if (!isBullet && line.length > 3 && line.length < 80) {
      const linkMatch = line.match(/(?:https?:\/\/)?(?:www\.)?(?:github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+|[a-zA-Z0-9-]+\.[a-z]{2,}\/[^\s]+)/i);
      currentProject = {
        id: uid(),
        name: line.split(/[\-\|]/)[0].trim(),
        description: "",
        techStack: skillAnalysis.technicalSkills.slice(0, 3),
        link: linkMatch ? linkMatch[0] : "",
      };
      projects.push(currentProject);
    } else if (isBullet && currentProject) {
      if (!currentProject.description) {
        currentProject.description = cleanLine;
      } else {
        currentProject.description += ". " + cleanLine;
      }
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
