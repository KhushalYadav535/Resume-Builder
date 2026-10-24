import * as fs from "fs";
import * as path from "path";
import mammoth from "mammoth";
import { parseResume } from "../lib/resumeParser";

async function testProjects() {
  const filePath = path.join(__dirname, "../resume/Dnyaneshwar Babar.docx");
  const buf = fs.readFileSync(filePath);
  const docx = await mammoth.extractRawText({ buffer: buf });
  const data = parseResume(docx.value, "docx");

  console.log("================================================================================");
  console.log("  TEST: Dnyaneshwar Babar Project Extraction");
  console.log("================================================================================");
  console.log(`Candidate Name:   ${data.personalInfo.fullName}`);
  console.log(`Total Employers:  ${data.workExperience.length}`);
  console.log(`Total Projects:   ${data.projects.length}\n`);


  console.log("--- EXTRACTED EMPLOYERS ---");
  data.workExperience.forEach((emp, idx) => {
    console.log(`[Role ${idx + 1}] Company: ${emp.company} | Role: ${emp.role} | Dates: ${emp.startDate || "N/A"} to ${emp.endDate || "Present"}`);
  });
  console.log("\n--- EXTRACTED PROJECTS ---");
  data.projects.forEach((proj, idx) => {
    console.log(`[Project ${idx + 1}] ${proj.name}`);
    if ((proj as any).role) console.log(`  Role:             ${(proj as any).role}`);
    if ((proj as any).client) console.log(`  Client:           ${(proj as any).client}`);
    if (proj.date) console.log(`  Duration:         ${proj.date}`);
    if ((proj as any).teamSize) console.log(`  Team Size:        ${(proj as any).teamSize}`);
    if (proj.techStack && proj.techStack.length > 0) {
      console.log(`  Tech Stack:       ${proj.techStack.join(", ")}`);
    }
    if (proj.responsibilities && proj.responsibilities.length > 0) {
      console.log(`  Responsibilities: ${proj.responsibilities.length} items`);
      console.log(`  Preview:          "${proj.responsibilities[0].slice(0, 100)}..."`);
    }
    console.log("");
  });
}

testProjects();
