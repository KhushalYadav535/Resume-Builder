"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { Resume } from "@/types";
import { Sparkles, TrendingUp, Compass, Target, MessageSquare } from "lucide-react";
import { useToast } from "@/components/ui/toast-1";
import ConcentricLoader from "@/components/ui/Loader";
import ToneCalibrator from "@/components/career-copilot/ToneCalibrator";
import GapStoryteller from "@/components/career-copilot/GapStoryteller";
import SalaryBenchmarker from "@/components/career-copilot/SalaryBenchmarker";
import RecruiterVisibility from "@/components/career-copilot/RecruiterVisibility";
import PromotionCaseBuilder from "@/components/career-copilot/PromotionCaseBuilder";
import NetworkingAssistant from "@/components/career-copilot/NetworkingAssistant";
import OfferEvaluator from "@/components/career-copilot/OfferEvaluator";
import NegotiationScript from "@/components/career-copilot/NegotiationScript";
import CompanyResearch from "@/components/career-copilot/CompanyResearch";
import MarketTimingAlerts from "@/components/career-copilot/MarketTimingAlerts";
import PeerBenchmark from "@/components/career-copilot/PeerBenchmark";
import MockInterview from "@/components/career-copilot/MockInterview";
import LearningPathRecommender from "@/components/career-copilot/LearningPathRecommender";

export default function CareerCopilotPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"interview" | "skillgap" | "market" | "growth" | "negotiation">("interview");

  // Interview Prep States
  const [questions, setQuestions] = useState<{ question: string; type: string; suggestedAnswerTips: string }[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [careerStory, setCareerStory] = useState("");
  const [careerStoryLoading, setCareerStoryLoading] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [toneValue, setToneValue] = useState(50);
  const [narrativeAudience, setNarrativeAudience] = useState("interview");
  const [narrativeCopied, setNarrativeCopied] = useState(false);

  // Skill Gap States
  const [targetRole, setTargetRole] = useState("");
  const [skillGapData, setSkillGapData] = useState<{ matchedSkills: string[]; missingSkills: string[]; recommendedCourses: string[]; gapPercentage: number; estimatedWeeksToClose?: number } | null>(null);
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
        body: JSON.stringify({ resumeId: selectedResume.id, tone: toneValue, audience: narrativeAudience })
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
            {/* Progress Dashboard */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
              <div className="card" style={{ padding: "1.2rem", background: "linear-gradient(135deg, rgba(108, 99, 255, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)", border: "1px solid rgba(108, 99, 255, 0.15)" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Resume ATS Strength</span>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, fontFamily: "Syne, sans-serif", color: "var(--accent)", marginTop: "0.5rem" }}>
                  {selectedResume.ats_score?.overall || 0}/100
                </div>
              </div>
              <div className="card" style={{ padding: "1.2rem", background: "linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%)", border: "1px solid rgba(16, 185, 129, 0.15)" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Interview Readiness</span>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, fontFamily: "Syne, sans-serif", color: "#10b981", marginTop: "0.5rem" }}>
                  {questions.length > 0 && careerStory ? "High" : careerStory ? "Medium" : "Pending"}
                </div>
              </div>
              
              <PeerBenchmark userAtsScore={selectedResume.ats_score?.overall || 0} />
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 border-b border-[var(--border)] mb-6 pb-4">
              {[
                { key: "interview", label: "Interview Prep & Pitch" },
                { key: "skillgap", label: "Skill Gap & Career Path" },
                { key: "market", label: "Market Awareness" },
                { key: "growth", label: "Planning & Growth" },
                { key: "negotiation", label: "Negotiation & Offers" },
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
                {/* Narrative Studio */}
                <div className="card" style={{ display: "grid", gap: "0.8rem", padding: "1.5rem" }}>
                  <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.1rem", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <MessageSquare size={18} className="text-purple-500" />
                    Narrative Studio
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
                    Generate a tailored pitch for your chosen audience — interview intro, recruiter DM, LinkedIn About, or networking message.
                  </p>

                  {/* Audience Selector */}
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {[
                      { value: "interview", label: "Interview Intro" },
                      { value: "recruiter", label: "Recruiter DM" },
                      { value: "linkedin", label: "LinkedIn About" },
                      { value: "networking", label: "Networking Intro" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setNarrativeAudience(opt.value); setShowStoryModal(false); setCareerStory(""); }}
                        style={{
                          padding: "0.35rem 0.8rem",
                          borderRadius: "999px",
                          border: `1px solid ${narrativeAudience === opt.value ? "var(--accent)" : "var(--border)"}`,
                          background: narrativeAudience === opt.value ? "rgba(108,99,255,0.1)" : "var(--bg-elevated)",
                          color: narrativeAudience === opt.value ? "var(--accent)" : "var(--text-muted)",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <ToneCalibrator value={toneValue} onChange={setToneValue} />

                  {showStoryModal && careerStory ? (
                    <div style={{ background: "rgba(108, 99, 255, 0.04)", border: "1px solid rgba(108, 99, 255, 0.15)", borderRadius: "8px", padding: "1.2rem", marginTop: "0.5rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
                        <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--accent)" }}>Generated Script</span>
                        <div style={{ display: "flex", gap: "0.6rem" }}>
                          <button
                            onClick={() => { navigator.clipboard.writeText(careerStory); setNarrativeCopied(true); setTimeout(() => setNarrativeCopied(false), 2000); }}
                            style={{ background: "none", border: "none", cursor: "pointer", color: narrativeCopied ? "#10b981" : "var(--text-muted)", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.3rem" }}
                          >
                            {narrativeCopied ? "✓ Copied!" : "Copy"}
                          </button>
                          <button onClick={() => { setShowStoryModal(false); setCareerStory(""); }} className="btn-secondary" style={{ fontSize: "0.8rem", padding: "0.3rem 0.7rem" }}>Regenerate</button>
                        </div>
                      </div>
                      <p style={{ whiteSpace: "pre-wrap", fontSize: "0.88rem", lineHeight: 1.7, margin: 0 }}>{careerStory}</p>
                    </div>
                  ) : (
                    <button
                      onClick={fetchCareerStory}
                      disabled={careerStoryLoading}
                      className="btn-primary mt-2"
                      style={{ padding: "0.6rem 1.2rem", fontSize: "0.85rem", background: "linear-gradient(135deg, #6c63ff 0%, #3b82f6 100%)", border: "none", width: "fit-content" }}
                    >
                      {careerStoryLoading ? "Generating Script..." : `✦ Generate ${["interview","recruiter","linkedin","networking"].includes(narrativeAudience) ? {interview:"Interview Intro",recruiter:"Recruiter DM",linkedin:"LinkedIn About",networking:"Networking Intro"}[narrativeAudience] : "Script"}`}
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
                  {/* Mock Interview STAR Builder */}
                <MockInterview resumeId={selectedResume.id} questions={questions} />
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
                      {/* Gap & Time-to-Close Summary */}
                      <div style={{ display: "flex", alignItems: "center", gap: "1.2rem", background: "rgba(0,0,0,0.15)", padding: "1rem 1.5rem", borderRadius: "10px" }}>
                        <div style={{
                          fontSize: "2.2rem",
                          fontWeight: 800,
                          fontFamily: "Syne, sans-serif",
                          color: skillGapData.gapPercentage > 60 ? "#ff6584" : skillGapData.gapPercentage > 30 ? "#f6d365" : "#43e97b"
                        }}>
                          {skillGapData.gapPercentage}%
                        </div>
                        <div style={{ flex: 1 }}>
                          <strong style={{ display: "block", fontSize: "0.9rem" }}>Skills Gap Detected</strong>
                          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                            {skillGapData.gapPercentage > 60 ? "Requires significant skill acquisition." : skillGapData.gapPercentage > 30 ? "Moderate alignment. Learn recommended topics to stand out." : "Excellent alignment! Minimal skill gap detected."}
                          </span>
                        </div>
                        {skillGapData.estimatedWeeksToClose && (
                          <div style={{ textAlign: "center", background: "rgba(108,99,255,0.1)", border: "1px solid rgba(108,99,255,0.2)", borderRadius: "10px", padding: "0.6rem 1rem" }}>
                            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Est. to close</div>
                            <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--accent)", fontFamily: "Syne, sans-serif", lineHeight: 1.1 }}>~{skillGapData.estimatedWeeksToClose}w</div>
                          </div>
                        )}
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

                {/* Learning Path Recommender — appears after skill gap runs */}
                {skillGapData && skillGapData.missingSkills && skillGapData.missingSkills.length > 0 && (
                  <LearningPathRecommender
                    targetRole={targetRole}
                    missingSkills={skillGapData.missingSkills}
                    gapPercentage={skillGapData.gapPercentage}
                  />
                )}

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

                <GapStoryteller />
              </div>
            )}

            {/* Tab: Market Awareness */}
            {activeTab === "market" && (
              <div style={{ display: "grid", gap: "1.5rem" }}>
                <SalaryBenchmarker />
                <MarketTimingAlerts />
                <CompanyResearch />
                <RecruiterVisibility />
              </div>
            )}

            {/* Tab: Planning & Growth */}
            {activeTab === "growth" && (
              <div style={{ display: "grid", gap: "1.5rem" }}>
                <PromotionCaseBuilder />
                <NetworkingAssistant />
              </div>
            )}

            {/* Tab: Negotiation & Offers */}
            {activeTab === "negotiation" && (
              <div style={{ display: "grid", gap: "1.5rem" }}>
                <OfferEvaluator />
                <NegotiationScript />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
