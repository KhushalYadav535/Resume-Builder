"use client";

import React from "react";
import {
  ResumeData,
  WorkExperience,
  Education,
  Project,
  Certification,
  LanguagesKnown,
} from "@/types";

// ─── Accent Color Map Per Template ───────────────────────────────────────────
const TEMPLATE_ACCENT: Record<string, string> = {
  "jakes-resume":     "#111111",
  "altacv-modern":    "#8B1A1A",
  "curve-timeline":   "#1a4a7a",
  "hipster-sidebar":  "#e94560",
  "deedy-cs":         "#005cc5",
  "awesome-corporate":"#dc3522",
  "plasmati-academic":"#2e475d",
};

// ─── Safe font map (ATS + browser safe) ──────────────────────────────────────
const FONT_MAP: Record<string, string> = {
  "Plus Jakarta Sans":  "'Plus Jakarta Sans', sans-serif",
  "Inter":              "'Inter', sans-serif",
  "DM Sans":            "'DM Sans', sans-serif",
  "Space Grotesk":      "'Space Grotesk', sans-serif",
  "Outfit":             "'Outfit', sans-serif",
  "Georgia":            "Georgia, serif",
  "Garamond":           "Garamond, serif",
  "Playfair Display":   "'Playfair Display', serif",
  "Arial":              "Arial, sans-serif",
  "Calibri":            "Calibri, sans-serif",
  "Helvetica":          "Helvetica, sans-serif",
  "Times New Roman":    "'Times New Roman', serif",
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface ResumeDocumentProps {
  data: ResumeData;
  templateId: string;
  highlightKeywords?: string[];
  highlightChanges?: string[];   // NEW: green diff highlight for applied suggestions
}

// ─── Keyword Highlight Helper ─────────────────────────────────────────────────
function HL({ text, kw }: { text: string; kw: string[] }) {
  if (!text) return <>{text}</>;
  if (!kw || kw.length === 0) return <>{text}</>;

  const sorted = [...kw].sort((a, b) => b.length - a.length);
  const escaped = sorted.map((k) => {
    let esc = k.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");
    if (/^[a-zA-Z0-9_]/.test(k)) esc = `\\b${esc}`;
    if (/[a-zA-Z0-9_]$/.test(k)) esc = `${esc}\\b`;
    return esc;
  });
  const regex = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) => {
        const hit = sorted.some((k) => k.toLowerCase() === part.toLowerCase());
        return hit ? (
          <span key={i} className="kw-highlight">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </>
  );
}

// ─── Diff / Change Highlight Helper (green) ──────────────────────────────────
function DiffHL({ text, changes }: { text: string; changes: string[] }) {
  if (!text || !changes || changes.length === 0) return <>{text}</>;

  const sorted = [...changes]
    .filter(c => c && c.length > 0)
    .sort((a, b) => b.length - a.length);
  if (sorted.length === 0) return <>{text}</>;

  const escaped = sorted.map(k => {
    let esc = k.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");
    if (/^[a-zA-Z0-9_]/.test(k)) esc = `\\b${esc}`;
    if (/[a-zA-Z0-9_]$/.test(k)) esc = `${esc}\\b`;
    return esc;
  });
  const regex = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) => {
        const hit = sorted.some(k => k.toLowerCase() === part.toLowerCase());
        return hit ? (
          <span key={i} style={{
            background: "rgba(16, 185, 129, 0.18)",
            color: "inherit",
            borderRadius: "2px",
            padding: "0 2px",
            outline: "1px solid rgba(16, 185, 129, 0.35)",
            fontWeight: 600,
          }}>
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ResumeDocument({
  data,
  templateId,
  highlightKeywords = [],
  highlightChanges = [],
}: ResumeDocumentProps) {
  const {
    personalInfo = {
      fullName: "",
      email: "",
      phone: "",
      linkedin: "",
      location: "",
      website: "",
    },
    summary = "",
    workExperience = [],
    education = [],
    skills = { technical: [], soft: [] },
    projects = [],
    certifications = [],
    languagesKnown = [],
    fontFamily = "Arial",
    fontSize = 11,
    spacing = 1.3,
    sectionOrder = [
      "summary",
      "work",
      "education",
      "skills",
      "projects",
      "certifications",
      "languages",
    ],
  } = data;

  const kw = highlightKeywords;
  const ch = highlightChanges; // green diff changes
  // Convenience: renders text with green diff highlight if changes exist, else plain
  const Chg = ({ text }: { text: string }) =>
    ch.length > 0 ? <DiffHL text={text} changes={ch} /> : <>{text}</>;
  const font = FONT_MAP[fontFamily] || "Arial, sans-serif";
  const fs = fontSize;           // base font size in pt
  const lh = spacing;            // line-height
  const accent = TEMPLATE_ACCENT[templateId] || "#111";

  const contactParts = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.location,
    personalInfo.linkedin,
    personalInfo.website,
  ].filter(Boolean);

  const dateStr = (w: WorkExperience) =>
    `${w.startDate} – ${w.current ? "Present" : w.endDate}`;

  const gpaLabel = (edu: Education) => {
    if (!edu.gpa) return "";
    return edu.gpaType === "percentage"
      ? `${edu.gpa}%`
      : `CGPA: ${edu.gpa}`;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // TEMPLATE 1 — Jake's Resume (harshibar / LaTeX Gold Standard)
  // Target: Software Engineers, CS, Tech, Startups
  // ═══════════════════════════════════════════════════════════════════════════
  const renderJakesResume = () => {
    const SectionHdr = ({ title }: { title: string }) => (
      <div
        style={{
          marginTop: "14px",
          marginBottom: "3px",
          borderBottom: "1.5px solid #555",
          paddingBottom: "2px",
        }}
      >
        <span
          style={{
            fontFamily: font,
            fontSize: `${fs - 0.5}pt`,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "1px",
            color: "#111",
          }}
        >
          {title}
        </span>
      </div>
    );

    const Entry = ({
      left,
      right,
      sub,
      bullets,
    }: {
      left: React.ReactNode;
      right: string;
      sub?: React.ReactNode;
      bullets?: string[];
    }) => (
      <div style={{ marginBottom: "6px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <span style={{ fontWeight: 700, fontSize: `${fs}pt` }}>{left}</span>
          <span
            style={{
              fontSize: `${fs - 0.5}pt`,
              color: "#444",
              whiteSpace: "nowrap",
              marginLeft: "8px",
            }}
          >
            {right}
          </span>
        </div>
        {sub && (
          <div
            style={{
              fontSize: `${fs - 0.5}pt`,
              fontStyle: "italic",
              color: "#444",
            }}
          >
            {sub}
          </div>
        )}
        {bullets && bullets.length > 0 && (
          <ul
            style={{
              margin: "3px 0 0 0",
              paddingLeft: "18px",
              listStyleType: "disc",
            }}
          >
            {bullets.map((b, i) => (
              <li
                key={i}
                style={{
                  fontSize: `${fs - 0.5}pt`,
                  lineHeight: lh,
                  marginBottom: "2px",
                  textAlign: "justify",
                }}
              >
                {ch.length > 0 ? <DiffHL text={b} changes={ch} /> : <HL text={b} kw={kw} />}
              </li>
            ))}
          </ul>
        )}
      </div>
    );

    return (
      <div
        style={{
          fontFamily: "'Times New Roman', serif",
          fontSize: `${fs}pt`,
          lineHeight: lh,
          color: "#111",
          background: "#fff",
          padding: "0.3in 0.5in",
          maxWidth: "8.5in",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        {/* ── Header ── */}
        <div style={{ textAlign: "center", marginBottom: "8px" }}>
          <div
            style={{
              fontSize: `${fs + 9}pt`,
              fontWeight: 700,
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginBottom: "4px",
            }}
          >
            {personalInfo.fullName}
          </div>
          <div
            style={{
              fontSize: `${fs - 1}pt`,
              color: "#444",
            }}
          >
            {contactParts.join(" | ")}
          </div>
        </div>

        {/* ── Sections (ordered) ── */}
        {sectionOrder.map((key) => {
          switch (key) {
            case "summary":
              return summary ? (
                <div key={key}>
                  <SectionHdr title="Summary" />
                  <p
                    style={{
                      fontSize: `${fs - 0.5}pt`,
                      margin: "4px 0",
                      textAlign: "justify",
                    }}
                  >
                    {ch.length > 0 ? <DiffHL text={summary} changes={ch} /> : <HL text={summary} kw={kw} />}
                  </p>
                </div>
              ) : null;

            case "work":
              return workExperience.length > 0 ? (
                <div key={key}>
                  <SectionHdr title="Experience" />
                  {workExperience.map((w, i) => (
                    <Entry
                      key={i}
                      left={w.role}
                      right={dateStr(w)}
                      sub={w.company + (w.city ? `, ${w.city}` : "")}
                      bullets={w.bullets}
                    />
                  ))}
                </div>
              ) : null;

            case "education":
              return education.length > 0 ? (
                <div key={key}>
                  <SectionHdr title="Education" />
                  {education.map((e, i) => (
                    <Entry
                      key={i}
                      left={`${e.degree}${e.field ? ", " + e.field : ""}`}
                      right={e.endDate}
                      sub={
                        <>
                          {e.institution}
                          {gpaLabel(e) && (
                            <span style={{ marginLeft: "6px" }}>
                              — {gpaLabel(e)}
                            </span>
                          )}
                        </>
                      }
                    />
                  ))}
                </div>
              ) : null;

            case "skills":
              return skills.technical.length > 0 || skills.soft.length > 0 ? (
                <div key={key}>
                  <SectionHdr title="Technical Skills" />
                  <div
                    style={{
                      fontSize: `${fs - 0.5}pt`,
                      lineHeight: "1.6",
                    }}
                  >
                    {skills.technical.length > 0 && (
                      <div>
                        <strong>Languages &amp; Tools: </strong>
                        {ch.length > 0
                          ? skills.technical.map((s, si) => (
                              <span key={si}>
                                {si > 0 && <span>, </span>}
                                <DiffHL text={s} changes={ch} />
                              </span>
                            ))
                          : <HL text={skills.technical.join(", ")} kw={kw} />
                        }
                      </div>
                    )}
                    {skills.soft.length > 0 && (
                      <div>
                        <strong>Soft Skills: </strong>
                        {ch.length > 0
                          ? skills.soft.map((s, si) => (
                              <span key={si}>
                                {si > 0 && <span>, </span>}
                                <DiffHL text={s} changes={ch} />
                              </span>
                            ))
                          : <HL text={skills.soft.join(", ")} kw={kw} />
                        }
                      </div>
                    )}
                  </div>
                </div>
              ) : null;

            case "projects":
              return projects.length > 0 ? (
                <div key={key}>
                  <SectionHdr title="Projects" />
                  {projects.map((p, i) => (
                    <Entry
                      key={i}
                      left={
                        <>
                          {p.name}
                          {p.techStack.length > 0 && (
                            <span
                              style={{
                                fontWeight: 400,
                                fontStyle: "italic",
                                marginLeft: "6px",
                                fontSize: `${fs - 1}pt`,
                              }}
                            >
                              {p.techStack.join(", ")}
                            </span>
                          )}
                        </>
                      }
                      right={p.link || ""}
                      bullets={
                        p.description
                          ? p.description
                              .split("\n")
                              .map((l) => l.replace(/^[-•]\s*/, ""))
                              .filter(Boolean)
                          : []
                      }
                    />
                  ))}
                </div>
              ) : null;

            case "certifications":
              return certifications.length > 0 ? (
                <div key={key}>
                  <SectionHdr title="Certifications" />
                  {certifications.map((c, i) => (
                    <Entry
                      key={i}
                      left={c.name}
                      right={c.date}
                      sub={c.issuer}
                    />
                  ))}
                </div>
              ) : null;

            case "languages":
              return (languagesKnown || []).filter((l) => l.language).length >
                0 ? (
                <div key={key}>
                  <SectionHdr title="Languages" />
                  <div style={{ fontSize: `${fs - 0.5}pt` }}>
                    {(languagesKnown || [])
                      .filter((l) => l.language)
                      .map((l) => `${l.language} (${l.proficiency})`)
                      .join("  •  ")}
                  </div>
                </div>
              ) : null;

            default:
              return null;
          }
        })}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // TEMPLATE 2 — AltaCV Modern (2-column asymmetric)
  // Target: Designers, Product Managers, Creative + Senior roles
  // ═══════════════════════════════════════════════════════════════════════════
  const renderAltaCVModern = () => {
    const accentCol = "#8B1A1A";
    const ruleCol = "#C9A84C";

    const SectionHdr = ({ title }: { title: string }) => (
      <div
        style={{
          marginTop: "16px",
          marginBottom: "6px",
          borderBottom: `2px solid ${ruleCol}`,
          paddingBottom: "3px",
        }}
      >
        <span
          style={{
            fontFamily: font,
            fontSize: `${fs}pt`,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            color: accentCol,
          }}
        >
          {title}
        </span>
      </div>
    );

    const SideHdr = ({ title }: { title: string }) => (
      <div
        style={{
          marginTop: "16px",
          marginBottom: "6px",
          borderBottom: `1.5px solid rgba(255,255,255,0.4)`,
          paddingBottom: "3px",
        }}
      >
        <span
          style={{
            fontFamily: font,
            fontSize: `${fs - 0.5}pt`,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            color: "#fff",
          }}
        >
          {title}
        </span>
      </div>
    );

    return (
      <div
        style={{
          fontFamily: font,
          fontSize: `${fs}pt`,
          lineHeight: lh,
          color: "#222",
          background: "#fff",
          maxWidth: "8.5in",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        {/* ── Full-width Header ── */}
        <div
          style={{
            background: accentCol,
            color: "#fff",
            padding: "20px 30px",
          }}
        >
          <div
            style={{
              fontSize: `${fs + 10}pt`,
              fontWeight: 700,
              letterSpacing: "2px",
              textTransform: "uppercase",
            }}
          >
            {personalInfo.fullName}
          </div>
          {workExperience[0] && (
            <div
              style={{
                fontSize: `${fs + 1}pt`,
                color: "rgba(255,255,255,0.8)",
                marginTop: "4px",
                letterSpacing: "0.5px",
              }}
            >
              {workExperience[0].role}
            </div>
          )}
          <div
            style={{
              fontSize: `${fs - 1}pt`,
              color: "rgba(255,255,255,0.7)",
              marginTop: "6px",
            }}
          >
            {contactParts.join("  •  ")}
          </div>
        </div>

        {/* ── Two-column body ── */}
        <div style={{ display: "flex" }}>
          {/* Left / Main column — 62% */}
          <div style={{ flex: "0 0 62%", padding: "16px 20px 20px 24px" }}>
            {summary && (
              <div>
                <SectionHdr title="Profile" />
                <p
                  style={{
                    fontSize: `${fs - 0.5}pt`,
                    margin: 0,
                    textAlign: "justify",
                    lineHeight: lh,
                  }}
                >
                  <HL text={summary} kw={kw} />
                </p>
              </div>
            )}

            {workExperience.length > 0 && (
              <div>
                <SectionHdr title="Experience" />
                {workExperience.map((w, i) => (
                  <div key={i} style={{ marginBottom: "10px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                      }}
                    >
                      <span style={{ fontWeight: 700, fontSize: `${fs}pt` }}>
                        {w.role}
                      </span>
                      <span
                        style={{
                          fontSize: `${fs - 1}pt`,
                          color: "#666",
                          whiteSpace: "nowrap",
                          marginLeft: "8px",
                        }}
                      >
                        {dateStr(w)}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: `${fs - 0.5}pt`,
                        color: accentCol,
                        fontStyle: "italic",
                        marginBottom: "3px",
                      }}
                    >
                      {w.company}
                      {w.city ? `, ${w.city}` : ""}
                    </div>
                    {w.bullets && w.bullets.length > 0 && (
                      <ul
                        style={{
                          margin: "2px 0 0 0",
                          paddingLeft: "16px",
                          listStyleType: "disc",
                        }}
                      >
                        {w.bullets.map((b, bi) => (
                          <li
                            key={bi}
                            style={{
                              fontSize: `${fs - 0.5}pt`,
                              lineHeight: lh,
                              marginBottom: "2px",
                              textAlign: "justify",
                            }}
                          >
                            <HL text={b} kw={kw} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {projects.length > 0 && (
              <div>
                <SectionHdr title="Projects" />
                {projects.map((p, i) => (
                  <div key={i} style={{ marginBottom: "8px" }}>
                    <div style={{ fontWeight: 700, fontSize: `${fs}pt` }}>
                      {p.name}
                    </div>
                    {p.techStack.length > 0 && (
                      <div
                        style={{
                          fontSize: `${fs - 1}pt`,
                          color: accentCol,
                          fontStyle: "italic",
                          marginBottom: "2px",
                        }}
                      >
                        {p.techStack.join(", ")}
                      </div>
                    )}
                    {p.description && (
                      <div
                        style={{
                          fontSize: `${fs - 0.5}pt`,
                          textAlign: "justify",
                          lineHeight: lh,
                        }}
                      >
                        <HL text={p.description} kw={kw} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right / Sidebar — 38% */}
          <div
            style={{
              flex: "0 0 38%",
              background: "#2d3748",
              color: "#fff",
              padding: "16px 18px",
            }}
          >
            {education.length > 0 && (
              <div>
                <SideHdr title="Education" />
                {education.map((e, i) => (
                  <div key={i} style={{ marginBottom: "8px" }}>
                    <div
                      style={{ fontWeight: 700, fontSize: `${fs - 0.5}pt` }}
                    >
                      {e.degree}
                      {e.field ? ` in ${e.field}` : ""}
                    </div>
                    <div
                      style={{
                        fontSize: `${fs - 1}pt`,
                        color: "rgba(255,255,255,0.75)",
                      }}
                    >
                      {e.institution}
                    </div>
                    <div
                      style={{
                        fontSize: `${fs - 1}pt`,
                        color: "rgba(255,255,255,0.6)",
                      }}
                    >
                      {e.endDate}
                      {gpaLabel(e) ? ` • ${gpaLabel(e)}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {skills.technical.length > 0 && (
              <div>
                <SideHdr title="Technical Skills" />
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px",
                    marginTop: "4px",
                  }}
                >
                  {skills.technical.map((s, i) => (
                    <span
                      key={i}
                      style={{
                        border: "1px solid rgba(255,255,255,0.5)",
                        borderRadius: "3px",
                        padding: "1px 7px",
                        fontSize: `${fs - 1.5}pt`,
                        color: "#fff",
                        lineHeight: "1.6",
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {skills.soft.length > 0 && (
              <div>
                <SideHdr title="Soft Skills" />
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px",
                    marginTop: "4px",
                  }}
                >
                  {skills.soft.map((s, i) => (
                    <span
                      key={i}
                      style={{
                        border: "1px solid rgba(255,255,255,0.3)",
                        borderRadius: "3px",
                        padding: "1px 7px",
                        fontSize: `${fs - 1.5}pt`,
                        color: "rgba(255,255,255,0.85)",
                        lineHeight: "1.6",
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {certifications.length > 0 && (
              <div>
                <SideHdr title="Certifications" />
                {certifications.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      marginBottom: "5px",
                      fontSize: `${fs - 1}pt`,
                    }}
                  >
                    <div style={{ fontWeight: 700, color: "#fff" }}>
                      {c.name}
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.65)" }}>
                      {c.issuer}
                      {c.date ? ` • ${c.date}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(languagesKnown || []).filter((l) => l.language).length > 0 && (
              <div>
                <SideHdr title="Languages" />
                {(languagesKnown || [])
                  .filter((l) => l.language)
                  .map((l, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: `${fs - 1}pt`,
                        marginBottom: "3px",
                      }}
                    >
                      <span>{l.language}</span>
                      <span style={{ color: "rgba(255,255,255,0.65)" }}>
                        {l.proficiency}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // TEMPLATE 3 — CurVe Timeline (Academic / Finance / Law)
  // Marginal-date grid layout inspired by CurVe LaTeX CV
  // ═══════════════════════════════════════════════════════════════════════════
  const renderCurVeTimeline = () => {
    const accentBlue = "#1a4a7a";
    const ruleBlue = "#4A90D9";

    const SectionHdr = ({ title }: { title: string }) => (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "90px 1fr",
          gap: "0 16px",
          marginTop: "16px",
          marginBottom: "6px",
        }}
      >
        <div />
        <div
          style={{
            borderBottom: `2px solid ${ruleBlue}`,
            paddingBottom: "3px",
          }}
        >
          <span
            style={{
              fontFamily: `Georgia, serif`,
              fontSize: `${fs + 1}pt`,
              fontWeight: 700,
              color: accentBlue,
              letterSpacing: "0.5px",
            }}
          >
            {title}
          </span>
        </div>
      </div>
    );

    const TimelineEntry = ({
      date,
      children,
    }: {
      date: string;
      children: React.ReactNode;
    }) => (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "90px 1fr",
          gap: "0 16px",
          marginBottom: "8px",
          alignItems: "start",
        }}
      >
        <div
          style={{
            fontSize: `${fs - 1.5}pt`,
            color: "#999",
            paddingTop: "2px",
            textAlign: "right",
            lineHeight: lh,
          }}
        >
          {date}
        </div>
        <div style={{ lineHeight: lh }}>{children}</div>
      </div>
    );

    return (
      <div
        style={{
          fontFamily: `Georgia, serif`,
          fontSize: `${fs}pt`,
          lineHeight: lh,
          color: "#222",
          background: "#fff",
          padding: "0.5in 0.65in",
          maxWidth: "8.5in",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "90px 1fr",
            gap: "0 16px",
            marginBottom: "16px",
            borderBottom: `3px solid ${accentBlue}`,
            paddingBottom: "12px",
          }}
        >
          <div />
          <div>
            <div
              style={{
                fontSize: `${fs + 11}pt`,
                fontWeight: 700,
                fontFamily: `Georgia, serif`,
                letterSpacing: "1px",
                color: "#111",
                marginBottom: "4px",
              }}
            >
              {personalInfo.fullName}
            </div>
            <div
              style={{
                fontSize: `${fs - 1}pt`,
                color: "#555",
                lineHeight: "1.5",
              }}
            >
              {contactParts.join("  •  ")}
            </div>
          </div>
        </div>

        {/* ── Sections ── */}
        {summary && (
          <>
            <SectionHdr title="Professional Summary" />
            <TimelineEntry date="">
              <p
                style={{
                  margin: 0,
                  textAlign: "justify",
                  fontSize: `${fs - 0.5}pt`,
                  lineHeight: lh,
                }}
              >
                <HL text={summary} kw={kw} />
              </p>
            </TimelineEntry>
          </>
        )}

        {workExperience.length > 0 && (
          <>
            <SectionHdr title="Experience" />
            {workExperience.map((w, i) => (
              <TimelineEntry key={i} date={dateStr(w)}>
                <div style={{ fontWeight: 700, fontSize: `${fs}pt` }}>
                  {w.role}
                </div>
                <div
                  style={{
                    fontSize: `${fs - 0.5}pt`,
                    fontStyle: "italic",
                    color: accentBlue,
                    marginBottom: "3px",
                  }}
                >
                  {w.company}
                  {w.city ? `, ${w.city}` : ""}
                </div>
                {w.bullets && w.bullets.length > 0 && (
                  <ul
                    style={{
                      margin: "2px 0 0 0",
                      paddingLeft: "16px",
                      listStyleType: "disc",
                    }}
                  >
                    {w.bullets.map((b, bi) => (
                      <li
                        key={bi}
                        style={{
                          fontSize: `${fs - 0.5}pt`,
                          marginBottom: "2px",
                          textAlign: "justify",
                        }}
                      >
                        <HL text={b} kw={kw} />
                      </li>
                    ))}
                  </ul>
                )}
              </TimelineEntry>
            ))}
          </>
        )}

        {education.length > 0 && (
          <>
            <SectionHdr title="Education" />
            {education.map((e, i) => (
              <TimelineEntry key={i} date={e.endDate}>
                <div style={{ fontWeight: 700, fontSize: `${fs}pt` }}>
                  {e.degree}
                  {e.field ? ` in ${e.field}` : ""}
                </div>
                <div
                  style={{
                    fontSize: `${fs - 0.5}pt`,
                    color: "#444",
                    fontStyle: "italic",
                  }}
                >
                  {e.institution}
                  {gpaLabel(e) ? ` — ${gpaLabel(e)}` : ""}
                </div>
              </TimelineEntry>
            ))}
          </>
        )}

        {(skills.technical.length > 0 || skills.soft.length > 0) && (
          <>
            <SectionHdr title="Skills" />
            <TimelineEntry date="">
              <div style={{ fontSize: `${fs - 0.5}pt`, lineHeight: "1.7" }}>
                {skills.technical.length > 0 && (
                  <div>
                    <strong>Technical:</strong>{" "}
                    <HL text={skills.technical.join(", ")} kw={kw} />
                  </div>
                )}
                {skills.soft.length > 0 && (
                  <div>
                    <strong>Soft Skills:</strong>{" "}
                    <HL text={skills.soft.join(", ")} kw={kw} />
                  </div>
                )}
              </div>
            </TimelineEntry>
          </>
        )}

        {projects.length > 0 && (
          <>
            <SectionHdr title="Projects" />
            {projects.map((p, i) => (
              <TimelineEntry key={i} date="">
                <div style={{ fontWeight: 700, fontSize: `${fs}pt` }}>
                  {p.name}
                </div>
                {p.techStack.length > 0 && (
                  <div
                    style={{
                      fontSize: `${fs - 1}pt`,
                      color: accentBlue,
                      fontStyle: "italic",
                      marginBottom: "2px",
                    }}
                  >
                    {p.techStack.join(", ")}
                  </div>
                )}
                {p.description && (
                  <div style={{ fontSize: `${fs - 0.5}pt`, textAlign: "justify" }}>
                    <HL text={p.description} kw={kw} />
                  </div>
                )}
              </TimelineEntry>
            ))}
          </>
        )}

        {certifications.length > 0 && (
          <>
            <SectionHdr title="Certifications" />
            {certifications.map((c, i) => (
              <TimelineEntry key={i} date={c.date}>
                <div style={{ fontWeight: 700, fontSize: `${fs}pt` }}>
                  {c.name}
                </div>
                <div
                  style={{
                    fontSize: `${fs - 0.5}pt`,
                    color: "#555",
                    fontStyle: "italic",
                  }}
                >
                  {c.issuer}
                </div>
              </TimelineEntry>
            ))}
          </>
        )}

        {(languagesKnown || []).filter((l) => l.language).length > 0 && (
          <>
            <SectionHdr title="Languages" />
            <TimelineEntry date="">
              <div style={{ fontSize: `${fs - 0.5}pt` }}>
                {(languagesKnown || [])
                  .filter((l) => l.language)
                  .map((l) => `${l.language} (${l.proficiency})`)
                  .join("  •  ")}
              </div>
            </TimelineEntry>
          </>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // TEMPLATE 4 — Hipster Sidebar (Simple Hipster CV inspiration)
  // Target: Marketing, Branding, Design, UX, Social Media
  // ═══════════════════════════════════════════════════════════════════════════
  const renderHipsterSidebar = () => {
    const dark = "#1a1a2e";
    const sidebarBg = "#16213e";
    const accentRed = "#e94560";

    const proficiencyPct: Record<string, number> = {
      Native: 100,
      Fluent: 85,
      Intermediate: 60,
      Beginner: 35,
      "": 40,
    };

    const MainHdr = ({ title }: { title: string }) => (
      <div
        style={{
          borderLeft: `3px solid ${accentRed}`,
          paddingLeft: "8px",
          marginBottom: "8px",
          marginTop: "16px",
        }}
      >
        <span
          style={{
            fontFamily: font,
            fontSize: `${fs}pt`,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "1px",
            color: dark,
          }}
        >
          {title}
        </span>
      </div>
    );

    const SideHdr = ({ title }: { title: string }) => (
      <div
        style={{
          background: accentRed,
          padding: "3px 8px",
          marginBottom: "8px",
          marginTop: "16px",
        }}
      >
        <span
          style={{
            fontSize: `${fs - 1}pt`,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "1px",
            color: "#fff",
          }}
        >
          {title}
        </span>
      </div>
    );

    return (
      <div
        style={{
          fontFamily: font,
          fontSize: `${fs}pt`,
          lineHeight: lh,
          color: "#222",
          background: "#fff",
          maxWidth: "8.5in",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        {/* ── Full-width banner header ── */}
        <div
          style={{
            background: dark,
            color: "#fff",
            padding: "24px 30px",
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: accentRed,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: `${fs + 8}pt`,
              fontWeight: 700,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {personalInfo.fullName
              .split(" ")
              .slice(0, 2)
              .map((n) => n[0])
              .join("")}
          </div>
          <div>
            <div
              style={{
                fontSize: `${fs + 10}pt`,
                fontWeight: 700,
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              {personalInfo.fullName}
            </div>
            {workExperience[0] && (
              <div
                style={{
                  fontSize: `${fs + 1}pt`,
                  color: accentRed,
                  marginTop: "2px",
                  letterSpacing: "0.5px",
                }}
              >
                {workExperience[0].role}
              </div>
            )}
          </div>
        </div>

        {/* ── Two-column body ── */}
        <div style={{ display: "flex" }}>
          {/* Left / Sidebar ── 30% */}
          <div
            style={{
              flex: "0 0 30%",
              background: sidebarBg,
              color: "#fff",
              padding: "16px 14px",
            }}
          >
            {/* Contact */}
            <SideHdr title="Contact" />
            <div style={{ fontSize: `${fs - 1}pt`, lineHeight: "1.8" }}>
              {personalInfo.email && <div>✉ {personalInfo.email}</div>}
              {personalInfo.phone && <div>✆ {personalInfo.phone}</div>}
              {personalInfo.location && <div>⚲ {personalInfo.location}</div>}
              {personalInfo.linkedin && (
                <div>in {personalInfo.linkedin}</div>
              )}
              {personalInfo.website && <div>⊕ {personalInfo.website}</div>}
            </div>

            {/* Skills with progress bars */}
            {skills.technical.length > 0 && (
              <>
                <SideHdr title="Skills" />
                {skills.technical.map((s, i) => (
                  <div key={i} style={{ marginBottom: "6px" }}>
                    <div
                      style={{
                        fontSize: `${fs - 1}pt`,
                        color: "#ddd",
                        marginBottom: "2px",
                      }}
                    >
                      {s}
                    </div>
                    <div
                      style={{
                        background: "#334",
                        borderRadius: "3px",
                        height: "5px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          background: accentRed,
                          width: `${Math.min(90, 50 + ((i * 17) % 45))}%`,
                          height: "100%",
                          borderRadius: "3px",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Languages */}
            {(languagesKnown || []).filter((l) => l.language).length > 0 && (
              <>
                <SideHdr title="Languages" />
                {(languagesKnown || [])
                  .filter((l) => l.language)
                  .map((l, i) => (
                    <div key={i} style={{ marginBottom: "8px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: `${fs - 1}pt`,
                          color: "#ddd",
                          marginBottom: "2px",
                        }}
                      >
                        <span>{l.language}</span>
                        <span style={{ color: "#999" }}>{l.proficiency}</span>
                      </div>
                      <div
                        style={{
                          background: "#334",
                          borderRadius: "3px",
                          height: "4px",
                        }}
                      >
                        <div
                          style={{
                            background: accentRed,
                            width: `${proficiencyPct[l.proficiency] || 60}%`,
                            height: "100%",
                            borderRadius: "3px",
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </>
            )}

            {/* Education in sidebar */}
            {education.length > 0 && (
              <>
                <SideHdr title="Education" />
                {education.map((e, i) => (
                  <div key={i} style={{ marginBottom: "8px" }}>
                    <div
                      style={{ fontWeight: 700, fontSize: `${fs - 1}pt`, color: "#eee" }}
                    >
                      {e.degree}
                    </div>
                    <div
                      style={{
                        fontSize: `${fs - 1.5}pt`,
                        color: "rgba(255,255,255,0.65)",
                      }}
                    >
                      {e.institution}
                    </div>
                    <div
                      style={{
                        fontSize: `${fs - 1.5}pt`,
                        color: accentRed,
                      }}
                    >
                      {e.endDate}
                      {gpaLabel(e) ? ` • ${gpaLabel(e)}` : ""}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Right / Main content ── 70% */}
          <div style={{ flex: "0 0 70%", padding: "16px 22px 20px 20px" }}>
            {summary && (
              <>
                <MainHdr title="Profile" />
                <p
                  style={{
                    fontSize: `${fs - 0.5}pt`,
                    margin: "0 0 8px 0",
                    textAlign: "justify",
                    lineHeight: lh,
                  }}
                >
                  <HL text={summary} kw={kw} />
                </p>
              </>
            )}

            {workExperience.length > 0 && (
              <>
                <MainHdr title="Experience" />
                {workExperience.map((w, i) => (
                  <div key={i} style={{ marginBottom: "10px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                      }}
                    >
                      <span style={{ fontWeight: 700, fontSize: `${fs}pt` }}>
                        {w.role}
                      </span>
                      <span
                        style={{
                          fontSize: `${fs - 1}pt`,
                          color: "#666",
                          whiteSpace: "nowrap",
                          marginLeft: "8px",
                        }}
                      >
                        {dateStr(w)}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: `${fs - 0.5}pt`,
                        color: accentRed,
                        fontWeight: 600,
                        marginBottom: "3px",
                      }}
                    >
                      {w.company}
                      {w.city ? ` • ${w.city}` : ""}
                    </div>
                    {w.bullets && w.bullets.length > 0 && (
                      <ul
                        style={{
                          margin: "2px 0 0 0",
                          paddingLeft: "16px",
                          listStyleType: "disc",
                        }}
                      >
                        {w.bullets.map((b, bi) => (
                          <li
                            key={bi}
                            style={{
                              fontSize: `${fs - 0.5}pt`,
                              marginBottom: "2px",
                              textAlign: "justify",
                            }}
                          >
                            <HL text={b} kw={kw} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </>
            )}

            {projects.length > 0 && (
              <>
                <MainHdr title="Projects" />
                {projects.map((p, i) => (
                  <div key={i} style={{ marginBottom: "8px" }}>
                    <div style={{ fontWeight: 700, fontSize: `${fs}pt` }}>
                      {p.name}
                    </div>
                    {p.techStack.length > 0 && (
                      <div
                        style={{
                          fontSize: `${fs - 1}pt`,
                          color: accentRed,
                          fontStyle: "italic",
                          marginBottom: "2px",
                        }}
                      >
                        {p.techStack.join(", ")}
                      </div>
                    )}
                    {p.description && (
                      <div
                        style={{
                          fontSize: `${fs - 0.5}pt`,
                          textAlign: "justify",
                          lineHeight: lh,
                        }}
                      >
                        <HL text={p.description} kw={kw} />
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}

            {certifications.length > 0 && (
              <>
                <MainHdr title="Certifications" />
                {certifications.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "5px",
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 700, fontSize: `${fs - 0.5}pt` }}>
                        {c.name}
                      </span>
                      {c.issuer && (
                        <span
                          style={{
                            fontSize: `${fs - 1}pt`,
                            color: "#555",
                            marginLeft: "6px",
                          }}
                        >
                          • {c.issuer}
                        </span>
                      )}
                    </div>
                    {c.date && (
                      <span
                        style={{
                          fontSize: `${fs - 1}pt`,
                          color: "#888",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {c.date}
                      </span>
                    )}
                  </div>
                ))}
              </>
            )}

            {/* Soft skills in main if not in sidebar */}
            {skills.soft.length > 0 && (
              <>
                <MainHdr title="Soft Skills" />
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px",
                    marginTop: "4px",
                  }}
                >
                  {skills.soft.map((s, i) => (
                    <span
                      key={i}
                      style={{
                        border: `1px solid ${accentRed}`,
                        borderRadius: "3px",
                        padding: "1px 8px",
                        fontSize: `${fs - 1}pt`,
                        color: dark,
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  
  // ═══════════════════════════════════════════════════════════════════════════
  // TEMPLATE 5 — Deedy CS (2-column asymmetric dense)
  // Target: CS Students, Software Engineers, Undergrads
  // ═══════════════════════════════════════════════════════════════════════════
  const renderDeedyCS = () => {
    const accentCol = "#005cc5";
    
    const Hdr = ({ title, left }: { title: string, left?: boolean }) => (
      <div style={{ marginBottom: "6px", marginTop: "12px" }}>
        <span style={{
          fontFamily: font,
          fontSize: `${fs + 1}pt`,
          fontWeight: 300,
          textTransform: "uppercase",
          letterSpacing: "2px",
          color: "#444",
        }}>
          {title}
        </span>
      </div>
    );

    return (
      <div
        style={{
          fontFamily: font,
          fontSize: `${fs}pt`,
          lineHeight: lh,
          color: "#333",
          background: "#fff",
          padding: "0.5in",
          maxWidth: "8.5in",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        {/* ── Header ── */}
        <div style={{ marginBottom: "16px", borderBottom: "1px solid #ccc", paddingBottom: "12px" }}>
          <div style={{ fontSize: `${fs + 16}pt`, fontWeight: 300, color: "#111" }}>
            {personalInfo.fullName.split(" ")[0]} <span style={{ fontWeight: 700 }}>{personalInfo.fullName.split(" ").slice(1).join(" ")}</span>
          </div>
          <div style={{ fontSize: `${fs - 1}pt`, color: "#555", marginTop: "4px" }}>
            {contactParts.join(" • ")}
          </div>
        </div>

        {/* ── Two-column body ── */}
        <div style={{ display: "flex", gap: "24px" }}>
          {/* Left Column ─ 32% */}
          <div style={{ flex: "0 0 32%" }}>
            {education.length > 0 && (
              <div>
                <Hdr title="Education" left />
                {education.map((e, i) => (
                  <div key={i} style={{ marginBottom: "10px" }}>
                    <div style={{ fontWeight: 700, fontSize: `${fs}pt` }}>{e.institution}</div>
                    <div style={{ fontSize: `${fs - 1}pt`, fontStyle: "italic", color: "#555" }}>
                      {e.degree} {e.field && `in ${e.field}`}
                    </div>
                    <div style={{ fontSize: `${fs - 1.5}pt`, color: "#888", marginTop: "2px" }}>{e.endDate}</div>
                    {gpaLabel(e) && <div style={{ fontSize: `${fs - 1}pt`, marginTop: "2px" }}>{gpaLabel(e)}</div>}
                  </div>
                ))}
              </div>
            )}
            
            {skills.technical.length > 0 && (
              <div>
                <Hdr title="Skills" left />
                <div style={{ fontSize: `${fs - 0.5}pt`, lineHeight: "1.6" }}>
                  <strong>Languages/Tech:</strong>
                  <br />
                  <HL text={skills.technical.join(", ")} kw={kw} />
                </div>
              </div>
            )}
            
            {(languagesKnown || []).filter((l) => l.language).length > 0 && (
              <div>
                <Hdr title="Languages" left />
                <div style={{ fontSize: `${fs - 1}pt` }}>
                  {(languagesKnown || []).filter((l) => l.language).map((l, i) => (
                    <div key={i}>{l.language} <span style={{ color: "#777" }}>({l.proficiency})</span></div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column ─ 68% */}
          <div style={{ flex: "0 0 68%" }}>
            {summary && (
              <div>
                <Hdr title="Profile" />
                <p style={{ margin: 0, fontSize: `${fs - 0.5}pt`, textAlign: "justify" }}>
                  <HL text={summary} kw={kw} />
                </p>
              </div>
            )}

            {workExperience.length > 0 && (
              <div>
                <Hdr title="Experience" />
                {workExperience.map((w, i) => (
                  <div key={i} style={{ marginBottom: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontWeight: 700, fontSize: `${fs + 1}pt` }}>{w.company}</span>
                      <span style={{ fontSize: `${fs - 1}pt`, color: "#666" }}>{dateStr(w)}</span>
                    </div>
                    <div style={{ fontSize: `${fs - 0.5}pt`, fontStyle: "italic", color: "#555", marginBottom: "4px" }}>
                      {w.role} {w.city && `| ${w.city}`}
                    </div>
                    {w.bullets && w.bullets.length > 0 && (
                      <ul style={{ margin: 0, paddingLeft: "16px" }}>
                        {w.bullets.map((b, bi) => (
                          <li key={bi} style={{ fontSize: `${fs - 0.5}pt`, marginBottom: "2px", textAlign: "justify" }}>
                            <HL text={b} kw={kw} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {projects.length > 0 && (
              <div>
                <Hdr title="Projects" />
                {projects.map((p, i) => (
                  <div key={i} style={{ marginBottom: "10px" }}>
                    <div style={{ fontWeight: 700 }}>
                      {p.name}
                      {p.techStack.length > 0 && <span style={{ fontWeight: 400, color: "#666", fontSize: `${fs - 1}pt` }}> | {p.techStack.join(", ")}</span>}
                    </div>
                    {p.description && (
                      <div style={{ fontSize: `${fs - 0.5}pt`, marginTop: "2px", textAlign: "justify" }}>
                        <HL text={p.description} kw={kw} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // TEMPLATE 6 — Awesome Corporate
  // Target: General Professionals, Corporate, Senior Devs
  // ═══════════════════════════════════════════════════════════════════════════
  const renderAwesomeCorporate = () => {
    const accentCol = "#dc3522";
    
    const Hdr = ({ title }: { title: string }) => (
      <div style={{ display: "flex", alignItems: "center", marginBottom: "10px", marginTop: "16px" }}>
        <div style={{ 
          background: accentCol, 
          color: "#fff", 
          padding: "2px 8px", 
          borderRadius: "4px",
          fontWeight: 700,
          fontSize: `${fs}pt`,
          textTransform: "uppercase",
          letterSpacing: "1px"
        }}>
          {title}
        </div>
        <div style={{ flex: 1, height: "2px", background: "#eee", marginLeft: "10px" }} />
      </div>
    );

    return (
      <div
        style={{
          fontFamily: font,
          fontSize: `${fs}pt`,
          lineHeight: lh,
          color: "#222",
          background: "#fff",
          padding: "0.5in 0.6in",
          maxWidth: "8.5in",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{ fontSize: `${fs + 14}pt`, fontWeight: 700, letterSpacing: "1.5px", color: "#111" }}>
            {personalInfo.fullName}
          </div>
          {workExperience[0] && (
            <div style={{ fontSize: `${fs + 1}pt`, color: accentCol, marginTop: "4px", fontWeight: 600 }}>
              {workExperience[0].role}
            </div>
          )}
          <div style={{ fontSize: `${fs - 0.5}pt`, color: "#555", marginTop: "6px" }}>
            {contactParts.join(" | ")}
          </div>
        </div>

        {summary && (
          <div>
            <Hdr title="Summary" />
            <p style={{ margin: 0, fontSize: `${fs - 0.5}pt`, textAlign: "justify" }}>
              <HL text={summary} kw={kw} />
            </p>
          </div>
        )}

        {workExperience.length > 0 && (
          <div>
            <Hdr title="Work Experience" />
            {workExperience.map((w, i) => (
              <div key={i} style={{ marginBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontWeight: 700, fontSize: `${fs + 0.5}pt` }}>{w.role}</span>
                  <span style={{ fontSize: `${fs - 1}pt`, color: accentCol, fontWeight: 600 }}>{dateStr(w)}</span>
                </div>
                <div style={{ fontSize: `${fs - 0.5}pt`, color: "#555", marginBottom: "4px" }}>
                  {w.company} {w.city && `, ${w.city}`}
                </div>
                {w.bullets && w.bullets.length > 0 && (
                  <ul style={{ margin: 0, paddingLeft: "16px" }}>
                    {w.bullets.map((b, bi) => (
                      <li key={bi} style={{ fontSize: `${fs - 0.5}pt`, marginBottom: "3px", textAlign: "justify" }}>
                        <HL text={b} kw={kw} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {education.length > 0 && (
          <div>
            <Hdr title="Education" />
            {education.map((e, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{e.degree} {e.field && `in ${e.field}`}</div>
                  <div style={{ fontSize: `${fs - 0.5}pt`, color: "#555" }}>{e.institution} {gpaLabel(e) && `| ${gpaLabel(e)}`}</div>
                </div>
                <div style={{ fontSize: `${fs - 1}pt`, color: accentCol, fontWeight: 600, textAlign: "right" }}>
                  {e.endDate}
                </div>
              </div>
            ))}
          </div>
        )}

        {skills.technical.length > 0 && (
          <div>
            <Hdr title="Skills" />
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", fontSize: `${fs - 0.5}pt` }}>
              {skills.technical.map((s, i) => (
                <span key={i} style={{ background: "#f4f4f4", padding: "3px 8px", borderRadius: "4px", color: "#333", fontWeight: 500 }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // TEMPLATE 7 — Plasmati Academic
  // Target: Early Career, Graduates, Academics
  // ═══════════════════════════════════════════════════════════════════════════
  const renderPlasmatiAcademic = () => {
    const Hdr = ({ title }: { title: string }) => (
      <div style={{ marginBottom: "12px", marginTop: "20px" }}>
        <span style={{
          fontFamily: `"Georgia", serif`,
          fontSize: `${fs + 4}pt`,
          fontWeight: 400,
          fontStyle: "italic",
          borderBottom: "1px solid #111",
          paddingBottom: "2px",
          display: "inline-block",
          minWidth: "200px"
        }}>
          {title}
        </span>
      </div>
    );

    return (
      <div
        style={{
          fontFamily: `"Georgia", serif`,
          fontSize: `${fs}pt`,
          lineHeight: lh,
          color: "#222",
          background: "#fff",
          padding: "0.6in 0.8in",
          maxWidth: "8.5in",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ fontSize: `${fs + 20}pt`, fontWeight: 400, letterSpacing: "2px", fontFamily: `"Georgia", serif` }}>
            {personalInfo.fullName.toUpperCase()}
          </div>
          <div style={{ fontSize: `${fs - 0.5}pt`, marginTop: "8px", color: "#444" }}>
            {contactParts.join("  |  ")}
          </div>
        </div>

        {summary && (
          <div>
            <Hdr title="Overview" />
            <p style={{ margin: 0, textAlign: "justify", fontSize: `${fs}pt` }}>
              <HL text={summary} kw={kw} />
            </p>
          </div>
        )}

        {education.length > 0 && (
          <div>
            <Hdr title="Education" />
            {education.map((e, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "16px", marginBottom: "12px" }}>
                <div style={{ fontSize: `${fs - 1}pt`, fontStyle: "italic", color: "#555", paddingTop: "2px" }}>
                  {e.endDate}
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{e.degree} {e.field && `in ${e.field}`}</div>
                  <div style={{ color: "#333" }}>{e.institution}</div>
                  {gpaLabel(e) && <div style={{ fontSize: `${fs - 0.5}pt`, color: "#555", marginTop: "2px" }}>{gpaLabel(e)}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {workExperience.length > 0 && (
          <div>
            <Hdr title="Experience" />
            {workExperience.map((w, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "16px", marginBottom: "14px" }}>
                <div style={{ fontSize: `${fs - 1}pt`, fontStyle: "italic", color: "#555", paddingTop: "2px" }}>
                  {dateStr(w)}
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{w.role} <span style={{ fontWeight: 400, fontStyle: "italic", color: "#555" }}>at {w.company}</span></div>
                  {w.bullets && w.bullets.length > 0 && (
                    <ul style={{ margin: "4px 0 0 0", paddingLeft: "16px" }}>
                      {w.bullets.map((b, bi) => (
                        <li key={bi} style={{ fontSize: `${fs - 0.5}pt`, marginBottom: "3px", textAlign: "justify" }}>
                          <HL text={b} kw={kw} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ─── Route to correct template ────────────────────────────────────────────
    switch (templateId) {
    case "jakes-resume":      return renderJakesResume();
    case "altacv-modern":     return renderAltaCVModern();
    case "curve-timeline":    return renderCurVeTimeline();
    case "hipster-sidebar":   return renderHipsterSidebar();
    case "deedy-cs":          return renderDeedyCS();
    case "awesome-corporate": return renderAwesomeCorporate();
    case "plasmati-academic": return renderPlasmatiAcademic();
    // Legacy fallbacks
    case "classic-professional":
    case "modern-minimalist":
    case "achievement-focused":
    case "executive-senior":
    case "career-changer":
    case "technical-focus":
    default:                  return renderJakesResume();
  }
}
