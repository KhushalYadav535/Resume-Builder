import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let text = "";

    if (file.type === "application/pdf") {
      try {
        const pdfParseImport = await import("pdf-parse");

        const pdfParse =
          (pdfParseImport as any).default ||
          (pdfParseImport as any).PDFParse ||
          pdfParseImport;

        const parsed = await pdfParse(
          Buffer.from(buffer)
        );

        text = parsed?.text || "";
      } catch (pdfError) {
        console.error(
          "PDF Parse Error:",
          pdfError
        );

        return NextResponse.json(
          {
            error:
              "Failed to parse PDF file",
          },
          { status: 500 }
        );
      }
    } else if (
      file.type === "text/plain" ||
      file.name.endsWith(".txt")
    ) {
      text = buffer.toString("utf-8");
    } else {
      return NextResponse.json(
        {
          error:
            "Only PDF or TXT files supported",
        },
        { status: 400 }
      );
    }

    if (!text.trim()) {
      return NextResponse.json(
        {
          error:
            "Could not extract text from file",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      text: text.trim(),
      fileName: file.name,
    });
  } catch (err) {
    console.error(
      "Parse Route Error:",
      err
    );

    return NextResponse.json(
      {
        error: "Failed to parse file",
      },
      { status: 500 }
    );
  }
}