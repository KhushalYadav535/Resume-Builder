"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/toast-1";
import {
  MomentumDashboardData,
  CareerDirection,
  CareerGoal,
  CareerPriority,
  GoalMilestone,
  GoalStage,
  GoalType,
  GoalStatus,
  ProgressSource,
  SuggestedDirection,
} from "@/types/momentum";
import { EMPTY_MOMENTUM_DATA, getDefaultMilestonesForGoalType } from "@/lib/momentumData";

// Components
import MomentumHeader from "@/components/momentum/MomentumHeader";
import CareerDirectionCard from "@/components/momentum/CareerDirectionCard";
import ActiveCareerGoalCard from "@/components/momentum/ActiveCareerGoalCard";
import WhyThisGoalCard from "@/components/momentum/WhyThisGoalCard";
import CareerPrioritiesCard from "@/components/momentum/CareerPrioritiesCard";
import GoalProgressCard from "@/components/momentum/GoalProgressCard";
import OtherGoalsSection from "@/components/momentum/OtherGoalsSection";
import EmptyMomentumState from "@/components/momentum/EmptyMomentumState";

// Modals & Drawers
import ViewDirectionModal from "@/components/momentum/ViewDirectionModal";
import EditDirectionModal from "@/components/momentum/EditDirectionModal";
import GoalDetailModal from "@/components/momentum/GoalDetailModal";
import AddGoalModal from "@/components/momentum/AddGoalModal";
import EditPrioritiesModal from "@/components/momentum/EditPrioritiesModal";
import WhyThisGoalDrawer from "@/components/momentum/WhyThisGoalDrawer";
import ExploreDirectionsModal from "@/components/momentum/ExploreDirectionsModal";
import GoalProgressDetailModal from "@/components/momentum/GoalProgressDetailModal";

function MomentumContent() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const storageKey = `uprole_momentum_state_${user?.id || "guest"}`;

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<MomentumDashboardData>(EMPTY_MOMENTUM_DATA);
  const [isEmptyStatePreview, setIsEmptyStatePreview] = useState(false);

  // Modal / Drawer states
  const [isViewDirectionOpen, setIsViewDirectionOpen] = useState(false);
  const [isEditDirectionOpen, setIsEditDirectionOpen] = useState(false);
  const [isGoalDetailOpen, setIsGoalDetailOpen] = useState(false);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isEditPrioritiesOpen, setIsEditPrioritiesOpen] = useState(false);
  const [isWhyThisGoalOpen, setIsWhyThisGoalOpen] = useState(false);
  const [isExploreDirectionsOpen, setIsExploreDirectionsOpen] = useState(false);
  const [isProgressDetailOpen, setIsProgressDetailOpen] = useState(false);
  const [selectedGoalForDetail, setSelectedGoalForDetail] = useState<CareerGoal | null>(null);

  // Pre-fill parameters from cross-pillar navigation (Spec Section 15)
  const [initialGoalPrefill, setInitialGoalPrefill] = useState<{
    title?: string;
    targetRole?: string;
    goalType?: GoalType;
  } | null>(null);

  // Interconnected Navigation Entry Points (Spec Section 15: Pulse → Set Goal, Value → Explore)
  useEffect(() => {
    const action = searchParams.get("action");
    const target = searchParams.get("target") || searchParams.get("role") || "";
    const type = (searchParams.get("type") as GoalType) || undefined;

    if (target || type) {
      setInitialGoalPrefill({
        title: target ? `Achieve ${target}` : undefined,
        targetRole: target || undefined,
        goalType: type,
      });
    }

    if (action === "create" || action === "set-goal" || action === "new-goal") {
      setIsAddGoalOpen(true);
    } else if (action === "explore") {
      setIsExploreDirectionsOpen(true);
    } else if (action === "priorities") {
      setIsEditPrioritiesOpen(true);
    }
  }, [searchParams]);

  // Load initial data: cache-first with eager server synchronization
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        // Read local storage cache if available
        const localSaved = localStorage.getItem(storageKey);
        if (localSaved) {
          try {
            const parsed = JSON.parse(localSaved);
            // Skip legacy mock data cache
            const isMockData = parsed?.activeGoal?.id === "goal-1" || parsed?.direction?.id === "dir-1";
            if (!isMockData && isMounted) {
              setData(parsed);
              setIsLoading(false);
            }
          } catch (e) {
            console.warn("Invalid localStorage cache", e);
          }
        }

        // Fetch fresh data from API
        const res = await fetch("/api/momentum");
        if (res.ok) {
          const apiData: MomentumDashboardData = await res.json();
          if (isMounted) {
            setData(apiData);
            try {
              localStorage.setItem(storageKey, JSON.stringify(apiData));
            } catch (e) {
              // Ignore quota errors
            }
          }
        }
      } catch (err) {
        console.error("Failed to load momentum data:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    if (!authLoading) {
      loadData();
    }

    return () => {
      isMounted = false;
    };
  }, [user?.id, authLoading, storageKey]);

  // Sync state to local storage and background API
  const persistState = useCallback(
    (updated: MomentumDashboardData) => {
      setData(updated);
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
        // Background sync to server API
        fetch("/api/momentum", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        }).catch((e) => console.warn("API background sync failed", e));
      } catch (e) {
        console.warn("Could not save state to localStorage", e);
      }
    },
    [storageKey]
  );

  // 1. Update Direction
  const handleSaveDirection = useCallback(
    (updatedPartial: Partial<CareerDirection>) => {
      const updatedDirection: CareerDirection = {
        id: data.direction?.id || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `dir-${Date.now()}`),
        title: updatedPartial.title || data.direction?.title || "Career Direction",
        description: updatedPartial.description || data.direction?.description || "",
        currentPath: updatedPartial.currentPath || data.direction?.currentPath || "Current",
        targetPath: updatedPartial.targetPath || data.direction?.targetPath || "Target",
        fullTrajectory: updatedPartial.fullTrajectory || data.direction?.fullTrajectory || ["Current", "Target"],
        status: updatedPartial.status || data.direction?.status || "Active",
        source: "User Confirmed",
        createdAt: data.direction?.createdAt || new Date().toISOString(),
        ...data.direction,
        ...updatedPartial,
        updatedAt: new Date().toISOString(),
      };
      const updatedData: MomentumDashboardData = {
        ...data,
        direction: updatedDirection,
      };
      persistState(updatedData);
      showToast("Career direction updated successfully", "success");
    },
    [data, persistState, showToast]
  );

  // 2. Multi-goal Update (Handles Primary Goal OR Secondary Goal correctly!)
  const handleUpdateGoal = useCallback(
    (updatedPartial: Partial<CareerGoal>) => {
      const targetId = updatedPartial.id || selectedGoalForDetail?.id || data.activeGoal?.id;

      // Case A: Target is the Active Primary Goal
      if (data.activeGoal && data.activeGoal.id === targetId) {
        const updatedActive: CareerGoal = {
          ...data.activeGoal,
          ...updatedPartial,
          updatedAt: new Date().toISOString(),
        };

        const updatedMilestones = updatedPartial.milestones || updatedActive.milestones;
        const completedCount = updatedMilestones.filter((m) => m.completed).length;

        // Synchronize Why This Goal statement if goal changed
        const dynamicWhy = {
          ...data.whyThisGoal,
          summary: updatedActive.reasonSummary || data.whyThisGoal.summary,
          supportingEvidence: updatedActive.supportingEvidence || data.whyThisGoal.supportingEvidence,
        };

        const updatedData: MomentumDashboardData = {
          ...data,
          activeGoal: updatedActive,
          whyThisGoal: dynamicWhy,
          progress: {
            completedMilestones: completedCount,
            totalMilestones: updatedMilestones.length,
            milestones: updatedMilestones,
          },
        };

        persistState(updatedData);
        setSelectedGoalForDetail(updatedActive);
        showToast("Active goal updated", "success");
        return;
      }

      // Case B: Target is one of the Secondary Goals
      const isSecondary = data.otherGoals.some((g) => g.id === targetId);
      if (isSecondary) {
        const updatedOtherGoals = data.otherGoals.map((g) => {
          if (g.id === targetId) {
            const nextGoal: CareerGoal = {
              ...g,
              ...updatedPartial,
              updatedAt: new Date().toISOString(),
            };
            setSelectedGoalForDetail(nextGoal);
            return nextGoal;
          }
          return g;
        });

        const updatedData: MomentumDashboardData = {
          ...data,
          otherGoals: updatedOtherGoals,
        };

        persistState(updatedData);
        showToast("Secondary goal updated", "success");
      }
    },
    [data, selectedGoalForDetail, persistState, showToast]
  );

  // 3. Toggle Milestone Completion with dynamic stage progression
  const handleToggleMilestone = useCallback(
    (milestoneId: string) => {
      if (!data.activeGoal) return;

      const targetMilestone = data.activeGoal.milestones.find((m) => m.id === milestoneId);
      const nextCompleted = targetMilestone ? !targetMilestone.completed : true;

      const updatedMilestones = data.activeGoal.milestones.map((m) =>
        m.id === milestoneId
          ? {
              ...m,
              completed: nextCompleted,
              completedAt: nextCompleted ? new Date().toISOString().split("T")[0] : undefined,
            }
          : m
      );

      const completedCount = updatedMilestones.filter((m) => m.completed).length;

      // Dynamically calculate stage progression based on milestone completion
      let nextStage = data.activeGoal.stage;
      if (updatedMilestones.length > 0) {
        const ratio = completedCount / updatedMilestones.length;
        if (ratio >= 0.8 || updatedMilestones.some((m) => m.completed && m.stage === "outcome")) {
          nextStage = "outcome";
        } else if (ratio >= 0.4 || updatedMilestones.some((m) => m.completed && m.stage === "strategy")) {
          nextStage = "strategy";
        } else if (completedCount > 0 || updatedMilestones.some((m) => m.completed && (m.stage === "direction" || m.stage === "target"))) {
          nextStage = "target";
        } else {
          nextStage = "direction";
        }
      }

      const updatedGoal: CareerGoal = {
        ...data.activeGoal,
        stage: nextStage,
        milestones: updatedMilestones,
        updatedAt: new Date().toISOString(),
      };

      const updatedData: MomentumDashboardData = {
        ...data,
        activeGoal: updatedGoal,
        progress: {
          completedMilestones: completedCount,
          totalMilestones: updatedMilestones.length,
          milestones: updatedMilestones,
        },
      };

      persistState(updatedData);

      // Async sync to progress sub-endpoint
      if (data.activeGoal.id) {
        fetch(`/api/momentum/goals/${data.activeGoal.id}/progress`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ milestoneId, completed: nextCompleted, goalStage: nextStage }),
        }).catch((e) => console.warn("Failed milestone PATCH", e));
      }

      showToast("Milestone updated", "info");
    },
    [data, persistState, showToast]
  );

  // 4. Add Custom Milestone (with Section 10 progress source support)
  const handleAddMilestone = useCallback(
    (title: string, stage: GoalStage, sourceType?: ProgressSource) => {
      if (!data.activeGoal) return;

      const newMilestone: GoalMilestone = {
        id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `m-${Date.now()}`,
        title,
        completed: false,
        stage,
        sourceType: sourceType || "Capability development",
      };

      const updatedMilestones = [...data.activeGoal.milestones, newMilestone];
      const completedCount = updatedMilestones.filter((m) => m.completed).length;

      const updatedGoal: CareerGoal = {
        ...data.activeGoal,
        milestones: updatedMilestones,
        updatedAt: new Date().toISOString(),
      };

      const updatedData: MomentumDashboardData = {
        ...data,
        activeGoal: updatedGoal,
        progress: {
          completedMilestones: completedCount,
          totalMilestones: updatedMilestones.length,
          milestones: updatedMilestones,
        },
      };

      persistState(updatedData);

      if (data.activeGoal.id) {
        fetch(`/api/momentum/goals/${data.activeGoal.id}/progress`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "add", title, stage, sourceType, completed: false }),
        }).catch((e) => console.warn("Failed milestone add", e));
      }

      showToast(`Added milestone: "${title}"`, "success");
    },
    [data, persistState, showToast]
  );

  // 5. Update Priorities
  const handleSavePriorities = useCallback(
    (updatedPriorities: CareerPriority[]) => {
      const updatedData: MomentumDashboardData = {
        ...data,
        priorities: updatedPriorities,
      };
      persistState(updatedData);
      showToast("Career priorities updated", "success");
    },
    [data, persistState, showToast]
  );

  // 6. Add New Goal (with domain-specific taxonomy milestones and valid RFC UUIDs)
  const handleAddGoal = useCallback(
    (newGoalPartial: Partial<CareerGoal>) => {
      const shouldBePrimary =
        Boolean(newGoalPartial.isPrimary) || !data.activeGoal;

      const goalId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `goal-${Date.now()}`;
      const goalType = newGoalPartial.goalType || "Role Change";
      const targetRole = newGoalPartial.targetRole || "Target Role";

      const defaultMilestones = getDefaultMilestonesForGoalType(goalType, targetRole).map((m) => ({
        ...m,
        id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : m.id,
      }));

      const newGoal: CareerGoal = {
        id: goalId,
        userId: user?.id,
        title: newGoalPartial.title || `Target: ${targetRole}`,
        targetRole: targetRole,
        currentRole: newGoalPartial.currentRole || data.activeGoal?.currentRole || "Current Role",
        targetHorizon: newGoalPartial.targetHorizon || "6–12 months",
        goalType: goalType,
        status: newGoalPartial.status || "Active",
        isPrimary: shouldBePrimary,
        stage: newGoalPartial.stage || "direction",
        objective: newGoalPartial.objective || `Accelerate readiness and achieve the ${targetRole} role with strategic alignment.`,
        strategyOverview: newGoalPartial.strategyOverview || "Execute on key milestones spanning capability verification, stakeholder networking, and concrete career evidence.",
        milestones: newGoalPartial.milestones && newGoalPartial.milestones.length > 0 ? newGoalPartial.milestones : defaultMilestones,
        reasonSummary: newGoalPartial.reasonSummary || `Targeting ${targetRole} leverages your validated capabilities and career trajectory.`,
        supportingEvidence: newGoalPartial.supportingEvidence || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (shouldBePrimary) {
        const oldPrimary = data.activeGoal ? [{ ...data.activeGoal, isPrimary: false }] : [];
        const updatedData: MomentumDashboardData = {
          ...data,
          activeGoal: newGoal,
          whyThisGoal: {
            ...data.whyThisGoal,
            summary: newGoal.reasonSummary || data.whyThisGoal.summary,
            supportingEvidence: newGoal.supportingEvidence || data.whyThisGoal.supportingEvidence,
          },
          otherGoals: [...oldPrimary, ...data.otherGoals],
          progress: {
            completedMilestones: newGoal.milestones.filter((m) => m.completed).length,
            totalMilestones: newGoal.milestones.length,
            milestones: newGoal.milestones,
          },
        };
        persistState(updatedData);
      } else {
        const updatedData: MomentumDashboardData = {
          ...data,
          otherGoals: [newGoal, ...data.otherGoals],
        };
        persistState(updatedData);
      }

      setIsEmptyStatePreview(false);
      showToast("New career goal created", "success");
    },
    [data, user, persistState, showToast]
  );

  // 7. Set Secondary Goal as Primary
  const handleSetAsPrimary = useCallback(
    (goalId: string) => {
      const targetGoal = data.otherGoals.find((g) => g.id === goalId);
      if (!targetGoal) return;

      const remainingOthers = data.otherGoals.filter((g) => g.id !== goalId);
      const oldActive = data.activeGoal ? [{ ...data.activeGoal, isPrimary: false }] : [];

      const newPrimaryGoal: CareerGoal = {
        ...targetGoal,
        isPrimary: true,
        updatedAt: new Date().toISOString(),
      };

      const updatedData: MomentumDashboardData = {
        ...data,
        activeGoal: newPrimaryGoal,
        whyThisGoal: {
          ...data.whyThisGoal,
          summary: newPrimaryGoal.reasonSummary || `Focused on achieving ${newPrimaryGoal.targetRole} based on your career trajectory.`,
          supportingEvidence: newPrimaryGoal.supportingEvidence || data.whyThisGoal.supportingEvidence,
        },
        otherGoals: [...oldActive, ...remainingOthers],
        progress: {
          completedMilestones: (newPrimaryGoal.milestones || []).filter((m) => m.completed).length,
          totalMilestones: (newPrimaryGoal.milestones || []).length,
          milestones: newPrimaryGoal.milestones || [],
        },
      };

      persistState(updatedData);
      showToast(`Set "${targetGoal.title}" as primary goal`, "success");
    },
    [data, persistState, showToast]
  );

  // 8. Archive Secondary Goal (with backend DELETE sync)
  const handleArchiveGoal = useCallback(
    (goalId: string) => {
      const updatedOthers = data.otherGoals.filter((g) => g.id !== goalId);
      const updatedData: MomentumDashboardData = {
        ...data,
        otherGoals: updatedOthers,
      };
      persistState(updatedData);

      // Async backend removal / soft-delete
      fetch(`/api/momentum/goals/${goalId}`, {
        method: "DELETE",
      }).catch((e) => console.warn("Failed to delete goal", e));

      showToast("Secondary goal archived", "info");
    },
    [data, persistState, showToast]
  );

  // 9. Adopt Suggested Direction (ensures active goal exists with domain milestones)
  const handleAdoptDirection = useCallback(
    (suggested: SuggestedDirection) => {
      const trajectoryParts = suggested.trajectory.split("→").map((s) => s.trim());
      const dirId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `dir-${Date.now()}`;

      const updatedDirection: CareerDirection = {
        id: data.direction?.id || dirId,
        title: suggested.title,
        description: suggested.rationale,
        currentPath: trajectoryParts[0] || "Current",
        targetPath: trajectoryParts[trajectoryParts.length - 1] || suggested.title,
        fullTrajectory: trajectoryParts,
        status: "Active",
        source: "User Adopted from Value",
        createdAt: data.direction?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // If user had no active goal, generate an active starter goal for this direction
      let updatedActiveGoal = data.activeGoal;
      let updatedProgress = data.progress;

      if (!updatedActiveGoal) {
        const targetRole = trajectoryParts[trajectoryParts.length - 1] || suggested.title;
        const goalId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `goal-${Date.now()}`;
        const starterMilestones = getDefaultMilestonesForGoalType("Role Change", targetRole).map((m) => ({
          ...m,
          id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : m.id,
        }));

        updatedActiveGoal = {
          id: goalId,
          userId: user?.id,
          title: `Transition into ${suggested.title}`,
          targetRole: targetRole,
          currentRole: trajectoryParts[0] || "Current Role",
          targetHorizon: "6–12 months",
          goalType: "Role Change",
          status: "Active",
          isPrimary: true,
          stage: "direction",
          objective: `Transition into ${targetRole} with verified domain capabilities and strategic career momentum.`,
          strategyOverview: "Advance systematically from role definition and gap closure to strategic positioning and executive outcome delivery.",
          milestones: starterMilestones,
          reasonSummary: suggested.rationale,
          supportingEvidence: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        updatedProgress = {
          completedMilestones: starterMilestones.filter((m) => m.completed).length,
          totalMilestones: starterMilestones.length,
          milestones: starterMilestones,
        };
      }

      const updatedData: MomentumDashboardData = {
        ...data,
        direction: updatedDirection,
        activeGoal: updatedActiveGoal,
        progress: updatedProgress,
      };

      persistState(updatedData);
      setIsEmptyStatePreview(false);
      showToast(`Adopted "${suggested.title}" as active direction`, "success");
    },
    [data, user, persistState, showToast]
  );

  // 10. Confirm & Keep Active Goal (User Agency Confirmation)
  const handleConfirmGoal = useCallback(() => {
    if (!data.activeGoal) return;

    const confirmedDirection = data.direction
      ? { ...data.direction, source: "User Confirmed", updatedAt: new Date().toISOString() }
      : null;

    const confirmedGoal = {
      ...data.activeGoal,
      status: "Active" as const,
      updatedAt: new Date().toISOString(),
    };

    const updatedData: MomentumDashboardData = {
      ...data,
      direction: confirmedDirection,
      activeGoal: confirmedGoal,
    };

    persistState(updatedData);
    showToast("Goal confirmed as your chosen career target", "success");
  }, [data, persistState, showToast]);

  // Refresh real data from server API
  const handleResetData = useCallback(async () => {
    localStorage.removeItem(storageKey);
    setIsLoading(true);
    try {
      const res = await fetch("/api/momentum");
      if (res.ok) {
        const freshData: MomentumDashboardData = await res.json();
        setData(freshData);
        try {
          localStorage.setItem(storageKey, JSON.stringify(freshData));
        } catch (e) {}
      } else {
        setData(EMPTY_MOMENTUM_DATA);
      }
    } catch (e) {
      setData(EMPTY_MOMENTUM_DATA);
    } finally {
      setIsLoading(false);
      setIsEmptyStatePreview(false);
      showToast("Dashboard refreshed with real profile data", "info");
    }
  }, [storageKey, showToast]);

  const hasNoActiveGoals = isEmptyStatePreview || (!data.activeGoal && data.otherGoals.length === 0);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] flex flex-col font-sans">
      <Navbar />

      {/* Header */}
      <MomentumHeader
        isEmptyState={isEmptyStatePreview}
        onToggleEmptyState={() => setIsEmptyStatePreview((prev) => !prev)}
        onResetData={handleResetData}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-6 sm:px-8 py-9 flex-1 space-y-8">
        {isLoading ? (
          <div className="space-y-6 animate-pulse" role="status" aria-label="Loading momentum dashboard">
            <div className="h-44 rounded-2xl bg-[var(--card)] border border-[var(--border)] opacity-60" />
            <div className="h-64 rounded-2xl bg-[var(--card)] border border-[var(--border)] opacity-60" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-48 rounded-2xl bg-[var(--card)] border border-[var(--border)] opacity-60" />
              <div className="h-48 rounded-2xl bg-[var(--card)] border border-[var(--border)] opacity-60" />
            </div>
          </div>
        ) : hasNoActiveGoals ? (
          /* Spec Section 14: Psychologically supportive empty state */
          <EmptyMomentumState
            suggestedDirections={data.suggestedDirections}
            onExploreDirections={() => setIsExploreDirectionsOpen(true)}
            onSetCareerGoal={() => setIsAddGoalOpen(true)}
            onSelectSuggestedDirection={handleAdoptDirection}
          />
        ) : (
          /* Populated Dashboard matching Spec Section 4 layout */
          <div className="space-y-8">
            {/* 1. YOUR CAREER DIRECTION */}
            {data.direction && (
              <CareerDirectionCard
                direction={data.direction}
                onView={() => setIsViewDirectionOpen(true)}
                onEdit={() => setIsEditDirectionOpen(true)}
              />
            )}

            {/* 2. ACTIVE CAREER GOAL */}
            {data.activeGoal && (
              <ActiveCareerGoalCard
                goal={data.activeGoal}
                onViewGoal={() => {
                  setSelectedGoalForDetail(data.activeGoal);
                  setIsGoalDetailOpen(true);
                }}
                onToggleStatus={(status) => {
                  handleUpdateGoal({ id: data.activeGoal?.id, status });
                  if (status === "Achieved") {
                    showToast("Career goal achieved! 🎉 Consider recording this achievement in your Career Journal or Value Story.", "success");
                  }
                }}
                onSelectStage={(stage) => handleUpdateGoal({ id: data.activeGoal?.id, stage })}
                onSeeEvidence={() => setIsWhyThisGoalOpen(true)}
              />
            )}

            {/* 3 & 4. WHY THIS GOAL + YOUR PRIORITIES (2 Columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WhyThisGoalCard
                whyThisGoal={data.whyThisGoal}
                onSeeReasoning={() => setIsWhyThisGoalOpen(true)}
                onSeeEvidence={() => setIsWhyThisGoalOpen(true)}
              />

              <CareerPrioritiesCard
                priorities={data.priorities}
                onEditPriorities={() => setIsEditPrioritiesOpen(true)}
              />
            </div>

            {/* 5. PROGRESS TOWARD GOAL */}
            {data.progress && (
              <GoalProgressCard
                milestones={data.progress.milestones}
                onToggleMilestone={handleToggleMilestone}
                onViewProgress={() => setIsProgressDetailOpen(true)}
              />
            )}

            {/* 6. OTHER CAREER GOALS */}
            <OtherGoalsSection
              otherGoals={data.otherGoals}
              onAddGoal={() => {
                setInitialGoalPrefill(null);
                setIsAddGoalOpen(true);
              }}
              onSetAsPrimary={handleSetAsPrimary}
              onSelectGoal={(goal) => {
                setSelectedGoalForDetail(goal);
                setIsGoalDetailOpen(true);
              }}
              onArchiveGoal={handleArchiveGoal}
              onUpdateGoalStatus={(goalId, status) => {
                handleUpdateGoal({ id: goalId, status });
                if (status === "Achieved") {
                  showToast("Goal marked as achieved! Record this outcome in your Value Story.", "success");
                }
              }}
            />
          </div>
        )}
      </main>

      {/* MODALS & DRAWERS */}
      <ViewDirectionModal
        isOpen={isViewDirectionOpen}
        onClose={() => setIsViewDirectionOpen(false)}
        direction={data.direction}
        onOpenEdit={() => setIsEditDirectionOpen(true)}
      />

      <EditDirectionModal
        isOpen={isEditDirectionOpen}
        onClose={() => setIsEditDirectionOpen(false)}
        direction={data.direction}
        onSave={handleSaveDirection}
      />

      <GoalDetailModal
        isOpen={isGoalDetailOpen}
        onClose={() => {
          setIsGoalDetailOpen(false);
          setSelectedGoalForDetail(null);
        }}
        goal={selectedGoalForDetail || data.activeGoal}
        onUpdateGoal={handleUpdateGoal}
        onArchiveGoal={handleArchiveGoal}
      />

      <AddGoalModal
        isOpen={isAddGoalOpen}
        onClose={() => {
          setIsAddGoalOpen(false);
          setInitialGoalPrefill(null);
        }}
        onAdd={handleAddGoal}
        initialPrefill={initialGoalPrefill}
      />

      <EditPrioritiesModal
        isOpen={isEditPrioritiesOpen}
        onClose={() => setIsEditPrioritiesOpen(false)}
        priorities={data.priorities}
        onSave={handleSavePriorities}
      />

      <WhyThisGoalDrawer
        isOpen={isWhyThisGoalOpen}
        onClose={() => setIsWhyThisGoalOpen(false)}
        whyThisGoal={data.whyThisGoal}
        activeGoalTitle={data.activeGoal?.title}
        onConfirmGoal={handleConfirmGoal}
        onEditPriorities={() => setIsEditPrioritiesOpen(true)}
      />

      <ExploreDirectionsModal
        isOpen={isExploreDirectionsOpen}
        onClose={() => setIsExploreDirectionsOpen(false)}
        directions={data.suggestedDirections}
        onSelectDirection={handleAdoptDirection}
        selectedTitle={searchParams.get("direction") || undefined}
      />

      <GoalProgressDetailModal
        isOpen={isProgressDetailOpen}
        onClose={() => setIsProgressDetailOpen(false)}
        goal={data.activeGoal}
        milestones={data.progress?.milestones || []}
        onToggleMilestone={handleToggleMilestone}
        onAddMilestone={handleAddMilestone}
      />

      <Footer />
    </div>
  );
}

export default function MomentumPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center font-sans">
          <div className="text-sm font-semibold text-[var(--text-muted)] animate-pulse">
            Loading Momentum...
          </div>
        </div>
      }
    >
      <MomentumContent />
    </Suspense>
  );
}
