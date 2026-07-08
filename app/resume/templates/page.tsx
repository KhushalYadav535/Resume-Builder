"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import ResumeDocument from "@/components/ResumeDocument";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import ParticleBackground from "@/components/ui/ParticleBackground";
import { ResumeData } from "@/types";

const templates = [
  {
    id: "jakes-resume",
    name: "Jake's Resume",
    desc: "The gold standard for Software Engineers. Compact, perfectly right-aligned dates, LaTeX-style typographic system. 100% ATS.",
    color: "#111111",
    tags: ["Recommended", "SWE", "ATS-100%", "LaTeX-Style"],
  },
  {
    id: "altacv-modern",
    name: "AltaCV Modern",
    desc: "Asymmetric 2-column layout with colored sidebar, pill-shaped skill tags, and warm accent colors. Best for senior and creative roles.",
    color: "#8B1A1A",
    tags: ["2-Column", "Creative", "Senior", "ATS-85%"],
  },
  {
    id: "curve-timeline",
    name: "CurVe Timeline",
    desc: "Marginal-date grid layout with Georgia serif font and academic blue accents. Perfect for academics, finance, and law.",
    color: "#1a4a7a",
    tags: ["Academic", "Finance", "Law", "ATS-99%"],
  },
  {
    id: "hipster-sidebar",
    name: "Hipster Sidebar",
    desc: "Bold dark banner header with sidebar skill progress bars. Striking and modern for marketing, branding, and UX roles.",
    color: "#e94560",
    tags: ["Marketing", "Design", "UX", "Modern"],
  },
  {
    id: "deedy-cs",
    name: "Deedy CS",
    desc: "Legendary 2-column layout designed for high information density. Highly popular among CS students and Software Engineers.",
    color: "#005cc5",
    tags: ["SWE", "Undergrad", "2-Column", "Dense"],
  },
  {
    id: "awesome-corporate",
    name: "Awesome Corporate",
    desc: "Clean, premium, and perfectly structured single-column layout. Ideal for corporate professionals and executives.",
    color: "#dc3522",
    tags: ["Corporate", "Clean", "Professional", "ATS-100%"],
  },
  {
    id: "plasmati-academic",
    name: "Plasmati Academic",
    desc: "Classic serif typography with a spacious, highly readable layout. Designed for early-career grads and academics.",
    color: "#2e475d",
    tags: ["Academic", "Graduate", "Spacious", "Classic"],
  },
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

      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>
          Standard & Highly Recommended
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
          {templates.filter(t => t.id === "jakes-resume").map((t) => (
            <Card
              key={t.id}
              className="cursor-pointer transition-all duration-300 flex flex-col h-full hover:-translate-y-1 hover:shadow-xl ring-2 ring-[var(--accent)] bg-[var(--accent-soft)]"
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
                  <Badge key={tag} variant="accent" style={{ fontSize: "0.7rem", padding: "0.15rem 0.6rem" }}>
                    {tag}
                  </Badge>
                ))}
              </div>
              <Button fullWidth onClick={() => handleSelectTemplate(t.id)}>
                {editId ? "Select & Apply Style" : "Use Template →"}
              </Button>
            </div>
          </Card>
        ))}
        </div>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>
          Other Templates
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
          {templates.filter(t => t.id !== "jakes-resume").map((t) => (
            <Card
              key={t.id}
              className="cursor-pointer transition-all duration-300 flex flex-col h-full hover:-translate-y-1 hover:shadow-xl"
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
                    <Badge key={tag} variant="accent" style={{ fontSize: "0.7rem", padding: "0.15rem 0.6rem" }}>
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Button fullWidth onClick={() => handleSelectTemplate(t.id)}>
                  {editId ? "Select & Apply Style" : "Use Template →"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-page)] relative overflow-hidden">
      <ParticleBackground count={50} connectionDist={110} />
      <div style={{ position: 'relative', zIndex: 10 }}>
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
    </div>
  );
}
