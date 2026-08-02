import { ResumeData, PersonalInfo, WorkExperience, Education, Project } from "@/types";

export interface ValidationError {
  field: string;
  message: string;
  severity: "error" | "warning" | "info";
}

export class ResumeValidator {
  // ── Header Validation ──
  validateHeader(personalInfo: PersonalInfo): ValidationError[] {
    const errors: ValidationError[] = [];
    if (!personalInfo) {
      errors.push({ field: "personalInfo", message: "Personal details are required", severity: "error" });
      return errors;
    }

    // Name validation
    const fullName = (personalInfo.fullName || "").trim();
    if (!fullName || fullName.length < 2) {
      errors.push({
        field: "fullName",
        message: "Full name must be at least 2 characters",
        severity: "error",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!personalInfo.email || !emailRegex.test(personalInfo.email.trim())) {
      errors.push({
        field: "email",
        message: "Valid email address is required (e.g. name@domain.com)",
        severity: "error",
      });
    }

    // Phone validation
    const phoneDigits = (personalInfo.phone || "").replace(/\D/g, "");
    if (!personalInfo.phone || phoneDigits.length < 7) {
      errors.push({
        field: "phone",
        message: "Valid phone number is required (format: +91-XXXXX-XXXXX)",
        severity: "error",
      });
    }

    // LinkedIn URL validation
    if (personalInfo.linkedin && !this.isValidUrl(personalInfo.linkedin)) {
      errors.push({
        field: "linkedin",
        message: "Provide a valid LinkedIn profile URL or handle",
        severity: "warning",
      });
    }

    return errors;
  }

  // ── Work Experience Validation ──
  validateExperience(experiences: WorkExperience[]): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!experiences || experiences.length === 0) {
      errors.push({
        field: "workExperience",
        message: "At least 1 work experience entry is recommended for standard resumes",
        severity: "warning",
      });
      return errors;
    }

    experiences.forEach((exp, index) => {
      const prefix = `workExperience[${index}]`;

      if (!exp.role || exp.role.trim().length < 2) {
        errors.push({
          field: `${prefix}.role`,
          message: `Job title is required for experience #${index + 1}`,
          severity: "error",
        });
      }

      if (!exp.company || exp.company.trim().length < 2) {
        errors.push({
          field: `${prefix}.company`,
          message: `Company name is required for experience #${index + 1}`,
          severity: "error",
        });
      }

      // Achievement validation
      if (!exp.bullets || exp.bullets.length === 0) {
        errors.push({
          field: `${prefix}.bullets`,
          message: `At least 1 achievement bullet is required for ${exp.role || "experience"}`,
          severity: "error",
        });
      } else {
        exp.bullets.forEach((bullet, bIndex) => {
          const cleanBullet = bullet.trim();
          if (cleanBullet.length < 10) {
            errors.push({
              field: `${prefix}.bullets[${bIndex}]`,
              message: "Achievement bullet should be at least 10 characters",
              severity: "warning",
            });
          }

          if (cleanBullet.length > 250) {
            errors.push({
              field: `${prefix}.bullets[${bIndex}]`,
              message: "Achievement bullet should not exceed 250 characters for scannability",
              severity: "warning",
            });
          }

          if (!this.isQuantified(cleanBullet)) {
            errors.push({
              field: `${prefix}.bullets[${bIndex}]`,
              message: `Consider adding metrics/percentages to: "${cleanBullet.slice(0, 30)}..."`,
              severity: "info",
            });
          }
        });
      }
    });

    return errors;
  }

  // ── Education Validation ──
  validateEducation(educations: Education[]): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!educations || educations.length === 0) {
      errors.push({
        field: "education",
        message: "At least 1 education entry is required",
        severity: "error",
      });
      return errors;
    }

    educations.forEach((edu, index) => {
      const prefix = `education[${index}]`;

      if (!edu.degree || edu.degree.trim().length < 2) {
        errors.push({
          field: `${prefix}.degree`,
          message: `Degree or qualification title is required for education #${index + 1}`,
          severity: "error",
        });
      }

      if (!edu.institution || edu.institution.trim().length < 2) {
        errors.push({
          field: `${prefix}.institution`,
          message: `Institution name is required for education #${index + 1}`,
          severity: "error",
        });
      }

      if (edu.gpa) {
        const numGpa = parseFloat(edu.gpa);
        if (!isNaN(numGpa) && (numGpa < 0 || (edu.gpaType !== "percentage" && numGpa > 10))) {
          errors.push({
            field: `${prefix}.gpa`,
            message: "CGPA value should be between 0.0 and 10.0",
            severity: "warning",
          });
        }
      }
    });

    return errors;
  }

  // ── Skills Validation ──
  validateSkills(skills: ResumeData["skills"]): ValidationError[] {
    const errors: ValidationError[] = [];
    const tech = skills?.technical || [];
    const soft = skills?.soft || [];

    if (tech.length === 0 && soft.length === 0) {
      errors.push({
        field: "skills",
        message: "At least 1 technical or core skill is required",
        severity: "error",
      });
    }

    const totalSkills = tech.length + soft.length;
    if (totalSkills > 50) {
      errors.push({
        field: "skills",
        message: `Total skills should not exceed 50 (currently ${totalSkills})`,
        severity: "warning",
      });
    }

    return errors;
  }

  // ── Helpers ──
  private isValidUrl(url: string): boolean {
    if (url.includes("linkedin.com") || url.includes("github.com")) return true;
    try {
      new URL(url.startsWith("http") ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  }

  private isQuantified(text: string): boolean {
    return /\b\d+(?:\.\d+)?%?|\b(?:increased|decreased|reduced|improved|grew|saved|generated|scaled|boosted)\b/i.test(text);
  }

  // ── Run All Validations ──
  validateAll(resumeData: ResumeData): ValidationError[] {
    const allErrors: ValidationError[] = [];
    if (!resumeData) return allErrors;

    allErrors.push(...this.validateHeader(resumeData.personalInfo));
    allErrors.push(...this.validateExperience(resumeData.workExperience || []));
    allErrors.push(...this.validateEducation(resumeData.education || []));
    allErrors.push(...this.validateSkills(resumeData.skills || { technical: [], soft: [] }));

    return allErrors;
  }
}
