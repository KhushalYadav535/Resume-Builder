"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { Resume } from "@/types";
import {
  CareerValueResponse,
  CareerInterpretation,
  CareerFact,
  ValueNavigationTab,
} from "@/types/value";
import ValueDashboardHeader from "@/components/value/ValueDashboardHeader";
import ValueNavigationTabs from "@/components/value/ValueNavigationTabs";
import ValueJourneySteps from "@/components/value/ValueJourneySteps";
import ValueProfileCard from "@/components/value/ValueProfileCard";
import ValuePatternCard from "@/components/value/ValuePatternCard";
import EvidenceFoundationCard from "@/components/value/EvidenceFoundationCard";
import AreasToStrengthenCard from "@/components/value/AreasToStrengthenCard";
import ValueTraceabilityDrawer from "@/components/value/ValueTraceabilityDrawer";
import ValueFactsView from "@/components/value/ValueFactsView";
import ValueDimensionDetailView from "@/components/value/ValueDimensionDetailView";
import { useToast } from "@/components/ui/toast-1";
import { trackValueEvent } from "@/lib/valueAnalytics";
import { Sparkles, ArrowRight, Upload, BookOpen, Award, Layers, Database, FileCheck2 } from "lucide-react";

/** Skeleton that mirrors the dashboard layout — reduces perceived wait + layout shift. */
function ValueLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col font-sans" aria-label="Loading career value" role="status">
      <Navbar />
      {/* hero skeleton */}
      <div className="border-b border-[var(--border)] bg-[var(--card)] px-6 sm:px-8 py-10">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="value-skeleton h-6 w-64 rounded-full" />
          <div className="value-skeleton h-12 w-2/3 max-w-xl rounded-2xl" />
          <div className="value-skeleton h-5 w-1/2 max-w-md rounded-xl" />
          <div className="flex gap-3 pt-2">
            <div className="value-skeleton h-11 w-40 rounded-2xl" />
            <div className="value-skeleton h-11 w-36 rounded-2xl" />
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8 w-full flex-1 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="value-skeleton h-72 rounded-[1.4rem]" style={{ animationDelay: `${i * 0.08}s` }} />
          ))}
        </div>
        <div className="value-skeleton h-64 rounded-[1.75rem]" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="value-skeleton h-44 rounded-[1.4rem]" />
          ))}
        </div>
        <p className="sr-only">We&apos;re understanding your career experience…</p>
      </div>
    </div>
  );
}

function CareerValueDashboardContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  // Active navigation tab (Overview, Capabilities, Impact, Experience, Progression, Facts)
  const initialTab = (searchParams.get("tab") as ValueNavigationTab) || "overview";
  const [activeTab, setActiveTab] = useState<ValueNavigationTab>(initialTab);

  // Synchronize tab changes to URL
  const handleTabChange = useCallback((tab: ValueNavigationTab) => {
    setActiveTab(tab);
    trackValueEvent("value_dimension_opened", { dimension: tab });
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (tab === "overview") {
        url.searchParams.delete("tab");
      } else {
        url.searchParams.set("tab", tab);
      }
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  // Value Profile Response Data
  const [valueData, setValueData] = useState<CareerValueResponse | null>(null);

  // All extracted career facts
  const [facts, setFacts] = useState<CareerFact[]>([]);
  const [factsLoading, setFactsLoading] = useState(false);

  // Traceability Drawer State
  const [selectedInterpretation, setSelectedInterpretation] =
    useState<CareerInterpretation | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  // Fetch available resumes
  useEffect(() => {
    if (!user) return;
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
      .catch((err) => console.error("Error fetching resumes:", err));
  }, [user]);

  // Load Career Value Profile and Facts
  const loadValueProfile = useCallback(
    async (resumeId?: string, silent = false) => {
      if (!silent) setLoading(true);
      try {
        const url = resumeId ? `/api/value?resumeId=${resumeId}` : "/api/value";
        const res = await fetch(url);
        const data = await res.json();
        if (data.profile) {
          setValueData(data);
          trackValueEvent("value_dashboard_viewed", { resumeId });
          if (data.valuePatterns?.[0]) {
            trackValueEvent("value_pattern_viewed", {
              patternId: data.valuePatterns[0].id,
            });
          }
        }
      } catch (err) {
        console.error("Error loading career value:", err);
        showToast("Could not load career value profile.", "error");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [showToast]
  );

  const loadFacts = useCallback(
    async (resumeId?: string) => {
      setFactsLoading(true);
      try {
        const url = resumeId ? `/api/value/facts?resumeId=${resumeId}` : "/api/value/facts";
        const res = await fetch(url);
        const data = await res.json();
        if (data.facts && Array.isArray(data.facts)) {
          setFacts(data.facts);
        }
      } catch (err) {
        console.error("Error loading facts:", err);
      } finally {
        setFactsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (user && selectedResumeId) {
      loadValueProfile(selectedResumeId);
      loadFacts(selectedResumeId);
    } else if (user) {
      loadValueProfile();
      loadFacts();
    }
  }, [user, selectedResumeId, loadValueProfile, loadFacts]);

  // Recalculate Career Value (Spec Section 26.8)
  const handleRecalculate = async () => {
    setRecalculating(true);
    trackValueEvent("value_derivation_started", { resumeId: selectedResumeId });
    try {
      const res = await fetch("/api/value/recalculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: selectedResumeId }),
      });
      const data = await res.json();
      if (data.profile) {
        setValueData(data);
        trackValueEvent("value_derivation_completed", { resumeId: selectedResumeId });
        showToast("Career Value recalculated from confirmed facts!", "success");
      }
      await loadFacts(selectedResumeId);
    } catch (err) {
      console.error("Recalculate error:", err);
      showToast("Failed to recalculate Career Value.", "error");
    } finally {
      setRecalculating(false);
    }
  };

  // Interpretation Drawer actions
  const handleOpenTraceability = (interp: CareerInterpretation) => {
    setSelectedInterpretation(interp);
    setIsDrawerOpen(true);
    trackValueEvent("value_explanation_opened", { id: interp.id, type: interp.type });
  };

  const handleAcceptInterpretation = async (interp: CareerInterpretation) => {
    try {
      const res = await fetch(`/api/value/interpretations/${interp.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "accept",
          title: interp.title,
          description: interp.description,
          type: interp.type,
        }),
      });
      if (res.ok) {
        trackValueEvent("value_interpretation_accepted", { id: interp.id });
        showToast(`Interpretation "${interp.title}" accepted as confirmed Career Value!`, "success");
        await loadValueProfile(selectedResumeId, true);
      }
    } catch (err) {
      console.error(err);
      showToast("Error accepting interpretation.", "error");
    }
  };

  const handleEditInterpretation = async (
    interp: CareerInterpretation,
    newTitle: string,
    newDesc: string,
    userNote?: string
  ) => {
    try {
      const res = await fetch(`/api/value/interpretations/${interp.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "edit",
          title: newTitle,
          description: newDesc,
          userNote,
          type: interp.type,
        }),
      });
      if (res.ok) {
        trackValueEvent("value_interpretation_edited", { id: interp.id });
        showToast("Interpretation successfully updated!", "success");
        await loadValueProfile(selectedResumeId, true);
      }
    } catch (err) {
      console.error(err);
      showToast("Error updating interpretation.", "error");
    }
  };

  const handleRejectInterpretation = async (
    interp: CareerInterpretation,
    reason?: string
  ) => {
    try {
      const res = await fetch(`/api/value/interpretations/${interp.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          title: interp.title,
          description: interp.description,
          rejectionReason: reason,
          type: interp.type,
        }),
      });
      if (res.ok) {
        trackValueEvent("value_interpretation_rejected", { id: interp.id });
        showToast(`Interpretation rejected. Underlying facts remain intact.`, "info");
        await loadValueProfile(selectedResumeId, true);
      }
    } catch (err) {
      console.error(err);
      showToast("Error rejecting interpretation.", "error");
    }
  };

  // Fact review actions
  const handleConfirmFact = async (fact: CareerFact) => {
    try {
      const res = await fetch(`/api/value/facts/${fact.id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          statement: fact.statement,
          category: fact.category,
          sourceType: fact.sourceType,
        }),
      });
      if (res.ok) {
        trackValueEvent("value_fact_confirmed", { factId: fact.id });
        showToast("Fact confirmed!", "success");
        await loadFacts(selectedResumeId);
        await loadValueProfile(selectedResumeId, true);
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to confirm fact.", "error");
    }
  };

  const handleEditFact = async (fact: CareerFact, newStatement: string) => {
    try {
      const res = await fetch(`/api/value/facts/${fact.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          statement: newStatement,
          category: fact.category,
          sourceType: fact.sourceType,
        }),
      });
      if (res.ok) {
        trackValueEvent("value_fact_edited", { factId: fact.id });
        showToast("Fact edited and saved!", "success");
        await loadFacts(selectedResumeId);
        await loadValueProfile(selectedResumeId, true);
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to edit fact.", "error");
    }
  };

  const handleRejectFact = async (fact: CareerFact, reason?: string) => {
    try {
      const res = await fetch(`/api/value/facts/${fact.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          statement: fact.statement,
          rejectionReason: reason,
          category: fact.category,
          sourceType: fact.sourceType,
        }),
      });
      if (res.ok) {
        trackValueEvent("value_fact_rejected", { factId: fact.id });
        showToast("Fact rejected. It will no longer support Career Value interpretations.", "info");
        await loadFacts(selectedResumeId);
        await loadValueProfile(selectedResumeId, true);
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to reject fact.", "error");
    }
  };

  const handleBatchConfirm = async (visibleFacts: CareerFact[]) => {
    try {
      const res = await fetch("/api/value/facts/batch-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facts: visibleFacts }),
      });
      if (res.ok) {
        showToast(`Confirmed ${visibleFacts.length} facts!`, "success");
        await loadFacts(selectedResumeId);
        await loadValueProfile(selectedResumeId, true);
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to batch confirm facts.", "error");
    }
  };

  const unconfirmedFactsCount = useMemo(
    () => facts.filter((f) => f.status === "EXTRACTED").length,
    [facts]
  );
  const confirmedFactsCount = useMemo(
    () => facts.filter((f) => f.status === "CONFIRMED" || f.status === "EDITED").length,
    [facts]
  );

  // Loading state (Spec Section 30)
  if (loading) {
    return <ValueLoadingSkeleton />;
  }

  // Empty state if no resume is available (Spec Section 31: Constructive action guidance)
  if (!valueData && resumes.length === 0) {
    const steps = [
      { icon: Upload, title: "Add your source", text: "Upload or build your resume — it becomes the evidence source." },
      { icon: FileCheck2, title: "Confirm facts", text: "Review extracted facts in one tap. Nothing becomes truth without you." },
      { icon: Layers, title: "See your value", text: "Capabilities, impact and patterns appear — every claim traceable." },
    ];
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] flex flex-col font-sans value-scope">
        <Navbar />
        <div className="max-w-2xl w-full mx-auto my-auto p-6 sm:p-8">
          <div className="value-pop rounded-[1.75rem] bg-[var(--card)] border border-[var(--border)] shadow-[0_24px_70px_rgba(16,27,59,0.12)] overflow-hidden text-center">
            <div className="h-[3px] w-full bg-gradient-to-r from-amber-500 via-amber-400/70 to-violet-500/50" aria-hidden="true" />
            <div className="p-8 sm:p-10 space-y-6">
              <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-brand-navy mx-auto shadow-[0_12px_32px_rgba(245,158,11,0.45)]">
                <Sparkles size={30} strokeWidth={2.2} />
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400">Get started in 3 steps</p>
                <h2 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)] font-['Syne',sans-serif]">
                  We don&apos;t have enough evidence to interpret this yet.
                </h2>
              </div>
              {/* How it works */}
              <ol className="grid sm:grid-cols-3 gap-3 text-left">
                {steps.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <li key={s.title} className="relative rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)]/60 p-4 space-y-2">
                      <span className="absolute top-3 right-3 text-[11px] font-black text-amber-500/70 tabular-nums">0{i + 1}</span>
                      <span className="w-9 h-9 rounded-xl bg-amber-500/12 border border-amber-500/25 flex items-center justify-center text-amber-500">
                        <Icon size={17} />
                      </span>
                      <p className="text-[13px] font-extrabold text-[var(--text-primary)]">{s.title}</p>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">{s.text}</p>
                    </li>
                  );
                })}
              </ol>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                <Link
                  href="/resume/builder?new=true"
                  className="group relative overflow-hidden inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black text-brand-navy bg-gradient-to-r from-amber-500 to-amber-400 shadow-[0_10px_30px_rgba(245,158,11,0.4)] hover:-translate-y-0.5 transition-all"
                >
                  <span>Upload or Build Resume</span>
                  <ArrowRight size={14} strokeWidth={2.6} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/career-journal"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] hover:border-amber-500/50 transition-all"
                >
                  <BookOpen size={14} />
                  <span>Add a career event</span>
                </Link>
                <Link
                  href="/career-journal?type=win"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] hover:border-amber-500/50 transition-all"
                >
                  <Award size={14} className="text-amber-500" />
                  <span>Tell us about an achievement</span>
                </Link>
              </div>
              <p className="flex items-center justify-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                <Database size={12} className="text-emerald-500" /> No scores · No hallucinations · You approve every fact
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const primaryValuePattern = valueData?.valuePatterns?.[0] || null;

  return (
    <div className="value-scope min-h-screen bg-[var(--bg)] text-[var(--text-primary)] flex flex-col font-sans transition-colors relative">
      {/* Premium page ambience — same theme, subtle depth */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-180px] left-1/2 -translate-x-1/2 w-[900px] h-[420px] bg-amber-500/[0.06] rounded-full blur-[120px]" />
        <div className="absolute top-[40%] right-[-200px] w-[480px] h-[480px] bg-violet-500/[0.05] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-200px] left-[-160px] w-[480px] h-[480px] bg-sky-500/[0.05] rounded-full blur-[120px]" />
      </div>
      <div className="relative z-10 flex flex-col min-h-screen">
      <Navbar />

      {/* Main Header (Spec Section 4.1) */}
      <ValueDashboardHeader
        resumes={resumes}
        selectedResumeId={selectedResumeId}
        onSelectResume={(id) => setSelectedResumeId(id)}
        onExploreValue={() =>
          handleTabChange(
            activeTab === "overview"
              ? "capabilities"
              : activeTab === "capabilities"
              ? "impact"
              : "overview"
          )
        }
        onReviewFacts={() => handleTabChange("facts")}
        onRecalculate={handleRecalculate}
        recalculating={recalculating}
        totalFactsCount={facts.length}
        confirmedFactsCount={confirmedFactsCount}
        careerEventsCount={valueData?.evidenceSummary?.careerEvents || 0}
        evidenceItemsCount={valueData?.evidenceSummary?.evidenceItems || 0}
      />

      {/* Navigation Tabs (Spec Section 24) */}
      <ValueNavigationTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        factsCount={facts.length}
        unconfirmedFactsCount={unconfirmedFactsCount}
      />

      {/* Tab Contents */}
      <main aria-live="polite" className="max-w-7xl mx-auto px-6 sm:px-8 py-8 sm:py-10 w-full flex-1">
        {/* TAB 1: OVERVIEW (The 4 Primary Dashboard Areas) */}
        {activeTab === "overview" && valueData && (
          <div key="overview" className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
            {/* Premium section rhythm */}
            <div className="value-rise flex items-center gap-3 px-1">
              <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--text-muted)]">Career Value Dashboard</span>
              <span className="flex-1 h-px bg-gradient-to-r from-[var(--border-strong)] via-amber-500/30 to-transparent" />
              <span className="hidden sm:inline text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/25 rounded-full px-2.5 py-0.5">Multidimensional · No single score</span>
            </div>

            {/* Journey orientation */}
            <div className="value-rise value-delay-1">
              <ValueJourneySteps />
            </div>

            {/* AREA 1: Career Value Profile (Spec Section 6) */}
            <div className="value-rise value-delay-2">
              <ValueProfileCard
                capabilities={valueData.profile.capabilities}
                impact={valueData.profile.impact}
                experience={valueData.profile.experience}
                progression={valueData.profile.progression}
                onSelectInterpretation={handleOpenTraceability}
                onExploreDimension={(dim) => handleTabChange(dim)}
              />
            </div>

            {/* AREA 2: Your Value Pattern (Spec Section 7) */}
            <div className="value-rise value-delay-3">
              <ValuePatternCard
                pattern={primaryValuePattern}
                onWhyWeSayThis={handleOpenTraceability}
              />
            </div>

            {/* AREA 3: Evidence Foundation (Spec Section 8) */}
            <div className="value-rise value-delay-4">
              <EvidenceFoundationCard
                evidenceSummary={valueData.evidenceSummary}
                onExploreFacts={() => handleTabChange("facts")}
              />
            </div>

            {/* AREA 4: Areas to Strengthen (Spec Section 9) */}
            <div className="value-rise value-delay-5">
              <AreasToStrengthenCard areas={valueData.strengtheningAreas} />
            </div>
          </div>
        )}

        {/* TAB 2, 3, 4, 5: DIMENSION DEEP DIVES (Capabilities, Impact, Experience, Progression) */}
        {(activeTab === "capabilities" ||
          activeTab === "impact" ||
          activeTab === "experience" ||
          activeTab === "progression") &&
          valueData && (
            <div key={activeTab} className="value-rise">
              <ValueDimensionDetailView
                dimension={activeTab}
                capabilities={valueData.profile.capabilities}
                impact={valueData.profile.impact}
                experience={valueData.profile.experience}
                progression={valueData.profile.progression}
                onSelectInterpretation={handleOpenTraceability}
                onExploreFacts={() => handleTabChange("facts")}
              />
            </div>
          )}

        {activeTab === "facts" && (
          <div key="facts" className="value-rise">
            <ValueFactsView
              facts={facts}
              onConfirmFact={handleConfirmFact}
              onEditFact={handleEditFact}
              onRejectFact={handleRejectFact}
              onBatchConfirm={handleBatchConfirm}
              loading={factsLoading}
              allInterpretations={[
                ...(valueData?.profile.capabilities ?? []),
                ...(valueData?.profile.impact ?? []),
                ...(valueData?.valuePatterns ?? []),
              ]}
            />
          </div>
        )}
      </main>

      {/* 5-Level Traceability Drawer (Spec Section 25) */}
      <ValueTraceabilityDrawer
        interpretation={selectedInterpretation}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onAccept={handleAcceptInterpretation}
        onEdit={handleEditInterpretation}
        onReject={handleRejectInterpretation}
        onViewAllEvidence={() => handleTabChange("facts")}
      />
      </div>
    </div>
  );
}

export default function CareerValueDashboardPage() {
  return (
    <Suspense fallback={<ValueLoadingSkeleton />}>
      <CareerValueDashboardContent />
    </Suspense>
  );
}
