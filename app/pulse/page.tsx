"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import PulseHeader from "@/components/pulse/PulseHeader";
import CareerSnapshotCard from "@/components/pulse/CareerSnapshotCard";
import CareerValueCard from "@/components/pulse/CareerValueCard";
import RecentProgressCard from "@/components/pulse/RecentProgressCard";
import RecentCareerEventCard from "@/components/pulse/RecentCareerEventCard";
import CareerDirectionCard from "@/components/pulse/CareerDirectionCard";
import CareerGoalCard from "@/components/pulse/CareerGoalCard";
import NextBestActionCard from "@/components/pulse/NextBestActionCard";
import CareerMomentumCard from "@/components/pulse/CareerMomentumCard";
import ExploreCareerSection from "@/components/pulse/ExploreCareerSection";
import AiTraceabilityModal from "@/components/pulse/AiTraceabilityModal";
import CaptureEventModal from "@/components/pulse/CaptureEventModal";
import PulseSkeleton from "@/components/pulse/PulseSkeleton";
import {
  PulseDashboardData,
  ScenarioPreset,
  AiTraceabilityContext,
  CareerEventData,
  CareerGoalData,
} from "@/components/pulse/types";
import {
  trackPulseViewed,
  trackAiExplanationOpened,
  trackAiInterpretationAccepted,
  trackAiInterpretationRejected,
  trackAiInterpretationEdited,
  trackNextBestActionCompleted,
  trackNextBestActionDismissed,
  trackCareerEventCreatedFromPulse,
  trackCareerGoalCreatedFromPulse,
} from "@/lib/analytics";
import PulseToast, { ToastVariant } from "@/components/pulse/PulseToast";
import MobileActionBar from "@/components/pulse/MobileActionBar";

// Canonical Established Leader Data (Matching Spec Sections 1–13)
const CANONICAL_ESTABLISHED_DATA: PulseDashboardData = {
  snapshot: {
    headline: "Product & Technology Leader",
    currentRole: "Head of Product",
    organization: "Enterprise Cloud Platforms",
    experience: 14,
    scope: "Leading 3 product squads (24 engineers & designers) across core B2B SaaS",
    capabilities: [
      "Product Strategy",
      "Digital Transformation",
      "Team Leadership",
      "B2B SaaS Architecture",
      "P&L Governance",
    ],
    progressionSignal: "Fast-track trajectory · 3 strategic promotions across 6 years",
    evidenceCount: 18,
  },
  careerValue: {
    capabilities: "Strong",
    experience: "Strong",
    impact: "Developing",
    progression: "Strong",
    evidence: "Needs strengthening",
    traceableCount: 18,
    pendingReviewCount: 2,
  },
  recentProgress: [
    {
      id: "rp-1",
      title: "Expanded leadership scope",
      description: "Team responsibility increased from 8 → 14 engineers and product designers across APAC.",
      evidenceLink: "/career-journal#events",
      isPrimary: true,
      category: "Leadership Scope",
    },
    {
      id: "rp-2",
      title: "New capability substantiated: Cloud Infrastructure ROI",
      description: "Quantified 28% server efficiency reduction linked to microservices refactoring.",
      evidenceLink: "/value/profile",
      isPrimary: false,
      category: "Technical Impact",
    },
    {
      id: "rp-3",
      title: "Executive alignment milestone completed",
      description: "Presented Q3 Multi-Year Product Roadmap to C-Suite stakeholders.",
      evidenceLink: "/career-journal",
      isPrimary: false,
      category: "Milestone",
    },
  ],
  recentEvent: {
    id: "re-1",
    title: "Completed ERP Cloud Transformation Project",
    date: "August 2026 · 6 months duration",
    context: "Migrated 2.4M customer records with zero downtime across 4 distributed business units.",
    impact: "Cut legacy infrastructure overhead by ₹48L/year and shortened batch reconciliation from 4hrs to 12mins.",
    capability: "Enterprise Architecture & Scaled Systems",
  },
  careerDirection: {
    title: "Senior Product Leadership / VP of Product",
    confidence: "High Alignment",
    signals: [
      "Multi-Squad Product Strategy",
      "Executive Stakeholder Governance",
      "Enterprise SaaS Commercialization",
      "P&L & Org Scaling",
    ],
    evidence: [
      "7+ years leading end-to-end B2B software products",
      "3 cross-functional engineering teams led concurrently",
      "Two zero-to-one enterprise platform rollouts delivered",
      "Documented expansion in organizational budget and team scope",
    ],
  },
  careerGoal: {
    title: "Become Product Director",
    timeframe: "Next 6–12 months",
    status: "Building readiness",
    progressPercent: 65,
    currentMilestoneIndex: 2,
    milestones: [
      "Substantiate B2B Domain Expertise",
      "Quantify Enterprise Revenue Impact",
      "Strengthen Executive Leadership Evidence",
      "Target Committee & Board Readiness",
    ],
    nextMilestone: "Strengthen executive leadership & business impact evidence",
  },
  nextBestAction: {
    title: "Strengthen your leadership evidence",
    reason: "You have strong team-management experience, but only one documented entry demonstrating direct business/P&L outcomes.",
    goalRelevance: "Your current target is Product Director, where executive hiring committees specifically evaluate evidence of organizational ROI.",
    actionType: "evidence",
    cta: "Add Leadership Evidence",
    ctaLink: "/value",
  },
  momentum: {
    state: "Building",
    trajectory: "up",
    summary: "3 meaningful career developments recorded in the last 60 days",
    signals: [
      "Leadership scope expansion logged",
      "Cloud ROI achievement verified",
      "Executive strategy deck delivered",
    ],
  },
  careerExploration: [
    {
      id: "exp-1",
      role: "Product Director",
      alignment: "Strong alignment",
      alignmentScore: 92,
      rationale: "Matches your scale of cross-functional team leadership, multi-product roadmap delivery, and commercial SaaS accountability.",
      relevantCapabilities: ["Product Strategy", "Team Leadership", "B2B SaaS"],
    },
    {
      id: "exp-2",
      role: "Digital Transformation Lead",
      alignment: "Strong alignment",
      alignmentScore: 86,
      rationale: "Directly leverages your ERP cloud migration, legacy system modernization, and enterprise stakeholder alignment experience.",
      relevantCapabilities: ["Digital Transformation", "Enterprise Architecture", "Change Governance"],
    },
    {
      id: "exp-3",
      role: "AI Product Strategy Principal",
      alignment: "Emerging opportunity",
      alignmentScore: 78,
      rationale: "Fast-growing high-leverage path building upon your data architecture, automation workflows, and modern product discovery.",
      relevantCapabilities: ["AI Workflows", "Product Discovery", "Scaled Systems"],
    },
  ],
};

export default function PulseDashboardPage() {
  const { user } = useAuth();
  const [scenario, setScenario] = useState<ScenarioPreset>("full");
  const [liveData, setLiveData] = useState<PulseDashboardData | null>(null);
  // initialLoading: true only on first mount (Section 21 — skeleton until data ready)
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; variant: ToastVariant } | null>(null);
  const showToast = useCallback((message: string, variant: ToastVariant = "success") => {
    setToast({ message, variant });
  }, []);
  const dismissToast = useCallback(() => setToast(null), []);

  // Modals state
  const [explainContext, setExplainContext] = useState<AiTraceabilityContext | null>(null);
  const [captureEventOpen, setCaptureEventOpen] = useState(false);

  // Custom live user events added during session
  const [sessionEvents, setSessionEvents] = useState<CareerEventData[]>([]);
  // Custom goal selected dynamically
  const [customGoal, setCustomGoal] = useState<CareerGoalData | null>(null);

  // Fetch Live Data from /api/pulse (Section 20)
  const fetchPulseData = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/pulse");
      if (res.ok) {
        const data = await res.json();
        setLiveData(data);
      }
    } catch (err) {
      console.error("Failed to load pulse data:", err);
    } finally {
      setIsRefreshing(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchPulseData();
  }, [user]);

  // Fire pulse_viewed analytics once data loads (Section 25)
  useEffect(() => {
    if (!initialLoading) {
      trackPulseViewed(scenario);
    }
  }, [initialLoading]);

  // Compute active dashboard view data based on selected scenario preset (Section 14)
  const activeData: PulseDashboardData = useMemo(() => {
    const base = scenario === "live" && liveData ? liveData : CANONICAL_ESTABLISHED_DATA;

    // Apply any newly captured session event
    const effectiveRecentEvent = sessionEvents.length > 0 ? sessionEvents[0] : base.recentEvent;
    const effectiveGoal = customGoal || base.careerGoal;

    switch (scenario) {
      case "scenarioA_new":
        return {
          ...base,
          snapshot: {
            ...base.snapshot,
            headline: "Let's understand where you stand",
            currentRole: "Senior Engineer / Tech Lead",
            organization: "Emerging Enterprise",
            experience: 5,
            scope: "Initial profile established from uploaded resume. Core areas awaiting discovery.",
            capabilities: ["Software Engineering", "Full-Stack Web", "API Design"],
            progressionSignal: "Foundation set · Initial career record ready for enrichment",
            evidenceCount: 4,
          },
          careerValue: {
            capabilities: "Developing",
            experience: "Established",
            impact: "Needs strengthening",
            progression: "Developing",
            evidence: "Needs strengthening",
            traceableCount: 4,
            pendingReviewCount: 1,
          },
          recentProgress: [
            {
              id: "new-1",
              title: "Career Memory Initiated",
              description: "Extracted base employment and skills profile from resume upload.",
              isPrimary: true,
              category: "Onboarding",
            },
          ],
          careerGoal: null,
          recentEvent: null,
          nextBestAction: {
            title: "Discover your hidden impact",
            reason: "Your resume lists technical responsibilities, but lacks quantified business outcomes.",
            goalRelevance: "Adding 2–3 quantified wins establishes your career value baseline.",
            actionType: "impact",
            cta: "Discover Impact Now",
            ctaLink: "/value",
          },
        };

      case "scenarioB_partial":
        return {
          ...base,
          careerValue: {
            capabilities: "Strong",
            experience: "Established",
            impact: "Developing",
            progression: "Developing",
            evidence: "Needs strengthening",
            traceableCount: 8,
            pendingReviewCount: 3,
          },
          nextBestAction: {
            title: "Substantiate your progression signals",
            reason: "Your career picture is taking shape: capabilities are strong, but leadership transitions need documented evidence.",
            goalRelevance: "Targeting Director level requires clear signals of team and budget growth.",
            actionType: "evidence",
            cta: "Strengthen Career Value",
            ctaLink: "/value/profile",
          },
        };

      case "scenarioC_no_goal":
        return {
          ...base,
          careerGoal: customGoal ? customGoal : null,
          nextBestAction: customGoal
            ? base.nextBestAction
            : {
                title: "Define your near-term career target",
                reason: "You have a solid career foundation with 14 years of proven capability.",
                goalRelevance: "Setting a specific target activates calibrated opportunity matching and readiness tracking.",
                actionType: "goal",
                cta: "Set Career Goal",
                ctaLink: "/momentum#priorities",
              },
        };

      case "scenarioD_no_event":
        return {
          ...base,
          recentEvent: null,
          nextBestAction: {
            title: "Capture a recent achievement",
            reason: "No meaningful career milestone logged in the last 90 days.",
            goalRelevance: "Logging wins while fresh preserves critical evidence for review cycles and promotions.",
            actionType: "evidence",
            cta: "Capture Win Now",
            ctaLink: "/career-journal",
          },
        };

      case "live":
        return liveData
          ? { ...liveData, recentEvent: effectiveRecentEvent, careerGoal: effectiveGoal }
          : CANONICAL_ESTABLISHED_DATA;

      case "full":
      default:
        return {
          ...CANONICAL_ESTABLISHED_DATA,
          recentEvent: effectiveRecentEvent,
          careerGoal: effectiveGoal,
        };
    }
  }, [scenario, liveData, sessionEvents, customGoal]);

  const handleScenarioChange = (preset: ScenarioPreset) => {
    setScenario(preset);
    if (preset === "scenarioC_no_goal") {
      setCustomGoal(null);
    }
    const hints: Record<ScenarioPreset, string> = {
      full: "Loaded canonical Established Leader profile",
      live: "Loaded live account data from database",
      scenarioA_new: "Scenario A: New User (orientation mode)",
      scenarioB_partial: "Scenario B: Partial evidence breakdown",
      scenarioC_no_goal: "Scenario C: Interactive goal selection",
      scenarioD_no_event: "Scenario D: Continuity & capture prompt",
    };
    showToast(hints[preset] || "Scenario updated", "info");
  };

  const handleSaveEvent = (newEvent: CareerEventData) => {
    setSessionEvents([newEvent, ...sessionEvents]);
    // Section 25: fire analytics
    trackCareerEventCreatedFromPulse(newEvent.capability);
    showToast(`Career event "${newEvent.title}" added to your record ✓`, "success");

    // Persist to database if authenticated
    if (user) {
      fetch("/api/journal/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `${newEvent.title}. ${newEvent.context} Impact: ${newEvent.impact}`,
          entry_type: "milestone",
          tags: [newEvent.capability],
          date: new Date().toISOString(),
          extracted_metrics: { impact: newEvent.impact },
        }),
      }).catch((e) => console.error("Could not persist event to DB:", e));
    }
  };

  const handleSelectGoalType = (goalTitle: string) => {
    const newGoal: CareerGoalData = {
      title: `Target: ${goalTitle}`,
      timeframe: "Next 6–12 months",
      status: "Active Focus",
      progressPercent: 25,
      currentMilestoneIndex: 1,
      milestones: [
        "Define Target Role Scope",
        "Audit Capability Gaps",
        "Assemble Strategic Evidence",
        "Market Outreach & Alignment",
      ],
      nextMilestone: "Audit capability gaps against market benchmarks",
    };
    setCustomGoal(newGoal);
    // Section 25: fire analytics
    trackCareerGoalCreatedFromPulse(goalTitle);
    showToast(`Goal set: ${goalTitle}. Recommendations calibrated!`, "goal");
  };

  // Analytics wrapper for AI explain modal (Section 25)
  const handleOpenExplain = (ctx: AiTraceabilityContext) => {
    setExplainContext(ctx);
    trackAiExplanationOpened(ctx.componentTitle);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-amber-500 selection:text-brand-navy transition-colors duration-200">
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10 pb-24 lg:pb-10">
        {/* Pulse Shell Header */}
        <PulseHeader
          currentScenario={scenario}
          onScenarioChange={handleScenarioChange}
          onOpenCaptureEvent={() => setCaptureEventOpen(true)}
          isRefreshing={isRefreshing}
          onRefresh={fetchPulseData}
        />

        {/* Section 21: Show skeleton while initial data loads */}
        {initialLoading ? (
          <PulseSkeleton />
        ) : (
          /*
           * 4-Zone Layout — Section 4 (desktop) & Section 22 (responsive)
           *
           * Mobile priority order per spec §22:
           *   Snapshot → Value → Goal → Next Best Action →
           *   Progress → Direction → Event → Explore → Momentum
           *
           * Achieved via CSS `order-` classes:
           *   - Zone 1 cards: order-1, order-2 (same on all viewports)
           *   - Zone 3 Goal + Zone 4 NBA bubble up to order-3,4 on mobile
           *   - Zone 2 Progress/Event drop to order-5,6 on mobile
           *   - Zone 3 Direction drops to order-7 on mobile
           *   - Zone 4 Explore/Momentum drop to order-8,9 on mobile
           */
          <div className="flex flex-col gap-8 sm:gap-10">

            {/* ── ZONE 1: WHERE I AM (order 1-2 on all viewports) ───────── */}
            <section id="zone-1" className="space-y-3 order-1 scroll-mt-24 sm:scroll-mt-28">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400 font-['Syne',sans-serif]">
                  1. Where I Am
                </h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-7 items-stretch">
                <CareerSnapshotCard
                  data={activeData.snapshot}
                  onOpenExplain={handleOpenExplain}
                />
                <CareerValueCard
                  data={activeData.careerValue}
                  onOpenExplain={handleOpenExplain}
                />
              </div>
            </section>

            {/*
             * ── ZONE 3 (Goal only) — Mobile: order-2 / Desktop: hidden here ──
             * On mobile, Career Goal bubbles up to position 3 per spec §22
             */}
            <section className="space-y-3 order-2 lg:hidden scroll-mt-24 sm:scroll-mt-28">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 font-['Syne',sans-serif]">
                  3. Where I&apos;m Going — Goal
                </h2>
              </div>
              <CareerGoalCard
                goal={activeData.careerGoal}
                onSelectGoalType={handleSelectGoalType}
              />
            </section>

            {/*
             * ── ZONE 4 (NBA only) — Mobile: order-3 / Desktop: hidden here ──
             * On mobile, Next Best Action bubbles up to position 4 per spec §22
             */}
            <section className="space-y-3 order-3 lg:hidden scroll-mt-24 sm:scroll-mt-28">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400 font-['Syne',sans-serif]">
                  4. What I Do Next
                </h2>
              </div>
              <NextBestActionCard
                action={activeData.nextBestAction}
                onOpenExplain={handleOpenExplain}
                onOpenCaptureModal={() => setCaptureEventOpen(true)}
                onComplete={() => {
                  trackNextBestActionCompleted(activeData.nextBestAction.title);
                  showToast("Action completed! Great work advancing toward your goal.", "success");
                }}
                onDismiss={() => {
                  trackNextBestActionDismissed(activeData.nextBestAction.title);
                  showToast("Recommendation dismissed.", "info");
                }}
              />
            </section>

            {/* ── ZONE 2: WHAT'S CHANGED (Mobile: order-4, Desktop: order-2) ── */}
            <section id="zone-2" className="space-y-3 order-4 lg:order-2 scroll-mt-24 sm:scroll-mt-28">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400 font-['Syne',sans-serif]">
                  2. What&apos;s Changed
                </h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-7 items-stretch">
                <RecentProgressCard items={activeData.recentProgress} />
                <RecentCareerEventCard
                  event={activeData.recentEvent}
                  onOpenCaptureEvent={() => setCaptureEventOpen(true)}
                />
              </div>
            </section>

            {/* ── ZONE 3: WHERE I'M GOING (Mobile: order-5, Desktop: order-3) ── */}
            <section id="zone-3" className="space-y-3 order-5 lg:order-3 scroll-mt-24 sm:scroll-mt-28">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 font-['Syne',sans-serif]">
                  3. Where I&apos;m Going
                </h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-7 items-stretch">
                {/* Direction always visible */}
                <CareerDirectionCard
                  direction={activeData.careerDirection}
                  onOpenExplain={handleOpenExplain}
                />
                {/* Goal: hidden on mobile (shown in mobile-only section above), visible on desktop */}
                <div className="hidden lg:block">
                  <CareerGoalCard
                    goal={activeData.careerGoal}
                    onSelectGoalType={handleSelectGoalType}
                  />
                </div>
              </div>
            </section>

            {/* ── ZONE 4: WHAT I DO NEXT (Mobile: order-6, Desktop: order-4) ── */}
            <section id="zone-4" className="space-y-6 sm:space-y-7 order-6 lg:order-4 scroll-mt-24 sm:scroll-mt-28">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400 font-['Syne',sans-serif]">
                  4. What I Do Next
                </h2>
              </div>

              {/* Full 3-col grid — desktop only (mobile NBA is in the mobile-priority section above) */}
              <div className="hidden lg:grid grid-cols-3 gap-6 sm:gap-7 items-stretch">
                <div className="col-span-2">
                  <NextBestActionCard
                    action={activeData.nextBestAction}
                    onOpenExplain={handleOpenExplain}
                    onOpenCaptureModal={() => setCaptureEventOpen(true)}
                    onComplete={() => {
                      trackNextBestActionCompleted(activeData.nextBestAction.title);
                      showToast("Action completed! Great work advancing toward your goal.", "success");
                    }}
                    onDismiss={() => {
                      trackNextBestActionDismissed(activeData.nextBestAction.title);
                      showToast("Recommendation dismissed.", "info");
                    }}
                  />
                </div>
                <div className="col-span-1">
                  <CareerMomentumCard momentum={activeData.momentum} />
                </div>
              </div>

              {/* Momentum — mobile: shown here (order-7 in spec, after Explore) */}
              <div className="lg:hidden">
                <CareerMomentumCard momentum={activeData.momentum} />
              </div>

              {/* Explore Your Career */}
              <ExploreCareerSection items={activeData.careerExploration} />
            </section>

          </div>
        )}
      </main>

      <Footer />

      {/* AI Traceability Modal — Section 15 & 16 */}
      <AiTraceabilityModal
        context={explainContext}
        onClose={() => setExplainContext(null)}
        onConfirm={() => explainContext && trackAiInterpretationAccepted(explainContext.componentTitle)}
        onReject={() => explainContext && trackAiInterpretationRejected(explainContext.componentTitle)}
      />

      {/* Quick Event Capture Modal */}
      <CaptureEventModal
        isOpen={captureEventOpen}
        onClose={() => setCaptureEventOpen(false)}
        onSave={handleSaveEvent}
      />

      {/* Toast notifications (UX feedback) */}
      <PulseToast
        message={toast?.message ?? ""}
        show={!!toast}
        variant={toast?.variant}
        onClose={dismissToast}
      />

      {/* Sticky mobile action bar (UX improvement — Section 22 mobile) */}
      {!initialLoading && (
        <MobileActionBar
          onLogEvent={() => setCaptureEventOpen(true)}
          nextActionCta={activeData.nextBestAction.cta || "Take Action"}
          nextActionLink={activeData.nextBestAction.ctaLink || "/value"}
        />
      )}
    </div>
  );
}
