import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  AlignmentType, 
  BorderStyle 
} from "docx";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { resumeId } = await req.json();
    if (!resumeId) {
      return NextResponse.json({ error: "Missing resumeId." }, { status: 400 });
    }

    // Load resume
    const { data: resume, error: resError } = await supabase
      .from("resumes")
      .select("resume_data, file_name")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();

    if (resError || !resume) {
      return NextResponse.json({ error: "Resume not found." }, { status: 404 });
    }

    const rData = resume.resume_data;
    const personal = rData.personalInfo || {};

    const children: any[] = [];

    // 1. Personal Information Header
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: personal.fullName || "Resume Candidate",
            bold: true,
            size: 32, // 16pt
            font: "Calibri",
          }),
        ],
      })
    );

    const contactParts = [
      personal.email,
      personal.phone,
      personal.location,
      personal.linkedin ? `LinkedIn: ${personal.linkedin}` : "",
      personal.website ? `Portfolio: ${personal.website}` : "",
    ].filter(Boolean);

    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [
          new TextRun({
            text: contactParts.join("  |  "),
            size: 20, // 10pt
            font: "Calibri",
          }),
        ],
      })
    );

    // Helper to add sections
    const addSectionHeader = (title: string) => {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
          border: {
            bottom: {
              color: "CCCCCC",
              space: 4,
              style: BorderStyle.SINGLE,
              size: 6,
            },
          },
          children: [
            new TextRun({
              text: title.toUpperCase(),
              bold: true,
              size: 24, // 12pt
              font: "Calibri",
              color: "111111",
            }),
          ],
        })
      );
    };

    // 2. Summary Section
    if (rData.summary && rData.summary.trim()) {
      addSectionHeader("Professional Summary");
      children.push(
        new Paragraph({
          spacing: { after: 120, line: 240 }, // 1.15 line spacing
          children: [
            new TextRun({
              text: rData.summary,
              size: 22, // 11pt
              font: "Calibri",
            }),
          ],
        })
      );
    }

    // 3. Work Experience Section
    const work = rData.workExperience || [];
    if (work.length > 0) {
      addSectionHeader("Work Experience");
      work.forEach((w: any) => {
        children.push(
          new Paragraph({
            spacing: { before: 120, after: 40 },
            children: [
              new TextRun({
                text: `${w.role || "Role"}  -  ${w.company || "Company"}`,
                bold: true,
                size: 22,
                font: "Calibri",
              }),
              new TextRun({
                text: `\t${w.startDate || ""} to ${w.endDate || ""}`,
                bold: true,
                size: 20,
                font: "Calibri",
              }),
            ],
          })
        );

        if (w.city || w.industry || w.employmentType) {
          const detailStr = [
            w.employmentType,
            w.city,
            w.industry ? `Industry: ${w.industry}` : "",
          ].filter(Boolean).join(", ");
          children.push(
            new Paragraph({
              spacing: { after: 80 },
              children: [
                new TextRun({
                  text: detailStr,
                  italics: true,
                  size: 18,
                  font: "Calibri",
                  color: "666666",
                }),
              ],
            })
          );
        }

        const bullets = w.bullets || [];
        bullets.forEach((b: string) => {
          if (b && b.trim()) {
            children.push(
              new Paragraph({
                bullet: { level: 0 },
                spacing: { after: 60 },
                children: [
                  new TextRun({
                    text: b.trim(),
                    size: 22,
                    font: "Calibri",
                  }),
                ],
              })
            );
          }
        });
      });
    }

    // 4. Projects Section
    const projects = rData.projects || [];
    if (projects.length > 0) {
      addSectionHeader("Projects");
      projects.forEach((p: any) => {
        children.push(
          new Paragraph({
            spacing: { before: 120, after: 40 },
            children: [
              new TextRun({
                text: p.name || "Project",
                bold: true,
                size: 22,
                font: "Calibri",
              }),
              new TextRun({
                text: p.date ? ` (${p.date})` : "",
                italics: true,
                size: 20,
                font: "Calibri",
              }),
              new TextRun({
                text: p.startDate || p.endDate ? `\t${p.startDate || ""} to ${p.endDate || ""}` : "",
                bold: true,
                size: 20,
                font: "Calibri",
              }),
            ],
          })
        );

        // Project Description
        if (p.description) {
          children.push(new Paragraph({
            children: [
              new TextRun({ text: "• ", size: 20 }),
              new TextRun({ text: p.description, size: 20 }),
            ],
            spacing: { before: 80 },
            indent: { left: 360, hanging: 360 },
          }));
        }

        // Project Tech Stack
        if (p.techStack && p.techStack.length > 0) {
          children.push(new Paragraph({
            children: [
              new TextRun({ text: "• Tech Stack: ", size: 20, bold: true }),
              new TextRun({ text: p.techStack.join(", "), size: 20 }),
            ],
            spacing: { before: 40 },
            indent: { left: 360, hanging: 360 },
          }));
        }

        const pBullets = p.bullets || [];
        pBullets.forEach((pb: string) => {
          if (pb && pb.trim()) {
            children.push(
              new Paragraph({
                bullet: { level: 0 },
                spacing: { after: 60 },
                children: [
                  new TextRun({
                    text: pb.trim(),
                    size: 22,
                    font: "Calibri",
                  }),
                ],
              })
            );
          }
        });
      });
    }

    // 5. Education Section
    const edu = rData.education || [];
    if (edu.length > 0) {
      addSectionHeader("Education");
      edu.forEach((e: any) => {
        children.push(
          new Paragraph({
            spacing: { before: 120, after: 40 },
            children: [
              new TextRun({
                text: `${e.degree || "Degree"} ${e.field ? `in ${e.field}` : ""}  -  ${e.institution || "Institution"}`,
                bold: true,
                size: 22,
                font: "Calibri",
              }),
              new TextRun({
                text: e.startDate || e.endDate ? `\t${e.startDate || ""} to ${e.endDate || ""}` : "",
                bold: true,
                size: 20,
                font: "Calibri",
              }),
            ],
          })
        );

        const subDetail = [
          e.boardOrUniversity ? `Board/University: ${e.boardOrUniversity}` : "",
          e.gpa ? `Grade: ${e.gpa} ${e.gpaType === "cgpa" ? "CGPA" : "%"}` : "",
        ].filter(Boolean).join("  |  ");

        if (subDetail) {
          children.push(
            new Paragraph({
              spacing: { after: 120 },
              children: [
                new TextRun({
                  text: subDetail,
                  size: 20,
                  font: "Calibri",
                  color: "444444",
                }),
              ],
            })
          );
        }
      });
    }

    // 6. Skills Section
    const skills = rData.skills || { technical: [], soft: [] };
    const tech = skills.technical || [];
    const soft = skills.soft || [];
    if (tech.length > 0 || soft.length > 0) {
      addSectionHeader("Skills");
      if (tech.length > 0) {
        children.push(
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({
                text: "Technical Skills: ",
                bold: true,
                size: 22,
                font: "Calibri",
              }),
              new TextRun({
                text: tech.join(", "),
                size: 22,
                font: "Calibri",
              }),
            ],
          })
        );
      }
      if (soft.length > 0) {
        children.push(
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: "Soft Skills: ",
                bold: true,
                size: 22,
                font: "Calibri",
              }),
              new TextRun({
                text: soft.join(", "),
                size: 22,
                font: "Calibri",
              }),
            ],
          })
        );
      }
    }

    // 7. Languages Known Section
    const langs = rData.languagesKnown || [];
    if (langs.length > 0) {
      addSectionHeader("Languages Known");
      const langItems = langs.map((l: any) => `${l.language} (${l.proficiency})`);
      children.push(
        new Paragraph({
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: langItems.join(", "),
              size: 22,
              font: "Calibri",
            }),
          ],
        })
      );
    }

    // 8. Certifications Section
    const certs = rData.certifications || [];
    if (certs.length > 0) {
      addSectionHeader("Certifications");
      certs.forEach((c: any) => {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: `${c.name || "Certification"} ${c.issuer ? `issued by ${c.issuer}` : ""} ${c.date || c.year ? `(${c.date || c.year})` : ""}`,
                size: 22,
                font: "Calibri",
              }),
            ],
          })
        );
      });
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    const downloadName = resume.file_name 
      ? resume.file_name.replace(/[^a-zA-Z0-9]/g, "_") + ".docx" 
      : "Resume.docx";

    return new Response(buffer as any, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${downloadName}"`,
      },
    });

  } catch (err: unknown) {
    console.error("Export Word failed:", err);
    return NextResponse.json({ error: "Failed to export Word document." }, { status: 500 });
  }
}
