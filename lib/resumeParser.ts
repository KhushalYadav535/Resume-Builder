import { ResumeData, WorkExperience, Education, Project, Certification } from "@/types";
import { extractPersonalInfo } from "./extractPersonalInfo";
import { parseSections } from "./sectionParser";
import { extractSkills } from "./extractSkills";

function uid() {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Robust local parser coordinator to structure raw text into a ResumeData JSON layout.
 * Runs completely locally on the server (fast, free, rate-limit immune).
 */
export function parseResume(text: string): ResumeData {
  const personalInfo = extractPersonalInfo(text);
  const sections = parseSections(text);
  const skillAnalysis = extractSkills(text);

  // 1. Summary: Join the lines in the summary section
  const summary = sections.summary.join(" ").trim() || 
    `A motivated professional specializing in ${skillAnalysis.technicalSkills.slice(0, 3).join(", ") || "software engineering"}.`;

  // 2. Parse Work Experience
  const workExperience: WorkExperience[] = [];
  let currentJob: Partial<WorkExperience> | null = null;

  const dateRegex = /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December|Present|\d{1,2}\/\d{2,4}|\b(?:19|20)\d{2}\b)\b/i;

  for (const line of sections.experience) {
    const isBullet = /^[•\-\*■]\s*/.test(line) || line.trim().startsWith("-");
    const cleanLine = line.replace(/^[•\-\*■]\s*/, "").trim();

    if (isBullet) {
      if (!currentJob) {
        // Create a dummy job if a bullet is found before a job header
        currentJob = {
          id: uid(),
          company: "Company Name",
          role: "Professional Role",
          startDate: "",
          endDate: "",
          current: false,
          bullets: [],
        };
        workExperience.push(currentJob as WorkExperience);
      }
      currentJob.bullets?.push(cleanLine);
    } else {
      // Non-bullet line: This might be a job header (Role, Company, Dates)
      const hasDate = dateRegex.test(line);
      const parts = line.split(/\s*\|\s*|\s*-\s*|\s*,\s*|\s+at\s+/i).map(p => p.trim()).filter(Boolean);

      if (parts.length >= 2 || hasDate) {
        // Guess dates
        let datesFound: string[] = [];
        const matches = line.match(new RegExp(dateRegex, "gi"));
        if (matches) {
          datesFound = matches;
        }

        const startDate = datesFound[0] || "2022";
        const endDate = datesFound[1] || (line.toLowerCase().includes("present") ? "Present" : "2024");

        // Clean company and role from non-date parts
        const nameParts = parts.filter(p => !dateRegex.test(p));
        const role = nameParts[0] || "Professional Role";
        const company = nameParts[1] || "Company Name";

        currentJob = {
          id: uid(),
          company,
          role,
          startDate,
          endDate,
          current: endDate.toLowerCase() === "present",
          bullets: [],
        };
        workExperience.push(currentJob as WorkExperience);
      } else if (line.length > 3) {
        // If it's a short text line, append to bullets or use as job info
        if (currentJob) {
          currentJob.bullets?.push(line);
        }
      }
    }
  }

  // 3. Parse Education
  const education: Education[] = [];
  let currentEdu: Partial<Education> | null = null;

  for (const line of sections.education) {
    const parts = line.split(/\s*\|\s*|\s*-\s*|\s*,\s*/).map(p => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const institution = parts[0];
      const degree = parts[1];
      
      // Look for GPA
      const gpaMatch = line.match(/gpa\s*:?\s*(\d\.\d+)/i);
      const gpa = gpaMatch ? gpaMatch[0] : "";

      // Try guessing dates
      const years = line.match(/\b(19|20)\d{2}\b/g);
      const startDate = years?.[0] || "2018";
      const endDate = years?.[1] || "2022";

      currentEdu = {
        id: uid(),
        institution,
        degree,
        field: parts[2] || "General Studies",
        startDate,
        endDate,
        gpa,
      };
      education.push(currentEdu as Education);
    }
  }

  // 4. Parse Projects
  const projects: Project[] = [];
  for (const line of sections.projects) {
    const isBullet = /^[•\-\*■]\s*/.test(line) || line.trim().startsWith("-");
    const cleanLine = line.replace(/^[•\-\*■]\s*/, "").trim();

    if (!isBullet && line.length > 5 && line.length < 50) {
      const linkMatch = line.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+/i);
      projects.push({
        id: uid(),
        name: line.split(/[\-\|]/)[0].trim(),
        description: "Personal tech project demonstrating competency.",
        techStack: skillAnalysis.technicalSkills.slice(0, 3),
        link: linkMatch ? linkMatch[0] : "",
      });
    } else if (isBullet && projects.length > 0) {
      projects[projects.length - 1].description = cleanLine;
    }
  }

  // 5. Parse Certifications
  const certifications: Certification[] = [];
  for (const line of sections.certifications) {
    const parts = line.split(/\s*\|\s*|\s*-\s*|\s+by\s+/i).map(p => p.trim()).filter(Boolean);
    if (parts.length >= 1 && line.length > 4) {
      certifications.push({
        id: uid(),
        name: parts[0],
        issuer: parts[1] || "Professional Issuer",
        date: parts[2] || "2024",
      });
    }
  }

  // Base fallback mappings if empty
  if (education.length === 0) {
    education.push({
      id: uid(),
      institution: "Degree Institution",
      degree: "Bachelor of Science",
      field: "Relevant Domain",
      startDate: "2019",
      endDate: "2023",
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
  };
}
