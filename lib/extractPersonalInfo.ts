import { PersonalInfo } from "@/types";

/**
 * Extracts personal information from raw resume text using heuristics and regex.
 * Runs completely locally on the server (fast, free, rate-limit immune).
 */
export function extractPersonalInfo(text: string): PersonalInfo {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const linkedinRegex = /linkedin\.com\/in\/[a-zA-Z0-9_-]+/;
  
  // Website regex excluding email domains, linkedin, and github
  const websiteRegex = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(\/[^\s]*)?/;

  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  
  // 1. Full Name: usually the first non-empty line
  let fullName = "Untitled Candidate";
  if (lines.length > 0) {
    for (const line of lines.slice(0, 3)) {
      if (
        !line.includes("@") && 
        !line.includes("linkedin.com") && 
        !line.includes("github.com") && 
        !line.includes("http") && 
        line.length > 2 && 
        line.length < 40 &&
        /^[a-zA-Z\s]+$/.test(line) // Must only contain letters and spaces
      ) {
        fullName = line;
        break;
      }
    }
  }

  const emailMatch = text.match(emailRegex);
  const phoneMatch = text.match(phoneRegex);
  const linkedinMatch = text.match(linkedinRegex);
  
  let website = "";
  const websiteMatches = text.match(new RegExp(websiteRegex, "gi"));
  if (websiteMatches) {
    for (const m of websiteMatches) {
      const lower = m.toLowerCase();
      if (!lower.includes("@") && !lower.includes("linkedin.com") && !lower.includes("github.com")) {
        website = m;
        break;
      }
    }
  }

  // Try finding location (e.g. "San Francisco, CA" or "New York, NY")
  let location = "";
  const locationRegex = /\b[A-Z][a-zA-Z\s]+,\s*[A-Z]{2}\b/; // e.g. City, ST
  const locationMatch = text.match(locationRegex);
  if (locationMatch) {
    location = locationMatch[0];
  } else {
    // Fallback search for common city indicators
    const commonCities = ["new york", "san francisco", "chicago", "london", "seattle", "boston", "austin", "mumbai", "pune", "bangalore"];
    for (const city of commonCities) {
      if (text.toLowerCase().includes(city)) {
        location = city.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
        break;
      }
    }
  }

  return {
    fullName,
    email: emailMatch ? emailMatch[0].trim() : "",
    phone: phoneMatch ? phoneMatch[0].trim() : "",
    linkedin: linkedinMatch ? linkedinMatch[0].trim() : "",
    location: location.trim(),
    website: website.trim(),
  };
}
