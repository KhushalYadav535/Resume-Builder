import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/isAdmin";
import * as fs from "fs";
import * as path from "path";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/keyword-base-add
 * Adds a keyword directly to a base keyword JSON file.
 */
export async function POST(req: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const { industry, keyword, weight, aliases } = await req.json();

    if (!industry || !keyword || weight === undefined) {
      return NextResponse.json({ error: "Missing required fields: industry, keyword, weight" }, { status: 400 });
    }

    const kwWeight = Math.max(1, Math.min(10, parseInt(weight)));
    const kwAliases = Array.isArray(aliases)
      ? aliases.map((a: string) => a.trim()).filter(Boolean)
      : typeof aliases === "string"
      ? aliases.split(",").map((a: string) => a.trim()).filter(Boolean)
      : [];

    const basePath = path.join(process.cwd(), "keywords", "base", `${industry}.json`);

    if (!fs.existsSync(basePath)) {
      return NextResponse.json({ error: `Category '${industry}' does not exist` }, { status: 404 });
    }

    let fileData: { industry: string; version: string; last_updated: string; keywords: any[] };
    try {
      fileData = JSON.parse(fs.readFileSync(basePath, "utf8"));
    } catch {
      return NextResponse.json({ error: "Could not parse category file" }, { status: 500 });
    }

    // Check for duplicate
    const exists = fileData.keywords.some(
      (k: any) => k.keyword.toLowerCase() === keyword.toLowerCase()
    );
    if (exists) {
      return NextResponse.json({ error: `Keyword '${keyword}' already exists in this category` }, { status: 409 });
    }

    fileData.keywords.push({
      keyword: keyword.trim(),
      weight: kwWeight,
      aliases: kwAliases,
    });
    fileData.last_updated = new Date().toISOString().split("T")[0];

    fs.writeFileSync(basePath, JSON.stringify(fileData, null, 2), "utf8");

    return NextResponse.json({
      success: true,
      added: { keyword: keyword.trim(), weight: kwWeight, aliases: kwAliases },
    });
  } catch (err: unknown) {
    console.error("keyword-base-add error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
