"use client";

import React from "react";
import { CareerPriority } from "@/types/momentum";
import { SlidersHorizontal, Edit2 } from "lucide-react";

interface CareerPrioritiesCardProps {
  priorities: CareerPriority[];
  onEditPriorities: () => void;
}

export default function CareerPrioritiesCard({
  priorities,
  onEditPriorities,
}: CareerPrioritiesCardProps) {
  const selectedPriorities = priorities.filter((p) => p.selected);

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-slate-700">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <SlidersHorizontal size={14} />
            <span>Your Priorities</span>
            <span className="text-[var(--text-muted)] lowercase font-normal hidden sm:inline">
              · &ldquo;What matters to me?&rdquo;
            </span>
          </div>
          <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            {selectedPriorities.length} Active
          </span>
        </div>

        <p className="text-xs text-[var(--text-muted)] mb-3.5">
          What matters most to you right now in guiding this career transition:
        </p>

        {/* Selected Priorities Vertical Flow matching Wireframe */}
        <div className="space-y-2">
          {selectedPriorities.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-xs font-semibold text-[var(--text-primary)]"
            >
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>{item.label}</span>
                {item.importance === "high" && (
                  <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold">
                    High
                  </span>
                )}
              </div>
              {item.preference && (
                <span className="text-[11px] text-[var(--text-muted)] font-normal truncate max-w-[160px]">
                  {item.preference}
                </span>
              )}
            </div>
          ))}

          {selectedPriorities.length > 3 && (
            <div className="text-[11px] text-[var(--text-muted)] px-1">
              +{selectedPriorities.length - 3} more drivers selected
            </div>
          )}

          {selectedPriorities.length === 0 && (
            <div className="text-xs text-[var(--text-muted)] italic p-3 rounded-xl bg-[var(--bg-elevated)] border border-dashed border-[var(--border)]">
              No priorities selected yet. Click edit to choose what drives your career.
            </div>
          )}
        </div>
      </div>

      {/* Footer Call to Action */}
      <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center justify-between">
        <button
          onClick={onEditPriorities}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 rounded-lg py-1 px-1.5"
        >
          <Edit2 size={13} />
          <span>Edit priorities</span>
        </button>

        <span className="text-[11px] text-[var(--text-muted)]">
          Influences goal formation
        </span>
      </div>
    </div>
  );
}
