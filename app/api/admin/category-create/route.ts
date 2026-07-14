import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/isAdmin";
import * as fs from "fs";
import * as path from "path";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/category-create
 * Creates a brand new keyword category (base JSON file).
 * Admins can define the slug, display name, and initial set of keywords.
 */
export async function POST(req: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const { name, displayName, keywords } = await req.json();

    if (!name || !displayName) {
      return NextResponse.json({ error: "Missing required fields: name (slug), displayName" }, { status: 400 });
    }

    // Validate slug: lowercase, underscores only, no spaces or special chars
    const slug = name.toLowerCase().trim().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    if (!slug || slug.length < 2) {
      return NextResponse.json({ error: "Category slug must be at least 2 characters (letters, numbers, underscores)" }, { status: 400 });
    }

    const basePath = path.join(process.cwd(), "keywords", "base", `${slug}.json`);

    // Check if already exists
    if (fs.existsSync(basePath)) {
      return NextResponse.json({ error: `Category '${slug}' already exists` }, { status: 409 });
    }

    // Validate and normalize keywords
    const normalizedKeywords = Array.isArray(keywords)
      ? keywords
          .filter((k: any) => k.keyword && k.keyword.trim())
          .map((k: any) => ({
            keyword: String(k.keyword).trim(),
            weight: Math.max(1, Math.min(10, parseInt(k.weight) || 7)),
            aliases: Array.isArray(k.aliases)
              ? k.aliases.map((a: string) => String(a).trim()).filter(Boolean)
              : typeof k.aliases === "string"
              ? k.aliases.split(",").map((a: string) => a.trim()).filter(Boolean)
              : [],
          }))
      : [];

    const fileData = {
      industry: slug,
      version: "1.0",
      last_updated: new Date().toISOString().split("T")[0],
      display_name: displayName.trim(),
      keywords: normalizedKeywords,
    };

    // Ensure base directory exists
    const baseDir = path.join(process.cwd(), "keywords", "base");
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }

    fs.writeFileSync(basePath, JSON.stringify(fileData, null, 2), "utf8");

    return NextResponse.json({
      success: true,
      category: {
        slug,
        displayName: displayName.trim(),
        keywordCount: normalizedKeywords.length,
      },
    });
  } catch (err: any) {
    console.error("category-create error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * GET /api/admin/category-create
 * Returns list of all available categories (auto-discovered from filesystem).
 */
export async function GET(_req: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const baseDir = path.join(process.cwd(), "keywords", "base");
    const categories: { slug: string; displayName: string; keywordCount: number; lastUpdated: string }[] = [];

    if (fs.existsSync(baseDir)) {
      const files = fs.readdirSync(baseDir).filter(f => f.endsWith(".json"));
      for (const file of files) {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(baseDir, file), "utf8"));
          const slug = file.replace(".json", "");
          categories.push({
            slug,
            displayName: data.display_name || slug.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()),
            keywordCount: (data.keywords || []).length,
            lastUpdated: data.last_updated || "unknown",
          });
        } catch {
          // skip malformed files
        }
      }
    }

    return NextResponse.json({ success: true, categories });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
