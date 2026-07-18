import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/isAdmin";
import * as fs from "fs";
import * as path from "path";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const baseDir = path.join(process.cwd(), "keywords", "base");
    const dynamicDir = path.join(process.cwd(), "keywords", "dynamic");

    // Auto-discover all categories from the base directory
    const industries: string[] = [];
    if (fs.existsSync(baseDir)) {
      fs.readdirSync(baseDir)
        .filter(f => f.endsWith(".json"))
        .forEach(f => industries.push(f.replace(".json", "")));
    }

    const results: Record<string, { base: any[]; dynamic: any[]; displayName: string }> = {};

    for (const industry of industries) {
      const basePath = path.join(baseDir, `${industry}.json`);
      const dynamicPath = path.join(dynamicDir, `${industry}.json`);

      let baseKws: any[] = [];
      let dynKws: any[] = [];
      let displayName = industry.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());

      try {
        if (fs.existsSync(basePath)) {
          const parsed = JSON.parse(fs.readFileSync(basePath, "utf8"));
          baseKws = parsed.keywords || [];
          if (parsed.display_name) displayName = parsed.display_name;
        }
      } catch (e) {}

      try {
        if (fs.existsSync(dynamicPath)) {
          dynKws = JSON.parse(fs.readFileSync(dynamicPath, "utf8")).keywords || [];
        }
      } catch (e) {}

      results[industry] = { base: baseKws, dynamic: dynKws, displayName };
    }

    return NextResponse.json({ success: true, data: results });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
