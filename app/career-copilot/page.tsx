"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { Resume } from "@/types";
import {
  Compass,
  Sparkles,
  TrendingUp,
  Target,
  MessageSquare,
  Handshake,
  Scale,
  BarChart3,
  Award,
  Rocket,
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Briefcase,
  Copy,
  Check,
  Loader2,
  ChevronDown,
  Clock,
  CheckCheck,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<"interview" | "skillgap" | "market" | "growth" | "negotiation">("negotiation");

  // Interview Prep States
  const [questions, setQuestions] = useState<{ question: string; type: string; suggestedAnswerTips: string }[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [careerStory, setCareerStory] = useState("");
  const [careerStoryLoading, setCareerStoryLoading] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [toneValue, setToneValue] = useState(65);
  const [narrativeAudience, setNarrativeAudience] = useState("interview");
  const [narrativeCopied, setNarrativeCopied] = useState(false);

  // Skill Gap States
  const [targetRole, setTargetRole] = useState("");
  const [skillGapData, setSkillGapData] = useState<{
    matchedSkills: string[];
    missingSkills: string[];
    recommendedCourses: string[];
    gapPercentage: number;
    estimatedWeeksToClose?: number;
  } | null>(null);
  const [skillGapLoading, setSkillGapLoading] = useState(false);
  const [careerRecommendations, setCareerRecommendations] = useState<
    { roleTitle: string; marketDemand: string; averageSalaryRange: string; whyGoodFit: string }[]
  >([]);
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
        const list = Array.isArray(data) ? data : [];
        setResumes(list);
        setLoading(false);
        if (list.length > 0 && !selectedResumeId) {
          setSelectedResumeId(list[0].id);
        }
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
        body: JSON.stringify({ resumeId: selectedResume.id }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.questions) {
          setQuestions(data.questions);
          showToast("AI Predicted Interview Questions generated!", "success");
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
        body: JSON.stringify({ resumeId: selectedResume.id, tone: toneValue, audience: narrativeAudience }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.script) {
          setCareerStory(data.script);
          setShowStoryModal(true);
          showToast("Tailored pitch script generated!", "success");
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

  const fetchSkillGap = async (roleOverride?: string) => {
    const roleToUse = roleOverride || targetRole;
    if (!selectedResume || !roleToUse.trim()) {
      showToast("Please enter a target role first.", "warning");
      return;
    }
    if (roleOverride) setTargetRole(roleOverride);
    setSkillGapLoading(true);
    try {
      const res = await fetch("/api/skill-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: selectedResume.id, targetRole: roleToUse }),
      });
      if (res.ok) {
        const data = await res.json();
        setSkillGapData(data);
        showToast("Skill gap audit completed!", "success");
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
        body: JSON.stringify({ resumeId: selectedResume.id }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.recommendations) {
          setCareerRecommendations(data.recommendations);
          showToast("Career trajectory recommendations loaded!", "success");
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

  const atsScore = selectedResume?.ats_score?.overall || 0;
  const atsColor = atsScore >= 75 ? "#10B981" : atsScore >= 50 ? "#F59E0B" : "#EF4444";
  const atsStatus = atsScore >= 75 ? "Executive Tier" : atsScore >= 50 ? "Competitive Baseline" : "Optimization Required";

  // Readiness Status Logic
  const hasQuestions = questions.length > 0;
  const hasStory = !!careerStory;
  const readinessLabel = hasQuestions && hasStory ? "Advancement Ready" : hasStory || hasQuestions ? "Developing Pitch" : "Needs Evidence";
  const readinessColor = hasQuestions && hasStory ? "#10B981" : hasStory || hasQuestions ? "#14B8A6" : "#F59E0B";

  // Circular gauge calculations (radius = 32, circumference = ~201)
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (atsScore / 100) * circumference;

  interface TabItem {
    key: "negotiation" | "interview" | "skillgap" | "market" | "growth";
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    badge?: string;
    color: string;
  }

  const TABS: TabItem[] = [
    { key: "negotiation", label: "Negotiation & Offers", icon: Handshake, badge: "Strategy", color: "#F59E0B" },
    { key: "interview", label: "Interview Prep & Pitch", icon: Target, badge: questions.length > 0 ? `${questions.length} Qs` : undefined, color: "#14B8A6" },
    { key: "skillgap", label: "Skill Gap & Career Path", icon: Sparkles, badge: skillGapData ? `${skillGapData.gapPercentage}% Gap` : undefined, color: "#8B5CF6" },
    { key: "market", label: "Market Awareness", icon: BarChart3, color: "#2563EB" },
    { key: "growth", label: "Planning & Growth", icon: Rocket, color: "#F43F5E" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <Navbar />

      {/* ─── UP ROLE THEMED EXECUTIVE HERO HEADER ───────────────────────────── */}
      <div
        style={{
          background: "var(--card)",
          borderBottom: "1px solid var(--border)",
          position: "relative",
          overflow: "hidden",
          padding: "2rem 2rem 2.25rem",
        }}
      >
        {/* Subtle Ambient Glow Orbs */}
        <div
          style={{
            position: "absolute",
            top: -60,
            right: 60,
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(245, 158, 11, 0.08) 0%, transparent 70%)",
            pointerEvents: "none",
            filter: "blur(50px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -50,
            left: "20%",
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(37, 99, 235, 0.06) 0%, transparent 70%)",
            pointerEvents: "none",
            filter: "blur(40px)",
          }}
        />

        <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1.1rem" }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "14px",
                  background: "var(--accent-grad)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 6px 20px rgba(245, 158, 11, 0.35)",
                  color: "#101B3B",
                  flexShrink: 0,
                }}
              >
                <Compass size={26} />
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap", marginBottom: "0.25rem" }}>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      padding: "0.2rem 0.65rem",
                      borderRadius: "999px",
                      background: "rgba(245, 158, 11, 0.12)",
                      color: "#D97706",
                      border: "1px solid rgba(245, 158, 11, 0.28)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.3px",
                    }}
                  >
                    <Sparkles size={11} className="text-amber-500" />
                    Coaching Studio 2.0 • Active
                  </span>
                </div>
                <h1
                  style={{
                    fontFamily: "Syne, sans-serif",
                    fontWeight: 800,
                    fontSize: "1.65rem",
                    letterSpacing: "-0.02em",
                    color: "var(--text-primary)",
                    margin: 0,
                    lineHeight: 1.25,
                  }}
                >
                  UpRole AI <span style={{ color: "#F59E0B" }}>Career Copilot</span>
                </h1>
                <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", margin: "0.35rem 0 0", maxWidth: "680px", lineHeight: 1.5 }}>
                  AI-driven career acceleration, market salary intelligence, interview rehearsal, and data-backed offer negotiation.
                </p>
              </div>
            </div>

            {/* Header Right Live Badge */}
            {selectedResume && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.85rem",
                  padding: "0.65rem 1.15rem",
                  borderRadius: "14px",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  boxShadow: "0 2px 10px rgba(16, 27, 59, 0.04)",
                }}
              >
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.4px" }}>
                    Active Profile
                  </div>
                  <div
                    style={{
                      fontSize: "0.88rem",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      maxWidth: "200px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {selectedResume.file_name}
                  </div>
                </div>
                <div
                  style={{
                    padding: "0.35rem 0.7rem",
                    borderRadius: "8px",
                    background: `${atsColor}18`,
                    border: `1px solid ${atsColor}44`,
                    color: atsColor,
                    fontSize: "0.85rem",
                    fontWeight: 800,
                    fontFamily: "Syne, sans-serif",
                  }}
                >
                  {atsScore} ATS
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── MAIN RESPONSIVE CONTAINER (1280px) ───────────────────────────── */}
      <div style={{ maxWidth: 1280, margin: "0 auto", width: "100%", padding: "2rem 1.5rem", flex: 1 }}>
        {/* Step 1: Interactive Resume Profile Selector Card */}
        <div
          className="card"
          style={{
            padding: "1.4rem 1.6rem",
            marginBottom: "1.75rem",
            borderRadius: "14px",
            border: "1px solid var(--border)",
            background: "var(--card)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "8px",
                  background: "rgba(37, 99, 235, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--uprole-blue)",
                }}
              >
                <FileText size={16} />
              </div>
              <div>
                <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.05rem", margin: 0, color: "var(--text)" }}>
                  Select Career Baseline Profile
                </h2>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  All AI prep, peer benchmarks, and negotiations calibrate against this selected resume.
                </span>
              </div>
            </div>

            {selectedResume && (
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => router.push("/resume/tailor")}
                  className="btn-secondary"
                  style={{
                    fontSize: "0.78rem",
                    padding: "0.4rem 0.8rem",
                    borderRadius: "8px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                  }}
                >
                  <Target size={13} className="text-amber-500" />
                  Tailor for JD
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/resume/builder")}
                  className="btn-secondary"
                  style={{
                    fontSize: "0.78rem",
                    padding: "0.4rem 0.8rem",
                    borderRadius: "8px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                  }}
                >
                  <ExternalLink size={13} />
                  Open Builder
                </button>
              </div>
            )}
          </div>

          <div style={{ marginTop: "1rem" }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "1.5rem" }}>
                <ConcentricLoader text="Fetching your resume profiles..." />
              </div>
            ) : resumes.length === 0 ? (
              <div style={{ textAlign: "center", padding: "1.8rem", color: "var(--text-muted)" }}>
                <p style={{ margin: "0 0 0.8rem" }}>No resumes found in your profile. Build or upload one first.</p>
                <button className="btn-primary" onClick={() => router.push("/resume/builder")}>
                  ✦ Build First Resume
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.8rem" }}>
                <div style={{ position: "relative" }}>
                  <select
                    className="input"
                    value={selectedResumeId}
                    onChange={(e) => {
                      setSelectedResumeId(e.target.value);
                      setQuestions([]);
                      setCareerStory("");
                      setSkillGapData(null);
                      setCareerRecommendations([]);
                    }}
                    style={{
                      width: "100%",
                      background: "var(--bg-elevated)",
                      color: "var(--text-primary)",
                      border: "1.5px solid var(--border)",
                      borderRadius: "10px",
                      height: "46px",
                      padding: "0 2.5rem 0 1rem",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      appearance: "none",
                    }}
                  >
                    <option value="">— Choose a resume profile —</option>
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.file_name} • Score: {r.ats_score?.overall || 0}/100 • Updated {new Date(r.created_at).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                  <div style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-muted)" }}>
                    <ChevronDown size={18} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Tools Section */}
        {selectedResume && (
          <div>
            {/* ─── EXECUTIVE KPI DASHBOARD (Top 3 Cards) ───────────────────────── */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "1.25rem",
                marginBottom: "2rem",
              }}
            >
              {/* Card 1: ATS Strength & Quality Ring */}
              <div
                className="card"
                style={{
                  padding: "1.5rem",
                  background: "linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(217, 119, 6, 0.02) 100%)",
                  border: "1px solid rgba(245, 158, 11, 0.22)",
                  borderRadius: "16px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "1rem",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
                }}
              >
                <div>
                  {/* Header Row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "9px",
                          background: "linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.15))",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#F59E0B",
                          border: "1px solid rgba(245, 158, 11, 0.35)",
                        }}
                      >
                        <Award size={16} />
                      </div>
                      <div>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", display: "block", lineHeight: 1 }}>
                          Resume Telemetry
                        </span>
                        <h3 style={{ margin: "0.2rem 0 0", fontSize: "0.95rem", fontWeight: 700, color: "var(--text)" }}>
                          Career Value &amp; ATS
                        </h3>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        padding: "0.2rem 0.6rem",
                        borderRadius: "999px",
                        background: `${atsColor}18`,
                        color: atsColor,
                        border: `1px solid ${atsColor}44`,
                      }}
                    >
                      {atsScore >= 75 ? "Executive Tier" : atsScore >= 50 ? "Moderate Strength" : "Needs Refinement"}
                    </span>
                  </div>

                  {/* Main Score Block with SVG Gauge and Status Summary */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      padding: "0.75rem 0.85rem",
                      borderRadius: "12px",
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                      marginBottom: "0.75rem",
                    }}
                  >
                    {/* SVG Progress Ring */}
                    <div style={{ position: "relative", width: 72, height: 72, flexShrink: 0 }}>
                      <svg width="72" height="72" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r={radius} fill="none" stroke="rgba(16, 27, 59, 0.08)" strokeWidth="6" />
                        <circle
                          cx="40"
                          cy="40"
                          r={radius}
                          fill="none"
                          stroke={atsColor}
                          strokeWidth="6"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          transform="rotate(-90 40 40)"
                          style={{ transition: "stroke-dashoffset 0.8s ease" }}
                        />
                      </svg>
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "Syne, sans-serif",
                        }}
                      >
                        <span style={{ fontSize: "1.15rem", fontWeight: 800, color: atsColor, lineHeight: 1 }}>{atsScore}</span>
                        <span style={{ fontSize: "0.52rem", color: "var(--text-muted)", fontWeight: 600 }}>/100</span>
                      </div>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.98rem", fontWeight: 800, color: "var(--text-primary)", fontFamily: "Syne, sans-serif" }}>
                        {atsStatus}
                      </div>
                      <p style={{ fontSize: "0.74rem", color: "var(--text-muted)", margin: "0.2rem 0 0", lineHeight: 1.35 }}>
                        {atsScore >= 75
                          ? "High ATS parseability & competitive keyword density."
                          : atsScore >= 50
                          ? "Matches ATS screening thresholds for corporate roles."
                          : "Critical keywords missing. Optimization recommended."}
                      </p>
                    </div>
                  </div>

                  {/* Micro Telemetry Bars */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem", fontSize: "0.72rem" }}>
                        <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Keyword Alignment</span>
                        <span style={{ fontWeight: 700, color: "var(--text)" }}>{Math.min(95, Math.max(35, Math.round(atsScore * 1.08)))}%</span>
                      </div>
                      <div style={{ height: "5px", borderRadius: "999px", background: "var(--border)", overflow: "hidden" }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${Math.min(95, Math.max(35, Math.round(atsScore * 1.08)))}%`,
                            background: "linear-gradient(90deg, #F59E0B, #10B981)",
                            borderRadius: "999px",
                            transition: "width 0.6s ease",
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem", fontSize: "0.72rem" }}>
                        <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Impact Metrics &amp; Verbs</span>
                        <span style={{ fontWeight: 700, color: "var(--text)" }}>{Math.min(92, Math.max(25, Math.round(atsScore * 0.92)))}%</span>
                      </div>
                      <div style={{ height: "5px", borderRadius: "999px", background: "var(--border)", overflow: "hidden" }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${Math.min(92, Math.max(25, Math.round(atsScore * 0.92)))}%`,
                            background: "linear-gradient(90deg, #F59E0B, #2563EB)",
                            borderRadius: "999px",
                            transition: "width 0.6s ease",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div style={{ paddingTop: "0.6rem", borderTop: "1px solid rgba(245, 158, 11, 0.15)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                    Calibrated on active resume
                  </span>
                  <button
                    type="button"
                    onClick={() => router.push("/resume/tailor")}
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      padding: "0.35rem 0.75rem",
                      borderRadius: "7px",
                      background: "rgba(245, 158, 11, 0.12)",
                      color: "#D97706",
                      border: "1px solid rgba(245, 158, 11, 0.3)",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span>Tailor for JD</span>
                    <ArrowUpRight size={13} />
                  </button>
                </div>
              </div>

              {/* Card 2: Interview Readiness & Coaching Status */}
              <div
                className="card"
                style={{
                  padding: "1.5rem",
                  background: "linear-gradient(135deg, rgba(20, 184, 166, 0.05) 0%, rgba(13, 148, 136, 0.02) 100%)",
                  border: "1px solid rgba(20, 184, 166, 0.22)",
                  borderRadius: "16px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "1rem",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
                }}
              >
                <div>
                  {/* Header Row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "9px",
                          background: "linear-gradient(135deg, rgba(20, 184, 166, 0.2), rgba(13, 148, 136, 0.15))",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#14B8A6",
                          border: "1px solid rgba(20, 184, 166, 0.35)",
                        }}
                      >
                        <Target size={16} />
                      </div>
                      <div>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", display: "block", lineHeight: 1 }}>
                          Interview Copilot
                        </span>
                        <h3 style={{ margin: "0.2rem 0 0", fontSize: "0.95rem", fontWeight: 700, color: "var(--text)" }}>
                          Interview Readiness
                        </h3>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "999px",
                        background: `${readinessColor}18`,
                        border: `1px solid ${readinessColor}44`,
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: readinessColor,
                          boxShadow: `0 0 8px ${readinessColor}`,
                          display: "inline-block",
                        }}
                      />
                      <span style={{ fontSize: "0.68rem", fontWeight: 700, color: readinessColor }}>
                        {readinessLabel}
                      </span>
                    </div>
                  </div>

                  {/* Readiness Progress Meter */}
                  <div
                    style={{
                      padding: "0.75rem 0.85rem",
                      borderRadius: "12px",
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                      <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--text)" }}>
                        Prep Progress: {hasQuestions && hasStory ? "100%" : hasStory ? "66%" : hasQuestions ? "50%" : "25%"}
                      </span>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 600 }}>
                        {(hasStory ? 1 : 0) + (hasQuestions ? 1 : 0)} of 2 Active
                      </span>
                    </div>
                    <div style={{ height: "6px", borderRadius: "999px", background: "var(--border)", overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${hasQuestions && hasStory ? 100 : hasStory ? 66 : hasQuestions ? 50 : 25}%`,
                          background: "linear-gradient(90deg, #14B8A6, #10B981)",
                          borderRadius: "999px",
                          transition: "width 0.6s ease",
                        }}
                      />
                    </div>
                  </div>

                  {/* 3 Milestone Checklist Items */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                    {/* Item 1: Elevator Pitch */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.45rem 0.65rem",
                        borderRadius: "8px",
                        background: hasStory ? "rgba(16, 185, 129, 0.06)" : "var(--bg-elevated)",
                        border: hasStory ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid var(--border)",
                        fontSize: "0.75rem",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                        {hasStory ? (
                          <CheckCircle2 size={13} style={{ color: "#10B981" }} />
                        ) : (
                          <Clock size={13} style={{ color: "var(--text-muted)" }} />
                        )}
                        <span style={{ fontWeight: 600, color: hasStory ? "var(--text)" : "var(--text-muted)" }}>
                          Executive Pitch Story
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          color: hasStory ? "#10B981" : "var(--text-muted)",
                        }}
                      >
                        {hasStory ? "✓ Ready" : "Pending"}
                      </span>
                    </div>

                    {/* Item 2: AI Predicted Questions */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.45rem 0.65rem",
                        borderRadius: "8px",
                        background: hasQuestions ? "rgba(20, 184, 166, 0.06)" : "var(--bg-elevated)",
                        border: hasQuestions ? "1px solid rgba(20, 184, 166, 0.2)" : "1px solid var(--border)",
                        fontSize: "0.75rem",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                        {hasQuestions ? (
                          <CheckCircle2 size={13} style={{ color: "#14B8A6" }} />
                        ) : (
                          <Clock size={13} style={{ color: "var(--text-muted)" }} />
                        )}
                        <span style={{ fontWeight: 600, color: hasQuestions ? "var(--text)" : "var(--text-muted)" }}>
                          Predicted Questions Radar
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          color: hasQuestions ? "#14B8A6" : "var(--text-muted)",
                        }}
                      >
                        {hasQuestions ? `✓ ${questions.length} Ready` : "Pending"}
                      </span>
                    </div>

                    {/* Item 3: STAR Framework */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.45rem 0.65rem",
                        borderRadius: "8px",
                        background: hasQuestions ? "rgba(37, 99, 235, 0.06)" : "var(--bg-elevated)",
                        border: hasQuestions ? "1px solid rgba(37, 99, 235, 0.2)" : "1px solid var(--border)",
                        fontSize: "0.75rem",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                        <Sparkles size={13} style={{ color: hasQuestions ? "#2563EB" : "var(--text-muted)" }} />
                        <span style={{ fontWeight: 600, color: hasQuestions ? "var(--text)" : "var(--text-muted)" }}>
                          STAR Response Framework
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          color: hasQuestions ? "#2563EB" : "var(--text-muted)",
                        }}
                      >
                        {hasQuestions ? "Active" : "Awaiting Qs"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div style={{ paddingTop: "0.6rem", borderTop: "1px solid rgba(20, 184, 166, 0.15)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                    Role simulation mode
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("interview");
                      if (questions.length === 0) fetchQuestions();
                    }}
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      padding: "0.35rem 0.75rem",
                      borderRadius: "7px",
                      background: "rgba(20, 184, 166, 0.12)",
                      color: "#0D9488",
                      border: "1px solid rgba(20, 184, 166, 0.3)",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span>{questions.length > 0 ? "Review Questions" : "✦ Predict Questions"}</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>

              {/* Card 3: Peer Benchmark Widget */}
              <PeerBenchmark userAtsScore={atsScore} />
            </div>

            {/* ─── SEGMENTED STUDIO TAB NAVIGATION ───────────────────────── */}
            <div
              style={{
                display: "flex",
                gap: "0.4rem",
                padding: "0.38rem",
                borderRadius: "16px",
                background: "rgba(16, 27, 59, 0.035)",
                border: "1px solid var(--border)",
                marginBottom: "1.75rem",
                boxShadow: "0 2px 8px rgba(16, 27, 59, 0.02)",
                overflowX: "auto",
                scrollbarWidth: "none",
              }}
            >
              {TABS.map((tab) => {
                const isActive = activeTab === tab.key;
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    style={{
                      flex: "1 1 0",
                      minWidth: "195px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.55rem",
                      padding: "0.72rem 1rem",
                      borderRadius: "12px",
                      fontWeight: isActive ? 800 : 600,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                      whiteSpace: "nowrap",
                      position: "relative",
                      border: isActive ? "1px solid rgba(16, 27, 59, 0.10)" : "1px solid transparent",
                      background: isActive ? "var(--card)" : "transparent",
                      color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                      boxShadow: isActive
                        ? "0 3px 12px rgba(16, 27, 59, 0.07), 0 1px 2px rgba(0, 0, 0, 0.03)"
                        : "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "rgba(16, 27, 59, 0.04)";
                        e.currentTarget.style.color = "var(--text-primary)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "var(--text-muted)";
                      }
                    }}
                  >
                    {/* Micro-Icon Container */}
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "8px",
                        background: isActive ? `${tab.color}15` : "transparent",
                        border: isActive ? `1px solid ${tab.color}35` : "1px solid transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: isActive ? tab.color : "var(--text-muted)",
                        flexShrink: 0,
                        transition: "all 0.18s ease",
                      }}
                    >
                      <IconComponent size={15} />
                    </div>

                    {/* Tab Label */}
                    <span style={{ letterSpacing: "-0.01em" }}>{tab.label}</span>

                    {/* Optional Badge */}
                    {tab.badge && (
                      <span
                        style={{
                          fontSize: "0.66rem",
                          fontWeight: 800,
                          padding: "0.12rem 0.5rem",
                          borderRadius: "999px",
                          background: isActive ? `${tab.color}16` : "rgba(16, 27, 59, 0.06)",
                          color: isActive ? tab.color : "var(--text-muted)",
                          border: isActive ? `1px solid ${tab.color}40` : "1px solid var(--border)",
                          letterSpacing: "0.2px",
                        }}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ─── TAB 1: NEGOTIATION & OFFERS ───────────────────────── */}
            {activeTab === "negotiation" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
                  gap: "1.5rem",
                  alignItems: "start",
                }}
              >
                <OfferEvaluator />
                <NegotiationScript />
              </div>
            )}

            {/* ─── TAB 2: INTERVIEW PREP & PITCH ───────────────────────── */}
            {activeTab === "interview" && (
              <div style={{ display: "grid", gap: "1.75rem" }}>
                {/* Narrative Studio Card */}
                <div
                  className="card"
                  style={{
                    padding: "1.6rem",
                    display: "grid",
                    gap: "1.2rem",
                    borderRadius: "14px",
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "10px",
                          background: "linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(99, 102, 241, 0.2))",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--uprole-purple)",
                          border: "1px solid rgba(124, 58, 237, 0.3)",
                        }}
                      >
                        <MessageSquare size={18} />
                      </div>
                      <div>
                        <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.15rem", fontWeight: 700, margin: 0, color: "var(--text)" }}>
                          Narrative Studio
                        </h3>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        padding: "0.2rem 0.6rem",
                        borderRadius: "999px",
                        background: "rgba(124, 58, 237, 0.12)",
                        color: "var(--uprole-purple)",
                        border: "1px solid rgba(124, 58, 237, 0.25)",
                      }}
                    >
                      Executive Pitch Engine
                    </span>
                  </div>

                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
                    Craft your professional elevator pitch tailored to specific stakeholders — interview panels, recruiter DMs, LinkedIn about summary, or coffee networking.
                  </p>

                  {/* Audience Selector Chips */}
                  <div>
                    <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text)", display: "block", marginBottom: "0.45rem" }}>
                      Target Delivery Channel:
                    </label>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      {[
                        { value: "interview", label: "Interview Intro (Tell Me About Yourself)" },
                        { value: "recruiter", label: "Recruiter InMail / Cold DM" },
                        { value: "linkedin", label: "LinkedIn Summary & About" },
                        { value: "networking", label: "Executive Coffee Intro" },
                      ].map((opt) => {
                        const isSel = narrativeAudience === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setNarrativeAudience(opt.value);
                              setShowStoryModal(false);
                              setCareerStory("");
                            }}
                            style={{
                              padding: "0.45rem 0.9rem",
                              borderRadius: "999px",
                              border: isSel ? "1.5px solid var(--uprole-purple)" : "1px solid var(--border)",
                              background: isSel ? "rgba(124, 58, 237, 0.12)" : "var(--bg-elevated)",
                              color: isSel ? "var(--uprole-purple)" : "var(--text-muted)",
                              fontSize: "0.8rem",
                              fontWeight: isSel ? 700 : 500,
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                            }}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <ToneCalibrator value={toneValue} onChange={setToneValue} />

                  {/* Output script */}
                  {showStoryModal && careerStory ? (
                    <div
                      style={{
                        background: "rgba(124, 58, 237, 0.04)",
                        border: "1px solid rgba(124, 58, 237, 0.25)",
                        borderRadius: "12px",
                        padding: "1.3rem",
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "0.85rem",
                          paddingBottom: "0.6rem",
                          borderBottom: "1px solid rgba(124, 58, 237, 0.15)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <span style={{ fontSize: "0.78rem", fontWeight: 800, textTransform: "uppercase", color: "var(--uprole-purple)" }}>
                            Generated Pitch Script
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(careerStory);
                              setNarrativeCopied(true);
                              showToast("Pitch copied to clipboard", "success");
                              setTimeout(() => setNarrativeCopied(false), 2000);
                            }}
                            style={{
                              background: "var(--bg-elevated)",
                              border: "1px solid var(--border)",
                              borderRadius: "6px",
                              padding: "0.3rem 0.7rem",
                              cursor: "pointer",
                              color: narrativeCopied ? "#10B981" : "var(--text)",
                              fontSize: "0.78rem",
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              gap: "0.35rem",
                            }}
                          >
                            {narrativeCopied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                            {narrativeCopied ? "Copied!" : "Copy"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowStoryModal(false);
                              setCareerStory("");
                            }}
                            className="btn-secondary"
                            style={{ fontSize: "0.78rem", padding: "0.3rem 0.7rem" }}
                          >
                            Regenerate
                          </button>
                        </div>
                      </div>
                      <p style={{ whiteSpace: "pre-wrap", fontSize: "0.9rem", lineHeight: 1.7, margin: 0, color: "var(--text-primary)" }}>
                        {careerStory}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <button
                        type="button"
                        onClick={fetchCareerStory}
                        disabled={careerStoryLoading}
                        style={{
                          padding: "0.65rem 1.4rem",
                          fontSize: "0.88rem",
                          fontWeight: 800,
                          borderRadius: "10px",
                          background: "var(--accent-grad)",
                          color: "#101B3B",
                          boxShadow: "0 4px 18px rgba(245, 158, 11, 0.35)",
                          border: "none",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {careerStoryLoading ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Composing High-Impact Pitch...
                          </>
                        ) : (
                          <>
                            <Sparkles size={16} />
                            Generate Tailored Pitch
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* AI Predicted Interview Questions */}
                <div
                  className="card"
                  style={{
                    padding: "1.6rem",
                    display: "grid",
                    gap: "1.3rem",
                    borderRadius: "14px",
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "10px",
                          background: "linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.2))",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--brand-amber)",
                          border: "1px solid rgba(245, 158, 11, 0.3)",
                        }}
                      >
                        <Target size={18} />
                      </div>
                      <div>
                        <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.15rem", fontWeight: 700, margin: 0, color: "var(--text)" }}>
                          AI-Predicted Interview Questions
                        </h3>
                      </div>
                    </div>

                    {questions.length > 0 && (
                      <button
                        type="button"
                        onClick={fetchQuestions}
                        disabled={questionsLoading}
                        className="btn-secondary"
                        style={{ padding: "0.4rem 0.85rem", fontSize: "0.8rem", borderRadius: "8px" }}
                      >
                        {questionsLoading ? "Regenerating..." : "Regenerate Questions"}
                      </button>
                    )}
                  </div>

                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
                    Tailored technical, architectural, and behavioral questions extracted directly from your resume's past responsibilities and target tier.
                  </p>

                  {questions.length === 0 ? (
                    <div>
                      <button
                        type="button"
                        onClick={fetchQuestions}
                        disabled={questionsLoading}
                        style={{
                          padding: "0.65rem 1.4rem",
                          fontSize: "0.88rem",
                          fontWeight: 800,
                          borderRadius: "10px",
                          background: "var(--accent-grad)",
                          color: "#101B3B",
                          boxShadow: "0 4px 18px rgba(245, 158, 11, 0.35)",
                          border: "none",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {questionsLoading ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Simulating Interview Panel...
                          </>
                        ) : (
                          <>
                            <Target size={16} />
                            Predict Interview Questions
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gap: "1rem" }}>
                      {questions.map((q, idx) => {
                        const typeColors: Record<string, { bg: string; color: string; border: string }> = {
                          technical: { bg: "rgba(124, 58, 237, 0.1)", color: "#A78BFA", border: "rgba(124, 58, 237, 0.25)" },
                          behavioral: { bg: "rgba(16, 185, 129, 0.1)", color: "#34D399", border: "rgba(16, 185, 129, 0.25)" },
                          "experience-specific": { bg: "rgba(245, 158, 11, 0.1)", color: "#FBBF24", border: "rgba(245, 158, 11, 0.25)" },
                        };
                        const displayType = (q.type || "general").toLowerCase();
                        const tagStyle = typeColors[displayType] || typeColors.technical;

                        return (
                          <div
                            key={idx}
                            style={{
                              background: "var(--bg-elevated)",
                              border: "1px solid var(--border)",
                              padding: "1.3rem",
                              borderRadius: "12px",
                              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.02)",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.8rem", marginBottom: "0.75rem" }}>
                              <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text)", lineHeight: 1.4 }}>
                                Q{idx + 1}: {q.question}
                              </span>
                              <span
                                style={{
                                  fontSize: "0.68rem",
                                  fontWeight: 700,
                                  textTransform: "capitalize",
                                  padding: "0.2rem 0.55rem",
                                  borderRadius: "6px",
                                  background: tagStyle.bg,
                                  color: tagStyle.color,
                                  border: `1px solid ${tagStyle.border}`,
                                  flexShrink: 0,
                                }}
                              >
                                {displayType}
                              </span>
                            </div>

                            <div
                              style={{
                                padding: "0.85rem 1.1rem",
                                background: "var(--bg-2)",
                                borderRadius: "8px",
                                border: "1px solid var(--border)",
                                borderLeft: "3px solid var(--brand-amber)",
                                fontSize: "0.85rem",
                                color: "var(--text-muted)",
                                lineHeight: 1.6,
                              }}
                            >
                              <strong style={{ color: "var(--text-primary)", display: "block", marginBottom: "0.25rem", fontSize: "0.8rem" }}>
                                Suggested Talking Points &amp; STAR Structure:
                              </strong>
                              {q.suggestedAnswerTips}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Mock Interview STAR Builder */}
                  <div style={{ marginTop: "1rem" }}>
                    <MockInterview resumeId={selectedResume.id} questions={questions} />
                  </div>
                </div>
              </div>
            )}

            {/* ─── TAB 3: SKILL GAP & CAREER PATH ───────────────────────── */}
            {activeTab === "skillgap" && (
              <div style={{ display: "grid", gap: "1.75rem" }}>
                {/* Skill Gap Section */}
                <div
                  className="card"
                  style={{
                    padding: "1.6rem",
                    display: "grid",
                    gap: "1.2rem",
                    borderRadius: "14px",
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "10px",
                        background: "linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.2))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--brand-amber)",
                        border: "1px solid rgba(245, 158, 11, 0.3)",
                      }}
                    >
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.15rem", fontWeight: 700, margin: 0, color: "var(--text)" }}>
                        Skill Gap Telemetry
                      </h3>
                    </div>
                  </div>

                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
                    Compare your current resume skill inventory against hiring benchmarks for your aspiration title.
                  </p>

                  <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                    <input
                      className="input"
                      style={{
                        flex: 1,
                        minWidth: "260px",
                        fontSize: "0.9rem",
                        height: "44px",
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                        background: "var(--bg-elevated)",
                        padding: "0 1rem",
                      }}
                      placeholder="Target Role (e.g. Lead Full Stack Architect, Senior PM)..."
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && fetchSkillGap()}
                    />
                    <button
                      type="button"
                      onClick={() => fetchSkillGap()}
                      disabled={skillGapLoading}
                      style={{
                        padding: "0 1.6rem",
                        fontSize: "0.88rem",
                        fontWeight: 800,
                        height: "44px",
                        borderRadius: "10px",
                        background: "var(--accent-grad)",
                        color: "#101B3B",
                        boxShadow: "0 4px 18px rgba(245, 158, 11, 0.35)",
                        border: "none",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {skillGapLoading ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          Auditing...
                        </>
                      ) : (
                        "Analyze Gap"
                      )}
                    </button>
                  </div>

                  {/* Skill Gap Results */}
                  {skillGapData && (
                    <div style={{ display: "grid", gap: "1.4rem", borderTop: "1px solid var(--border)", paddingTop: "1.4rem", marginTop: "0.4rem" }}>
                      {/* Gap Summary Banner */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1.4rem",
                          background: "var(--bg-elevated)",
                          padding: "1.2rem 1.6rem",
                          borderRadius: "12px",
                          border: "1px solid var(--border)",
                          boxShadow: "0 2px 10px rgba(16, 27, 59, 0.03)",
                          flexWrap: "wrap",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "2.4rem",
                            fontWeight: 900,
                            fontFamily: "Syne, sans-serif",
                            color: skillGapData.gapPercentage > 50 ? "#EF4444" : skillGapData.gapPercentage > 25 ? "#F59E0B" : "#10B981",
                            lineHeight: 1,
                          }}
                        >
                          {skillGapData.gapPercentage}%
                        </div>
                        <div style={{ flex: 1, minWidth: "200px" }}>
                          <strong style={{ display: "block", fontSize: "0.95rem", color: "var(--text)" }}>
                            Skills Deficiency Index
                          </strong>
                          <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                            {skillGapData.gapPercentage > 50
                              ? "High variance from target job description. Target key missing competencies below."
                              : skillGapData.gapPercentage > 25
                              ? "Strong candidate profile. Learn recommended frameworks to maximize interview offers."
                              : "Elite alignment! Your resume qualifies directly for candidate shortlist."}
                          </span>
                        </div>
                        {skillGapData.estimatedWeeksToClose && (
                          <div
                            style={{
                              textAlign: "center",
                              background: "rgba(245,158,11,0.1)",
                              border: "1px solid rgba(245,158,11,0.25)",
                              borderRadius: "10px",
                              padding: "0.65rem 1.1rem",
                            }}
                          >
                            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>
                              Est. Ramp Up
                            </div>
                            <div style={{ fontSize: "1.45rem", fontWeight: 900, color: "var(--brand-amber)", fontFamily: "Syne, sans-serif", lineHeight: 1.1 }}>
                              ~{skillGapData.estimatedWeeksToClose} wks
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Matched vs Missing Skills */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
                        <div
                          style={{
                            background: "rgba(16, 185, 129, 0.03)",
                            border: "1px solid rgba(16, 185, 129, 0.2)",
                            padding: "1.2rem",
                            borderRadius: "12px",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.8rem" }}>
                            <CheckCircle2 size={16} className="text-emerald-500" />
                            <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "#10B981" }}>
                              Matched Skills ({skillGapData.matchedSkills?.length || 0})
                            </span>
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                            {skillGapData.matchedSkills?.map((s) => (
                              <span
                                key={s}
                                style={{
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  padding: "0.25rem 0.6rem",
                                  borderRadius: "6px",
                                  background: "rgba(16, 185, 129, 0.12)",
                                  color: "#10B981",
                                  border: "1px solid rgba(16, 185, 129, 0.25)",
                                }}
                              >
                                {s}
                              </span>
                            ))}
                            {(!skillGapData.matchedSkills || skillGapData.matchedSkills.length === 0) && (
                              <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>None identified</span>
                            )}
                          </div>
                        </div>

                        <div
                          style={{
                            background: "rgba(239, 68, 68, 0.03)",
                            border: "1px solid rgba(239, 68, 68, 0.2)",
                            padding: "1.2rem",
                            borderRadius: "12px",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.8rem" }}>
                            <AlertCircle size={16} className="text-rose-500" />
                            <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "#EF4444" }}>
                              Missing Requirements ({skillGapData.missingSkills?.length || 0})
                            </span>
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                            {skillGapData.missingSkills?.map((s) => (
                              <span
                                key={s}
                                style={{
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  padding: "0.25rem 0.6rem",
                                  borderRadius: "6px",
                                  background: "rgba(239, 68, 68, 0.1)",
                                  color: "#EF4444",
                                  border: "1px solid rgba(239, 68, 68, 0.25)",
                                }}
                              >
                                {s}
                              </span>
                            ))}
                            {(!skillGapData.missingSkills || skillGapData.missingSkills.length === 0) && (
                              <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>None missing! Full coverage.</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Recommended Courses */}
                      {skillGapData.recommendedCourses && skillGapData.recommendedCourses.length > 0 && (
                        <div
                          style={{
                            background: "rgba(245, 158, 11, 0.04)",
                            border: "1px solid rgba(245, 158, 11, 0.2)",
                            borderRadius: "12px",
                            padding: "1.2rem",
                          }}
                        >
                          <p style={{ margin: "0 0 0.8rem", fontWeight: 700, fontSize: "0.85rem", color: "var(--brand-amber)" }}>
                            Recommended Acceleration Pathways:
                          </p>
                          <div style={{ display: "grid", gap: "0.5rem" }}>
                            {skillGapData.recommendedCourses.map((c, i) => (
                              <div
                                key={i}
                                style={{
                                  padding: "0.55rem 0.85rem",
                                  borderRadius: "8px",
                                  background: "var(--bg-elevated)",
                                  border: "1px solid var(--border)",
                                  fontSize: "0.85rem",
                                  color: "var(--text-primary)",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                }}
                              >
                                <span style={{ color: "var(--brand-amber)", fontWeight: 800 }}>•</span>
                                <span>{c}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Learning Path Recommender */}
                {skillGapData && skillGapData.missingSkills && skillGapData.missingSkills.length > 0 && (
                  <LearningPathRecommender
                    targetRole={targetRole}
                    missingSkills={skillGapData.missingSkills}
                    gapPercentage={skillGapData.gapPercentage}
                  />
                )}

                {/* Next Step Career Recommendations */}
                <div
                  className="card"
                  style={{
                    padding: "1.6rem",
                    display: "grid",
                    gap: "1.2rem",
                    borderRadius: "14px",
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "10px",
                          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#10B981",
                          border: "1px solid rgba(16, 185, 129, 0.3)",
                        }}
                      >
                        <TrendingUp size={18} />
                      </div>
                      <div>
                        <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.15rem", fontWeight: 700, margin: 0, color: "var(--text)" }}>
                          Next-Step Career Trajectory Recommendations
                        </h3>
                      </div>
                    </div>

                    {careerRecommendations.length > 0 && (
                      <button
                        type="button"
                        onClick={fetchCareerRecommendations}
                        disabled={recommendationsLoading}
                        className="btn-secondary"
                        style={{ padding: "0.4rem 0.85rem", fontSize: "0.8rem", borderRadius: "8px" }}
                      >
                        {recommendationsLoading ? "Refreshing..." : "Refresh Paths"}
                      </button>
                    )}
                  </div>

                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
                    High-affinity career trajectories that leverage your current accomplishments for step-function promotion.
                  </p>

                  {careerRecommendations.length === 0 ? (
                    <div>
                      <button
                        type="button"
                        onClick={fetchCareerRecommendations}
                        disabled={recommendationsLoading}
                        style={{
                          padding: "0.65rem 1.4rem",
                          fontSize: "0.88rem",
                          fontWeight: 800,
                          borderRadius: "10px",
                          background: "var(--accent-grad)",
                          color: "#101B3B",
                          boxShadow: "0 4px 18px rgba(245, 158, 11, 0.35)",
                          border: "none",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {recommendationsLoading ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Calculating Trajectory Vectors...
                          </>
                        ) : (
                          <>
                            <TrendingUp size={16} />
                            Explore Next-Step Career Paths
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gap: "1rem" }}>
                      {careerRecommendations.map((rec, idx) => {
                        const demandColors: Record<string, { bg: string; color: string }> = {
                          high: { bg: "rgba(16, 185, 129, 0.12)", color: "#10B981" },
                          medium: { bg: "rgba(245, 158, 11, 0.12)", color: "#F59E0B" },
                          low: { bg: "rgba(239, 68, 68, 0.12)", color: "#EF4444" },
                        };
                        const dStyle = demandColors[(rec.marketDemand || "medium").toLowerCase()] || demandColors.medium;

                        return (
                          <div
                            key={idx}
                            style={{
                              background: "var(--bg-elevated)",
                              border: "1px solid var(--border)",
                              padding: "1.3rem",
                              borderRadius: "12px",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.8rem", marginBottom: "0.6rem", flexWrap: "wrap" }}>
                              <strong style={{ fontSize: "1.05rem", color: "var(--text)", fontFamily: "Syne, sans-serif" }}>
                                {rec.roleTitle}
                              </strong>
                              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                <span
                                  style={{
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                    padding: "0.2rem 0.6rem",
                                    borderRadius: "6px",
                                    background: "rgba(124, 58, 237, 0.1)",
                                    color: "var(--uprole-purple)",
                                    border: "1px solid rgba(124, 58, 237, 0.25)",
                                  }}
                                >
                                  {rec.averageSalaryRange}
                                </span>
                                <span
                                  style={{
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                    padding: "0.2rem 0.6rem",
                                    borderRadius: "6px",
                                    background: dStyle.bg,
                                    color: dStyle.color,
                                  }}
                                >
                                  Demand: {rec.marketDemand}
                                </span>
                              </div>
                            </div>
                            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
                              <strong style={{ color: "var(--text-primary)" }}>Why it's a good fit: </strong>
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

            {/* ─── TAB 4: MARKET AWARENESS ───────────────────────── */}
            {activeTab === "market" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
                  gap: "1.5rem",
                  alignItems: "start",
                }}
              >
                <SalaryBenchmarker />
                <MarketTimingAlerts />
                <CompanyResearch />
                <RecruiterVisibility />
              </div>
            )}

            {/* ─── TAB 5: PLANNING & GROWTH ───────────────────────── */}
            {activeTab === "growth" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
                  gap: "1.5rem",
                  alignItems: "start",
                }}
              >
                <PromotionCaseBuilder />
                <NetworkingAssistant />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
