import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { apiLimiter, getIP } from "@/lib/rateLimit";

const MAX_SIZES = {
  pdf: 10 * 1024 * 1024, // 10MB
  docx: 10 * 1024 * 1024, // 10MB
  txt: 2 * 1024 * 1024, // 2MB
};

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt"];

export async function POST(req: NextRequest) {
  try {
    try {
      await apiLimiter.check(30, getIP(req));
    } catch {
      return NextResponse.json(
        { error: "Too many parse requests. Please try again later." },
        { status: 429 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    const ext = ALLOWED_EXTENSIONS.find((e) => fileName.endsWith(e));
    
    if (!ext) {
      return NextResponse.json({ error: "File extension not allowed." }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "MIME type not allowed." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Size limits based on extension
    if (ext === ".pdf" && buffer.length > MAX_SIZES.pdf) {
      return NextResponse.json({ error: "PDF exceeds 10MB limit." }, { status: 400 });
    }
    if (ext === ".docx" && buffer.length > MAX_SIZES.docx) {
      return NextResponse.json({ error: "DOCX exceeds 10MB limit." }, { status: 400 });
    }
    if (ext === ".txt" && buffer.length > MAX_SIZES.txt) {
      return NextResponse.json({ error: "TXT exceeds 2MB limit." }, { status: 400 });
    }

    // Magic Bytes Validation
    // file-type package is ESM only. Dynamic import required.
    const { fileTypeFromBuffer } = await import("file-type");
    const fileType = await fileTypeFromBuffer(buffer);

    let text = "";

    if (ext === ".pdf") {
      if (!fileType || fileType.mime !== "application/pdf") {
        return NextResponse.json({ error: "Invalid file signature. Not a valid PDF." }, { status: 400 });
      }
      try {
        const pdfParseImport = await import("pdf-parse");
        const pdfParse = (pdfParseImport as any).default || (pdfParseImport as any).PDFParse || pdfParseImport;
        const parsed = await pdfParse(Buffer.from(buffer));
        text = parsed?.text || "";
      } catch (pdfError) {
        console.error("PDF Parse Error:", pdfError);
        return NextResponse.json({ error: "Failed to parse PDF file" }, { status: 500 });
      }
    } else if (ext === ".docx") {
      if (!fileType || fileType.mime !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        // Fallback for docx which is essentially a zip file
        if (!fileType || fileType.mime !== "application/zip") {
          return NextResponse.json({ error: "Invalid file signature. Not a valid DOCX." }, { status: 400 });
        }
      }
      try {
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
        text = result.value || "";
      } catch (docxError) {
        console.error("DOCX Parse Error:", docxError);
        return NextResponse.json({ error: "Failed to parse DOCX file" }, { status: 500 });
      }
    } else if (ext === ".txt") {
      // txt files do not have reliable magic bytes, but we can check for null bytes to ensure it's text
      if (buffer.includes(0x00)) {
        return NextResponse.json({ error: "Invalid text file format. Binary content detected." }, { status: 400 });
      }
      text = buffer.toString("utf-8");
    }

    if (!text.trim()) {
      return NextResponse.json({ error: "Could not extract text from file" }, { status: 400 });
    }

    // Normalize parsed text: fix spacing/bullet formatting issues
    const cleanText = text
      // Normalize line endings
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      // Ensure bullet markers have a space after them
      .replace(/^([•●▪▸◦–\-])\s*/gm, "$1 ")
      // Collapse more than 2 consecutive blank lines into 2
      .replace(/\n{3,}/g, "\n\n")
      // Ensure sentences that run together get a space (pattern: lowercase immediately followed by uppercase)
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      // Remove trailing whitespace from each line
      .split("\n").map(l => l.trimEnd()).join("\n")
      .trim();

    return NextResponse.json({
      text: cleanText,
      fileName: file.name,
    });
  } catch (err: unknown) {
    console.error("Parse Route Error:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}