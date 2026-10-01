"use client";

import { motion } from "framer-motion";
import {
  Target,
  Clock,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { CareerGoalData } from "./types";
import { handleSpotMove } from "./pulseSpot";

interface Props {
  goal: CareerGoalData | null;
  onSelectGoalType?: (goalTitle: string) => void;
  forceExpand?: boolean;
}

export default function CareerGoalCard({
  goal,
  onSelectGoalType,
}: Props) {
  const goalOptions = [
    { label: "Get Promoted", hint: "Vertical progression" },
    { label: "Change Role", hint: "Strategic lateral pivot" },
  ];

  const handleOptionClick = (e: React.MouseEvent, label: string) => {
    e.preventDefault();
    e.stopPropagation();
    onSelectGoalType?.(label);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleSpotMove}
      className="value-spot group relative rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--card)] text-[var(--text-primary)] p-4 sm:p-5 shadow-xs hover:border-rose-500/40 hover:shadow-[0_14px_40px_rgba(244,63,94,0.12)] transition-all duration-300 flex flex-col justify-between h-full min-h-[230px]"
    >
      {/* rose crown hairline + ghost chapter numeral */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-rose-500 via-amber-400/80 to-transparent z-20" aria-hidden="true" />
      <span className="value-ghost absolute top-2 right-4 text-[3.8rem] leading-none z-0" aria-hidden="true">06</span>

      <div className="relative z-10 flex flex-col h-full justify-between">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-inner">
              <Target className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[10.5px] font-black uppercase tracking-[0.16em] text-rose-700 dark:text-rose-400 font-['Syne',sans-serif]">
                CAREER GOAL
              </span>
            </div>
          </div>

          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 shrink-0">
            {goal ? goal.status : "Set Goal"}
          </span>
        </div>

        {/* Bite-sized Goal Content */}
        <div className="my-auto space-y-1.5 py-1">
          {goal ? (
            <>
              <div className="flex items-center justify-between gap-1 text-[10.5px] text-amber-700 dark:text-amber-300 font-semibold">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-500" />
                  <span>{goal.timeframe}</span>
                </span>
                <span>Step {goal.currentMilestoneIndex} of {goal.milestones.length}</span>
              </div>

              <h3 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] font-['Syne',sans-serif] leading-tight line-clamp-1">
                {goal.title}
              </h3>

              {/* Progress Milestones Stepper Mini */}
              <div className="grid grid-cols-4 gap-1 py-0.5">
                {goal.milestones.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all ${
                      idx < goal.currentMilestoneIndex
                        ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                        : idx === goal.currentMilestoneIndex
                        ? "bg-amber-500/40 animate-pulse"
                        : "bg-[var(--border)]"
                    }`}
                  />
                ))}
              </div>

              <p className="text-[11.5px] text-[var(--text-secondary)] line-clamp-1 leading-relaxed">
                <span className="font-semibold text-amber-700 dark:text-amber-300">Next: </span>
                {goal.nextMilestone}
              </p>
            </>
          ) : (
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-[var(--text-primary)]">Select near-term objective:</p>
              <div className="grid grid-cols-2 gap-1.5">
                {goalOptions.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={(e) => handleOptionClick(e, opt.label)}
                    className="p-1.5 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-left text-[11px] font-bold text-[var(--text-primary)] flex items-center justify-between cursor-pointer"
                  >
                    <span>{opt.label}</span>
                    <ArrowRight className="w-2.5 h-2.5 text-amber-500" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2.5 mt-2 border-t border-[var(--border)] flex items-center justify-between gap-2 text-xs">
          <span className="text-[11px] text-[var(--text-muted)] font-medium truncate">
            Target &amp; Milestones
          </span>

          <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-rose-600 dark:text-rose-400 shrink-0 group-hover:underline">
            <span>Details</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </motion.div>
  );
}
