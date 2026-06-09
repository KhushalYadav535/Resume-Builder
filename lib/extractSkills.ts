/**
 * List of highly sought-after industry technical capabilities.
 */
const TECHNICAL_DICTIONARY = [
  "javascript", "typescript", "react", "next.js", "nextjs", "node.js", "nodejs", "express",
  "python", "django", "flask", "fastapi", "java", "spring", "c++", "c#", "net", "ruby", "rails",
  "go", "golang", "php", "laravel", "html", "css", "tailwind", "sass", "angular", "vue",
  "sql", "postgresql", "mysql", "sqlite", "mongodb", "redis", "cassandra", "graphql", "rest api",
  "aws", "amazon web services", "azure", "gcp", "google cloud", "docker", "kubernetes", "git",
  "github", "gitlab", "ci/cd", "jenkins", "terraform", "ansible", "linux", "unix", "nginx",
  "apache", "firebase", "supabase", "prisma", "sequelize", "mongoose", "jest", "mocha", "cypress",
  "figma", "photoshop", "illustrator", "seo", "sem", "google analytics", "data structures",
  "algorithms", "system design", "machine learning", "deep learning", "nlp", "artificial intelligence",
  "tensorflow", "pytorch", "pandas", "numpy", "scikit-learn", "scikit learn", "tableau", "powerbi",
  "excel", "agile", "scrum", "jira", "webpack", "babel", "vite", "graphql", "restful", "microservices"
];

/**
 * List of professional soft competencies.
 */
const SOFT_DICTIONARY = [
  "leadership", "communication", "teamwork", "collaboration", "problem solving", "time management",
  "critical thinking", "adaptability", "creativity", "work ethic", "conflict resolution",
  "attention to detail", "emotional intelligence", "decision making", "organizational",
  "project management", "active listening", "presentation", "negotiation", "mentoring",
  "coaching", "flexibility", "empathy", "interpersonal", "public speaking", "resilience",
  "customer service", "problem-solving", "interpersonal skills", "time-management"
];

/**
 * Mapping of core skills to typical adjacent missing competencies to calculate gaps.
 */
const SKILL_DEPENDENCIES: Record<string, string[]> = {
  "react": ["next.js", "typescript", "tailwind"],
  "javascript": ["typescript", "react", "node.js"],
  "typescript": ["react", "next.js", "jest"],
  "python": ["django", "fastapi", "pandas", "numpy"],
  "node.js": ["express", "mongodb", "postgresql"],
  "docker": ["kubernetes", "terraform", "aws"],
  "aws": ["docker", "terraform", "gcp"],
  "sql": ["postgresql", "mysql", "database design"],
  "html": ["css", "javascript", "tailwind"],
  "figma": ["ui/ux design", "photoshop", "figma"]
};

export interface SkillAnalysis {
  technicalSkills: string[];
  softSkills: string[];
  missingSkills: string[];
  confidenceScore: number;
}

/**
 * Locally extracts, categorizes, and scores technical and soft skills from resume text.
 * Runs completely locally on the server (fast, free, rate-limit immune).
 */
export function extractSkills(text: string): SkillAnalysis {
  const cleanText = text.toLowerCase();
  
  const technicalSkills: string[] = [];
  const softSkills: string[] = [];

  // 1. Extract technical skills
  for (const tech of TECHNICAL_DICTIONARY) {
    // Avoid partial matches (e.g. "go" in "good") using regex word boundary
    const escaped = tech.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    if (regex.test(cleanText)) {
      // Normalize casing based on dictionary
      const originalCasing = TECHNICAL_DICTIONARY.find(t => t.toLowerCase() === tech) || tech;
      const formatted = originalCasing.charAt(0).toUpperCase() + originalCasing.slice(1);
      technicalSkills.push(formatted === "Nextjs" ? "Next.js" : formatted === "Nodejs" ? "Node.js" : formatted);
    }
  }

  // 2. Extract soft skills
  for (const soft of SOFT_DICTIONARY) {
    const escaped = soft.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    if (regex.test(cleanText)) {
      const originalCasing = SOFT_DICTIONARY.find(s => s.toLowerCase() === soft) || soft;
      const formatted = originalCasing.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      softSkills.push(formatted);
    }
  }

  // 3. Find missing skills based on dependencies
  const missingSkillsSet = new Set<string>();
  const detectedLower = [...technicalSkills, ...softSkills].map(s => s.toLowerCase());

  for (const detected of detectedLower) {
    if (SKILL_DEPENDENCIES[detected]) {
      for (const adj of SKILL_DEPENDENCIES[detected]) {
        if (!detectedLower.includes(adj.toLowerCase())) {
          // Format missing skill casing nicely
          const formatted = adj.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
          missingSkillsSet.add(formatted === "Nextjs" ? "Next.js" : formatted === "Nodejs" ? "Node.js" : formatted);
        }
      }
    }
  }

  // 4. Compute confidence density score
  // Baseline is 12 total competencies found
  const totalCompetencies = technicalSkills.length + softSkills.length;
  const confidenceScore = Math.min(100, Math.round((totalCompetencies / 12) * 100));

  return {
    technicalSkills,
    softSkills,
    missingSkills: Array.from(missingSkillsSet).slice(0, 5), // Limit to top 5 recommendations
    confidenceScore,
  };
}
