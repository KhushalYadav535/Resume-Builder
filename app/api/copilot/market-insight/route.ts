import { NextResponse } from "next/server";
import { askAI } from "@/lib/openrouter";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    // Auth check — prevent unauthenticated AI quota abuse
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
          },
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type } = body;

    if (!type || typeof type !== "string") {
      return NextResponse.json({ error: "'type' is required." }, { status: 400 });
    }

    if (type === "salary") {
      const { role, location, experience } = body;
      const prompt = `As an expert tech recruiter and compensation analyst, provide estimated current salary bands for the following:
      Role: ${role}
      Location: ${location}
      Experience Level: ${experience}
      
      Respond STRICTLY with a valid JSON object in this exact format:
      {
        "low": "$XXXk",
        "median": "$YYYk",
        "high": "$ZZZk",
        "insights": "2-3 sentences explaining market trends for this role in this location."
      }`;
      
      const responseText = await askAI("Provide salary data.", prompt);
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Invalid AI response format");
      return NextResponse.json(JSON.parse(jsonMatch[0]));
    }

    if (type === "visibility") {
      const { headline } = body;
      const prompt = `As an expert LinkedIn recruiter and ATS specialist, audit this LinkedIn headline for discoverability:
      Headline: "${headline}"
      
      Respond STRICTLY with a valid JSON object in this exact format:
      {
        "score": 0-100 (number),
        "feedback": ["point 1", "point 2"],
        "suggestedKeywords": ["keyword1", "keyword2"]
      }`;
      
      const responseText = await askAI("Provide visibility audit.", prompt);
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Invalid AI response format");
      return NextResponse.json(JSON.parse(jsonMatch[0]));
    }

    if (type === "company-research") {
      const { companyName } = body;
      const prompt = `As an expert career coach and industry analyst, provide a brief research summary for the company: "${companyName}".
      
      Respond STRICTLY with a valid JSON object in this exact format:
      {
        "culture": "A 2-3 sentence summary of their known corporate culture and core values.",
        "recentNews": "1-2 sentences on recent major news, shifts, or product launches.",
        "interviewStyle": "1-2 sentences on what they typically look for in interviews or their interview style."
      }`;
      
      const responseText = await askAI("Provide company research.", prompt);
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Invalid AI response format");
      return NextResponse.json(JSON.parse(jsonMatch[0]));
    }

    if (type === "market-timing") {
      const { industry } = body;
      const prompt = `As a macroeconomic labor market analyst, provide a real-time market timing alert for the industry: "${industry}".
      
      Respond STRICTLY with a valid JSON object in this exact format:
      {
        "trend": "bullish" | "bearish" | "stable",
        "hiringVelocity": "A short sentence on current hiring speed/volume in this sector.",
        "macroInsight": "1-2 sentences on recent layoffs, funding trends, or domain shifts to be aware of."
      }`;
      
      const responseText = await askAI("Provide market timing alerts.", prompt);
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Invalid AI response format");
      return NextResponse.json(JSON.parse(jsonMatch[0]));
    }

    if (type === "peer-benchmark") {
      const { role } = body;
      const prompt = `As a senior tech recruiter, generate an industry baseline profile for the role: "${role}".
      What does the average competitive candidate have?
      
      Respond STRICTLY with a valid JSON object in this exact format:
      {
        "averageAtsScore": 0-100 (number),
        "coreSkills": ["skill1", "skill2", "skill3", "skill4"]
      }`;
      
      const responseText = await askAI("Provide peer benchmark.", prompt);
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Invalid AI response format");
      return NextResponse.json(JSON.parse(jsonMatch[0]));
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error: unknown) {
    console.error("Market insight error:", error);
    return NextResponse.json({ error: "Failed to fetch market insight. Please try again." }, { status: 500 });
  }
}
