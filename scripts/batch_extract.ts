import fs from "fs";
import path from "path";
import mammoth from "mammoth";
import pdfParse from "pdf-parse";
import { parseResume } from "../lib/resumeParser";
import { extractCareerFactsFromResume } from "../lib/valueDerivationEngine";

interface ResumeAnalysisResult {
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  rawTextLength: number;
  candidateName: string;
  professionalHeadline: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  statedTotalExperience: string;
  summaryLength: number;
  rolesCount: number;
  responsibilitiesCount: number;
  measurableOutcomesCount: number;
  metricsCount: number;
  skillsCount: number;
  educationCount: number;
  certificationsCount: number;
  projectsCount: number;
  awardsCount: number;
  provenanceCount: number;
  careerFactsCount: number;
  accuracyScore: number;
  extractionStatus: "EXCELLENT" | "GOOD" | "PARTIAL" | "NEEDS_REVIEW";
  detectedSections: string[];
  warnings: string[];
  parsedData: any;
  careerFacts: any[];
}

function cleanExtractedText(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/([^\n])([•●▪▸◦])(\s*)/g, "$1\n$2 ")
    .replace(/^([•●▪▸◦])\s*/gm, "$1 ")
    .replace(/\u00A0/g, " ")
    .replace(/\t/g, " ");
}

function calculateAccuracyScore(data: any, text: string): { score: number; warnings: string[] } {
  let score = 0;
  const warnings: string[] = [];

  // 1. Identity (Max 25 pts)
  if (data.personalInfo.fullName && data.personalInfo.fullName !== "Untitled Candidate") {
    score += 8;
  } else {
    warnings.push("Candidate name could not be reliably determined.");
  }

  if (data.personalInfo.email) {
    score += 5;
  } else {
    warnings.push("Email address missing or not found in header.");
  }

  if (data.personalInfo.phone) {
    score += 4;
  } else {
    warnings.push("Phone number missing or not formatted recognizably.");
  }

  if (data.personalInfo.location) {
    score += 4;
  } else {
    warnings.push("Current location missing in header.");
  }

  if (data.personalInfo.professionalHeadline || data.personalInfo.title) {
    score += 4;
  }

  // 2. Summary & Stated Experience (Max 10 pts)
  if (data.summary && data.summary.length > 30) {
    score += 6;
  }
  if (data.personalInfo.statedTotalExperience) {
    score += 4;
  }

  // 3. Employment & Roles (Max 25 pts)
  const roles = data.workExperience || [];
  if (roles.length > 0) {
    score += 10;
    const hasCompanies = roles.every((r: any) => r.company && r.company !== "Company Name");
    const hasRoles = roles.every((r: any) => r.role && r.role !== "Software Professional" && r.role !== "Role / Position");
    const hasDates = roles.some((r: any) => r.startDate || r.endDate);

    if (hasCompanies) score += 5;
    else warnings.push("One or more employers could not be isolated.");

    if (hasRoles) score += 5;
    else warnings.push("One or more job titles defaulted to generic role.");

    if (hasDates) score += 5;
  } else {
    warnings.push("No distinct work experience roles detected.");
  }

  // 4. Responsibilities vs Outcomes & Metrics (Max 20 pts)
  let totalResps = 0;
  let totalOutcomes = 0;
  let totalMetrics = 0;

  for (const r of roles) {
    totalResps += (r.responsibilities || []).length;
    totalOutcomes += (r.measurableOutcomes || []).length;
    totalMetrics += (r.metricsBreakdown || []).length;
  }

  if (totalResps > 0) score += 7;
  if (totalOutcomes > 0) score += 7;
  if (totalMetrics > 0) score += 6;

  // 5. Skills & Tools (Max 10 pts)
  const skillsCount = (data.skills?.technical || []).length;
  if (skillsCount >= 10) score += 10;
  else if (skillsCount >= 5) score += 7;
  else if (skillsCount >= 1) score += 4;
  else warnings.push("Skills section was sparse or missing.");

  // 6. Education & Certifications (Max 10 pts)
  const eduCount = (data.education || []).length;
  const certCount = (data.certifications || []).length;
  if (eduCount > 0) score += 6;
  else warnings.push("Education qualification not isolated.");

  if (certCount > 0) score += 4;

  return { score: Math.min(100, score), warnings };
}

async function runBatch() {
  const resumeDir = path.resolve("resume");
  const files = fs.readdirSync(resumeDir);
  console.log(`Starting batch extraction on ${files.length} resumes in ${resumeDir}...\n`);

  const results: ResumeAnalysisResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(resumeDir, file);
    const ext = path.extname(file).toLowerCase();
    const stats = fs.statSync(filePath);

    console.log(`[${i + 1}/${files.length}] Processing: ${file} (${(stats.size / 1024).toFixed(1)} KB)...`);

    let rawText = "";

    try {
      if (ext === ".docx") {
        const buf = fs.readFileSync(filePath);
        const docxRes = await mammoth.extractRawText({ buffer: buf });
        rawText = docxRes.value || "";
      } else if (ext === ".pdf") {
        const buf = fs.readFileSync(filePath);
        const pdfRes = await pdfParse(buf);
        rawText = pdfRes.text || "";
      } else {
        console.log(`  Skipping unsupported file extension: ${ext}`);
        continue;
      }

      const cleanText = cleanExtractedText(rawText);
      const parsedData = parseResume(cleanText);

      const { score, warnings } = calculateAccuracyScore(parsedData, cleanText);

      const roles = parsedData.workExperience || [];
      let totalResps = 0;
      let totalOutcomes = 0;
      let totalMetrics = 0;
      for (const r of roles) {
        totalResps += (r.responsibilities || []).length;
        totalOutcomes += (r.measurableOutcomes || []).length;
        totalMetrics += (r.metricsBreakdown || []).length;
      }

      // Generate Career Facts
      const fakeResume = {
        id: `res-${i + 1}`,
        user_id: "batch-user",
        file_name: file,
        raw_text: cleanText,
        resume_data: parsedData,
        created_at: new Date().toISOString(),
      } as any;
      const careerFacts = extractCareerFactsFromResume(fakeResume, [], { facts: {}, interpretations: {} });

      let extractionStatus: ResumeAnalysisResult["extractionStatus"] = "EXCELLENT";
      if (score < 60) extractionStatus = "NEEDS_REVIEW";
      else if (score < 75) extractionStatus = "PARTIAL";
      else if (score < 90) extractionStatus = "GOOD";

      results.push({
        fileName: file,
        fileType: ext.replace(".", "").toUpperCase(),
        fileSizeBytes: stats.size,
        rawTextLength: cleanText.length,
        candidateName: parsedData.personalInfo.fullName,
        professionalHeadline: parsedData.personalInfo.professionalHeadline || parsedData.personalInfo.title || "",
        email: parsedData.personalInfo.email,
        phone: parsedData.personalInfo.phone,
        location: parsedData.personalInfo.location,
        linkedin: parsedData.personalInfo.linkedin,
        statedTotalExperience: parsedData.personalInfo.statedTotalExperience || "",
        summaryLength: (parsedData.summary || "").length,
        rolesCount: roles.length,
        responsibilitiesCount: totalResps,
        measurableOutcomesCount: totalOutcomes,
        metricsCount: totalMetrics,
        skillsCount: (parsedData.skills?.technical || []).length,
        educationCount: (parsedData.education || []).length,
        certificationsCount: (parsedData.certifications || []).length,
        projectsCount: (parsedData.projects || []).length,
        awardsCount: (parsedData.awards || []).length,
        provenanceCount: (parsedData.provenance || []).length,
        careerFactsCount: careerFacts.length,
        accuracyScore: score,
        extractionStatus,
        detectedSections: parsedData.documentMetadata?.sectionsDetected || [],
        warnings,
        parsedData,
        careerFacts,
      });

      console.log(`  -> Candidate: ${parsedData.personalInfo.fullName} | Score: ${score}% (${extractionStatus}) | Roles: ${roles.length} | Facts: ${careerFacts.length}`);
    } catch (err: any) {
      console.error(`  -> ERROR parsing ${file}:`, err.message);
      results.push({
        fileName: file,
        fileType: ext.replace(".", "").toUpperCase(),
        fileSizeBytes: stats.size,
        rawTextLength: 0,
        candidateName: "PARSING_FAILED",
        professionalHeadline: "",
        email: "",
        phone: "",
        location: "",
        linkedin: "",
        statedTotalExperience: "",
        summaryLength: 0,
        rolesCount: 0,
        responsibilitiesCount: 0,
        measurableOutcomesCount: 0,
        metricsCount: 0,
        skillsCount: 0,
        educationCount: 0,
        certificationsCount: 0,
        projectsCount: 0,
        awardsCount: 0,
        provenanceCount: 0,
        careerFactsCount: 0,
        accuracyScore: 0,
        extractionStatus: "NEEDS_REVIEW",
        detectedSections: [],
        warnings: [err.message],
        parsedData: null,
        careerFacts: [],
      });
    }
  }

  const outJsonPath = path.resolve("scripts", "batch_results.json");
  fs.writeFileSync(outJsonPath, JSON.stringify(results, null, 2), "utf-8");
  console.log(`\nBatch extraction completed! Stored raw extraction results in: ${outJsonPath}`);
}

runBatch().catch(console.error);
