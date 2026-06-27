"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ConcentricLoader, { ClassicLoader } from "@/components/ui/Loader";
import { useAuth } from "@/hooks/useAuth";
import { ATSScore, ContentReview, JDMatch } from "@/types";

type Step = "upload" | "analyzing" | "results";

interface LoadingStage {
  label: string;
  minPercent: number;
  maxPercent: number;
}

const localStages: LoadingStage[] = [
  { label: "Stage 1: Parsing raw resume layout & text headers...", minPercent: 0, maxPercent: 25 },
  { label: "Stage 2: Segmenting structure (Summary, Work, Education)...", minPercent: 25, maxPercent: 50 },
  { label: "Stage 3: Extracting technical & soft skills...", minPercent: 50, maxPercent: 75 },
  { label: "Stage 4: Calibrating local ATS formatting & keywords...", minPercent: 75, maxPercent: 100 },
];

const deepStages: LoadingStage[] = [
  { label: "✦ Handshaking with strictly-free AI reasoning models...", minPercent: 0, maxPercent: 25 },
  { label: "✦ Rewriting experience bullets with active action verbs & metrics...", minPercent: 25, maxPercent: 55 },
  { label: "✦ Performing semantic keyword match against Job Description...", minPercent: 55, maxPercent: 80 },
  { label: "✦ Generating professional CV summary & gap recommendations...", minPercent: 80, maxPercent: 100 },
];

export default function UploadPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<Step>("upload");
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  
  // Scoring / Details states
  const [atsScore, setAtsScore] = useState<ATSScore | null>(null);
  const [contentReview, setContentReview] = useState<ContentReview | null>(null);
  const [jdMatch, setJdMatch] = useState<JDMatch | null>(null);
  
  const [activeTab, setActiveTab] = useState<"ats" | "content" | "jd">("ats");
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [parsing, setParsing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Dynamic Pipeline Progress Loader states
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("");

  // Deep AI loader states
  const [deepLoading, setDeepLoading] = useState(false);
  const [deepProgress, setDeepProgress] = useState(0);
  const [deepText, setDeepText] = useState("");
  const [deepError, setDeepError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  const handleFile = async (file: File) => {
    setError("");
    if (!file) return;

    const allowedTypes = ["application/pdf", "text/plain"];
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    
    if (!allowedTypes.includes(file.type) && fileExtension !== "txt" && fileExtension !== "pdf") {
      setError("Unsupported file format. Please upload a PDF or TXT file.");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError("File is too large. Maximum supported size is 5MB.");
      return;
    }

    setParsing(true);
    setFileName(file.name);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/parse-resume", { method: "POST", body: formData });
      
      if (!res.ok) {
        throw new Error(`Server returned error status: ${res.status}`);
      }
      
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setParsing(false);
        return;
      }
      setResumeText(data.text);
      setFileName(data.fileName);
    } catch (err: any) {
      console.error(err);
      setError("Failed to parse the file. Please check your network or try pasting text.");
    } finally {
      setParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (parsing) return;
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  // Ultra-fast Local Intelligence parser
  const runAnalysis = async () => {
    if (!resumeText) return;
    setStep("analyzing");
    setError("");
    setSavedId(null);
    setLoadingProgress(0);

    // Dynamic state variables for custom animation intervals
    let animPercent = 0;
    let animInterval: NodeJS.Timeout;

    try {
      // Start local calculation API request in background immediately
      const apiPromise = fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, fileName }),
      });

      // Animate loader smoothly over 1.2s to reflect multi-stage engine pipeline
      animInterval = setInterval(() => {
        animPercent += 1;
        if (animPercent > 99) {
          animPercent = 99; // Cap at 99% until API request fully completes
        }
        setLoadingProgress(animPercent);

        // Map percentage to active stage description
        const activeStage = localStages.find(
          (s) => animPercent >= s.minPercent && animPercent < s.maxPercent
        );
        if (activeStage) {
          setLoadingText(activeStage.label);
        }
      }, 12);

      const response = await apiPromise;
      if (!response.ok) {
        throw new Error("Failed to process local resume analysis. Please verify your connection.");
      }

      const row = await response.json();
      if (row.error) {
        throw new Error(row.error);
      }

      // Finish animation rapidly
      clearInterval(animInterval);
      setLoadingProgress(100);
      setLoadingText("✓ Pipeline local scoring completed!");

      // Set state variables
      setAtsScore(row.ats_score);
      setSavedId(row.id);
      
      // Delay transition to results slightly for maximum tactile satisfaction
      setTimeout(() => {
        setStep("results");
        setActiveTab("ats");
      }, 250);

    } catch (err: any) {
      clearInterval(animInterval!);
      console.error(err);
      setError(err.message || "Local analysis failed. Please try again.");
      setStep("upload");
    }
  };

  // Consolidating heavy AI enhancements on-demand
  const runDeepAI = async () => {
    if (!savedId) return;
    setDeepLoading(true);
    setDeepError("");
    setDeepProgress(0);

    let animPercent = 0;
    const animInterval = setInterval(() => {
      animPercent += 1;
      if (animPercent > 98) {
        animPercent = 98;
      }
      setDeepProgress(animPercent);

      const activeStage = deepStages.find(
        (s) => animPercent >= s.minPercent && animPercent < s.maxPercent
      );
      if (activeStage) {
        setDeepText(activeStage.label);
      }
    }, 55); // Slower pacing to match deep AI processing speed

    try {
      const res = await fetch("/api/analyze-resume/deep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: savedId, jobDescription }),
      });

      if (!res.ok) {
        throw new Error("Deep AI enhancer server error. Free endpoints might be busy. Please retry.");
      }

      const updatedRow = await res.json();
      if (updatedRow.error) {
        throw new Error(updatedRow.error);
      }

      clearInterval(animInterval);
      setDeepProgress(100);
      setDeepText("✓ Deep AI Enhancements integrated successfully!");

      // Set updated scores/feedback
      setContentReview(updatedRow.content_review);
      setJdMatch(updatedRow.jd_match);

      setTimeout(() => {
        setDeepLoading(false);
        // Switch tab to let them see the new content immediately!
        setActiveTab("content");
      }, 350);

    } catch (err: any) {
      clearInterval(animInterval);
      console.error(err);
      setDeepError(err.message || "Deep AI analysis encountered an error. Please try again.");
      setDeepLoading(false);
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
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <div style={{ maxWidth: "950px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>

        <div style={{ marginBottom: "2rem" }}>
          <p className="section-label" style={{ marginBottom: "0.5rem" }}>Resume Hybrid Intelligence</p>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "2.2rem", fontWeight: 800 }}>
            Upload & Engine Optimizer
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
            Parsed locally at zero cost. Unlock advanced AI bullet rewrites and JD alignment checks on demand.
          </p>
        </div>

        {/* STEP 1: Upload Portal */}
        {step === "upload" && (
          <div style={{ display: "grid", gap: "1.5rem", animation: "fadeInUp 0.4s ease" }}>
            {/* Drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => !parsing && fileRef.current?.click()}
              style={{
                border: "2px dashed var(--border-light)",
                borderRadius: "20px",
                padding: "4rem 2rem",
                textAlign: "center",
                cursor: parsing ? "not-allowed" : "pointer",
                transition: "all 0.2s ease-in-out",
                background: resumeText ? "rgba(67,233,123,0.03)" : "var(--card)",
                boxShadow: resumeText ? "0 0 25px rgba(67,233,123,0.05)" : "none",
              }}
              onMouseEnter={(e) => !parsing && (e.currentTarget.style.borderColor = "var(--accent)")}
              onMouseLeave={(e) => !parsing && (e.currentTarget.style.borderColor = resumeText ? "#43e97b" : "var(--border-light)")}
            >
              <input ref={fileRef} type="file" accept=".pdf,.txt" style={{ display: "none" }} onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} disabled={parsing} />
              {parsing ? (
                <>
                  <ClassicLoader className="mx-auto mb-4 h-9 w-9" />
                  <div style={{ fontWeight: 600, fontSize: "1.05rem", marginBottom: "0.25rem" }}>Extracting document layout...</div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Reading text from {fileName}</div>
                </>
              ) : resumeText ? (
                <>
                  <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>✨</div>
                  <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#43e97b", marginBottom: "0.25rem" }}>{fileName} loaded!</div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Click or drop to replace this document</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: "3.2rem", marginBottom: "0.75rem" }}>📥</div>
                  <div style={{ fontWeight: 700, fontSize: "1.15rem", marginBottom: "0.4rem" }}>Drag & Drop Resume</div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>Supports PDF or TXT — click to browse filesystem</div>
                </>
              )}
            </div>

            {error && <div style={{ color: "#ff6584", fontSize: "0.88rem", padding: "0.9rem 1.2rem", background: "rgba(255,101,132,0.08)", borderRadius: "10px", borderLeft: "4px solid #ff6584" }}>{error}</div>}

            {/* Paste text area */}
            <div className="card">
              <p className="section-label" style={{ marginBottom: "0.75rem" }}>Or paste CV text directly</p>
              <textarea
                className="input"
                rows={6}
                placeholder="Paste your raw text layout here to parse without document extraction..."
                value={resumeText}
                onChange={(e) => { setResumeText(e.target.value); setFileName("Pasted Resume Data"); }}
                disabled={parsing}
                style={{ fontSize: "0.88rem", lineHeight: 1.6 }}
              />
            </div>

            {/* Optional JD */}
            <div className="card">
              <p className="section-label" style={{ marginBottom: "0.5rem" }}>Target Job Description (Optional)</p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: "0.75rem" }}>Provides semantic match scoring and identifies keyword gaps compared to specific postings</p>
              <textarea
                className="input"
                rows={4}
                placeholder="Paste the target job posting details here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                disabled={parsing}
                style={{ fontSize: "0.88rem", lineHeight: 1.6 }}
              />
            </div>

            <button className="btn-primary" onClick={runAnalysis} disabled={!resumeText || parsing} style={{ alignSelf: "flex-start", padding: "1rem 2.2rem", fontSize: "0.95rem" }}>
              ✦ Analyze Resume (Free Local Check)
            </button>
          </div>
        )}

        {/* STEP 2: Custom Multi-Stage Loading Pipeline */}
        {step === "analyzing" && (
          <div style={{ textAlign: "center", padding: "5rem 2rem", background: "var(--card)", borderRadius: "20px", border: "1px solid var(--border)", animation: "fadeInUp 0.3s ease" }}>
            <ConcentricLoader className="mb-4" />
            
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.6rem", marginBottom: "0.5rem" }}>
              Hybrid Engine Analyzing
            </h2>
            <p style={{ color: "var(--accent)", fontWeight: 600, fontSize: "0.95rem", marginBottom: "2rem" }}>
              {loadingText}
            </p>

            {/* Premium progress bar */}
            <div style={{ maxWidth: "450px", margin: "0 auto", height: "8px", background: "var(--bg-3)", borderRadius: "4px", overflow: "hidden", border: "1px solid var(--border)" }}>
              <div 
                style={{ 
                  height: "100%", 
                  width: `${loadingProgress}%`, 
                  background: "linear-gradient(90deg, var(--accent) 0%, var(--accent-2) 50%, var(--accent-3) 100%)", 
                  borderRadius: "4px", 
                  transition: "width 0.1s linear",
                  boxShadow: "0 0 12px var(--accent-glow)"
                }} 
              />
            </div>
            <div style={{ marginTop: "0.75rem", fontSize: "0.82rem", color: "var(--text-muted)" }}>
              Processing at {loadingProgress}% completeness
            </div>
          </div>
        )}

        {/* STEP 3: Multi-Tab Local/Deep Results */}
        {step === "results" && (
          <div style={{ display: "grid", gap: "1.5rem", animation: "fadeInUp 0.4s ease" }}>
            
            {/* Database saved confirmation bar */}
            {savedId && (
              <div 
                className="card glow" 
                style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  flexWrap: "wrap", 
                  gap: "1rem", 
                  borderLeft: "4px solid #43e97b",
                  background: "rgba(67,233,123,0.04)"
                }}
              >
                <div>
                  <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#43e97b", marginBottom: "0.25rem" }}>
                    ✦ Parsed & Saved Successfully
                  </h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    Local parameters and score inserted into your dashboard historical records
                  </p>
                </div>
                <Link href={`/resume/${savedId}`} style={{ textDecoration: "none" }}>
                  <button className="btn-secondary" style={{ padding: "0.6rem 1.2rem", fontSize: "0.88rem" }}>
                    Details Link ↗
                  </button>
                </Link>
              </div>
            )}

            {/* Dynamic Score Overview Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.2rem" }}>
              {atsScore && (
                <div className="card" style={{ textAlign: "center", background: "linear-gradient(180deg, var(--card) 0%, rgba(20,20,30,0.8) 100%)" }}>
                  <p className="section-label" style={{ marginBottom: "0.5rem" }}>Local ATS Score</p>
                  <div style={{ fontSize: "2.8rem", fontWeight: 800, fontFamily: "Syne, sans-serif", color: getScoreColor(atsScore.overall) }}>
                    {atsScore.overall}
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>Completeness & structure index</div>
                </div>
              )}

              {/* JD Match score displays if deep AI run completed it, otherwise promotional lock banner */}
              <div className="card" style={{ textAlign: "center", position: "relative", overflow: "hidden" }}>
                <p className="section-label" style={{ marginBottom: "0.5rem" }}>AI JD Match</p>
                {jdMatch ? (
                  <>
                    <div style={{ fontSize: "2.8rem", fontWeight: 800, fontFamily: "Syne, sans-serif", color: getScoreColor(jdMatch.matchScore) }}>
                      {jdMatch.matchScore}%
                    </div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>Semantic match rate</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: "1.8rem", fontWeight: 800, fontFamily: "Syne, sans-serif", margin: "0.6rem 0", color: "var(--text-muted)", opacity: 0.6 }}>
                      🔒 Locked
                    </div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>Run Stage 4 Deep AI Analysis</div>
                  </>
                )}
              </div>

              {atsScore && (
                <div className="card" style={{ textAlign: "center" }}>
                  <p className="section-label" style={{ marginBottom: "0.5rem" }}>Unresolved Keywords</p>
                  <div style={{ fontSize: "2.8rem", fontWeight: 800, fontFamily: "Syne, sans-serif", color: atsScore.missingKeywords.length > 0 ? "#ff6584" : "#43e97b" }}>
                    {atsScore.missingKeywords.length}
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>Standard items to add</div>
                </div>
              )}
            </div>

            {/* DEEP AI ANALYZING PROGRESS COMPONENT */}
            {deepLoading && (
              <div style={{ padding: "2.5rem", border: "1px solid var(--accent)", background: "rgba(108,99,255,0.06)", borderRadius: "16px", textAlign: "center" }}>
                <ConcentricLoader className="mb-2" />
                <h4 style={{ fontFamily: "Syne, sans-serif", color: "var(--text)", fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.4rem" }}>
                  Injecting Deep AI Knowledge
                </h4>
                <p style={{ color: "var(--accent)", fontSize: "0.88rem", fontWeight: 500, marginBottom: "1.2rem" }}>
                  {deepText}
                </p>
                <div style={{ width: "100%", maxWidth: "350px", margin: "0 auto", height: "6px", background: "var(--bg-3)", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${deepProgress}%`, background: "var(--accent)", transition: "width 0.2s ease" }} />
                </div>
              </div>
            )}

            {/* Deep AI error fallback banner */}
            {deepError && (
              <div style={{ color: "#ff6584", fontSize: "0.88rem", padding: "0.9rem 1.2rem", background: "rgba(255,101,132,0.08)", borderRadius: "10px", borderLeft: "4px solid #ff6584" }}>
                {deepError}
              </div>
            )}

            {/* STAGE 4 PROMOTIONAL CARD - Renders only if Deep AI has NOT run yet */}
            {!contentReview && !deepLoading && (
              <div 
                className="card glow" 
                style={{ 
                  border: "1px dashed var(--accent)", 
                  background: "linear-gradient(135deg, rgba(108, 99, 255, 0.08) 0%, rgba(19, 19, 30, 0.9) 100%)", 
                  padding: "2rem", 
                  borderRadius: "16px",
                  boxShadow: "0 0 40px rgba(108, 99, 255, 0.1)"
                }}
              >
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "1.5rem" }}>
                  <div style={{ flex: "1 1 500px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.6rem" }}>
                      <span style={{ background: "var(--accent)", color: "#fff", fontSize: "0.7rem", fontWeight: 800, padding: "0.2rem 0.6rem", borderRadius: "4px", textTransform: "uppercase" }}>
                        Stage 4 AI
                      </span>
                      <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.3rem", color: "var(--text)" }}>
                        ✦ Run Deep AI Analysis & Bullet Rewriter
                      </h3>
                    </div>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: 1.6, marginBottom: "1.2rem" }}>
                      Submit your resume to our high-reasoning AI enhancement layer. This will analyze your active bullet points, replace weak descriptors with executive action verbs, calculate quantified impact metrics, and run a complete keyword gap analysis against your target Job Description.
                    </p>

                    {/* Inline Job Description editor before firing Deep AI */}
                    <div style={{ marginBottom: "1.2rem" }}>
                      <label style={{ display: "block", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700, color: "var(--text-muted)", marginBottom: "0.4rem" }}>
                        Target Job Description (Required for JD matching)
                      </label>
                      <textarea
                        className="input"
                        rows={3}
                        placeholder="Paste target job posting keywords or description here..."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        style={{ background: "rgba(0,0,0,0.25)", borderColor: "var(--border-light)", fontSize: "0.85rem" }}
                      />
                    </div>
                  </div>

                  <div style={{ flex: "0 0 auto", minWidth: "150px" }}>
                    <button 
                      onClick={runDeepAI}
                      className="btn-primary"
                      style={{ 
                        padding: "1rem 2rem", 
                        fontSize: "0.95rem", 
                        background: "linear-gradient(135deg, #6c63ff 0%, #ff6584 100%)",
                        boxShadow: "0 4px 20px rgba(108, 99, 255, 0.4)",
                        border: "none",
                        fontWeight: 700
                      }}
                    >
                      ✦ Activate Deep AI
                    </button>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center", marginTop: "0.5rem" }}>
                      Uses strictly-free models
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Results Navigation Tabs */}
            <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "0" }}>
              {[
                { key: "ats", label: "ATS Analysis" },
                { key: "content", label: "Content Review (Deep AI)" },
                { key: "jd", label: "JD Match (Deep AI)" },
              ].map((tab) => {
                const isDeepLocked = (tab.key === "content" || tab.key === "jd") && !contentReview;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    style={{
                      padding: "0.75rem 1.4rem",
                      background: "transparent",
                      border: "none",
                      borderBottom: activeTab === tab.key ? "2px solid var(--accent)" : "2px solid transparent",
                      color: activeTab === tab.key 
                        ? "var(--accent)" 
                        : isDeepLocked ? "var(--text-dim)" : "var(--text-muted)",
                      fontFamily: "DM Sans, sans-serif",
                      fontWeight: 600,
                      fontSize: "0.88rem",
                      cursor: "pointer",
                      marginBottom: "-1px",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      opacity: isDeepLocked ? 0.6 : 1
                    }}
                  >
                    {isDeepLocked && <span style={{ fontSize: "0.8rem" }}>🔒</span>}
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* ATS TAB PANEL */}
            {activeTab === "ats" && atsScore && (
              <div style={{ display: "grid", gap: "1.2rem", animation: "fadeInUp 0.3s ease" }}>
                <div className="card">
                  <p className="section-label" style={{ marginBottom: "1.2rem" }}>Score Breakdown</p>
                  {Object.entries(atsScore.breakdown).map(([key, val]) => (
                    <div key={key} style={{ marginBottom: "1rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                        <span style={{ fontSize: "0.88rem", textTransform: "capitalize", fontWeight: 500 }}>{key}</span>
                        <span style={{ fontSize: "0.88rem", fontWeight: 700, color: getScoreColor(val) }}>{val}/100</span>
                      </div>
                      <div style={{ height: 8, background: "var(--bg-3)", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${val}%`, background: getScoreColor(val), borderRadius: 4 }} />
                      </div>
                    </div>
                  ))}
                </div>
                
                {atsScore.missingKeywords.length > 0 && (
                  <div className="card">
                    <p className="section-label" style={{ marginBottom: "0.8rem" }}>Standard Recommended Keywords</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                      {atsScore.missingKeywords.map((kw) => <span key={kw} className="tag tag-red">{kw}</span>)}
                    </div>
                  </div>
                )}

                <div className="card">
                  <p className="section-label" style={{ marginBottom: "0.8rem" }}>Structural Optimizations</p>
                  {atsScore.suggestions.map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: "0.75rem", marginBottom: "0.6rem", alignItems: "flex-start" }}>
                      <span style={{ color: "var(--accent)", marginTop: "1px" }}>→</span>
                      <span style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CONTENT REVIEW PANEL (Deep AI) */}
            {activeTab === "content" && (
              !contentReview ? (
                /* Prompts deep AI run if they click locked tab directly */
                <div className="card" style={{ textAlign: "center", padding: "4rem 2rem", border: "1px dashed var(--border)" }}>
                  <div style={{ fontSize: "2.8rem", marginBottom: "1rem" }}>✍️</div>
                  <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, marginBottom: "0.5rem" }}>Deep AI Content Review Locked</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", maxWidth: "450px", margin: "0 auto 1.5rem", lineHeight: 1.5 }}>
                    Generate structured feedback, bullet point metrics adjustments, and active action verb suggestions using strictly-free LLMs.
                  </p>
                  <button onClick={runDeepAI} className="btn-primary" disabled={deepLoading}>
                    ✦ Run Deep AI Analysis Now
                  </button>
                </div>
              ) : (
                <div style={{ display: "grid", gap: "1.2rem", animation: "fadeInUp 0.3s ease" }}>
                  <div className="card" style={{ borderLeft: "4px solid var(--accent)" }}>
                    <p className="section-label" style={{ marginBottom: "0.5rem" }}>Overall Feedback & Strategic Audit</p>
                    <p style={{ color: "var(--text-muted)", lineHeight: 1.6, fontSize: "0.92rem" }}>{contentReview.overallFeedback}</p>
                  </div>

                  <div className="responsive-grid-2" style={{ gap: "1rem" }}>
                    <div className="card">
                      <p className="section-label" style={{ marginBottom: "0.75rem", color: "var(--accent)" }}>Executive Action Verbs</p>
                      {contentReview.actionVerbSuggestions?.map((s, i) => (
                        <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                          <span>•</span> <span>{s}</span>
                        </div>
                      ))}
                    </div>
                    <div className="card">
                      <p className="section-label" style={{ marginBottom: "0.75rem", color: "var(--accent-2)" }}>Quantified Impact Recommendations</p>
                      {contentReview.quantificationTips?.map((s, i) => (
                        <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                          <span>•</span> <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {contentReview.sections.map((sec, i) => (
                    <div key={i} className="card">
                      <h4 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.05rem", marginBottom: "0.75rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.4rem" }}>
                        {sec.section}
                      </h4>
                      {sec.issues.length > 0 && (
                        <div style={{ marginBottom: "0.75rem" }}>
                          <p className="section-label" style={{ marginBottom: "0.4rem", color: "#ff6584" }}>Weaknesses Identified</p>
                          {sec.issues.map((issue, j) => <div key={j} style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>• {issue}</div>)}
                        </div>
                      )}
                      {sec.suggestions.length > 0 && (
                        <div style={{ marginBottom: "0.75rem" }}>
                          <p className="section-label" style={{ marginBottom: "0.4rem", color: "#43e97b" }}>Optimization Steps</p>
                          {sec.suggestions.map((sug, j) => <div key={j} style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>→ {sug}</div>)}
                        </div>
                      )}
                      {sec.improvedVersion && (
                        <div style={{ marginTop: "1rem", padding: "1rem", background: "rgba(108,99,255,0.06)", borderRadius: 10, borderLeft: "3px solid var(--accent)" }}>
                          <p className="section-label" style={{ marginBottom: "0.4rem", color: "var(--accent)" }}>Rewritten Professional Draft</p>
                          <p style={{ fontSize: "0.88rem", color: "var(--text)", lineHeight: 1.5, fontStyle: "italic" }}>"{sec.improvedVersion}"</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            )}

            {/* JD MATCH TAB PANEL */}
            {activeTab === "jd" && (
              !contentReview ? (
                <div className="card" style={{ textAlign: "center", padding: "4rem 2rem", border: "1px dashed var(--border)" }}>
                  <div style={{ fontSize: "2.8rem", marginBottom: "1rem" }}>🎯</div>
                  <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, marginBottom: "0.5rem" }}>Job Description Match Locked</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", maxWidth: "450px", margin: "0 auto 1.5rem", lineHeight: 1.5 }}>
                    Check your keyword matches, find exact priority skills missing, and align your resume structurally to standard postings.
                  </p>
                  <button onClick={runDeepAI} className="btn-primary" disabled={deepLoading}>
                    ✦ Run Deep AI Analysis Now
                  </button>
                </div>
              ) : !jdMatch ? (
                <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>💡</div>
                  <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, marginBottom: "0.5rem" }}>No Job Description Supplied</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.2rem" }}>
                    Please input a job description inside the box above and run the analyzer to get detailed semantic matching details.
                  </p>
                </div>
              ) : (
                <div style={{ display: "grid", gap: "1.2rem", animation: "fadeInUp 0.3s ease" }}>
                  
                  <div className="responsive-grid-2" style={{ gap: "1.2rem" }}>
                    <div className="card">
                      <p className="section-label" style={{ marginBottom: "0.75rem", color: "var(--accent-2)" }}>Priority Keywords Missing</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {jdMatch.priorityAdditions?.map((kw) => <span key={kw} className="tag tag-red">{kw}</span>)}
                        {jdMatch.priorityAdditions?.length === 0 && <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>0 critical skills missing! Excellent match.</span>}
                      </div>
                    </div>

                    <div className="card">
                      <p className="section-label" style={{ marginBottom: "0.75rem", color: "var(--accent-3)" }}>Matched Keywords</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {jdMatch.matchedKeywords?.map((kw) => <span key={kw} className="tag tag-green">{kw}</span>)}
                        {jdMatch.matchedKeywords?.length === 0 && <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>No matching keywords found.</span>}
                      </div>
                    </div>
                  </div>

                  {jdMatch.missingKeywords?.length > 0 && (
                    <div className="card">
                      <p className="section-label" style={{ marginBottom: "0.75rem" }}>All Detected JD Skill Gaps</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {jdMatch.missingKeywords.map((kw) => <span key={kw} className="tag tag-yellow">{kw}</span>)}
                      </div>
                    </div>
                  )}

                  <div className="card">
                    <p className="section-label" style={{ marginBottom: "0.75rem" }}>Alignment Recommendations</p>
                    {jdMatch.suggestions.map((s, i) => (
                      <div key={i} style={{ display: "flex", gap: "0.75rem", marginBottom: "0.6rem", alignItems: "flex-start" }}>
                        <span style={{ color: "var(--accent)", marginTop: "1px" }}>→</span>
                        <span style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}

            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <button 
                className="btn-secondary" 
                onClick={() => { 
                  setStep("upload"); 
                  setAtsScore(null); 
                  setContentReview(null); 
                  setJdMatch(null); 
                  setResumeText(""); 
                  setFileName(""); 
                }}
              >
                ← Analyze Another Resume
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
