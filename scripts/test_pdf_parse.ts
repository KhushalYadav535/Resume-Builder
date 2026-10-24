import fs from "fs";
import path from "path";
// @ts-ignore
import pdfParse from "pdf-parse";

async function main() {
  const pdfFiles = [
    "Fullstack-Dev-Sr-Ajay.pdf",
    "Shrikant Mane.pdf",
    "Resume_Ashvini_Patil_22.pdf",
    "Naren Resume PDf V-1.pdf",
    "Nilesh Butani-cv-1-2 (1).pdf",
    "RAHUL RAI.pdf",
    "Senior Software Engineer Dot NET Core Angular- ViitorCloud.pdf",
    "Senior Software Engineer Dot NET Core- ViitorCloud.pdf"
  ];

  console.log("================================================================================");
  console.log("PDF-PARSE BATCH EXTRACTION TEST (Using npm package: pdf-parse ^1.1.1)");
  console.log("Ref: https://mehmet-kozan.github.io/pdf-parse/");
  console.log("================================================================================\n");

  for (const file of pdfFiles) {
    const pdfPath = path.resolve("resume", file);
    if (!fs.existsSync(pdfPath)) continue;
    const buf = fs.readFileSync(pdfPath);
    const data = await pdfParse(buf);
    
    console.log(`[PASS] ${file}`);
    console.log(`   Pages: ${data.numpages} | Total Characters: ${data.text.length}`);
    console.log(`   Sample Snippet (First 150 chars): "${data.text.replace(/\\s+/g, ' ').trim().slice(0, 150)}..."\n`);
  }
}

main().catch(console.error);
