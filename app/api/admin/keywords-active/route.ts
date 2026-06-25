import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import * as fs from "fs";
import * as path from "path";

export const dynamic = "force-dynamic";

const INDUSTRIES = [
  "general",
  "software_engineering",
  "data_science",
  "ai_engineering",
  "finance",
  "marketing",
  "product_management"
];

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const results: Record<string, { base: any[], dynamic: any[] }> = {};

    for (const industry of INDUSTRIES) {
      const basePath = path.join(process.cwd(), 'keywords', 'base', `${industry}.json`);
      const dynamicPath = path.join(process.cwd(), 'keywords', 'dynamic', `${industry}.json`);

      let baseKws = [];
      let dynKws = [];

      try {
        if (fs.existsSync(basePath)) baseKws = JSON.parse(fs.readFileSync(basePath, 'utf8')).keywords || [];
      } catch (e) {}

      try {
        if (fs.existsSync(dynamicPath)) dynKws = JSON.parse(fs.readFileSync(dynamicPath, 'utf8')).keywords || [];
      } catch (e) {}

      results[industry] = { base: baseKws, dynamic: dynKws };
    }

    return NextResponse.json({ success: true, data: results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
