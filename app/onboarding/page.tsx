"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/toast-1";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Briefcase,
  MapPin,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Award,
  Zap,
  UploadCloud,
  FileText,
  Loader2,
  FolderGit2,
  GraduationCap,
  Layers,
  Compass,
  Check,
} from "lucide-react";
import { Resume } from "@/types";

const POPULAR_ROLES = [
  "Software Engineer",
  "Full Stack Developer",
  "Frontend Engineer",
  "Backend Engineer",
  "DevOps / SRE",
  "Data Scientist / AI",
  "Product Manager",
  "Mobile Engineer",
];

const POPULAR_CITIES = [
  { id: "Bangalore", label: "Bengaluru", state: "KA" },
  { id: "Delhi", label: "Delhi / NCR", state: "DL" },
  { id: "Hyderabad", label: "Hyderabad", state: "TS" },
  { id: "Mumbai", label: "Mumbai", state: "MH" },
  { id: "Pune", label: "Pune", state: "MH" },
  { id: "Chennai", label: "Chennai", state: "TN" },
  { id: "Remote", label: "Remote", state: "Pan-India" },
];

const getSeniorityTier = (years: number) => {
  if (years <= 1) {
    return {
      label: "Entry / Fresher",
      badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      description: "Foundational ATS keywords, core fundamentals & entry salary bands",
    };
  }
  if (years <= 4) {
    return {
      label: "Mid-Level Specialist",
      badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      description: "Project impact metrics, technical depth & mid-tier product benchmarks",
    };
  }
  if (years <= 8) {
    return {
      label: "Senior Professional",
      badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      description: "Architectural ownership, leadership signals & senior CTC bands",
    };
  }
  if (years <= 12) {
    return {
      label: "Lead / Staff Architect",
      badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      description: "Cross-org strategy, tech governance & executive recruitment scoring",
    };
  }
  return {
    label: "Director / Executive",
    badgeClass: "bg-amber-500/20 text-amber-500 border-amber-500/30",
    description: "P&L impact, organizational design & C-suite career positioning",
  };
};

export default function OnboardingPage() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  // Multi-step Wizard: 0 (Welcome), 1 (Context), 2 (Upload), 3 (Intelligence Review)
  const [step, setStep] = useState<number>(0);

  // Step 1: Context State
  const [role, setRole] = useState("Software Engineer");
  const [city, setCity] = useState("Bangalore");
  const [yoe, setYoe] = useState(2);
  const [submittingContext, setSubmittingContext] = useState(false);

  // Step 2: Resume Upload State
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState("Preparing parser...");
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 3: Intelligence Review State
  const [extractedResume, setExtractedResume] = useState<Resume | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  const seniority = getSeniorityTier(yoe);

  // Save Step 1 Context
  const handleSaveContext = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingContext(true);

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole: role, targetCity: city, yoe }),
      });

      if (res.ok) {
        showToast("Career trajectory preferences saved!", "success");
        setStep(2);
      } else {
        showToast("Could not save preferences. Please try again.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error saving onboarding details.", "error");
    } finally {
      setSubmittingContext(false);
    }
  };

  // Step 2: Handle File Upload & Parsing
  const handleFileSelect = async (selectedFile: File) => {
    const validTypes = [
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (
      !validTypes.includes(selectedFile.type) &&
      !selectedFile.name.endsWith(".pdf") &&
      !selectedFile.name.endsWith(".txt")
    ) {
      setUploadError("Please upload a valid PDF or TXT resume file.");
      return;
    }

    if (selectedFile.size > 6 * 1024 * 1024) {
      setUploadError("File size exceeds 6MB. Please upload a smaller file.");
      return;
    }

    setFile(selectedFile);
    setUploadError("");
    setUploading(true);
    setUploadProgress(15);
    setUploadStage("Extracting text from resume...");

    try {
      // 1. Parse text from file
      const formData = new FormData();
      formData.append("file", selectedFile);

      const parseRes = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      if (!parseRes.ok) {
        const errData = await parseRes.json().catch(() => null);
        throw new Error(errData?.error || "Failed to extract text from file.");
      }

      const parseData = await parseRes.json();
      const resumeText = parseData.text;
      const fileName = parseData.fileName || selectedFile.name;
      const pdfUrl = parseData.pdfUrl || null;

      setUploadProgress(50);
      setUploadStage("Analyzing experience, projects & skills...");

      // 2. Run deep intelligence analysis and store in database
      const analyzeRes = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, fileName, pdfUrl }),
      });

      if (!analyzeRes.ok) {
        const errData = await analyzeRes.json().catch(() => null);
        throw new Error(errData?.error || "Failed to analyze resume data.");
      }

      const row = await analyzeRes.json();
      setUploadProgress(100);
      setUploadStage("Career Intelligence Extraction Complete!");

      setExtractedResume(row);
      showToast("Resume successfully parsed into Career Memory!", "success");

      // Advance to review step
      setTimeout(() => {
        setStep(3);
      }, 700);
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || "Failed to parse resume. You can skip and add details later.");
    } finally {
      setUploading(false);
    }
  };

  const handleSkipUpload = () => {
    showToast("You can upload or enter experience anytime from your workspace.", "info");
    router.push("/pulse");
  };

  if (authLoading || !user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg-page)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
        }}
      >
        <div className="bg-transparent dark:bg-white/95 py-1 px-3 rounded-[8px] flex items-center shadow-sm">
          <Image
            src="/UpRole logo.png"
            alt="UpRole"
            width={120}
            height={30}
            style={{ objectFit: "contain", height: "auto" }}
          />
        </div>
        <div className="spinner" style={{ width: 36, height: 36 }} />
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
          Loading your career session...
        </p>
      </div>
    );
  }

  const stepTitles = [
    "Welcome to UpRole",
    "Career Trajectory",
    "Resume Intelligence",
    "Intelligence Review",
  ];

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        background: "var(--bg-page)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Ambient Brand Glow Blobs */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          right: "-5%",
          width: "550px",
          height: "550px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, transparent 70%)",
          pointerEvents: "none",
          filter: "blur(60px)",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-10%",
          left: "-5%",
          width: "550px",
          height: "550px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(37, 99, 235, 0.10) 0%, transparent 70%)",
          pointerEvents: "none",
          filter: "blur(60px)",
          zIndex: 0,
        }}
      />

      {/* Top Navigation Bar */}
      <header
        style={{
          position: "relative",
          zIndex: 30,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.25rem 2rem",
          borderBottom: "1px solid var(--border)",
          backdropFilter: "blur(12px)",
          background: "var(--bg-glass-nav)",
        }}
      >
        <Link href="/" className="flex items-center no-underline">
          <div className="bg-transparent dark:bg-white/95 py-1 px-2.5 rounded-[8px] flex items-center shadow-xs">
            <Image
              src="/UpRole logo.png"
              alt="UpRole"
              width={110}
              height={28}
              style={{ objectFit: "contain", height: "auto" }}
            />
          </div>
        </Link>

        {/* Wizard Step Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] text-xs font-semibold text-[var(--text-muted)]">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>
              Step {step + 1} of 4 • {stepTitles[step]}
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Body */}
      <main
        style={{
          position: "relative",
          zIndex: 10,
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1.5rem 3rem",
        }}
      >
        <div className="w-full max-w-5xl">
          {/* ═════════════════════════════════════════════════════════════════
              STEP 0: WELCOME TO UPROLE (PLATFORM PROMISE)
              ═════════════════════════════════════════════════════════════════ */}
          {step === 0 && (
            <div className="max-w-3xl mx-auto text-center space-y-8 animate-in fade-in duration-300">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 shadow-xs">
                <Sparkles size={13} />
                <span>The Career Operating System</span>
              </div>

              <div className="space-y-4">
                <h1 className="text-3xl sm:text-5xl font-black font-['Syne',sans-serif] text-[var(--text-primary)] tracking-tight leading-[1.15]">
                  Understand your value. <br className="hidden sm:inline" />
                  Build your potential. <br className="hidden sm:inline" />
                  <span className="text-amber-500">Turn it into opportunity.</span>
                </h1>
                <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
                  UpRole is not another static resume editor. It is your living career intelligence
                  system — transforming raw experience into verified business contributions and
                  strategic market value.
                </p>
              </div>

              {/* Three Value Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                <div className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-2.5 shadow-sm">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold">
                    <Layers size={18} />
                  </div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)] font-['Syne',sans-serif]">
                    Career Memory
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    A single system of record for all roles, projects, and achievements. Never start
                    from a blank page again.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-2.5 shadow-sm">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center font-bold">
                    <TrendingUp size={18} />
                  </div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)] font-['Syne',sans-serif]">
                    Guided Impact Discovery
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    Turn vague responsibilities into quantified, verified business impact through
                    guided discovery.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-2.5 shadow-sm">
                  <div className="w-9 h-9 rounded-xl bg-violet-500/15 text-violet-500 flex items-center justify-center font-bold">
                    <Award size={18} />
                  </div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)] font-['Syne',sans-serif]">
                    Career Value Profile
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    Synthesizes capabilities, impact themes, and progression signals to position you
                    for higher compensation.
                  </p>
                </div>
              </div>

              {/* Next CTA */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 shadow-md shadow-amber-500/25 bg-amber-500 hover:bg-amber-400 text-brand-navy"
                >
                  <span>Begin Calibration</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════
              STEP 1: CAREER CONTEXT (ROLE, CITY, YOE)
              ═════════════════════════════════════════════════════════════════ */}
          {step === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center animate-in fade-in duration-300">
              {/* Left Column: Context & Real-Time Preview */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 mb-3">
                    <Sparkles size={13} />
                    <span>Career Calibration</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold font-['Syne',sans-serif] text-[var(--text-primary)] tracking-tight leading-[1.2] mb-3">
                    Calibrate Your Career Trajectory.
                  </h1>
                  <p className="text-[var(--text-muted)] text-[14px] leading-relaxed">
                    Configure your target preferences so UpRole can fine-tune ATS keyword matching,
                    Indian tech salary benchmarks, and AI interview prep specifically for you.
                  </p>
                </div>

                {/* Dynamic Live Profile Calibrator Card */}
                <div
                  className="p-5 rounded-2xl border transition-all relative overflow-hidden"
                  style={{
                    background: "var(--card)",
                    borderColor: "var(--border)",
                    boxShadow: "var(--shadow-md)",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "3px",
                      background: "var(--accent-grad)",
                    }}
                  />

                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border)]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold text-sm">
                        <Zap size={16} />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-[var(--text-muted)] block uppercase tracking-wider">
                          Live Calibration
                        </span>
                        <span className="text-sm font-bold text-[var(--text-primary)]">
                          {role || "Target Role"}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${seniority.badgeClass}`}
                    >
                      {seniority.label}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                      <span>
                        ATS Scoring tuned for{" "}
                        <strong className="text-[var(--text-primary)]">{role || "Your Role"}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <CheckCircle2 size={15} className="text-blue-500 shrink-0" />
                      <span>
                        Salary benchmarks mapped to{" "}
                        <strong className="text-[var(--text-primary)]">{city}</strong> tech market
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <CheckCircle2 size={15} className="text-amber-500 shrink-0" />
                      <span>
                        STAR interview models tailored to{" "}
                        <strong className="text-[var(--text-primary)]">{yoe} YoE</strong> seniority
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                    <Award size={14} className="text-amber-500 shrink-0" />
                    <span>{seniority.description}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <ArrowLeft size={13} />
                  <span>Back to Overview</span>
                </button>
              </div>

              {/* Right Column: Interactive Setup Form */}
              <div className="lg:col-span-7">
                <div
                  className="p-6 sm:p-8 rounded-2xl border transition-all"
                  style={{
                    background: "var(--card)",
                    borderColor: "var(--border)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.05)",
                  }}
                >
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--border)]">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-extrabold font-['Syne',sans-serif] text-[var(--text-primary)] m-0">
                        Calibrate Target Profile
                      </h2>
                      <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 mb-0">
                        Takes under 30 seconds. You can modify these anytime later.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveContext} className="space-y-5">
                    {/* Field 1: Target Role */}
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5 mb-2">
                        <Briefcase size={14} className="text-amber-500" />
                        Target Job Title
                      </label>
                      <input
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="e.g. Senior Frontend Engineer"
                        className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold outline-none transition-all mb-2"
                        style={{
                          background: "var(--bg-elevated)",
                          borderColor: "var(--border)",
                          color: "var(--text-primary)",
                        }}
                        required
                      />

                      <div className="flex flex-wrap gap-1.5">
                        {POPULAR_ROLES.map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setRole(r)}
                            className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                              role === r
                                ? "bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400"
                                : "bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Field 2: Target City */}
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5 mb-2">
                        <MapPin size={14} className="text-amber-500" />
                        Target Tech Hub / Location
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                        {POPULAR_CITIES.map((c) => {
                          const isSelected = city === c.id;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => setCity(c.id)}
                              className={`p-2 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer flex flex-col justify-between ${
                                isSelected
                                  ? "bg-amber-500 text-brand-navy border-amber-500 shadow-xs"
                                  : "bg-[var(--bg-elevated)] text-[var(--text-primary)] border-[var(--border)] hover:border-amber-500/50"
                              }`}
                            >
                              <span className="font-bold">{c.label}</span>
                              <span
                                className={`text-[10px] mt-0.5 ${
                                  isSelected
                                    ? "text-brand-navy/80 font-medium"
                                    : "text-[var(--text-muted)]"
                                }`}
                              >
                                {c.state}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Field 3: Years of Experience */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                          <TrendingUp size={14} className="text-amber-500" />
                          Years of Experience
                        </label>
                        <span className="text-sm font-black text-amber-500 font-['Syne',sans-serif]">
                          {yoe} {yoe === 1 ? "Year" : "Years"}
                        </span>
                      </div>

                      <input
                        type="range"
                        min="0"
                        max="20"
                        value={yoe}
                        onChange={(e) => setYoe(parseInt(e.target.value) || 0)}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        style={{ background: "var(--bg-elevated)" }}
                      />

                      <div className="flex items-center justify-between mt-2">
                        {[0, 2, 5, 8, 12, 15].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setYoe(preset)}
                            className={`text-[11px] px-2 py-0.5 rounded-md border font-semibold transition-all cursor-pointer ${
                              yoe === preset
                                ? "bg-amber-500 text-brand-navy border-amber-500"
                                : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)]"
                            }`}
                          >
                            {preset === 0 ? "Fresher" : `${preset}y`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Submit CTA */}
                    <button
                      type="submit"
                      disabled={submittingContext}
                      className="w-full py-3.5 px-6 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 bg-amber-500 hover:bg-amber-400 text-brand-navy shadow-md shadow-amber-500/25"
                    >
                      {submittingContext ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Saving Preferences...</span>
                        </>
                      ) : (
                        <>
                          <span>Continue to Resume Upload</span>
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════
              STEP 2: RESUME UPLOAD (INLINE EXTRACTION)
              ═════════════════════════════════════════════════════════════════ */}
          {step === 2 && (
            <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                  <UploadCloud size={13} />
                  <span>Feed Your Career Memory</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold font-['Syne',sans-serif] text-[var(--text-primary)]">
                  Upload Your Existing Resume
                </h1>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-lg mx-auto">
                  UpRole automatically extracts your employment history, technical projects, and
                  skills into your Career Memory. No data is shared with employers.
                </p>
              </div>

              {/* Upload Dropzone */}
              <div
                className={`p-8 sm:p-12 rounded-3xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center space-y-4 ${
                  uploading
                    ? "border-amber-500 bg-amber-500/[0.03]"
                    : "border-[var(--border)] hover:border-amber-500/60 bg-[var(--card)]"
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileSelect(e.dataTransfer.files[0]);
                  }
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                  accept=".pdf,.txt"
                  className="hidden"
                />

                {uploading ? (
                  <div className="w-full space-y-4 py-4">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto">
                      <Loader2 size={32} className="animate-spin" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[var(--text-primary)]">
                        {uploadStage}
                      </div>
                      <div className="text-xs text-[var(--text-muted)] mt-1">
                        Extracting career signals and building your profile...
                      </div>
                    </div>

                    <div className="w-full max-w-xs mx-auto bg-[var(--bg-elevated)] h-2 rounded-full overflow-hidden border border-[var(--border)]">
                      <div
                        className="bg-amber-500 h-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto shadow-sm">
                      <FileText size={28} />
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-bold text-[var(--text-primary)]">
                        {file ? file.name : "Drag & drop your resume file here"}
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">
                        Supports PDF or TXT up to 6MB
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-2.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-brand-navy transition-all shadow-md shadow-amber-500/25 cursor-pointer"
                    >
                      Browse File
                    </button>
                  </>
                )}
              </div>

              {uploadError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 text-center">
                  {uploadError}
                </div>
              )}

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <ArrowLeft size={13} />
                  <span>Back to Context</span>
                </button>

                <button
                  type="button"
                  onClick={handleSkipUpload}
                  className="text-xs font-bold text-[var(--text-secondary)] hover:text-amber-500 transition-colors cursor-pointer"
                >
                  Skip for now • Enter Workspace →
                </button>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════
              STEP 3: RESUME INTELLIGENCE REVIEW
              ═════════════════════════════════════════════════════════════════ */}
          {step === 3 && (
            <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                  <CheckCircle2 size={13} />
                  <span>Extraction Verified</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold font-['Syne',sans-serif] text-[var(--text-primary)]">
                  Resume Intelligence Captured
                </h1>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-lg mx-auto">
                  Your baseline experience has been parsed and mapped into Career Memory categories.
                </p>
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-center space-y-1">
                  <Briefcase size={20} className="mx-auto text-amber-500" />
                  <div className="text-lg font-black text-[var(--text-primary)] font-['Syne',sans-serif]">
                    {extractedResume?.resume_data?.workExperience?.length ?? 0}
                  </div>
                  <div className="text-[10px] font-bold uppercase text-[var(--text-muted)]">
                    Roles Found
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-center space-y-1">
                  <FolderGit2 size={20} className="mx-auto text-blue-500" />
                  <div className="text-lg font-black text-[var(--text-primary)] font-['Syne',sans-serif]">
                    {extractedResume?.resume_data?.projects?.length ?? 0}
                  </div>
                  <div className="text-[10px] font-bold uppercase text-[var(--text-muted)]">
                    Projects
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-center space-y-1">
                  <Zap size={20} className="mx-auto text-emerald-500" />
                  <div className="text-lg font-black text-[var(--text-primary)] font-['Syne',sans-serif]">
                    {((extractedResume?.resume_data?.skills?.technical?.length ?? 0) +
                      (extractedResume?.resume_data?.skills?.soft?.length ?? 0))}
                  </div>
                  <div className="text-[10px] font-bold uppercase text-[var(--text-muted)]">
                    Skills Detected
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-center space-y-1">
                  <GraduationCap size={20} className="mx-auto text-violet-500" />
                  <div className="text-lg font-black text-[var(--text-primary)] font-['Syne',sans-serif]">
                    {extractedResume?.resume_data?.education?.length ?? 0}
                  </div>
                  <div className="text-[10px] font-bold uppercase text-[var(--text-muted)]">
                    Education
                  </div>
                </div>
              </div>

              {/* Roles Preview Card */}
              {extractedResume?.resume_data?.workExperience &&
                extractedResume.resume_data.workExperience.length > 0 && (
                  <div className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Extracted Roles
                    </div>
                    <div className="space-y-2">
                      {extractedResume.resume_data.workExperience.slice(0, 3).map((w, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-[var(--text-primary)]">{w.role}</span>
                            <span className="text-[var(--text-muted)]"> · {w.company}</span>
                          </div>
                          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                            Mapped
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Next Actions */}
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => router.push("/pulse")}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all bg-amber-500 hover:bg-amber-400 text-brand-navy shadow-md shadow-amber-500/25"
                >
                  <Compass size={16} />
                  <span>Launch Pulse (Career Overview)</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  onClick={() => router.push("/value")}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer border border-[var(--border)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition-all"
                >
                  <span>Go to Value Module</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
