"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ResumeRenderer from "@/components/ResumeRenderer";
import { useAuth } from "@/hooks/useAuth";
import { Resume, ResumeData, JDMatch } from "@/types";

export default function TailorPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Step management
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Data states
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [jdMatchResult, setJdMatchResult] = useState<JDMatch | null>(null);

  // Rewrite states
  const [rewriteTargets, setRewriteTargets] = useState<{
    field: string;
    index?: number;
    bulletIndex?: number;
    original: string;
  }[]>([]);
  const [rewriteSuggestions, setRewriteSuggestions] = useState<Record<string, string[]>>({});
  const [rewriteLoading, setRewriteLoading] = useState<Record<string, boolean>>({});
  const [acceptedRewrites, setAcceptedRewrites] = useState<Set<string>>(new Set());

  // UI states
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");
  const [zoomFactor, setZoomFactor] = useState(0.85);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  // Fetch user's resumes
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch("/api/get-resumes")
      .then((r) => r.json())
      .then((data) => {
        setResumes(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  // When a resume is selected, load it
  useEffect(() => {
    if (!selectedResumeId) {
      setSelectedResume(null);
      return;
    }
    const found = resumes.find((r) => r.id === selectedResumeId);
    if (found) {
      setSelectedResume(found);
      buildRewriteTargets(found.resume_data);
    }
  }, [selectedResumeId, resumes]);

  const buildRewriteTargets = (data: ResumeData) => {
    const targets: typeof rewriteTargets = [];

    // Summary
    if (data.summary && data.summary.trim().length > 10) {
      targets.push({ field: "summary", original: data.summary });
    }

    // Work experience bullets
    data.workExperience.forEach((exp, expIdx) => {
      exp.bullets.forEach((bullet, bulletIdx) => {
        if (bullet.trim().length > 5) {
          targets.push({
            field: "work",
            index: expIdx,
            bulletIndex: bulletIdx,
            original: bullet,
          });
        }
      });
    });

    setRewriteTargets(targets);
  };

  const getTargetKey = (target: typeof rewriteTargets[0]) => {
    if (target.field === "summary") return "summary";
    return `work-${target.index}-${target.bulletIndex}`;
  };

  // Step 2: Analyze JD Match
  const handleAnalyze = async () => {
    if (!selectedResume || !jobDescription.trim()) return;
    setAnalyzing(true);
    setError("");
    setJdMatchResult(null);

    try {
      const res = await fetch("/api/jd-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: selectedResume.resume_data,
          jobDescription,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Analysis failed");
      }

      setJdMatchResult(data);
      setCurrentStep(3);
    } catch (err: any) {
      setError(err.message || "Failed to analyze. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  // Step 3: Request AI rewrite for a specific target
  const handleRewrite = async (target: typeof rewriteTargets[0]) => {
    const key = getTargetKey(target);
    setRewriteLoading((prev) => ({ ...prev, [key]: true }));

    try {
      const context =
        target.field === "summary"
          ? "Professional Summary"
          : `Work Experience at ${selectedResume?.resume_data.workExperience[target.index!]?.company || "Company"} — ${selectedResume?.resume_data.workExperience[target.index!]?.role || "Role"}`;

      const res = await fetch("/api/ai-rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: target.original,
          context,
          targetJobDescription: jobDescription,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Rewrite failed");
      }

      setRewriteSuggestions((prev) => ({
        ...prev,
        [key]: data.suggestions,
      }));
    } catch (err: any) {
      console.error(err);
      setError(`Rewrite failed for "${target.original.substring(0, 40)}...": ${err.message}`);
    } finally {
      setRewriteLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  // Accept a suggestion — update the resume data in memory
  const handleAccept = (target: typeof rewriteTargets[0], suggestion: string) => {
    if (!selectedResume) return;
    const key = getTargetKey(target);

    const updatedData = { ...selectedResume.resume_data };

    if (target.field === "summary") {
      updatedData.summary = suggestion;
    } else if (target.field === "work" && target.index !== undefined && target.bulletIndex !== undefined) {
      const updatedWork = [...updatedData.workExperience];
      const updatedBullets = [...updatedWork[target.index].bullets];
      updatedBullets[target.bulletIndex] = suggestion;
      updatedWork[target.index] = { ...updatedWork[target.index], bullets: updatedBullets };
      updatedData.workExperience = updatedWork;
    }

    // Update the target's original text so the UI reflects the change
    setRewriteTargets((prev) =>
      prev.map((t) => (getTargetKey(t) === key ? { ...t, original: suggestion } : t))
    );

    setSelectedResume((prev) => (prev ? { ...prev, resume_data: updatedData } : null));
    setAcceptedRewrites((prev) => new Set(prev).add(key));
    // Clear suggestions for this target after accepting
    setRewriteSuggestions((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  // Save updated resume to database
  const handleSave = async () => {
    if (!selectedResume) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      const rawText = [
        selectedResume.resume_data.personalInfo.fullName,
        selectedResume.resume_data.personalInfo.email,
        selectedResume.resume_data.summary,
        ...selectedResume.resume_data.workExperience.flatMap((w) => [
          w.company, w.role, ...w.bullets,
        ]),
        ...selectedResume.resume_data.skills.technical,
      ].join("\n");

      const res = await fetch("/api/save-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedResume.id,
          file_name: selectedResume.file_name,
          raw_text: rawText,
          resume_data: selectedResume.resume_data,
          template_id: selectedResume.template_id,
          ats_score: selectedResume.ats_score,
          jd_match: jdMatchResult,
        }),
      });

      if (!res.ok) throw new Error("Save failed");
      setSaveSuccess(true);
      setCurrentStep(4);
    } catch (err: any) {
      setError("Failed to save resume: " + (err.message || String(err)));
    } finally {
      setSaving(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "#43e97b";
    if (score >= 45) return "#f6d365";
    return "#ff6584";
  };

  if (authLoading || !user) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left Panel: Form */}
        <div style={{ flex: showPreview ? "1 1 50%" : 1, overflowY: "auto", padding: "2.5rem 2rem" }}>
          <div style={{ maxWidth: showPreview ? "800px" : "900px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem", borderBottom: "1px solid var(--border)", paddingBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "2rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              🎯 Tailor Resume for a Job
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.4rem" }}>
              Select a resume, paste a job description, and let AI tailor your content with one-click rewrites.
            </p>
          </div>
          {selectedResume && (
            <button 
              className="btn-secondary" 
              onClick={() => setShowPreview(!showPreview)}
              style={{ fontSize: "0.85rem", padding: "0.5rem 1rem", whiteSpace: "nowrap" }}
            >
              {showPreview ? "🗔 Hide Preview" : "🗔 See Preview"}
            </button>
          )}
        </div>

        {/* Progress Steps */}
        <div style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "2rem",
          background: "var(--card)",
          padding: "0.8rem 1rem",
          borderRadius: "12px",
          border: "1px solid var(--border)",
        }}>
          {[
            { num: 1, label: "Select Resume" },
            { num: 2, label: "Paste JD & Analyze" },
            { num: 3, label: "AI Rewrites" },
            { num: 4, label: "Save & Download" },
          ].map((s) => (
            <div
              key={s.num}
              style={{
                flex: 1,
                textAlign: "center",
                padding: "0.5rem",
                borderRadius: "8px",
                background: currentStep >= s.num ? "var(--accent)" : "var(--bg-2)",
                color: currentStep >= s.num ? "#fff" : "var(--text-muted)",
                fontSize: "0.78rem",
                fontWeight: currentStep >= s.num ? 700 : 500,
                transition: "all 0.3s",
              }}
            >
              {s.num}. {s.label}
            </div>
          ))}
        </div>

        {/* Error banner */}
        {error && (
          <div style={{
            background: "rgba(255, 101, 132, 0.08)",
            borderLeft: "4px solid #ff6584",
            padding: "1rem",
            borderRadius: "8px",
            fontSize: "0.85rem",
            color: "#ff6584",
            marginBottom: "1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <span>⚠️ {error}</span>
            <button onClick={() => setError("")} style={{ background: "none", border: "none", color: "#ff6584", cursor: "pointer", fontSize: "1rem" }}>✕</button>
          </div>
        )}

        {/* ============ STEP 1: SELECT RESUME ============ */}
        <div className="card" style={{ display: "grid", gap: "1rem", marginBottom: "1.5rem" }}>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.15rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span style={{ opacity: currentStep >= 1 ? 1 : 0.4 }}>📄</span> Step 1: Select Resume
          </h2>

          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div className="spinner" style={{ margin: "0 auto" }} />
            </div>
          ) : resumes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
              <p>No resumes found. Build or upload one first.</p>
              <button className="btn-primary" onClick={() => router.push("/resume/builder")} style={{ marginTop: "0.5rem" }}>
                ✦ Build Resume
              </button>
            </div>
          ) : (
            <select
              className="input"
              value={selectedResumeId}
              onChange={(e) => {
                setSelectedResumeId(e.target.value);
                if (e.target.value) setCurrentStep(2);
                // Reset downstream state
                setJdMatchResult(null);
                setRewriteSuggestions({});
                setAcceptedRewrites(new Set());
                setSaveSuccess(false);
              }}
              style={{ background: "var(--bg-2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "8px", height: "44px" }}
            >
              <option value="">— Choose a resume —</option>
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.file_name} ({new Date(r.created_at).toLocaleDateString()})
                  {r.ats_score ? ` — ATS: ${r.ats_score.overall}/100` : ""}
                </option>
              ))}
            </select>
          )}

          {selectedResume && (
            <div style={{
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap",
              background: "var(--bg-2)",
              padding: "0.8rem 1rem",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              fontSize: "0.82rem",
            }}>
              <span><strong>Name:</strong> {selectedResume.resume_data.personalInfo.fullName}</span>
              <span><strong>Role:</strong> {selectedResume.resume_data.workExperience[0]?.role || "N/A"}</span>
              <span><strong>Skills:</strong> {selectedResume.resume_data.skills.technical.slice(0, 5).join(", ")}{selectedResume.resume_data.skills.technical.length > 5 ? "…" : ""}</span>
              {selectedResume.ats_score && (
                <span style={{ color: getScoreColor(selectedResume.ats_score.overall), fontWeight: 700 }}>
                  ATS: {selectedResume.ats_score.overall}/100
                </span>
              )}
            </div>
          )}
        </div>

        {/* ============ STEP 2: PASTE JD & ANALYZE ============ */}
        {currentStep >= 2 && selectedResume && (
          <div className="card" style={{ display: "grid", gap: "1rem", marginBottom: "1.5rem", opacity: currentStep >= 2 ? 1 : 0.5, transition: "opacity 0.3s" }}>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.15rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              📋 Step 2: Paste Job Description
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", margin: 0 }}>
              Paste the full job description you're applying for. Our AI will analyze keyword gaps and generate targeted rewrites.
            </p>

            <textarea
              className="input"
              rows={8}
              placeholder="Paste the complete job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              style={{ fontSize: "0.88rem", lineHeight: 1.6 }}
            />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {jobDescription.trim().split(/\s+/).filter(Boolean).length} words
              </span>
              <button
                className="btn-primary"
                disabled={!jobDescription.trim() || analyzing}
                onClick={handleAnalyze}
                style={{ padding: "0.6rem 1.5rem", fontSize: "0.85rem" }}
              >
                {analyzing ? (
                  <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <span className="spinner" style={{ width: 14, height: 14 }} />
                    Analyzing Match...
                  </span>
                ) : (
                  "✦ Analyze Job Match"
                )}
              </button>
            </div>
          </div>
        )}

        {/* ============ STEP 3: RESULTS & AI REWRITES ============ */}
        {currentStep >= 3 && jdMatchResult && selectedResume && (
          <div style={{ display: "grid", gap: "1.5rem", marginBottom: "1.5rem" }}>

            {/* Match Score Card */}
            <div className="card" style={{ display: "grid", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.15rem", margin: 0 }}>
                  📊 Match Analysis
                </h2>
                <span
                  className={`tag ${jdMatchResult.matchScore >= 70 ? "tag-green" : jdMatchResult.matchScore >= 50 ? "tag-yellow" : "tag-red"}`}
                  style={{ fontSize: "1rem", fontWeight: 800, padding: "0.5rem 1.2rem" }}
                >
                  {jdMatchResult.matchScore}/100
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ height: "10px", background: "var(--bg-3)", borderRadius: "5px", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${jdMatchResult.matchScore}%`,
                  background: `linear-gradient(90deg, ${getScoreColor(jdMatchResult.matchScore)}, ${jdMatchResult.matchScore >= 70 ? "#38f9d7" : jdMatchResult.matchScore >= 50 ? "#fda085" : "#ff6584"})`,
                  transition: "width 0.5s ease",
                  borderRadius: "5px",
                }} />
              </div>

              {/* Keywords */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                {jdMatchResult.matchedKeywords.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: "0.82rem", fontWeight: 700, color: "#43e97b", marginBottom: "0.4rem" }}>
                      ✓ Matched ({jdMatchResult.matchedKeywords.length})
                    </h4>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                      {jdMatchResult.matchedKeywords.map((kw, i) => (
                        <span key={i} className="tag tag-green" style={{ fontSize: "0.72rem" }}>{kw}</span>
                      ))}
                    </div>
                  </div>
                )}
                {jdMatchResult.missingKeywords.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: "0.82rem", fontWeight: 700, color: "#ff6584", marginBottom: "0.4rem" }}>
                      ✗ Missing ({jdMatchResult.missingKeywords.length})
                    </h4>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                      {jdMatchResult.missingKeywords.map((kw, i) => (
                        <span key={i} className="tag tag-red" style={{ fontSize: "0.72rem" }}>+ {kw}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Priority Additions */}
              {jdMatchResult.priorityAdditions && jdMatchResult.priorityAdditions.length > 0 && (
                <div style={{ background: "rgba(255, 101, 132, 0.04)", border: "1px solid rgba(255, 101, 132, 0.2)", padding: "1rem", borderRadius: "10px" }}>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#ff6584", margin: "0 0 0.5rem" }}>
                    🚨 High Priority Additions
                  </h4>
                  {jdMatchResult.priorityAdditions.map((item, idx) => (
                    <div key={idx} style={{ fontSize: "0.82rem", color: "var(--text)", display: "flex", gap: "0.5rem", marginBottom: "0.3rem" }}>
                      <span>•</span><span>{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Rewrite Section */}
            <div className="card" style={{ display: "grid", gap: "1.2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.15rem", margin: 0 }}>
                  ✨ AI-Powered Rewrites
                </h2>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {acceptedRewrites.size} / {rewriteTargets.length} sections updated
                </span>
              </div>

              <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", margin: 0, lineHeight: 1.5 }}>
                Click <strong>"✨ Generate Rewrites"</strong> on any section below. The AI will create 3 variations tailored to the job description. Click <strong>"✅ Accept"</strong> to instantly update your resume.
              </p>

              {rewriteTargets.length === 0 && (
                <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                  No rewritable sections found in this resume.
                </div>
              )}

              {rewriteTargets.map((target) => {
                const key = getTargetKey(target);
                const isLoading = rewriteLoading[key] || false;
                const suggestions = rewriteSuggestions[key] || [];
                const isAccepted = acceptedRewrites.has(key);

                const sectionLabel =
                  target.field === "summary"
                    ? "Professional Summary"
                    : `${selectedResume.resume_data.workExperience[target.index!]?.company || "Company"} — Bullet ${(target.bulletIndex || 0) + 1}`;

                return (
                  <div
                    key={key}
                    style={{
                      border: `1px solid ${isAccepted ? "rgba(67, 233, 123, 0.3)" : "var(--border)"}`,
                      borderRadius: "10px",
                      padding: "1rem",
                      background: isAccepted ? "rgba(67, 233, 123, 0.03)" : "var(--bg-2)",
                      transition: "all 0.3s",
                    }}
                  >
                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                      <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                        {sectionLabel}
                        {isAccepted && <span style={{ color: "#43e97b", marginLeft: "0.4rem" }}>✓ Updated</span>}
                      </span>
                      {!isAccepted && (
                        <button
                          className="btn-secondary"
                          disabled={isLoading}
                          onClick={() => handleRewrite(target)}
                          style={{
                            fontSize: "0.78rem",
                            padding: "0.35rem 0.8rem",
                            borderColor: "var(--accent)",
                            color: "var(--accent)",
                          }}
                        >
                          {isLoading ? (
                            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                              <span className="spinner" style={{ width: 12, height: 12 }} />
                              Generating...
                            </span>
                          ) : (
                            "✨ Generate Rewrites"
                          )}
                        </button>
                      )}
                    </div>

                    {/* Original text */}
                    <div style={{
                      fontSize: "0.85rem",
                      color: "var(--text)",
                      lineHeight: 1.5,
                      padding: "0.6rem 0.8rem",
                      background: "var(--bg)",
                      borderRadius: "6px",
                      border: "1px solid var(--border)",
                      marginBottom: suggestions.length > 0 ? "0.8rem" : 0,
                    }}>
                      {target.original}
                    </div>

                    {/* Suggestions */}
                    {suggestions.length > 0 && (
                      <div style={{ display: "grid", gap: "0.5rem" }}>
                        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase" }}>
                          AI Suggestions — click to accept:
                        </span>
                        {suggestions.map((suggestion, sIdx) => (
                          <div
                            key={sIdx}
                            onClick={() => handleAccept(target, suggestion)}
                            style={{
                              fontSize: "0.85rem",
                              lineHeight: 1.5,
                              padding: "0.7rem 0.9rem",
                              background: "rgba(108, 99, 255, 0.04)",
                              border: "1px solid rgba(108, 99, 255, 0.15)",
                              borderRadius: "8px",
                              cursor: "pointer",
                              transition: "all 0.2s",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              gap: "0.5rem",
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent)";
                              (e.currentTarget as HTMLDivElement).style.background = "rgba(108, 99, 255, 0.08)";
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(108, 99, 255, 0.15)";
                              (e.currentTarget as HTMLDivElement).style.background = "rgba(108, 99, 255, 0.04)";
                            }}
                          >
                            <span>{suggestion}</span>
                            <button
                              className="btn-primary"
                              style={{
                                fontSize: "0.72rem",
                                padding: "0.25rem 0.6rem",
                                whiteSpace: "nowrap",
                                flexShrink: 0,
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAccept(target, suggestion);
                              }}
                            >
                              ✅ Accept
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Save & Download */}
            {acceptedRewrites.size > 0 && (
              <div className="card" style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1.2rem 1.5rem",
                background: "linear-gradient(135deg, rgba(108, 99, 255, 0.06) 0%, var(--card) 100%)",
                border: "1px solid rgba(108, 99, 255, 0.2)",
                flexWrap: "wrap",
                gap: "1rem",
              }}>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: "0 0 0.2rem" }}>
                    {saveSuccess ? "✅ Resume Updated!" : `${acceptedRewrites.size} section(s) rewritten`}
                  </h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", margin: 0 }}>
                    {saveSuccess
                      ? "Your tailored resume has been saved. You can now download or edit it further."
                      : "Save your tailored resume to persist the changes and download the updated PDF."}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "0.6rem" }}>
                  <button
                    className="btn-primary"
                    disabled={saving}
                    onClick={handleSave}
                    style={{ padding: "0.6rem 1.5rem", fontSize: "0.88rem" }}
                  >
                    {saving ? "Saving..." : saveSuccess ? "✓ Saved" : "💾 Save Tailored Resume"}
                  </button>
                  {saveSuccess && (
                    <button
                      className="btn-secondary"
                      onClick={() => router.push(`/resume/builder?id=${selectedResume.id}`)}
                      style={{ padding: "0.6rem 1.2rem", fontSize: "0.88rem" }}
                    >
                      ✏️ Edit in Builder
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      </div>

      {/* Right Panel: Live Preview */}
        {showPreview && selectedResume && (
          <div style={{ 
            flex: "1 1 50%", 
            background: "var(--bg-3)", 
            borderLeft: "1px solid var(--border)", 
            display: "flex", 
            flexDirection: "column",
            overflow: "hidden"
          }}>
            <div style={{ padding: "1rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem", background: "var(--bg-2)" }}>
              <button onClick={() => setZoomFactor(prev => Math.max(0.5, prev - 0.05))} className="btn-secondary" style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}>Zoom -</button>
              <input 
                type="range" 
                min="0.5" 
                max="1.2" 
                step="0.05" 
                value={zoomFactor}
                onChange={(e) => setZoomFactor(parseFloat(e.target.value))}
                style={{ width: "100px", accentColor: "var(--accent)" }}
              />
              <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{Math.round(zoomFactor * 100)}%</span>
              <button onClick={() => setZoomFactor(prev => Math.min(1.2, prev + 0.05))} className="btn-secondary" style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}>Zoom +</button>
            </div>
            
            <div style={{ flex: 1, overflowY: "auto", padding: "2rem", display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
              <div className="resume-paper resume-print-area" style={{ 
                transform: `scale(${zoomFactor})`, 
                transformOrigin: "top center",
                background: "#ffffff", 
                color: "#333333", 
                padding: "40px", 
                width: "100%",
                minHeight: "297mm",
                maxWidth: "800px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                borderRadius: "4px",
                transition: "transform 0.15s ease-out",
              }}>
                <ResumeRenderer data={selectedResume.resume_data} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
