/**
 * Environment variables validation.
 * Throws descriptive errors if any critical keys are missing at startup.
 */

const requiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "OPENROUTER_API_KEY"
] as const;

export function validateEnv() {
  const missing: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Environment Configuration Error: Missing required environment variables:\n` +
      missing.map((key) => `- ${key}`).join("\n") +
      `\nPlease ensure these are defined in your .env.local file or production environment.`
    );
  }
}

// Auto-run validation on module load (startup)
validateEnv();
