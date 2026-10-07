"use client";

import React from "react";
import { CareerGoal, GoalStage, GoalStatus } from "@/types/momentum";
import { Flag, Clock, Eye, Check } from "lucide-react";

interface ActiveCareerGoalCardProps {
  goal: CareerGoal;
  onViewGoal: () => void;
  onToggleStatus?: (status: GoalStatus) => void;
  onSelectStage?: (stage: GoalStage) => void;
  onSeeEvidence?: () => void;
}

const STAGES: { id: GoalStage; label: string }[] = [
  { id: "direction", label: "Direction" },
  { id: "target", label: "Target" },
  { id: "strategy", label: "Strategy" },
  { id: "outcome", label: "Outcome" },
];

export default function ActiveCareerGoalCard({
  goal,
  onViewGoal,
  onToggleStatus,
  onSelectStage,
  onSeeEvidence,
}: ActiveCareerGoalCardProps) {
  // Dynamically calculate active stage from milestone progress or goal.stage
  const milestones = goal.milestones || [];
  const completedMilestones = milestones.filter((m) => m.completed);

  // Proportional stage calculation based on milestone completion and explicit milestone stages
  let computedStageIndex = 0;
  if (milestones.length > 0) {
    const ratio = completedMilestones.length / milestones.length;
    if (ratio >= 0.8 || completedMilestones.some((m) => m.stage === "outcome")) {
      computedStageIndex = 3; // Outcome
    } else if (ratio >= 0.4 || completedMilestones.some((m) => m.stage === "strategy")) {
      computedStageIndex = 2; // Strategy
    } else if (ratio > 0 || completedMilestones.some((m) => m.stage === "direction" || m.stage === "target")) {
      computedStageIndex = 1; // Target
    }
  }

  // Allow explicit override if goal.stage is set
  const explicitIndex = STAGES.findIndex((s) => s.id === goal.stage);
  const activeIndex = explicitIndex >= 0 ? Math.max(explicitIndex, computedStageIndex) : computedStageIndex;

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 sm:p-7 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700 relative overflow-hidden">
      {/* Top Banner with Section 3 & 20 question */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          <Flag size={15} />
          <span>Active Career Goal</span>
          <span className="text-[var(--text-muted)] lowercase font-normal hidden sm:inline">
            · &ldquo;What do I want to achieve?&rdquo;
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            {goal.goalType}
          </span>
          <span
            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
              goal.status === "Active" || goal.status === "In Progress"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : goal.status === "Paused"
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                : goal.status === "Achieved"
                ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                : "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20"
            }`}
          >
            {goal.status}
          </span>
        </div>
      </div>

      {/* Main Goal Headline */}
      <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] font-['Syne',sans-serif] tracking-tight">
        {goal.title}
      </h2>

      {/* Target, Current Role & Horizon Meta Display (Faithful to Section 6 specification) */}
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-[var(--text-secondary)]">
        <div className="flex items-center gap-1.5 py-1 px-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)]">
          <span className="text-[var(--text-muted)] font-medium">Target:</span>
          <strong className="text-[var(--text-primary)] font-bold">{goal.targetRole || goal.title}</strong>
        </div>

        {goal.currentRole && (
          <div className="flex items-center gap-1.5 py-1 px-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)]">
            <span className="text-[var(--text-muted)] font-medium">Current:</span>
            <strong className="text-[var(--text-primary)] font-bold">{goal.currentRole}</strong>
          </div>
        )}

        <div className="flex items-center gap-1.5 py-1 px-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)]">
          <Clock size={13} className="text-amber-500 shrink-0" />
          <span className="text-[var(--text-muted)] font-medium">Horizon:</span>
          <strong className="text-[var(--text-primary)] font-bold">{goal.targetHorizon || "6–12 months"}</strong>
        </div>
      </div>

      {/* Progress Stepper Section (Faithful to Section 4 ASCII: ●──────●──────○──────○) */}
      <div
        className="mt-6 pt-5 border-t border-[var(--border)]"
        role="progressbar"
        aria-label="Career progression stage"
        aria-valuenow={activeIndex + 1}
        aria-valuemin={1}
        aria-valuemax={STAGES.length}
        aria-valuetext={STAGES[activeIndex].label}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
            <span>Progress</span>
            <span className="text-[11px] font-normal text-[var(--text-muted)] font-mono">
              (●──────●──────○──────○)
            </span>
          </span>
          <span className="text-xs text-[var(--text-muted)]">
            Current Stage: <strong className="text-blue-600 dark:text-blue-400 font-bold">{STAGES[activeIndex].label}</strong>
          </span>
        </div>

        {/* Visual Continuous Dot Track */}
        <div className="relative pt-2 pb-1">
          {/* Base track anchored between center of first col (12.5%) and center of last col (87.5%) */}
          <div className="absolute top-5 left-[12.5%] right-[12.5%] h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0 rounded-full" />
          {/* Active fill track */}
          <div
            className="absolute top-5 left-[12.5%] h-1 bg-gradient-to-r from-blue-600 to-amber-500 -translate-y-1/2 z-0 transition-all duration-500 rounded-full"
            style={{
              width: `${(activeIndex / (STAGES.length - 1)) * 75}%`,
            }}
          />

          <div className="relative z-10 grid grid-cols-4 text-center">
            {STAGES.map((s, idx) => {
              const isFilled = idx <= activeIndex;
              const isCurrent = idx === activeIndex;

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onSelectStage && onSelectStage(s.id)}
                  title={`Stage ${idx + 1}: ${s.label}`}
                  className="flex flex-col items-center group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 rounded-xl p-1"
                >
                  {/* Faithful dot node: ● (filled) vs ○ (hollow) */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      isCurrent
                        ? "bg-blue-600 text-white ring-4 ring-blue-500/25 scale-110 shadow-xs"
                        : isFilled
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-[var(--card)] border-2 border-slate-300 dark:border-slate-700 text-transparent"
                    }`}
                  >
                    {isFilled ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-white" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700 opacity-60" />
                    )}
                  </div>
                  <span
                    className={`mt-2 text-[11px] sm:text-xs font-semibold transition-colors ${
                      isCurrent
                        ? "text-blue-600 dark:text-blue-400 font-bold"
                        : isFilled
                        ? "text-[var(--text-primary)]"
                        : "text-[var(--text-muted)]"
                    }`}
                  >
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Footer (Spec Section 4: [View Goal] + Section 16 Actions) */}
      <div className="mt-6 pt-5 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <button
            onClick={onViewGoal}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 rounded-lg py-1 px-1.5"
          >
            <Eye size={14} />
            <span>View Goal</span>
          </button>

          {onSeeEvidence && (
            <button
              onClick={onSeeEvidence}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 rounded py-1 px-1"
            >
              See supporting evidence ({goal.supportingEvidence?.length || 0})
            </button>
          )}
        </div>

        {/* Section 16 Direct Actions: Pause / Mark Achieved */}
        <div className="flex items-center gap-2">
          {onToggleStatus && goal.status !== "Achieved" && (
            <>
              {goal.status !== "Paused" ? (
                <button
                  onClick={() => onToggleStatus("Paused")}
                  className="px-2.5 py-1 rounded-lg border border-[var(--border)] text-[11px] font-semibold text-[var(--text-secondary)] hover:text-amber-500 hover:border-amber-500/40 transition-colors"
                >
                  Pause Goal
                </button>
              ) : (
                <button
                  onClick={() => onToggleStatus("Active")}
                  className="px-2.5 py-1 rounded-lg border border-emerald-500/30 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors"
                >
                  Resume Goal
                </button>
              )}

              <button
                onClick={() => onToggleStatus("Achieved")}
                className="px-2.5 py-1 rounded-lg border border-purple-500/30 text-[11px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 transition-colors"
              >
                Mark Achieved
              </button>
            </>
          )}

          <span className="text-xs text-[var(--text-muted)] hidden sm:inline ml-2">
            {completedMilestones.length} of {milestones.length} milestones cleared
          </span>
        </div>
      </div>
    </div>
  );
}

