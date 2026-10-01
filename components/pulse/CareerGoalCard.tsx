"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Target,
  ArrowRight,
  Clock,
  CheckCircle2,
  Circle,
  Sparkles,
  ChevronRight,
  Flag,
} from "lucide-react";
import { CareerGoalData } from "./types";

interface Props {
  goal: CareerGoalData | null;
  onSelectGoalType?: (goalTitle: string) => void;
  forceExpand?: boolean;
}

export default function CareerGoalCard({
  goal,
  onSelectGoalType,
  forceExpand,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const expanded = forceExpand !== undefined ? forceExpand : isExpanded;

  const goalOptions = [
    { label: "Change Job", hint: "Move to a new company or role" },
    { label: "Get Promoted", hint: "Vertical transition in current track" },
    { label: "Increase Compensation", hint: "Target top decile benchmark" },
    { label: "Change Role", hint: "Strategic lateral pivot" },
    { label: "Change Industry", hint: "Translate capabilities to new sector" },
    { label: "Explore Career Options", hint: "Discover best-fit trajectories" },
    { label: "Other", hint: "Define a custom career objective" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-gradient-to-br dark:from-[#101736] dark:via-[#141F48] dark:to-[#0D132D] text-[var(--text-primary)] p-5 sm:p-6 shadow-[0_4px_20px_rgba(16,27,59,0.05)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.55)] flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-400/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-amber-700 dark:text-amber-400 font-['Syne',sans-serif]">
                CAREER GOAL
              </span>
              <p className="text-[11.5px] text-[var(--text-muted)] font-medium">
                Desired outcome · Progress/milestone
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-400/10 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-400/20">
              Active Focus
            </span>
            {goal && (
              <button
                type="button"
                onClick={() => setIsExpanded(!expanded)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/15 text-[11px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer shadow-2xs"
              >
                <span>{expanded ? "Collapse" : "Expand"}</span>
                <span className="text-[9px]">{expanded ? "▴" : "▾"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {goal ? (
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-2.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300 font-bold">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Timeframe: {goal.timeframe}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-400/30 text-amber-700 dark:text-amber-300">
                  {goal.status}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)] font-['Syne',sans-serif] leading-tight">
                {goal.title}
              </h3>

              {/* Progress Milestones Stepper */}
              <div className="pt-2 border-t border-slate-200 dark:border-white/10 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  <span>Milestone Progression</span>
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">
                    Step {goal.currentMilestoneIndex} of {goal.milestones.length}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {goal.milestones.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all ${
                        idx < goal.currentMilestoneIndex
                          ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                          : idx === goal.currentMilestoneIndex
                          ? "bg-amber-500/40 animate-pulse"
                          : "bg-slate-200 dark:bg-white/10"
                      }`}
                    />
                  ))}
                </div>

                <div className="p-2.5 rounded-lg bg-amber-50/90 dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-400/20 text-xs">
                  <span className="font-bold text-amber-800 dark:text-amber-300">Next Milestone: </span>
                  <span className="text-[var(--text-secondary)]">{goal.nextMilestone}</span>
                </div>

                {/* Expanded view: full list of milestone steps */}
                {expanded && (
                  <div className="pt-2 space-y-1.5 animate-fadeIn">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      All Milestones:
                    </div>
                    {goal.milestones.map((ms, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs text-[var(--text-secondary)]"
                      >
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            idx < goal.currentMilestoneIndex
                              ? "bg-amber-500 text-white"
                              : idx === goal.currentMilestoneIndex
                              ? "border-2 border-amber-500 text-amber-600 dark:text-amber-400"
                              : "border border-slate-300 dark:border-white/20 text-slate-400"
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span className={idx < goal.currentMilestoneIndex ? "line-through opacity-70" : ""}>
                          {ms}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Empty state */
          <div className="space-y-2.5 p-4 rounded-xl bg-amber-50/70 dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-400/20">
            <div>
              <h4 className="text-sm font-bold text-[var(--text-primary)] font-['Syne',sans-serif]">
                What do you want next?
              </h4>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Select your near-term objective to calibrate recommendations:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
              {goalOptions.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => onSelectGoalType?.(opt.label)}
                  className="p-2.5 rounded-lg bg-white dark:bg-white/5 hover:bg-amber-50/80 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 hover:border-amber-500/40 text-left transition-all text-xs cursor-pointer group shadow-2xs hover:shadow-xs active:scale-[0.98]"
                >
                  <div className="font-bold text-[var(--text-primary)] group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors flex items-center justify-between">
                    <span>{opt.label}</span>
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-amber-500" />
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                    {opt.hint}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="pt-3 mt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs">
        <span className="text-[var(--text-muted)] text-[11px]">Goals &amp; Priorities</span>
        <Link
          href="/momentum#priorities"
          className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-bold hover:underline no-underline"
        >
          {goal ? "Manage Goal Strategy →" : "Define Goal Details →"}
        </Link>
      </div>
    </motion.div>
  );
}
