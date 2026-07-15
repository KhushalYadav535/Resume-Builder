"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { Resume } from "@/types";
import { Sparkles, TrendingUp, Compass, Target, MessageSquare } from "lucide-react";
import { useToast } from "@/components/ui/toast-1";
import ConcentricLoader from "@/components/ui/Loader";

export default function CareerCopilotPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"interview" | "skillgap">("interview");

  // Interview Prep States
  const [questions, setQuestions] = useState<{ question: string; type: string; suggestedAnswerTips: string }[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [careerStory, setCareerStory] = useState("");
  const [careerStoryLoading, setCareerStoryLoading] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);

  // Skill Gap States
  const [targetRole, setTargetRole] = useState("");
  const [skillGapData, setSkillGapData] = useState<{ matchedSkills: string[]; missingSkills: string[]; recommendedCourses: string[]; gapPercentage: number } | null>(null);
  const [skillGapLoading, setSkillGapLoading] = useState(false);
  const [careerRecommendations, setCareerRecommendations] = useState<{ roleTitle: string; marketDemand: string; averageSalaryRange: string; whyGoodFit: string }[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);

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
      .then((data) => {
        setResumes(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!selectedResumeId) {
      setSelectedResume(null);
      return;
    }
    const found = resumes.find((r) => r.id === selectedResumeId);
    if (found) {
      setSelectedResume(found);
    }
  }, [selectedResumeId, resumes]);

  const fetchQuestions = async () => {
    if (!selectedResume) return;
    setQuestionsLoading(true);
    try {
      const res = await fetch("/api/predict-interview-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: selectedResume.id })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.questions) {
          setQuestions(data.questions);
        }
      } else {
        showToast("Failed to predict questions. Please try again.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error predicting questions.", "error");
    } finally {
      setQuestionsLoading(false);
    }
  };

  const fetchCareerStory = async () => {
    if (!selectedResume) return;
    setCareerStoryLoading(true);
    try {
      const res = await fetch("/api/generate-career-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: selectedResume.id })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.script) {
          setCareerStory(data.script);
          setShowStoryModal(true);
        }
      } else {
        showToast("Failed to generate career story script.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error generating career story.", "error");
    } finally {
      setCareerStoryLoading(false);
    }
  };

  const fetchSkillGap = async () => {
    if (!selectedResume || !targetRole.trim()) {
      showToast("Please enter a target role first.", "warning");
      return;
    }
    setSkillGapLoading(true);
    try {
      const res = await fetch("/api/skill-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: selectedResume.id, targetRole })
      });
      if (res.ok) {
        const data = await res.json();
        setSkillGapData(data);
      } else {
        showToast("Failed to compute skill gap. Please try again.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error analyzing skill gap.", "error");
    } finally {
      setSkillGapLoading(false);
    }
  };

  const fetchCareerRecommendations = async () => {
    if (!selectedResume) return;
    setRecommendationsLoading(true);
    try {
      const res = await fetch("/api/career-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: selectedResume.id })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.recommendations) {
          setCareerRecommendations(data.recommendations);
        }
      } else {
        showToast("Failed to get career recommendations.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error getting career recommendations.", "error");
    } finally {
      setRecommendationsLoading(false);
    }
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

      <div style={{ padding: "2.5rem 2rem", maxWidth: "900px", margin: "0 auto", width: "100%" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem", borderBottom: "1px solid var(--border)", paddingBottom: "1.5rem" }}>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "2rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Compass size={28} className="text-blue-500" />
            Career Copilot
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginTop: "0.4rem", maxWidth: "600px" }}>
            Your AI-powered career assistant. Select a resume profile to get tailored interview prep, skill gap analysis, and career trajectory recommendations.
          </p>
        </div>

        {/* Step 1: Select Resume */}
        <div className="card" style={{ display: "grid", gap: "1rem", marginBottom: "2rem" }}>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.15rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            Select Base Resume
          </h2>

          {loading ? (
            <div style={{ textAlign: "center", padding: "1rem" }}>
              <ConcentricLoader text="Fetching saved resumes..." />
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
                // Reset downstream state
                setQuestions([]);
                setCareerStory("");
                setSkillGapData(null);
                setCareerRecommendations([]);
              }}
              style={{ background: "var(--bg-2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "8px", height: "44px" }}
            >
              <option value="">— Choose a resume profile —</option>
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.file_name} ({new Date(r.created_at).toLocaleDateString()})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* AI Tools Section */}
        {selectedResume && (
          <div style={{ animation: "fadeInUp 0.3s ease" }}>
            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 border-b border-[var(--border)] mb-6 pb-4">
              {[
                { key: "interview", label: "Interview Prep & Pitch" },
                { key: "skillgap", label: "Skill Gap & Next Steps" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-4 py-2.5 rounded-full font-semibold text-[14.5px] transition-all duration-200 shrink-0 ${activeTab === tab.key
                    ? "bg-[var(--accent)] text-white shadow-md shadow-[var(--accent)]/20"
                    : "bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:bg-[var(--bg-3)] hover:text-[var(--text-primary)]"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab: Interview Prep */}
            {activeTab === "interview" && (
              <div style={{ display: "grid", gap: "1.5rem" }}>
                {/* Career Pitch Script */}
                <div className="card" style={{ display: "grid", gap: "0.8rem", padding: "1.5rem" }}>
                  <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.1rem", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <MessageSquare size={18} className="text-purple-500" />
                    Career Pitch Script ("Tell Me About Yourself")
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
                    Generate a high-quality 2-minute elevator pitch script tailored to your resume's achievements to kickstart your interviews confidently.
                  </p>
                  
                  {showStoryModal && careerStory ? (
                    <div style={{ background: "rgba(108, 99, 255, 0.04)", border: "1px solid rgba(108, 99, 255, 0.15)", borderRadius: "8px", padding: "1.2rem", marginTop: "0.5rem" }}>
                       <p style={{ whiteSpace: "pre-wrap", fontSize: "0.88rem", lineHeight: 1.6, margin: 0 }}>{careerStory}</p>
                       <button onClick={() => setShowStoryModal(false)} className="btn-secondary" style={{ marginTop: "1rem", fontSize: "0.8rem" }}>Close</button>
                    </div>
                  ) : (
                    <button
                      onClick={fetchCareerStory}
                      disabled={careerStoryLoading}
                      className="btn-primary mt-2"
                      style={{ padding: "0.6rem 1.2rem", fontSize: "0.85rem", background: "linear-gradient(135deg, #6c63ff 0%, #3b82f6 100%)", border: "none", width: "fit-content" }}
                    >
                      {careerStoryLoading ? "Generating Elevator Pitch..." : "✦ Generate Elevator Pitch Script"}
                    </button>
                  )}
                </div>

                {/* AI Predicted Questions */}
                <div className="card" style={{ display: "grid", gap: "1.2rem", padding: "1.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div>
                      <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.1rem", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Target size={18} className="text-pink-500" />
                        AI-Predicted Interview Questions
                      </h3>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "0.3rem 0 0" }}>Get personalized technical and behavioral questions you are highly likely to face.</p>
                    </div>
                    {questions.length > 0 && (
                      <button onClick={fetchQuestions} disabled={questionsLoading} className="btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>
                        {questionsLoading ? "Regenerating..." : "Regenerate"}
                      </button>
                    )}
                  </div>

                  {questions.length === 0 ? (
                    <button
                      onClick={fetchQuestions}
                      disabled={questionsLoading}
                      className="btn-primary"
                      style={{ padding: "0.6rem 1.2rem", fontSize: "0.85rem", width: "fit-content", marginTop: "0.5rem" }}
                    >
                      {questionsLoading ? "Predicting Questions..." : "Predict Interview Questions"}
                    </button>
                  ) : (
                    <div style={{ display: "grid", gap: "1rem" }}>
                      {questions.map((q, idx) => {
                        const typeColors: Record<string, string> = {
                          technical: "tag-purple",
                          behavioral: "tag-green",
                          "experience-specific": "tag-yellow"
                        };
                        const displayType = q.type || "general";
                        const tagClass = typeColors[displayType.toLowerCase()] || "tag-purple";

                        return (
                          <div key={idx} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", padding: "1.2rem", borderRadius: "10px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.8rem", marginBottom: "0.8rem" }}>
                              <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text)" }}>Q{idx + 1}: {q.question}</span>
                              <span className={`tag ${tagClass}`} style={{ fontSize: "0.65rem", textTransform: "capitalize", flexShrink: 0 }}>
                                {displayType}
                              </span>
                            </div>
                            <div style={{ padding: "0.8rem 1rem", background: "rgba(0,0,0,0.15)", borderRadius: "8px", borderLeft: "3px solid var(--accent)", fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                              <strong style={{ color: "var(--text)", display: "block", marginBottom: "0.3rem", fontSize: "0.8rem" }}>Suggested Talking Points & Tips:</strong>
                              {q.suggestedAnswerTips}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Skill Gap & Career */}
            {activeTab === "skillgap" && (
              <div style={{ display: "grid", gap: "1.5rem" }}>
                {/* Skill Gap Section */}
                <div className="card" style={{ display: "grid", gap: "1.2rem", padding: "1.5rem" }}>
                  <div>
                    <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.1rem", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Sparkles size={18} className="text-amber-500" />
                      Skill Gap Analysis
                    </h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "0.3rem 0 0" }}>Compare your current resume skills against the industry standards for a target job role.</p>
                  </div>

                  <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                    <input
                      className="input"
                      style={{ flex: 1, minWidth: "220px", fontSize: "0.9rem", height: "42px" }}
                      placeholder="e.g. Senior Frontend Engineer, Product Manager..."
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && fetchSkillGap()}
                    />
                    <button
                      onClick={fetchSkillGap}
                      disabled={skillGapLoading}
                      className="btn-primary"
                      style={{ padding: "0 1.5rem", fontSize: "0.85rem", height: "42px" }}
                    >
                      {skillGapLoading ? "Analyzing..." : "Analyze Gap"}
                    </button>
                  </div>

                  {skillGapData && (
                    <div style={{ display: "grid", gap: "1.5rem", borderTop: "1px solid var(--border)", paddingTop: "1.5rem", marginTop: "0.5rem" }}>
                      {/* Gap Percentage Badge */}
                      <div style={{ display: "flex", alignItems: "center", gap: "1.2rem", background: "rgba(0,0,0,0.15)", padding: "1rem 1.5rem", borderRadius: "10px" }}>
                        <div style={{
                          fontSize: "2.2rem",
                          fontWeight: 800,
                          fontFamily: "Syne, sans-serif",
                          color: skillGapData.gapPercentage > 60 ? "#ff6584" : skillGapData.gapPercentage > 30 ? "#f6d365" : "#43e97b"
                        }}>
                          {skillGapData.gapPercentage}%
                        </div>
                        <div>
                          <strong style={{ display: "block", fontSize: "0.9rem" }}>Skills Gap Detected</strong>
                          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                            {skillGapData.gapPercentage > 60 ? "Requires significant skill acquisition." : skillGapData.gapPercentage > 30 ? "Moderate alignment. Learn recommended topics to stand out." : "Excellent alignment! Minimal skill gap detected."}
                          </span>
                        </div>
                      </div>

                      {/* Matched vs Missing */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
                        <div>
                          <p className="section-label" style={{ marginBottom: "0.6rem", color: "#43e97b" }}>Matched Skills ({skillGapData.matchedSkills?.length || 0})</p>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                            {skillGapData.matchedSkills?.map((s) => <span key={s} className="tag tag-green" style={{ fontSize: "0.75rem" }}>{s}</span>)}
                            {(!skillGapData.matchedSkills || skillGapData.matchedSkills.length === 0) && <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>None detected</span>}
                          </div>
                        </div>
                        <div>
                          <p className="section-label" style={{ marginBottom: "0.6rem", color: "#ff6584" }}>Missing Skills ({skillGapData.missingSkills?.length || 0})</p>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                            {skillGapData.missingSkills?.map((s) => <span key={s} className="tag tag-red" style={{ fontSize: "0.75rem" }}>{s}</span>)}
                            {(!skillGapData.missingSkills || skillGapData.missingSkills.length === 0) && <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>None detected</span>}
                          </div>
                        </div>
                      </div>

                      {/* Recommended Courses */}
                      {skillGapData.recommendedCourses && skillGapData.recommendedCourses.length > 0 && (
                        <div style={{ background: "rgba(108,99,255,0.04)", border: "1px solid rgba(108,99,255,0.15)", borderRadius: "10px", padding: "1.2rem" }}>
                          <p className="section-label" style={{ marginBottom: "0.8rem", color: "var(--accent)" }}>Recommended Learning Topics</p>
                          <ul style={{ margin: "0 0 0 1.2rem", padding: 0, fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                            {skillGapData.recommendedCourses.map((c, i) => (
                              <li key={i} style={{ marginBottom: "0.3rem" }}>
                                <strong style={{ color: "var(--text)" }}>{c}</strong>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Career Path Recommendations */}
                <div className="card" style={{ display: "grid", gap: "1.2rem", padding: "1.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div>
                      <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.1rem", fontWeight: 700, margin: 0, display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                        <TrendingUp size={18} className="text-emerald-500" />
                        Next-Step Career Path Recommendations
                      </h3>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "0.3rem 0 0" }}>Discover alternative or progressive career paths based on your experience profile.</p>
                    </div>
                    {careerRecommendations.length > 0 && (
                      <button onClick={fetchCareerRecommendations} disabled={recommendationsLoading} className="btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>
                        {recommendationsLoading ? "Refreshing..." : "Refresh Paths"}
                      </button>
                    )}
                  </div>

                  {careerRecommendations.length === 0 ? (
                    <button
                      onClick={fetchCareerRecommendations}
                      disabled={recommendationsLoading}
                      className="btn-primary mt-2"
                      style={{ padding: "0.6rem 1.2rem", fontSize: "0.85rem", width: "fit-content" }}
                    >
                      {recommendationsLoading ? "Analyzing Profile..." : "Explore Next-Step Career Paths"}
                    </button>
                  ) : (
                    <div style={{ display: "grid", gap: "1rem", marginTop: "0.5rem" }}>
                      {careerRecommendations.map((rec, idx) => {
                        const demandColors: Record<string, string> = {
                          high: "tag-green",
                          medium: "tag-yellow",
                          low: "tag-red"
                        };
                        const demandClass = demandColors[(rec.marketDemand || "medium").toLowerCase()] || "tag-yellow";
                        return (
                          <div key={idx} style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--border)", padding: "1.2rem", borderRadius: "10px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.8rem", marginBottom: "0.6rem", flexWrap: "wrap" }}>
                              <strong style={{ fontSize: "1rem", color: "var(--text)" }}>{rec.roleTitle}</strong>
                              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                <span className="tag tag-purple" style={{ fontSize: "0.75rem" }}>{rec.averageSalaryRange}</span>
                                <span className={`tag ${demandClass}`} style={{ fontSize: "0.75rem" }}>Demand: {rec.marketDemand}</span>
                              </div>
                            </div>
                            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
                              <strong style={{ color: "var(--text-secondary)" }}>Why it's a good fit: </strong>
                              {rec.whyGoodFit}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
