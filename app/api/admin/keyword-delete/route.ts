import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/isAdmin";
import * as fs from "fs";
import * as path from "path";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/keyword-delete
 * Removes a keyword from a base or dynamic keyword JSON file.
 */
export async function POST(req: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const { industry, keyword, layer } = await req.json();

    if (!industry || !keyword || !layer) {
      return NextResponse.json({ error: "Missing required fields: industry, keyword, layer" }, { status: 400 });
    }

    if (!["base", "dynamic"].includes(layer)) {
      return NextResponse.json({ error: "layer must be 'base' or 'dynamic'" }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), "keywords", layer, `${industry}.json`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: `File not found for industry '${industry}' layer '${layer}'` }, { status: 404 });
    }

    let fileData: { keywords: any[] };
    try {
      fileData = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch {
      return NextResponse.json({ error: "Could not parse file" }, { status: 500 });
    }

    const before = fileData.keywords.length;
    fileData.keywords = fileData.keywords.filter(
      (k: any) => k.keyword.toLowerCase() !== keyword.toLowerCase()
    );

    if (fileData.keywords.length === before) {
      return NextResponse.json({ error: `Keyword '${keyword}' not found in this category` }, { status: 404 });
    }

    fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2), "utf8");

    return NextResponse.json({ success: true, deleted: keyword, remaining: fileData.keywords.length });
  } catch (err: unknown) {
    console.error("keyword-delete error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
