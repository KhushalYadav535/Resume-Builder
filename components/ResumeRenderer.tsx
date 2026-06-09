import { ResumeData } from "@/types";

interface ResumeRendererProps {
  data: ResumeData;
}

export default function ResumeRenderer({ data }: ResumeRendererProps) {
  if (!data) return null;

  const {
    personalInfo = { fullName: "", email: "", phone: "", linkedin: "", location: "", website: "" },
    summary = "",
    workExperience = [],
    education = [],
    skills = { technical: [], soft: [] },
    projects = [],
    certifications = [],
    languagesKnown = [],
  } = data;

  const hasPersonal = personalInfo && (
    personalInfo.fullName ||
    personalInfo.email ||
    personalInfo.phone ||
    personalInfo.location ||
    personalInfo.linkedin ||
    personalInfo.website
  );

  const cleanBullets = (bullets: any) => {
    if (!bullets) return [];
    if (Array.isArray(bullets)) {
      return bullets.filter((b) => typeof b === "string" && b.trim() !== "");
    }
    return [];
  };

  return (
    <div className="resume-print-area" style={{
      width: "100%",
      backgroundColor: "#ffffff",
      color: "#000000",
      fontFamily: "Arial, Inter, sans-serif",
      fontSize: "14px",
      lineHeight: "1.5",
      textAlign: "left",
    }}>
      {/* Header Section */}
      {hasPersonal && (
        <div style={{ marginBottom: "20px", textAlign: "left" }}>
          {personalInfo.fullName && (
            <h1 style={{
              fontSize: "22px",
              fontWeight: "bold",
              color: "#111111",
              margin: "0 0 4px 0",
              lineHeight: "1.2",
            }}>
              {personalInfo.fullName}
            </h1>
          )}
          {/* Headline / Job Title */}
          {(personalInfo as any).headline && (
            <div style={{
              fontSize: "14px",
              color: "#555555",
              marginBottom: "8px",
              fontWeight: "normal",
            }}>
              {(personalInfo as any).headline}
            </div>
          )}
          {/* Contact Line */}
          <div style={{
            fontSize: "12px",
            color: "#333333",
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            alignItems: "center",
          }}>
            {[
              personalInfo.email,
              personalInfo.phone,
              personalInfo.location,
              personalInfo.linkedin,
              personalInfo.website,
            ].filter(Boolean).map((val, idx, arr) => (
              <span key={val} style={{ display: "inline-flex", alignItems: "center" }}>
                {val}
                {idx < arr.length - 1 && <span style={{ margin: "0 8px", color: "#888" }}>·</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {summary && summary.trim() !== "" && (
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{
            fontSize: "11px",
            fontWeight: "bold",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            borderBottom: "1px solid #cccccc",
            margin: "20px 0 6px 0",
            paddingBottom: "2px",
          }} className="section-heading-print">
            Professional Summary
          </h2>
          <p style={{ fontSize: "12px", margin: "0", lineHeight: "1.6" }}>{summary}</p>
        </div>
      )}

      {/* Experience */}
      {workExperience && workExperience.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{
            fontSize: "11px",
            fontWeight: "bold",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            borderBottom: "1px solid #cccccc",
            margin: "20px 0 6px 0",
            paddingBottom: "2px",
          }} className="section-heading-print">
            Work Experience
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {workExperience.map((exp, idx) => {
              const bullets = cleanBullets(exp.bullets);
              return (
                <div key={exp.id || idx} className="experience-entry" style={{ pageBreakInside: "avoid", breakInside: "avoid" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontWeight: "bold", fontSize: "13px" }}>{exp.role}</span>
                    <span style={{ fontSize: "12px", color: "#333333", whiteSpace: "nowrap" }}>
                      {exp.startDate} – {exp.endDate || (exp.current ? "Present" : "")}
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", fontStyle: "italic", color: "#555555", marginBottom: "4px" }}>
                    {exp.company}{(exp as any).location || exp.city ? ` · ${(exp as any).location || exp.city}` : ""}
                  </div>
                  {bullets.length > 0 && (
                    <ul style={{ margin: "0", paddingLeft: "16px", listStyleType: "disc", fontSize: "12px", lineHeight: "1.6" }}>
                      {bullets.map((bullet, bIdx) => (
                        <li key={bIdx} style={{ marginBottom: "2px" }}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{
            fontSize: "11px",
            fontWeight: "bold",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            borderBottom: "1px solid #cccccc",
            margin: "20px 0 6px 0",
            paddingBottom: "2px",
          }} className="section-heading-print">
            Education
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {education.map((edu, idx) => (
              <div key={edu.id || idx} className="education-entry" style={{ pageBreakInside: "avoid", breakInside: "avoid" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontWeight: "bold", fontSize: "13px" }}>
                    {edu.degree}{edu.field ? ` in ${edu.field}` : ""}
                  </span>
                  <span style={{ fontSize: "12px", color: "#333333", whiteSpace: "nowrap" }}>
                    {edu.startDate} – {edu.endDate}
                  </span>
                </div>
                <div style={{ fontSize: "12px", fontStyle: "italic", color: "#555555" }}>
                  {edu.institution}
                </div>
                {edu.gpa && (
                  <div style={{ fontSize: "12px", color: "#333333", marginTop: "2px" }}>
                    {edu.gpaType === "percentage" ? "Percentage" : "CGPA"}: {edu.gpa}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {((skills?.technical && skills.technical.length > 0) || (skills?.soft && skills.soft.length > 0)) && (
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{
            fontSize: "11px",
            fontWeight: "bold",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            borderBottom: "1px solid #cccccc",
            margin: "20px 0 6px 0",
            paddingBottom: "2px",
          }} className="section-heading-print">
            Skills
          </h2>
          
          {skills.technical && skills.technical.length > 0 && (
            <div style={{ marginBottom: skills.soft && skills.soft.length > 0 ? "8px" : "0" }}>
              {skills.soft && skills.soft.length > 0 && (
                <div style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "4px" }}>Technical Skills</div>
              )}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {skills.technical.map((skill, sIdx) => (
                  <span key={sIdx} style={{
                    fontSize: "12px",
                    backgroundColor: "#f3f4f6",
                    color: "#1f2937",
                    borderRadius: "4px",
                    padding: "4px 8px",
                  }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {skills.soft && skills.soft.length > 0 && (
            <div>
              {skills.technical && skills.technical.length > 0 && (
                <div style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "4px", marginTop: "8px" }}>Soft Skills</div>
              )}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {skills.soft.map((skill, sIdx) => (
                  <span key={sIdx} style={{
                    fontSize: "12px",
                    backgroundColor: "#f3f4f6",
                    color: "#1f2937",
                    borderRadius: "4px",
                    padding: "4px 8px",
                  }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{
            fontSize: "11px",
            fontWeight: "bold",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            borderBottom: "1px solid #cccccc",
            margin: "20px 0 6px 0",
            paddingBottom: "2px",
          }} className="section-heading-print">
            Projects
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {projects.map((proj, idx) => (
              <div key={proj.id || idx} className="project-entry" style={{ pageBreakInside: "avoid", breakInside: "avoid" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontWeight: "bold", fontSize: "13px" }}>{proj.name}</span>
                  {proj.techStack && proj.techStack.length > 0 && (
                    <span style={{ fontSize: "12px", color: "#555555", fontStyle: "italic" }}>
                      Technologies: {proj.techStack.join(", ")}
                    </span>
                  )}
                </div>
                {proj.description && (
                  <p style={{ fontSize: "12px", margin: "4px 0 0 0", lineHeight: "1.6" }}>{proj.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{
            fontSize: "11px",
            fontWeight: "bold",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            borderBottom: "1px solid #cccccc",
            margin: "20px 0 6px 0",
            paddingBottom: "2px",
          }} className="section-heading-print">
            Certifications
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {certifications.map((cert, idx) => (
              <div key={cert.id || idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: "12px" }}>
                <span>
                  <strong style={{ fontWeight: "bold" }}>{cert.name}</strong> – {cert.issuer}
                </span>
                <span style={{ color: "#333333", whiteSpace: "nowrap" }}>{cert.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {languagesKnown && languagesKnown.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{
            fontSize: "11px",
            fontWeight: "bold",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            borderBottom: "1px solid #cccccc",
            margin: "20px 0 6px 0",
            paddingBottom: "2px",
          }} className="section-heading-print">
            Languages Known
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "12px" }}>
            {languagesKnown.map((lang, idx) => (
              <span key={lang.id || idx}>
                {lang.language} ({lang.proficiency})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
