import * as fs from "fs";
import * as path from "path";
import mammoth from "mammoth";
// @ts-ignore
import pdfParse from "pdf-parse";
import { parseResume } from "../lib/resumeParser";

interface TestResumeTarget {
  fileName: string;
  type: "docx" | "pdf";
  label: string;
}

const targets: TestResumeTarget[] = [
  { fileName: "Profile of Dotnet +Angular-Ankit-6+ years.docx", type: "docx", label: "Ankit (Dotnet + Angular, 6+ Yrs)" },
  { fileName: "Harmanpreet Singh - PHP - CV.docx", type: "docx", label: "Harmanpreet Singh (PHP / Web Developer)" },
  { fileName: "MahadevPatidar-ReactiNative-SSD.docx", type: "docx", label: "Mahadev Patidar (React Native / Mobile)" },
  { fileName: "Resume_Ashvini_Patil_22.pdf", type: "pdf", label: "Ashvini Patil (Frontend / Angular Developer - PDF)" },
  { fileName: "Sammed-Dotnet-9+ Years (1).docx", type: "docx", label: "Sammed (Dotnet Lead, 9+ Yrs)" },
];

async function runDiverseTest() {
  console.log("================================================================================");
  console.log("  MULTI-RESUME DIVERSE EXTRACTION AUDIT");
  console.log("  Testing resumes across diverse styles, technologies (.NET, PHP, React Native, Angular),");
  console.log("  and document types (Word XML tables vs PDF streams).");
  console.log("================================================================================\n");

  const results: any[] = [];

  for (const t of targets) {
    const fullPath = path.join(__dirname, "../resume", t.fileName);
    if (!fs.existsSync(fullPath)) {
      console.log(`[SKIP] File not found: ${t.fileName}`);
      continue;
    }

    const buf = fs.readFileSync(fullPath);
    let rawText = "";

    const t0 = Date.now();
    if (t.type === "docx") {
      const docx = await mammoth.extractRawText({ buffer: buf });
      rawText = docx.value;
    } else {
      const pdf = await pdfParse(buf);
      rawText = pdf.text;
    }

    const data = parseResume(rawText, t.type);
    const parseTime = Date.now() - t0;

    const summary = {
      label: t.label,
      fileName: t.fileName,
      parseTimeMs: parseTime,
      candidateName: data.personalInfo.fullName,
      headline: data.personalInfo.professionalHeadline || data.personalInfo.title || "N/A",
      email: data.personalInfo.email || "N/A",
      phone: data.personalInfo.phone || "N/A",
      location: data.personalInfo.location || "N/A",
      totalExperience: data.personalInfo.statedTotalExperience || "N/A",
      educationCount: data.education.length,
      educations: data.education.map(e => `${e.degree}${e.institution ? ` (${e.institution})` : ""}`),
      employersCount: data.workExperience.length,
      employers: data.workExperience.map(w => ({
        company: w.company,
        role: w.role,
        dates: `${w.startDate || "N/A"} to ${w.endDate || "Present"}`
      })),
      projectsCount: data.projects.length,
      projectNames: data.projects.map(p => p.name).slice(0, 5),
      technicalSkillsCount: data.skills.technical.length,
      topSkills: data.skills.technical.slice(0, 10).join(", ")
    };

    results.push(summary);

    console.log(`--------------------------------------------------------------------------------`);
    console.log(`Candidate: ${summary.candidateName}  [${t.label}]`);
    console.log(`File:      ${t.fileName} (${t.type.toUpperCase()}) | Parse Time: ${parseTime}ms`);
    console.log(`--------------------------------------------------------------------------------`);
    console.log(`- Headline:    ${summary.headline}`);
    console.log(`- Contact:     Email: ${summary.email} | Phone: ${summary.phone} | Loc: ${summary.location}`);
    console.log(`- Experience:  Stated: ${summary.totalExperience} | Verified Roles: ${summary.employersCount}`);
    
    console.log(`- Employers:`);
    summary.employers.forEach((emp, i) => {
      console.log(`    [Role ${i + 1}] ${emp.company} | ${emp.role} | ${emp.dates}`);
    });

    console.log(`- Education (${summary.educationCount}): ${summary.educations.join(" | ") || "None extracted"}`);
    console.log(`- Projects (${summary.projectsCount}):  ${summary.projectNames.join(", ")}${summary.projectsCount > 5 ? "..." : ""}`);
    console.log(`- Skills (${summary.technicalSkillsCount}):    ${summary.topSkills}`);
    console.log("");
  }

  console.log("================================================================================");
  console.log("  SUMMARY AUDIT REPORT");
  console.log("================================================================================");
  console.table(results.map(r => ({
    "Candidate": r.candidateName,
    "Format": r.fileName.endsWith(".pdf") ? "PDF" : "DOCX",
    "Employers": r.employersCount,
    "Projects": r.projectsCount,
    "Education": r.educationCount,
    "Skills": r.technicalSkillsCount,
    "Time(ms)": r.parseTimeMs
  })));
}

runDiverseTest();
