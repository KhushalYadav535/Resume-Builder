import { createClient } from "@/utils/supabase/server";

async function logAIRequest(model: string, success: boolean, tokensEstimated: number = 500) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from("ai_requests").insert({
      user_id: user?.id || null,
      model_used: model,
      tokens_estimated: tokensEstimated,
      success
    });
  } catch (err: any) {
    console.warn("Failed to log AI request to database:", err?.message || err);
  }
}

const OPENROUTER_MODELS = [
  "google/gemma-4-31b-it:free",                  // Google Gemma 4 (highly capable, non-Venice)
  "openrouter/free",                             // Smart router that auto-allocates an available free model
  "z-ai/glm-4.5-air:free",                       // Zhipu GLM (highly available, non-Venice)
  "poolside/laguna-xs.2:free",                   // Poolside (highly available, non-Venice)
  "liquid/lfm-2.5-1.2b-instruct:free",           // Liquid LFM (highly available, non-Venice)
  "meta-llama/llama-3.3-70b-instruct:free",      // Venice fallback
  "qwen/qwen3-coder:free",                       // Venice fallback
  "meta-llama/llama-3.2-3b-instruct:free"        // Venice fallback
];

/**
 * Robust helper to fetch completions from OpenRouter using a cascading model chain
 * to self-heal when free-tier models encounter upstream rate limits.
 */
async function fetchOpenRouter(messages: any[], temperature: number, maxTokens: number): Promise<string> {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (!openRouterKey || openRouterKey.startsWith("your-") || openRouterKey === "sk-or-your-key-here") {
    throw new Error(
      "AI Configuration Error: No active OpenRouter key found. " +
      "Please configure OPENROUTER_API_KEY in your .env.local file."
    );
  }

  let lastError: any = null;

  for (const model of OPENROUTER_MODELS) {
    try {
      console.log(`[OpenRouter] Attempting generation with model: ${model}...`);
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openRouterKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://resume-optimizer.vercel.app",
          "X-Title": "Resume Optimizer",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(`API Error: ${JSON.stringify(data.error)}`);
      }

      const content = data.choices?.[0]?.message?.content;
      if (!content || !content.trim()) {
        throw new Error("Empty content returned.");
      }

      console.log(`[OpenRouter] Successfully generated response using model: ${model}`);
      await logAIRequest(model, true, maxTokens);
      return content;
    } catch (err: any) {
      console.warn(`[OpenRouter] Model ${model} failed:`, err.message || err);
      await logAIRequest(model, false, maxTokens);
      lastError = err;
    }
  }

  throw new Error(`OpenRouter failover exhausted. All fallback models failed. Last error: ${lastError?.message || lastError}`);
}

/**
 * Text generation helper.
 * Deploys OpenRouter models chain.
 */
const INDIAN_MARKET_GUIDELINE = "Guidelines: When discussing financial metrics, budgets, salaries, package targets, scale, or metrics, use Indian currency symbols (₹, Rupee) and conventions (Lakhs, Crores, LPA, e.g. 15 LPA) rather than Western formats ($ or USD).";

export async function askAI(prompt: string, systemPrompt?: string): Promise<string> {
  const combinedSystem = systemPrompt
    ? `${systemPrompt}\n\n${INDIAN_MARKET_GUIDELINE}`
    : INDIAN_MARKET_GUIDELINE;

  try {
    const messages = [
      { role: "system", content: combinedSystem },
      { role: "user", content: prompt }
    ];

    const content = await fetchOpenRouter(messages, 0.7, 2000);

    console.log("--- OpenRouter Raw Text Response ---");
    console.log(content);
    console.log("-------------------------------------");

    return content;
  } catch (err: any) {
    console.error("AI Client Failure (OpenRouter failed):", err);
    throw new Error(`AI Client Failure: ${err.message || String(err)}`);
  }
}

/**
 * JSON generation helper.
 * Deploys OpenRouter models chain.
 */
export async function askAIJSON<T>(prompt: string, systemPrompt?: string): Promise<T> {
  const combinedSystem = (systemPrompt ? `${systemPrompt}\n\n` : "") + 
    INDIAN_MARKET_GUIDELINE + 
    "\n\nYou must respond ONLY with valid JSON. No explanation, no markdown, no backticks. Ensure ALL property names are double-quoted. Do NOT include any trailing commas. Just raw JSON.";

  try {
    const messages = [
      { role: "system", content: combinedSystem },
      { role: "user", content: prompt }
    ];

    const rawResponse = await fetchOpenRouter(messages, 0.7, 4000);

    console.log("--- OpenRouter Raw JSON Response ---");
    console.log(rawResponse);
    console.log("-------------------------------------");

    const clean = rawResponse.replace(/```json|```/g, "").trim();
    
    // Helper to fix common AI trailing comma errors
    const sanitizeJSON = (str: string) => str.replace(/,\s*([\]}])/g, '$1');
    const sanitizedClean = sanitizeJSON(clean);

    try {
      return JSON.parse(sanitizedClean) as T;
    } catch (parseError: any) {
      // Try array first (for askAIJSON<any[]> cases)
      const matchArr = clean.match(/\[[\s\S]*\]/);
      if (matchArr) {
        try { return JSON.parse(sanitizeJSON(matchArr[0])) as T; } catch(e) {}
      }
      
      // Try object next
      const matchObj = clean.match(/\{[\s\S]*\}/);
      if (matchObj) {
        try { return JSON.parse(sanitizeJSON(matchObj[0])) as T; } catch(e) {}
      }

      // Ultimate Fallback: Extract all flat JSON objects individually (ignores bad objects & truncation)
      const flatObjects = clean.match(/\{[^{}]+\}/g);
      if (flatObjects && flatObjects.length > 0) {
        const parsed = [];
        for (const objStr of flatObjects) {
          try {
            // Fix unquoted keys for this specific object if needed
            let fixed = objStr.replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3');
            parsed.push(JSON.parse(sanitizeJSON(fixed)));
          } catch(e) {}
        }
        if (parsed.length > 0) {
          return parsed as any;
        }
      }
      
      throw new Error("AI returned invalid JSON: " + parseError.message);
    }
  } catch (err: any) {
    console.error("AI Client JSON Failure (OpenRouter failed):", err);
    throw new Error(`AI Client JSON Failure: ${err.message || String(err)}`);
  }
}