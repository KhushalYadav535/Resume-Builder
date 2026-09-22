"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { Resume } from "@/types";
import {
  Sparkles,
  Briefcase,
  FolderGit2,
  Award,
  Zap,
  GraduationCap,
  ShieldCheck,
  Languages,
  ArrowRight,
  Plus,
  FileText,
  Clock,
  Layers,
  CheckCircle2,
  ExternalLink,
  Map,
  ChevronRight,
  Info,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  Brain,
  Shield
} from "lucide-react";
import ImpactNudgeCard from "@/components/value/ImpactNudgeCard";
import GuidedImpactModal from "@/components/value/GuidedImpactModal";
import { CareerGap } from "@/app/api/value/detect-gaps/route";
import EvidenceNudgeCard from "@/components/value/EvidenceNudgeCard";
import EvidenceCaptureModal from "@/components/value/EvidenceCaptureModal";
import { EvidenceGap } from "@/app/api/value/detect-evidence-gaps/route";
import DerivationNudgeCard from "@/components/value/DerivationNudgeCard";
import CapabilityReviewModal from "@/components/value/CapabilityReviewModal";
import { CapabilityHypothesis } from "@/app/api/value/derive-profile/route";
import EvidenceProgressView from "@/components/value/EvidenceProgressView";

interface CategoryMeta {
  key: string;
  label: string;
  desc: string;
  icon: any;
  count: number;
  badge?: string;
  emptyText: string;
  gradient: string;
  iconColor: string;
  borderColor: string;
  addHash: string;
}

export default function ValueOverviewPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Stage 2: Guided Impact Discovery state
  const [gaps, setGaps] = useState<CareerGap[]>([]);
  const [activeGap, setActiveGap] = useState<CareerGap | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Stage 3: Evidence & Progression Capture state
  const [evidenceGaps, setEvidenceGaps] = useState<EvidenceGap[]>([]);
  const [activeEvidenceGap, setActiveEvidenceGap] = useState<EvidenceGap | null>(null);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);

  // Stage 4: Career Value Derivation state
  const [unreviewedCaps, setUnreviewedCaps] = useState<CapabilityHypothesis[]>([]);
  const [activeCap, setActiveCap] = useState<CapabilityHypothesis | null>(null);
  const [isCapModalOpen, setIsCapModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch("/api/get-resumes")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setResumes(list);
        if (list.length > 0) {
          const base = list.find((r: Resume) => r.is_base_resume) || list[0];
          setSelectedResumeId(base.id);
        }
      })
      .catch((err) => console.error("Error fetching resumes:", err))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!selectedResumeId) return;
    fetch("/api/value/detect-gaps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeId: selectedResumeId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.gaps && Array.isArray(data.gaps)) {
          let resolved: string[] = [];
          try {
            resolved = JSON.parse(sessionStorage.getItem("resolved_gaps") || "[]");
          } catch (e) {}
          const filtered = data.gaps.filter(
            (g: CareerGap) =>
              !resolved.includes(g.id) &&
              !resolved.includes(g.originalText) &&
              !resolved.some((r) => g.originalText.includes(r))
          );
          setGaps(filtered);
        }
      })
      .catch((err) => console.error("Error detecting gaps:", err));

    fetch("/api/value/detect-evidence-gaps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeId: selectedResumeId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.gaps && Array.isArray(data.gaps)) {
          setEvidenceGaps(data.gaps);
        }
      })
      .catch((err) => console.error("Error detecting evidence gaps:", err));

    fetch("/api/value/derive-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeId: selectedResumeId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.profile?.capabilities) {
          let dismissed: string[] = [];
          try {
            dismissed = JSON.parse(sessionStorage.getItem("dismissed_caps") || "[]");
          } catch (e) {}
          const unreviewed = data.profile.capabilities.filter(
            (c: CapabilityHypothesis) => c.status === "unconfirmed" && !dismissed.includes(c.id)
          );
          setUnreviewedCaps(unreviewed);
        }
      })
      .catch((err) => console.error("Error deriving profile:", err));
  }, [selectedResumeId]);

  const activeResume = useMemo(() => {
    return resumes.find((r) => r.id === selectedResumeId) || resumes[0] || null;
  }, [resumes, selectedResumeId]);

  const resumeData = activeResume?.resume_data;

  // Compute category counts
  const categories: CategoryMeta[] = useMemo(() => {
    const expCount = resumeData?.workExperience?.length || 0;
    const projCount = resumeData?.projects?.length || 0;
    const skillsCount =
      (resumeData?.skills?.technical?.length || 0) + (resumeData?.skills?.soft?.length || 0);
    const eduCount = resumeData?.education?.length || 0;
    const certCount = resumeData?.certifications?.length || 0;
    const awardsCount =
      (resumeData?.hackathons?.length || 0) + (resumeData?.codingContests?.length || 0);
    const addCount = resumeData?.languagesKnown?.length || 0;

    // Derive achievements count from work bullets that look quantified + campus achievements
    const statedAchievementsCount =
      (resumeData?.campusAchievements?.length || 0) +
      (resumeData?.workExperience?.flatMap((w) => w.bullets || []).filter((b) =>
        /\d+%|\$\d+|₹\d+|\d+x|reduced|increased|improved|scaled|delivered/i.test(b)
      ).length || 0);

    return [
      {
        key: "employment",
        label: "Employment History",
        desc: "Companies, roles, tenures & verified responsibilities",
        icon: Briefcase,
        count: expCount,
        badge: expCount > 0 ? `${expCount} Roles` : undefined,
        emptyText: "No employment records found.",
        gradient: "from-amber-500/20 via-amber-500/10 to-transparent",
        iconColor: "text-amber-500 bg-amber-500/15 border-amber-500/30",
        borderColor: "hover:border-amber-500/50",
        addHash: "experience",
      },
      {
        key: "projects",
        label: "Projects & Engineering",
        desc: "Architecture, system design & technical deliverables",
        icon: FolderGit2,
        count: projCount,
        badge: projCount > 0 ? `${projCount} Projects` : undefined,
        emptyText: "No project records extracted.",
        gradient: "from-blue-500/20 via-blue-500/10 to-transparent",
        iconColor: "text-blue-500 bg-blue-500/15 border-blue-500/30",
        borderColor: "hover:border-blue-500/50",
        addHash: "projects",
      },
      {
        key: "achievements",
        label: "Impact & Achievements",
        desc: "Quantified accomplishments, metrics & business outcomes",
        icon: Award,
        count: statedAchievementsCount,
        badge: statedAchievementsCount > 0 ? `${statedAchievementsCount} Stated` : undefined,
        emptyText: "No explicit achievements extracted yet.",
        gradient: "from-emerald-500/20 via-emerald-500/10 to-transparent",
        iconColor: "text-emerald-500 bg-emerald-500/15 border-emerald-500/30",
        borderColor: "hover:border-emerald-500/50",
        addHash: "experience",
      },
      {
        key: "skills",
        label: "Skills & Capabilities",
        desc: "Technical frameworks, tool stack & demonstrated skills",
        icon: Zap,
        count: skillsCount,
        badge: skillsCount > 0 ? `${skillsCount} Skills` : undefined,
        emptyText: "No skills extracted.",
        gradient: "from-purple-500/20 via-purple-500/10 to-transparent",
        iconColor: "text-purple-500 bg-purple-500/15 border-purple-500/30",
        borderColor: "hover:border-purple-500/50",
        addHash: "skills",
      },
      {
        key: "awards",
        label: "Awards & Honors",
        desc: "Industry recognition, hackathons & competitive distinctions",
        icon: Sparkles,
        count: awardsCount,
        badge: awardsCount > 0 ? `${awardsCount} Records` : undefined,
        emptyText: "No awards recorded.",
        gradient: "from-rose-500/20 via-rose-500/10 to-transparent",
        iconColor: "text-rose-500 bg-rose-500/15 border-rose-500/30",
        borderColor: "hover:border-rose-500/50",
        addHash: "achievements",
      },
      {
        key: "certifications",
        label: "Certifications & Credentials",
        desc: "Cloud architect, professional licenses & domain certs",
        icon: ShieldCheck,
        count: certCount,
        badge: certCount > 0 ? `${certCount} Certs` : undefined,
        emptyText: "No certifications added.",
        gradient: "from-teal-500/20 via-teal-500/10 to-transparent",
        iconColor: "text-teal-500 bg-teal-500/15 border-teal-500/30",
        borderColor: "hover:border-teal-500/50",
        addHash: "certifications",
      },
      {
        key: "education",
        label: "Education & Academics",
        desc: "Degrees, institutions, GPAs & foundational coursework",
        icon: GraduationCap,
        count: eduCount,
        badge: eduCount > 0 ? `${eduCount} Degrees` : undefined,
        emptyText: "No education records found.",
        gradient: "from-indigo-500/20 via-indigo-500/10 to-transparent",
        iconColor: "text-indigo-500 bg-indigo-500/15 border-indigo-500/30",
        borderColor: "hover:border-indigo-500/50",
        addHash: "education",
      },
      {
        key: "additional",
        label: "Languages & Context",
        desc: "Spoken languages, publications & leadership activities",
        icon: Languages,
        count: addCount,
        badge: addCount > 0 ? `${addCount} Items` : undefined,
        emptyText: "No additional records.",
        gradient: "from-sky-500/20 via-sky-500/10 to-transparent",
        iconColor: "text-sky-500 bg-sky-500/15 border-sky-500/30",
        borderColor: "hover:border-sky-500/50",
        addHash: "languages",
      },
    ];
  }, [resumeData]);

  // Aggregate Metrics for Executive Telemetry Bar
  const totalVerifiedFacts = useMemo(() => {
    return categories.reduce((sum, cat) => sum + cat.count, 0);
  }, [categories]);

  const activeDimensionsCount = useMemo(() => {
    return categories.filter((cat) => cat.count > 0).length;
  }, [categories]);

  // Current role and summary calculations
  const currentRole =
    resumeData?.workExperience?.find((w) => w.current)?.role ||
    resumeData?.workExperience?.[0]?.role ||
    "Technology Professional";

  const currentOrg =
    resumeData?.workExperience?.find((w) => w.current)?.company ||
    resumeData?.workExperience?.[0]?.company ||
    "";

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] flex flex-col font-sans transition-colors">
      <Navbar />

      {/* Hero Header with Luminous Brand Orbs */}
      <section className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--card)] py-12 px-6 sm:px-8">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-[420px] h-[420px] bg-violet-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-[350px] h-[350px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-8">
          {/* Top Bar: Title & Navigation Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <Sparkles size={13} className="text-amber-500" />
                <span>Career Operating System · Foundation Layer</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--text-primary)] font-['Syne',sans-serif]">
                My Value <span className="text-amber-500 font-normal">Workspace</span>
              </h1>
              <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl leading-relaxed">
                Your career assets, substantiated achievements, and capability dimensions extracted from your resume. This forms your persistent, audit-ready Career Memory.
              </p>
            </div>

            {/* Resume Selector & Discovery Switchers */}
            <div className="flex flex-wrap items-center gap-3">
              {resumes.length > 1 && (
                <div className="flex items-center gap-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-3 py-2 shadow-xs">
                  <FileText size={14} className="text-amber-500" />
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="bg-transparent text-xs font-bold text-[var(--text-primary)] focus:outline-none cursor-pointer"
                  >
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id} className="bg-[var(--card)]">
                        {r.file_name || "Untitled Resume"}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <Link
                href="/value/profile"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-violet-500/15 border border-violet-500/30 text-violet-600 dark:text-violet-400 hover:bg-violet-500/25 hover:border-violet-500/50 transition-all shadow-xs no-underline"
              >
                <Brain size={14} />
                <span>Career Value Profile</span>
              </Link>

              <Link
                href="/career-discovery"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-500/15 border border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/25 transition-all shadow-xs no-underline"
              >
                <Map size={14} />
                <span>Card Discovery (CDE)</span>
              </Link>

              <Link
                href="/resume/builder?new=true"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-brand-navy bg-amber-500 hover:bg-amber-400 transition-all shadow-md shadow-amber-500/25 active:scale-[0.98] no-underline"
              >
                <Plus size={14} strokeWidth={3} />
                <span>Edit in Builder</span>
              </Link>
            </div>
          </div>

          {/* Quick Executive Telemetry Ribbon */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-[var(--bg-elevated)]/60 backdrop-blur-md border border-[var(--border)] space-y-1">
              <div className="flex items-center justify-between text-[var(--text-muted)] text-xs font-medium">
                <span>Verified Facts</span>
                <CheckCircle2 size={15} className="text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-[var(--text-primary)] font-['Syne',sans-serif]">
                {totalVerifiedFacts}
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">Extracted from resume</p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--bg-elevated)]/60 backdrop-blur-md border border-[var(--border)] space-y-1">
              <div className="flex items-center justify-between text-[var(--text-muted)] text-xs font-medium">
                <span>Active Dimensions</span>
                <Layers size={15} className="text-amber-500" />
              </div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-['Syne',sans-serif]">
                {activeDimensionsCount} <span className="text-xs text-[var(--text-muted)] font-normal">/ 8</span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">Career categories covered</p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--bg-elevated)]/60 backdrop-blur-md border border-[var(--border)] space-y-1">
              <div className="flex items-center justify-between text-[var(--text-muted)] text-xs font-medium">
                <span>Value Intelligence</span>
                <Sparkles size={15} className="text-violet-500" />
              </div>
              <div className="text-2xl font-black text-violet-600 dark:text-violet-400 font-['Syne',sans-serif]">
                Stages 2–4
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">Active derivation loop</p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--bg-elevated)]/60 backdrop-blur-md border border-[var(--border)] space-y-1">
              <div className="flex items-center justify-between text-[var(--text-muted)] text-xs font-medium">
                <span>Integrity Status</span>
                <Shield size={15} className="text-teal-500" />
              </div>
              <div className="text-2xl font-black text-[var(--text-primary)] font-['Syne',sans-serif] flex items-center gap-1.5">
                <span>100%</span>
                <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">Traceable</span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">Audit-ready evidence</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto w-full px-6 sm:px-8 py-10 flex-1 space-y-10">
        {/* V1.7 — Extraction Incomplete Status */}
        {activeResume && (!resumeData || (!resumeData.workExperience?.length && !resumeData.projects?.length && !resumeData.skills?.technical?.length)) && (
          <section className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-4 shadow-sm">
            <AlertTriangle size={22} className="text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <h3 className="text-sm font-bold text-amber-600 dark:text-amber-400">
                Resume Processing Incomplete
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-3xl">
                Your resume has been uploaded but career information extraction is pending or incomplete. Some categories may appear empty until parsing is complete.
              </p>
              <div className="pt-1 flex items-center gap-3">
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-brand-navy hover:bg-amber-400 transition-all cursor-pointer"
                >
                  <RefreshCw size={12} />
                  <span>Refresh Status</span>
                </button>
                <Link
                  href="/resume/builder?new=true"
                  className="text-xs font-bold text-amber-500 hover:underline"
                >
                  Re-upload Resume
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Executive Dossier / Career Summary Card */}
        <section className="relative overflow-hidden bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 shadow-sm transition-all hover:shadow-md">
          {/* Subtle Left Accent Line */}
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-500 via-amber-400 to-amber-600" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[var(--border)]">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30 text-amber-500 flex items-center justify-center font-extrabold text-base shadow-xs">
                <Briefcase size={22} />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Career Snapshot · Primary Identity
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] font-['Syne',sans-serif] mt-0.5">
                  {currentRole} {currentOrg ? <span className="font-normal text-[var(--text-secondary)]">at {currentOrg}</span> : ""}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 shadow-xs">
                <CheckCircle2 size={13} />
                <span>Verified Resume Extraction</span>
              </span>
            </div>
          </div>

          <div className="mt-5 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            {resumeData?.summary ? (
              <p className="line-clamp-3 italic text-[var(--text-primary)]/90">
                "{resumeData.summary}"
              </p>
            ) : (
              <p className="italic text-[var(--text-muted)] text-sm">
                No executive summary was extracted from this resume. You can add one in the Profile Studio to clarify your leadership narrative.
              </p>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-5 flex-wrap">
              <span><strong>Source File:</strong> {activeResume?.file_name || "Resume.pdf"}</span>
              {activeResume?.created_at && (
                <span><strong>Uploaded:</strong> {new Date(activeResume.created_at).toLocaleDateString()}</span>
              )}
            </div>
            <Link
              href="/resume/builder?new=true#summary"
              className="text-amber-500 hover:text-amber-400 font-bold inline-flex items-center gap-1 no-underline group"
            >
              <span>Edit Summary in Builder</span>
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </section>

        {/* Stage 2: System-Generated Impact Nudge (Screen S1) */}
        {gaps.length > 0 && (
          <ImpactNudgeCard
            gap={gaps[0]}
            onAnswerNow={() => {
              setActiveGap(gaps[0]);
              setIsModalOpen(true);
            }}
            onDismiss={() => {
              const dismissedGap = gaps[0];
              if (dismissedGap) {
                try {
                  const resolved = JSON.parse(sessionStorage.getItem("resolved_gaps") || "[]");
                  resolved.push(dismissedGap.id, dismissedGap.originalText);
                  sessionStorage.setItem("resolved_gaps", JSON.stringify(resolved));
                } catch (e) {}
              }
              setGaps((prev) => prev.slice(1));
            }}
          />
        )}

        {/* Guided Impact Discovery Modal (Screens S2, S3, S4) */}
        {isModalOpen && activeGap && (
          <GuidedImpactModal
            gap={activeGap}
            resumeId={selectedResumeId || activeResume?.id || ""}
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setActiveGap(null);
            }}
            onSuccess={(updatedBullet) => {
              const currentGapId = activeGap.id;
              const currentGapText = activeGap.originalText;
              setGaps((prev) =>
                prev.filter(
                  (g) =>
                    g.id !== currentGapId &&
                    g.originalText !== currentGapText &&
                    (!updatedBullet || g.originalText !== updatedBullet)
                )
              );
              try {
                const resolved = JSON.parse(sessionStorage.getItem("resolved_gaps") || "[]");
                resolved.push(currentGapId, currentGapText);
                if (updatedBullet) resolved.push(updatedBullet);
                sessionStorage.setItem("resolved_gaps", JSON.stringify(resolved));
              } catch (e) {}

              // Refresh resumes & detected gaps to immediately reflect the update
              const targetResId = selectedResumeId || activeResume?.id;
              fetch("/api/get-resumes")
                .then((r) => r.json())
                .then((data) => {
                  if (Array.isArray(data)) setResumes(data);
                  if (targetResId) {
                    fetch("/api/value/detect-gaps", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ resumeId: targetResId }),
                    })
                      .then((res) => res.json())
                      .then((d) => {
                        if (d.gaps && Array.isArray(d.gaps)) {
                          let resolved: string[] = [];
                          try {
                            resolved = JSON.parse(sessionStorage.getItem("resolved_gaps") || "[]");
                          } catch (e) {}
                          const filtered = d.gaps.filter(
                            (g: CareerGap) =>
                              !resolved.includes(g.id) &&
                              !resolved.includes(g.originalText) &&
                              !resolved.some((r) => r && r.length > 5 && g.originalText.includes(r))
                          );
                          setGaps(filtered);
                        }
                      });
                  }
                });
            }}
          />
        )}

        {/* Stage 3: System-Generated Evidence Nudge (Screen S1) */}
        {gaps.length === 0 && evidenceGaps.length > 0 && (
          <EvidenceNudgeCard
            gap={evidenceGaps[0]}
            onAnswerNow={() => {
              setActiveEvidenceGap(evidenceGaps[0]);
              setIsEvidenceModalOpen(true);
            }}
            onDismiss={() => {
              setEvidenceGaps((prev) => prev.slice(1));
            }}
          />
        )}

        {/* Stage 3: Evidence Capture Modal (Screens S2, S3, S4, S5) */}
        {isEvidenceModalOpen && activeEvidenceGap && (
          <EvidenceCaptureModal
            gap={activeEvidenceGap}
            resumeId={selectedResumeId}
            isOpen={isEvidenceModalOpen}
            onClose={() => setIsEvidenceModalOpen(false)}
            onSuccess={() => {
              setEvidenceGaps((prev) =>
                prev.filter((g) => g.id !== activeEvidenceGap.id)
              );
            }}
          />
        )}

        {/* Stage 3: Progressive Evidence View (Screen S5) */}
        <EvidenceProgressView />

        {/* Stage 4: System-Generated Derivation Nudge (Screen S1) */}
        {unreviewedCaps.length > 0 && (
          <DerivationNudgeCard
            unreviewedCapabilities={unreviewedCaps}
            onReviewNow={(cap) => {
              setActiveCap(cap);
              setIsCapModalOpen(true);
            }}
            onDismiss={() => {
              const dismissed = unreviewedCaps[0];
              if (dismissed) {
                try {
                  const dismissedList = JSON.parse(sessionStorage.getItem("dismissed_caps") || "[]");
                  dismissedList.push(dismissed.id);
                  sessionStorage.setItem("dismissed_caps", JSON.stringify(dismissedList));
                } catch (e) {}
              }
              setUnreviewedCaps((prev) => prev.slice(1));
            }}
          />
        )}

        {/* Stage 4: Capability Review Modal (Screen S2) */}
        {isCapModalOpen && activeCap && (
          <CapabilityReviewModal
            capability={activeCap}
            isOpen={isCapModalOpen}
            onClose={() => {
              setIsCapModalOpen(false);
              setActiveCap(null);
            }}
            onReviewed={(action, updatedCap) => {
              const capId = activeCap.id;
              setUnreviewedCaps((prev) =>
                prev.filter((c) => c.id !== capId)
              );
              try {
                const dismissedList = JSON.parse(sessionStorage.getItem("dismissed_caps") || "[]");
                dismissedList.push(capId);
                sessionStorage.setItem("dismissed_caps", JSON.stringify(dismissedList));
              } catch (e) {}
            }}
          />
        )}

        {/* 8 Information Categories Grid */}
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Information Architecture
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text-primary)] font-['Syne',sans-serif]">
                8 Career Dimensions
              </h2>
            </div>
            <span className="text-xs text-[var(--text-muted)]">
              Click any category card to inspect, add, or manage verified records
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const hasRecords = cat.count > 0;

              return (
                <div
                  key={cat.key}
                  className={`bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 hover:shadow-lg ${cat.borderColor}`}
                >
                  <div>
                    {/* Header: Icon & Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cat.gradient} border ${cat.iconColor.split(" ")[2] || "border-transparent"} flex items-center justify-center shadow-xs transition-transform group-hover:scale-105`}
                      >
                        <Icon size={22} className={cat.iconColor.split(" ")[0]} />
                      </div>
                      {cat.badge ? (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] font-mono shadow-xs">
                          {cat.badge}
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-muted)]">
                          0 records
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-[var(--text-primary)] font-['Syne',sans-serif] group-hover:text-amber-500 transition-colors">
                      {cat.label}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-1.5 line-clamp-2 leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-[var(--border)] flex items-center justify-between">
                    {hasRecords ? (
                      <Link
                        href={`/value/${cat.key}`}
                        className="text-xs font-bold text-amber-500 hover:text-amber-400 inline-flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform no-underline"
                      >
                        <span>View Records ({cat.count})</span>
                        <ChevronRight size={14} />
                      </Link>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs text-[var(--text-muted)]">Empty</span>
                        <Link
                          href={`/resume/builder?new=true#${cat.addHash}`}
                          className="text-xs font-bold text-amber-500 hover:underline inline-flex items-center gap-1"
                        >
                          <Plus size={12} />
                          <span>Add</span>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Future Phase Intelligence Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-500/10 via-amber-500/5 to-blue-500/10 border border-purple-500/25 p-6 sm:p-8 shadow-sm">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Brain size={24} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider font-['Syne',sans-serif]">
                    Career Value Intelligence System
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                    Live Continuous Synthesis
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-3xl">
                  Guided Impact Discovery, Evidence & Progression Capture, and Multidimensional Value Derivation are actively listening to your updates. Every bullet confirmed powers your executive positioning.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <Link
                href="/momentum"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[var(--bg-elevated)] hover:bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] transition-all shadow-xs no-underline"
              >
                <span>Momentum Hub</span>
                <ArrowRight size={13} />
              </Link>
              <Link
                href="/career-copilot"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-all shadow-md shadow-purple-600/25 no-underline"
              >
                <span>Navigator Copilot</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
