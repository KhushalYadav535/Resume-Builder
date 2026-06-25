import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { askAIJSON } from "@/lib/openrouter";
import * as fs from "fs";
import * as path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const { industry } = await req.json();
    if (!industry) {
      return NextResponse.json({ error: "Missing industry parameter" }, { status: 400 });
    }

    // Read existing keywords to prevent duplicates
    let existingKeywords: string[] = [];
    const basePath = path.join(process.cwd(), 'keywords', 'base', `${industry}.json`);
    const dynamicPath = path.join(process.cwd(), 'keywords', 'dynamic', `${industry}.json`);

    try {
      if (fs.existsSync(basePath)) {
        const baseData = JSON.parse(fs.readFileSync(basePath, 'utf8'));
        if (baseData.keywords) {
          existingKeywords = existingKeywords.concat(baseData.keywords.map((k: any) => k.keyword.toLowerCase()));
        }
      }
      if (fs.existsSync(dynamicPath)) {
        const dynData = JSON.parse(fs.readFileSync(dynamicPath, 'utf8'));
        if (dynData.keywords) {
          existingKeywords = existingKeywords.concat(dynData.keywords.map((k: any) => k.keyword.toLowerCase()));
        }
      }
    } catch (e) {
      console.warn("Could not read keywords for duplicate prevention", e);
    }

    const prompt = `You are an ATS market intelligence bot. For the ${industry} industry, analyze trending technologies, methodologies, and tools that have emerged or spiked in demand over the last 12-18 months. Currently, the system already knows these keywords: ${existingKeywords.join(', ')}. Generate 5-8 NEW high-value keywords that recruiters are looking for. Return only a raw JSON array of objects with 'keyword', 'weight' (5-10), and 'aliases' (string array). Do not include any markdown formatting like \`\`\`json. Return raw JSON array only.`;

    let newKeywords;
    try {
      newKeywords = await askAIJSON<any[]>(prompt, "You output raw JSON arrays only.");
    } catch (e) {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    // Insert into Supabase
    const inserts = newKeywords.map((kw: any) => ({
      industry,
      keyword: kw.keyword,
      weight: kw.weight || 5,
      aliases: kw.aliases || [],
      status: 'pending'
    }));

    const { error: insertError } = await supabase
      .from('pending_keywords')
      .insert(inserts);

    if (insertError) {
      console.error(insertError);
      return NextResponse.json({ error: "Failed to save to database" }, { status: 500 });
    }

    return NextResponse.json({ success: true, suggestions: inserts });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
