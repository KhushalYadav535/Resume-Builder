"use client";

import React from "react";
import { GoalMilestone } from "@/types/momentum";
import { Award, Check, Eye, BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";

interface GoalProgressCardProps {
  milestones: GoalMilestone[];
  onToggleMilestone: (milestoneId: string) => void;
  onViewProgress: () => void;
}

export default function GoalProgressCard({
  milestones,
  onToggleMilestone,
  onViewProgress,
}: GoalProgressCardProps) {
  const completedCount = (milestones || []).filter((m) => m.completed).length;

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 sm:p-7 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
          <Award size={15} />
          <span>Progress Toward Goal</span>
          <span className="text-[var(--text-muted)] lowercase font-normal hidden sm:inline">
            · &ldquo;Am I getting closer?&rdquo;
          </span>
        </div>

        {/* Link to Career Loop */}
        <Link
          href="/career-journal"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--text-muted)] hover:text-amber-500 transition-colors"
        >
          <BookOpen size={12} />
          <span>Career Loop Sync</span>
          <ArrowRight size={10} />
        </Link>
      </div>

      {/* Canonical headline from Spec Section 4 */}
      <div className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-4">
        {completedCount} meaningful milestone{completedCount === 1 ? "" : "s"} completed
      </div>

      {/* Milestone List with ARIA and keyboard accessibility */}
      <div className="space-y-2.5">
        {(milestones || []).slice(0, 4).map((milestone) => (
          <div
            key={milestone.id}
            role="checkbox"
            aria-checked={milestone.completed}
            tabIndex={0}
            onClick={() => onToggleMilestone(milestone.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onToggleMilestone(milestone.id);
              }
            }}
            className={`flex items-center gap-3.5 p-3 sm:p-3.5 rounded-xl border cursor-pointer select-none transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 ${
              milestone.completed
                ? "bg-teal-500/5 border-teal-500/30 text-[var(--text-primary)]"
                : "bg-[var(--bg-elevated)] border-[var(--border)] hover:border-slate-300 dark:hover:border-slate-700 text-[var(--text-secondary)] opacity-85"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-xs font-bold transition-all ${
                milestone.completed
                  ? "bg-teal-600 text-white shadow-xs"
                  : "border border-slate-400 dark:border-slate-600 hover:border-teal-500 bg-white dark:bg-black/20"
              }`}
            >
              {milestone.completed ? (
                <Check size={13} strokeWidth={3} />
              ) : null}
            </div>

            <div className="flex-1 min-w-0">
              <span
                className={`text-xs sm:text-sm font-semibold transition-colors ${
                  milestone.completed
                    ? "text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)]"
                }`}
              >
                {milestone.completed ? "✓ " : "○ "}
                {milestone.title}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {milestone.sourceType && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 font-medium hidden md:inline">
                  {milestone.sourceType}
                </span>
              )}
              {milestone.stage && (
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-200/50 dark:bg-white/5 text-[var(--text-muted)]">
                  {milestone.stage}
                </span>
              )}
            </div>
          </div>
        ))}

        {(milestones || []).length > 4 && (
          <div className="text-xs text-[var(--text-muted)] text-center py-1">
            +{(milestones || []).length - 4} more strategic milestones in sequence
          </div>
        )}

        {(milestones || []).length === 0 && (
          <div className="p-4 rounded-xl border border-dashed border-[var(--border)] text-xs text-[var(--text-muted)] text-center">
            No milestones defined yet. Click &ldquo;View Progress&rdquo; to add your strategic milestones.
          </div>
        )}
      </div>

      {/* Footer Action (Spec Section 4: [View Progress]) */}
      <div className="mt-6 pt-5 border-t border-[var(--border)] flex items-center justify-between">
        <button
          onClick={onViewProgress}
          className="inline-flex items-center gap-2 text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 rounded-lg py-1 px-1.5"
        >
          <Eye size={14} />
          <span>View Progress</span>
        </button>

        <span className="text-[11px] text-[var(--text-muted)]">
          Click or press Space to mark cleared
        </span>
      </div>
    </div>
  );
}
