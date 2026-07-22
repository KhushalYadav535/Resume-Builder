/**
 * List of highly sought-after industry technical capabilities.
 */
const TECHNICAL_DICTIONARY = [
  "javascript", "typescript", "react", "next.js", "nextjs", "node.js", "nodejs", "express",
  "python", "django", "flask", "fastapi", "java", "spring", "c++", "c#", ".net", "net", "asp.net", "ruby", "rails",
  "go", "golang", "php", "laravel", "html", "css", "tailwind", "sass", "angular", "angularjs", "vue",
  "sql", "t-sql", "postgresql", "mysql", "sqlite", "mongodb", "redis", "cassandra", "graphql", "rest api", "web api",
  "aws", "amazon web services", "azure", "gcp", "google cloud", "docker", "kubernetes", "git",
  "github", "gitlab", "ci/cd", "jenkins", "terraform", "ansible", "linux", "unix", "nginx",
  "apache", "firebase", "supabase", "prisma", "sequelize", "mongoose", "jest", "nunit", "mstest", "moq", "cypress",
  "figma", "photoshop", "illustrator", "seo", "sem", "google analytics", "data structures",
  "algorithms", "system design", "machine learning", "deep learning", "nlp", "artificial intelligence",
  "tensorflow", "pytorch", "pandas", "numpy", "scikit-learn", "scikit learn", "tableau", "powerbi",
  "excel", "agile", "scrum", "jira", "tfs", "webpack", "babel", "vite", "graphql", "restful", "microservices",
  "entity framework", "visual studio", "sql server", "fiddler", "soap ui", "resharper", "nuget"
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

const SKILL_DEPENDENCIES: Record<string, string[]> = {
  "react": ["next.js", "typescript", "tailwind"],
  "javascript": ["typescript", "react", "node.js"],
  "typescript": ["react", "next.js", "jest"],
  "python": ["django", "fastapi", "pandas", "numpy"],
  "node.js": ["express", "mongodb", "postgresql"],
  "docker": ["kubernetes", "terraform", "aws"],
  "aws": ["docker", "terraform", "gcp"],
  "sql": ["postgresql", "mysql", "database design"],
  "c#": [".net core", "entity framework", "web api"],
  "angular": ["typescript", "rxjs", "web api"]
};

export interface SkillAnalysis {
  technicalSkills: string[];
  softSkills: string[];
  missingSkills: string[];
  confidenceScore: number;
}

/**
 * Locally extracts, categorizes, and scores technical and soft skills from resume text.
 * Also parses explicit skill lines from a TECHNICAL SKILLS section if provided.
 */
export function extractSkills(text: string, rawSkillLines?: string[]): SkillAnalysis {
  const cleanText = text.toLowerCase();
  
  const technicalSet = new Set<string>();
  const softSet = new Set<string>();

  // 1. Extract technical skills from dictionary match
  for (const tech of TECHNICAL_DICTIONARY) {
    const escaped = tech.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    if (regex.test(cleanText)) {
      // Normalize casing
      const formatted = tech === "net" ? ".NET" :
                        tech === "c#" ? "C#" :
                        tech === "asp.net" ? "ASP.NET" :
                        tech === "t-sql" ? "T-SQL" :
                        tech === "web api" ? "Web API" :
                        tech === "angularjs" ? "AngularJS" :
                        tech === "sql server" ? "SQL Server" :
                        tech === "entity framework" ? "Entity Framework" :
                        tech.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      technicalSet.add(formatted);
    }
  }

  // 2. Extract soft skills from dictionary match
  for (const soft of SOFT_DICTIONARY) {
    const escaped = soft.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    if (regex.test(cleanText)) {
      const formatted = soft.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      softSet.add(formatted);
    }
  }

  // 3. Extract explicit skills from rawSkillLines if available
  if (rawSkillLines && rawSkillLines.length > 0) {
    for (const line of rawSkillLines) {
      if (!line) continue;
      const clean = line.replace(/^[•\-\*■●▪▸◦]\s*/, "").trim();
      const colonIdx = clean.indexOf(":");
      const contentStr = colonIdx !== -1 ? clean.slice(colonIdx + 1).trim() : clean;

      const parts = contentStr.split(/[,;|]/).map(p => p.trim()).filter(Boolean);
      for (const p of parts) {
        const cleanedItem = p.replace(/\.$/, "").trim();
        // Skip standalone numbers (like "4.6" or "2019") or generic headers
        if (
          cleanedItem.length >= 2 &&
          cleanedItem.length <= 40 &&
          !/^\d+(?:\.\d+)?$/.test(cleanedItem)
        ) {
          technicalSet.add(cleanedItem);
        }
      }
    }
  }

  const technicalSkills = Array.from(technicalSet);
  const softSkills = Array.from(softSet);

  // 4. Find missing skills based on dependencies
  const missingSkillsSet = new Set<string>();
  const detectedLower = [...technicalSkills, ...softSkills].map(s => s.toLowerCase());

  for (const detected of detectedLower) {
    if (SKILL_DEPENDENCIES[detected]) {
      for (const adj of SKILL_DEPENDENCIES[detected]) {
        if (!detectedLower.includes(adj.toLowerCase())) {
          const formatted = adj.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
          missingSkillsSet.add(formatted);
        }
      }
    }
  }

  const totalCompetencies = technicalSkills.length + softSkills.length;
  const confidenceScore = Math.min(100, Math.round((totalCompetencies / 12) * 100));

  return {
    technicalSkills,
    softSkills,
    missingSkills: Array.from(missingSkillsSet).slice(0, 5),
    confidenceScore,
  };
}
