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
  const [scenario, setScenario] = useState<ScenarioPreset>("live");
  const [liveData, setLiveData] = useState<PulseDashboardData | null>(null);
  // initialLoading: true only on first mount (Section 21 — skeleton until data ready)
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAllExpanded, setIsAllExpanded] = useState(false);

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
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-amber-500 selection:text-brand-navy transition-colors duration-200">
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10 pb-24 lg:pb-10">
        {/* Pulse Shell Header with Scenario Switcher & View Controls */}
        <PulseHeader
          currentScenario={scenario}
          onScenarioChange={handleScenarioChange}
          onOpenCaptureEvent={() => setCaptureEventOpen(true)}
          isRefreshing={isRefreshing}
          onRefresh={fetchPulseData}
          isAllExpanded={isAllExpanded}
          onToggleExpandAll={() => setIsAllExpanded((prev) => !prev)}
        />

        {/* Section 21: Show skeleton while initial data loads */}
        {initialLoading ? (
          <PulseSkeleton />
        ) : (
          /*
           * Responsive Grid:
           * - Desktop (lg): 4 rows of 2 cards + 1 full-width Explore section matching 30 Sep 2026 Box Diagram
           *   Row 1: Snapshot (lg:order-1) & Value (lg:order-2)
           *   Row 2: Progress (lg:order-3) & Event (lg:order-4)
           *   Row 3: Direction (lg:order-5) & Goal (lg:order-6)
           *   Row 4: Next Best Action (lg:order-7) & Momentum (lg:order-8)
           *   Row 5: Explore Career (lg:order-9, col-span-2)
           * - Mobile (< lg): Strict priority sequence per Section 22:
           *   1. Snapshot (order-1)
           *   2. Value (order-2)
           *   3. Goal (order-3)
           *   4. Next Best Action (order-4)
           *   5. Recent Progress (order-5)
           *   6. Career Direction (order-6)
           *   7. Recent Event (order-7)
           *   8. Explore Career (order-8)
           *   9. Career Momentum (order-9)
           */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-stretch">
            {/* 1. Career Snapshot — Mobile: #1, Desktop: Row 1 Left */}
            <div className="order-1 lg:order-1 flex flex-col">
              <CareerSnapshotCard
                data={activeData.snapshot}
                onOpenExplain={handleOpenExplain}
                forceExpand={isAllExpanded}
              />
            </div>

            {/* 2. Career Value — Mobile: #2, Desktop: Row 1 Right */}
            <div className="order-2 lg:order-2 flex flex-col">
              <CareerValueCard
                data={activeData.careerValue}
                onOpenExplain={handleOpenExplain}
                forceExpand={isAllExpanded}
              />
            </div>

            {/* 3. Recent Progress — Mobile: #5, Desktop: Row 2 Left */}
            <div className="order-5 lg:order-3 flex flex-col">
              <RecentProgressCard
                items={activeData.recentProgress}
                forceExpand={isAllExpanded}
              />
            </div>

            {/* 4. Recent Event — Mobile: #7, Desktop: Row 2 Right */}
            <div className="order-7 lg:order-4 flex flex-col">
              <RecentCareerEventCard
                event={activeData.recentEvent}
                onOpenCaptureEvent={() => setCaptureEventOpen(true)}
                forceExpand={isAllExpanded}
              />
            </div>

            {/* 5. Career Direction — Mobile: #6, Desktop: Row 3 Left */}
            <div className="order-6 lg:order-5 flex flex-col">
              <CareerDirectionCard
                direction={activeData.careerDirection}
                onOpenExplain={handleOpenExplain}
                forceExpand={isAllExpanded}
              />
            </div>

            {/* 6. Career Goal — Mobile: #3, Desktop: Row 3 Right */}
            <div className="order-3 lg:order-6 flex flex-col">
              <CareerGoalCard
                goal={activeData.careerGoal}
                onSelectGoalType={handleSelectGoalType}
                forceExpand={isAllExpanded}
              />
            </div>

            {/* 7. Next Best Action — Mobile: #4, Desktop: Row 4 Left */}
            <div className="order-4 lg:order-7 flex flex-col">
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
                forceExpand={isAllExpanded}
              />
            </div>

            {/* 8. Career Momentum — Mobile: #9, Desktop: Row 4 Right */}
            <div className="order-9 lg:order-8 flex flex-col">
              <CareerMomentumCard
                momentum={activeData.momentum}
                forceExpand={isAllExpanded}
              />
            </div>

            {/* 9. Explore Career — Mobile: #8, Desktop: Row 5 Full Width */}
            <div className="col-span-1 lg:col-span-2 order-8 lg:order-9">
              <ExploreCareerSection
                items={activeData.careerExploration}
                forceExpand={isAllExpanded}
              />
            </div>
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
