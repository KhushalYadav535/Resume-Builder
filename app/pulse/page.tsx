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
import PulseCardDetailDrawer from "@/components/pulse/PulseCardDetailDrawer";
import {
  PulseDashboardData,
  PulseCardId,
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
import PulseAtAGlance from "@/components/pulse/PulseAtAGlance";

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
  const [scenario, setScenario] = useState<ScenarioPreset>("live");
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

  // Modals & Drawer state
  const [explainContext, setExplainContext] = useState<AiTraceabilityContext | null>(null);
  const [captureEventOpen, setCaptureEventOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<PulseCardId | null>(null);

  const handleCardClick = (cardId: PulseCardId, e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button, a, input, select")) {
      return;
    }
    setSelectedCard(cardId);
  };

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
          : { ...CANONICAL_ESTABLISHED_DATA, recentEvent: effectiveRecentEvent, careerGoal: effectiveGoal };

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
    <div className="value-scope min-h-screen bg-[var(--bg)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-amber-500 selection:text-brand-navy transition-colors duration-200 relative">
      {/* Premium page ambience — same theme, subtle depth */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-180px] left-1/2 -translate-x-1/2 w-[900px] h-[420px] bg-amber-500/[0.06] rounded-full blur-[120px]" />
        <div className="absolute top-[40%] right-[-200px] w-[480px] h-[480px] bg-violet-500/[0.05] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-200px] left-[-160px] w-[480px] h-[480px] bg-sky-500/[0.05] rounded-full blur-[120px]" />
      </div>
      <div className="relative z-10 flex flex-col min-h-screen">
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10 pb-24 lg:pb-10">
        {/* Pulse Shell Header with Scenario Switcher & Action Controls */}
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
           * Responsive Grid:
           * - Desktop (xl): 4 columns x 2 rows (8 compact cards) + 1 full-width Explore section
           *   Row 1: Snapshot & Value & Progress & Event
           *   Row 2: Direction & Goal & Next Best Action & Momentum
           *   Row 3: Explore Career (col-span-full)
           * - Tablet (md): 2 columns x 4 rows
           * - Mobile (< md): 1 column priority sequence
           */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 items-stretch">
            {/* 1. Career Snapshot — Row 1 Col 1 */}
            <div
              id="pulse-snapshot"
              onClick={(e) => handleCardClick("snapshot", e)}
              className="pulse-anchor order-1 lg:order-1 flex flex-col cursor-pointer transition-transform hover:-translate-y-1 active:translate-y-0 relative group/tile"
              title="Click to open full Career Snapshot detail drawer"
            >
              <CareerSnapshotCard
                data={activeData.snapshot}
                onOpenExplain={handleOpenExplain}
              />
            </div>

            {/* 2. Career Value — Row 1 Col 2 */}
            <div
              id="pulse-value"
              onClick={(e) => handleCardClick("value", e)}
              className="pulse-anchor order-2 lg:order-2 flex flex-col cursor-pointer transition-transform hover:-translate-y-1 active:translate-y-0 relative group/tile"
              title="Click to open full Career Value detail drawer"
            >
              <CareerValueCard
                data={activeData.careerValue}
                onOpenExplain={handleOpenExplain}
              />
            </div>

            {/* 3. Recent Progress — Row 1 Col 3 */}
            <div
              id="pulse-progress"
              onClick={(e) => handleCardClick("progress", e)}
              className="pulse-anchor order-5 lg:order-3 xl:order-3 flex flex-col cursor-pointer transition-transform hover:-translate-y-1 active:translate-y-0 relative group/tile"
              title="Click to open full Recent Progress detail drawer"
            >
              <RecentProgressCard
                items={activeData.recentProgress}
              />
            </div>

            {/* 4. Recent Event — Row 1 Col 4 */}
            <div
              id="pulse-event"
              onClick={(e) => handleCardClick("event", e)}
              className="pulse-anchor order-7 lg:order-4 xl:order-4 flex flex-col cursor-pointer transition-transform hover:-translate-y-1 active:translate-y-0 relative group/tile"
              title="Click to open full Recent Career Event detail drawer"
            >
              <RecentCareerEventCard
                event={activeData.recentEvent}
                onOpenCaptureEvent={() => setCaptureEventOpen(true)}
              />
            </div>

            {/* 5. Career Direction — Row 2 Col 1 */}
            <div
              id="pulse-direction"
              onClick={(e) => handleCardClick("direction", e)}
              className="pulse-anchor order-6 lg:order-5 xl:order-5 flex flex-col cursor-pointer transition-transform hover:-translate-y-1 active:translate-y-0 relative group/tile"
              title="Click to open full Career Direction detail drawer"
            >
              <CareerDirectionCard
                direction={activeData.careerDirection}
                onOpenExplain={handleOpenExplain}
              />
            </div>

            {/* 6. Career Goal — Row 2 Col 2 */}
            <div
              id="pulse-goal"
              onClick={(e) => handleCardClick("goal", e)}
              className="pulse-anchor order-3 lg:order-6 xl:order-6 flex flex-col cursor-pointer transition-transform hover:-translate-y-1 active:translate-y-0 relative group/tile"
              title="Click to open full Career Goal detail drawer"
            >
              <CareerGoalCard
                goal={activeData.careerGoal}
                onSelectGoalType={handleSelectGoalType}
              />
            </div>

            {/* 7. Next Best Action — Row 2 Col 3 */}
            <div
              id="pulse-action"
              onClick={(e) => handleCardClick("action", e)}
              className="pulse-anchor order-4 lg:order-7 xl:order-7 flex flex-col cursor-pointer transition-transform hover:-translate-y-1 active:translate-y-0 relative group/tile ring-2 ring-amber-500/20 hover:ring-amber-500/40 rounded-2xl"
              title="Click to open full Next Best Action detail drawer"
            >
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

            {/* 8. Career Momentum — Row 2 Col 4 */}
            <div
              id="pulse-momentum"
              onClick={(e) => handleCardClick("momentum", e)}
              className="pulse-anchor order-9 lg:order-8 xl:order-8 flex flex-col cursor-pointer transition-transform hover:-translate-y-1 active:translate-y-0 relative group/tile"
              title="Click to open full Career Momentum detail drawer"
            >
              <CareerMomentumCard
                momentum={activeData.momentum}
              />
            </div>

            {/* 9. Explore Career — Full Width Bottom Row */}
            <div
              id="pulse-explore"
              onClick={(e) => handleCardClick("explore", e)}
              className="pulse-anchor col-span-1 md:col-span-2 xl:col-span-4 order-8 lg:order-9 cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-y-0 relative group/tile"
              title="Click to open full Explore Career detail drawer"
            >
              <ExploreCareerSection
                items={activeData.careerExploration}
              />
            </div>
          </div>
        )}
      </main>

      {!user && (
        <div className="pb-20 lg:pb-0">
          <Footer />
        </div>
      )}

      {/* Interactive Right Slide-Over Detail Drawer */}
      <PulseCardDetailDrawer
        cardId={selectedCard}
        isOpen={selectedCard !== null}
        onClose={() => setSelectedCard(null)}
        data={activeData}
        onSelectCard={(id) => setSelectedCard(id)}
        onOpenCaptureEvent={() => setCaptureEventOpen(true)}
        onOpenExplain={handleOpenExplain}
      />

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
    </div>
  );
}
