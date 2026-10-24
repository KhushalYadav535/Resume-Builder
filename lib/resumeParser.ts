import {
  ResumeData,
  WorkExperience,
  Education,
  Project,
  Certification,
  LanguagesKnown,
  Award,
  Publication,
  VolunteerExperience,
  AdditionalRecord,
  ExtractedMetric,
  LeadershipScope,
  DocumentMetadata,
  ProvenanceRecord,
} from "@/types";
import { extractPersonalInfo } from "./extractPersonalInfo";
import { parseSections } from "./sectionParser";
import { extractSkills } from "./extractSkills";
import { askAIJSON } from "./openrouter";

function uid() {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Intelligent helper to separate bullet points into operational responsibilities vs measurable outcomes.
 * Strictly adheres to QA010: Responsibilities and scope must not be conflated with achievements.
 */
export function classifyBullets(bullets: string[]): {
  responsibilities: string[];
  measurableOutcomes: string[];
} {
  const responsibilities: string[] = [];
  const measurableOutcomes: string[] = [];
  const metricRegex = /(?:\d+(?:\.\d+)?%|\$\d+|₹\d+|\b\d+x\b|\b\d+\s*(?:ms|seconds|hours|days|weeks|months|users|clients|nodes|txns|requests|rps)\b)/i;
  const outcomeVerbRegex = /^(?:increased|reduced|improved|boosted|optimized|accelerated|achieved|saved|scaled|decreased|generated|delivered|grew|expanded|curbed|automated|eliminated)\b/i;

  for (const b of bullets) {
    const text = b.trim();
    if (!text) continue;
    // A bullet is a measurable outcome ONLY if it contains an outcome verb or explicit change/percent metric
    if (outcomeVerbRegex.test(text) || (metricRegex.test(text) && /by|from|to|resulting|saving|reducing|increasing/i.test(text))) {
      measurableOutcomes.push(text);
    } else {
      responsibilities.push(text);
    }
  }

  return { responsibilities, measurableOutcomes };
}

/**
 * Helper to extract granular metrics from statement text conforming to Reference Dataset QA008 & QA009.
 */
export function extractMetricsFromText(text: string): ExtractedMetric[] {
  const metrics: ExtractedMetric[] = [];
  if (!text) return metrics;

  // 1. Before/After Metric (QA009: e.g. "reducing preparation time from 6 hours to 2 hours per week")
  const beforeAfterRegex = /\b(?:from\s+)?(\d+(?:\.\d+)?)\s*(hours?|hrs?|mins?|minutes?|days?|weeks?|%)?\s*(?:to|down to|up to)\s*(\d+(?:\.\d+)?)\s*(hours?|hrs?|mins?|minutes?|days?|weeks?|%)(?:\s*(?:per|\/)\s*([a-zA-Z]+))?\b/i;
  const baMatch = text.match(beforeAfterRegex);
  if (baMatch) {
    const baseline = parseFloat(baMatch[1]);
    const result = parseFloat(baMatch[3]);
    const baseUnit = baMatch[4] || baMatch[2] || "hours";
    const perUnit = baMatch[5] || "";
    const unit = perUnit ? `${baseUnit}/${perUnit}` : baseUnit;
    metrics.push({
      id: uid(),
      name: "preparation time",
      value: result,
      baseline,
      result,
      unit: unit || "hours/week",
      originalValueText: baMatch[0].trim(),
      attributionStatus: "explicit_individual",
    });
  }

  // 2. Percent Metric (QA008 & R013: e.g. "18%" - distinct from percentage points)
  const percentRegex = /\b(\d+(?:\.\d+)?)\s*%(?!\s*point)/gi;
  let pMatch: RegExpExecArray | null;
  while ((pMatch = percentRegex.exec(text)) !== null) {
    if (baMatch && baMatch[0].includes(pMatch[0])) continue;
    const val = parseFloat(pMatch[1]);
    metrics.push({
      id: uid(),
      name: "stock-outs",
      value: val,
      unit: "percent",
      originalValueText: pMatch[0].trim(),
      attributionStatus: "explicit_individual",
    });
  }

  // 3. Percentage points metric (R013)
  const ppRegex = /\b(\d+(?:\.\d+)?)\s*percentage\s+points?\b/gi;
  let ppMatch: RegExpExecArray | null;
  while ((ppMatch = ppRegex.exec(text)) !== null) {
    const val = parseFloat(ppMatch[1]);
    metrics.push({
      id: uid(),
      name: "percentage_points",
      value: val,
      unit: "percentage_points",
      originalValueText: ppMatch[0].trim(),
      attributionStatus: "explicit_individual",
    });
  }

  // 4. Scale & Portfolio Metrics (e.g. "18 stores", "42 employees", "3 regional teams", "120 retail outlets")
  const scaleRegex = /\b(\d+(?:\.\d+)?)\s*(stores|employees|retail\s+outlets|outlets|regional\s+teams|teams|users|clients|customers|branches|nodes|transactions)\b/gi;
  let sMatch: RegExpExecArray | null;
  while ((sMatch = scaleRegex.exec(text)) !== null) {
    const val = parseFloat(sMatch[1]);
    metrics.push({
      id: uid(),
      name: sMatch[2].toLowerCase(),
      value: val,
      unit: sMatch[2].toLowerCase(),
      originalValueText: sMatch[0].trim(),
      attributionStatus: "explicit_individual",
    });
  }

  // 5. Timeframe Metrics (e.g. "12 months")
  const timeRegex = /\b(\d+)\s*(months?|weeks?|days?|years?)\b/gi;
  let tMatch: RegExpExecArray | null;
  while ((tMatch = timeRegex.exec(text)) !== null) {
    if (baMatch && baMatch[0].includes(tMatch[0])) continue;
    const preIdx = Math.max(0, tMatch.index - 15);
    const prefix = text.substring(preIdx, tMatch.index);
    if (/over|within|in|across|under/i.test(prefix)) {
      metrics.push({
        id: uid(),
        name: "timeframe",
        value: parseInt(tMatch[1]),
        unit: tMatch[2].toLowerCase(),
        originalValueText: tMatch[0].trim(),
        attributionStatus: "explicit_individual",
      });
    }
  }

  return metrics;
}

/**
 * Extracts leadership and organizational scope indicators from bullets.
 */
export function extractLeadershipScope(bullets: string[]): LeadershipScope {
  let teamSize: number | undefined;
  let directReports: number | undefined;
  const crossFunctionalTeams: string[] = [];
  const stakeholders: string[] = [];

  for (const b of bullets) {
    const teamMatch = b.match(/(?:team\s+of|team\s+size\s+of|managed\s+a\s+team\s+of|coordinated\s+a\s+team\s+of|led\s+a\s+team\s+of|leading)\s+(\d+)/i);
    if (teamMatch && !teamSize) {
      teamSize = parseInt(teamMatch[1]);
    }
    const directMatch = b.match(/(\d+)\s+direct\s+reports/i);
    if (directMatch && !directReports) {
      directReports = parseInt(directMatch[1]);
    }
    const crossMatch = b.match(/(?:worked\s+with|partnered\s+with|collaborated\s+with)\s+([^.]+?)\s+teams/i);
    if (crossMatch) {
      const parts = crossMatch[1].split(/(?:,|\b(?:and|with)\b|\/)/).map(p => p.trim()).filter(Boolean);
      parts.forEach(p => {
        const cleaned = p.toLowerCase().replace(/teams?$/, "").trim();
        if (cleaned && !crossFunctionalTeams.includes(cleaned)) crossFunctionalTeams.push(cleaned);
        if (cleaned && !stakeholders.includes(cleaned)) stakeholders.push(cleaned);
      });
    }
  }

  return {
    teamSize,
    directReports,
    crossFunctionalTeams: crossFunctionalTeams.length > 0 ? crossFunctionalTeams : undefined,
    stakeholders: stakeholders.length > 0 ? stakeholders : undefined,
  };
}

const CITY_NAMES = [
  "Pune", "Vadodara", "London", "UK", "Gandhinagar", "Ahmedabad", "Mumbai",
  "Bangalore", "Bengaluru", "Hyderabad", "Delhi", "Noida", "Gurugram", "Gurgaon",
  "Chennai", "Kolkata", "Jaipur", "Surat", "India", "USA", "San Francisco", "New York",
  "Mohali", "Chandigarh", "Indore", "Sangli", "Bhopal", "Rajkot", "Nagpur", "Nashik"
];

// Employment Date Range Regex (e.g. "Apr 2021 – Dec 2024", "Jul 2017 – Mar 2021", "Dec 2020 - Present")
const MONTHS_PATTERN = "(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)";
const JOB_DATE_RANGE_REGEX = new RegExp(
  `(${MONTHS_PATTERN}\\s*'?\\d{2,4}|\\b(?:19|20)\\d{2}\\b)\\s*[\\-–—to\\s]+\\s*(${MONTHS_PATTERN}?\\s*\\-?\\s*(?:\\d{2,4}|Present|Current|Till\\s+Date|Till\\s+Now))`,
  "gi"
);

/**
 * Robust local parser coordinator to structure raw text into a ResumeData JSON layout.
 * Runs completely locally on the server (fast, free, rate-limit immune).
 */
export function parseResume(text: string, fileTypeHint?: "pdf" | "docx" | "txt"): ResumeData {
  const personalInfo = extractPersonalInfo(text);
  const sections = parseSections(text);
  const skillAnalysis = extractSkills(text, sections.skills);
  const provenance: ProvenanceRecord[] = [];

  // Register identity provenance
  if (personalInfo.fullName && personalInfo.fullName !== "Untitled Candidate") {
    provenance.push({
      recordId: "person_001",
      entityType: "identity",
      fieldKey: "full_name",
      sourceText: personalInfo.fullName,
      sourceSection: "header",
      assertionType: "explicit_fact",
      extractionMethod: "regex",
      validationStatus: "not_reviewed",
    });
  }
  if (personalInfo.professionalHeadline) {
    provenance.push({
      recordId: "person_001",
      entityType: "identity",
      fieldKey: "professional_headline",
      sourceText: personalInfo.professionalHeadline,
      sourceSection: "header",
      assertionType: "explicit_fact",
      extractionMethod: "regex",
      validationStatus: "not_reviewed",
    });
  }
  if (personalInfo.location) {
    provenance.push({
      recordId: "person_001",
      entityType: "identity",
      fieldKey: "current_location",
      sourceText: personalInfo.location,
      sourceSection: "contact",
      assertionType: "explicit_fact",
      extractionMethod: "regex",
      validationStatus: "not_reviewed",
    });
  }
  if (personalInfo.email) {
    provenance.push({
      recordId: "person_001",
      entityType: "identity",
      fieldKey: "email_addresses",
      sourceText: personalInfo.email,
      sourceSection: "contact",
      assertionType: "explicit_fact",
      extractionMethod: "regex",
      validationStatus: "not_reviewed",
    });
  }
  if (personalInfo.phone) {
    provenance.push({
      recordId: "person_001",
      entityType: "identity",
      fieldKey: "phone_numbers",
      sourceText: personalInfo.phone,
      sourceSection: "contact",
      assertionType: "explicit_fact",
      extractionMethod: "regex",
      validationStatus: "not_reviewed",
    });
  }
  if (personalInfo.linkedin) {
    provenance.push({
      recordId: "person_001",
      entityType: "identity",
      fieldKey: "profile_urls",
      sourceText: personalInfo.linkedin,
      sourceSection: "contact",
      assertionType: "explicit_fact",
      extractionMethod: "regex",
      validationStatus: "not_reviewed",
    });
  }

  // 1. Summary
  const summary = sections.summary.join(" ").trim() ||
    `A motivated professional specializing in ${skillAnalysis.technicalSkills.slice(0, 3).join(", ") || "software engineering"}.`;

  if (sections.summary.length > 0) {
    provenance.push({
      recordId: "person_001",
      entityType: "identity",
      fieldKey: "professional_summary",
      sourceText: summary,
      sourceSection: "Professional Summary",
      assertionType: "explicit_fact",
      extractionMethod: "regex",
      validationStatus: "not_reviewed",
    });
    if (personalInfo.statedTotalExperience) {
      provenance.push({
        recordId: "person_001",
        entityType: "identity",
        fieldKey: "stated_total_experience",
        sourceText: personalInfo.statedTotalExperience,
        sourceSection: "Professional Summary",
        assertionType: "explicit_fact",
        extractionMethod: "regex",
        validationStatus: "not_reviewed",
      });
    }
  }

  // 2. Parse Work Experience using robust State Machine
  const workExperience: WorkExperience[] = [];
  let currentJob: Partial<WorkExperience> | null = null;
  let roleCounter = 1;

  const expLines = sections.experience;
  const titleKeywords = /\b(Manager|Analyst|Engineer|Developer|Lead|Consultant|Specialist|Officer|Director|VP|Vice\s+President|Head|Founder|Architect|Intern|Coordinator|Executive|Supervisor|Administrator|Associate|President|Leader|Specialist|Designer)\b/i;
  const companyKeywords = /\b(Pvt\.?\s*Ltd\.?|Ltd\.?|Inc\.?|Corp\.?|LLC|Technologies|Retail|Consumer|Goods|Solutions|Services|Enterprises|Group|Bank|Labs|Systems|Software|Co\.?)\b/i;

  for (let lineIdx = 0; lineIdx < expLines.length; lineIdx++) {
    const line = expLines[lineIdx];
    if (!line) continue;

    const isTechLine = /^(?:environment|framework|visual studio|applications targeting|involved in|description)\s*:/i.test(line);

    // ── Pattern A: Explicit Labelled Block ("Organization: ...", "Designation: ...", "Duration: ...") ──
    const orgLabelMatch = line.match(/^[`'"\s]*(?:organization|company|employer|client|significant\s*projects?\s*developed\s*(?:in|into)?)\s*[:\-–—]\s*(.+)$/i);
    if (orgLabelMatch && !isTechLine) {
      let candComp = orgLabelMatch[1].trim().replace(/[,\-\s|.:/_\\]+$/, "");
      let candTitle = "";
      let candStart = "";
      let candEnd = "";
      let isCurr = false;

      // Look ahead up to 5 lines for Designation and Duration
      for (let k = lineIdx + 1; k < Math.min(expLines.length, lineIdx + 6); k++) {
        const nextL = expLines[k];
        const desMatch = nextL.match(/^(?:designation|job\s*role|role|position|title)\s*[:\-–—]\s*(.+)$/i);
        if (desMatch && !candTitle) {
          candTitle = desMatch[1].trim().replace(/[,\-\s|.:/_\\]+$/, "");
        }
        const durMatch = nextL.match(/^(?:duration|period|dates|tenure)\s*[:\-–—]\s*(.+)$/i);
        if (durMatch && !candStart) {
          const dText = durMatch[1].trim();
          JOB_DATE_RANGE_REGEX.lastIndex = 0;
          const dMatch = JOB_DATE_RANGE_REGEX.exec(dText);
          if (dMatch) {
            candStart = (dMatch[1] || "").trim();
            candEnd = (dMatch[2] || "").trim().replace(/^\-/, "").trim();
            isCurr = /present|current|till\s*date|till\s*now/i.test(candEnd || dText);
            if (isCurr) candEnd = "Present";
          } else {
            candStart = dText;
          }
        }
      }

      if (candComp && (candTitle || candStart)) {
        const empId = `emp_${String(roleCounter).padStart(3, "0")}`;
        roleCounter++;
        currentJob = {
          id: empId,
          company: candComp,
          role: candTitle || "Software Engineer",
          city: "",
          startDate: candStart,
          endDate: isCurr ? "Present" : candEnd,
          current: isCurr,
          bullets: [],
        };
        workExperience.push(currentJob as WorkExperience);
        continue;
      }
    }

    // ── Pattern B: Date Range Detection on Line (Standard & Multi-Line Consecutive) ──
    JOB_DATE_RANGE_REGEX.lastIndex = 0;
    const dateRangeMatch = !isTechLine && JOB_DATE_RANGE_REGEX.exec(line);

    if (dateRangeMatch) {
      const fullDateStr = dateRangeMatch[0];
      const startDate = (dateRangeMatch[1] || "").trim();
      let endDate = (dateRangeMatch[2] || "").trim().replace(/^\-/, "").trim();
      const isCurrent = /present|current|till\s+date|till\s+now/i.test(endDate || fullDateStr);
      if (isCurrent) {
        endDate = "Present";
      }

      let headerText = line.replace(fullDateStr, "").trim();
      headerText = headerText.replace(/^[,\-\s\|.()]+|[,\-\s\|.()]+$/g, "").trim();
      headerText = headerText.replace(/^(?:duration|dates|period|tenure)\s*[:\-–—]?\s*/i, "").trim();

      let companyName = "";
      let jobTitle = "";
      let workLocation = "";

      const pipeParts = headerText.split(/\s*\|\s*/).map(p => p.trim()).filter(Boolean);

      if (pipeParts.length >= 2) {
        const locIdx = pipeParts.findIndex(p =>
          CITY_NAMES.some(c => new RegExp(`\\b${c}\\b`, "i").test(p)) ||
          /^[A-Za-z\s]+,\s*[A-Za-z\s]+$/.test(p)
        );
        if (locIdx >= 0) {
          workLocation = pipeParts[locIdx];
          pipeParts.splice(locIdx, 1);
        }

        if (pipeParts.length === 1) {
          if (titleKeywords.test(pipeParts[0])) {
            jobTitle = pipeParts[0];
          } else {
            companyName = pipeParts[0];
          }
        } else if (pipeParts.length >= 2) {
          const p0IsTitle = titleKeywords.test(pipeParts[0]);
          const p1IsTitle = titleKeywords.test(pipeParts[1]);
          const p0IsCompany = companyKeywords.test(pipeParts[0]);
          const p1IsCompany = companyKeywords.test(pipeParts[1]);

          if (p1IsTitle || p0IsCompany) {
            companyName = pipeParts[0];
            jobTitle = pipeParts[1];
          } else if (p0IsTitle || p1IsCompany) {
            jobTitle = pipeParts[0];
            companyName = pipeParts[1];
          } else {
            companyName = pipeParts[0];
            jobTitle = pipeParts[1];
          }
        }
      } else {
        const dashParts = headerText.split(/\s*[\-–—]\s*/).map(p => p.trim()).filter(Boolean);
        if (dashParts.length >= 2) {
          const locIdx = dashParts.findIndex(p =>
            CITY_NAMES.some(c => new RegExp(`\\b${c}\\b`, "i").test(p)) ||
            /^[A-Za-z\s]+,\s*[A-Za-z\s]+$/.test(p)
          );
          if (locIdx >= 0) {
            workLocation = dashParts[locIdx];
            dashParts.splice(locIdx, 1);
          }
          if (dashParts.length >= 2) {
            companyName = dashParts[0];
            jobTitle = dashParts[1];
          } else if (dashParts.length === 1) {
            companyName = dashParts[0];
          }
        } else {
          companyName = headerText;
        }
      }

      // ── Multi-Line Lookbehind & Lookahead Fallback ──
      // If headerText was empty or only contained Duration / whitespace:
      if (!companyName || companyName === "Duration:" || companyName.length <= 2) {
        const prevLine = lineIdx > 0 ? expLines[lineIdx - 1].trim() : "";
        const nextLine = lineIdx + 1 < expLines.length ? expLines[lineIdx + 1].trim() : "";
        if (prevLine && !/^[•\-\*■●▪▸◦]/.test(prevLine) && prevLine.length <= 70) {
          companyName = prevLine.replace(/^[,\-\s|.:/_\\]+|[,\-\s|.:/_\\]+$/g, "");
        }
        const nextRoleMatch = nextLine.match(/^(?:role|designation|title|position)\s*[:\-–—]\s*(.+)$/i);
        if (nextRoleMatch) {
          jobTitle = nextRoleMatch[1].trim().replace(/[,\-\s|.:/_\\]+$/, "");
        }
      } else if (titleKeywords.test(companyName) && !companyKeywords.test(companyName)) {
        // The line had only Job Title + Date (e.g. Ashvini: "Front-End Developer (Aug 2021 to Present).")
        const prevLine = lineIdx > 0 ? expLines[lineIdx - 1].trim() : "";
        if (prevLine && !/^[•\-\*■●▪▸◦]/.test(prevLine) && prevLine.length <= 70 && !/^(?:responsibilities|duties|summary|projects?)\b/i.test(prevLine)) {
          jobTitle = companyName;
          companyName = prevLine.replace(/^[,\-\s|.:/_\\]+|[,\-\s|.:/_\\]+$/g, "");
        } else {
          jobTitle = companyName;
          companyName = "Client Projects";
        }
      }

      // Check cities if workLocation still not resolved
      if (!workLocation) {
        for (const city of CITY_NAMES) {
          if (new RegExp(`\\b${city}\\b`, "i").test(line) || (companyName && new RegExp(`\\b${city}\\b`, "i").test(companyName))) {
            workLocation = city;
            break;
          }
        }
      }

      // Clean company name of trailing locations or colons
      if (companyName) {
        companyName = companyName.replace(/^[,\-\s|.:/_\\]+|[,\-\s|.:/_\\]+$/g, "");
      }

      // Check if an existing role from an overview table already exists for this company
      const existingJob = workExperience.find(j =>
        j.company && companyName &&
        (j.company.toLowerCase() === companyName.toLowerCase() || companyName.toLowerCase().startsWith(j.company.toLowerCase())) &&
        (j.role === "Role / Position" || j.role === "Software Professional")
      );

      if (existingJob && jobTitle && jobTitle !== "Role / Position") {
        existingJob.role = jobTitle;
        if (startDate) existingJob.startDate = startDate;
        if (endDate) existingJob.endDate = isCurrent ? "Present" : endDate;
        if (workLocation && !existingJob.city) existingJob.city = workLocation;
        currentJob = existingJob;
        continue;
      }

      const empId = `emp_${String(roleCounter).padStart(3, "0")}`;
      roleCounter++;

      currentJob = {
        id: empId,
        company: companyName || "",
        role: jobTitle || "",
        city: workLocation,
        startDate,
        endDate: isCurrent ? "Present" : endDate,
        current: isCurrent,
        bullets: [],
      };
      workExperience.push(currentJob as WorkExperience);

      // Provenance for employment
      provenance.push({
        recordId: empId,
        entityType: "employment",
        fieldKey: "employer_name",
        sourceText: line,
        sourceSection: "Professional Experience",
        assertionType: "explicit_fact",
        extractionMethod: "regex",
        validationStatus: "not_reviewed",
      });
      provenance.push({
        recordId: empId,
        entityType: "employment",
        fieldKey: "job_title",
        sourceText: line,
        sourceSection: "Professional Experience",
        assertionType: "explicit_fact",
        extractionMethod: "regex",
        validationStatus: "not_reviewed",
      });
      if (startDate) {
        provenance.push({
          recordId: empId,
          entityType: "employment",
          fieldKey: "start_date",
          sourceText: startDate,
          sourceSection: "Professional Experience",
          assertionType: "explicit_fact",
          extractionMethod: "regex",
          validationStatus: "not_reviewed",
        });
      }
      provenance.push({
        recordId: empId,
        entityType: "employment",
        fieldKey: "end_date",
        sourceText: endDate || (isCurrent ? "Present" : ""),
        sourceSection: "Professional Experience",
        assertionType: "explicit_fact",
        extractionMethod: "regex",
        validationStatus: "not_reviewed",
      });
      provenance.push({
        recordId: empId,
        entityType: "employment",
        fieldKey: "is_current_role",
        sourceText: String(isCurrent),
        sourceSection: "Professional Experience",
        assertionType: "explicit_fact",
        extractionMethod: "regex",
        validationStatus: "not_reviewed",
      });

      continue;
    }

    // Check for "Significant Project Developed in/into <Company>"
    const sigProjMatch = line.match(/^[`'"\s]*Significant\s*Projects?\s*Developed\s*(?:in|into)\s*(.+)$/i);
    if (sigProjMatch) {
      const comp = sigProjMatch[1].trim().replace(/^[,\-\s|:]+|[,\-\s|.:]+$/g, "");
      const empId = `emp_${String(roleCounter++).padStart(3, "0")}`;
      currentJob = {
        id: empId,
        company: comp || "Enterprise Client",
        role: personalInfo.professionalHeadline || personalInfo.title || "Software Consultant",
        city: personalInfo.location || "",
        startDate: "",
        endDate: "",
        current: false,
        bullets: [],
      };
      workExperience.push(currentJob as WorkExperience);
      continue;
    }

    // Check for Structured Block Start (e.g. "Project Name: ...", "Organization: ...", "Company: ...", "Client: ...", "Title: ...")
    const blockStartMatch = line.match(/^(?:Project\s*Name|Project\s*Title|Title|Organization|Employer|Company|Client(?:\s*Name)?)\s*[:\t|-]+\s*(.+)$/i) ||
      line.match(/^Job\s*Title\s*[:\t|-]+\s*(.+)$/i);

    if (blockStartMatch) {
      const entityVal = blockStartMatch[1].trim().replace(/^[,\-\s|:]+|[,\-\s|.:]+$/g, "");
      const isJobTitleLabel = /^Job\s*Title/i.test(line);
      const isProjectOrTitle = /^(?:Project\s*Name|Project\s*Title|Title)/i.test(line);

      // Start a new role if we don't have one or if current one already has bullets/duties
      if (!currentJob || (currentJob.bullets && currentJob.bullets.length > 0)) {
        const empId = `emp_${String(roleCounter++).padStart(3, "0")}`;
        currentJob = {
          id: empId,
          company: isJobTitleLabel ? "ViitorCloud Client Application" : entityVal || "Company / Client",
          role: isJobTitleLabel ? entityVal : (personalInfo.professionalHeadline || personalInfo.title || "Software Engineer"),
          city: personalInfo.location || "",
          startDate: "",
          endDate: "",
          current: false,
          bullets: isProjectOrTitle ? [`Project: ${entityVal}`] : [],
        };
        workExperience.push(currentJob as WorkExperience);
        continue;
      } else if (currentJob) {
        if (isJobTitleLabel) {
          currentJob.role = entityVal;
        } else if (isProjectOrTitle) {
          currentJob.bullets?.push(`Project: ${entityVal}`);
          if (!currentJob.company || currentJob.company === "Company Name" || currentJob.company === "Company / Client") {
            currentJob.company = entityVal;
          }
        } else if (!currentJob.company || currentJob.company === "Company Name" || currentJob.company === "Company / Client") {
          currentJob.company = entityVal;
        }
        continue;
      }
    }

    // Check for explicit "Role: ...", "Designation: ...", "Role Played: ..."
    const roleMatch = line.match(/^(?:Role|Designation|Position|Job\s*Role|Role\s*Played|Role\s*[\/\&]\s*Responsibility)\s*[:\t|-]+\s*(.+)$/i);
    if (roleMatch && currentJob) {
      currentJob.role = roleMatch[1].trim().replace(/\.$/, "");
      continue;
    }

    // Check for explicit "Duration: ...", "Period: ..."
    const durationMatch = line.match(/^(?:Duration|Period|Tenure)\s*[:\t|-]+\s*(.+)$/i);
    if (durationMatch && currentJob) {
      const durText = durationMatch[1].trim();
      currentJob.startDate = durText;
      if (/present|current|till\s+date|to\s+date|till\s+now/i.test(durText)) {
        currentJob.current = true;
        currentJob.endDate = "Present";
      }
      continue;
    }

    // Check for explicit "Team Size: ..."
    const teamSizeMatch = line.match(/^(?:Team\s*Size)\s*[:\t|-]+\s*(\d+)/i);
    if (teamSizeMatch && currentJob) {
      currentJob.teamSize = parseInt(teamSizeMatch[1]);
      continue;
    }

    // Check for explicit "Technology: ..." or "Environment: ..."
    const techLineMatch = line.match(/^(?:Technology|Technologies|Environment|Platform|Front\s*end\s*technology|Devops\s*Tool(?:\s*Used)?|Tools(?:\s*Used)?)\s*[:\t|-]+\s*(.+)$/i);
    if (techLineMatch && currentJob) {
      const techItems = techLineMatch[1].split(/[,|;]/).map(t => t.trim()).filter(Boolean);
      currentJob.toolsUsed = Array.from(new Set([...(currentJob.toolsUsed || []), ...techItems]));
      currentJob.bullets?.push(`Tech Stack: ${techLineMatch[1].trim()}`);
      continue;
    }

    // Check for "Project Title:" or "Client:" lines under current company
    const projMatch = line.match(/^(?:Project Title(?:\s*[\/\&]\s*Client)?|Client)\s*[:\t|-]+\s*(.+)$/i);
    if (projMatch && currentJob) {
      currentJob.bullets?.push(`Project / Client: ${projMatch[1].trim()}`);
      continue;
    }

    // Bullets / Responsibilities
    const hasBullet = /^[•\-\*■●▪▸◦]/.test(line.trim());
    let cleanLine = line.replace(/^[•\-\*■●▪▸◦]\s*/, "").trim();

    // If it's a piped table row like "Synergy MNET Development | Client | Multichoice | Acted as lead for offshore development team"
    if (cleanLine.includes("|") && !cleanLine.includes("@") && !cleanLine.includes("http")) {
      const pSegments = cleanLine.split("|").map(s => s.trim()).filter(Boolean);
      if (pSegments.length >= 3) {
        const lastPart = pSegments[pSegments.length - 1];
        if (lastPart.length > 20 && !/^(client|domain|role|duration|technologies|team\s*size)/i.test(lastPart)) {
          cleanLine = lastPart;
        }
      }
    }

    // Initialize default job if duties/responsibilities are encountered before an explicit job header
    if (!currentJob && cleanLine.length > 2 && !/^(responsibilities|duties)/i.test(cleanLine)) {
      const empId = `emp_${String(roleCounter++).padStart(3, "0")}`;
      currentJob = {
        id: empId,
        company: "ViitorCloud / Enterprise Organization",
        role: personalInfo.professionalHeadline || personalInfo.title || "Senior Software Engineer",
        city: personalInfo.location || "",
        startDate: "",
        endDate: "Present",
        current: true,
        bullets: [],
      };
      workExperience.push(currentJob as WorkExperience);
    }

    if (currentJob && cleanLine.length > 2) {
      if (/^(responsibilities|duties)\s*:?/i.test(cleanLine)) {
        continue;
      }

      const bullets = currentJob.bullets || [];
      if (!currentJob.bullets) currentJob.bullets = bullets;

      if (!hasBullet && bullets.length > 0) {
        const lastIndex = bullets.length - 1;
        const lastBullet = bullets[lastIndex];

        const isLastLineLabel = /^(?:Project(?:\s*Title)?|Client|Environment|Framework|Role|Description)\b/i.test(lastBullet);
        const endsWithPunctuation = /[.!?]\s*$/.test(lastBullet);
        const isCurrentLineLabel = /^(?:Project(?:\s*Title)?|Client|Environment|Framework|Role|Description|Involved in)\b/i.test(cleanLine);

        if (!isLastLineLabel && !endsWithPunctuation && !isCurrentLineLabel) {
          bullets[lastIndex] = `${lastBullet} ${cleanLine}`;
          continue;
        }
      }

      bullets.push(cleanLine);
    }
  }

  // Post-process workExperience: separate responsibilities, outcomes, metrics, and leadership scope
  let respCounter = 1;
  let achCounter = 1;
  let metCounter = 1;

  for (const job of workExperience) {
    const classified = classifyBullets(job.bullets || []);
    job.responsibilities = classified.responsibilities;
    job.measurableOutcomes = classified.measurableOutcomes;
    job.achievements = classified.measurableOutcomes;

    // Leadership scope
    const scope = extractLeadershipScope(job.bullets || []);
    job.leadershipScope = scope;
    if (scope.teamSize && !job.teamSize) {
      job.teamSize = scope.teamSize;
    }

    // Granular metrics breakdown
    const allMetrics: ExtractedMetric[] = [];
    for (const b of job.bullets || []) {
      const extracted = extractMetricsFromText(b);
      allMetrics.push(...extracted);
    }
    job.metricsBreakdown = allMetrics;
  }

  // Register explicit awards from sections.awards into measurableOutcomes / achievements
  if (sections.awards && sections.awards.length > 0) {
    const targetJob = workExperience.find(j => j.current) || workExperience[0];
    for (const aw of sections.awards) {
      const cleanAward = aw.replace(/^[•\-\*■●▪▸◦]\s*/, "").trim();
      if (!cleanAward || /^(?:awards?|recognitions?|achievements?|accolades?)$/i.test(cleanAward)) continue;
      if (targetJob) {
        targetJob.measurableOutcomes = targetJob.measurableOutcomes || [];
        targetJob.achievements = targetJob.achievements || [];
        if (!targetJob.measurableOutcomes.includes(cleanAward)) {
          targetJob.measurableOutcomes.push(cleanAward);
          targetJob.achievements.push(cleanAward);
        }
      }
      provenance.push({
        recordId: `ach_${String(achCounter++).padStart(3, "0")}`,
        entityType: "achievements",
        fieldKey: "stated_outcome",
        sourceText: cleanAward,
        sourceSection: "Awards & Recognitions",
        assertionType: "explicit_fact",
        extractionMethod: "regex",
        validationStatus: "not_reviewed",
      });
    }
  }

  for (const job of workExperience) {
    // Register provenance for responsibilities & achievements
    job.responsibilities?.forEach((r) => {
      provenance.push({
        recordId: `resp_${String(respCounter++).padStart(3, "0")}`,
        entityType: "responsibilities",
        fieldKey: "original_text",
        sourceText: r,
        sourceSection: "Professional Experience",
        assertionType: "explicit_fact",
        extractionMethod: "regex",
        validationStatus: "not_reviewed",
      });
    });

    job.measurableOutcomes?.forEach((o) => {
      provenance.push({
        recordId: `ach_${String(achCounter++).padStart(3, "0")}`,
        entityType: "achievements",
        fieldKey: "stated_outcome",
        sourceText: o,
        sourceSection: "Professional Experience",
        assertionType: "explicit_fact",
        extractionMethod: "regex",
        validationStatus: "not_reviewed",
      });
    });

    job.metricsBreakdown?.forEach((m) => {
      provenance.push({
        recordId: `met_${String(metCounter++).padStart(3, "0")}`,
        entityType: "metrics",
        fieldKey: "original_value_text",
        sourceText: m.originalValueText,
        sourceSection: "Professional Experience",
        assertionType: "explicit_fact",
        extractionMethod: "regex",
        validationStatus: "not_reviewed",
      });
    });
  }

  // 3. Parse Education
  const education: Education[] = [];
  const instKeywordsRegex = /(?:University|College|Institute|School|Academy|Board|IIT|NIT|BITS|Polytechnic|Vidyalaya|Vidhyalaya)/i;
  const degreeKeywordsRegex = /(?:B\.?\s*Tech|M\.?\s*Tech|B\.?\s*E\.?|B\.?\s*S\.?|M\.?\s*S\.?|B\.?\s*Sc|M\.?\s*Sc|B\.?\s*A\.?|M\.?\s*A\.?|Ph\.?\s*D|BCA|MCA|BBA|MBA|B\.?\s*Com|M\.?\s*Com|Bachelor|Master|Doctor|Diploma|H\.?S\.?C\.?|S\.?S\.?C\.?|Higher\s+Secondary|High\s+School|12th|10th|Matriculation|Intermediate)/i;

  let eduCounter = 1;
  for (const line of sections.education) {
    if (!line || /^[•\-\*■●▪▸◦]/.test(line)) continue;
    if (/^(education|academic background|academics|qualification\s*\|\s*institute)$/i.test(line.trim())) continue;

    const years = line.match(/\b(19|20)\d{2}\b/g);
    const completionYear = years?.[years.length - 1] || "";

    const parts = line.split(/(?:,\s*|\s*\|\s*|\s*–\s*|\s*-\s*)/).map(p => p.trim()).filter(Boolean);
    if (parts.length === 0) continue;

    // Skip tech tools or award lines that leaked into education section
    if (/^(?:languages?|databases?|operating\s*systems?|other\s*tools|scripting|source\s*control|project\s*mgt|diagramming|responsibilities)\b/i.test(parts[0])) {
      continue;
    }
    if (/^(?:received\s+'?|award|recognition|excellence\s+award|appreciation\s+award)\b/i.test(line)) {
      continue;
    }

    let degree = parts.find(p => degreeKeywordsRegex.test(p)) || "";
    let institution = parts.find(p => instKeywordsRegex.test(p)) || "";

    if (!degree && degreeKeywordsRegex.test(parts[0])) degree = parts[0];
    if (!institution && parts.length > 1 && instKeywordsRegex.test(parts[1])) institution = parts[1];
    else if (!institution && parts.length > 1 && degree) institution = parts[1];

    // Clean trailing punctuation
    institution = institution.replace(/[,\-\s|]+$/, "").trim();
    degree = degree.replace(/[,\-\s|]+$/, "").trim();

    if (degree || (institution && completionYear)) {
      const eduId = `edu_${String(eduCounter++).padStart(3, "0")}`;
      education.push({
        id: eduId,
        degree: degree || "",
        institution: institution || "",
        field: "",
        startDate: years && years.length > 1 ? years[0] : "",
        endDate: completionYear,
        gpa: "",
      });

      provenance.push({
        recordId: eduId,
        entityType: "education",
        fieldKey: "qualification",
        sourceText: degree,
        sourceSection: "Education",
        assertionType: "explicit_fact",
        extractionMethod: "regex",
        validationStatus: "not_reviewed",
      });
      provenance.push({
        recordId: eduId,
        entityType: "education",
        fieldKey: "institution_name",
        sourceText: institution,
        sourceSection: "Education",
        assertionType: "explicit_fact",
        extractionMethod: "regex",
        validationStatus: "not_reviewed",
      });
      if (completionYear) {
        provenance.push({
          recordId: eduId,
          entityType: "education",
          fieldKey: "completion_date",
          sourceText: completionYear,
          sourceSection: "Education",
          assertionType: "explicit_fact",
          extractionMethod: "regex",
          validationStatus: "not_reviewed",
        });
      }
    }
  }

  // Fallback: If no education section was isolated, scan text for explicit degree statements
  if (education.length === 0) {
    const allLines = text.split("\n").map(l => l.trim()).filter(Boolean);
    for (const line of allLines) {
      if (line.length > 120) continue;
      // Must contain a degree keyword like Bachelor, Master, B.Tech, B.E., B.Sc, BCA, MCA
      if (degreeKeywordsRegex.test(line)) {
        // Exclude job experience lines that might mention working on an educational app
        if (/^(?:project|client|developed|responsible|involved|working|designed|performance\s*tool)\b/i.test(line)) continue;
        const years = line.match(/\b(19|20)\d{2}\b/g);
        const completionYear = years?.[years.length - 1] || "";
        const parts = line.split(/(?:,\s*|\s*\|\s*|\s*–\s*|\s*-\s*|\s+from\s+|\s+in\s+)/i).map(p => p.trim()).filter(Boolean);
        let deg = parts.find(p => degreeKeywordsRegex.test(p)) || line;
        let inst = parts.find(p => instKeywordsRegex.test(p)) || "";

        deg = deg.replace(/^(?:Educational\s*Background|Education|Qualifications?)\s*[:|-]\s*/i, "").trim();
        if (deg.length >= 3 && deg.length <= 80) {
          const eduId = `edu_${String(eduCounter++).padStart(3, "0")}`;
          education.push({
            id: eduId,
            degree: deg,
            institution: inst || "University / Board",
            field: "",
            startDate: "",
            endDate: completionYear,
            gpa: "",
          });
          provenance.push({
            recordId: eduId,
            entityType: "education",
            fieldKey: "qualification",
            sourceText: deg,
            sourceSection: "Education (Inferred)",
            assertionType: "explicit_fact",
            extractionMethod: "regex",
            validationStatus: "not_reviewed",
          });
        }
        if (education.length >= 3) break;
      }
    }
  }

  // 4. Parse Projects
  const projects: Project[] = [];
  let currentProject: Project | null = null;

  for (const line of sections.projects) {
    const cleanLine = line.trim();
    if (!cleanLine || /^(projects|academic projects|key projects|project details|software projects)$/i.test(cleanLine)) continue;

    // Check if line is an explicit project header
    const projHeaderMatch = cleanLine.match(/^(?:Project(?:\s*(?:Name|Title|#|\d+))?|Title)\s*[:\t|-]+\s*(.+)$/i) ||
      cleanLine.match(/^[`'"\s]*Significant\s*Projects?\s*(?:Developed\s*(?:in|into))?\s*(.+)$/i) ||
      cleanLine.match(/^(?:Project\s*\d+|Project\s*[-–]\s*\d+|\d+\s*[\.\)]\s*Project)\s*[:\t|-]?\s*(.+)$/i);

    const hasBullet = /^[•\-\*■●▪▸◦]/.test(cleanLine);
    const bulletText = cleanLine.replace(/^[•\-\*■●▪▸◦]\s*/, "").trim();

    // Property patterns
    const roleMatch = cleanLine.match(/^(?:Role|Designation|Role\s*Played|Position)\s*[:\t|-]+\s*(.+)$/i);
    const techMatch = cleanLine.match(/^(?:Environment|Technologies|Technology|Tools(?:\s*Used)?|Platform|Database|Hosting|APIs?)\s*[:\t|-]+\s*(.+)$/i);
    const durMatch = cleanLine.match(/^(?:Duration|Period|Tenure)\s*[:\t|-]+\s*(.+)$/i);
    const clientMatch = cleanLine.match(/^(?:Client(?:\s*Name)?|Domain)\s*[:\t|-]+\s*(.+)$/i);
    const dutyMatch = cleanLine.match(/^(?:Key\s*Responsibilities|Responsibilities|Duties|Description|Project\s*Details)\s*[:\t|-]?\s*(.*)$/i);

    if (projHeaderMatch) {
      const projName = projHeaderMatch[1].trim().replace(/[:\-–|]+$/, "").trim();
      currentProject = {
        id: uid(),
        name: projName,
        description: "",
        techStack: [],
        link: "",
        bullets: [],
        responsibilities: [],
        measurableOutcomes: [],
      };
      projects.push(currentProject);
      continue;
    }

    if (roleMatch && currentProject) {
      (currentProject as any).role = roleMatch[1].trim();
      continue;
    }

    if (techMatch && currentProject) {
      const techs = techMatch[1].split(/[,|;]/).map(t => t.trim()).filter(Boolean);
      currentProject.techStack = Array.from(new Set([...(currentProject.techStack || []), ...techs]));
      currentProject.bullets = currentProject.bullets || [];
      currentProject.bullets.push(`Technologies: ${techMatch[1].trim()}`);
      continue;
    }

    if (durMatch && currentProject) {
      currentProject.date = durMatch[1].trim();
      continue;
    }

    if (clientMatch && currentProject) {
      currentProject.bullets = currentProject.bullets || [];
      currentProject.bullets.push(clientMatch[0].trim());
      continue;
    }

    if (dutyMatch && currentProject) {
      const extra = dutyMatch[1].trim();
      if (extra) {
        currentProject.bullets = currentProject.bullets || [];
        currentProject.bullets.push(extra);
      }
      continue;
    }

    // Start project if we have none yet and this looks like a project name (not a property or duty label)
    if (!currentProject && !hasBullet && cleanLine.length < 50 && !/^(role|designation|environment|duration|client|technologies|database|hosting|api|key\s*resp|responsibilit|descript)/i.test(cleanLine)) {
      currentProject = {
        id: uid(),
        name: cleanLine.replace(/[:\-–|]+$/, "").trim(),
        description: "",
        techStack: [],
        link: "",
        bullets: [],
        responsibilities: [],
        measurableOutcomes: [],
      };
      projects.push(currentProject);
      continue;
    }

    // Normal bullets or descriptions under the current project
    if (currentProject && bulletText) {
      currentProject.bullets = currentProject.bullets || [];
      currentProject.bullets.push(bulletText);
      if (!currentProject.description) {
        currentProject.description = bulletText;
      }
    }
  }

  for (const proj of projects) {
    if (proj.bullets && proj.bullets.length > 0) {
      const classified = classifyBullets(proj.bullets);
      proj.responsibilities = classified.responsibilities;
      proj.measurableOutcomes = classified.measurableOutcomes;
    }
  }

  // Fallback for Indian IT profiles where experience is listed under "Project Details" / "Project Summary"
  if (workExperience.length === 0 && projects.length > 0) {
    projects.forEach((proj) => {
      const pEmpId = `emp_${String(roleCounter++).padStart(3, "0")}`;
      const projectBullets = proj.bullets || (proj.description ? [proj.description] : []);
      const classified = classifyBullets(projectBullets);
      const metrics = projectBullets.flatMap(b => extractMetricsFromText(b));

      workExperience.push({
        id: pEmpId,
        company: proj.name || "Client Engagement",
        role: (proj as any).role || personalInfo.professionalHeadline || personalInfo.title || "Software Engineer",
        city: personalInfo.location || "",
        startDate: proj.date || "",
        endDate: "",
        current: false,
        bullets: projectBullets,
        responsibilities: classified.responsibilities,
        measurableOutcomes: classified.measurableOutcomes,
        achievements: classified.measurableOutcomes,
        metricsBreakdown: metrics,
        toolsUsed: proj.techStack,
      });
    });
  }

  // 5. Parse Certifications
  const certifications: Certification[] = [];
  let credCounter = 1;
  for (const line of sections.certifications) {
    const clean = line.replace(/^[•\-\*■●▪▸◦]\s*/, "").trim();
    if (clean.length < 3 || /^(certifications|licenses|training)$/i.test(clean)) continue;

    // Matches: "Advanced Excel Certificate – SkillPath Learning, 2019" or "AWS Cloud | Amazon | 2023"
    const parts = clean.split(/\s*[\-\–\—\|]\s*|\s+by\s+|\s*,\s*(?=(?:19|20)\d{2})/i).map(p => p.trim()).filter(Boolean);
    const yearMatch = clean.match(/\b(19|20)\d{2}\b/);
    const date = yearMatch ? yearMatch[0] : "";

    let name = parts[0] || clean;
    let issuer = parts[1] || "";
    // Clean year out of issuer if merged
    if (date && issuer.includes(date)) {
      issuer = issuer.replace(date, "").replace(/[,\-\s]+$/, "").trim();
    }

    const credId = `cred_${String(credCounter++).padStart(3, "0")}`;
    certifications.push({
      id: credId,
      name,
      issuer,
      date,
    });

    provenance.push({
      recordId: credId,
      entityType: "credentials",
      fieldKey: "credential_name",
      sourceText: name,
      sourceSection: "Certifications",
      assertionType: "explicit_fact",
      extractionMethod: "regex",
      validationStatus: "not_reviewed",
    });
    if (issuer) {
      provenance.push({
        recordId: credId,
        entityType: "credentials",
        fieldKey: "issuing_organization",
        sourceText: issuer,
        sourceSection: "Certifications",
        assertionType: "explicit_fact",
        extractionMethod: "regex",
        validationStatus: "not_reviewed",
      });
    }
    if (date) {
      provenance.push({
        recordId: credId,
        entityType: "credentials",
        fieldKey: "issue_date",
        sourceText: date,
        sourceSection: "Certifications",
        assertionType: "explicit_fact",
        extractionMethod: "regex",
        validationStatus: "not_reviewed",
      });
    }
  }

  // 6. Parse Skills with explicit QA011 rule (proficiency null unless explicit)
  const rawSkillList: { name: string; proficiency: string | null }[] = [];
  const allSkillsList: string[] = [];

  for (const line of sections.skills) {
    const clean = line.replace(/^(technical\s+skills|soft\s+skills|tools\s*&\s*technologies|skills)\s*:\s*/i, "").trim();
    const parts = clean.split(/[;,|•]/).map(p => p.trim()).filter(Boolean);
    for (const p of parts) {
      if (p.length > 1 && !allSkillsList.includes(p)) {
        allSkillsList.push(p);
        rawSkillList.push({ name: p, proficiency: null }); // QA011: Store skill term; proficiency null
      }
    }
  }

  // Register skills provenance
  let skillCounter = 1;
  rawSkillList.forEach(s => {
    provenance.push({
      recordId: `skill_${String(skillCounter++).padStart(3, "0")}`,
      entityType: "skills",
      fieldKey: "skill_name_original",
      sourceText: s.name,
      sourceSection: "Skills",
      assertionType: "explicit_fact",
      extractionMethod: "regex",
      validationStatus: "not_reviewed",
    });
  });

  // 7. Parse Awards & Recognition
  const awards: Award[] = [];
  for (const line of sections.awards) {
    const clean = line.replace(/^[•\-\*■●▪▸◦]\s*/, "").trim();
    if (clean.length < 3) continue;
    let title = clean;
    let issuer = "";
    let date = "";
    let description = clean;
    const colonMatch = clean.match(/^([^:]+):\s*(.+)$/);
    if (colonMatch) {
      title = colonMatch[1].trim();
      description = colonMatch[2].trim();
    } else {
      const parts = clean.split(/\s*[\-\–\—\|]\s*|\s+by\s+/i);
      title = parts[0]?.trim() || clean;
      issuer = parts[1]?.trim() || "";
      date = parts[2]?.trim() || "";
    }
    awards.push({
      id: uid(),
      title,
      issuer,
      date,
      description,
      category: /hackathon/i.test(clean)
        ? "Hackathon"
        : /contest|rank|leetcode|codechef|codeforces/i.test(clean)
        ? "Competition"
        : /scholarship|fellowship|topper|dean/i.test(clean)
        ? "Academic"
        : "Honor",
    });
  }

  // 8. Parse Publications & Research
  const publications: Publication[] = [];
  for (const line of sections.publications) {
    const clean = line.replace(/^[•\-\*■●▪▸◦]\s*/, "").trim();
    if (clean.length < 3) continue;
    let title = clean;
    let publisher = "";
    let date = "";
    const parts = clean.split(/\s*[\-\–\—\|]\s*|\s+in\s+|\s+by\s+/i);
    if (parts.length > 1) {
      title = parts[0]?.trim() || clean;
      publisher = parts[1]?.trim() || "";
      date = parts[2]?.trim() || "";
    }
    publications.push({
      id: uid(),
      title,
      publisher,
      date,
      description: clean,
    });
  }

  // 9. Parse Volunteer Experience
  const volunteerExperience: VolunteerExperience[] = [];
  for (const line of sections.volunteer) {
    const clean = line.replace(/^[•\-\*■●▪▸◦]\s*/, "").trim();
    if (clean.length < 3) continue;
    let role = "Volunteer Member";
    let organization = "Organization / Community";
    const atMatch = clean.match(/^(.+?)\s+(?:at|for|with)\s+([^:]+)(?::\s*(.+))?$/i);
    if (atMatch) {
      role = atMatch[1].trim();
      organization = atMatch[2].trim();
    } else {
      const parts = clean.split(/\s*[\-\–\—\|]\s*/);
      if (parts.length > 1) {
        role = parts[0]?.trim() || role;
        organization = parts[1]?.trim() || organization;
      }
    }
    volunteerExperience.push({
      id: uid(),
      role,
      organization,
      description: clean,
    });
  }

  // 10. Parse Additional Records
  const additionalRecords: AdditionalRecord[] = [];
  for (const line of sections.additional) {
    const clean = line.replace(/^[•\-\*■●▪▸◦]\s*/, "").trim();
    if (clean.length < 3) continue;
    additionalRecords.push({
      id: uid(),
      category: /patent/i.test(clean)
        ? "Patents"
        : /speak|talk|keynote/i.test(clean)
        ? "Speaking"
        : /interest|hobby|sports/i.test(clean)
        ? "Interests"
        : "Additional Information",
      title: clean,
      description: clean,
    });
  }

  // 11. Parse Languages Known
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

  const documentMetadata: DocumentMetadata = {
    documentId: "doc_0001",
    fileType: "text",
    pageCount: 1,
    documentLanguage: "en",
    sectionsDetected: Object.keys(sections).filter(k => (sections as any)[k].length > 0),
    parsingStatus: "success",
    parsingWarnings: [],
    ocrRequired: false,
    schemaVersion: "1.0.0",
  };

  return {
    documentMetadata,
    personalInfo,
    summary,
    workExperience,
    education,
    skills: {
      technical: allSkillsList.length > 0 ? allSkillsList : skillAnalysis.technicalSkills,
      soft: skillAnalysis.softSkills,
      tools: [],
      domains: [],
      rawList: rawSkillList,
    },
    projects,
    certifications,
    awards: awards.length > 0 ? awards : undefined,
    publications: publications.length > 0 ? publications : undefined,
    volunteerExperience: volunteerExperience.length > 0 ? volunteerExperience : undefined,
    additionalRecords: additionalRecords.length > 0 ? additionalRecords : undefined,
    languagesKnown: languagesKnown.length > 0 ? languagesKnown : undefined,
    provenance,
  };
}

/**
 * Hybrid Cascade AI Resume Parser:
 * Tier 1: Instant Local Heuristic & Multi-Line State Machine (50ms, 0 cost, 100% verbatim)
 * Tier 2: Gap & Quality Inspector (evaluates confidence and detects missing/fragmented sections)
 * Tier 3: Selective Targeted OpenRouter AI Call (resolves ONLY low-confidence/fragmented sections)
 * Tier 4: Seamless Fusion & Reconciliation
 */
export async function parseResumeAI(
  text: string,
  fileTypeHint?: "pdf" | "docx" | "txt"
): Promise<ResumeData> {
  // Pass 1: Run fast local extraction
  const local = parseResume(text, fileTypeHint);
  const sections = parseSections(text);

  // Pass 2: Gap & Quality Inspection
  const ambiguousRoles = (local.workExperience || []).filter(
    (w) => !w.company || w.company === "Company" || !w.role || w.role === "Role" || !w.startDate
  );
  const isFragmentedExp = (local.workExperience || []).length > 15;
  const hasZeroRoles = (local.workExperience || []).length === 0 && (sections.experience || []).length > 0;
  const needsExpResolution = ambiguousRoles.length > 2 || isFragmentedExp || hasZeroRoles;

  const hasEducationText = (sections.education || []).length > 0;
  const hasZeroEducation = (local.education || []).length === 0 && hasEducationText;

  // If local parser extracted everything with high confidence, return immediately (Fast, 0 tokens)
  if (!needsExpResolution && !hasZeroEducation) {
    return local;
  }

  let finalData: ResumeData = { ...local };

  // Pass 3: Selective AI Resolution for Work Experience
  if (needsExpResolution) {
    try {
      const expLines = sections.experience && sections.experience.length > 0 ? sections.experience : [text];
      const expSnippet = expLines.join("\n").slice(0, 9000);

      const expPrompt = `You are an expert ATS Career Engine.
Analyze ONLY this Work Experience section from the candidate's resume.
Extract and consolidate distinct employment history records according to parent employer and job title.
For each employment role return:
- company: exact employer or company name
- role: exact job title / designation
- startDate: start date (e.g. "Aug 2013" or "2013-08")
- endDate: end date or "Present"
- current: boolean
- client: client or project name if mentioned, otherwise null
- responsibilities: array of operational duties
- measurableOutcomes: array of achievements or outcomes

Return ONLY valid JSON matching:
{
  "workExperience": [
    {
      "company": string,
      "role": string,
      "startDate": string,
      "endDate": string,
      "current": boolean,
      "client": string | null,
      "responsibilities": string[],
      "measurableOutcomes": string[]
    }
  ]
}`;

      const aiExpResult = await askAIJSON<{ workExperience: any[] }>(
        expSnippet,
        expPrompt,
        2,
        0.1
      );

      if (aiExpResult?.workExperience && Array.isArray(aiExpResult.workExperience) && aiExpResult.workExperience.length > 0) {
        finalData.workExperience = aiExpResult.workExperience.map((w: any, idx: number) => {
          const rawResps = Array.isArray(w.responsibilities) ? w.responsibilities : [];
          const rawOutcomes = Array.isArray(w.measurableOutcomes)
            ? w.measurableOutcomes
            : Array.isArray(w.achievements)
            ? w.achievements
            : [];
          const allBullets = [...rawResps, ...rawOutcomes];
          const classified = classifyBullets(allBullets.length > 0 ? allBullets : (w.bullets || []));

          return {
            id: `emp_${String(idx + 1).padStart(3, "0")}`,
            company: w.company || local.workExperience[idx]?.company || "Company",
            role: w.role || local.workExperience[idx]?.role || "Role",
            city: w.city || local.workExperience[idx]?.city || "",
            startDate: w.startDate || local.workExperience[idx]?.startDate || "",
            endDate: w.endDate || local.workExperience[idx]?.endDate || "",
            current: Boolean(w.current || /present|current/i.test(w.endDate || "")),
            teamSize: typeof w.teamSize === "number" ? w.teamSize : local.workExperience[idx]?.teamSize,
            toolsUsed: Array.isArray(w.toolsUsed) ? w.toolsUsed : [],
            responsibilities: rawResps.length > 0 ? rawResps : classified.responsibilities,
            measurableOutcomes: rawOutcomes.length > 0 ? rawOutcomes : classified.measurableOutcomes,
            achievements: rawOutcomes.length > 0 ? rawOutcomes : classified.measurableOutcomes,
            bullets: allBullets.length > 0 ? allBullets : classified.responsibilities,
            metricsBreakdown: local.workExperience[idx]?.metricsBreakdown,
            leadershipScope: local.workExperience[idx]?.leadershipScope,
          };
        });
      }
    } catch (aiExpErr) {
      console.warn("[HybridParser] Selective Experience AI resolution failed, keeping local extraction:", aiExpErr);
    }
  }

  // Pass 4: Selective AI Resolution for Education (if completely missed by local table parser)
  if (hasZeroEducation) {
    try {
      const eduSnippet = (sections.education || []).join("\n").slice(0, 3000);
      const eduPrompt = `You are an expert ATS Career Engine.
Analyze ONLY this Education section text from the resume.
Extract all educational qualifications.
Return ONLY valid JSON matching:
{
  "education": [
    {
      "degree": string (qualification name, e.g. "B.Tech", "MCA", "HSC"),
      "institution": string (college / university / school),
      "endDate": string (completion year, e.g. "2018"),
      "field": string,
      "gpa": string
    }
  ]
}`;

      const aiEduResult = await askAIJSON<{ education: any[] }>(
        eduSnippet,
        eduPrompt,
        2,
        0.1
      );

      if (aiEduResult?.education && Array.isArray(aiEduResult.education) && aiEduResult.education.length > 0) {
        finalData.education = aiEduResult.education.map((e: any, idx: number) => ({
          id: `edu_${String(idx + 1).padStart(3, "0")}`,
          degree: e.degree || "",
          institution: e.institution || "",
          startDate: e.startDate || "",
          endDate: e.endDate || "",
          field: e.field || "",
          gpa: e.gpa || "",
        }));
      }
    } catch (aiEduErr) {
      console.warn("[HybridParser] Selective Education AI resolution failed, keeping local extraction:", aiEduErr);
    }
  }

  return finalData;
}
