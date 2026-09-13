"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ConcentricLoader from "@/components/ui/Loader";
import ResumeDocument from "@/components/ResumeDocument";
import { useAuth } from "@/hooks/useAuth";
import { Resume, ResumeData, JDMatch, BulletFeedback } from "@/types";
import {
  Target,
  Sparkles,
  CheckCircle2,
  Edit3,
  FileText,
  Zap,
  TrendingUp,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  ArrowRight,
  ArrowLeft,
  X,
  RefreshCw,
  ChevronDown,
  Building2,
  ClipboardPaste,
  Check,
  ShieldCheck,
  FileCheck2,
  ZoomIn,
  ZoomOut,
  Wand2,
  CheckCheck,
  Palette,
} from "lucide-react";
import { CREDIT_COSTS } from "@/lib/creditCosts";

const getScoreColor = (score: number) => {
  if (score >= 70) return { color: "#10B981", bg: "rgba(16, 185, 129, 0.12)", border: "rgba(16, 185, 129, 0.35)", gradient: "linear-gradient(135deg, #10B981, #059669)" };
  if (score >= 45) return { color: "#F59E0B", bg: "rgba(245, 158, 11, 0.12)", border: "rgba(245, 158, 11, 0.35)", gradient: "linear-gradient(135deg, #F59E0B, #D97706)" };
  return { color: "#EF4444", bg: "rgba(239, 68, 68, 0.12)", border: "rgba(239, 68, 68, 0.35)", gradient: "linear-gradient(135deg, #EF4444, #DC2626)" };
};

const scoreLabel = (score: number) => {
  if (score >= 80) return "Excellent Match";
  if (score >= 70) return "Strong Match";
  if (score >= 45) return "Partial Match";
  return "Weak Match";
};

const STEPS = [
  { num: 1, label: "Select Resume", caption: "Choose baseline CV", icon: FileText },
  { num: 2, label: "Target Job & ATS", caption: "JD & platform rules", icon: Target },
  { num: 3, label: "AI Match & Rewrite", caption: "Audit & 1-click apply", icon: Sparkles },
  { num: 4, label: "Save & Export", caption: "Store tailored copy", icon: Save },
];

const PRESET_COMPANIES = [
  { name: "Google", ats: "greenhouse", tag: "Greenhouse" },
  { name: "Amazon", ats: "workday", tag: "Workday" },
  { name: "Microsoft", ats: "icims", tag: "iCIMS" },
  { name: "Meta", ats: "workday", tag: "Workday" },
  { name: "Stripe", ats: "greenhouse", tag: "Greenhouse" },
  { name: "TCS", ats: "taleo", tag: "Oracle Taleo" },
  { name: "Netflix", ats: "lever", tag: "Lever" },
];

const SAMPLE_JDS = [
  {
    role: "Senior Full Stack Engineer",
    company: "Stripe",
    ats: "greenhouse",
    text: `About the Role:
We are seeking a Senior Full Stack Engineer to architect, build, and optimize developer-facing dashboards and high-volume transaction processing systems.

Key Responsibilities:
• Architect, design, and maintain scalable web applications using TypeScript, React, Next.js, and Node.js microservices.
• Optimize SQL queries, database indexing, and Redis caching layers for sub-100ms latency across high-throughput endpoints.
• Collaborate with cross-functional product and security teams to implement robust financial APIs and webhook integrations.
• Drive engineering excellence through automated testing (Jest, Playwright), CI/CD pipelines, and proactive telemetry monitoring (Datadog).

Requirements:
• 4+ years of professional software engineering experience shipping production TypeScript and React applications.
• Strong hands-on proficiency with relational databases (PostgreSQL), RESTful/GraphQL APIs, and Docker/Kubernetes containerization.
• Proven track record of improving system uptime, reducing latency, and mentoring junior engineers.`,
  },
  {
    role: "Lead Systems Analyst & Developer",
    company: "Amazon",
    ats: "workday",
    text: `About the Position:
Amazon is looking for a Lead Systems Analyst / Software Engineer to lead end-to-end architecture and modernization of mission-critical enterprise systems.

Core Responsibilities:
• Lead technical requirements gathering, system architecture diagrams, and service implementation across .NET Core, C#, and React.
• Perform root-cause analysis on distributed systems bottlenecks, database deadlocks, and event-driven pipelines (Kafka / AWS SQS).
• Guide cross-functional stakeholders through sprint planning, technical risk mitigation, and compliance security audits.
• Automate build, test, and deployment workflows using modern CI/CD pipelines and AWS CloudFormation / Terraform.

Basic Qualifications:
• 5+ years of software development experience with C#, ASP.NET Core, React, and SQL Server / PostgreSQL.
• Experience with cloud infrastructure (AWS or Azure), microservices design patterns, and containerized deployments.
• Strong analytical problem-solving skills, stakeholder communication, and high standards for code quality.`,
  },
];

const ATS_PLATFORM_OPTIONS = [
  { id: "generic", name: "Universal Modern ATS", badge: "Standard", desc: "General algorithmic keyword & format scanner" },
  { id: "workday", name: "Workday ATS", badge: "Enterprise", desc: "Strict single-column layout, high penalty for multi-column tables" },
  { id: "greenhouse", name: "Greenhouse", badge: "Tech Standard", desc: "Structured JSON parsing, prioritizes skill taxonomy & metrics" },
  { id: "lever", name: "Lever", badge: "Startup Favorite", desc: "Timeline & impact oriented, balances skills with experience" },
  { id: "icims", name: "iCIMS", badge: "Enterprise Heavy", desc: "Strict keyword density matching & exact phrase parsing" },
  { id: "taleo", name: "Oracle Taleo", badge: "Legacy Corporate", desc: "Text extraction into enterprise relational database" },
];

// Helper: 5-stage resilient matching of AI bullet to actual resume workExperience bullet
function findBulletLocation(
  workExperience: { company?: string; role?: string; bullets: string[] }[],
  b: { originalText: string; section?: string; bulletIndex?: number }
): { expIndex: number; bulletIndex: number } | null {
  const clean = (s: string) =>
    (s || "")
      .replace(/^[\s•\-\*"'“”]+|[\s"'“”]+$/g, "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");

  const targetClean = clean(b.originalText);
  if (!targetClean) return null;

  // 1. Exact string match
  for (let eIdx = 0; eIdx < workExperience.length; eIdx++) {
    const exp = workExperience[eIdx];
    const bIdx = exp.bullets.findIndex((bullet) => bullet === b.originalText);
    if (bIdx !== -1) return { expIndex: eIdx, bulletIndex: bIdx };
  }

  // 2. Cleaned / normalized match
  for (let eIdx = 0; eIdx < workExperience.length; eIdx++) {
    const exp = workExperience[eIdx];
    const bIdx = exp.bullets.findIndex((bullet) => clean(bullet) === targetClean);
    if (bIdx !== -1) return { expIndex: eIdx, bulletIndex: bIdx };
  }

  // 3. Substring inclusion match
  for (let eIdx = 0; eIdx < workExperience.length; eIdx++) {
    const exp = workExperience[eIdx];
    const bIdx = exp.bullets.findIndex((bullet) => {
      const c = clean(bullet);
      return c.length > 8 && (c.includes(targetClean) || targetClean.includes(c));
    });
    if (bIdx !== -1) return { expIndex: eIdx, bulletIndex: bIdx };
  }

  // 4. Section name + bulletIndex fallback
  if (typeof b.bulletIndex === "number") {
    const sec = (b.section || "").toLowerCase();
    for (let eIdx = 0; eIdx < workExperience.length; eIdx++) {
      const exp = workExperience[eIdx];
      const comp = (exp.company || "").toLowerCase();
      const role = (exp.role || "").toLowerCase();
      if ((comp && sec.includes(comp)) || (role && sec.includes(role))) {
        if (b.bulletIndex >= 0 && b.bulletIndex < exp.bullets.length) {
          return { expIndex: eIdx, bulletIndex: b.bulletIndex };
        }
      }
    }
  }

  // 5. Keyword token overlap match
  const targetWords = new Set(targetClean.split(" ").filter((w) => w.length > 3));
  if (targetWords.size > 0) {
    let bestMatch: { expIndex: number; bulletIndex: number; score: number } | null = null;
    for (let eIdx = 0; eIdx < workExperience.length; eIdx++) {
      const exp = workExperience[eIdx];
      for (let bIdx = 0; bIdx < exp.bullets.length; bIdx++) {
        const words = clean(exp.bullets[bIdx]).split(" ").filter((w) => w.length > 3);
        const overlap = words.filter((w) => targetWords.has(w)).length;
        const score = overlap / Math.max(targetWords.size, words.length);
        if (score > 0.35 && (!bestMatch || score > bestMatch.score)) {
          bestMatch = { expIndex: eIdx, bulletIndex: bIdx, score };
        }
      }
    }
    if (bestMatch) return { expIndex: bestMatch.expIndex, bulletIndex: bestMatch.bulletIndex };
  }

  return null;
}

function ScoreRing({ score, size = 96 }: { score: number; size?: number }) {
  const { color } = getScoreColor(score);
  const r = size * 0.38;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  const center = size / 2;

  return (
    <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={center} cy={center} r={r} fill="none" stroke="rgba(148, 163, 184, 0.15)" strokeWidth={size > 80 ? 7 : 5} />
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={size > 80 ? 7 : 5}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)",
            filter: `drop-shadow(0 0 6px ${color}55)`,
          }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: size > 80 ? "1.45rem" : "1.1rem", color: color, lineHeight: 1 }}>
          {score}
        </span>
        <span style={{ fontSize: "0.6rem", color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.04em", marginTop: "1px" }}>
          / 100
        </span>
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  desc,
  action,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div style={{ textAlign: "center", padding: "2.8rem 1.5rem" }}>
      <div
        style={{
          width: 58,
          height: 58,
          borderRadius: "16px",
          background: "var(--bg-2)",
          border: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 1.1rem",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <Icon size={26} color="var(--accent)" />
      </div>
      <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.05rem", margin: "0 0 0.4rem", color: "var(--text)" }}>
        {title}
      </h3>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: action ? "0 0 1.2rem" : 0, maxWidth: 400, marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 }}>
        {desc}
      </p>
      {action && (
        <button
          className="btn-primary"
          onClick={action.onClick}
          style={{
            padding: "0.65rem 1.6rem",
            fontSize: "0.88rem",
            fontWeight: 700,
            borderRadius: "10px",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Sparkles size={14} /> {action.label}
        </button>
      )}
    </div>
  );
}

export default function TailorPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [targetAtsPlatform, setTargetAtsPlatform] = useState<string>("generic");
  const [jdMatchResult, setJdMatchResult] = useState<JDMatch | null>(null);
  const [skillsTab, setSkillsTab] = useState<"all" | "hard" | "soft">("all");
  const [step3SubTab, setStep3SubTab] = useState<"bullets" | "sections" | "ats">("bullets");
  const [copiedClip, setCopiedClip] = useState(false);
  const [applyAllSuccess, setApplyAllSuccess] = useState(false);

  const [rewriteTargets, setRewriteTargets] = useState<{
    field: string;
    index?: number;
    bulletIndex?: number;
    original: string;
  }[]>([]);
  const [rewriteSuggestions, setRewriteSuggestions] = useState<Record<string, string[]>>({});
  const [rewriteLoading, setRewriteLoading] = useState<Record<string, boolean>>({});
  const [acceptedRewrites, setAcceptedRewrites] = useState<Set<string>>(new Set());
  const [expandedTarget, setExpandedTarget] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [savedNewId, setSavedNewId] = useState<string | null>(null);
  const [saveAsNewName, setSaveAsNewName] = useState("");
  const [error, setError] = useState("");
  // Authentic A4 preview zoom: default 1 (100% natural format)
  const [zoomFactor, setZoomFactor] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("jakes-resume");
  const [previewMode, setPreviewMode] = useState<"live" | "pdf">("live");
  const [showPreview, setShowPreview] = useState(false);

  const previewContainerRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [activeViewPage, setActiveViewPage] = useState<number>(1);
  const [showPageGuides, setShowPageGuides] = useState<boolean>(true);
  const [mounted, setMounted] = useState(false);

  // Measure content height and calculate page count (A4 = 1122.5px height at 96 DPI)
  useEffect(() => {
    const updatePages = () => {
      if (paperRef.current) {
        const h = paperRef.current.scrollHeight;
        const A4_HEIGHT_PX = 1122.5;
        const calculated = Math.max(1, Math.ceil((h - 20) / A4_HEIGHT_PX));
        setTotalPages(calculated);
      }
    };
    const timer = setTimeout(updatePages, 250);
    window.addEventListener("resize", updatePages);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updatePages);
    };
  }, [selectedResume, selectedTemplate, showPreview]);

  const scrollToPage = (pageNum: number) => {
    setActiveViewPage(pageNum);
    if (previewContainerRef.current) {
      const A4_HEIGHT_PX = 1122.5;
      const targetTop = (pageNum - 1) * A4_HEIGHT_PX * zoomFactor;
      previewContainerRef.current.scrollTo({
        top: targetTop,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    if (selectedResume?.template_id) {
      setSelectedTemplate(selectedResume.template_id);
    }
  }, [selectedResume?.id, selectedResume?.template_id]);

  const originalPdfUrl = (selectedResume as any)?.pdf_url || (selectedResume?.resume_data as any)?.pdf_url || "";

  const handleFitToWidth = () => {
    if (previewContainerRef.current) {
      const availableWidth = previewContainerRef.current.clientWidth - 48;
      const standardA4Px = 794;
      const fit = Math.min(1.1, Math.max(0.4, Number((availableWidth / standardA4Px).toFixed(2))));
      setZoomFactor(fit);
    } else {
      setZoomFactor(0.85);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !authLoading && !user) router.push("/login");
  }, [mounted, authLoading, user, router]);

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
      buildRewriteTargets(found.resume_data);
    }
  }, [selectedResumeId, resumes]);

  // Auto-detect ATS platform when company name or JD changes
  useEffect(() => {
    const textToCheck = `${companyName} ${jobDescription}`;
    const lower = textToCheck.toLowerCase();
    if (
      lower.includes("greenhouse") ||
      lower.includes("gh_jid") ||
      lower.includes("google") ||
      lower.includes("stripe") ||
      lower.includes("airbnb")
    ) {
      setTargetAtsPlatform("greenhouse");
    } else if (
      lower.includes("myworkdayjobs") ||
      lower.includes("workday") ||
      lower.includes("amazon") ||
      lower.includes("meta") ||
      lower.includes("apple") ||
      lower.includes("infosys") ||
      lower.includes("cognizant")
    ) {
      setTargetAtsPlatform("workday");
    } else if (
      lower.includes("lever.co") ||
      lower.includes("lever") ||
      lower.includes("netflix") ||
      lower.includes("uber") ||
      lower.includes("swiggy")
    ) {
      setTargetAtsPlatform("lever");
    } else if (lower.includes("icims") || lower.includes("microsoft")) {
      setTargetAtsPlatform("icims");
    } else if (
      lower.includes("taleo") ||
      lower.includes("oracle") ||
      lower.includes("tcs") ||
      lower.includes("wipro")
    ) {
      setTargetAtsPlatform("taleo");
    }
  }, [companyName, jobDescription]);

  const buildRewriteTargets = (data: ResumeData) => {
    const targets: { field: string; index?: number; bulletIndex?: number; original: string }[] = [];
    if (data.summary?.trim().length > 10) targets.push({ field: "summary", original: data.summary });
    data.workExperience.forEach((exp, expIdx) => {
      exp.bullets.forEach((bullet, bulletIdx) => {
        if (bullet.trim().length > 5)
          targets.push({ field: "work", index: expIdx, bulletIndex: bulletIdx, original: bullet });
      });
    });
    setRewriteTargets(targets);
  };

  const getTargetKey = (target: { field: string; index?: number; bulletIndex?: number }) =>
    target.field === "summary" ? "summary" : `work-${target.index}-${target.bulletIndex}`;

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setJobDescription(text);
        setCopiedClip(true);
        setTimeout(() => setCopiedClip(false), 2000);
      }
    } catch {
      // Fallback
    }
  };

  const handleLoadSampleJD = (sample: (typeof SAMPLE_JDS)[0]) => {
    setCompanyName(sample.company);
    setTargetAtsPlatform(sample.ats);
    setJobDescription(sample.text);
  };

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
          targetAtsPlatform,
          companyName,
        }),
      });
      const data = await res.json();
      if (res.status === 403)
        throw new Error(data.error || `Insufficient credits. Analyze Match costs ${CREDIT_COSTS.JD_MATCH} credits.`);
      if (!res.ok || data.error) throw new Error(data.error || "Analysis failed");
      setJdMatchResult(data);
      setCurrentStep(3);
      setStep3SubTab("bullets");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to analyze. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  // 1-Click Apply All Bullet Rewrites with robust matching and deep cloning
  const handleApplyAllBulletRewrites = () => {
    if (!selectedResume || !jdMatchResult?.bulletBreakdown) return;

    // Deep clone workExperience
    const updatedWorkExperience = selectedResume.resume_data.workExperience.map((exp) => ({
      ...exp,
      bullets: [...exp.bullets],
    }));

    const newAccepted = new Set(acceptedRewrites);
    let count = 0;

    const updatedBreakdown = jdMatchResult.bulletBreakdown.map((b, idx) => {
      const loc = findBulletLocation(updatedWorkExperience, b);
      if (loc) {
        updatedWorkExperience[loc.expIndex].bullets[loc.bulletIndex] = b.suggestedRewrite;
        count++;
      }
      newAccepted.add(b.id || `bullet-${idx}`);
      return { ...b, accepted: true };
    });

    // Update resume state with new deep-cloned object reference
    setSelectedResume({
      ...selectedResume,
      resume_data: {
        ...selectedResume.resume_data,
        workExperience: updatedWorkExperience,
      },
    });

    // Update jdMatchResult so React immediately marks all buttons "Applied ✓"
    setJdMatchResult({
      ...jdMatchResult,
      bulletBreakdown: updatedBreakdown,
    });

    setAcceptedRewrites(newAccepted);
    setApplyAllSuccess(true);
    setTimeout(() => setApplyAllSuccess(false), 5000);
  };

  // Individual Bullet Accept with robust matching and state update
  const handleAcceptSingleBullet = (b: BulletFeedback, bIdx: number) => {
    if (!selectedResume || !jdMatchResult) return;

    const updatedWorkExperience = selectedResume.resume_data.workExperience.map((exp) => ({
      ...exp,
      bullets: [...exp.bullets],
    }));

    const loc = findBulletLocation(updatedWorkExperience, b);
    if (loc) {
      updatedWorkExperience[loc.expIndex].bullets[loc.bulletIndex] = b.suggestedRewrite;
    }

    const updatedBreakdown = [...(jdMatchResult.bulletBreakdown || [])];
    updatedBreakdown[bIdx] = { ...updatedBreakdown[bIdx], accepted: true };

    const newAccepted = new Set(acceptedRewrites).add(b.id || `bullet-${bIdx}`);
    setAcceptedRewrites(newAccepted);

    setSelectedResume({
      ...selectedResume,
      resume_data: {
        ...selectedResume.resume_data,
        workExperience: updatedWorkExperience,
      },
    });

    setJdMatchResult({
      ...jdMatchResult,
      bulletBreakdown: updatedBreakdown,
    });
  };

  const handleRewrite = async (target: {
    field: string;
    index?: number;
    bulletIndex?: number;
    original: string;
  }) => {
    const key = getTargetKey(target);
    setRewriteLoading((prev) => ({ ...prev, [key]: true }));
    setExpandedTarget(key);
    try {
      const context =
        target.field === "summary"
          ? "Professional Summary"
          : `Work Experience at ${
              selectedResume?.resume_data.workExperience[target.index!]?.company || "Company"
            } — ${selectedResume?.resume_data.workExperience[target.index!]?.role || "Role"}`;
      const res = await fetch("/api/ai-rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: target.original, context, targetJobDescription: jobDescription }),
      });
      const data = await res.json();
      if (res.status === 403)
        throw new Error(data.error || `Insufficient credits. AI Rewrite costs ${CREDIT_COSTS.AI_REWRITE} credits per section.`);
      if (!res.ok || data.error) throw new Error(data.error || "Rewrite failed");
      setRewriteSuggestions((prev) => ({ ...prev, [key]: data.suggestions }));
    } catch (err: unknown) {
      setError(`Rewrite failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setRewriteLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleAcceptSectionRewrite = (
    target: { field: string; index?: number; bulletIndex?: number; original: string },
    suggestion: string
  ) => {
    if (!selectedResume) return;
    const key = getTargetKey(target);
    const updatedData = { ...selectedResume.resume_data };
    if (target.field === "summary") {
      updatedData.summary = suggestion;
    } else if (target.field === "work" && target.index !== undefined && target.bulletIndex !== undefined) {
      const updatedWork = selectedResume.resume_data.workExperience.map((exp, eIdx) => {
        if (eIdx !== target.index) return exp;
        const updatedBullets = [...exp.bullets];
        updatedBullets[target.bulletIndex!] = suggestion;
        return { ...exp, bullets: updatedBullets };
      });
      updatedData.workExperience = updatedWork;
    }
    setRewriteTargets((prev) =>
      prev.map((t) => (getTargetKey(t) === key ? { ...t, original: suggestion } : t))
    );
    setSelectedResume({ ...selectedResume, resume_data: updatedData });
    setAcceptedRewrites((prev) => new Set(prev).add(key));
    setRewriteSuggestions((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setExpandedTarget(null);
  };

  const handleSave = async () => {
    if (!selectedResume) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      const rawText = [
        selectedResume.resume_data.personalInfo.fullName,
        selectedResume.resume_data.personalInfo.email,
        selectedResume.resume_data.summary,
        ...selectedResume.resume_data.workExperience.flatMap((w) => [w.company, w.role, ...w.bullets]),
        ...selectedResume.resume_data.skills.technical,
      ].join("\n");
      const jobRole =
        companyName ? `${companyName} Tailored` : jdMatchResult?.matchedKeywords?.[0] || selectedResume.resume_data.workExperience?.[0]?.role || "Job";
      const defaultName = `${selectedResume.file_name.replace(".pdf", "")} (Tailored — ${jobRole})`;
      const res = await fetch("/api/save-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_name: saveAsNewName.trim() || defaultName,
          raw_text: rawText,
          resume_data: selectedResume.resume_data,
          template_id: selectedTemplate || selectedResume.template_id,
          ats_score: selectedResume.ats_score,
          jd_match: jdMatchResult,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      const newRecord = await res.json();
      setSavedNewId(newRecord.id);
      setSaveSuccess(true);
      setCurrentStep(4);
    } catch (err: unknown) {
      setError("Failed to save resume: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSaving(false);
    }
  };

  if (!mounted || authLoading || !user) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <ConcentricLoader text="Loading your AI Career Studio..." />
      </div>
    );
  }

  const wordCount = jobDescription.trim().split(/\s+/).filter(Boolean).length;
  const activeAtsMeta = ATS_PLATFORM_OPTIONS.find((a) => a.id === targetAtsPlatform) || ATS_PLATFORM_OPTIONS[0];

  const projectedScore = jdMatchResult
    ? Math.min(95, Math.max(82, jdMatchResult.matchScore + 26))
    : 0;

  const allBulletsApplied =
    jdMatchResult?.bulletBreakdown &&
    jdMatchResult.bulletBreakdown.length > 0 &&
    jdMatchResult.bulletBreakdown.every((b) => b.accepted);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <Navbar />

      {/* ─── COMPACT EXECUTIVE HERO HEADER ───────────────────────────── */}
      <div
        style={{
          background: "linear-gradient(180deg, #0A1124 0%, #101B3B 100%)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          position: "relative",
          overflow: "hidden",
          padding: "1rem 2rem",
          color: "#fff",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -60,
            right: 40,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(245, 158, 11, 0.14) 0%, rgba(245, 158, 11, 0) 70%)",
            pointerEvents: "none",
            filter: "blur(40px)",
          }}
        />

        <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #F59E0B, #D97706)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 16px rgba(245, 158, 11, 0.3)",
                }}
              >
                <Wand2 size={20} color="#fff" />
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <h1
                    style={{
                      fontFamily: "Syne, sans-serif",
                      fontWeight: 800,
                      fontSize: "1.25rem",
                      letterSpacing: "-0.02em",
                      color: "#ffffff",
                      margin: 0,
                    }}
                  >
                    Precision JD Matching &amp; AI Tailoring
                  </h1>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      padding: "0.15rem 0.5rem",
                      borderRadius: "999px",
                      background: "rgba(245, 158, 11, 0.15)",
                      color: "#FBBF24",
                      border: "1px solid rgba(245, 158, 11, 0.3)",
                    }}
                  >
                    ATS Engine 2.0
                  </span>
                </div>
                <p style={{ fontSize: "0.78rem", color: "rgba(255, 255, 255, 0.65)", margin: "0.1rem 0 0" }}>
                  Match job algorithms, audit bullet impact, and generate 1-click tailored resume rewrites.
                </p>
              </div>
            </div>

            {/* Header Right Bar */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              {selectedResume && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.55rem",
                    padding: "0.35rem 0.85rem",
                    borderRadius: "10px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                  }}
                >
                  <FileText size={14} color="#F59E0B" />
                  <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "#fff", maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {selectedResume.file_name}
                  </span>
                  {selectedResume.ats_score && (
                    <span
                      style={{
                        fontSize: "0.68rem",
                        fontWeight: 800,
                        padding: "0.1rem 0.45rem",
                        borderRadius: "5px",
                        background: getScoreColor(selectedResume.ats_score.overall).bg,
                        color: getScoreColor(selectedResume.ats_score.overall).color,
                        border: `1px solid ${getScoreColor(selectedResume.ats_score.overall).border}`,
                      }}
                    >
                      ATS {selectedResume.ats_score.overall}
                    </span>
                  )}
                </div>
              )}

              {selectedResume && (
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.45rem",
                    background: showPreview
                      ? "linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(245, 158, 11, 0.1))"
                      : "rgba(255, 255, 255, 0.08)",
                    border: showPreview
                      ? "1px solid rgba(245, 158, 11, 0.5)"
                      : "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#ffffff",
                    borderRadius: "10px",
                    padding: "0.5rem 0.95rem",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {showPreview ? <EyeOff size={14} color="#FBBF24" /> : <Eye size={14} color="#FBBF24" />}
                  <span>{showPreview ? "Hide Preview" : "Split Live Preview"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── TABBED STEPPER NAVIGATION ─────────────────────────────────── */}
      <div
        style={{
          background: "var(--card)",
          borderBottom: "1px solid var(--border)",
          padding: "0.6rem 2rem",
          boxShadow: "var(--shadow-xs)",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
              gap: "0.6rem",
              alignItems: "center",
            }}
          >
            {STEPS.map((s) => {
              const Icon = s.icon;
              const isActive = currentStep === s.num;
              const isCompleted =
                (s.num === 1 && !!selectedResume) ||
                (s.num === 2 && !!jdMatchResult) ||
                (s.num === 3 && acceptedRewrites.size > 0) ||
                (s.num === 4 && saveSuccess);

              return (
                <button
                  key={s.num}
                  onClick={() => {
                    if (s.num === 1) setCurrentStep(1);
                    else if (s.num === 2 && selectedResume) setCurrentStep(2);
                    else if (s.num === 3) {
                      if (jdMatchResult) setCurrentStep(3);
                      else setError("Please paste a Job Description and click 'Run AI Match' in Step 2 first.");
                    } else if (s.num === 4) {
                      if (selectedResume) setCurrentStep(4);
                      else setError("Please select a resume first.");
                    }
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.7rem",
                    padding: "0.55rem 0.85rem",
                    borderRadius: "11px",
                    background: isActive
                      ? "var(--accent-soft)"
                      : isCompleted
                      ? "rgba(16, 185, 129, 0.05)"
                      : "transparent",
                    border: `1.5px solid ${
                      isActive
                        ? "var(--accent)"
                        : isCompleted
                        ? "rgba(16, 185, 129, 0.25)"
                        : "var(--border)"
                    }`,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    textAlign: "left",
                    boxShadow: isActive ? "0 0 12px rgba(245, 158, 11, 0.18)" : "none",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "8px",
                      flexShrink: 0,
                      background: isActive
                        ? "linear-gradient(135deg, #F59E0B, #D97706)"
                        : isCompleted
                        ? "linear-gradient(135deg, #10B981, #059669)"
                        : "var(--bg-2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isCompleted && !isActive ? (
                      <Check size={15} color="#ffffff" strokeWidth={3} />
                    ) : (
                      <Icon size={14} color={isActive ? "#ffffff" : "var(--text-muted)"} />
                    )}
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span
                        style={{
                          fontSize: "0.62rem",
                          fontWeight: 800,
                          color: isActive ? "var(--accent)" : isCompleted ? "#10B981" : "var(--text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        Step {s.num} {isActive ? "• ACTIVE" : isCompleted ? "✓ DONE" : ""}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: 800,
                        color: isActive ? "var(--text)" : "var(--text-secondary)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {s.label}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── MAIN WORKSPACE ───────────────────────────────────────────── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* LEFT WORKBENCH */}
        <div style={{ flex: showPreview ? "1 1 54%" : 1, overflowY: "auto", padding: "1.5rem 2rem" }}>
          <div
            style={{
              maxWidth: showPreview ? "none" : "900px",
              margin: "0 auto",
              display: "grid",
              gap: "1.2rem",
            }}
          >
            {/* Error Notification */}
            {error && (
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.08)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "12px",
                  padding: "0.85rem 1.15rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.8rem",
                  boxShadow: "0 4px 14px rgba(239, 68, 68, 0.08)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", fontSize: "0.86rem", color: "#ef4444", fontWeight: 600 }}>
                  <AlertCircle size={17} />
                  <span>{error}</span>
                </div>
                <button
                  onClick={() => setError("")}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 4 }}
                >
                  <X size={15} />
                </button>
              </div>
            )}

            {/* Success Toast for Apply All */}
            {applyAllSuccess && (
              <div
                style={{
                  background: "rgba(16, 185, 129, 0.12)",
                  border: "1.5px solid rgba(16, 185, 129, 0.4)",
                  borderRadius: "12px",
                  padding: "0.9rem 1.2rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.8rem",
                  boxShadow: "0 6px 20px rgba(16, 185, 129, 0.18)",
                  animation: "fadeInUp 0.3s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "#065F46" }}>
                  <CheckCircle2 size={20} color="#10B981" />
                  <span style={{ fontSize: "0.88rem", fontWeight: 700 }}>
                    Success! All AI bullet rewrites have been applied to your resume!
                  </span>
                </div>
                <button
                  onClick={() => setApplyAllSuccess(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#065F46", padding: 4 }}
                >
                  <X size={15} />
                </button>
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════════ */}
            {/* ── TAB 1: SELECT RESUME ──                                   */}
            {/* ═════════════════════════════════════════════════════════════ */}
            {currentStep === 1 && (
              <div
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "16px",
                  padding: "1.5rem",
                  boxShadow: "var(--shadow-sm)",
                  display: "grid",
                  gap: "1.2rem",
                }}
              >
                <div>
                  <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.2rem", margin: "0 0 0.25rem", color: "var(--text)" }}>
                    Step 1: Choose Baseline Resume
                  </h2>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: 0 }}>
                    Select the candidate resume you want to optimize for the job listing.
                  </p>
                </div>

                {loading ? (
                  <div style={{ textAlign: "center", padding: "2rem" }}>
                    <ConcentricLoader text="Fetching your resumes..." />
                  </div>
                ) : resumes.length === 0 ? (
                  <EmptyState
                    icon={FileText}
                    title="No resumes found"
                    desc="Build or import a base resume first to start AI job tailoring."
                    action={{ label: "Create Resume in Builder", onClick: () => router.push("/resume/builder") }}
                  />
                ) : (
                  <div style={{ display: "grid", gap: "1rem" }}>
                    <div style={{ position: "relative" }}>
                      <select
                        className="input"
                        value={selectedResumeId}
                        onChange={(e) => setSelectedResumeId(e.target.value)}
                        style={{
                          height: "50px",
                          paddingRight: "2.8rem",
                          background: "var(--bg-2)",
                          fontWeight: 600,
                          fontSize: "0.9rem",
                          appearance: "none",
                          WebkitAppearance: "none",
                          borderRadius: "10px",
                          border: "1px solid var(--border)",
                          cursor: "pointer",
                          width: "100%",
                        }}
                      >
                        {resumes.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.file_name} ({new Date(r.created_at).toLocaleDateString()})
                            {r.ats_score ? ` · ATS ${r.ats_score.overall}/100` : ""}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={18}
                        style={{
                          position: "absolute",
                          right: 16,
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "var(--text-muted)",
                          pointerEvents: "none",
                        }}
                      />
                    </div>

                    {selectedResume && (
                      <div
                        style={{
                          background: "linear-gradient(135deg, rgba(245, 158, 11, 0.06) 0%, var(--card) 100%)",
                          border: "1px solid var(--border-accent)",
                          borderRadius: "12px",
                          padding: "1.2rem",
                          display: "grid",
                          gap: "0.8rem",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.8rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <div
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: "10px",
                                background: "var(--accent-soft)",
                                border: "1px solid var(--border-accent)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <FileCheck2 size={22} color="var(--accent)" />
                            </div>
                            <div>
                              <div style={{ fontWeight: 800, fontSize: "1rem", color: "var(--text)" }}>
                                {selectedResume.resume_data.personalInfo.fullName || "Candidate"}
                              </div>
                              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                                {selectedResume.resume_data.workExperience[0]?.role || "Role"} • {selectedResume.resume_data.workExperience[0]?.company || "Company"}
                              </div>
                            </div>
                          </div>

                          {selectedResume.ats_score && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                background: getScoreColor(selectedResume.ats_score.overall).bg,
                                border: `1px solid ${getScoreColor(selectedResume.ats_score.overall).border}`,
                                padding: "0.4rem 0.85rem",
                                borderRadius: "999px",
                              }}
                            >
                              <div
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  background: getScoreColor(selectedResume.ats_score.overall).color,
                                }}
                              />
                              <span style={{ fontSize: "0.78rem", fontWeight: 800, color: getScoreColor(selectedResume.ats_score.overall).color }}>
                                Baseline ATS: {selectedResume.ats_score.overall}/100
                              </span>
                            </div>
                          )}
                        </div>

                        {selectedResume.resume_data.skills.technical.length > 0 && (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", marginRight: "0.3rem" }}>
                              Skills:
                            </span>
                            {selectedResume.resume_data.skills.technical.slice(0, 7).map((s, idx) => (
                              <span
                                key={idx}
                                style={{
                                  fontSize: "0.72rem",
                                  fontWeight: 600,
                                  background: "var(--bg-2)",
                                  border: "1px solid var(--border)",
                                  padding: "0.15rem 0.55rem",
                                  borderRadius: "6px",
                                  color: "var(--text)",
                                }}
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "0.5rem" }}>
                      <button
                        className="btn-primary"
                        disabled={!selectedResume}
                        onClick={() => setCurrentStep(2)}
                        style={{
                          padding: "0.75rem 1.8rem",
                          fontSize: "0.9rem",
                          fontWeight: 700,
                          borderRadius: "10px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <span>Continue to Target Job &amp; ATS</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════════ */}
            {/* ── TAB 2: TARGET JOB & ATS ──                                */}
            {/* ═════════════════════════════════════════════════════════════ */}
            {currentStep === 2 && (
              <div
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "16px",
                  padding: "1.5rem",
                  boxShadow: "var(--shadow-sm)",
                  display: "grid",
                  gap: "1.1rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.8rem" }}>
                  <div>
                    <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.2rem", margin: "0 0 0.25rem", color: "var(--text)" }}>
                      Step 2: Job Description &amp; ATS Targeting
                    </h2>
                    <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: 0 }}>
                      Specify the employer or select an ATS platform. Paste the job requirements below.
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentStep(1)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                    }}
                  >
                    <ArrowLeft size={13} /> Change Resume
                  </button>
                </div>

                {/* Company Presets */}
                <div>
                  <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                    {PRESET_COMPANIES.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setCompanyName(preset.name);
                          setTargetAtsPlatform(preset.ats);
                        }}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          padding: "0.3rem 0.65rem",
                          borderRadius: "8px",
                          background: companyName === preset.name ? "var(--accent)" : "var(--bg-2)",
                          color: companyName === preset.name ? "#ffffff" : "var(--text-secondary)",
                          border: `1px solid ${companyName === preset.name ? "var(--accent)" : "var(--border)"}`,
                          cursor: "pointer",
                        }}
                      >
                        <Building2 size={12} />
                        <span>{preset.name}</span>
                        <span style={{ fontSize: "0.62rem", opacity: 0.8 }}>({preset.tag})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Two inputs */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
                  <div>
                    <label style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "0.35rem" }}>
                      Target Company
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Google, Amazon, TCS, Stripe"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="input"
                      style={{
                        fontSize: "0.88rem",
                        height: "44px",
                        borderRadius: "10px",
                        border: "1px solid var(--border)",
                        background: "var(--bg-2)",
                        width: "100%",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "0.35rem" }}>
                      Target ATS Platform
                    </label>
                    <div style={{ position: "relative" }}>
                      <select
                        value={targetAtsPlatform}
                        onChange={(e) => setTargetAtsPlatform(e.target.value)}
                        className="input"
                        style={{
                          fontSize: "0.88rem",
                          height: "44px",
                          borderRadius: "10px",
                          border: "1px solid var(--border)",
                          background: "var(--bg-2)",
                          fontWeight: 600,
                          appearance: "none",
                          WebkitAppearance: "none",
                          width: "100%",
                        }}
                      >
                        {ATS_PLATFORM_OPTIONS.map((ats) => (
                          <option key={ats.id} value={ats.id}>
                            {ats.name} ({ats.badge})
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={16} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                    </div>
                  </div>
                </div>

                {/* JD Textarea with toolbar */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem", flexWrap: "wrap", gap: "0.4rem" }}>
                    <label style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>
                      Job Description
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <button
                        type="button"
                        onClick={handlePasteClipboard}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          padding: "0.22rem 0.6rem",
                          borderRadius: "6px",
                          background: copiedClip ? "rgba(16, 185, 129, 0.1)" : "var(--bg-2)",
                          color: copiedClip ? "#10B981" : "var(--text-secondary)",
                          border: `1px solid ${copiedClip ? "rgba(16, 185, 129, 0.3)" : "var(--border)"}`,
                          cursor: "pointer",
                        }}
                      >
                        <ClipboardPaste size={12} />
                        <span>{copiedClip ? "Pasted!" : "Paste Clipboard"}</span>
                      </button>
                      {SAMPLE_JDS.map((sample, sIdx) => (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => handleLoadSampleJD(sample)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            fontSize: "0.72rem",
                            fontWeight: 600,
                            padding: "0.22rem 0.6rem",
                            borderRadius: "6px",
                            background: "var(--bg-2)",
                            color: "var(--text-muted)",
                            border: "1px solid var(--border)",
                            cursor: "pointer",
                          }}
                        >
                          <Sparkles size={11} color="var(--accent)" />
                          <span>Load Sample {sIdx + 1}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ position: "relative" }}>
                    <textarea
                      className="input"
                      rows={9}
                      placeholder="Paste the target job description here..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      style={{
                        fontSize: "0.88rem",
                        lineHeight: 1.6,
                        resize: "vertical",
                        minHeight: 180,
                        borderRadius: "10px",
                        border: "1px solid var(--border)",
                        background: "var(--bg-2)",
                        padding: "0.9rem",
                        width: "100%",
                      }}
                    />
                    {jobDescription && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: 10,
                          right: 12,
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          color: "var(--text-muted)",
                          background: "var(--card)",
                          borderRadius: "5px",
                          padding: "2px 8px",
                          border: "1px solid var(--border)",
                        }}
                      >
                        {wordCount} words
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.5rem", borderTop: "1px solid var(--border)" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#D97706", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                    <Zap size={13} /> {CREDIT_COSTS.JD_MATCH} credits
                  </span>
                  <button
                    className="btn-primary"
                    disabled={!jobDescription.trim() || analyzing}
                    onClick={handleAnalyze}
                    style={{
                      padding: "0.75rem 2rem",
                      fontSize: "0.92rem",
                      fontWeight: 700,
                      borderRadius: "10px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    {analyzing ? (
                      <>
                        <span className="spinner" style={{ width: 16, height: 16 }} />
                        <span>Auditing Match &amp; Keywords...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        <span>Run AI Match &amp; Audit</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════════ */}
            {/* ── TAB 3: AI MATCH & REWRITES STUDIO (PRIMARY ACTION) ──     */}
            {/* ═════════════════════════════════════════════════════════════ */}
            {currentStep === 3 && jdMatchResult && selectedResume && (
              <div style={{ display: "grid", gap: "1.2rem" }}>
                {/* STUDIO HEADER WITH SCORE & 1-CLICK APPLY ALL */}
                <div
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "16px",
                    padding: "1.2rem 1.4rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "1rem",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1.1rem" }}>
                    <ScoreRing score={jdMatchResult.matchScore} size={78} />
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem" }}>
                        <span
                          style={{
                            fontSize: "0.78rem",
                            fontWeight: 800,
                            padding: "0.15rem 0.55rem",
                            borderRadius: "6px",
                            background: getScoreColor(jdMatchResult.matchScore).bg,
                            color: getScoreColor(jdMatchResult.matchScore).color,
                            border: `1px solid ${getScoreColor(jdMatchResult.matchScore).border}`,
                          }}
                        >
                          {scoreLabel(jdMatchResult.matchScore)} ({jdMatchResult.matchScore}/100)
                        </span>
                        <ArrowRight size={13} color="var(--text-muted)" />
                        <span
                          style={{
                            fontSize: "0.78rem",
                            fontWeight: 800,
                            padding: "0.15rem 0.55rem",
                            borderRadius: "6px",
                            background: "rgba(16, 185, 129, 0.12)",
                            color: "#10B981",
                            border: "1px solid rgba(16, 185, 129, 0.3)",
                          }}
                        >
                          Projected: {projectedScore}/100 (+{projectedScore - jdMatchResult.matchScore} pts)
                        </span>
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                        Target ATS: <strong>{jdMatchResult.targetAtsPlatform || "Universal"}</strong> • {jdMatchResult.missingKeywords.length} missing keywords found
                      </div>
                    </div>
                  </div>

                  {/* 1-Click Action Buttons */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
                    {jdMatchResult.bulletBreakdown && jdMatchResult.bulletBreakdown.length > 0 && (
                      <button
                        onClick={handleApplyAllBulletRewrites}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.45rem",
                          background: allBulletsApplied
                            ? "rgba(16, 185, 129, 0.15)"
                            : "linear-gradient(135deg, #10B981, #059669)",
                          color: allBulletsApplied ? "#10B981" : "#ffffff",
                          border: allBulletsApplied ? "1.5px solid rgba(16, 185, 129, 0.4)" : "none",
                          borderRadius: "10px",
                          padding: "0.65rem 1.25rem",
                          fontSize: "0.85rem",
                          fontWeight: 800,
                          cursor: "pointer",
                          boxShadow: allBulletsApplied ? "none" : "0 4px 14px rgba(16, 185, 129, 0.3)",
                          transition: "all 0.2s",
                        }}
                      >
                        {allBulletsApplied ? (
                          <>
                            <CheckCircle2 size={16} color="#10B981" />
                            <span>All Rewrites Applied to Resume ✓</span>
                          </>
                        ) : (
                          <>
                            <CheckCheck size={16} />
                            <span>Apply All AI Rewrites (1-Click)</span>
                          </>
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => setCurrentStep(4)}
                      className="btn-primary"
                      style={{
                        padding: "0.65rem 1.2rem",
                        fontSize: "0.84rem",
                        fontWeight: 700,
                        borderRadius: "10px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.4rem",
                      }}
                    >
                      <span>Save &amp; Export</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                {/* STUDIO SUB-TABS */}
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    borderBottom: "1px solid var(--border)",
                    paddingBottom: "0.4rem",
                  }}
                >
                  <button
                    onClick={() => setStep3SubTab("bullets")}
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "8px",
                      fontSize: "0.82rem",
                      fontWeight: 800,
                      background: step3SubTab === "bullets" ? "var(--accent)" : "var(--bg-2)",
                      color: step3SubTab === "bullets" ? "#ffffff" : "var(--text-secondary)",
                      border: `1px solid ${step3SubTab === "bullets" ? "var(--accent)" : "var(--border)"}`,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                  >
                    <Wand2 size={14} />
                    <span>⚡ AI Bullet Rewrites &amp; Improvements</span>
                    {jdMatchResult.bulletBreakdown && (
                      <span style={{ fontSize: "0.68rem", opacity: 0.9 }}>
                        ({jdMatchResult.bulletBreakdown.length})
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setStep3SubTab("sections")}
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "8px",
                      fontSize: "0.82rem",
                      fontWeight: 800,
                      background: step3SubTab === "sections" ? "var(--accent)" : "var(--bg-2)",
                      color: step3SubTab === "sections" ? "#ffffff" : "var(--text-secondary)",
                      border: `1px solid ${step3SubTab === "sections" ? "var(--accent)" : "var(--border)"}`,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                  >
                    <Sparkles size={14} />
                    <span>Section Generator (Summary &amp; Experience)</span>
                  </button>

                  <button
                    onClick={() => setStep3SubTab("ats")}
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "8px",
                      fontSize: "0.82rem",
                      fontWeight: 800,
                      background: step3SubTab === "ats" ? "var(--accent)" : "var(--bg-2)",
                      color: step3SubTab === "ats" ? "#ffffff" : "var(--text-secondary)",
                      border: `1px solid ${step3SubTab === "ats" ? "var(--accent)" : "var(--border)"}`,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                  >
                    <ShieldCheck size={14} />
                    <span>ATS &amp; Keyword Coverage</span>
                  </button>
                </div>

                {/* ── SUB-TAB 1: AI BULLET REWRITES (DEFAULT VIEW) ── */}
                {step3SubTab === "bullets" && (
                  <div style={{ display: "grid", gap: "0.9rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                        Review audited bullets below. Click <strong>Accept 1-Click</strong> to apply individually, or use the green button above to apply all.
                      </div>
                      <div style={{ fontSize: "0.76rem", fontWeight: 800, color: allBulletsApplied ? "#10B981" : "var(--accent)" }}>
                        {acceptedRewrites.size} / {jdMatchResult.bulletBreakdown?.length || 0} applied
                      </div>
                    </div>

                    {(!jdMatchResult.bulletBreakdown || jdMatchResult.bulletBreakdown.length === 0) ? (
                      <EmptyState
                        icon={FileText}
                        title="No bullets found to optimize"
                        desc="Ensure your work experience section has bullet points."
                      />
                    ) : (
                      jdMatchResult.bulletBreakdown.map((b, bIdx) => (
                        <div
                          key={b.id || bIdx}
                          style={{
                            background: "var(--card)",
                            border: `1.5px solid ${b.accepted ? "rgba(16, 185, 129, 0.45)" : "var(--border)"}`,
                            borderRadius: "14px",
                            padding: "1.1rem 1.3rem",
                            display: "grid",
                            gap: "0.65rem",
                            boxShadow: b.accepted ? "0 4px 14px rgba(16, 185, 129, 0.08)" : "var(--shadow-xs)",
                            transition: "all 0.25s ease",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                            <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--text-secondary)" }}>
                              {b.section}
                            </span>
                            <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                              <span
                                style={{
                                  fontSize: "0.68rem",
                                  fontWeight: 800,
                                  padding: "0.15rem 0.55rem",
                                  borderRadius: "6px",
                                  background:
                                    b.impactScore >= 8
                                      ? "rgba(16,185,129,0.12)"
                                      : b.impactScore >= 5
                                      ? "rgba(245,158,11,0.12)"
                                      : "rgba(239,68,68,0.12)",
                                  color:
                                    b.impactScore >= 8
                                      ? "#10B981"
                                      : b.impactScore >= 5
                                      ? "#F59E0B"
                                      : "#EF4444",
                                  border: `1px solid ${
                                    b.impactScore >= 8
                                      ? "rgba(16,185,129,0.25)"
                                      : b.impactScore >= 5
                                      ? "rgba(245,158,11,0.25)"
                                      : "rgba(239,68,68,0.25)"
                                  }`,
                                }}
                              >
                                Impact: {b.impactScore}/10
                              </span>
                              <span
                                style={{
                                  fontSize: "0.68rem",
                                  fontWeight: 700,
                                  padding: "0.15rem 0.55rem",
                                  borderRadius: "6px",
                                  background: "var(--bg-2)",
                                  color: "var(--text-secondary)",
                                  border: "1px solid var(--border)",
                                }}
                              >
                                Verb: {b.actionVerbStrength}
                              </span>
                              {b.hasMetric && (
                                <span
                                  style={{
                                    fontSize: "0.68rem",
                                    fontWeight: 800,
                                    padding: "0.15rem 0.55rem",
                                    borderRadius: "6px",
                                    background: "rgba(37, 99, 235, 0.1)",
                                    color: "#2563EB",
                                    border: "1px solid rgba(37, 99, 235, 0.25)",
                                  }}
                                >
                                  Metrics ✓
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Original Text */}
                          <div
                            style={{
                              fontSize: "0.82rem",
                              color: "var(--text-muted)",
                              lineHeight: 1.5,
                              padding: "0.55rem 0.85rem",
                              background: "var(--bg-2)",
                              borderRadius: "8px",
                              borderLeft: "3px solid var(--border)",
                            }}
                          >
                            <span style={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", display: "block", marginBottom: "0.2rem", color: "var(--text-muted)" }}>
                              Original:
                            </span>
                            &quot;{b.originalText}&quot;
                          </div>

                          {/* Suggested Rewrite with 1-click button */}
                          <div
                            style={{
                              padding: "0.8rem 1rem",
                              borderRadius: "10px",
                              background: b.accepted ? "rgba(16, 185, 129, 0.08)" : "rgba(16, 185, 129, 0.04)",
                              border: `1px solid ${b.accepted ? "rgba(16, 185, 129, 0.4)" : "rgba(16, 185, 129, 0.2)"}`,
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "1rem",
                            }}
                          >
                            <div>
                              <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "#10B981", textTransform: "uppercase", display: "block", marginBottom: "0.2rem" }}>
                                ✨ AI Tailored Version:
                              </span>
                              <span style={{ fontSize: "0.86rem", color: "var(--text)", fontWeight: 600, lineHeight: 1.5 }}>
                                {b.suggestedRewrite}
                              </span>
                            </div>

                            <button
                              onClick={() => handleAcceptSingleBullet(b, bIdx)}
                              style={{
                                padding: "0.45rem 0.95rem",
                                borderRadius: "8px",
                                fontSize: "0.78rem",
                                fontWeight: 800,
                                background: b.accepted ? "linear-gradient(135deg, #10B981, #059669)" : "var(--accent)",
                                color: "#ffffff",
                                border: "none",
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                                flexShrink: 0,
                                boxShadow: b.accepted ? "none" : "0 2px 8px rgba(245, 158, 11, 0.25)",
                              }}
                            >
                              {b.accepted ? "Applied ✓" : "Accept 1-Click"}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* ── SUB-TAB 2: SECTION-BY-SECTION GENERATOR ── */}
                {step3SubTab === "sections" && (
                  <div style={{ display: "grid", gap: "0.8rem" }}>
                    <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                      Generate 3 tailored variations per section (Summary &amp; Experience) with specific tone controls.
                    </div>

                    {rewriteTargets.map((target) => {
                      const key = getTargetKey(target);
                      const isLoading = rewriteLoading[key] || false;
                      const suggestions = rewriteSuggestions[key] || [];
                      const isAccepted = acceptedRewrites.has(key);
                      const isExpanded = expandedTarget === key || suggestions.length > 0;
                      const sectionLabel =
                        target.field === "summary"
                          ? "Professional Summary"
                          : `${selectedResume.resume_data.workExperience[target.index!]?.company || "Company"} — Bullet ${(target.bulletIndex || 0) + 1}`;

                      return (
                        <div
                          key={key}
                          style={{
                            border: `1px solid ${isAccepted ? "rgba(16,185,129,0.35)" : "var(--border)"}`,
                            borderRadius: "12px",
                            background: isAccepted ? "rgba(16,185,129,0.03)" : "var(--card)",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "0.85rem 1.1rem",
                              gap: "0.8rem",
                              cursor: "pointer",
                              borderBottom: isExpanded && !isAccepted ? "1px solid var(--border)" : "none",
                            }}
                            onClick={() => setExpandedTarget(isExpanded ? null : key)}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", minWidth: 0 }}>
                              {isAccepted ? (
                                <CheckCircle2 size={16} color="#10B981" style={{ flexShrink: 0 }} />
                              ) : (
                                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)", flexShrink: 0 }} />
                              )}
                              <span style={{ fontSize: "0.82rem", fontWeight: 800, color: isAccepted ? "#10B981" : "var(--text)" }}>
                                {sectionLabel} {isAccepted ? "✓ Applied" : ""}
                              </span>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              {!isAccepted && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRewrite(target);
                                  }}
                                  disabled={isLoading}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "0.35rem",
                                    background: "var(--accent-soft)",
                                    border: "1px solid var(--border-accent)",
                                    color: "var(--accent)",
                                    borderRadius: "8px",
                                    padding: "0.32rem 0.75rem",
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                    cursor: isLoading ? "wait" : "pointer",
                                  }}
                                >
                                  {isLoading ? (
                                    <>
                                      <span className="spinner" style={{ width: 12, height: 12 }} />
                                      <span>Generating...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles size={12} />
                                      <span>Generate Variations ({CREDIT_COSTS.AI_REWRITE} credits)</span>
                                    </>
                                  )}
                                </button>
                              )}
                              <ChevronDown size={15} color="var(--text-muted)" style={{ transform: isExpanded ? "rotate(180deg)" : "none" }} />
                            </div>
                          </div>

                          {(isExpanded || suggestions.length > 0) && !isAccepted && (
                            <div style={{ padding: "0.9rem 1.1rem", display: "grid", gap: "0.7rem", background: "var(--bg-2)" }}>
                              <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                                <strong style={{ display: "block", fontSize: "0.68rem", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.2rem" }}>Current:</strong>
                                {target.original}
                              </div>

                              {suggestions.length > 0 && (
                                <div style={{ display: "grid", gap: "0.55rem" }}>
                                  {suggestions.map((sug, sIdx) => (
                                    <div
                                      key={sIdx}
                                      onClick={() => handleAcceptSectionRewrite(target, sug)}
                                      style={{
                                        fontSize: "0.84rem",
                                        lineHeight: 1.5,
                                        padding: "0.8rem",
                                        background: "var(--card)",
                                        border: "1px solid rgba(245, 158, 11, 0.25)",
                                        borderRadius: "9px",
                                        cursor: "pointer",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        gap: "0.8rem",
                                      }}
                                    >
                                      <div>
                                        <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "var(--accent)", display: "block" }}>Option {sIdx + 1}:</span>
                                        <span style={{ color: "var(--text)", fontWeight: 500 }}>{sug}</span>
                                      </div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleAcceptSectionRewrite(target, sug);
                                        }}
                                        style={{
                                          padding: "0.3rem 0.7rem",
                                          borderRadius: "6px",
                                          background: "var(--accent)",
                                          color: "#fff",
                                          border: "none",
                                          fontSize: "0.72rem",
                                          fontWeight: 700,
                                          cursor: "pointer",
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        Accept
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ── SUB-TAB 3: ATS ADVICE & KEYWORDS ── */}
                {step3SubTab === "ats" && (
                  <div style={{ display: "grid", gap: "1rem" }}>
                    {jdMatchResult.atsPlatformAdvice && jdMatchResult.atsPlatformAdvice.length > 0 && (
                      <div
                        style={{
                          padding: "1rem 1.4rem",
                          background: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "12px",
                          fontSize: "0.84rem",
                        }}
                      >
                        <span style={{ fontWeight: 800, color: "var(--accent)", textTransform: "uppercase", fontSize: "0.72rem", display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.4rem" }}>
                          <ShieldCheck size={15} /> {jdMatchResult.targetAtsPlatform?.toUpperCase() || "ATS"} Optimization Advice:
                        </span>
                        <ul style={{ margin: 0, paddingLeft: "1.2rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                          {jdMatchResult.atsPlatformAdvice.map((advice, aIdx) => (
                            <li key={aIdx}>{advice}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Missing Keywords filter */}
                    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
                      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                        <button
                          onClick={() => setSkillsTab("all")}
                          style={{
                            padding: "0.3rem 0.75rem",
                            borderRadius: "7px",
                            fontSize: "0.74rem",
                            fontWeight: 700,
                            background: skillsTab === "all" ? "var(--accent)" : "var(--bg-2)",
                            color: skillsTab === "all" ? "#fff" : "var(--text-secondary)",
                            border: `1px solid ${skillsTab === "all" ? "var(--accent)" : "var(--border)"}`,
                            cursor: "pointer",
                          }}
                        >
                          All Missing ({jdMatchResult.missingKeywords.length})
                        </button>
                        {jdMatchResult.hardSkillsMissing && (
                          <button
                            onClick={() => setSkillsTab("hard")}
                            style={{
                              padding: "0.3rem 0.75rem",
                              borderRadius: "7px",
                              fontSize: "0.74rem",
                              fontWeight: 700,
                              background: skillsTab === "hard" ? "var(--accent)" : "var(--bg-2)",
                              color: skillsTab === "hard" ? "#fff" : "var(--text-secondary)",
                              border: `1px solid ${skillsTab === "hard" ? "var(--accent)" : "var(--border)"}`,
                              cursor: "pointer",
                            }}
                          >
                            Hard Skills ({jdMatchResult.hardSkillsMissing.length})
                          </button>
                        )}
                        {jdMatchResult.softSkillsMissing && (
                          <button
                            onClick={() => setSkillsTab("soft")}
                            style={{
                              padding: "0.3rem 0.75rem",
                              borderRadius: "7px",
                              fontSize: "0.74rem",
                              fontWeight: 700,
                              background: skillsTab === "soft" ? "var(--accent)" : "var(--bg-2)",
                              color: skillsTab === "soft" ? "#fff" : "var(--text-secondary)",
                              border: `1px solid ${skillsTab === "soft" ? "var(--accent)" : "var(--border)"}`,
                              cursor: "pointer",
                            }}
                          >
                            Soft Skills ({jdMatchResult.softSkillsMissing.length})
                          </button>
                        )}
                      </div>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                        {(skillsTab === "hard"
                          ? jdMatchResult.hardSkillsMissing || []
                          : skillsTab === "soft"
                          ? jdMatchResult.softSkillsMissing || []
                          : jdMatchResult.missingKeywords
                        ).map((kw, i) => (
                          <span
                            key={i}
                            style={{
                              padding: "0.22rem 0.65rem",
                              borderRadius: "7px",
                              fontSize: "0.74rem",
                              fontWeight: 600,
                              background: "rgba(239, 68, 68, 0.08)",
                              color: "#EF4444",
                              border: "1px solid rgba(239, 68, 68, 0.22)",
                            }}
                          >
                            + {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════════ */}
            {/* ── TAB 4: SAVE & EXPORT ──                                   */}
            {/* ═════════════════════════════════════════════════════════════ */}
            {currentStep === 4 && selectedResume && (
              <div
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "16px",
                  padding: "1.6rem",
                  boxShadow: "var(--shadow-sm)",
                  display: "grid",
                  gap: "1.2rem",
                }}
              >
                <div>
                  <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.2rem", margin: "0 0 0.25rem", color: "var(--text)" }}>
                    {saveSuccess ? "Tailored Resume Saved!" : "Step 4: Save & Export Tailored Copy"}
                  </h2>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: 0 }}>
                    {saveSuccess
                      ? "Your new tailored resume has been added to your dashboard. The original baseline copy is unchanged."
                      : "Saves this customized version as a new resume in your account."}
                  </p>
                </div>

                {!saveSuccess ? (
                  <div style={{ display: "grid", gap: "1rem" }}>
                    <div>
                      <label style={{ fontSize: "0.74rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>
                        Resume Title
                      </label>
                      <input
                        className="input"
                        value={saveAsNewName}
                        onChange={(e) => setSaveAsNewName(e.target.value)}
                        placeholder={`${selectedResume.file_name.replace(".pdf", "")} (Tailored for ${companyName || "Role"})`}
                        style={{
                          fontSize: "0.88rem",
                          height: "46px",
                          borderRadius: "10px",
                          border: "1px solid var(--border)",
                          background: "var(--bg-2)",
                          width: "100%",
                        }}
                      />
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.5rem" }}>
                      <button
                        onClick={() => setCurrentStep(3)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--text-muted)",
                          cursor: "pointer",
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                        }}
                      >
                        <ArrowLeft size={14} /> Back to AI Rewrites
                      </button>

                      <button
                        className="btn-primary"
                        disabled={saving}
                        onClick={handleSave}
                        style={{
                          padding: "0.75rem 2rem",
                          fontSize: "0.92rem",
                          fontWeight: 800,
                          borderRadius: "10px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        {saving ? (
                          <>
                            <span className="spinner" style={{ width: 15, height: 15 }} />
                            <span>Saving Tailored Resume...</span>
                          </>
                        ) : (
                          <>
                            <Save size={16} />
                            <span>Save as New Resume</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap", paddingTop: "0.5rem" }}>
                    {savedNewId && (
                      <>
                        <button
                          className="btn-primary"
                          onClick={() => router.push(`/resume/${savedNewId}`)}
                          style={{
                            padding: "0.75rem 1.8rem",
                            fontSize: "0.9rem",
                            fontWeight: 800,
                            background: "linear-gradient(135deg, #10B981, #059669)",
                            border: "none",
                            borderRadius: "10px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <span>View Tailored Resume</span>
                          <ArrowRight size={15} />
                        </button>
                        <button
                          className="btn-secondary"
                          onClick={() => router.push(`/resume/builder?id=${savedNewId}`)}
                          style={{
                            padding: "0.75rem 1.8rem",
                            fontSize: "0.9rem",
                            fontWeight: 700,
                            borderRadius: "10px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <Edit3 size={15} />
                          <span>Open in Resume Builder</span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL: SPLIT LIVE RESUME PREVIEW (AUTHENTIC A4 PROPORTIONS) ── */}
        {showPreview && selectedResume && (
          <div
            style={{
              flex: "1 1 48%",
              background: "var(--bg-3)",
              borderLeft: "1px solid var(--border)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Live Preview Floating Toolbar */}
            <div
              style={{
                padding: "0.65rem 1.2rem",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "var(--card)",
                flexShrink: 0,
                gap: "0.5rem",
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FileText size={15} color="var(--accent)" />
                <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--text)" }}>
                  {previewMode === "live" ? "Live A4 Preview" : "Original Uploaded PDF"}
                </span>
                {previewMode === "live" && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      background: totalPages > 1 ? "rgba(245, 158, 11, 0.12)" : "rgba(16, 185, 129, 0.12)",
                      border: totalPages > 1 ? "1px solid rgba(245, 158, 11, 0.3)" : "1px solid rgba(16, 185, 129, 0.3)",
                      padding: "2px 7px",
                      borderRadius: "6px",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      color: totalPages > 1 ? "#d97706" : "#059669",
                    }}
                    title={totalPages > 1 ? "Multi-page resume (A4 standard: 297mm per page)" : "Single-page resume (Fits on 1 A4 page)"}
                  >
                    <span>📄</span>
                    <span>{totalPages} {totalPages === 1 ? "Page" : "Pages"}</span>
                  </div>
                )}
              </div>

              {/* View Mode Toggle (If original PDF url exists) */}
              {originalPdfUrl && (
                <div style={{ display: "flex", gap: "0.2rem", background: "var(--bg-2)", padding: "0.2rem", borderRadius: "8px", border: "1px solid var(--border)" }}>
                  <button
                    type="button"
                    onClick={() => setPreviewMode("live")}
                    style={{
                      padding: "0.22rem 0.6rem",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      borderRadius: "6px",
                      background: previewMode === "live" ? "var(--accent)" : "transparent",
                      color: previewMode === "live" ? "#fff" : "var(--text-muted)",
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    Live Tailored
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode("pdf")}
                    style={{
                      padding: "0.22rem 0.6rem",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      borderRadius: "6px",
                      background: previewMode === "pdf" ? "var(--accent)" : "transparent",
                      color: previewMode === "pdf" ? "#fff" : "var(--text-muted)",
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    Original PDF
                  </button>
                </div>
              )}

              {/* Template Selector Dropdown */}
              {previewMode === "live" && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <Palette size={13} color="var(--accent)" />
                  <select
                    value={selectedTemplate}
                    onChange={(e) => {
                      const newTpl = e.target.value;
                      setSelectedTemplate(newTpl);
                      if (selectedResume) {
                        setSelectedResume({ ...selectedResume, template_id: newTpl });
                      }
                    }}
                    title="Change Resume Design Template"
                    style={{
                      background: "var(--bg-2)",
                      color: "var(--text)",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      padding: "0.22rem 0.5rem",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      outline: "none",
                    }}
                  >
                    <option value="jakes-resume">Jake's Resume (Clean ATS)</option>
                    <option value="awesome-corporate">Awesome Corporate (Executive Clean)</option>
                    <option value="altacv-modern">AltaCV Modern (Executive 2-Col)</option>
                    <option value="curve-timeline">CurVe Timeline (Refined)</option>
                    <option value="hipster-sidebar">Hipster Sidebar (Bold Modern)</option>
                    <option value="deedy-cs">Deedy CS (Dense Tech SWE)</option>
                    <option value="plasmati-academic">Plasmati Academic (Classic)</option>
                  </select>
                </div>
              )}

              {/* Page-wise Jump Navigation & Cutoff Toggle */}
              {previewMode === "live" && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  {totalPages > 1 && (
                    <div style={{ display: "flex", gap: "0.15rem", background: "var(--bg-2)", padding: "0.15rem", borderRadius: "6px", border: "1px solid var(--border)" }}>
                      {Array.from({ length: totalPages }).map((_, idx) => {
                        const p = idx + 1;
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => scrollToPage(p)}
                            title={`Jump to Page ${p}`}
                            style={{
                              padding: "0.18rem 0.45rem",
                              fontSize: "0.68rem",
                              fontWeight: 700,
                              borderRadius: "4px",
                              border: "none",
                              cursor: "pointer",
                              background: activeViewPage === p ? "var(--accent)" : "transparent",
                              color: activeViewPage === p ? "#fff" : "var(--text-secondary)",
                              transition: "all 0.15s",
                            }}
                          >
                            Page {p}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowPageGuides((prev) => !prev)}
                    title={showPageGuides ? "Hide A4 page cutoff lines" : "Show A4 page cutoff lines"}
                    style={{
                      background: showPageGuides ? "rgba(99, 102, 241, 0.1)" : "var(--bg-2)",
                      border: showPageGuides ? "1px solid rgba(99, 102, 241, 0.3)" : "1px solid var(--border)",
                      color: showPageGuides ? "var(--accent)" : "var(--text-secondary)",
                      padding: "0.22rem 0.5rem",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    {showPageGuides ? "Cutoffs: ON" : "Cutoffs: OFF"}
                  </button>
                </div>
              )}

              {/* Zoom & Action Controls */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                {previewMode === "live" && (
                  <>
                    <button
                      type="button"
                      onClick={() => setZoomFactor((prev) => Math.max(0.4, Number((prev - 0.05).toFixed(2))))}
                      className="btn-secondary"
                      title="Zoom Out"
                      style={{ padding: "0.22rem 0.5rem", fontSize: "0.75rem", borderRadius: "6px" }}
                    >
                      <ZoomOut size={12} />
                    </button>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text)", minWidth: "2.5rem", textAlign: "center" }}>
                      {Math.round(zoomFactor * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setZoomFactor((prev) => Math.min(1.2, Number((prev + 0.05).toFixed(2))))}
                      className="btn-secondary"
                      title="Zoom In"
                      style={{ padding: "0.22rem 0.5rem", fontSize: "0.75rem", borderRadius: "6px" }}
                    >
                      <ZoomIn size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={handleFitToWidth}
                      title="Fit to Screen Width"
                      style={{
                        background: "var(--bg-2)",
                        border: "1px solid var(--border)",
                        borderRadius: "6px",
                        cursor: "pointer",
                        color: "var(--text-secondary)",
                        padding: "0.22rem 0.55rem",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                      }}
                    >
                      Fit
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomFactor(1)}
                      title="Reset to 100% Size"
                      style={{
                        background: zoomFactor === 1 ? "rgba(99, 102, 241, 0.1)" : "var(--bg-2)",
                        border: zoomFactor === 1 ? "1px solid rgba(99, 102, 241, 0.3)" : "1px solid var(--border)",
                        borderRadius: "6px",
                        cursor: "pointer",
                        color: zoomFactor === 1 ? "var(--accent)" : "var(--text-secondary)",
                        padding: "0.22rem 0.55rem",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                      }}
                    >
                      100%
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  title="Close Live Preview"
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    padding: "0.22rem 0.4rem",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Canvas Area: Un-stretched, authentic A4 proportions */}
            <div
              ref={previewContainerRef}
              style={{
                flex: 1,
                overflowY: "auto",
                overflowX: "auto",
                padding: "2rem 1rem",
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                background: "radial-gradient(circle, rgba(148, 163, 184, 0.12) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
                position: "relative",
              }}
            >
              {previewMode === "pdf" && originalPdfUrl ? (
                <iframe
                  src={`${originalPdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                  style={{ width: "100%", height: "100%", border: "none", minHeight: "800px", borderRadius: "8px", background: "#fff" }}
                  title="Original Resume PDF"
                />
              ) : (
                /* Authentic A4 Page (210mm standard width, minHeight 297mm) */
                <div
                  ref={paperRef}
                  className="resume-paper resume-print-area"
                  style={{
                    position: "relative",
                    width: "210mm",
                    minWidth: "210mm",
                    maxWidth: "210mm",
                    minHeight: "297mm",
                    backgroundColor: "#ffffff",
                    color: "#000000",
                    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.08)",
                    borderRadius: "4px",
                    boxSizing: "border-box",
                    transform: zoomFactor !== 1 ? `scale(${zoomFactor})` : undefined,
                    transformOrigin: "top center",
                    transition: "transform 0.15s ease-out",
                    marginBottom: zoomFactor > 1 ? `${(zoomFactor - 1) * 1123 + 32}px` : "2rem",
                    flexShrink: 0,
                  }}
                >
                  {/* Visual Page Break Indicators */}
                  {showPageGuides && totalPages > 1 && Array.from({ length: totalPages - 1 }).map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <div
                        key={pageNum}
                        className="no-print"
                        style={{
                          position: "absolute",
                          top: `${pageNum * 297}mm`,
                          left: "-18px",
                          right: "-18px",
                          zIndex: 25,
                          pointerEvents: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        {/* Left Page End Tag */}
                        <div
                          style={{
                            background: "#0f172a",
                            color: "#ffffff",
                            fontSize: "0.62rem",
                            fontWeight: 800,
                            padding: "2px 8px",
                            borderRadius: "4px",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                            letterSpacing: "0.5px",
                          }}
                        >
                          PAGE {pageNum} END
                        </div>

                        {/* Center Cutoff Line & Floating Badge */}
                        <div
                          style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            margin: "0 8px",
                            position: "relative",
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              left: 0,
                              right: 0,
                              borderTop: "2px dashed #f59e0b",
                              opacity: 0.85,
                            }}
                          />
                          <div
                            style={{
                              margin: "0 auto",
                              background: "#1e293b",
                              color: "#f8fafc",
                              border: "1px solid #f59e0b",
                              borderRadius: "12px",
                              padding: "2px 10px",
                              fontSize: "0.68rem",
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                              boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
                              position: "relative",
                              zIndex: 2,
                            }}
                          >
                            <span style={{ color: "#f59e0b" }}>✂️</span>
                            <span>A4 Print Cutoff • End of Page {pageNum}</span>
                          </div>
                        </div>

                        {/* Right Page Start Tag */}
                        <div
                          style={{
                            background: "#2563eb",
                            color: "#ffffff",
                            fontSize: "0.62rem",
                            fontWeight: 800,
                            padding: "2px 8px",
                            borderRadius: "4px",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                            letterSpacing: "0.5px",
                          }}
                        >
                          PAGE {pageNum + 1} START
                        </div>
                      </div>
                    );
                  })}

                  {/* Corner Page Number Badges for Each Page */}
                  {showPageGuides && Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <div
                        key={`badge-${pageNum}`}
                        className="no-print"
                        style={{
                          position: "absolute",
                          top: `${(pageNum - 1) * 297 + 10}mm`,
                          right: "12px",
                          zIndex: 10,
                          pointerEvents: "none",
                          fontSize: "0.62rem",
                          fontWeight: 700,
                          color: "#94a3b8",
                          background: "rgba(241, 245, 249, 0.85)",
                          border: "1px solid #e2e8f0",
                          padding: "1px 6px",
                          borderRadius: "4px",
                          letterSpacing: "0.5px",
                        }}
                      >
                        PAGE {pageNum} OF {totalPages}
                      </div>
                    );
                  })}

                  <ResumeDocument
                    data={selectedResume.resume_data}
                    templateId={selectedTemplate || selectedResume.template_id || "jakes-resume"}
                    highlightKeywords={jdMatchResult?.matchedKeywords || []}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
