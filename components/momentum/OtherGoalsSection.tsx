"use client";

import React from "react";
import { CareerGoal, GoalStatus } from "@/types/momentum";
import { Plus, Clock, ArrowUpRight, Archive, Pause, Play, Award } from "lucide-react";

interface OtherGoalsSectionProps {
  otherGoals: CareerGoal[];
  onAddGoal: () => void;
  onSetAsPrimary: (goalId: string) => void;
  onSelectGoal?: (goal: CareerGoal) => void;
  onArchiveGoal?: (goalId: string) => void;
  onUpdateGoalStatus?: (goalId: string, status: GoalStatus) => void;
}

export default function OtherGoalsSection({
  otherGoals,
  onAddGoal,
  onSetAsPrimary,
  onSelectGoal,
  onArchiveGoal,
  onUpdateGoalStatus,
}: OtherGoalsSectionProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25";
      case "Exploring":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25";
      case "Paused":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25";
      case "Achieved":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25";
      default:
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/25";
    }
  };

  const activeSecondaryGoals = (otherGoals || []).filter(
    (g) => !g.isPrimary && g.status !== "Archived"
  );

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-[var(--text-primary)] font-['Syne',sans-serif]">
            Other Career Goals
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            Secondary career objectives being tracked or explored alongside your primary target.
          </p>
        </div>

        <button
          onClick={onAddGoal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 text-brand-navy font-bold text-xs hover:bg-amber-400 transition-all shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          <Plus size={14} />
          <span>Add Career Goal</span>
        </button>
      </div>

      {/* Grid of Other Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeSecondaryGoals.map((goal) => {
          const completedMilestones = (goal.milestones || []).filter((m) => m.completed).length;
          const totalMilestones = (goal.milestones || []).length;

          return (
            <div
              key={goal.id}
              className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    {goal.goalType}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getStatusBadge(
                      goal.status
                    )}`}
                  >
                    {goal.status}
                  </span>
                </div>

                <h4 className="text-base font-bold text-[var(--text-primary)]">
                  {goal.title}
                </h4>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)]">
                  {goal.targetHorizon && (
                    <span className="flex items-center gap-1">
                      <Clock size={12} className="text-amber-500 shrink-0" />
                      <span>{goal.targetHorizon}</span>
                    </span>
                  )}
                  {goal.targetRole && (
                    <span className="truncate">
                      Target: <strong>{goal.targetRole}</strong>
                    </span>
                  )}
                  {totalMilestones > 0 && (
                    <span className="text-[11px] text-[var(--text-muted)]">
                      • {completedMilestones}/{totalMilestones} milestones
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={() => onSetAsPrimary(goal.id)}
                  className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500 rounded"
                >
                  Set as Primary
                </button>

                <div className="flex items-center gap-2">
                  {onUpdateGoalStatus && goal.status !== "Achieved" && (
                    <>
                      {goal.status !== "Paused" ? (
                        <button
                          onClick={() => onUpdateGoalStatus(goal.id, "Paused")}
                          className="text-[11px] px-2 py-0.5 rounded border border-[var(--border)] text-[var(--text-muted)] hover:text-amber-500"
                          title="Pause Goal"
                        >
                          Pause
                        </button>
                      ) : (
                        <button
                          onClick={() => onUpdateGoalStatus(goal.id, "Active")}
                          className="text-[11px] px-2 py-0.5 rounded border border-emerald-500/30 text-emerald-500 bg-emerald-500/10"
                          title="Resume Goal"
                        >
                          Resume
                        </button>
                      )}
                      <button
                        onClick={() => onUpdateGoalStatus(goal.id, "Achieved")}
                        className="text-[11px] px-2 py-0.5 rounded border border-purple-500/30 text-purple-500 bg-purple-500/10"
                        title="Mark Achieved"
                      >
                        Achieved
                      </button>
                    </>
                  )}

                  {onSelectGoal && (
                    <button
                      onClick={() => onSelectGoal(goal)}
                      className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500 rounded p-1"
                    >
                      <span>Details</span>
                      <ArrowUpRight size={12} />
                    </button>
                  )}

                  {onArchiveGoal && (
                    <button
                      onClick={() => onArchiveGoal(goal.id)}
                      className="text-xs text-[var(--text-muted)] hover:text-red-500 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500 rounded p-1"
                      title="Archive this goal"
                      aria-label={`Archive goal ${goal.title}`}
                    >
                      <Archive size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {activeSecondaryGoals.length === 0 && (
          <div className="col-span-full p-8 rounded-2xl border border-dashed border-[var(--border)] text-center">
            <p className="text-xs text-[var(--text-muted)]">
              No secondary goals yet. You can maintain multiple secondary objectives to keep alternative paths visible.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
