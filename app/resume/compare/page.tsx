"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { Resume } from "@/types";

export default function ResumeComparePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected resumes for comparison
  const [resumeIdA, setResumeIdA] = useState("");
  const [resumeIdB, setResumeIdB] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch("/api/get-resumes")
      .then((r) => r.json())
      .then((data: Resume[]) => {
        if (Array.isArray(data)) {
          setResumes(data);
          if (data.length >= 2) {
            setResumeIdA(data[0].id);
            setResumeIdB(data[1].id);
          } else if (data.length === 1) {
            setResumeIdA(data[0].id);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  if (authLoading || loading || !user) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  const resumeA = resumes.find(r => r.id === resumeIdA);
  const resumeB = resumes.find(r => r.id === resumeIdB);

  const getScoreColor = (score: number) => {
    if (score >= 70) return "#43e97b";
    if (score >= 45) return "#f6d365";
    return "#ff6584";
  };

  const getCompletionStats = (data: any) => {
    if (!data) return 0;
    let completedSteps = 0;
    if (data.personalInfo?.fullName && data.personalInfo?.email) completedSteps++;
    if (data.summary?.trim()?.length > 10) completedSteps++;
    if (data.workExperience?.length > 0) completedSteps++;
    if (data.education?.length > 0) completedSteps++;
    if (data.skills?.technical?.length > 0) completedSteps++;
    if (data.projects?.length > 0) completedSteps++;
    if (data.certifications?.length > 0) completedSteps++;
    return Math.round((completedSteps / 7) * 100);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        
        {/* Header navigation */}
        <div style={{ marginBottom: "1.5rem" }}>
          <Link href="/dashboard" style={{ textDecoration: "none", color: "var(--text-muted)", fontSize: "0.85rem" }}>
            ← Back to Dashboard
          </Link>
        </div>

        <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "1.5rem", marginBottom: "2rem" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--accent)", fontWeight: 700, textTransform: "uppercase" }}>Audit Compare</span>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "2.2rem", fontWeight: 800 }}>Side-by-Side CV Comparison</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginTop: "0.25rem" }}>
            Select any two resumes from your workspace history to compare metrics, formatting gaps, and key achievements.
          </p>
        </div>

        {resumes.length < 2 ? (
          <div className="card" style={{ textAlign: "center", padding: "4rem 2rem", borderStyle: "dashed" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1.5rem" }}>⚖️</div>
            <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, marginBottom: "0.5rem" }}>Comparison Requires at Least 2 Resumes</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", maxWidth: "450px", margin: "0 auto 1.5rem" }}>
              To compare content alignment side-by-side, please build or upload at least one more resume record.
            </p>
            <Link href="/resume/builder" style={{ textDecoration: "none" }}>
              <button className="btn-primary">✦ Create Another Resume</button>
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "2rem" }}>
            
            {/* SELECTOR TOOLBAR */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", background: "var(--card)", padding: "1.2rem", borderRadius: "12px", border: "1px solid var(--border)" }}>
              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.35rem", fontWeight: 600 }}>Resume A (Left)</label>
                <select 
                  className="input" 
                  style={{ height: "42px", background: "var(--bg-2)" }} 
                  value={resumeIdA} 
                  onChange={(e) => setResumeIdA(e.target.value)}
                >
                  {resumes.map(r => (
                    <option key={r.id} value={r.id} disabled={r.id === resumeIdB}>{r.file_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.35rem", fontWeight: 600 }}>Resume B (Right)</label>
                <select 
                  className="input" 
                  style={{ height: "42px", background: "var(--bg-2)" }} 
                  value={resumeIdB} 
                  onChange={(e) => setResumeIdB(e.target.value)}
                >
                  {resumes.map(r => (
                    <option key={r.id} value={r.id} disabled={r.id === resumeIdA}>{r.file_name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* COMPARISON METRIC ROWS */}
            {resumeA && resumeB && (
              <div style={{ display: "grid", gap: "1rem" }}>
                
                {/* 1. Resume Name cards */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                  <div className="card" style={{ borderLeft: "4px solid var(--accent)", padding: "1.2rem" }}>
                    <h3 style={{ fontWeight: 800, fontSize: "1.1rem", margin: 0 }}>{resumeA.file_name}</h3>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Last updated: {new Date(resumeA.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="card" style={{ borderLeft: "4px solid var(--accent-2)", padding: "1.2rem" }}>
                    <h3 style={{ fontWeight: 800, fontSize: "1.1rem", margin: 0 }}>{resumeB.file_name}</h3>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Last updated: {new Date(resumeB.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* 2. ATS Score Row */}
                <div className="card" style={{ padding: "1.5rem" }}>
                  <h4 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "0.95rem", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "1rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.4rem" }}>
                    ATS Score Comparison
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", textAlign: "center" }}>
                    <div>
                      {resumeA.ats_score ? (
                        <>
                          <div style={{ fontSize: "2.8rem", fontWeight: 800, color: getScoreColor(resumeA.ats_score.overall), fontFamily: "Syne, sans-serif" }}>
                            {resumeA.ats_score.overall}
                          </div>
                          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Overall Compatibility Index</span>
                        </>
                      ) : (
                        <div style={{ color: "var(--text-dim)", fontStyle: "italic", fontSize: "0.85rem" }}>No ATS score computed</div>
                      )}
                    </div>

                    <div>
                      {resumeB.ats_score ? (
                        <>
                          <div style={{ fontSize: "2.8rem", fontWeight: 800, color: getScoreColor(resumeB.ats_score.overall), fontFamily: "Syne, sans-serif" }}>
                            {resumeB.ats_score.overall}
                          </div>
                          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Overall Compatibility Index</span>
                        </>
                      ) : (
                        <div style={{ color: "var(--text-dim)", fontStyle: "italic", fontSize: "0.85rem" }}>No ATS score computed</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Section Completeness */}
                <div className="card" style={{ padding: "1.5rem" }}>
                  <h4 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "0.95rem", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "1rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.4rem" }}>
                    Profile Completeness Ratio
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                    <div>
                      {(() => {
                        const score = getCompletionStats(resumeA.resume_data);
                        return (
                          <div style={{ display: "grid", gap: "0.4rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                              <span style={{ fontWeight: 600 }}>{score}% Complete</span>
                            </div>
                            <div style={{ height: "6px", background: "var(--bg-3)", borderRadius: "3px", overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${score}%`, background: "var(--accent)" }} />
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <div>
                      {(() => {
                        const score = getCompletionStats(resumeB.resume_data);
                        return (
                          <div style={{ display: "grid", gap: "0.4rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                              <span style={{ fontWeight: 600 }}>{score}% Complete</span>
                            </div>
                            <div style={{ height: "6px", background: "var(--bg-3)", borderRadius: "3px", overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${score}%`, background: "var(--accent-2)" }} />
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* 4. Experience & Projects counts */}
                <div className="card" style={{ padding: "1.5rem" }}>
                  <h4 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "0.95rem", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "1rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.4rem" }}>
                    Work Experience & Projects
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem", fontSize: "0.85rem" }}>
                        <span style={{ color: "var(--text-muted)" }}>Positions:</span>
                        <strong style={{ color: "var(--text)" }}>{resumeA.resume_data?.workExperience?.length || 0}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                        <span style={{ color: "var(--text-muted)" }}>Projects:</span>
                        <strong style={{ color: "var(--text)" }}>{resumeA.resume_data?.projects?.length || 0}</strong>
                      </div>
                    </div>

                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem", fontSize: "0.85rem" }}>
                        <span style={{ color: "var(--text-muted)" }}>Positions:</span>
                        <strong style={{ color: "var(--text)" }}>{resumeB.resume_data?.workExperience?.length || 0}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                        <span style={{ color: "var(--text-muted)" }}>Projects:</span>
                        <strong style={{ color: "var(--text)" }}>{resumeB.resume_data?.projects?.length || 0}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Key Skills Density */}
                <div className="card" style={{ padding: "1.5rem" }}>
                  <h4 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "0.95rem", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "1rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.4rem" }}>
                    Key Skills Density
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                    <div>
                      <span style={{ fontSize: "0.74rem", textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "0.5rem" }}>Technical Skills ({resumeA.resume_data?.skills?.technical?.length || 0})</span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                        {(resumeA.resume_data?.skills?.technical || []).slice(0, 10).map((s: string) => (
                          <span key={s} className="tag tag-purple" style={{ fontSize: "0.72rem" }}>{s}</span>
                        ))}
                        {(resumeA.resume_data?.skills?.technical || []).length > 10 && <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>+{resumeA.resume_data.skills.technical.length - 10} more</span>}
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: "0.74rem", textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "0.5rem" }}>Technical Skills ({resumeB.resume_data?.skills?.technical?.length || 0})</span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                        {(resumeB.resume_data?.skills?.technical || []).slice(0, 10).map((s: string) => (
                          <span key={s} className="tag tag-purple" style={{ fontSize: "0.72rem" }}>{s}</span>
                        ))}
                        {(resumeB.resume_data?.skills?.technical || []).length > 10 && <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>+{resumeB.resume_data.skills.technical.length - 10} more</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6. Missing ATS Keywords */}
                <div className="card" style={{ padding: "1.5rem" }}>
                  <h4 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "0.95rem", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "1rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.4rem" }}>
                    Missing Keywords Gap
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                    <div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                        {resumeA.ats_score?.missingKeywords?.map((kw: string) => (
                          <span key={kw} className="tag tag-red" style={{ fontSize: "0.72rem" }}>{kw}</span>
                        )) || <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>No missing keywords</span>}
                      </div>
                    </div>

                    <div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                        {resumeB.ats_score?.missingKeywords?.map((kw: string) => (
                          <span key={kw} className="tag tag-red" style={{ fontSize: "0.72rem" }}>{kw}</span>
                        )) || <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>No missing keywords</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 7. Summaries side-by-side */}
                <div className="card" style={{ padding: "1.5rem" }}>
                  <h4 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "0.95rem", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "1rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.4rem" }}>
                    Professional Summary
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5, fontStyle: "italic" }}>
                      "{resumeA.resume_data?.summary || "No summary provided."}"
                    </div>

                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5, fontStyle: "italic" }}>
                      "{resumeB.resume_data?.summary || "No summary provided."}"
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
