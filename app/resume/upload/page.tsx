"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ConcentricLoader, { ClassicLoader } from "@/components/ui/Loader";
import { useAuth } from "@/hooks/useAuth";
import { ATSScore } from "@/types";
import { UploadCloud, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/toast-1";

// New Comprehensive Architecture Imports
import { ResumeSuggestion } from "@/lib/types/comprehensive-suggestions";
import { groupSuggestions } from "@/lib/suggestions/categorize";
import { ImprovementCategory } from "@/components/ImprovementCategory";
import { ComprehensivePreview } from "@/components/ComprehensivePreview";

type Step = "upload" | "analyzing" | "results" | "applied";

interface LoadingStage {
  label: string;
  minPercent: number;
  maxPercent: number;
}

const localStages: LoadingStage[] = [
  { label: "Stage 1: Parsing raw resume layout & text headers...", minPercent: 0, maxPercent: 20 },
  { label: "Stage 2: Segmenting structure (Summary, Work, Education)...", minPercent: 20, maxPercent: 40 },
  { label: "Stage 3: Calibrating local ATS formatting...", minPercent: 40, maxPercent: 60 },
  { label: "Stage 4: Comprehensive AI Engine (12-dimensions)...", minPercent: 60, maxPercent: 100 },
];

export default function UploadPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [step, setStep] = useState<Step>("upload");
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  
  const [atsScore, setAtsScore] = useState<ATSScore | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [parsing, setParsing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Comprehensive Suggestions States
  const [suggestions, setSuggestions] = useState<ResumeSuggestion[]>([]);
  const [selectedSuggestionIds, setSelectedSuggestionIds] = useState<Set<string>>(new Set());
  const [isApplying, setIsApplying] = useState(false);

  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("");

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

  const runAnalysis = async () => {
    if (!resumeText) return;
    setStep("analyzing");
    setError("");
    setSavedId(null);
    setLoadingProgress(0);

    let animPercent = 0;
    let animInterval: NodeJS.Timeout;

    try {
      // Step 1: Local parsing & save
      const apiPromise = fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, fileName }),
      });

      animInterval = setInterval(() => {
        animPercent += 1;
        if (animPercent > 99) {
          animPercent = 99;
        }
        setLoadingProgress(animPercent);

        const activeStage = localStages.find(
          (s) => animPercent >= s.minPercent && animPercent < s.maxPercent
        );
        if (activeStage) {
          setLoadingText(activeStage.label);
        }
      }, 50); // Slightly slower to account for deep AI

      const response = await apiPromise;
      if (!response.ok) {
        throw new Error("Failed to process local resume analysis. Please verify your connection.");
      }

      const row = await response.json();
      if (row.error) {
        throw new Error(row.error);
      }

      setAtsScore(row.ats_score);
      setSavedId(row.id);
      
      // Step 2: Comprehensive AI Analysis
      if (row.ats_score?.overall < 100) {
        try {
          // Slow down animation for deep AI stage
          clearInterval(animInterval);
          animInterval = setInterval(() => {
            if (animPercent < 98) animPercent += 0.5;
            setLoadingProgress(Math.floor(animPercent));
            setLoadingText("Stage 4: Comprehensive AI Engine running (This may take up to 20s)...");
          }, 200);

          const sugRes = await fetch("/api/resume/suggestions/comprehensive-analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              resumeId: row.id,
              resumeText: resumeText,
              detectedRole: row.ats_score?.detectedRole,
              detectedIndustry: row.ats_score?.detectedIndustry
            })
          });
          
          if (sugRes.ok) {
            const sugData = await sugRes.json();
            if (sugData.suggestions && sugData.suggestions.length > 0) {
              setSuggestions(sugData.suggestions);
              // Auto-select High Priority items (4 & 5 stars)
              const initialSelected = new Set<string>();
              sugData.suggestions.forEach((s: ResumeSuggestion) => {
                if (s.priority >= 4) initialSelected.add(s.id);
              });
              setSelectedSuggestionIds(initialSelected);
            }
          } else {
            const errText = await sugRes.text();
            console.warn("Comprehensive API returned error:", sugRes.status, errText);
            let errData: any = {};
            try { errData = JSON.parse(errText); } catch(e) {}
            if (errData.error && errData.error.includes("Database error")) {
               setError("Notice: The 'resume_improvement_suggestions' table is missing in Supabase.");
            } else if (errData.error) {
               setError(`AI Analysis Error: ${errData.error}`);
            } else {
               setError(`Failed to generate AI suggestions. Please try again. (Status ${sugRes.status})`);
            }
          }
        } catch (sugErr) {
          console.warn("Failed to generate comprehensive suggestions:", sugErr);
        }
      }

      clearInterval(animInterval);
      setLoadingProgress(100);
      setLoadingText("✓ Complete!");

      setTimeout(() => {
        setStep("results");
      }, 300);

    } catch (err: any) {
      clearInterval(animInterval!);
      console.error(err);
      setError(err.message || "Local analysis failed. Please try again.");
      setStep("upload");
    }
  };

  const handleApplySuggestions = async () => {
    if (selectedSuggestionIds.size === 0 || !savedId) return;
    setIsApplying(true);
    try {
      const res = await fetch("/api/resume/suggestions/apply-comprehensive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          resumeId: savedId, 
          applySuggestionIds: Array.from(selectedSuggestionIds) 
        })
      });
      if (res.ok) {
        setStep("applied");
      } else {
        throw new Error("Failed to apply suggestions");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to apply suggestions. Please try again.", "error");
    } finally {
      setIsApplying(false);
    }
  };

  const toggleSuggestionSelection = (id: string) => {
    const next = new Set(selectedSuggestionIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedSuggestionIds(next);
  };

  const handleAcceptAllInCategory = (ids: string[]) => {
    const next = new Set(selectedSuggestionIds);
    const allSelected = ids.every(id => next.has(id));
    
    if (allSelected) {
      ids.forEach(id => next.delete(id));
    } else {
      ids.forEach(id => next.add(id));
    }
    setSelectedSuggestionIds(next);
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "#43e97b";
    if (score >= 45) return "#f6d365";
    return "#ff6584";
  };

  // Grouped suggestions
  const grouped = useMemo(() => groupSuggestions(suggestions), [suggestions]);

  // Applied logic
  const appliedSuggestionsList = useMemo(() => {
    return suggestions.filter(s => selectedSuggestionIds.has(s.id));
  }, [suggestions, selectedSuggestionIds]);

  if (authLoading || !user) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: "100px" }}>
      <Navbar />

      <div style={{ maxWidth: "950px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <p className="section-label" style={{ marginBottom: "0.5rem" }}>Complete Resume Engine</p>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "2.2rem", fontWeight: 800 }}>
            Upload & Optimize
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
            ATS scoring combined with an elite 12-dimension AI coaching engine to perfect your resume.
          </p>
        </div>

        {/* STEP 1: Upload Portal */}
        {step === "upload" && (
          <div style={{ display: "grid", gap: "1.5rem", animation: "fadeInUp 0.4s ease" }}>
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
              }}
            >
              <input ref={fileRef} type="file" accept=".pdf,.txt" style={{ display: "none" }} onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} disabled={parsing} />
              {parsing ? (
                <>
                  <ClassicLoader className="mx-auto mb-4 h-9 w-9" />
                  <div style={{ fontWeight: 600, fontSize: "1.05rem" }}>Extracting document layout...</div>
                </>
              ) : resumeText ? (
                <>
                  <CheckCircle2 className="mx-auto text-[#43e97b] mb-3" size={40} />
                  <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#43e97b" }}>{fileName} loaded!</div>
                </>
              ) : (
                <>
                  <UploadCloud className="mx-auto text-[var(--text-muted)] mb-3 opacity-80" size={44} />
                  <div style={{ fontWeight: 700, fontSize: "1.15rem" }}>Drag & Drop Resume</div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>Supports PDF or TXT</div>
                </>
              )}
            </div>

            {error && <div style={{ color: "#ff6584", fontSize: "0.88rem", padding: "0.9rem 1.2rem", background: "rgba(255,101,132,0.08)", borderRadius: "10px", borderLeft: "4px solid #ff6584" }}>{error}</div>}

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

            <button className="btn-primary" onClick={runAnalysis} disabled={!resumeText || parsing} style={{ alignSelf: "flex-start", padding: "1rem 2.2rem", fontSize: "0.95rem" }}>
              ✦ Comprehensive Analysis
            </button>
          </div>
        )}

        {/* STEP 2: Analyzing */}
        {step === "analyzing" && (
          <div style={{ textAlign: "center", padding: "5rem 2rem", background: "var(--card)", borderRadius: "20px", border: "1px solid var(--border)" }}>
            <ConcentricLoader className="mb-4" />
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.6rem", marginBottom: "0.5rem" }}>
              Hybrid Engine Analyzing
            </h2>
            <p style={{ color: "var(--accent)", fontWeight: 600, fontSize: "0.95rem", marginBottom: "2rem" }}>
              {loadingText}
            </p>
            <div style={{ maxWidth: "450px", margin: "0 auto", height: "8px", background: "var(--bg-3)", borderRadius: "4px", overflow: "hidden" }}>
              <div 
                style={{ 
                  height: "100%", 
                  width: `${loadingProgress}%`, 
                  background: "linear-gradient(90deg, var(--accent) 0%, var(--accent-2) 50%, var(--accent-3) 100%)", 
                  transition: "width 0.1s linear",
                }} 
              />
            </div>
          </div>
        )}

        {/* STEP 3: Results */}
        {step === "results" && atsScore && (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem", animation: "fadeInUp 0.4s ease" }}>
            <div className="flex-1 w-full">
              {/* Score Header */}
              <div className="card mb-6 border-l-4 border-[#43e97b] bg-[rgba(67,233,123,0.02)]">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                      ✅ Comprehensive Analysis Complete
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Impact: {suggestions.length} improvements found across multiple dimensions.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-xs uppercase font-bold text-muted-foreground mb-1">Current ATS</div>
                      <div className="text-3xl font-black font-syne" style={{ color: getScoreColor(atsScore.overall) }}>
                        {atsScore.overall}<span className="text-sm font-normal text-muted-foreground">/100</span>
                      </div>
                    </div>
                    {suggestions.length > 0 && (
                      <>
                        <div className="h-12 w-px bg-border"></div>
                        <div className="text-center">
                          <div className="text-xs uppercase font-bold text-[#43e97b] mb-1">Potential</div>
                          <div className="text-3xl font-black font-syne text-[#43e97b]">
                            {Math.min(100, atsScore.overall + Math.floor(selectedSuggestionIds.size * 1.5))}
                            <span className="text-sm font-normal text-muted-foreground">/100</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {error && <div className="mb-6 p-4 rounded-xl bg-red-500/10 border-l-4 border-red-500 text-red-400 text-sm">{error}</div>}

              {/* Categories */}
              <h3 className="text-lg font-bold text-white mb-4">Improvement Opportunities</h3>
              
              <ImprovementCategory 
                title="ATS & Technical Keywords" 
                emoji="⭐" 
                description="Missing high-value keywords and hard skills."
                suggestions={grouped.atsAndKeywords}
                selectedIds={selectedSuggestionIds}
                onToggle={toggleSuggestionSelection}
                onAcceptAll={handleAcceptAllInCategory}
              />

              <ImprovementCategory 
                title="Experience Bullet Optimization" 
                emoji="💪" 
                description="Rewrite passive bullets, add action verbs and impact metrics."
                suggestions={grouped.experienceBullets}
                selectedIds={selectedSuggestionIds}
                onToggle={toggleSuggestionSelection}
                onAcceptAll={handleAcceptAllInCategory}
              />

              <ImprovementCategory 
                title="Soft Skills & Competencies" 
                emoji="🎯" 
                description="Highlight leadership, communication, and domain expertise."
                suggestions={grouped.softSkills}
                selectedIds={selectedSuggestionIds}
                onToggle={toggleSuggestionSelection}
                onAcceptAll={handleAcceptAllInCategory}
              />

              <ImprovementCategory 
                title="Summary, Education & Certs" 
                emoji="📚" 
                description="Optimize professional summary, add certifications and achievements."
                suggestions={grouped.sections}
                selectedIds={selectedSuggestionIds}
                onToggle={toggleSuggestionSelection}
                onAcceptAll={handleAcceptAllInCategory}
              />

              <ImprovementCategory 
                title="Formatting & Structure" 
                emoji="🎨" 
                description="Fix ATS parsing issues and improve readability."
                suggestions={grouped.formatting}
                selectedIds={selectedSuggestionIds}
                onToggle={toggleSuggestionSelection}
                onAcceptAll={handleAcceptAllInCategory}
              />

              {suggestions.length === 0 && (
                <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-border/50">
                  <div className="text-4xl mb-4">🎉</div>
                  <p>Your resume is in excellent shape! No major AI suggestions found.</p>
                </div>
              )}
            </div>

            {/* Sticky Actions Footer */}
            {suggestions.length > 0 && (
              <div className="fixed bottom-0 left-0 right-0 p-5 bg-[var(--bg-glass-nav)] backdrop-blur-xl border-t border-[var(--border)] z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                  <div className="text-sm font-medium text-[var(--text-muted)] hidden sm:block">
                    <span className="text-[var(--text-primary)] font-bold">{selectedSuggestionIds.size}</span> / {suggestions.length} selected
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <button 
                      onClick={() => { setStep("upload"); setAtsScore(null); setResumeText(""); }}
                      className="px-6 py-2.5 rounded-xl font-medium text-sm bg-[var(--bg-2)] hover:bg-[var(--bg-3)] transition-colors border border-[var(--border)] flex-1 sm:flex-none"
                    >
                      Skip
                    </button>
                    <button 
                      onClick={handleApplySuggestions}
                      disabled={selectedSuggestionIds.size === 0 || isApplying}
                      className="px-8 py-2.5 rounded-xl font-bold text-sm bg-[var(--accent)] text-white hover:opacity-90 transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] disabled:opacity-50 disabled:shadow-none flex-1 sm:flex-none"
                    >
                      {isApplying ? "Applying..." : `Apply & Preview (${selectedSuggestionIds.size})`}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Applied Preview */}
        {step === "applied" && (
          <div className="animate-in fade-in zoom-in-95 duration-400">
            <div className="text-center py-8">
              <div className="text-6xl mb-4 animate-bounce">🚀</div>
              <h2 className="text-3xl font-black font-syne text-white mb-2">Upgrades Applied!</h2>
              <p className="text-muted-foreground">Your resume has been successfully enhanced with AI intelligence.</p>
            </div>

            <ComprehensivePreview appliedSuggestions={appliedSuggestionsList} />

            <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
              <button 
                onClick={() => { setStep("upload"); setAtsScore(null); setResumeText(""); setFileName(""); }}
                className="btn-secondary py-3 px-8 text-[15px]"
              >
                Analyze Another Resume
              </button>
              
              <Link href={`/resume/builder?id=${savedId}&suggestionsApplied=${appliedSuggestionsList.length}`}>
                <button className="btn-primary py-3 px-8 text-[15px] w-full sm:w-auto shadow-[0_0_20px_rgba(67,233,123,0.3)]">
                  Proceed to Builder to Refine ↗
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
