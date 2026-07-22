/**
 * UpRole Credit Cost Constants
 * Source: UpRole Intent-Based Pricing & Credit System spec (UpRole.txt)
 *
 * Section 2.2 — Activity Credit Costs:
 *   AI Resume Edit (per section)   → 10 credits
 *   Full AI Resume Review          → 25 credits
 *   ATS Optimization Check         → 15 credits
 *   JD Matching                    → 10 credits
 *   Cover Letter Generation        → 20 credits
 *   LinkedIn Optimization          → 25 credits
 *   Mock Interview                 → 30 credits
 *   Career Journal entry           → Always Free
 *
 * New user signup bonus: 100 credits (Section 2.1)
 * Sprint / Pro / Interview Pack users: unlimited (no credit deduction)
 */
export const CREDIT_COSTS = {
  // ─── Exact spec activities ───────────────────────────────────────────────

  /** ATS Optimization Check — upload & parse a new resume */
  ANALYZE_RESUME: 15,

  /** Full AI Resume Review — deep LLM content review + optional JD match */
  DEEP_AI_ENHANCEMENT: 25,

  /** AI Resume Edit (per section) — rewrite suggestions for one text block */
  AI_REWRITE: 10,

  /** JD Matching — match resume against a job description */
  JD_MATCH: 10,

  /** Cover Letter Generation */
  COVER_LETTER: 20,

  /** LinkedIn Optimization */
  LINKEDIN_OPTIMIZATION: 25,

  /** Mock Interview — STAR answer generation */
  MOCK_INTERVIEW: 30,

  /** PDF Download — Generate/Print PDF */
  PDF_DOWNLOAD: 5,

  // ─── Feature-mapped activities (not listed separately in spec) ────────────
  // These are all AI calls that fall under "AI Resume Edit" (10) or
  // "ATS Optimization Check" (15) in the spec. Costs set accordingly.

  /** AI Improvements Generation — keyword-based ATS suggestion list
   *  Maps to: "AI Resume Edit" → 10 credits */
  AI_IMPROVEMENTS_GENERATE: 10,

  /** Comprehensive 12-dimension AI analysis
   *  Maps to: "ATS Optimization Check" → 15 credits */
  COMPREHENSIVE_AI_ANALYSIS: 15,

  /** Naukri / LinkedIn SEO tips generation (small AI call)
   *  Maps to: "AI Resume Edit" → 10 credits */
  NAUKRI_SEO_TIPS: 10,

  /** AI-generated patch to apply a Naukri/LinkedIn tip (small AI call)
   *  Maps to: "AI Resume Edit" → 10 credits */
  NAUKRI_APPLY_FIX: 10,

  // ─── Always-free operations ──────────────────────────────────────────────
  // Career Journal entries    → free (spec mandated)
  // Auto-Add Missing Keywords → local operation, no AI call
  // Apply Suggestions         → DB save only
} as const;

export type CreditCostKey = keyof typeof CREDIT_COSTS;
