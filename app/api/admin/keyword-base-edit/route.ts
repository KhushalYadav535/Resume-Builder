import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/isAdmin";
import * as fs from "fs";
import * as path from "path";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/keyword-base-edit
 * Edits an existing keyword in a base category file.
 */
export async function POST(req: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const { industry, originalKeyword, updated } = await req.json();

    if (!industry || !originalKeyword || !updated?.keyword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

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

    const idx = fileData.keywords.findIndex(
      (k: any) => k.keyword.toLowerCase() === originalKeyword.toLowerCase()
    );

    if (idx === -1) {
      return NextResponse.json({ error: `Keyword '${originalKeyword}' not found` }, { status: 404 });
    }

    const kwWeight = Math.max(1, Math.min(10, parseInt(updated.weight ?? fileData.keywords[idx].weight)));
    const kwAliases = Array.isArray(updated.aliases)
      ? updated.aliases.map((a: string) => a.trim()).filter(Boolean)
      : typeof updated.aliases === "string"
      ? updated.aliases.split(",").map((a: string) => a.trim()).filter(Boolean)
      : fileData.keywords[idx].aliases || [];

    fileData.keywords[idx] = {
      ...fileData.keywords[idx],
      keyword: updated.keyword.trim(),
      weight: kwWeight,
      aliases: kwAliases,
    };

    fileData.last_updated = new Date().toISOString().split("T")[0];

    fs.writeFileSync(basePath, JSON.stringify(fileData, null, 2), "utf8");

    return NextResponse.json({ success: true, updated: fileData.keywords[idx] });
  } catch (err: unknown) {
    console.error("keyword-base-edit error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
