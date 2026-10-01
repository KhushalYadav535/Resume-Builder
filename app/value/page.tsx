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
import ValueProfileCard from "@/components/value/ValueProfileCard";
import ValuePatternCard from "@/components/value/ValuePatternCard";
import EvidenceFoundationCard from "@/components/value/EvidenceFoundationCard";
import AreasToStrengthenCard from "@/components/value/AreasToStrengthenCard";
import ValueTraceabilityDrawer from "@/components/value/ValueTraceabilityDrawer";
import ValueFactsView from "@/components/value/ValueFactsView";
import ValueDimensionDetailView from "@/components/value/ValueDimensionDetailView";
import { useToast } from "@/components/ui/toast-1";
import { trackValueEvent } from "@/lib/valueAnalytics";
import { Sparkles, FileText, ArrowRight, RefreshCw, Upload, BookOpen, Award } from "lucide-react";

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
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 animate-pulse">
            <Sparkles size={32} />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[var(--text-primary)] font-['Syne',sans-serif]">
              We&apos;re understanding your career experience...
            </h2>
            <p className="text-xs text-[var(--text-muted)] max-w-md">
              Constructing the 5-layer traceability graph from verified facts and career events.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state if no resume is available (Spec Section 31: Constructive action guidance)
  if (!valueData && resumes.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] flex flex-col font-sans">
        <Navbar />
        <div className="max-w-2xl mx-auto my-auto p-8 rounded-3xl bg-[var(--card)] border border-[var(--border)] text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto">
            <Upload size={30} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-[var(--text-primary)] font-['Syne',sans-serif]">
              We don&apos;t have enough evidence to interpret this yet.
            </h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Upload your resume or record career events to derive verified capabilities, impact patterns, and progression.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/resume/builder?new=true"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-brand-navy bg-amber-500 hover:bg-amber-400 transition-all shadow-md"
            >
              <span>Upload or Build Resume</span>
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/career-journal"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] hover:border-amber-500/50"
            >
              <BookOpen size={14} />
              <span>Add a career event</span>
            </Link>
            <Link
              href="/career-journal?type=win"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] hover:border-amber-500/50"
            >
              <Award size={14} className="text-amber-500" />
              <span>Tell us about an achievement</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const primaryValuePattern = valueData?.valuePatterns?.[0] || null;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] flex flex-col font-sans transition-colors">
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
      <main className="max-w-7xl mx-auto px-6 sm:px-8 py-8 w-full flex-1">
        {/* TAB 1: OVERVIEW (The 4 Primary Dashboard Areas) */}
        {activeTab === "overview" && valueData && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* AREA 1: Career Value Profile (Spec Section 6) */}
            <ValueProfileCard
              capabilities={valueData.profile.capabilities}
              impact={valueData.profile.impact}
              experience={valueData.profile.experience}
              progression={valueData.profile.progression}
              onSelectInterpretation={handleOpenTraceability}
              onExploreDimension={(dim) => handleTabChange(dim)}
            />

            {/* AREA 2: Your Value Pattern (Spec Section 7) */}
            <ValuePatternCard
              pattern={primaryValuePattern}
              onWhyWeSayThis={handleOpenTraceability}
            />

            {/* AREA 3: Evidence Foundation (Spec Section 8) */}
            <EvidenceFoundationCard
              evidenceSummary={valueData.evidenceSummary}
              onExploreFacts={() => handleTabChange("facts")}
            />

            {/* AREA 4: Areas to Strengthen (Spec Section 9) */}
            <AreasToStrengthenCard areas={valueData.strengtheningAreas} />
          </div>
        )}

        {/* TAB 2, 3, 4, 5: DIMENSION DEEP DIVES (Capabilities, Impact, Experience, Progression) */}
        {(activeTab === "capabilities" ||
          activeTab === "impact" ||
          activeTab === "experience" ||
          activeTab === "progression") &&
          valueData && (
            <div className="animate-in fade-in duration-300">
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
          <div className="animate-in fade-in duration-300">
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
  );
}

export default function CareerValueDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] flex flex-col font-sans">
          <Navbar />
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 animate-pulse">
              <Sparkles size={32} />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[var(--text-primary)] font-['Syne',sans-serif]">
                Loading Career Value...
              </h2>
            </div>
          </div>
        </div>
      }
    >
      <CareerValueDashboardContent />
    </Suspense>
  );
}
