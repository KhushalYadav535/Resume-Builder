"use client";

import React from "react";
import { ResumeData, WorkExperience, Education, Project, Certification, LanguagesKnown } from "@/types";

const templateColors: Record<string, string> = {
  modern: "#6c63ff",
  professional: "#2563eb",
  executive: "#1e293b",
  minimal: "#71717a",
  creative: "#ec4899",
  "ats-safe": "#000000",
  fresher: "#10b981", // Emerald
  startup: "#f43f5e", // Rose
  "it-tech": "#06b6d4", // Cyan
  "bfsi-risk": "#0f172a", // Navy
  "minimal-2": "#14b8a6", // Teal
};

const fontFamilies: Record<string, string> = {
  Inter: "'Inter', sans-serif",
  "DM Sans": "'DM Sans', sans-serif",
  Syne: "'Syne', sans-serif",
  Georgia: "Georgia, serif",
  Garamond: "Garamond, serif",
  "Space Grotesk": "'Space Grotesk', sans-serif",
  Outfit: "'Outfit', sans-serif",
  "Playfair Display": "'Playfair Display', serif",
};

interface ResumeDocumentProps {
  data: ResumeData;
  templateId: string;
}

export default function ResumeDocument({ data, templateId }: ResumeDocumentProps) {
  const {
    personalInfo = { fullName: "", email: "", phone: "", linkedin: "", location: "", website: "" },
    summary = "",
    workExperience = [],
    education = [],
    skills = { technical: [], soft: [] },
    projects = [],
    certifications = [],
    languagesKnown = [],
    fresherMode = false,
    hackathons = [],
    codingContests = [],
    campusAchievements = [],
    clubsAndLeadership = [],
    competitiveExams = [],
    fontFamily = "Inter",
    fontSize = 10,
    spacing = 1.2,
    sectionOrder = ["summary", "work", "education", "skills", "projects", "certifications", "languages", "fresher"]
  } = data;

  const primaryColor = templateColors[templateId] || "#6c63ff";
  const selectedFont = fontFamilies[fontFamily] || "'Inter', sans-serif";

  // Filter out empty entries safely
  const activeExams = (competitiveExams || []).filter(e => e.exam && e.score);
  const activeLanguages = (languagesKnown || []).filter(l => l.language);

  // Dynamic order matching active sections
  const order = sectionOrder && sectionOrder.length > 0
    ? sectionOrder
    : ["summary", "work", "education", "skills", "projects", "certifications", "languages", "fresher"];

  // Helper formatting for score metrics
  const getScoreLabel = (edu: Education) => {
    if (!edu.gpa) return "";
    return edu.gpaType === "percentage" ? `Percentage: ${edu.gpa}` : `CGPA: ${edu.gpa}`;
  };

  // Helper renderers for sections (Modularized to be styled inside templates)
  // ----------------------------------------------------

  // 1. MODERN TEMPLATE
  const renderModernTemplate = () => {
    const renderSection = (key: string) => {
      switch (key) {
        case "summary":
          if (!summary) return null;
          return (
            <div style={{ marginBottom: "1.2rem" }}>
              <h3 style={{ fontSize: `${fontSize * 0.95}pt`, fontWeight: 700, color: primaryColor, textTransform: "uppercase", borderBottom: "1px solid #dddddd", paddingBottom: "0.2rem", marginBottom: "0.5rem", fontFamily: "'Syne', sans-serif" }}>
                Professional Summary
              </h3>
              <p style={{ fontSize: `${fontSize * 0.82}pt`, color: "#444444", lineHeight: spacing, margin: 0 }}>{summary}</p>
            </div>
          );
        case "work":
          if (workExperience.length === 0) return null;
          return (
            <div style={{ marginBottom: "1.2rem" }}>
              <h3 style={{ fontSize: `${fontSize * 0.95}pt`, fontWeight: 700, color: primaryColor, textTransform: "uppercase", borderBottom: "1px solid #dddddd", paddingBottom: "0.2rem", marginBottom: "0.6rem", fontFamily: "'Syne', sans-serif" }}>
                Work Experience
              </h3>
              {workExperience.map((exp) => (
                <div key={exp.id} style={{ marginBottom: "0.8rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: `${fontSize * 0.85}pt`, color: "#222222", marginBottom: "0.15rem" }}>
                    <span>{exp.role} {exp.company ? `— ${exp.company}` : ""} {exp.employmentType ? `(${exp.employmentType})` : ""}</span>
                    <span style={{ fontSize: `${fontSize * 0.78}pt`, color: "#666666" }}>{exp.startDate} {exp.endDate ? `- ${exp.endDate}` : ""}</span>
                  </div>
                  <div style={{ fontSize: `${fontSize * 0.76}pt`, color: "#666666", marginBottom: "0.25rem" }}>
                    {[exp.city, exp.industry, exp.companyScale ? `${exp.companyScale} scale` : "", exp.reportingManager ? `Manager: ${exp.reportingManager}` : ""].filter(Boolean).join(" • ")}
                    {exp.showSalary && (exp.currentCTC || exp.expectedCTC) && (
                      <strong style={{ color: primaryColor, marginLeft: "0.5rem" }}>
                        (CTC: {exp.currentCTC} {exp.expectedCTC ? `| Expected: ${exp.expectedCTC}` : ""})
                      </strong>
                    )}
                  </div>
                  <ul style={{ paddingLeft: "1.1rem", margin: 0 }}>
                    {exp.bullets.map((b, bi) => (
                      b && <li key={bi} style={{ fontSize: `${fontSize * 0.78}pt`, color: "#444444", lineHeight: spacing, marginBottom: "0.2rem" }}>{b}</li>
                    ))}
                  </ul>
                  {exp.toolsUsed && exp.toolsUsed.length > 0 && (
                    <div style={{ fontSize: `${fontSize * 0.74}pt`, color: "#666666", fontStyle: "italic", marginTop: "0.2rem" }}>
                      Tools: {exp.toolsUsed.join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        case "education":
          if (education.length === 0) return null;
          return (
            <div style={{ marginBottom: "1.2rem" }}>
              <h3 style={{ fontSize: `${fontSize * 0.95}pt`, fontWeight: 700, color: primaryColor, textTransform: "uppercase", borderBottom: "1px solid #dddddd", paddingBottom: "0.2rem", marginBottom: "0.6rem", fontFamily: "'Syne', sans-serif" }}>
                Education
              </h3>
              {education.map((edu) => (
                <div key={edu.id} style={{ marginBottom: "0.6rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: `${fontSize * 0.82}pt`, color: "#333333" }}>
                    <div>
                      <strong style={{ color: "#222222" }}>{edu.degree || "Degree"}{edu.field ? ` in ${edu.field}` : ""}</strong>
                      {edu.boardOrUniversity ? ` | ${edu.boardOrUniversity}` : ""}
                      {edu.institution ? ` — ${edu.institution}` : ""}
                      {edu.gpa && <span style={{ color: "#555", fontWeight: 600 }}> ({getScoreLabel(edu)})</span>}
                    </div>
                    <span style={{ fontSize: `${fontSize * 0.78}pt`, color: "#666666" }}>{edu.startDate} {edu.endDate ? `- ${edu.endDate}` : ""}</span>
                  </div>
                  {(edu.distinction || edu.topper || edu.scholarship || edu.academicAchievements) && (
                    <div style={{ fontSize: `${fontSize * 0.75}pt`, color: "#555", marginTop: "0.15rem", paddingLeft: "0.5rem", borderLeft: "2px solid #ccc" }}>
                      {[
                        edu.distinction ? "Graduated with Distinction" : "",
                        edu.topper ? "Class Topper" : "",
                        edu.scholarship ? `Scholarship: ${edu.scholarship}` : "",
                        edu.academicAchievements
                      ].filter(Boolean).join(" • ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        case "skills":
          if (skills.technical.length === 0 && skills.soft.length === 0) return null;
          return (
            <div style={{ marginBottom: "1.2rem" }}>
              <h3 style={{ fontSize: `${fontSize * 0.95}pt`, fontWeight: 700, color: primaryColor, textTransform: "uppercase", borderBottom: "1px solid #dddddd", paddingBottom: "0.2rem", marginBottom: "0.4rem", fontFamily: "'Syne', sans-serif" }}>
                Skills Inventory
              </h3>
              {skills.technical.length > 0 && (
                <p style={{ fontSize: `${fontSize * 0.78}pt`, color: "#444444", marginBottom: "0.3rem", lineHeight: spacing }}>
                  <strong>Technical Competencies:</strong> {skills.technical.join(", ")}
                </p>
              )}
              {skills.soft.length > 0 && (
                <p style={{ fontSize: `${fontSize * 0.78}pt`, color: "#444444", margin: 0, lineHeight: spacing }}>
                  <strong>Soft Skills:</strong> {skills.soft.join(", ")}
                </p>
              )}
            </div>
          );
        case "projects":
          if (projects.length === 0) return null;
          return (
            <div style={{ marginBottom: "1.2rem" }}>
              <h3 style={{ fontSize: `${fontSize * 0.95}pt`, fontWeight: 700, color: primaryColor, textTransform: "uppercase", borderBottom: "1px solid #dddddd", paddingBottom: "0.2rem", marginBottom: "0.4rem", fontFamily: "'Syne', sans-serif" }}>
                Projects Portfolio
              </h3>
              {projects.map((proj) => (
                <div key={proj.id} style={{ marginBottom: "0.6rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: `${fontSize * 0.82}pt`, color: "#222222" }}>
                    <span>{proj.name}</span>
                    {proj.link && (
                      <span style={{ fontSize: `${fontSize * 0.78}pt` }}>
                        <a href={proj.link} target="_blank" rel="noopener noreferrer" style={{ color: primaryColor, textDecoration: "none" }}>{proj.link.replace(/^(https?:\/\/)?(www\.)?/, "")}</a>
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: `${fontSize * 0.78}pt`, color: "#444444", margin: "0.15rem 0 0.3rem", lineHeight: spacing }}>{proj.description}</p>
                  {proj.techStack && proj.techStack.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                      {proj.techStack.map((tech) => tech && <span key={tech} style={{ fontSize: "0.65rem", background: "#f3f4f6", color: "#4b5563", padding: "1px 6px", borderRadius: "3px" }}>{tech}</span>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        case "certifications":
          if (certifications.length === 0) return null;
          return (
            <div style={{ marginBottom: "1.2rem" }}>
              <h3 style={{ fontSize: `${fontSize * 0.95}pt`, fontWeight: 700, color: primaryColor, textTransform: "uppercase", borderBottom: "1px solid #dddddd", paddingBottom: "0.2rem", marginBottom: "0.4rem", fontFamily: "'Syne', sans-serif" }}>
                Certifications
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem 0.8rem" }}>
                {certifications.map((c) => c.name && (
                  <div key={c.id} style={{ fontSize: `${fontSize * 0.78}pt`, color: "#444444" }}>
                    • <strong>{c.name}</strong> {c.issuer ? `(${c.issuer})` : ""} {c.date && `— ${c.date}`}
                  </div>
                ))}
              </div>
            </div>
          );
        case "languages":
          if (activeLanguages.length === 0) return null;
          return (
            <div style={{ marginBottom: "1.2rem" }}>
              <h3 style={{ fontSize: `${fontSize * 0.95}pt`, fontWeight: 700, color: primaryColor, textTransform: "uppercase", borderBottom: "1px solid #dddddd", paddingBottom: "0.2rem", marginBottom: "0.4rem", fontFamily: "'Syne', sans-serif" }}>
                Languages Known
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem", fontSize: `${fontSize * 0.78}pt`, color: "#444444" }}>
                {activeLanguages.map((l) => (
                  <div key={l.id}>
                    • <strong>{l.language}</strong> ({l.proficiency})
                    {l.certification && <span style={{ color: "#666" }}> — Cert: {l.certification}</span>}
                    {l.usageContext && <span style={{ color: "#777", fontStyle: "italic" }}> ({l.usageContext})</span>}
                  </div>
                ))}
              </div>
            </div>
          );
        case "fresher":
          if (!fresherMode) return null;
          const hasExams = activeExams.length > 0;
          const hasHacks = hackathons.length > 0;
          const hasContests = codingContests.length > 0;
          const hasCampus = campusAchievements.length > 0 || clubsAndLeadership.length > 0;
          if (!hasExams && !hasHacks && !hasContests && !hasCampus) return null;

          return (
            <div style={{ marginBottom: "1.2rem" }}>
              <h3 style={{ fontSize: `${fontSize * 0.95}pt`, fontWeight: 700, color: primaryColor, textTransform: "uppercase", borderBottom: "1px solid #dddddd", paddingBottom: "0.2rem", marginBottom: "0.6rem", fontFamily: "'Syne', sans-serif" }}>
                Achievements & Competitive exams
              </h3>
              
              {hasExams && (
                <div style={{ marginBottom: "0.6rem" }}>
                  <div style={{ fontWeight: 700, fontSize: `${fontSize * 0.8}pt`, color: "#222" }}>Competitive Exams Marks:</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem 0.8rem", fontSize: `${fontSize * 0.78}pt`, color: "#444444", marginTop: "0.15rem" }}>
                    {activeExams.map((ex, i) => (
                      <span key={i}>• {ex.exam}: <strong>{ex.score}</strong> ({ex.year})</span>
                    ))}
                  </div>
                </div>
              )}

              {(hasHacks || hasContests) && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "0.6rem" }}>
                  {hasHacks && (
                    <div>
                      <div style={{ fontWeight: 700, fontSize: `${fontSize * 0.8}pt`, color: "#222" }}>Hackathons & Wins:</div>
                      <ul style={{ margin: "0.15rem 0 0 1rem", padding: 0, fontSize: `${fontSize * 0.78}pt`, color: "#444" }}>
                        {hackathons.map((h, i) => <li key={i}>{h}</li>)}
                      </ul>
                    </div>
                  )}
                  {hasContests && (
                    <div>
                      <div style={{ fontWeight: 700, fontSize: `${fontSize * 0.8}pt`, color: "#222" }}>Competitive Coding:</div>
                      <ul style={{ margin: "0.15rem 0 0 1rem", padding: 0, fontSize: `${fontSize * 0.78}pt`, color: "#444" }}>
                        {codingContests.map((c, i) => <li key={i}>{c}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {hasCampus && (
                <div>
                  <div style={{ fontWeight: 700, fontSize: `${fontSize * 0.8}pt`, color: "#222" }}>Campus Engagements & Roles:</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "0.15rem" }}>
                    {campusAchievements.length > 0 && (
                      <div>
                        <ul style={{ margin: "0 0 0 1rem", padding: 0, fontSize: `${fontSize * 0.78}pt`, color: "#444" }}>
                          {campusAchievements.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                      </div>
                    )}
                    {clubsAndLeadership.length > 0 && (
                      <div>
                        <ul style={{ margin: "0 0 0 1rem", padding: 0, fontSize: `${fontSize * 0.78}pt`, color: "#444" }}>
                          {clubsAndLeadership.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div style={{ fontFamily: selectedFont, color: "#333333" }}>
        {/* Header Section */}
        <div style={{ borderBottom: `2px solid ${primaryColor}`, paddingBottom: "1.2rem", marginBottom: "1.2rem", textAlign: "center" }}>
          <h1 style={{ fontSize: `${fontSize * 1.8}pt`, color: "#111111", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.4rem", fontFamily: "'Syne', sans-serif" }}>
            {personalInfo.fullName || "Your Full Name"}
          </h1>
          <div style={{ fontSize: `${fontSize * 0.82}pt`, color: "#666666", display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "0.8rem" }}>
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>• {personalInfo.phone}</span>}
            {personalInfo.location && <span>• {personalInfo.location}</span>}
            {personalInfo.linkedin && (
              <span>
                • <a href={personalInfo.linkedin.startsWith("http") ? personalInfo.linkedin : `https://${personalInfo.linkedin}`} target="_blank" rel="noopener noreferrer" style={{ color: "#666666", textDecoration: "none" }}>{personalInfo.linkedin.replace(/^(https?:\/\/)?(www\.)?/, "")}</a>
              </span>
            )}
            {personalInfo.website && (
              <span>
                • <a href={personalInfo.website.startsWith("http") ? personalInfo.website : `https://${personalInfo.website}`} target="_blank" rel="noopener noreferrer" style={{ color: "#666666", textDecoration: "none" }}>{personalInfo.website.replace(/^(https?:\/\/)?(www\.)?/, "")}</a>
              </span>
            )}
          </div>
        </div>

        {/* Dynamic sections loop */}
        {order.map((secKey) => (
          <div key={secKey}>
            {renderSection(secKey)}
          </div>
        ))}
      </div>
    );
  };

  // 2. PROFESSIONAL TEMPLATE
  const renderProfessionalTemplate = () => {
    const renderSection = (key: string) => {
      switch (key) {
        case "summary":
          if (!summary) return null;
          return (
            <div style={{ marginBottom: "1.4rem" }}>
              <h3 style={{ fontSize: `${fontSize * 1.05}pt`, fontWeight: "bold", color: primaryColor, textTransform: "uppercase", borderBottom: "1px solid #bbbbbb", paddingBottom: "0.2rem", marginBottom: "0.5rem", letterSpacing: "0.05em" }}>
                Profile Statement
              </h3>
              <p style={{ fontSize: `${fontSize * 0.85}pt`, lineHeight: spacing, margin: 0, textAlign: "justify" }}>{summary}</p>
            </div>
          );
        case "work":
          if (workExperience.length === 0) return null;
          return (
            <div style={{ marginBottom: "1.4rem" }}>
              <h3 style={{ fontSize: `${fontSize * 1.05}pt`, fontWeight: "bold", color: primaryColor, textTransform: "uppercase", borderBottom: "1px solid #bbbbbb", paddingBottom: "0.2rem", marginBottom: "0.7rem", letterSpacing: "0.05em" }}>
                Professional Experience
              </h3>
              {workExperience.map((exp) => (
                <div key={exp.id} style={{ marginBottom: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: `${fontSize * 0.88}pt`, color: "#111111", marginBottom: "0.2rem" }}>
                    <span>{exp.role ? exp.role.toUpperCase() : "ROLE"} {exp.company ? `| ${exp.company}` : ""}</span>
                    <span style={{ fontStyle: "italic", fontWeight: "normal", fontSize: `${fontSize * 0.8}pt`, color: "#555555" }}>{exp.startDate} {exp.endDate ? `- ${exp.endDate}` : ""}</span>
                  </div>
                  <div style={{ fontSize: `${fontSize * 0.78}pt`, color: "#666", fontStyle: "italic", marginBottom: "0.2rem" }}>
                    {[exp.city, exp.industry, exp.employmentType, exp.reportingManager ? `Reports to: ${exp.reportingManager}` : ""].filter(Boolean).join(" • ")}
                    {exp.showSalary && exp.currentCTC && ` (CTC: ${exp.currentCTC})`}
                  </div>
                  <ul style={{ paddingLeft: "1.2rem", margin: 0 }}>
                    {exp.bullets.map((b, bi) => (
                      b && <li key={bi} style={{ fontSize: `${fontSize * 0.82}pt`, lineHeight: spacing, marginBottom: "0.25rem", textAlign: "justify" }}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          );
        case "education":
          if (education.length === 0) return null;
          return (
            <div style={{ marginBottom: "1.4rem" }}>
              <h3 style={{ fontSize: `${fontSize * 1.05}pt`, fontWeight: "bold", color: primaryColor, textTransform: "uppercase", borderBottom: "1px solid #bbbbbb", paddingBottom: "0.2rem", marginBottom: "0.7rem", letterSpacing: "0.05em" }}>
                Education
              </h3>
              {education.map((edu) => (
                <div key={edu.id} style={{ display: "flex", justifyContent: "space-between", fontSize: `${fontSize * 0.85}pt`, marginBottom: "0.4rem" }}>
                  <div>
                    <strong>{edu.institution || "Institution"}</strong> — <em>{edu.degree || "Degree"}{edu.field ? ` in ${edu.field}` : ""}</em>
                    {edu.boardOrUniversity ? ` (${edu.boardOrUniversity})` : ""}
                    {edu.gpa && <span> ({getScoreLabel(edu)})</span>}
                    {(edu.distinction || edu.topper || edu.scholarship) && (
                      <div style={{ fontSize: `${fontSize * 0.78}pt`, color: "#555", marginTop: "0.1rem" }}>
                        {[edu.distinction ? "Distinction" : "", edu.topper ? "Class Topper" : "", edu.scholarship ? `Scholarship: ${edu.scholarship}` : ""].filter(Boolean).join(", ")}
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: `${fontSize * 0.8}pt`, color: "#555555", fontStyle: "italic" }}>{edu.startDate} {edu.endDate ? `- ${edu.endDate}` : ""}</span>
                </div>
              ))}
            </div>
          );
        case "skills":
          if (skills.technical.length === 0 && skills.soft.length === 0) return null;
          return (
            <div style={{ marginBottom: "1.4rem" }}>
              <h3 style={{ fontSize: `${fontSize * 1.05}pt`, fontWeight: "bold", color: primaryColor, textTransform: "uppercase", borderBottom: "1px solid #bbbbbb", paddingBottom: "0.2rem", marginBottom: "0.5rem", letterSpacing: "0.05em" }}>
                Key Qualifications
              </h3>
              {skills.technical.length > 0 && (
                <p style={{ fontSize: `${fontSize * 0.82}pt`, marginBottom: "0.4rem", lineHeight: spacing }}>
                  <strong>Technical Areas of Expertise:</strong> {skills.technical.join(" • ")}
                </p>
              )}
              {skills.soft.length > 0 && (
                <p style={{ fontSize: `${fontSize * 0.82}pt`, margin: 0, lineHeight: spacing }}>
                  <strong>Core Competencies:</strong> {skills.soft.join(" • ")}
                </p>
              )}
            </div>
          );
        case "projects":
          if (projects.length === 0) return null;
          return (
            <div style={{ marginBottom: "1.4rem" }}>
              <h3 style={{ fontSize: `${fontSize * 1.05}pt`, fontWeight: "bold", color: primaryColor, textTransform: "uppercase", borderBottom: "1px solid #bbbbbb", paddingBottom: "0.2rem", marginBottom: "0.5rem", letterSpacing: "0.05em" }}>
                Selected Projects
              </h3>
              {projects.map((proj) => (
                <div key={proj.id} style={{ marginBottom: "0.8rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: `${fontSize * 0.85}pt`, color: "#111111" }}>
                    <span>{proj.name}</span>
                    {proj.link && <span style={{ fontSize: `${fontSize * 0.8}pt`, fontWeight: "normal", fontStyle: "italic", color: primaryColor }}>{proj.link}</span>}
                  </div>
                  <p style={{ fontSize: `${fontSize * 0.82}pt`, margin: "0.2rem 0", lineHeight: spacing }}>{proj.description}</p>
                  {proj.techStack && proj.techStack.length > 0 && (
                    <p style={{ fontSize: `${fontSize * 0.78}pt`, color: "#666666", margin: 0 }}>
                      <em>Technologies: {proj.techStack.join(", ")}</em>
                    </p>
                  )}
                </div>
              ))}
            </div>
          );
        case "certifications":
          if (certifications.length === 0) return null;
          return (
            <div style={{ marginBottom: "1.4rem" }}>
              <h3 style={{ fontSize: `${fontSize * 1.05}pt`, fontWeight: "bold", color: primaryColor, textTransform: "uppercase", borderBottom: "1px solid #bbbbbb", paddingBottom: "0.2rem", marginBottom: "0.5rem", letterSpacing: "0.05em" }}>
                Licenses & Certifications
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                {certifications.map((c) => c.name && (
                  <div key={c.id} style={{ fontSize: `${fontSize * 0.82}pt` }}>
                    • <strong>{c.name}</strong> {c.issuer ? `— ${c.issuer}` : ""} {c.date && `(${c.date})`}
                  </div>
                ))}
              </div>
            </div>
          );
        case "languages":
          if (activeLanguages.length === 0) return null;
          return (
            <div style={{ marginBottom: "1.4rem" }}>
              <h3 style={{ fontSize: `${fontSize * 1.05}pt`, fontWeight: "bold", color: primaryColor, textTransform: "uppercase", borderBottom: "1px solid #bbbbbb", paddingBottom: "0.2rem", marginBottom: "0.5rem", letterSpacing: "0.05em" }}>
                Languages Known
              </h3>
              <p style={{ fontSize: `${fontSize * 0.82}pt`, lineHeight: spacing, margin: 0 }}>
                {activeLanguages.map((l) => `${l.language} (${l.proficiency}${l.certification ? `, Cert: ${l.certification}` : ""})`).join(" • ")}
              </p>
            </div>
          );
        case "fresher":
          if (!fresherMode) return null;
          return (
            <div style={{ marginBottom: "1.4rem" }}>
              <h3 style={{ fontSize: `${fontSize * 1.05}pt`, fontWeight: "bold", color: primaryColor, textTransform: "uppercase", borderBottom: "1px solid #bbbbbb", paddingBottom: "0.2rem", marginBottom: "0.7rem", letterSpacing: "0.05em" }}>
                Academic Honors & Extracurriculars
              </h3>
              {activeExams.length > 0 && (
                <p style={{ fontSize: `${fontSize * 0.82}pt`, margin: "0 0 0.4rem" }}>
                  <strong>Exams:</strong> {activeExams.map(ex => `${ex.exam} (${ex.score}, ${ex.year})`).join(" | ")}
                </p>
              )}
              {hackathons.length > 0 && (
                <p style={{ fontSize: `${fontSize * 0.82}pt`, margin: "0 0 0.4rem" }}>
                  <strong>Hackathons:</strong> {hackathons.join(", ")}
                </p>
              )}
              {codingContests.length > 0 && (
                <p style={{ fontSize: `${fontSize * 0.82}pt`, margin: "0 0 0.4rem" }}>
                  <strong>Competitive Coding:</strong> {codingContests.join(", ")}
                </p>
              )}
              {campusAchievements.length > 0 && (
                <p style={{ fontSize: `${fontSize * 0.82}pt`, margin: "0 0 0.4rem" }}>
                  <strong>Campus Activities:</strong> {campusAchievements.join(", ")}
                </p>
              )}
              {clubsAndLeadership.length > 0 && (
                <p style={{ fontSize: `${fontSize * 0.82}pt`, margin: 0 }}>
                  <strong>Leadership Roles:</strong> {clubsAndLeadership.join(", ")}
                </p>
              )}
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div style={{ fontFamily: selectedFont, color: "#222222" }}>
        {/* Elegant top header */}
        <div style={{ borderBottom: `3px double ${primaryColor}`, paddingBottom: "1.2rem", marginBottom: "1.5rem", textAlign: "center" }}>
          <h1 style={{ fontSize: `${fontSize * 2}pt`, color: "#000000", fontWeight: "bold", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            {personalInfo.fullName || "Your Full Name"}
          </h1>
          <div style={{ fontSize: `${fontSize * 0.85}pt`, color: "#555555", display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "1rem", fontStyle: "italic" }}>
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.location && <span>{personalInfo.location}</span>}
            {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
            {personalInfo.website && <span>{personalInfo.website}</span>}
          </div>
        </div>

        {/* Dynamic section loop */}
        {order.map((secKey) => (
          <div key={secKey}>
            {renderSection(secKey)}
          </div>
        ))}
      </div>
    );
  };

  // 3. EXECUTIVE TEMPLATE
  const renderExecutiveTemplate = () => {
    const renderSection = (key: string) => {
      switch (key) {
        case "summary":
          if (!summary) return null;
          return (
            <div style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: `${fontSize * 1.05}pt`, fontWeight: "bold", color: "#333", textTransform: "uppercase", borderBottom: `2px solid ${primaryColor}`, paddingBottom: "0.15rem", marginBottom: "0.6rem" }}>
                Executive Profile
              </h3>
              <p style={{ fontSize: `${fontSize * 0.88}pt`, lineHeight: spacing, margin: 0, fontStyle: "italic", textAlign: "justify", textIndent: "1.5rem" }}>{summary}</p>
            </div>
          );
        case "work":
          if (workExperience.length === 0) return null;
          return (
            <div style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: `${fontSize * 1.05}pt`, fontWeight: "bold", color: "#333", textTransform: "uppercase", borderBottom: `2px solid ${primaryColor}`, paddingBottom: "0.15rem", marginBottom: "0.8rem" }}>
                Leadership & Professional Timeline
              </h3>
              {workExperience.map((exp) => (
                <div key={exp.id} style={{ marginBottom: "1.2rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: `${fontSize * 0.92}pt`, color: "#000000", marginBottom: "0.25rem" }}>
                    <span>{exp.company || "Company Name"}</span>
                    <span style={{ fontSize: `${fontSize * 0.85}pt`, color: "#555555", fontWeight: "normal" }}>{exp.startDate} {exp.endDate ? `— ${exp.endDate}` : ""}</span>
                  </div>
                  <div style={{ fontStyle: "italic", fontSize: `${fontSize * 0.88}pt`, color: primaryColor, marginBottom: "0.2rem", fontWeight: 600 }}>
                    {exp.role || "Executive Position"}
                    {exp.city && <span style={{ color: "#777", fontWeight: "normal", fontSize: "0.8rem" }}> • {exp.city}</span>}
                  </div>
                  <ul style={{ paddingLeft: "1.2rem", margin: 0 }}>
                    {exp.bullets.map((b, bi) => (
                      b && <li key={bi} style={{ fontSize: `${fontSize * 0.85}pt`, lineHeight: spacing, marginBottom: "0.3rem", textAlign: "justify" }}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          );
        case "education":
          if (education.length === 0) return null;
          return (
            <div style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: `${fontSize * 1.05}pt`, fontWeight: "bold", color: "#333", textTransform: "uppercase", borderBottom: `2px solid ${primaryColor}`, paddingBottom: "0.15rem", marginBottom: "0.8rem" }}>
                Education
              </h3>
              {education.map((edu) => (
                <div key={edu.id} style={{ marginBottom: "0.6rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: `${fontSize * 0.88}pt`, fontWeight: "bold" }}>
                    <span>{edu.degree || "Degree"}{edu.field ? ` in ${edu.field}` : ""} {edu.boardOrUniversity ? `| ${edu.boardOrUniversity}` : ""}</span>
                    <span style={{ fontWeight: "normal", fontSize: `${fontSize * 0.85}pt`, color: "#555555" }}>{edu.startDate} {edu.endDate ? `— ${edu.endDate}` : ""}</span>
                  </div>
                  <div style={{ fontSize: `${fontSize * 0.85}pt`, color: "#444444" }}>
                    {edu.institution || "Institution"} {edu.gpa && `• ${getScoreLabel(edu)}`}
                    {edu.scholarship && ` • Scholarship: ${edu.scholarship}`}
                  </div>
                </div>
              ))}
            </div>
          );
        case "skills":
          if (skills.technical.length === 0 && skills.soft.length === 0) return null;
          return (
            <div style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: `${fontSize * 1.05}pt`, fontWeight: "bold", color: "#333", textTransform: "uppercase", borderBottom: `2px solid ${primaryColor}`, paddingBottom: "0.15rem", marginBottom: "0.6rem" }}>
                Core Qualifications
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: `${fontSize * 0.85}pt`, lineHeight: spacing }}>
                {skills.technical.length > 0 && (
                  <div>
                    <strong style={{ color: primaryColor }}>Core Technologies:</strong>
                    <div style={{ marginTop: "0.25rem" }}>{skills.technical.join(", ")}</div>
                  </div>
                )}
                {skills.soft.length > 0 && (
                  <div>
                    <strong style={{ color: primaryColor }}>Leadership Capabilities:</strong>
                    <div style={{ marginTop: "0.25rem" }}>{skills.soft.join(", ")}</div>
                  </div>
                )}
              </div>
            </div>
          );
        case "projects":
          if (projects.length === 0) return null;
          return (
            <div style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: `${fontSize * 1.05}pt`, fontWeight: "bold", color: "#333", textTransform: "uppercase", borderBottom: `2px solid ${primaryColor}`, paddingBottom: "0.15rem", marginBottom: "0.6rem" }}>
                Key Business Ventures & Projects
              </h3>
              {projects.map((proj) => (
                <div key={proj.id} style={{ marginBottom: "0.8rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: `${fontSize * 0.88}pt` }}>
                    <span>{proj.name}</span>
                    {proj.link && <span style={{ fontSize: `${fontSize * 0.82}pt`, fontWeight: "normal", color: primaryColor }}>{proj.link}</span>}
                  </div>
                  <p style={{ fontSize: `${fontSize * 0.85}pt`, margin: "0.2rem 0", lineHeight: spacing }}>{proj.description}</p>
                  {proj.techStack && proj.techStack.length > 0 && (
                    <div style={{ fontSize: `${fontSize * 0.78}pt`, color: "#666666" }}>Technology Focus: {proj.techStack.join(", ")}</div>
                  )}
                </div>
              ))}
            </div>
          );
        case "certifications":
          if (certifications.length === 0) return null;
          return (
            <div style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: `${fontSize * 1.05}pt`, fontWeight: "bold", color: "#333", textTransform: "uppercase", borderBottom: `2px solid ${primaryColor}`, paddingBottom: "0.15rem", marginBottom: "0.6rem" }}>
                Board Memberships & Certifications
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem 1.2rem", fontSize: `${fontSize * 0.85}pt` }}>
                {certifications.map((c) => c.name && (
                  <div key={c.id}>
                    • <strong>{c.name}</strong> {c.issuer ? `(${c.issuer})` : ""} {c.date && `— ${c.date}`}
                  </div>
                ))}
              </div>
            </div>
          );
        case "languages":
          if (activeLanguages.length === 0) return null;
          return (
            <div style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: `${fontSize * 1.05}pt`, fontWeight: "bold", color: "#333", textTransform: "uppercase", borderBottom: `2px solid ${primaryColor}`, paddingBottom: "0.15rem", marginBottom: "0.6rem" }}>
                Languages
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", fontSize: `${fontSize * 0.85}pt` }}>
                {activeLanguages.map((l) => (
                  <div key={l.id}>
                    🗣️ {l.language} — <strong>{l.proficiency}</strong> {l.usageContext && `(${l.usageContext})`}
                  </div>
                ))}
              </div>
            </div>
          );
        case "fresher":
          if (!fresherMode) return null;
          return (
            <div style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: `${fontSize * 1.05}pt`, fontWeight: "bold", color: "#333", textTransform: "uppercase", borderBottom: `2px solid ${primaryColor}`, paddingBottom: "0.15rem", marginBottom: "0.6rem" }}>
                Additional Academic Engagements
              </h3>
              <div style={{ fontSize: `${fontSize * 0.85}pt`, lineHeight: spacing }}>
                {activeExams.length > 0 && <div>Competitive Scores: {activeExams.map(e => `${e.exam} [AIR: ${e.score}]`).join(", ")}</div>}
                {hackathons.length > 0 && <div style={{ marginTop: "0.25rem" }}>Hackathon Wins: {hackathons.join(" • ")}</div>}
                {clubsAndLeadership.length > 0 && <div style={{ marginTop: "0.25rem" }}>Leadership Roles: {clubsAndLeadership.join(" • ")}</div>}
              </div>
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div style={{ fontFamily: selectedFont, color: "#1a1a1a", padding: "0.5rem" }}>
        {/* Prominent Header */}
        <div style={{ textAlign: "center", marginBottom: "1.8rem" }}>
          <h1 style={{ fontSize: `${fontSize * 2.2}pt`, color: primaryColor, fontWeight: "500", letterSpacing: "0.02em", marginBottom: "0.6rem" }}>
            {personalInfo.fullName || "Your Full Name"}
          </h1>
          <div style={{ fontSize: `${fontSize * 0.88}pt`, color: "#444444", display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>| {personalInfo.phone}</span>}
            {personalInfo.location && <span>| {personalInfo.location}</span>}
            {personalInfo.linkedin && <span>| {personalInfo.linkedin}</span>}
            {personalInfo.website && <span>| {personalInfo.website}</span>}
          </div>
        </div>

        {/* Dynamic section order loops */}
        {order.map((secKey) => (
          <div key={secKey}>
            {renderSection(secKey)}
          </div>
        ))}
      </div>
    );
  };

  // 4. MINIMAL TEMPLATE
  const renderMinimalTemplate = () => {
    const renderSection = (key: string) => {
      switch (key) {
        case "summary":
          if (!summary) return null;
          return (
            <div style={{ marginBottom: "1.4rem" }}>
              <h3 style={{ fontSize: `${fontSize * 0.82}pt`, fontWeight: "700", color: "#111111", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
                Summary
              </h3>
              <p style={{ margin: 0, color: "#555555", fontSize: `${fontSize * 0.82}pt` }}>{summary}</p>
            </div>
          );
        case "work":
          if (workExperience.length === 0) return null;
          return (
            <div style={{ marginBottom: "1.4rem" }}>
              <h3 style={{ fontSize: `${fontSize * 0.82}pt`, fontWeight: "700", color: "#111111", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.6rem" }}>
                Experience
              </h3>
              {workExperience.map((exp) => (
                <div key={exp.id} style={{ marginBottom: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "600", color: "#222222", fontSize: `${fontSize * 0.82}pt`, marginBottom: "0.1rem" }}>
                    <span>{exp.role || "Role"} @ {exp.company || "Company"} {exp.city ? `(${exp.city})` : ""}</span>
                    <span style={{ fontWeight: "normal", color: "#888888", fontSize: `${fontSize * 0.78}pt` }}>{exp.startDate} {exp.endDate ? `– ${exp.endDate}` : ""}</span>
                  </div>
                  <ul style={{ paddingLeft: "1rem", margin: 0, color: "#555555", fontSize: `${fontSize * 0.78}pt` }}>
                    {exp.bullets.map((b, bi) => (
                      b && <li key={bi} style={{ lineHeight: spacing, marginBottom: "0.15rem" }}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          );
        case "education":
          if (education.length === 0) return null;
          return (
            <div style={{ marginBottom: "1.4rem" }}>
              <h3 style={{ fontSize: `${fontSize * 0.82}pt`, fontWeight: "700", color: "#111111", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.6rem" }}>
                Education
              </h3>
              {education.map((edu) => (
                <div key={edu.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem", color: "#555555", fontSize: `${fontSize * 0.82}pt` }}>
                  <div>
                    <strong style={{ color: "#222" }}>{edu.degree || "Degree"}</strong> {edu.field ? `in ${edu.field}` : ""} • {edu.institution || "Institution"}
                    {edu.gpa && <span> ({getScoreLabel(edu)})</span>}
                  </div>
                  <span style={{ fontSize: `${fontSize * 0.78}pt`, color: "#888888" }}>{edu.startDate} {edu.endDate ? `– ${edu.endDate}` : ""}</span>
                </div>
              ))}
            </div>
          );
        case "skills":
          if (skills.technical.length === 0 && skills.soft.length === 0) return null;
          return (
            <div style={{ marginBottom: "1.4rem" }}>
              <h3 style={{ fontSize: `${fontSize * 0.82}pt`, fontWeight: "700", color: "#111111", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
                Skills
              </h3>
              {skills.technical.length > 0 && (
                <p style={{ margin: "0 0 0.25rem", fontSize: `${fontSize * 0.8}pt` }}>
                  <strong>Technical:</strong> {skills.technical.join(", ")}
                </p>
              )}
              {skills.soft.length > 0 && (
                <p style={{ margin: 0, fontSize: `${fontSize * 0.8}pt` }}>
                  <strong>Soft:</strong> {skills.soft.join(", ")}
                </p>
              )}
            </div>
          );
        case "projects":
          if (projects.length === 0) return null;
          return (
            <div style={{ marginBottom: "1.4rem" }}>
              <h3 style={{ fontSize: `${fontSize * 0.82}pt`, fontWeight: "700", color: "#111111", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
                Projects
              </h3>
              {projects.map((proj) => (
                <div key={proj.id} style={{ marginBottom: "0.6rem", fontSize: `${fontSize * 0.8}pt` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "600", color: "#222" }}>
                    <span>{proj.name}</span>
                    {proj.link && <span style={{ fontWeight: "normal", fontSize: `${fontSize * 0.78}pt`, color: primaryColor }}>{proj.link}</span>}
                  </div>
                  <p style={{ margin: "0.15rem 0", color: "#555555", lineHeight: spacing }}>{proj.description}</p>
                </div>
              ))}
            </div>
          );
        case "certifications":
          if (certifications.length === 0) return null;
          return (
            <div style={{ marginBottom: "1.4rem" }}>
              <h3 style={{ fontSize: `${fontSize * 0.82}pt`, fontWeight: "700", color: "#111111", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
                Certifications
              </h3>
              <p style={{ margin: 0, color: "#555555", fontSize: `${fontSize * 0.8}pt` }}>
                {certifications.map((c, i) => c.name && (
                  <span key={c.id}>
                    {i > 0 && " • "}{c.name} {c.issuer ? `(${c.issuer})` : ""}
                  </span>
                ))}
              </p>
            </div>
          );
        case "languages":
          if (activeLanguages.length === 0) return null;
          return (
            <div style={{ marginBottom: "1.4rem" }}>
              <h3 style={{ fontSize: `${fontSize * 0.82}pt`, fontWeight: "700", color: "#111111", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
                Languages
              </h3>
              <p style={{ margin: 0, color: "#555555", fontSize: `${fontSize * 0.8}pt` }}>
                {activeLanguages.map((l) => `${l.language} (${l.proficiency})`).join(", ")}
              </p>
            </div>
          );
        case "fresher":
          if (!fresherMode) return null;
          return (
            <div style={{ marginBottom: "1.4rem" }}>
              <h3 style={{ fontSize: `${fontSize * 0.82}pt`, fontWeight: "700", color: "#111111", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
                Activities & Honors
              </h3>
              <p style={{ margin: 0, color: "#555", fontSize: `${fontSize * 0.8}pt`, lineHeight: spacing }}>
                {[
                  activeExams.map(ex => `${ex.exam}: AIR ${ex.score}`).join(", "),
                  hackathons.join(", "),
                  clubsAndLeadership.join(", ")
                ].filter(Boolean).join(" • ")}
              </p>
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div style={{ fontFamily: selectedFont, color: "#444444", fontSize: `${fontSize * 0.82}pt`, lineHeight: spacing }}>
        {/* Minimal left aligned header with side contact */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "1px solid #eaeaea", paddingBottom: "1.2rem", marginBottom: "1.5rem" }}>
          <div>
            <h1 style={{ fontSize: `${fontSize * 1.8}pt`, color: "#111111", fontWeight: "300", letterSpacing: "-0.02em", margin: 0 }}>
              {personalInfo.fullName || "Your Full Name"}
            </h1>
            <div style={{ fontSize: `${fontSize * 0.82}pt`, color: primaryColor, marginTop: "0.2rem", fontWeight: 500 }}>
              {workExperience[0]?.role || "Professional"}
            </div>
          </div>
          <div style={{ textAlign: "right", fontSize: `${fontSize * 0.75}pt`, color: "#777777", display: "grid", gap: "0.15rem" }}>
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.location && <span>{personalInfo.location}</span>}
            {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
          </div>
        </div>

        {/* Dynamic section loops */}
        {order.map((secKey) => (
          <div key={secKey}>
            {renderSection(secKey)}
          </div>
        ))}
      </div>
    );
  };

  // 5. CREATIVE TEMPLATE (2 Column layout)
  const renderCreativeTemplate = () => {
    // Left sidebar items
    const renderSidebar = () => {
      return (
        <>
          {/* Contact Details */}
          <div>
            <h4 style={{ fontSize: `${fontSize * 0.78}pt`, fontWeight: 800, color: primaryColor, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: `1px solid ${primaryColor}30`, paddingBottom: "0.2rem", marginBottom: "0.5rem" }}>
              Contact
            </h4>
            <div style={{ display: "grid", gap: "0.4rem", fontSize: `${fontSize * 0.74}pt`, color: "#555555" }}>
              {personalInfo.email && <div style={{ overflowWrap: "anywhere" }}>✉ {personalInfo.email}</div>}
              {personalInfo.phone && <div>☎ {personalInfo.phone}</div>}
              {personalInfo.location && <div>📍 {personalInfo.location}</div>}
              {personalInfo.linkedin && <div style={{ overflowWrap: "anywhere" }}>🔗 {personalInfo.linkedin}</div>}
            </div>
          </div>

          {/* Skills (Placed static in sidebar in creative) */}
          {(skills.technical.length > 0 || skills.soft.length > 0) && (
            <div>
              <h4 style={{ fontSize: `${fontSize * 0.78}pt`, fontWeight: 800, color: primaryColor, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: `1px solid ${primaryColor}30`, paddingBottom: "0.2rem", marginBottom: "0.5rem" }}>
                Capabilities
              </h4>
              {skills.technical.length > 0 && (
                <div style={{ marginBottom: "0.5rem" }}>
                  <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#666", marginBottom: "0.25rem", textTransform: "uppercase" }}>Technical</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                    {skills.technical.slice(0, 10).map((s) => (
                      <span key={s} style={{ fontSize: "0.65rem", background: "#ffffff", color: "#333", border: `1px solid ${primaryColor}20`, padding: "1px 5px", borderRadius: "3px" }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Languages in Sidebar */}
          {activeLanguages.length > 0 && (
            <div>
              <h4 style={{ fontSize: `${fontSize * 0.78}pt`, fontWeight: 800, color: primaryColor, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: `1px solid ${primaryColor}30`, paddingBottom: "0.2rem", marginBottom: "0.5rem" }}>
                Languages
              </h4>
              <div style={{ display: "grid", gap: "0.3rem", fontSize: `${fontSize * 0.74}pt`, color: "#555" }}>
                {activeLanguages.map((l) => (
                  <div key={l.id}>• {l.language} ({l.proficiency})</div>
                ))}
              </div>
            </div>
          )}
        </>
      );
    };

    const renderSection = (key: string) => {
      switch (key) {
        case "summary":
          if (!summary) return null;
          return (
            <div style={{ marginBottom: "1.2rem" }}>
              <h3 style={{ fontSize: `${fontSize * 0.9}pt`, fontWeight: 800, color: primaryColor, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #eaeaea", paddingBottom: "0.2rem", marginBottom: "0.4rem", fontFamily: "'Syne', sans-serif" }}>
                Profile Overview
              </h3>
              <p style={{ fontSize: `${fontSize * 0.78}pt`, color: "#444444", lineHeight: spacing, margin: 0 }}>{summary}</p>
            </div>
          );
        case "work":
          if (workExperience.length === 0) return null;
          return (
            <div style={{ marginBottom: "1.2rem" }}>
              <h3 style={{ fontSize: `${fontSize * 0.9}pt`, fontWeight: 800, color: primaryColor, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #eaeaea", paddingBottom: "0.2rem", marginBottom: "0.5rem", fontFamily: "'Syne', sans-serif" }}>
                Work History
              </h3>
              {workExperience.map((exp) => (
                <div key={exp.id} style={{ marginBottom: "0.75rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: `${fontSize * 0.8}pt`, color: "#222222", marginBottom: "0.1rem" }}>
                    <span>{exp.role || "Role"} <span style={{ color: primaryColor }}>@ {exp.company || "Company"}</span></span>
                    <span style={{ fontSize: `${fontSize * 0.74}pt`, color: "#666666", fontWeight: "normal" }}>{exp.startDate} {exp.endDate ? `– ${exp.endDate}` : ""}</span>
                  </div>
                  <ul style={{ paddingLeft: "1rem", margin: 0, fontSize: `${fontSize * 0.76}pt`, color: "#444444" }}>
                    {exp.bullets.map((b, bi) => (
                      b && <li key={bi} style={{ lineHeight: spacing, marginBottom: "0.15rem" }}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          );
        case "education":
          if (education.length === 0) return null;
          return (
            <div style={{ marginBottom: "1.2rem" }}>
              <h3 style={{ fontSize: `${fontSize * 0.9}pt`, fontWeight: 800, color: primaryColor, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #eaeaea", paddingBottom: "0.2rem", marginBottom: "0.5rem", fontFamily: "'Syne', sans-serif" }}>
                Education
              </h3>
              {education.map((edu) => (
                <div key={edu.id} style={{ display: "flex", justifyContent: "space-between", fontSize: `${fontSize * 0.78}pt`, color: "#444444", marginBottom: "0.25rem" }}>
                  <div>
                    <strong style={{ color: "#222222" }}>{edu.degree || "Degree"}</strong> {edu.field ? `in ${edu.field}` : ""} <br />
                    <span style={{ fontSize: `${fontSize * 0.74}pt`, color: "#666" }}>{edu.boardOrUniversity || ""} {edu.institution || ""} {edu.gpa && `• Score: ${edu.gpa}`}</span>
                  </div>
                  <span style={{ fontSize: `${fontSize * 0.74}pt`, color: "#666666" }}>{edu.startDate} {edu.endDate ? `– ${edu.endDate}` : ""}</span>
                </div>
              ))}
            </div>
          );
        case "projects":
          if (projects.length === 0) return null;
          return (
            <div style={{ marginBottom: "1.2rem" }}>
              <h3 style={{ fontSize: `${fontSize * 0.9}pt`, fontWeight: 800, color: primaryColor, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #eaeaea", paddingBottom: "0.2rem", marginBottom: "0.4rem", fontFamily: "'Syne', sans-serif" }}>
                Projects
              </h3>
              {projects.map((proj) => (
                <div key={proj.id} style={{ marginBottom: "0.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: `${fontSize * 0.78}pt`, color: "#222222" }}>
                    <span>{proj.name}</span>
                    {proj.link && <span style={{ fontSize: `${fontSize * 0.74}pt` }}>Link</span>}
                  </div>
                  <p style={{ fontSize: `${fontSize * 0.74}pt`, color: "#555555", margin: "0.1rem 0", lineHeight: spacing }}>{proj.description}</p>
                </div>
              ))}
            </div>
          );
        case "certifications":
          if (certifications.length === 0) return null;
          return (
            <div style={{ marginBottom: "1.2rem" }}>
              <h3 style={{ fontSize: `${fontSize * 0.9}pt`, fontWeight: 800, color: primaryColor, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #eaeaea", paddingBottom: "0.2rem", marginBottom: "0.4rem", fontFamily: "'Syne', sans-serif" }}>
                Credentials
              </h3>
              <div style={{ display: "grid", gap: "0.3rem", fontSize: `${fontSize * 0.76}pt`, color: "#444" }}>
                {certifications.map((c) => c.name && (
                  <div key={c.id}>🏆 {c.name} {c.issuer ? `(${c.issuer})` : ""}</div>
                ))}
              </div>
            </div>
          );
        case "fresher":
          if (!fresherMode) return null;
          return (
            <div style={{ marginBottom: "1.2rem" }}>
              <h3 style={{ fontSize: `${fontSize * 0.9}pt`, fontWeight: 800, color: primaryColor, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #eaeaea", paddingBottom: "0.2rem", marginBottom: "0.4rem", fontFamily: "'Syne', sans-serif" }}>
                Extracurriculars
              </h3>
              <div style={{ fontSize: `${fontSize * 0.76}pt`, color: "#444" }}>
                {activeExams.map(ex => `${ex.exam}: Rank ${ex.score}`).join(" | ")}
                {hackathons.length > 0 && <div style={{ marginTop: "0.2rem" }}>Wins: {hackathons.join(", ")}</div>}
              </div>
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div style={{ display: "flex", minHeight: "285mm", fontFamily: selectedFont, color: "#333333" }}>
        {/* Left Column (Sidebar) */}
        <div style={{ width: "35%", background: `${primaryColor}0d`, borderRight: `1px solid ${primaryColor}1a`, padding: "1.5rem 1rem 1rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}bb)`,
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.8rem",
              fontWeight: 800,
              margin: "0 auto 0.75rem",
              fontFamily: "'Syne', sans-serif"
            }}>
              {personalInfo.fullName ? personalInfo.fullName.charAt(0).toUpperCase() : "?"}
            </div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#111111", margin: 0, fontFamily: "'Syne', sans-serif", lineHeight: 1.2 }}>
              {personalInfo.fullName || "Your Name"}
            </h2>
            <div style={{ fontSize: "0.72rem", color: primaryColor, fontWeight: 700, textTransform: "uppercase", marginTop: "0.2rem" }}>
              {workExperience[0]?.role || "Applicant"}
            </div>
          </div>

          {renderSidebar()}
        </div>

        {/* Right Column (Main Content) */}
        <div style={{ width: "65%", padding: "1.5rem 1.2rem", display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          {/* Dynamic render order filters skills/languages which were handled in sidebar */}
          {order.filter(key => key !== "skills" && key !== "languages").map((secKey) => (
            <div key={secKey}>
              {renderSection(secKey)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 6. ATS SAFE TEMPLATE (Standard clean 1-column layout, Times New Roman, Black/White)
  const renderAtsSafeTemplate = () => {
    const renderSection = (key: string) => {
      switch (key) {
        case "summary":
          if (!summary) return null;
          return (
            <div style={{ marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "10pt", fontWeight: "bold", borderBottom: "1px solid #000", paddingBottom: "1px", textTransform: "uppercase", marginBottom: "4px" }}>Professional Summary</h2>
              <p style={{ fontSize: "9.5pt", margin: 0, lineHeight: 1.15, textAlign: "justify" }}>{summary}</p>
            </div>
          );
        case "work":
          if (workExperience.length === 0) return null;
          return (
            <div style={{ marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "10pt", fontWeight: "bold", borderBottom: "1px solid #000", paddingBottom: "1px", textTransform: "uppercase", marginBottom: "6px" }}>Experience</h2>
              {workExperience.map((exp) => (
                <div key={exp.id} style={{ marginBottom: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "9.5pt" }}>
                    <span>{exp.company} — {exp.role}</span>
                    <span>{exp.startDate} – {exp.endDate}</span>
                  </div>
                  <div style={{ fontSize: "8.5pt", fontStyle: "italic", color: "#555" }}>
                    {[exp.city, exp.industry, exp.employmentType].filter(Boolean).join(" • ")}
                  </div>
                  <ul style={{ paddingLeft: "15px", margin: "2px 0 0" }}>
                    {exp.bullets.map((b, bi) => (
                      b && <li key={bi} style={{ fontSize: "9.5pt", marginBottom: "2px", lineHeight: 1.15 }}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          );
        case "education":
          if (education.length === 0) return null;
          return (
            <div style={{ marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "10pt", fontWeight: "bold", borderBottom: "1px solid #000", paddingBottom: "1px", textTransform: "uppercase", marginBottom: "6px" }}>Education</h2>
              {education.map((edu) => (
                <div key={edu.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "9.5pt", marginBottom: "4px" }}>
                  <div>
                    <strong>{edu.institution}</strong> — {edu.degree} {edu.field ? `in ${edu.field}` : ""}
                    {edu.boardOrUniversity ? ` (${edu.boardOrUniversity})` : ""} {edu.gpa && `• GPA: ${edu.gpa}`}
                  </div>
                  <span>{edu.startDate} – {edu.endDate}</span>
                </div>
              ))}
            </div>
          );
        case "skills":
          if (skills.technical.length === 0 && skills.soft.length === 0) return null;
          return (
            <div style={{ marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "10pt", fontWeight: "bold", borderBottom: "1px solid #000", paddingBottom: "1px", textTransform: "uppercase", marginBottom: "4px" }}>Skills</h2>
              <p style={{ fontSize: "9.5pt", margin: 0, lineHeight: 1.15 }}>
                <strong>Technical Skills:</strong> {skills.technical.join(", ")} <br />
                <strong>Soft Skills:</strong> {skills.soft.join(", ")}
              </p>
            </div>
          );
        case "projects":
          if (projects.length === 0) return null;
          return (
            <div style={{ marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "10pt", fontWeight: "bold", borderBottom: "1px solid #000", paddingBottom: "1px", textTransform: "uppercase", marginBottom: "4px" }}>Projects</h2>
              {projects.map((proj) => (
                <div key={proj.id} style={{ marginBottom: "6px", fontSize: "9.5pt" }}>
                  <div style={{ fontWeight: "bold" }}>{proj.name} {proj.link ? `(${proj.link})` : ""}</div>
                  <p style={{ margin: "2px 0", lineHeight: 1.15 }}>{proj.description}</p>
                </div>
              ))}
            </div>
          );
        case "certifications":
          if (certifications.length === 0) return null;
          return (
            <div style={{ marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "10pt", fontWeight: "bold", borderBottom: "1px solid #000", paddingBottom: "1px", textTransform: "uppercase", marginBottom: "4px" }}>Certifications</h2>
              <p style={{ fontSize: "9.5pt", margin: 0 }}>
                {certifications.map((c) => c.name).join(" • ")}
              </p>
            </div>
          );
        case "languages":
          if (activeLanguages.length === 0) return null;
          return (
            <div style={{ marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "10pt", fontWeight: "bold", borderBottom: "1px solid #000", paddingBottom: "1px", textTransform: "uppercase", marginBottom: "4px" }}>Languages</h2>
              <p style={{ fontSize: "9.5pt", margin: 0 }}>
                {activeLanguages.map((l) => `${l.language} (${l.proficiency})`).join(", ")}
              </p>
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div style={{ fontFamily: "Times New Roman, serif", color: "#000", fontSize: "10pt", lineHeight: 1.15 }}>
        {/* Simple Header */}
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <h1 style={{ fontSize: "16pt", fontWeight: "bold", textTransform: "uppercase", margin: "0 0 4px" }}>
            {personalInfo.fullName || "Your Full Name"}
          </h1>
          <div style={{ fontSize: "9.5pt" }}>
            {personalInfo.location && <span>{personalInfo.location} • </span>}
            {personalInfo.phone && <span>{personalInfo.phone} • </span>}
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.linkedin && <span> • {personalInfo.linkedin}</span>}
          </div>
        </div>

        {/* Order sequence loop */}
        {order.map((secKey) => (
          <div key={secKey}>
            {renderSection(secKey)}
          </div>
        ))}
      </div>
    );
  };

  // 7. FRESHER TEMPLATE (Optimized for entry-level candidates, green styling)
  const renderFresherTemplate = () => {
    const renderSection = (key: string) => {
      switch (key) {
        case "education":
          if (education.length === 0) return null;
          return (
            <div style={{ marginBottom: "1.2rem" }}>
              <h3 style={{ fontSize: `${fontSize * 1.05}pt`, fontWeight: 700, color: primaryColor, textTransform: "uppercase", borderLeft: `4px solid ${primaryColor}`, paddingLeft: "0.5rem", marginBottom: "0.6rem" }}>
                Education Background
              </h3>
              {education.map((edu) => (
                <div key={edu.id} style={{ marginBottom: "0.6rem", fontSize: `${fontSize * 0.82}pt` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", color: "#111" }}>
                    <span>{edu.degree} in {edu.field}</span>
                    <span style={{ fontWeight: "normal", color: "#666" }}>{edu.startDate} – {edu.endDate}</span>
                  </div>
                  <div>{edu.institution} {edu.boardOrUniversity ? `(${edu.boardOrUniversity})` : ""}</div>
                  <div style={{ fontWeight: 600, color: primaryColor, display: "flex", gap: "0.8rem", marginTop: "0.1rem" }}>
                    {edu.gpa && <span>{getScoreLabel(edu)}</span>}
                    {edu.distinction && <span>• Distinction Honors</span>}
                    {edu.topper && <span>• Class Gold Medalist</span>}
                  </div>
                </div>
              ))}
            </div>
          );
        case "projects":
          if (projects.length === 0) return null;
          return (
            <div style={{ marginBottom: "1.2rem" }}>
              <h3 style={{ fontSize: `${fontSize * 1.05}pt`, fontWeight: 700, color: primaryColor, textTransform: "uppercase", borderLeft: `4px solid ${primaryColor}`, paddingLeft: "0.5rem", marginBottom: "0.6rem" }}>
                Academic Projects
              </h3>
              {projects.map((proj) => (
                <div key={proj.id} style={{ marginBottom: "0.75rem", fontSize: `${fontSize * 0.82}pt` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", color: "#111" }}>
                    <span>🚀 {proj.name}</span>
                    {proj.link && <span style={{ fontSize: "0.78rem", fontWeight: "normal", color: primaryColor }}>{proj.link}</span>}
                  </div>
                  <p style={{ margin: "2px 0 4px", color: "#444", lineHeight: spacing }}>{proj.description}</p>
                  {proj.techStack && proj.techStack.length > 0 && (
                    <span style={{ fontSize: "0.74rem", background: "#f0fdf4", color: "#166534", padding: "2px 6px", borderRadius: "4px", fontWeight: 600 }}>
                      Stack: {proj.techStack.join(", ")}
                    </span>
                  )}
                </div>
              ))}
            </div>
          );
        case "fresher":
          const hasExams = activeExams.length > 0;
          const hasHacks = hackathons.length > 0;
          const hasContests = codingContests.length > 0;
          if (!hasExams && !hasHacks && !hasContests) return null;

          return (
            <div style={{ marginBottom: "1.2rem" }}>
              <h3 style={{ fontSize: `${fontSize * 1.05}pt`, fontWeight: 700, color: primaryColor, textTransform: "uppercase", borderLeft: `4px solid ${primaryColor}`, paddingLeft: "0.5rem", marginBottom: "0.6rem" }}>
                Competitions & Exams
              </h3>
              {hasExams && (
                <div style={{ marginBottom: "0.5rem", fontSize: `${fontSize * 0.8}pt` }}>
                  <strong>National Level Exams:</strong> {activeExams.map(ex => `${ex.exam} (AIR ${ex.score}, ${ex.year})`).join(" | ")}
                </div>
              )}
              {hasHacks && (
                <div style={{ marginBottom: "0.5rem", fontSize: `${fontSize * 0.8}pt` }}>
                  <strong>Hackathon Wins:</strong> {hackathons.join(" • ")}
                </div>
              )}
              {hasContests && (
                <div style={{ fontSize: `${fontSize * 0.8}pt` }}>
                  <strong>Coding Profiles:</strong> {codingContests.join(" • ")}
                </div>
              )}
            </div>
          );
        case "skills":
          if (skills.technical.length === 0 && skills.soft.length === 0) return null;
          return (
            <div style={{ marginBottom: "1.2rem" }}>
              <h3 style={{ fontSize: `${fontSize * 1.05}pt`, fontWeight: 700, color: primaryColor, textTransform: "uppercase", borderLeft: `4px solid ${primaryColor}`, paddingLeft: "0.5rem", marginBottom: "0.5rem" }}>
                Skills & Strengths
              </h3>
              <p style={{ fontSize: `${fontSize * 0.8}pt`, margin: "0 0 4px", lineHeight: spacing }}>
                <strong>Technical Tools:</strong> {skills.technical.join(", ")}
              </p>
              <p style={{ fontSize: `${fontSize * 0.8}pt`, margin: 0, lineHeight: spacing }}>
                <strong>Core Strengths:</strong> {skills.soft.join(", ")}
              </p>
            </div>
          );
        case "languages":
          if (activeLanguages.length === 0) return null;
          return (
            <div style={{ marginBottom: "1.2rem" }}>
              <h3 style={{ fontSize: `${fontSize * 1.05}pt`, fontWeight: 700, color: primaryColor, textTransform: "uppercase", borderLeft: `4px solid ${primaryColor}`, paddingLeft: "0.5rem", marginBottom: "0.4rem" }}>
                Languages Known
              </h3>
              <p style={{ fontSize: `${fontSize * 0.8}pt`, margin: 0 }}>
                {activeLanguages.map(l => `${l.language} (${l.proficiency})`).join(" • ")}
              </p>
            </div>
          );
        case "work":
          if (workExperience.length === 0) return null;
          return (
            <div style={{ marginBottom: "1.2rem" }}>
              <h3 style={{ fontSize: `${fontSize * 1.05}pt`, fontWeight: 700, color: primaryColor, textTransform: "uppercase", borderLeft: `4px solid ${primaryColor}`, paddingLeft: "0.5rem", marginBottom: "0.5rem" }}>
                Internship / Practical Experience
              </h3>
              {workExperience.map((exp) => (
                <div key={exp.id} style={{ marginBottom: "0.6rem", fontSize: `${fontSize * 0.8}pt` }}>
                  <strong style={{ color: "#222" }}>{exp.role} — {exp.company}</strong> ({exp.startDate} - {exp.endDate})
                  <ul style={{ margin: "2px 0 0", paddingLeft: "15px" }}>
                    {exp.bullets.map((b, bi) => <li key={bi}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          );
        case "summary":
        default:
          return null;
      }
    };

    return (
      <div style={{ fontFamily: selectedFont, color: "#27272a", fontSize: `${fontSize * 0.82}pt`, padding: "0.2rem" }}>
        {/* Simple Top Green Accent Header */}
        <div style={{ background: `linear-gradient(135deg, ${primaryColor}, #059669)`, color: "#fff", padding: "1.5rem", borderRadius: "8px", marginBottom: "1.5rem", textAlign: "center" }}>
          <h1 style={{ fontSize: `${fontSize * 1.8}pt`, margin: "0 0 0.3rem", fontWeight: 800 }}>{personalInfo.fullName}</h1>
          <div style={{ fontSize: `${fontSize * 0.82}pt`, opacity: 0.9, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "0.8rem" }}>
            <span>{personalInfo.email}</span>
            <span>• {personalInfo.phone}</span>
            <span>• {personalInfo.location}</span>
          </div>
        </div>

        {order.map((secKey) => (
          <div key={secKey}>
            {renderSection(secKey)}
          </div>
        ))}
      </div>
    );
  };

  // 8. STARTUP TEMPLATE (Growth metric highlighted, rose accent, compact grids)
  const renderStartupTemplate = () => {
    // Renders similar to standard but with bold grids and metrics
    const renderSection = (key: string) => {
      switch (key) {
        case "summary":
          if (!summary) return null;
          return (
            <div style={{ marginBottom: "1.2rem" }}>
              <h3 style={{ fontSize: `${fontSize * 0.92}pt`, fontWeight: 800, color: primaryColor, textTransform: "uppercase", marginBottom: "0.4rem" }}>Elevator Pitch</h3>
              <p style={{ fontSize: `${fontSize * 0.8}pt`, color: "#3f3f46", margin: 0, lineHeight: spacing }}>{summary}</p>
            </div>
          );
        case "work":
          if (workExperience.length === 0) return null;
          return (
            <div style={{ marginBottom: "1.2rem" }}>
              <h3 style={{ fontSize: `${fontSize * 0.92}pt`, fontWeight: 800, color: primaryColor, textTransform: "uppercase", marginBottom: "0.6rem" }}>Growth & Impact History</h3>
              {workExperience.map((exp) => (
                <div key={exp.id} style={{ marginBottom: "0.8rem", borderLeft: `2px solid ${primaryColor}40`, paddingLeft: "0.6rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: `${fontSize * 0.85}pt` }}>
                    <span>{exp.role} @ <span style={{ color: primaryColor }}>{exp.company}</span></span>
                    <span style={{ fontSize: `${fontSize * 0.76}pt`, color: "#666" }}>{exp.startDate} - {exp.endDate}</span>
                  </div>
                  <ul style={{ margin: "2px 0 0", paddingLeft: "15px", fontSize: `${fontSize * 0.78}pt` }}>
                    {exp.bullets.map((b, bi) => <li key={bi} style={{ marginBottom: "2px", lineHeight: spacing }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          );
        case "projects":
          if (projects.length === 0) return null;
          return (
            <div style={{ marginBottom: "1.2rem" }}>
              <h3 style={{ fontSize: `${fontSize * 0.92}pt`, fontWeight: 800, color: primaryColor, textTransform: "uppercase", marginBottom: "0.5rem" }}>Products Built</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                {projects.map((proj) => (
                  <div key={proj.id} style={{ background: "#fff5f5", padding: "0.6rem", borderRadius: "6px", fontSize: `${fontSize * 0.78}pt` }}>
                    <div style={{ fontWeight: 700, color: "#111" }}>{proj.name}</div>
                    <p style={{ margin: "2px 0", color: "#555", lineHeight: spacing }}>{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        case "skills":
          if (skills.technical.length === 0) return null;
          return (
            <div style={{ marginBottom: "1.2rem" }}>
              <h3 style={{ fontSize: `${fontSize * 0.92}pt`, fontWeight: 800, color: primaryColor, textTransform: "uppercase", marginBottom: "0.4rem" }}>Tech Arsenal</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                {skills.technical.map(s => (
                  <span key={s} style={{ fontSize: "0.68rem", background: `${primaryColor}15`, color: primaryColor, padding: "2px 6px", borderRadius: "4px", fontWeight: 600 }}>{s}</span>
                ))}
              </div>
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div style={{ fontFamily: selectedFont, color: "#18181b", fontSize: `${fontSize * 0.8}pt` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `2px solid ${primaryColor}`, paddingBottom: "0.8rem", marginBottom: "1.2rem" }}>
          <div>
            <h1 style={{ fontSize: `${fontSize * 2}pt`, margin: 0, fontWeight: 900, letterSpacing: "-0.03em" }}>{personalInfo.fullName}</h1>
            <span style={{ fontSize: `${fontSize * 0.82}pt`, color: "#666" }}>{personalInfo.linkedin}</span>
          </div>
          <div style={{ textAlign: "right", fontSize: `${fontSize * 0.78}pt` }}>
            <div>{personalInfo.email}</div>
            <div>{personalInfo.phone}</div>
          </div>
        </div>

        {order.map((secKey) => (
          <div key={secKey}>
            {renderSection(secKey)}
          </div>
        ))}
      </div>
    );
  };

  // 9. IT TECH TEMPLATE
  const renderItTechTemplate = () => {
    const renderSection = (key: string) => {
      switch (key) {
        case "skills":
          if (skills.technical.length === 0) return null;
          return (
            <div style={{ marginBottom: "1.2rem" }}>
              <h3 style={{ fontSize: `${fontSize * 0.92}pt`, fontWeight: 700, color: primaryColor, textTransform: "uppercase", borderBottom: "2px solid #eaeaea", paddingBottom: "2px", marginBottom: "0.5rem" }}>Technical Stack</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                {skills.technical.map(s => (
                  <span key={s} style={{ fontSize: "0.68rem", background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1", padding: "2px 6px", borderRadius: "3px" }}>{s}</span>
                ))}
              </div>
            </div>
          );
        case "work":
          if (workExperience.length === 0) return null;
          return (
            <div style={{ marginBottom: "1.2rem" }}>
              <h3 style={{ fontSize: `${fontSize * 0.92}pt`, fontWeight: 700, color: primaryColor, textTransform: "uppercase", borderBottom: "2px solid #eaeaea", paddingBottom: "2px", marginBottom: "0.5rem" }}>Software Engineering Experience</h3>
              {workExperience.map((exp) => (
                <div key={exp.id} style={{ marginBottom: "0.8rem", fontSize: `${fontSize * 0.8}pt` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
                    <span>{exp.role} — {exp.company}</span>
                    <span style={{ fontWeight: "normal", color: "#666" }}>{exp.startDate} - {exp.endDate}</span>
                  </div>
                  <ul style={{ margin: "2px 0 0", paddingLeft: "15px" }}>
                    {exp.bullets.map((b, bi) => <li key={bi} style={{ marginBottom: "1px", lineHeight: spacing }}>{b}</li>)}
                  </ul>
                  {exp.toolsUsed && exp.toolsUsed.length > 0 && (
                    <div style={{ fontSize: "0.72rem", color: "#666", marginTop: "2px" }}>
                      Technologies deployed: {exp.toolsUsed.join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        case "projects":
          if (projects.length === 0) return null;
          return (
            <div style={{ marginBottom: "1.2rem" }}>
              <h3 style={{ fontSize: `${fontSize * 0.92}pt`, fontWeight: 700, color: primaryColor, textTransform: "uppercase", borderBottom: "2px solid #eaeaea", paddingBottom: "2px", marginBottom: "0.5rem" }}>System Architecture Projects</h3>
              {projects.map((proj) => (
                <div key={proj.id} style={{ marginBottom: "0.6rem", fontSize: `${fontSize * 0.8}pt` }}>
                  <div style={{ fontWeight: "bold", display: "flex", justifyContent: "space-between" }}>
                    <span>{proj.name}</span>
                    {proj.link && <span style={{ fontWeight: "normal", fontSize: "0.74rem" }}>{proj.link}</span>}
                  </div>
                  <p style={{ margin: "2px 0", color: "#444", lineHeight: spacing }}>{proj.description}</p>
                </div>
              ))}
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div style={{ fontFamily: "monospace", color: "#0f172a", fontSize: `${fontSize * 0.8}pt` }}>
        <div style={{ background: "#0f172a", color: "#38bdf8", padding: "1.2rem", marginBottom: "1.2rem", borderRadius: "4px" }}>
          <h1 style={{ fontSize: `${fontSize * 1.8}pt`, margin: 0, fontWeight: 700 }}>{personalInfo.fullName}</h1>
          <div style={{ fontSize: `${fontSize * 0.78}pt`, color: "#94a3b8", display: "flex", gap: "1rem", marginTop: "0.3rem" }}>
            <span>{personalInfo.email}</span>
            <span>{personalInfo.phone}</span>
            <span>{personalInfo.linkedin}</span>
          </div>
        </div>

        {order.map((secKey) => (
          <div key={secKey}>
            {renderSection(secKey)}
          </div>
        ))}
      </div>
    );
  };

  // 10. BFSI RISK TEMPLATE
  const renderBfsiRiskTemplate = () => {
    const renderSection = (key: string) => {
      switch (key) {
        case "work":
          if (workExperience.length === 0) return null;
          return (
            <div style={{ marginBottom: "1.2rem" }}>
              <h3 style={{ fontSize: `${fontSize * 0.92}pt`, fontWeight: 700, color: primaryColor, textTransform: "uppercase", borderBottom: `2px solid ${primaryColor}`, paddingBottom: "2px", marginBottom: "0.5rem" }}>BFSI & Compliance Mandates</h3>
              {workExperience.map((exp) => (
                <div key={exp.id} style={{ marginBottom: "0.8rem", fontSize: `${fontSize * 0.8}pt` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
                    <span>{exp.role} | {exp.company}</span>
                    <span>{exp.startDate} - {exp.endDate}</span>
                  </div>
                  <ul style={{ margin: "2px 0 0", paddingLeft: "15px" }}>
                    {exp.bullets.map((b, bi) => <li key={bi} style={{ marginBottom: "1px", lineHeight: spacing }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          );
        case "certifications":
          if (certifications.length === 0) return null;
          return (
            <div style={{ marginBottom: "1.2rem" }}>
              <h3 style={{ fontSize: `${fontSize * 0.92}pt`, fontWeight: 700, color: primaryColor, textTransform: "uppercase", borderBottom: `2px solid ${primaryColor}`, paddingBottom: "2px", marginBottom: "0.5rem" }}>Licenses, CFA, FRM & SEBI Credentials</h3>
              <ul style={{ margin: 0, paddingLeft: "15px", fontSize: `${fontSize * 0.8}pt` }}>
                {certifications.map((c) => <li key={c.id}><strong>{c.name}</strong> — Issued by {c.issuer || "N/A"} ({c.date})</li>)}
              </ul>
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div style={{ fontFamily: "Georgia, serif", color: "#1e293b", fontSize: `${fontSize * 0.82}pt` }}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: `${fontSize * 2}pt`, fontWeight: "bold", color: "#0f172a", margin: 0 }}>{personalInfo.fullName}</h1>
          <div style={{ fontSize: "0.8rem", color: "#475569", marginTop: "0.2rem" }}>
            {personalInfo.email} | {personalInfo.phone} | {personalInfo.location}
          </div>
        </div>

        {order.map((secKey) => (
          <div key={secKey}>
            {renderSection(secKey)}
          </div>
        ))}
      </div>
    );
  };

  // 11. MINIMAL 2 TEMPLATE
  const renderMinimal2Template = () => {
    const renderSection = (key: string) => {
      switch (key) {
        case "summary":
          if (!summary) return null;
          return (
            <div style={{ marginBottom: "1.2rem" }}>
              <h3 style={{ fontSize: `${fontSize * 0.85}pt`, fontWeight: 600, color: "#111", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "0.3rem" }}>Profile</h3>
              <p style={{ fontSize: `${fontSize * 0.8}pt`, color: "#555", margin: 0, lineHeight: spacing }}>{summary}</p>
            </div>
          );
        case "work":
          if (workExperience.length === 0) return null;
          return (
            <div style={{ marginBottom: "1.2rem" }}>
              <h3 style={{ fontSize: `${fontSize * 0.85}pt`, fontWeight: 600, color: "#111", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Experience</h3>
              {workExperience.map((exp) => (
                <div key={exp.id} style={{ marginBottom: "0.75rem", fontSize: `${fontSize * 0.8}pt` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
                    <span>{exp.role} @ {exp.company}</span>
                    <span style={{ fontWeight: "normal", color: "#888" }}>{exp.startDate} - {exp.endDate}</span>
                  </div>
                  <ul style={{ margin: "2px 0 0", paddingLeft: "15px", color: "#444" }}>
                    {exp.bullets.map((b, bi) => <li key={bi} style={{ lineHeight: spacing }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div style={{ fontFamily: "system-ui", color: "#2d3748", fontSize: `${fontSize * 0.8}pt` }}>
        <div style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: `${fontSize * 1.8}pt`, fontWeight: 300, color: "#1a202c", margin: 0 }}>{personalInfo.fullName}</h1>
          <div style={{ fontSize: "0.78rem", color: "#718096", marginTop: "0.25rem" }}>
            {personalInfo.email} • {personalInfo.phone} • {personalInfo.location}
          </div>
        </div>

        {order.map((secKey) => (
          <div key={secKey}>
            {renderSection(secKey)}
          </div>
        ))}
      </div>
    );
  };

  // 12. STANDARD TEMPLATE (Harvard/ATS standard)
  const renderStandardTemplate = () => {
    const renderSection = (key: string) => {
      switch (key) {
        case "summary":
          if (!summary) return null;
          return (
            <div style={{ marginBottom: "1rem" }}>
              <h3 style={{ fontSize: `${fontSize * 1.1}pt`, fontWeight: "bold", borderBottom: "1px solid #000", paddingBottom: "2px", marginBottom: "0.4rem" }}>Professional Summary</h3>
              <p style={{ fontSize: `${fontSize * 0.85}pt`, margin: 0, lineHeight: 1.4 }}>{summary}</p>
            </div>
          );
        case "work":
          if (workExperience.length === 0) return null;
          return (
            <div style={{ marginBottom: "1rem" }}>
              <h3 style={{ fontSize: `${fontSize * 1.1}pt`, fontWeight: "bold", borderBottom: "1px solid #000", paddingBottom: "2px", marginBottom: "0.4rem" }}>Work Experience</h3>
              {workExperience.map((exp) => (
                <div key={exp.id} style={{ marginBottom: "0.8rem", fontSize: `${fontSize * 0.85}pt` }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span><strong>{exp.role} – {exp.company}</strong></span>
                    <span style={{ fontStyle: "italic" }}>{exp.startDate} – {exp.endDate} {exp.city ? `| ${exp.city}` : ""}</span>
                  </div>
                  <ul style={{ margin: "4px 0 0", paddingLeft: "20px" }}>
                    {exp.bullets.map((b, bi) => <li key={bi} style={{ marginBottom: "2px", lineHeight: 1.4 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          );
        case "education":
          if (education.length === 0) return null;
          return (
            <div style={{ marginBottom: "1rem" }}>
              <h3 style={{ fontSize: `${fontSize * 1.1}pt`, fontWeight: "bold", borderBottom: "1px solid #000", paddingBottom: "2px", marginBottom: "0.4rem" }}>Education</h3>
              {education.map((edu) => (
                <div key={edu.id} style={{ marginBottom: "0.6rem", fontSize: `${fontSize * 0.85}pt` }}>
                  <div><strong>{edu.institution}{edu.boardOrUniversity ? ` – ${edu.boardOrUniversity}` : ""}</strong></div>
                  <div style={{ fontStyle: "italic" }}>{edu.degree || "Degree"}{edu.field ? ` in ${edu.field}` : ""}</div>
                  {edu.gpa && <div style={{ fontSize: `${fontSize * 0.8}pt`, marginTop: "2px" }}>GPA: {edu.gpa}</div>}
                </div>
              ))}
            </div>
          );
        case "skills":
          if (skills.technical.length === 0 && skills.soft.length === 0) return null;
          return (
            <div style={{ marginBottom: "1rem" }}>
              <h3 style={{ fontSize: `${fontSize * 1.1}pt`, fontWeight: "bold", borderBottom: "1px solid #000", paddingBottom: "2px", marginBottom: "0.4rem" }}>Skills</h3>
              <div style={{ fontSize: `${fontSize * 0.85}pt`, lineHeight: 1.4 }}>
                {[...skills.technical, ...skills.soft].filter(Boolean).join(", ")}
              </div>
            </div>
          );
        case "projects":
          if (projects.length === 0) return null;
          return (
            <div style={{ marginBottom: "1rem" }}>
              <h3 style={{ fontSize: `${fontSize * 1.1}pt`, fontWeight: "bold", borderBottom: "1px solid #000", paddingBottom: "2px", marginBottom: "0.4rem" }}>Projects</h3>
              {projects.map((proj) => (
                <div key={proj.id} style={{ marginBottom: "0.8rem", fontSize: `${fontSize * 0.85}pt` }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: "bold", color: "#1e40af" }}>
                      {proj.link ? <a href={proj.link} style={{ color: "inherit", textDecoration: "none" }}>{proj.name}</a> : proj.name}
                    </span>
                  </div>
                  <ul style={{ margin: "4px 0 0", paddingLeft: "20px" }}>
                    {proj.description.split("\n").filter(Boolean).map((b, bi) => <li key={bi} style={{ marginBottom: "2px", lineHeight: 1.4 }}>{b.replace(/^- /, '')}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          );
        case "certifications":
          if (certifications.length === 0) return null;
          return (
            <div style={{ marginBottom: "1rem" }}>
              <h3 style={{ fontSize: `${fontSize * 1.1}pt`, fontWeight: "bold", borderBottom: "1px solid #000", paddingBottom: "2px", marginBottom: "0.4rem" }}>Certifications</h3>
              <ul style={{ margin: 0, paddingLeft: "20px", fontSize: `${fontSize * 0.85}pt` }}>
                {certifications.map((c) => <li key={c.id}><strong>{c.name}</strong> — {c.issuer || "N/A"} ({c.date})</li>)}
              </ul>
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div style={{ fontFamily: "Arial, Helvetica, sans-serif", color: "#000", fontSize: `${fontSize * 0.85}pt` }}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: `${fontSize * 2.2}pt`, fontWeight: "bold", margin: "0 0 0.4rem 0" }}>{personalInfo.fullName}</h1>
          <div style={{ fontSize: `${fontSize * 0.75}pt`, display: "flex", justifyContent: "center", gap: "1.2rem", flexWrap: "wrap", color: "#444" }}>
            {personalInfo.email && <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>✉ {personalInfo.email}</span>}
            {personalInfo.phone && <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>✆ {personalInfo.phone}</span>}
            {personalInfo.location && <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>📍 {personalInfo.location}</span>}
            {personalInfo.linkedin && <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>in {personalInfo.linkedin.replace('https://www.linkedin.com/in/', '').replace('https://linkedin.com/in/', '').replace(/\/$/, '')}</span>}
          </div>
        </div>

        {order.map((secKey) => (
          <div key={secKey}>
            {renderSection(secKey)}
          </div>
        ))}
      </div>
    );
  };

  // Switch templates routing resolver
  switch (templateId) {
    case "professional":
      return renderProfessionalTemplate();
    case "executive":
      return renderExecutiveTemplate();
    case "minimal":
      return renderMinimalTemplate();
    case "creative":
      return renderCreativeTemplate();
    case "ats-safe":
      return renderAtsSafeTemplate();
    case "fresher":
      return renderFresherTemplate();
    case "startup":
      return renderStartupTemplate();
    case "it-tech":
      return renderItTechTemplate();
    case "bfsi-risk":
      return renderBfsiRiskTemplate();
    case "minimal-2":
      return renderMinimal2Template();
    case "modern":
      return renderModernTemplate();
    case "standard":
    default:
      return renderStandardTemplate();
  }
}
