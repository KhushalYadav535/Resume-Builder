import { ResumeData } from "@/types";
import { TemplateType, TemplateConfig, TEMPLATE_CONFIGS } from "@/types/templates";
import { ValidationError } from "./resumeValidation";

export class TemplateAwareValidator {
  private config: TemplateConfig;

  constructor(templateType: string | TemplateType) {
    this.config = TEMPLATE_CONFIGS[templateType] || TEMPLATE_CONFIGS[TemplateType.JAKES_RESUME];
  }

  getTemplateConfig(): TemplateConfig {
    return this.config;
  }

  validateForTemplate(resumeData: ResumeData): ValidationError[] {
    const errors: ValidationError[] = [];
    if (!resumeData) return errors;

    const { personalInfo, summary, workExperience = [], education = [], skills = { technical: [], soft: [] } } = resumeData;

    // Check required fields for this template
    this.config.requiredFields.forEach((field) => {
      if (field === "fullName" && (!personalInfo?.fullName || personalInfo.fullName.trim().length < 2)) {
        errors.push({
          field: "fullName",
          message: `Full name is required for ${this.config.name}`,
          severity: "error",
        });
      }
      if (field === "email" && (!personalInfo?.email || !personalInfo.email.includes("@"))) {
        errors.push({
          field: "email",
          message: `Valid email is required for ${this.config.name}`,
          severity: "error",
        });
      }
      if (field === "phone" && (!personalInfo?.phone || personalInfo.phone.replace(/\D/g, "").length < 7)) {
        errors.push({
          field: "phone",
          message: `Phone number is required for ${this.config.name}`,
          severity: "error",
        });
      }
      if (field === "experience" && workExperience.length === 0) {
        errors.push({
          field: "experience",
          message: `Work Experience is required for ${this.config.name}`,
          severity: "error",
        });
      }
      if (field === "education" && education.length === 0) {
        errors.push({
          field: "education",
          message: `Education section is required for ${this.config.name}`,
          severity: "error",
        });
      }
      if (field === "skills" && (skills.technical.length === 0 && skills.soft.length === 0)) {
        errors.push({
          field: "skills",
          message: `Skills section is required for ${this.config.name}`,
          severity: "error",
        });
      }
    });

    // Summary length constraint
    if (this.config.constraints.maxSummaryLength > 0 && summary && summary.length > this.config.constraints.maxSummaryLength) {
      errors.push({
        field: "summary",
        message: `Summary in ${this.config.name} exceeds ${this.config.constraints.maxSummaryLength} characters (currently ${summary.length})`,
        severity: "warning",
      });
    }

    // Quantified achievement requirements
    if (this.config.constraints.requiresQuantifiedAchievements) {
      workExperience.forEach((exp, idx) => {
        const unquantified = (exp.bullets || []).filter(
          (b) => !/\b\d+(?:\.\d+)?%?|\b(?:increased|decreased|reduced|improved|grew|saved|generated|scaled|boosted)\b/i.test(b)
        );
        if (unquantified.length > 0) {
          errors.push({
            field: `experience[${idx}]`,
            message: `${this.config.name} prioritizes quantified achievements with metrics (e.g. "reduced latency by 40%")`,
            severity: "info",
          });
        }
      });
    }

    // Skills count constraint
    const totalSkills = (skills.technical || []).length + (skills.soft || []).length;
    if (totalSkills > this.config.constraints.maxSkillsCount) {
      errors.push({
        field: "skills",
        message: `${this.config.name} supports max ${this.config.constraints.maxSkillsCount} skills (you have ${totalSkills})`,
        severity: "warning",
      });
    }

    // Experience count suggestion
    if (workExperience.length > this.config.constraints.maxExperienceItems) {
      errors.push({
        field: "experience",
        message: `${this.config.name} suggests max ${this.config.constraints.maxExperienceItems} experience entries`,
        severity: "info",
      });
    }

    return errors;
  }
}
