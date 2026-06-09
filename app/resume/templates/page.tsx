"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import ResumeDocument from "@/components/ResumeDocument";
import { ResumeData } from "@/types";

const templates = [
  {
    id: "modern",
    name: "Modern ATS",
    desc: "Clean, standard structure — best for tech and software engineering roles",
    color: "#6c63ff",
    tags: ["ATS-Friendly", "Tech", "Structured"],
  },
  {
    id: "professional",
    name: "Professional",
    desc: "Classic structure with prominent divider lines — best for corporate and finance",
    color: "#2563eb",
    tags: ["ATS-Friendly", "Corporate", "Classic"],
  },
  {
    id: "executive",
    name: "Executive",
    desc: "Leadership-focused layout with centered typography — best for senior and C-suite",
    color: "#1e293b",
    tags: ["ATS-Friendly", "Leadership", "Senior"],
  },
  {
    id: "minimal",
    name: "Minimal",
    desc: "Elegant layout maximizing whitespace — clean and distraction-free",
    color: "#71717a",
    tags: ["Minimalist", "Academic", "Clean"],
  },
  {
    id: "creative",
    name: "Creative",
    desc: "Bold two-column layout with left tag sidebar — best for design and media",
    color: "#ec4899",
    tags: ["Visual", "Marketing", "Two-Column"],
  },
  {
    id: "ats-safe",
    name: "ATS Safe",
    desc: "Times New Roman clean 1-column layout — maximum parse rates",
    color: "#10b981",
    tags: ["Standard-Compliance", "High-Compatibility"],
  },
  {
    id: "fresher",
    name: "Fresher Mode",
    desc: "Highlighted education, GATE/JEE scores, hackathons, and placement checklist",
    color: "#f59e0b",
    tags: ["Fresher", "Academia", "Exams"],
  },
  {
    id: "startup",
    name: "Startup Growth",
    desc: "Rose red impact styling focusing on projects, metrics, and key achievements",
    color: "#f43f5e",
    tags: ["High-Impact", "Projects"],
  },
  {
    id: "it-tech",
    name: "IT Tech",
    desc: "Monospace coding font with top technical stack blocks",
    color: "#3b82f6",
    tags: ["Monospace", "Developer", "IT"],
  },
  {
    id: "bfsi-risk",
    name: "BFSI Corporate",
    desc: "CFA, FRM, RBI, SEBI compliance structured navy layout",
    color: "#1e3a8a",
    tags: ["Navy-Corporate", "Compliance", "Finance"],
  },
  {
    id: "minimal-2",
    name: "Minimalist Teal",
    desc: "Teal accents, elegant spacing and typography styling",
    color: "#0d9488",
    tags: ["Elegant", "Teal-Accents", "Clean"],
  }
];

function TemplatesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id") || searchParams.get("resumeId");

  const [resumeRecord, setResumeRecord] = useState<any>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/get-resumes")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const found = editId ? data.find((r) => r.id === editId) : data[0];
          if (found) {
            setResumeRecord(found);
            setResumeData(found.resume_data);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading resumes:", err);
        setLoading(false);
      });
  }, [editId]);

  const handleSelectTemplate = async (tplId: string) => {
    if (editId && resumeRecord) {
      try {
        const res = await fetch("/api/save-resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editId,
            file_name: resumeRecord.file_name,
            raw_text: resumeRecord.raw_text,
            resume_data: resumeRecord.resume_data,
            template_id: tplId,
            ats_score: resumeRecord.ats_score,
            content_review: resumeRecord.content_review,
            jd_match: resumeRecord.jd_match,
          }),
        });
        if (res.ok) {
          router.push(`/resume/${editId}`);
        } else {
          alert("Failed to update template.");
        }
      } catch (err) {
        console.error(err);
        alert("Error saving template.");
      }
    } else {
      router.push(`/resume/builder?template=${tplId}`);
    }
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
      <div style={{ marginBottom: "2.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "1.5rem" }}>
        <p className="section-label" style={{ marginBottom: "0.5rem" }}>Choose a Style</p>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "2.2rem", fontWeight: 800 }}>
          Resume Templates
        </h1>
        <p style={{ color: "var(--text-muted)", marginTop: "0.5rem", fontSize: "0.95rem" }}>
          {editId 
            ? `Select a template style to apply to "${resumeRecord?.file_name || "your resume"}".`
            : "Select a base style to start building. All templates are ATS-optimized."
          }
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
        {templates.map((t) => (
          <div
            key={t.id}
            className="card"
            style={{ 
              cursor: "pointer", 
              transition: "all 0.25s",
              display: "flex",
              flexDirection: "column",
              height: "100%"
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = t.color + "88";
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = `0 10px 30px ${t.color}22`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
            }}
            onClick={() => handleSelectTemplate(t.id)}
          >
            {/* Live scaled preview container */}
            <div
              style={{
                height: "230px",
                borderRadius: "10px",
                background: `#161622`,
                border: `1px solid var(--border)`,
                marginBottom: "1.2rem",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                justifyContent: "center",
                alignItems: "start",
                padding: "0.5rem"
              }}
            >
              {resumeData ? (
                <div style={{
                  width: "550px",
                  transform: "scale(0.27)",
                  transformOrigin: "top center",
                  background: "#ffffff",
                  color: "#333333",
                  padding: t.id === "creative" ? "0" : "1.8rem",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  borderRadius: "4px",
                  pointerEvents: "none",
                }}>
                  <ResumeDocument data={resumeData} templateId={t.id} />
                </div>
              ) : (
                /* Static placeholder layout */
                <div style={{ width: "85%", padding: "20px 12px", display: "grid", gap: "10px", opacity: 0.65 }}>
                  <div style={{ height: 10, background: t.color, borderRadius: 4, width: "65%" }} />
                  <div style={{ height: 5, background: t.color + "60", borderRadius: 2, width: "45%", marginBottom: "5px" }} />
                  <div style={{ height: 4, background: "var(--border)", borderRadius: 2, width: "100%" }} />
                  <div style={{ height: 4, background: "var(--border)", borderRadius: 2, width: "90%" }} />
                  <div style={{ height: 4, background: "var(--border)", borderRadius: 2, width: "80%", marginBottom: "5px" }} />
                  <div style={{ height: 6, background: t.color + "80", borderRadius: 2, width: "35%" }} />
                  <div style={{ height: 4, background: "var(--border)", borderRadius: 2, width: "95%" }} />
                  <div style={{ height: 4, background: "var(--border)", borderRadius: 2, width: "75%" }} />
                </div>
              )}
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.1rem", marginBottom: "0.4rem" }}>
                {t.name}
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: "1rem", lineHeight: 1.5, flex: 1 }}>
                {t.desc}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1.2rem" }}>
                {t.tags.map((tag) => (
                  <span key={tag} className="tag tag-purple" style={{ fontSize: "0.7rem", padding: "0.15rem 0.6rem" }}>
                    {tag}
                  </span>
                ))}
              </div>
              <button className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "0.6rem", fontSize: "0.85rem" }}>
                {editId ? "Select & Apply Style" : "Use Template →"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <Suspense fallback={
        <div style={{ display: "flex", minHeight: "80vh", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem" }}>
          <div className="spinner" style={{ width: 32, height: 32 }} />
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>Loading templates...</p>
        </div>
      }>
        <TemplatesContent />
      </Suspense>
    </div>
  );
}
