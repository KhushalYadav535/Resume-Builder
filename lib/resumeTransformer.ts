import { ResumeData, WorkExperience, Education, Project } from "@/types";

const ACTION_VERBS = [
  "Achieved", "Accelerated", "Architected", "Automated", "Built",
  "Coordinated", "Designed", "Developed", "Engineered", "Enhanced",
  "Executed", "Expanded", "Facilitated", "Implemented", "Improved",
  "Increased", "Innovated", "Led", "Leveraged", "Optimized",
  "Orchestrated", "Pioneered", "Redesigned", "Revamped", "Scaled",
  "Secured", "Spearheaded", "Transformed", "Generated", "Reduced"
];

export class ResumeTransformer {
  // ── Capitalize & Format Title ──
  transformJobTitle(title: string): string {
    if (!title) return "";
    return title
      .trim()
      .split(/\s+/)
      .map(word => {
        const lower = word.toLowerCase();
        if (["and", "of", "in", "for", "the", "at", "to", "on"].includes(lower)) return lower;
        if (["ui", "ux", "ai", "ml", "qa", "hr", "it", "cs", "ats"].includes(lower)) return lower.toUpperCase();
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(" ");
  }

  // ── Transform Phone Number ──
  transformPhone(phone: string): string {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, "");
    
    // Indian format: +91-XXXXX-XXXXX
    if (cleaned.startsWith("91") && cleaned.length === 12) {
      return `+91-${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 10) {
      return `+91-${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
    }
    
    // US format: +1-XXX-XXX-XXXX
    if (cleaned.startsWith("1") && cleaned.length === 11) {
      return `+1-${cleaned.slice(1, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }

    return phone.trim();
  }

  // ── Transform Bullet Achievement ──
  transformAchievement(bullet: string): string {
    if (!bullet) return "";
    let transformed = bullet.trim();

    // Remove weak filler openers
    transformed = transformed
      .replace(/^(?:responsible for|worked on|helped with|involved in|tasked with|assisted in|participated in)\s+/i, "")
      .trim();

    if (!transformed) return "";

    // Check if starts with an action verb
    const firstWord = transformed.split(/\s+/)[0].replace(/[^a-zA-Z]/g, "");
    const isActionVerb = ACTION_VERBS.some(
      v => v.toLowerCase() === firstWord.toLowerCase() || `${v.toLowerCase()}d` === firstWord.toLowerCase()
    );

    if (!isActionVerb && firstWord.length > 2) {
      // Capitalize first letter if valid, or prefix with Implemented
      transformed = transformed.charAt(0).toUpperCase() + transformed.slice(1);
    } else if (!isActionVerb) {
      transformed = "Implemented " + transformed;
    } else {
      transformed = transformed.charAt(0).toUpperCase() + transformed.slice(1);
    }

    // Ensure period termination
    if (!/[.!?]$/.test(transformed)) {
      transformed += ".";
    }

    return transformed;
  }

  // ── Enhance Achievement with Metrics ──
  enhanceWithMetrics(bullet: string, suggestedMetrics?: string): string {
    if (!bullet) return "";
    let transformed = this.transformAchievement(bullet);

    // If already has metrics/numbers, return as is
    if (/\d+|%/.test(transformed)) {
      return transformed;
    }

    if (suggestedMetrics) {
      const cleanMetrics = suggestedMetrics.trim();
      return transformed.replace(/\.$/, ` (${cleanMetrics}).`);
    }

    return transformed;
  }

  // ── Clean & Transform Summary ──
  transformSummary(summary: string, personalInfo?: any): string {
    if (!summary) return "";
    let cleaned = summary.trim().replace(/\s+/g, " ");

    // Strip leading "SUMMARY" or "PROFESSIONAL SUMMARY"
    cleaned = cleaned.replace(/^(?:summary|professional summary|executive summary|career summary|career objective|objective|profile|about me|overview)[:\s\-–—]*/i, "").trim();

    if (personalInfo?.fullName) {
      const nameEsc = personalInfo.fullName.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");
      cleaned = cleaned.replace(new RegExp(`^${nameEsc}[\\s|•,:\\-–—]*`, "i"), "").trim();
    }
    if (personalInfo?.email) {
      const emailEsc = personalInfo.email.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");
      cleaned = cleaned.replace(new RegExp(`${emailEsc}`, "gi"), "").trim();
    }

    cleaned = cleaned.replace(/^[|•,\-–—:\s]+/, "").trim();
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

    if (!/[.!?]$/.test(cleaned)) {
      cleaned += ".";
    }

    return cleaned;
  }

  // ── Transform Project ──
  transformProject(proj: Project): Project {
    if (!proj) return proj;
    let name = proj.name || "";
    let date = (proj as any).date || (proj as any).period || "";

    const monthsPattern = "(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)";
    const dateRegex = new RegExp(`(?:\\s+|^|(?<=[a-z]))(${monthsPattern}\\s*'?\\d{2,4}\\s*(?:[\\-–—to\\s]+\\s*(?:${monthsPattern}?\\s*'?\\d{2,4}|Present|Current))?)`, "i");

    const match = name.match(dateRegex);
    if (match) {
      if (!date) date = match[1].trim();
      name = name.replace(dateRegex, "").trim();
      name = name.replace(/[\-\|:\s]+$/, "").replace(/^[\-\|:\s]+/, "").trim();
    }

    let description = proj.description || "";
    description = description
      .replace(/^(?:Frontend|Backend|Fullstack|Software)\s+Development\s+Project(?:REACT\.JS|React\.js|CSS|HTML|JS|Javascript|,|\s)*/i, "")
      .replace(/^[|•,\-–—:\s]+/, "")
      .trim();

    return {
      ...proj,
      name: this.transformJobTitle(name),
      date,
      description,
    } as any;
  }

  // ── Transform Education ──
  transformEducation(edu: Education): Education {
    if (!edu) return edu;
    let institution = edu.institution || "";
    let degree = edu.degree || "";
    let field = edu.field || "";
    let startDate = edu.startDate || "";
    let endDate = edu.endDate || "";

    const singleMonthRegex = /^(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|\s|[\-–—])+$/i;

    if (singleMonthRegex.test(institution.trim())) {
      if (!startDate) startDate = institution.trim();
      institution = "";
    }

    const monthLeakRegex = /(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*[\-–—]*\s*$/gi;
    degree = degree.replace(monthLeakRegex, "").trim();
    field = field.replace(monthLeakRegex, "").trim();

    institution = institution.replace(/[\-\|:\s]+$/, "").replace(/^[\-\|:\s]+/, "").trim();
    degree = degree.replace(/[\-\|:\s]+$/, "").replace(/^[\-\|:\s]+/, "").trim();
    field = field.replace(/[\-\|:\s]+$/, "").replace(/^[\-\|:\s]+/, "").trim();

    return {
      ...edu,
      institution: this.transformJobTitle(institution),
      degree: this.transformJobTitle(degree),
      field: this.transformJobTitle(field),
      startDate,
      endDate,
    };
  }

  // ── Transform Complete Resume Data ──
  transformResume(resumeData: ResumeData): ResumeData {
    if (!resumeData) return resumeData;

    return {
      ...resumeData,
      personalInfo: {
        ...resumeData.personalInfo,
        fullName: this.transformJobTitle(resumeData.personalInfo?.fullName || ""),
        phone: this.transformPhone(resumeData.personalInfo?.phone || ""),
      },
      summary: this.transformSummary(resumeData.summary || "", resumeData.personalInfo),
      workExperience: (resumeData.workExperience || []).map(exp => ({
        ...exp,
        role: this.transformJobTitle(exp.role || ""),
        company: this.transformJobTitle(exp.company || ""),
        bullets: (exp.bullets || []).map(b => this.transformAchievement(b)),
      })),
      education: (resumeData.education || []).filter(e => e && (e.institution || e.degree || e.field)).map(edu => this.transformEducation(edu)),
      projects: (resumeData.projects || []).map(proj => this.transformProject(proj)),
    };
  }
}
