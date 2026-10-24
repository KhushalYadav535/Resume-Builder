import fs from "fs";
import path from "path";
import { parseResume } from "../lib/resumeParser";
import { extractCareerFactsFromResume } from "../lib/valueDerivationEngine";

interface RawTextEntry {
  file_name: string;
  file_type: string;
  file_size_bytes: number;
  text: string;
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

function evaluateAccuracy(data: any, text: string) {
  let score = 0;
  const warnings: string[] = [];
  const strengths: string[] = [];

  // 1. Identity (25 pts)
  const isNameGood = data.personalInfo.fullName && data.personalInfo.fullName !== "Untitled Candidate" && data.personalInfo.fullName.length > 2;
  if (isNameGood) {
    score += 8;
    strengths.push(`Identified candidate name: "${data.personalInfo.fullName}"`);
  } else {
    warnings.push("Candidate name missing or defaulted to Untitled.");
  }

  const rawHasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
  const rawHasPhone = /(?:\+?\d{1,3}[\s\-.]?)?(?:\(?\d{3}\)?[\s\-.]?){1,2}\d{4}|\b\d{10}\b/.test(text);
  const rawHasLocation = /(?:pune|mumbai|bangalore|hyderabad|chennai|delhi|noida|gurgaon|ahmedabad|kolkata|indore|jaipur|chandigarh|vadodara|london|usa|uk)\b/i.test(text);

  if (data.personalInfo.email) {
    score += 5;
    strengths.push(`Captured email: "${data.personalInfo.email}"`);
  } else if (!rawHasEmail) {
    score += 5;
    warnings.push("Email address redacted by staffing agency / absent in source (QA018 compliance).");
  } else {
    warnings.push("Email address present in source document but missed by parser.");
  }

  if (data.personalInfo.phone) {
    score += 4;
    strengths.push(`Captured phone: "${data.personalInfo.phone}"`);
  } else if (!rawHasPhone) {
    score += 4;
    warnings.push("Phone number redacted by staffing agency / absent in source (QA018 compliance).");
  } else {
    warnings.push("Phone number missing or unrecognized format.");
  }

  if (data.personalInfo.location) {
    score += 4;
    strengths.push(`Identified location: "${data.personalInfo.location}"`);
  } else if (!rawHasLocation) {
    score += 4;
    warnings.push("Location not specified in source document (QA018 compliance).");
  } else {
    warnings.push("Current location missing in contact area.");
  }

  if (data.personalInfo.professionalHeadline || data.personalInfo.title) {
    score += 4;
    strengths.push(`Headline extracted: "${data.personalInfo.professionalHeadline || data.personalInfo.title}"`);
  }

  // 2. Summary & Stated Exp (10 pts)
  if (data.summary && data.summary.length > 30) {
    score += 6;
  }
  if (data.personalInfo.statedTotalExperience) {
    score += 4;
    strengths.push(`Stated total experience: "${data.personalInfo.statedTotalExperience}"`);
  }

  // 3. Employment & Roles (25 pts)
  const roles = data.workExperience || [];
  if (roles.length > 0) {
    score += 10;
    const hasCompanies = roles.every((r: any) => r.company && r.company !== "Company Name");
    const hasTitles = roles.every((r: any) => r.role && r.role !== "Software Professional" && r.role !== "Role / Position");
    const hasDates = roles.some((r: any) => r.startDate || r.endDate);

    if (hasCompanies) score += 5;
    else warnings.push("Some employer names could not be cleanly separated.");

    if (hasTitles) score += 5;
    else warnings.push("Some job titles defaulted to generic roles.");

    if (hasDates) score += 5;
    strengths.push(`Extracted ${roles.length} employment role(s).`);
  } else {
    warnings.push("No distinct employment roles isolated.");
  }

  // 4. Responsibilities & Outcomes (15 pts)
  let totalResps = 0;
  let totalOutcomes = 0;
  let totalMetrics = 0;

  for (const r of roles) {
    totalResps += (r.responsibilities || []).length;
    totalOutcomes += (r.measurableOutcomes || []).length;
    totalMetrics += (r.metricsBreakdown || []).length;
  }

  if (totalResps > 0) {
    score += 8;
    strengths.push(`${totalResps} core operational responsibilities isolated.`);
  } else {
    warnings.push("No operational responsibility statements detected.");
  }

  if (totalOutcomes > 0) {
    score += 7;
    strengths.push(`${totalOutcomes} measurable business outcomes isolated.`);
  }

  // 5. Metrics & Leadership Scope (10 pts)
  if (totalMetrics > 0) {
    score += 6;
    strengths.push(`${totalMetrics} granular metrics extracted (scale, percent, or efficiency).`);
  }
  const hasScope = roles.some((r: any) => r.teamSize || r.leadershipScope?.teamSize || r.leadershipScope?.crossFunctionalTeams?.length);
  if (hasScope) {
    score += 4;
    strengths.push("Leadership / team scope detected.");
  }

  // 6. Skills (10 pts)
  const skillsCount = (data.skills?.technical || []).length;
  if (skillsCount >= 8) {
    score += 10;
    strengths.push(`${skillsCount} technical skills cataloged.`);
  } else if (skillsCount >= 4) {
    score += 7;
    strengths.push(`${skillsCount} technical skills cataloged.`);
  } else if (skillsCount >= 1) {
    score += 4;
  } else {
    warnings.push("Skills section was empty or not recognized.");
  }

  // 7. Education & Certs (5 pts)
  const eduCount = (data.education || []).length;
  const certCount = (data.certifications || []).length;
  if (eduCount > 0) score += 3;
  if (certCount > 0) score += 2;

  const finalScore = Math.min(100, Math.max(0, score));
  let status: "EXCELLENT" | "GOOD" | "PARTIAL" | "NEEDS_REVIEW" = "EXCELLENT";
  if (finalScore < 60) status = "NEEDS_REVIEW";
  else if (finalScore < 75) status = "PARTIAL";
  else if (finalScore < 90) status = "GOOD";

  return {
    score: finalScore,
    status,
    warnings,
    strengths,
    totalResps,
    totalOutcomes,
    totalMetrics,
    skillsCount,
    eduCount,
    certCount,
  };
}

async function main() {
  const rawPath = path.resolve("scripts", "raw_texts.json");
  const rawData: Record<string, RawTextEntry> = JSON.parse(fs.readFileSync(rawPath, "utf-8"));
  const filenames = Object.keys(rawData);

  console.log(`Processing ${filenames.length} resumes through UpRole Master Extraction Engine...\n`);

  const summaryRows: any[] = [];
  const identityRows: any[] = [];
  const rolesRows: any[] = [];
  const bulletRows: any[] = [];
  const metricsRows: any[] = [];
  const skillsRows: any[] = [];
  const educationRows: any[] = [];
  const auditRows: any[] = [];

  filenames.forEach((fn, idx) => {
    const entry = rawData[fn];
    const cleanText = cleanExtractedText(entry.text);
    const parsed = parseResume(cleanText);

    const evalRes = evaluateAccuracy(parsed, cleanText);

    // Derive facts
    const fakeResume = {
      id: `resume-${idx + 1}`,
      user_id: `user-${idx + 1}`,
      file_name: fn,
      raw_text: cleanText,
      resume_data: parsed,
      created_at: new Date().toISOString(),
    } as any;
    const careerFacts = extractCareerFactsFromResume(fakeResume, [], { facts: {}, interpretations: {} });

    console.log(`[${idx + 1}/${filenames.length}] ${fn} -> ${parsed.personalInfo.fullName} | ${evalRes.score}% (${evalRes.status}) | Roles: ${parsed.workExperience.length} | Facts: ${careerFacts.length}`);

    // 1. Summary row
    summaryRows.push({
      resume_id: `RES_${String(idx + 1).padStart(3, "0")}`,
      file_name: fn,
      file_type: entry.file_type,
      file_size_kb: (entry.file_size_bytes / 1024).toFixed(1),
      candidate_name: parsed.personalInfo.fullName,
      headline: parsed.personalInfo.professionalHeadline || parsed.personalInfo.title || "",
      stated_experience: parsed.personalInfo.statedTotalExperience || "",
      roles_count: parsed.workExperience.length,
      responsibilities_count: evalRes.totalResps,
      outcomes_count: evalRes.totalOutcomes,
      metrics_count: evalRes.totalMetrics,
      skills_count: evalRes.skillsCount,
      education_count: evalRes.eduCount,
      certifications_count: evalRes.certCount,
      provenance_count: (parsed.provenance || []).length,
      career_facts_count: careerFacts.length,
      accuracy_percentage: evalRes.score,
      quality_status: evalRes.status,
      warnings_count: evalRes.warnings.length,
    });

    // 2. Identity row
    identityRows.push({
      resume_id: `RES_${String(idx + 1).padStart(3, "0")}`,
      candidate_name: parsed.personalInfo.fullName,
      headline: parsed.personalInfo.professionalHeadline || parsed.personalInfo.title || "",
      email: parsed.personalInfo.email,
      phone: parsed.personalInfo.phone,
      location: parsed.personalInfo.location,
      linkedin: parsed.personalInfo.linkedin,
      stated_experience: parsed.personalInfo.statedTotalExperience || "",
      summary: parsed.summary,
    });

    // 3. Roles rows
    parsed.workExperience.forEach((w, rIdx) => {
      rolesRows.push({
        resume_id: `RES_${String(idx + 1).padStart(3, "0")}`,
        candidate_name: parsed.personalInfo.fullName,
        role_number: rIdx + 1,
        company: w.company,
        job_title: w.role,
        start_date: w.startDate,
        end_date: w.endDate,
        is_current_role: w.current,
        work_location: w.city || "",
        team_size: w.teamSize || w.leadershipScope?.teamSize || "",
        cross_functional_teams: (w.leadershipScope?.crossFunctionalTeams || []).join(", "),
        responsibilities_count: (w.responsibilities || []).length,
        outcomes_count: (w.measurableOutcomes || []).length,
        metrics_count: (w.metricsBreakdown || []).length,
      });

      // 4. Bullets (responsibilities vs outcomes)
      (w.responsibilities || []).forEach(resp => {
        bulletRows.push({
          resume_id: `RES_${String(idx + 1).padStart(3, "0")}`,
          candidate_name: parsed.personalInfo.fullName,
          company: w.company,
          job_title: w.role,
          type: "Responsibility (Operational Duty)",
          bullet_text: resp,
        });
      });

      (w.measurableOutcomes || []).forEach(outc => {
        bulletRows.push({
          resume_id: `RES_${String(idx + 1).padStart(3, "0")}`,
          candidate_name: parsed.personalInfo.fullName,
          company: w.company,
          job_title: w.role,
          type: "Measurable Outcome (Quantified Result)",
          bullet_text: outc,
        });
      });

      // 5. Metrics rows
      (w.metricsBreakdown || []).forEach(m => {
        metricsRows.push({
          resume_id: `RES_${String(idx + 1).padStart(3, "0")}`,
          candidate_name: parsed.personalInfo.fullName,
          company: w.company,
          metric_name: m.name || "general",
          value: m.value ?? "",
          unit: m.unit || "",
          baseline: m.baseline ?? "",
          result: m.result ?? "",
          original_text: m.originalValueText,
        });
      });
    });

    // 6. Skills rows
    (parsed.skills?.technical || []).forEach(sk => {
      skillsRows.push({
        resume_id: `RES_${String(idx + 1).padStart(3, "0")}`,
        candidate_name: parsed.personalInfo.fullName,
        skill_name: sk,
        category: "Technical",
        proficiency: "null (not stated in source)",
      });
    });

    // 7. Education rows
    parsed.education.forEach(ed => {
      educationRows.push({
        resume_id: `RES_${String(idx + 1).padStart(3, "0")}`,
        candidate_name: parsed.personalInfo.fullName,
        degree: ed.degree,
        institution: ed.institution,
        completion_year: ed.endDate || ed.startDate || "",
      });
    });

    parsed.certifications.forEach(cert => {
      educationRows.push({
        resume_id: `RES_${String(idx + 1).padStart(3, "0")}`,
        candidate_name: parsed.personalInfo.fullName,
        degree: `[Certification] ${cert.name}`,
        institution: cert.issuer,
        completion_year: cert.date,
      });
    });

    // 8. Audit rows
    auditRows.push({
      resume_id: `RES_${String(idx + 1).padStart(3, "0")}`,
      candidate_name: parsed.personalInfo.fullName,
      accuracy_score: `${evalRes.score}%`,
      status: evalRes.status,
      strengths: evalRes.strengths.join(" | "),
      warnings: evalRes.warnings.length > 0 ? evalRes.warnings.join(" | ") : "Zero warnings — complete extraction",
    });
  });

  const fullResults = {
    summaryRows,
    identityRows,
    rolesRows,
    bulletRows,
    metricsRows,
    skillsRows,
    educationRows,
    auditRows,
  };

  const outPath = path.resolve("scripts", "batch_parsed_results.json");
  fs.writeFileSync(outPath, JSON.stringify(fullResults, null, 2), "utf-8");
  console.log(`\nBatch parsing finished! Results saved to: ${outPath}`);
}

main().catch(console.error);
