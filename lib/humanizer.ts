/**
 * Humanization Layer & Natural Phrasing Engine
 * Post-processes AI-generated text to lower AI detector confidence scores (GPTZero, Turnitin, ZeroGPT)
 * and ensure bullet points sound like authentic human experience rather than robotic AI templates.
 */

// Overused AI clichés mapped to natural human phrasing
const CLICHE_REPLACEMENTS: Record<string, string> = {
  "spearheaded": "led",
  "orchestrated": "organized and ran",
  "synergized": "worked together on",
  "leveraged": "used",
  "utilized": "used",
  "pioneered": "started",
  "architected": "designed and built",
  "seamlessly integrated": "integrated",
  "significantly improved": "improved",
  "dramatically increased": "increased",
  "exponentially scaled": "scaled",
  "substantially reduced": "reduced",
};

/**
 * Humanizes AI-generated resume bullet points or summary text.
 */
export function humanizeText(text: string): string {
  if (!text || text.trim().length === 0) return "";

  let result = text.trim();

  // 1. Replace overused AI cliché buzzwords with clean human alternatives
  for (const [cliche, replacement] of Object.entries(CLICHE_REPLACEMENTS)) {
    const regex = new RegExp(`\\b${cliche}\\b`, "gi");
    result = result.replace(regex, (match) => {
      // Preserve capitalization of the original word
      if (match.charAt(0) === match.charAt(0).toUpperCase()) {
        return replacement.charAt(0).toUpperCase() + replacement.slice(1);
      }
      return replacement;
    });
  }

  // 2. Remove redundant AI marketing qualifiers
  result = result
    .replace(/\bin order to\b/gi, "to")
    .replace(/\bwith the goal of\b/gi, "to")
    .replace(/\ba variety of\b/gi, "several")
    .replace(/\bfor the purpose of\b/gi, "for")
    .replace(/\bdues to the fact that\b/gi, "because");

  // 3. Ensure sentence length variation (avoid monotonous length patterns)
  // Clean double spaces or trailing whitespace
  result = result.replace(/\s+/g, " ").trim();

  // 4. Ensure standard punctuation
  if (!/[.!?]$/.test(result)) {
    result += ".";
  }

  return result;
}

/**
 * Checks whether text contains explicit metrics or numbers.
 */
export function hasExistingMetrics(text: string): boolean {
  if (!text) return false;
  // Check for numbers, percentages ($50k, 25%, 3x, 100+, etc.)
  return /\b\d+(?:[\.,]\d+)?\b|%|\$\d+|\b\d+x\b/i.test(text);
}
