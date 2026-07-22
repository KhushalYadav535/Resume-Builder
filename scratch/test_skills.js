const fs = require('fs');
const text = fs.readFileSync('d:/resume/Resume-Builder/scratch/nilesh_raw.txt', 'utf8');

function extractSkillsFromSection(skillsLines) {
  const extracted = new Set();

  for (const line of skillsLines) {
    if (!line) continue;
    // Strip bullet marker
    const clean = line.replace(/^[•\-\*■●▪▸◦]\s*/, "").trim();

    // Check if line has a category prefix like "Languages & Frameworks: C#, .Net..."
    const colonIdx = clean.indexOf(":");
    let contentStr = clean;
    if (colonIdx !== -1) {
      contentStr = clean.slice(colonIdx + 1).trim();
    }

    // Split on comma, slash, or semicolon
    const parts = contentStr.split(/[,;\/]/).map(p => p.trim()).filter(Boolean);
    for (const p of parts) {
      // Remove trailing period or noise
      const skillName = p.replace(/\.$/, "").trim();
      if (skillName.length > 1 && skillName.length < 40) {
        extracted.add(skillName);
      }
    }
  }

  return Array.from(extracted);
}

const skillsLines = [
  "● Languages & Frameworks: C#, .Net Framework 4.5/4.6, net core, asp.net 5.0, T-SQL",
  "● Web Technology: Angular JS/2/7, React, Web API.",
  "● Development Environments: Visual Studio 2017/2019, SQL Server Management Studio.",
  "● Databases: SQL Server 2008 R2/2017, Mongo DB",
  "● Automation Test Framework: NUnit, MS Test, Moq Framework (Mocking Library)",
  "● Processes and Methodologies: Waterfall, Agile Scrum",
  "● Version Tools: Git, Team Foundation Server.",
  "● Utility Tools: Fiddler, SOAP UI, Re Sharper, NuGet"
];

console.log("EXTRACTED SKILLS FROM SECTION:");
console.log(extractSkillsFromSection(skillsLines));
