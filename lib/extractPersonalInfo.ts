import { PersonalInfo } from "@/types";

/**
 * Extracts personal information from raw resume text using heuristics and regex.
 * Runs completely locally on the server (fast, free, rate-limit immune).
 */
export function extractPersonalInfo(text: string): PersonalInfo {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phoneRegex = /(?:\+?\d{1,3}[\s\-.]?)?\(?\d{3,5}\)?[\s\-.]?\d{3,4}[\s\-.]?\d{4}/;
  const linkedinRegex = /linkedin\.com\/in\/[a-zA-Z0-9_%-]+/i;

  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  // ── 1. Full Name ─────────────────────────────────────────────────────────────
  // Scan first 8 lines for name (letters + spaces only, 1-5 words, 3-45 chars)
  let fullName = "Untitled Candidate";
  for (const line of lines.slice(0, 8)) {
    if (
      !line.includes("@") &&
      !line.includes("linkedin.com") &&
      !line.includes("github.com") &&
      !line.includes("http") &&
      !line.includes("|") &&
      !line.includes("+") &&
      !line.includes("/") &&
      line.length >= 3 &&
      line.length <= 45 &&
      /^[a-zA-Z]/.test(line) &&
      /^[a-zA-Z\s.\-']+$/.test(line)
    ) {
      const commonNonNames = /^(summary|summery|objective|profile|education|experience|skills|projects|certifications|languages|resume|cv|contact|references|phone|email|address|location)$/i;
      if (!commonNonNames.test(line.trim())) {
        fullName = line;
        break;
      }
    }
  }

  // ── 2. Email ─────────────────────────────────────────────────────────────────
  const emailMatch = text.match(emailRegex);

  // ── 3. Phone ─────────────────────────────────────────────────────────────────
  const phoneMatch = text.match(phoneRegex);

  // ── 4. LinkedIn ───────────────────────────────────────────────────────────────
  const linkedinMatch = text.match(linkedinRegex);

  // ── 5. Personal Website / Portfolio ──────────────────────────────────────────
  // Search ONLY in top 15 lines of header area to avoid picking up project URLs
  let website = "";
  const headerText = lines.slice(0, 15).join("\n");
  const websiteRegex = /(?:https?:\/\/|www\.)[a-zA-Z0-9.\-_]+(?:\/[^\s]*)?/gi;
  const webMatches = headerText.match(websiteRegex);
  if (webMatches) {
    for (const m of webMatches) {
      const lower = m.toLowerCase();
      if (!lower.includes("linkedin.com") && !lower.includes("github.com")) {
        website = m;
        break;
      }
    }
  }

  // ── 6. Location ──────────────────────────────────────────────────────────────
  let location = "";

  // Check top 15 lines for common cities
  const commonCities = [
    "new york", "san francisco", "chicago", "london", "seattle", "boston",
    "austin", "mumbai", "pune", "bangalore", "bengaluru", "hyderabad",
    "delhi", "new delhi", "chennai", "kolkata", "ahmedabad", "surat",
    "jaipur", "lucknow", "noida", "gurugram", "gurgaon", "vadodara", "gandhinagar",
    "indore", "bhopal", "kochi", "coimbatore", "toronto", "singapore", "dubai"
  ];

  const headerTextLower = headerText.toLowerCase();
  for (const city of commonCities) {
    if (headerTextLower.includes(city)) {
      location = city.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      break;
    }
  }

  // Fallback: "City, State" pattern if not matched by city list (excluding tech keywords)
  if (!location) {
    const locMatch = headerText.match(/\b([A-Z][a-zA-Z\s]{2,20}),\s*([A-Z]{2,3}|[A-Z][a-zA-Z\s]{2,15})\b/);
    if (locMatch) {
      const candidateLoc = locMatch[0];
      // Exclude matches that contain programming or technical framework terms
      const isTech = /framework|using|net|asp|c#|sql|js|react|angular|node|api|html|css/i.test(candidateLoc);
      if (!isTech) {
        location = candidateLoc;
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
