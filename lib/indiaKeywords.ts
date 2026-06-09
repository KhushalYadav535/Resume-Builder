export interface KeywordCategory {
  label: string;
  keywords: string[];
}

export const INDIA_KEYWORDS: Record<string, KeywordCategory> = {
  technical: {
    label: "Technical Skills",
    keywords: [
      "react", "next.js", "node.js", "typescript", "javascript", "python", "django", "java", "spring boot",
      "c++", "go", "golang", "sql", "postgresql", "mysql", "mongodb", "redis", "aws", "gcp", "docker",
      "kubernetes", "git", "github", "ci/cd", "rest api", "graphql", "microservices", "system design",
      "machine learning", "tensorflow", "pytorch", "pandas", "tableau", "power bi", "data structures"
    ]
  },
  domain: {
    label: "Domain Expertise",
    keywords: [
      "product management", "project management", "agile", "scrum", "business analysis", "financial modeling",
      "valuation", "portfolio management", "wealth management", "corporate finance", "risk management",
      "lead generation", "sales funnel", "conversion optimization", "revenue operations", "account management",
      "operations management", "supply chain", "logistics", "quality assurance"
    ]
  },
  compliance: {
    label: "Compliance & Standards",
    keywords: [
      "rbi guidelines", "sebi regulations", "kyc", "aml", "compliance audit", "fema", "gst", "tds",
      "iso 27001", "gdpr", "hipaa", "basel iii"
    ]
  }
};
