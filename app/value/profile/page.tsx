"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import {
  Sparkles,
  ShieldCheck,
  Brain,
  Award,
  TrendingUp,
  Layers,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  Briefcase,
  FolderGit2,
  BookOpen,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Filter,
  Info,
  Edit3,
  Shield
} from "lucide-react";
import {
  CareerValueProfileData,
  CapabilityHypothesis,
  ImpactPattern,
  ProgressionSignal,
} from "@/app/api/value/derive-profile/route";
import CapabilityReviewModal from "@/components/value/CapabilityReviewModal";
import { useToast } from "@/components/ui/toast-1";

export default function CareerValueProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [deriving, setDeriving] = useState(false);
  const [profile, setProfile] = useState<CareerValueProfileData | null>(null);

  // Review modal state
  const [activeCapability, setActiveCapability] = useState<CapabilityHypothesis | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // Filter for capabilities
  const [capFilter, setCapFilter] = useState<"all" | "unconfirmed" | "confirmed">("all");

  // Copy state for narrative
  const [copiedNarrative, setCopiedNarrative] = useState(false);

  // Pattern edit state
  const [editingPatternId, setEditingPatternId] = useState<string | null>(null);
  const [editPatternName, setEditPatternName] = useState("");
  const [editPatternDesc, setEditPatternDesc] = useState("");
  const [savingPattern, setSavingPattern] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  const loadProfile = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/value/derive-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.profile) {
        setProfile(data.profile);
      }
    } catch (err) {
      console.error("Failed to load Career Value Profile:", err);
      showToast("Could not load career value profile.", "error");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const handleReDerive = async () => {
    setDeriving(true);
    await loadProfile(true);
    setDeriving(false);
    showToast("Career Value Profile refreshed with latest evidence!", "success");
  };

  const handleOpenReview = (cap: CapabilityHypothesis) => {
    setActiveCapability(cap);
    setIsReviewOpen(true);
  };

  const handleStartEditPattern = (pat: ImpactPattern) => {
    setEditingPatternId(pat.id);
    setEditPatternName(pat.name);
    setEditPatternDesc(pat.description);
  };

  const handleConfirmPattern = async (pat: ImpactPattern) => {
    // Optimistically update local state immediately
    setProfile((prev) => {
      if (!prev) return prev;
      const updatedPatterns = prev.impactPatterns.map((p) =>
        p.id === pat.id ? { ...p, status: "confirmed" as const } : p
      );
      return { ...prev, impactPatterns: updatedPatterns };
    });

    try {
      const res = await fetch("/api/value/review-pattern", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patternId: pat.id,
          patternName: pat.name,
          description: pat.description,
          status: "confirmed",
          action: "confirm",
        }),
      });
      if (res.ok) {
        showToast(`Pattern "${pat.name}" confirmed!`, "success");
        loadProfile(true);
      } else {
        showToast("Failed to confirm pattern.", "error");
        loadProfile(true);
      }
    } catch (err) {
      console.error(err);
      showToast("Error confirming pattern.", "error");
      loadProfile(true);
    }
  };

  const handleSavePatternEdit = async (patId: string) => {
    if (!editPatternName.trim()) return;
    setSavingPattern(true);
    const newName = editPatternName.trim();
    const newDesc = editPatternDesc.trim();

    // Optimistically update local state
    setProfile((prev) => {
      if (!prev) return prev;
      const updatedPatterns = prev.impactPatterns.map((p) =>
        p.id === patId ? { ...p, name: newName, description: newDesc, status: "confirmed" as const } : p
      );
      return { ...prev, impactPatterns: updatedPatterns };
    });
    setEditingPatternId(null);

    try {
      const res = await fetch("/api/value/review-pattern", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patternId: patId,
          patternName: newName,
          description: newDesc,
          status: "modified",
          action: "modify",
        }),
      });
      if (res.ok) {
        showToast("Pattern updated and confirmed!", "success");
        loadProfile(true);
      } else {
        showToast("Failed to update pattern.", "error");
        loadProfile(true);
      }
    } catch (err) {
      console.error(err);
      showToast("Error updating pattern.", "error");
      loadProfile(true);
    } finally {
      setSavingPattern(false);
    }
  };

  const handleReviewed = (
    action: "confirm" | "edit" | "reject",
    updatedCap?: CapabilityHypothesis
  ) => {
    if (!profile) return;

    if (action === "reject" && activeCapability) {
      const newCaps = profile.capabilities.filter((c) => c.id !== activeCapability.id);
      const newUnconfirmed = newCaps.filter((c) => c.status === "unconfirmed").length;
      setProfile({
        ...profile,
        capabilities: newCaps,
        itemsAwaitingReviewCount: newUnconfirmed,
        confirmationStatus: newUnconfirmed === 0 ? "Fully confirmed" : "Partially confirmed",
      });
      loadProfile(true);
    } else if (updatedCap) {
      const newCaps = profile.capabilities.map((c) =>
        c.id === updatedCap.id ? updatedCap : c
      );
      const newUnconfirmed = newCaps.filter((c) => c.status === "unconfirmed").length;
      setProfile({
        ...profile,
        capabilities: newCaps,
        itemsAwaitingReviewCount: newUnconfirmed,
        confirmationStatus: newUnconfirmed === 0 ? "Fully confirmed" : "Partially confirmed",
      });
      loadProfile(true);
    }
  };

  const handleCopyNarrative = () => {
    if (!profile?.summaryNarrative) return;
    navigator.clipboard.writeText(profile.summaryNarrative);
    setCopiedNarrative(true);
    showToast("Career Value narrative copied to clipboard!", "success");
    setTimeout(() => setCopiedNarrative(false), 2000);
  };

  const filteredCapabilities = (profile?.capabilities || []).filter((cap) => {
    if (capFilter === "unconfirmed") return cap.status === "unconfirmed";
    if (capFilter === "confirmed") return cap.status === "confirmed" || cap.status === "modified";
    return true;
  });

  const confirmedCount = (profile?.capabilities || []).filter(
    (c) => c.status === "confirmed" || c.status === "modified"
  ).length;
  const unconfirmedCount = (profile?.capabilities || []).filter(
    (c) => c.status === "unconfirmed"
  ).length;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] transition-colors flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
            <Link
              href="/value"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] hover:text-amber-500 transition-colors no-underline shadow-xs"
            >
              <ArrowLeft size={13} />
              <span>Career Value Workspace</span>
            </Link>
            <span>/</span>
            <span className="text-[var(--text-primary)] font-bold px-2 py-0.5 rounded-md bg-[var(--bg-elevated)]/50">
              Career Value Profile
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleReDerive}
              disabled={deriving || loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[var(--card)] hover:bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-secondary)] transition-all cursor-pointer disabled:opacity-50 shadow-xs"
            >
              <RefreshCw size={13} className={deriving ? "animate-spin text-violet-500" : ""} />
              <span>{deriving ? "Synthesizing..." : "Re-analyze Career Data"}</span>
            </button>
            <Link
              href="/momentum"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-md shadow-violet-600/25 no-underline active:scale-[0.98]"
            >
              <span>View Momentum</span>
              <ChevronRight size={13} />
            </Link>
          </div>
        </div>

        {/* Hero & Multi-Dimensional Formula Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600/15 via-[var(--card)] to-cyan-500/10 border border-violet-500/30 p-6 sm:p-8 shadow-sm">
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2 max-w-3xl">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-700 dark:text-violet-300 border border-violet-500/30 inline-flex items-center gap-1.5 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                    Stage 4 · Value Derivation
                  </span>

                  {profile && (
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full border inline-flex items-center gap-1.5 shadow-xs ${
                        profile.confirmationStatus === "Fully confirmed"
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                          : profile.confirmationStatus === "Partially confirmed"
                          ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30"
                          : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {profile.confirmationStatus === "Fully confirmed" ? (
                        <CheckCircle2 size={13} />
                      ) : (
                        <AlertCircle size={13} />
                      )}
                      <span>{profile.confirmationStatus}</span>
                      {unconfirmedCount > 0 && ` (${unconfirmedCount} awaiting review)`}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[var(--text-primary)] font-['Syne',sans-serif] tracking-tight">
                  Integrated Career Value Profile
                </h1>

                <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                  Your multidimensional career profile synthesized from verified employment facts, project achievements, and captured evidence.
                </p>
              </div>
            </div>

            {/* Core Architectural Formula Callout */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[var(--card)]/90 backdrop-blur-md border border-violet-500/20 space-y-2.5 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-violet-600 dark:text-violet-400">
                <Brain size={15} />
                <span>UpRole Multidimensional Value Formula</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)] font-mono bg-[var(--bg-elevated)] px-3 py-2 rounded-xl border border-[var(--border)]">
                Career Value = Relevant Experience + Demonstrated Capabilities + Impact + Evidence + Progression
              </p>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                UpRole never reduces your professional worth to a single arbitrary number. Each pillar below reflects substantiated career assets that give you leverage in negotiations, promotion cycles, and executive transitions.
              </p>
            </div>

            {/* Stat Summary Cards */}
            {profile && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-1 shadow-xs">
                  <div className="flex items-center justify-between text-[var(--text-muted)] text-xs">
                    <span>Confirmed Capabilities</span>
                    <CheckCircle2 size={14} className="text-emerald-500" />
                  </div>
                  <div className="text-2xl font-black text-[var(--text-primary)] font-['Syne',sans-serif]">
                    {confirmedCount}
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)]">Verified by you</p>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-1 shadow-xs">
                  <div className="flex items-center justify-between text-[var(--text-muted)] text-xs">
                    <span>Awaiting Review</span>
                    <AlertCircle size={14} className="text-amber-500" />
                  </div>
                  <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-['Syne',sans-serif]">
                    {unconfirmedCount}
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)]">AI hypotheses</p>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-1 shadow-xs">
                  <div className="flex items-center justify-between text-[var(--text-muted)] text-xs">
                    <span>Impact Patterns</span>
                    <TrendingUp size={14} className="text-blue-500" />
                  </div>
                  <div className="text-2xl font-black text-[var(--text-primary)] font-['Syne',sans-serif]">
                    {profile.impactPatterns.length}
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)]">Recurring themes</p>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-1 shadow-xs">
                  <div className="flex items-center justify-between text-[var(--text-muted)] text-xs">
                    <span>Supporting Evidence</span>
                    <ShieldCheck size={14} className="text-violet-500" />
                  </div>
                  <div className="text-2xl font-black text-[var(--text-primary)] font-['Syne',sans-serif]">
                    {profile.evidenceCount}
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)]">Data points linked</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <RefreshCw className="animate-spin text-violet-500" size={36} />
            <p className="text-sm font-semibold text-[var(--text-secondary)]">
              Synthesizing your multidimensional Career Value Profile...
            </p>
          </div>
        ) : !profile ? (
          <div className="p-12 text-center rounded-3xl bg-[var(--card)] border border-[var(--border)] space-y-4 shadow-sm">
            <Info size={40} className="mx-auto text-[var(--text-muted)]" />
            <h3 className="text-lg font-bold font-['Syne',sans-serif]">No Career Data Available</h3>
            <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
              Please upload or build a resume in your Value Workspace to unlock automated Career Value Derivation.
            </p>
            <Link
              href="/value"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-black shadow-md shadow-violet-600/25 cursor-pointer no-underline"
            >
              <span>Go to Value Workspace</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Section 1: Executive Narrative */}
            {profile.summaryNarrative && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <BookOpen size={20} className="text-violet-500" />
                    <h2 className="text-xl font-bold font-['Syne',sans-serif]">
                      Career Value Narrative
                    </h2>
                  </div>

                  <button
                    onClick={handleCopyNarrative}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[var(--card)] hover:bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-secondary)] transition-all cursor-pointer shadow-xs"
                  >
                    {copiedNarrative ? (
                      <>
                        <Check size={13} className="text-emerald-500" />
                        <span className="text-emerald-500 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Copy Narrative</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-sm">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-violet-600 to-indigo-500" />
                  <p className="text-sm sm:text-base text-[var(--text-primary)]/90 leading-relaxed italic">
                    "{profile.summaryNarrative}"
                  </p>
                  <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <Sparkles size={13} className="text-violet-500" />
                    <span>Synthesized by UpRole AI from verified career facts, evidence, and progression.</span>
                  </div>
                </div>
              </section>
            )}

            {/* Section 2: Demonstrated Capabilities Portfolio */}
            <section className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <Award size={20} className="text-violet-500" />
                    <h2 className="text-xl font-bold font-['Syne',sans-serif]">
                      Demonstrated Capabilities Portfolio
                    </h2>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Derived from your achievements with full evidence traceability. Confirm hypotheses to substantiate your positioning.
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 bg-[var(--bg-elevated)] p-1 rounded-xl border border-[var(--border)] shrink-0 self-start sm:self-center shadow-xs">
                  <button
                    onClick={() => setCapFilter("all")}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      capFilter === "all"
                        ? "bg-violet-600 text-white shadow-sm"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    All ({profile.capabilities.length})
                  </button>
                  <button
                    onClick={() => setCapFilter("unconfirmed")}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      capFilter === "unconfirmed"
                        ? "bg-amber-500 text-brand-navy font-bold shadow-sm"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    Awaiting Review ({unconfirmedCount})
                  </button>
                  <button
                    onClick={() => setCapFilter("confirmed")}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      capFilter === "confirmed"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    Confirmed ({confirmedCount})
                  </button>
                </div>
              </div>

              {filteredCapabilities.length === 0 ? (
                <div className="p-8 text-center rounded-3xl bg-[var(--card)] border border-[var(--border)] text-xs text-[var(--text-muted)] shadow-sm">
                  No capabilities match this filter.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredCapabilities.map((cap) => {
                    const isConfirmed = cap.status === "confirmed" || cap.status === "modified";
                    return (
                      <div
                        key={cap.id}
                        className={`p-6 rounded-3xl bg-[var(--card)] border transition-all flex flex-col justify-between space-y-4 hover:shadow-md ${
                          isConfirmed
                            ? "border-emerald-500/30 hover:border-emerald-500/50"
                            : "border-amber-500/30 hover:border-amber-500/50 bg-amber-500/[0.02]"
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Header badges */}
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span
                              className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5 shadow-xs ${
                                isConfirmed
                                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                  : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                              }`}
                            >
                              {isConfirmed ? (
                                <>
                                  <CheckCircle2 size={11} />
                                  <span>Confirmed Capability</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles size={11} />
                                  <span>Unconfirmed Hypothesis</span>
                                </>
                              )}
                            </span>

                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md font-mono ${
                                cap.confidence === "Strongly Supported"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                  : cap.confidence === "Supported"
                                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              }`}
                            >
                              {cap.confidence}
                            </span>
                          </div>

                          <div>
                            <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] font-['Syne',sans-serif]">
                              {cap.name}
                            </h3>
                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-1">
                              {cap.description}
                            </p>
                          </div>

                          {/* Supporting Evidence Traceability */}
                          <div className="space-y-2 pt-3 border-t border-[var(--border)]">
                            <div className="flex items-center justify-between text-[11px] font-bold text-[var(--text-muted)]">
                              <span className="flex items-center gap-1.5">
                                <ShieldCheck size={13} className="text-violet-500" />
                                <span>Supporting Career Evidence ({cap.supportingEvidence.length})</span>
                              </span>
                            </div>

                            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                              {cap.supportingEvidence.map((ev, idx) => (
                                <div
                                  key={idx}
                                  className="p-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[11px] space-y-1 shadow-xs"
                                >
                                  <div className="flex items-center justify-between text-[10px] font-bold text-[var(--text-secondary)]">
                                    <span className="truncate max-w-[200px]">
                                      {ev.sourceSubtitle} · {ev.sourceTitle}
                                    </span>
                                    <span className="capitalize text-[var(--text-muted)] text-[9px] px-1.5 py-0.5 rounded bg-[var(--card)] border border-[var(--border)] font-mono">
                                      {ev.sourceType}
                                    </span>
                                  </div>
                                  <p className="text-[var(--text-secondary)] line-clamp-2 italic">
                                    "{ev.factText}"
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Card Action footer */}
                        <div className="pt-2 flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenReview(cap)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                              isConfirmed
                                ? "bg-[var(--bg-elevated)] hover:bg-[var(--card)] text-[var(--text-secondary)] border border-[var(--border)] shadow-xs"
                                : "bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/25 active:scale-[0.98]"
                            }`}
                          >
                            <span>{isConfirmed ? "Edit Review" : "Review Hypothesis"}</span>
                            <ChevronRight size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Section 3: Impact Portfolio */}
            <section className="space-y-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <TrendingUp size={20} className="text-blue-500" />
                  <h2 className="text-xl font-bold font-['Syne',sans-serif]">
                    Recurring Impact Patterns
                  </h2>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">
                  Cross-cutting value themes identified across multiple projects and roles.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {profile.impactPatterns.map((pat) => (
                  <div
                    key={pat.id}
                    className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] space-y-4 flex flex-col justify-between hover:border-blue-500/40 hover:shadow-md transition-all duration-300"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 shadow-xs">
                          {pat.status === "confirmed" ? "Confirmed Pattern" : "Observed Pattern"}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-[var(--text-primary)] font-['Syne',sans-serif]">
                        {pat.name}
                      </h3>

                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        {pat.description}
                      </p>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-[var(--border)]">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">
                        Observed Evidence
                      </span>
                      <ul className="space-y-1.5">
                        {pat.observedEvidence.map((ev, idx) => (
                          <li
                            key={idx}
                            className="text-[11px] text-[var(--text-secondary)] flex items-start gap-2"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1" />
                            <span className="line-clamp-2">{ev}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Pattern Confirm / Modify Action Bar */}
                    <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
                      {editingPatternId === pat.id ? (
                        <div className="w-full space-y-2.5">
                          <input
                            type="text"
                            value={editPatternName}
                            onChange={(e) => setEditPatternName(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs font-bold rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Pattern title"
                          />
                          <textarea
                            value={editPatternDesc}
                            onChange={(e) => setEditPatternDesc(e.target.value)}
                            rows={2}
                            className="w-full px-3 py-1.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Pattern description"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingPatternId(null)}
                              className="px-3 py-1 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              disabled={savingPattern}
                              onClick={() => handleSavePatternEdit(pat.id)}
                              className="px-4 py-1.5 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-500 cursor-pointer disabled:opacity-50 shadow-xs"
                            >
                              {savingPattern ? "Saving..." : "Save Pattern"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <span className="text-[10px] text-[var(--text-muted)] font-mono">
                            {pat.status === "confirmed" ? "Verified Theme" : "Observed Theme"}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleStartEditPattern(pat)}
                              className="px-2.5 py-1 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors inline-flex items-center gap-1 cursor-pointer border border-[var(--border)] shadow-xs"
                              title="Modify pattern phrasing"
                            >
                              <Edit3 size={11} />
                              <span>Modify</span>
                            </button>
                            {pat.status !== "confirmed" ? (
                              <button
                                onClick={() => handleConfirmPattern(pat)}
                                className="px-3 py-1 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors inline-flex items-center gap-1 shadow-sm cursor-pointer"
                              >
                                <Check size={11} strokeWidth={3} />
                                <span>Confirm</span>
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                                <Check size={11} strokeWidth={3} />
                                <span>Confirmed</span>
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 4: Progression & Scope Evolution */}
            <section className="space-y-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <Layers size={20} className="text-cyan-500" />
                  <h2 className="text-xl font-bold font-['Syne',sans-serif]">
                    Progression & Scope Evolution
                  </h2>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">
                  Timeline of role progression, expanding ownership, and organizational influence.
                </p>
              </div>

              <div className="p-6 sm:p-8 rounded-3xl bg-[var(--card)] border border-[var(--border)] space-y-6 shadow-sm">
                {profile.progression.map((prog, idx) => (
                  <div
                    key={idx}
                    className="relative pl-6 sm:pl-8 border-l-2 border-violet-500/30 space-y-2.5 last:border-l-0 pb-6 last:pb-0"
                  >
                    {/* Timeline Node */}
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-violet-600 border-4 border-[var(--card)] shadow-xs" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h3 className="text-base font-bold text-[var(--text-primary)] font-['Syne',sans-serif]">
                        {prog.company}
                      </h3>
                      <span className="text-xs font-semibold text-[var(--text-muted)] font-mono">
                        {prog.tenureYears} {prog.tenureYears === 1 ? "year" : "years"} tenure
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {prog.roles.map((role, rIdx) => (
                        <span
                          key={rIdx}
                          className="text-xs font-semibold px-3 py-0.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] shadow-xs"
                        >
                          {role}
                        </span>
                      ))}
                    </div>

                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed pt-1">
                      {prog.scopeEvolution}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 5: Profile History & Review Audit */}
            <section className="space-y-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <Clock size={20} className="text-violet-500" />
                  <h2 className="text-xl font-bold font-['Syne',sans-serif]">
                    Profile History & Review Audit
                  </h2>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">
                  Traceable log of verified hypotheses, edited themes, and confirmed career interpretations.
                </p>
              </div>

              <div className="p-6 sm:p-8 rounded-3xl bg-[var(--card)] border border-[var(--border)] space-y-4 shadow-sm">
                {profile.reviewLog && profile.reviewLog.length > 0 ? (
                  <div className="divide-y divide-[var(--border)]">
                    {profile.reviewLog.map((log) => (
                      <div
                        key={log.id}
                        className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/20 font-mono">
                              {log.action}
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                              {log.itemName}
                            </span>
                          </div>
                          {log.note && (
                            <p className="text-xs text-[var(--text-secondary)] line-clamp-1 italic">
                              "{log.note}"
                            </p>
                          )}
                        </div>
                        <div className="text-xs font-semibold text-[var(--text-muted)] shrink-0 font-mono">
                          {log.date}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-2">
                    <CheckCircle2 size={26} className="mx-auto text-[var(--text-muted)]" />
                    <p className="text-xs text-[var(--text-secondary)]">
                      No review actions recorded yet. Confirm capability hypotheses or impact patterns above to build your audit history.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Review Modal */}
      {activeCapability && (
        <CapabilityReviewModal
          capability={activeCapability}
          isOpen={isReviewOpen}
          onClose={() => {
            setIsReviewOpen(false);
            setActiveCapability(null);
          }}
          onReviewed={handleReviewed}
        />
      )}
    </div>
  );
}
