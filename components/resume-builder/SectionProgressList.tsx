"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Clock, Sparkles } from "lucide-react";

export type SectionStatus = "not-started" | "in-progress" | "done";

export interface SectionProgressItem {
  id: string;
  label: string;
  status: SectionStatus;
  progressText?: string;
}

interface SectionProgressListProps {
  sections: SectionProgressItem[];
  activeSectionId?: string;
  onSectionClick?: (id: string) => void;
}

export function SectionProgressList({ sections, activeSectionId, onSectionClick }: SectionProgressListProps) {
  const completedCount = sections.filter((s) => s.status === "done").length;
  const progressPct = Math.round((completedCount / (sections.length || 1)) * 100);

  return (
    <div className="flex flex-col w-full bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 shadow-sm">
      {/* Header with Completion Percentage */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Sparkles size={14} className="text-amber-500" />
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)] font-['Syne',sans-serif] m-0">
            Progress
          </h3>
        </div>
        <span className="text-xs font-black text-amber-500 font-['Syne',sans-serif]">
          {progressPct}% Done
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-[var(--bg-3)] rounded-full overflow-hidden mb-3.5">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Section Items */}
      <div className="flex flex-col gap-1">
        {sections.map((section, idx) => {
          const isActive = section.id === activeSectionId;
          const isDone = section.status === "done";
          const isInProgress = section.status === "in-progress" || (isActive && !isDone);

          let StatusIcon = Circle;
          let iconColor = "text-[var(--text-muted)] opacity-60";

          if (isDone) {
            StatusIcon = CheckCircle2;
            iconColor = "text-emerald-500";
          } else if (isInProgress) {
            StatusIcon = Clock;
            iconColor = "text-amber-500";
          }

          return (
            <button
              type="button"
              key={section.id}
              onClick={() => onSectionClick?.(section.id)}
              className={cn(
                "flex items-center justify-between w-full py-2 px-2.5 rounded-xl transition-all text-left text-xs font-medium cursor-pointer border border-transparent",
                isActive
                  ? "bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/30 text-[var(--text-primary)] font-bold shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-2)]"
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <StatusIcon size={15} className={cn("shrink-0", iconColor)} />
                <span className="truncate">
                  {section.label}
                </span>
              </div>

              {section.progressText && (
                <span className={cn("text-[10px] font-semibold shrink-0 ml-2", isDone ? "text-emerald-500" : "text-[var(--text-muted)]")}>
                  {section.progressText}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
