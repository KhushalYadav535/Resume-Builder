export enum TemplateType {
  JAKES_RESUME = "jakes-resume",
  ALTACV_MODERN = "altacv-modern",
  CURVE_TIMELINE = "curve-timeline",
  HIPSTER_SIDEBAR = "hipster-sidebar",
  DEEDY_CS = "deedy-cs",
  AWESOME_CORPORATE = "awesome-corporate",
  PLASMATI_ACADEMIC = "plasmati-academic",
}

export interface TemplateConfig {
  id: TemplateType;
  name: string;
  description: string;
  subtitle: string;
  icon?: string;

  // Layout specs
  layout: {
    columns: 1 | 2;
    maxWidth: string;
    sidebarPosition?: "left" | "right";
    sidebarWidth?: string;
  };

  // Font specs
  typography: {
    fontFamily: string;
    bodySize: number;
    headingSize: number;
    accent?: string;
  };

  // Color scheme
  colors: {
    primary: string;
    secondary?: string;
    accent?: string;
    sidebar?: string;
    text: string;
    background: string;
  };

  // What sections are shown
  sections: {
    header: boolean;
    summary: boolean;
    experience: boolean;
    education: boolean;
    skills: boolean;
    projects: boolean;
    certifications: boolean;
    awards?: boolean;
  };

  // Section-specific configs
  sectionConfigs: {
    experience?: {
      dateAlignment: "left" | "right";
      showDescription: boolean;
      achievementsFormat: "bullets" | "paragraph";
      maxBullets: number;
    };
    skills?: {
      format: "list" | "tags" | "bars" | "pill";
      categorized: boolean;
      colorCoded: boolean;
      maxPerRow: number;
    };
    education?: {
      dateAlignment: "left" | "right";
      showCourses: boolean;
      showGPA: boolean;
    };
  };

  // Constraints
  constraints: {
    maxSummaryLength: number;
    maxBulletLength: number;
    maxSkillsCount: number;
    maxExperienceItems: number;
    maxEducationItems: number;
    requiresQuantifiedAchievements: boolean;
    requiresMetrics: boolean;
    minAchievementsPerJob: number;
  };

  // Required & Optional fields
  requiredFields: string[];
  optionalFields: string[];
  hiddenFields: string[];

  // Metadata
  bestFor: string;
  targetAudience: string[];
  strengths: string[];
}

export const TEMPLATE_CONFIGS: Record<string, TemplateConfig> = {
  [TemplateType.JAKES_RESUME]: {
    id: TemplateType.JAKES_RESUME,
    name: "Jake's Resume ⭐",
    description: "Gold standard SWE template",
    subtitle: "Compact, right-aligned dates. 100% ATS.",
    layout: {
      columns: 1,
      maxWidth: "8.5in",
    },
    typography: {
      fontFamily: "Arial, Calibri, sans-serif",
      bodySize: 11,
      headingSize: 12,
    },
    colors: {
      primary: "#000000",
      text: "#000000",
      background: "#FFFFFF",
    },
    sections: {
      header: true,
      summary: true,
      experience: true,
      education: true,
      skills: true,
      projects: true,
      certifications: true,
    },
    sectionConfigs: {
      experience: {
        dateAlignment: "right",
        showDescription: false,
        achievementsFormat: "bullets",
        maxBullets: 5,
      },
      skills: {
        format: "list",
        categorized: true,
        colorCoded: false,
        maxPerRow: 1,
      },
    },
    constraints: {
      maxSummaryLength: 200,
      maxBulletLength: 150,
      maxSkillsCount: 30,
      maxExperienceItems: 5,
      maxEducationItems: 3,
      requiresQuantifiedAchievements: true,
      requiresMetrics: true,
      minAchievementsPerJob: 2,
    },
    requiredFields: ["fullName", "email", "phone", "experience", "education"],
    optionalFields: ["linkedin", "github", "website", "summary", "projects"],
    hiddenFields: [],
    bestFor: "Software Engineers",
    targetAudience: ["Tech professionals", "SWE candidates"],
    strengths: ["ATS-friendly", "Clean", "Professional"],
  },

  [TemplateType.ALTACV_MODERN]: {
    id: TemplateType.ALTACV_MODERN,
    name: "AltaCV Modern",
    description: "2-column asymmetric with colored sidebar",
    subtitle: "Colored sidebar & pill skill tags.",
    layout: {
      columns: 2,
      maxWidth: "8.5in",
      sidebarPosition: "left",
      sidebarWidth: "2.5in",
    },
    typography: {
      fontFamily: "Helvetica, sans-serif",
      bodySize: 10,
      headingSize: 14,
      accent: "Open Sans",
    },
    colors: {
      primary: "#8B1A1A",
      secondary: "#C9A84C",
      accent: "#8B1A1A",
      sidebar: "#8B1A1A",
      text: "#333333",
      background: "#FFFFFF",
    },
    sections: {
      header: true,
      summary: false,
      experience: true,
      education: true,
      skills: true,
      projects: false,
      certifications: false,
    },
    sectionConfigs: {
      experience: {
        dateAlignment: "left",
        showDescription: false,
        achievementsFormat: "bullets",
        maxBullets: 3,
      },
      skills: {
        format: "pill",
        categorized: false,
        colorCoded: true,
        maxPerRow: 3,
      },
    },
    constraints: {
      maxSummaryLength: 0,
      maxBulletLength: 120,
      maxSkillsCount: 25,
      maxExperienceItems: 4,
      maxEducationItems: 2,
      requiresQuantifiedAchievements: false,
      requiresMetrics: false,
      minAchievementsPerJob: 1,
    },
    requiredFields: ["fullName", "email", "skills"],
    optionalFields: ["phone", "linkedin", "github", "experience", "education"],
    hiddenFields: ["summary", "projects"],
    bestFor: "Creative & Modern Professionals",
    targetAudience: ["Designers", "Creative roles", "Modern companies"],
    strengths: ["Visually appealing", "Modern", "Creative"],
  },

  [TemplateType.CURVE_TIMELINE]: {
    id: TemplateType.CURVE_TIMELINE,
    name: "CurVe Timeline",
    description: "Marginal-date grid with academic serif",
    subtitle: "Best for academics & finance.",
    layout: {
      columns: 1,
      maxWidth: "8.5in",
    },
    typography: {
      fontFamily: "Georgia, serif",
      bodySize: 10.5,
      headingSize: 12,
    },
    colors: {
      primary: "#1A4A7A",
      text: "#1A4A7A",
      background: "#FFFFFF",
    },
    sections: {
      header: true,
      summary: true,
      experience: true,
      education: true,
      skills: true,
      projects: false,
      certifications: true,
    },
    sectionConfigs: {
      experience: {
        dateAlignment: "left",
        showDescription: true,
        achievementsFormat: "bullets",
        maxBullets: 4,
      },
      skills: {
        format: "list",
        categorized: true,
        colorCoded: false,
        maxPerRow: 1,
      },
    },
    constraints: {
      maxSummaryLength: 300,
      maxBulletLength: 200,
      maxSkillsCount: 40,
      maxExperienceItems: 6,
      maxEducationItems: 4,
      requiresQuantifiedAchievements: false,
      requiresMetrics: false,
      minAchievementsPerJob: 1,
    },
    requiredFields: ["fullName", "education"],
    optionalFields: ["email", "phone", "experience", "skills"],
    hiddenFields: [],
    bestFor: "Academics & Finance",
    targetAudience: ["Professors", "Researchers", "Finance professionals"],
    strengths: ["Academic", "Professional", "Elegant"],
  },

  [TemplateType.HIPSTER_SIDEBAR]: {
    id: TemplateType.HIPSTER_SIDEBAR,
    name: "Hipster Sidebar",
    description: "Bold dark header + sidebar skill bars",
    subtitle: "Best for creative & marketing.",
    layout: {
      columns: 2,
      maxWidth: "8.5in",
      sidebarPosition: "right",
      sidebarWidth: "3in",
    },
    typography: {
      fontFamily: "Arial, sans-serif",
      bodySize: 11,
      headingSize: 13,
    },
    colors: {
      primary: "#E94560",
      sidebar: "#1F1F1F",
      text: "#333333",
      background: "#FFFFFF",
    },
    sections: {
      header: true,
      summary: false,
      experience: true,
      education: true,
      skills: true,
      projects: false,
      certifications: false,
    },
    sectionConfigs: {
      skills: {
        format: "bars",
        categorized: false,
        colorCoded: true,
        maxPerRow: 1,
      },
    },
    constraints: {
      maxSummaryLength: 0,
      maxBulletLength: 150,
      maxSkillsCount: 20,
      maxExperienceItems: 4,
      maxEducationItems: 2,
      requiresQuantifiedAchievements: false,
      requiresMetrics: false,
      minAchievementsPerJob: 1,
    },
    requiredFields: ["fullName", "skills"],
    optionalFields: ["email", "phone", "linkedin", "experience", "education"],
    hiddenFields: ["summary", "projects"],
    bestFor: "Creative & Marketing",
    targetAudience: ["Designers", "Marketing professionals", "Creative roles"],
    strengths: ["Creative", "Modern", "Bold"],
  },

  [TemplateType.DEEDY_CS]: {
    id: TemplateType.DEEDY_CS,
    name: "Deedy CS",
    description: "Legendary dense 2-column layout",
    subtitle: "Top choice for CS students.",
    layout: {
      columns: 2,
      maxWidth: "8.5in",
      sidebarPosition: "right",
      sidebarWidth: "2.5in",
    },
    typography: {
      fontFamily: "Helvetica, sans-serif",
      bodySize: 9,
      headingSize: 11,
    },
    colors: {
      primary: "#005CC5",
      text: "#333333",
      background: "#FFFFFF",
    },
    sections: {
      header: true,
      summary: false,
      experience: true,
      education: true,
      skills: true,
      projects: true,
      certifications: false,
    },
    sectionConfigs: {
      experience: {
        dateAlignment: "right",
        showDescription: false,
        achievementsFormat: "bullets",
        maxBullets: 4,
      },
      skills: {
        format: "list",
        categorized: true,
        colorCoded: false,
        maxPerRow: 2,
      },
    },
    constraints: {
      maxSummaryLength: 0,
      maxBulletLength: 120,
      maxSkillsCount: 40,
      maxExperienceItems: 5,
      maxEducationItems: 3,
      requiresQuantifiedAchievements: true,
      requiresMetrics: true,
      minAchievementsPerJob: 2,
    },
    requiredFields: ["fullName", "email", "phone", "experience", "education", "skills"],
    optionalFields: ["linkedin", "github", "projects"],
    hiddenFields: ["summary"],
    bestFor: "Computer Science Students",
    targetAudience: ["CS students", "New graduates", "Tech internship seekers"],
    strengths: ["Dense", "Compact", "Fits more content"],
  },

  [TemplateType.AWESOME_CORPORATE]: {
    id: TemplateType.AWESOME_CORPORATE,
    name: "Awesome Corporate",
    description: "Extremely clean, premium 1-column",
    subtitle: "Premium corporate layout.",
    layout: {
      columns: 1,
      maxWidth: "8.5in",
    },
    typography: {
      fontFamily: "Calibri, Arial, sans-serif",
      bodySize: 11,
      headingSize: 12,
    },
    colors: {
      primary: "#DC3522",
      accent: "#DC3522",
      text: "#333333",
      background: "#FFFFFF",
    },
    sections: {
      header: true,
      summary: true,
      experience: true,
      education: true,
      skills: true,
      projects: false,
      certifications: true,
    },
    sectionConfigs: {
      experience: {
        dateAlignment: "right",
        showDescription: true,
        achievementsFormat: "bullets",
        maxBullets: 4,
      },
      skills: {
        format: "list",
        categorized: true,
        colorCoded: false,
        maxPerRow: 1,
      },
    },
    constraints: {
      maxSummaryLength: 250,
      maxBulletLength: 140,
      maxSkillsCount: 35,
      maxExperienceItems: 5,
      maxEducationItems: 3,
      requiresQuantifiedAchievements: true,
      requiresMetrics: true,
      minAchievementsPerJob: 2,
    },
    requiredFields: ["fullName", "email", "phone", "experience", "education"],
    optionalFields: ["linkedin", "summary", "skills", "certifications"],
    hiddenFields: [],
    bestFor: "Corporate & Executive",
    targetAudience: ["Executives", "Corporate professionals", "Senior roles"],
    strengths: ["Professional", "Clean", "Premium"],
  },

  [TemplateType.PLASMATI_ACADEMIC]: {
    id: TemplateType.PLASMATI_ACADEMIC,
    name: "Plasmati Academic",
    description: "Classic serif, spacious layout",
    subtitle: "Perfect for early-career/academics.",
    layout: {
      columns: 1,
      maxWidth: "8.5in",
    },
    typography: {
      fontFamily: "Georgia, serif",
      bodySize: 11,
      headingSize: 13,
    },
    colors: {
      primary: "#2E475D",
      text: "#1F1F1F",
      background: "#FFFFFF",
    },
    sections: {
      header: true,
      summary: true,
      experience: true,
      education: true,
      skills: true,
      projects: true,
      certifications: true,
    },
    sectionConfigs: {
      experience: {
        dateAlignment: "right",
        showDescription: true,
        achievementsFormat: "bullets",
        maxBullets: 4,
      },
    },
    constraints: {
      maxSummaryLength: 300,
      maxBulletLength: 160,
      maxSkillsCount: 35,
      maxExperienceItems: 6,
      maxEducationItems: 4,
      requiresQuantifiedAchievements: false,
      requiresMetrics: false,
      minAchievementsPerJob: 1,
    },
    requiredFields: ["fullName", "education"],
    optionalFields: ["email", "phone", "linkedin", "experience", "skills", "projects"],
    hiddenFields: [],
    bestFor: "Early-career & Academics",
    targetAudience: ["Recent graduates", "PhD candidates", "Academics"],
    strengths: ["Academic", "Elegant", "Spacious"],
  },
};
