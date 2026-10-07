"use client";

import React, { useEffect } from "react";
import { SuggestedDirection } from "@/types/momentum";
import { X, Compass, ArrowRight } from "lucide-react";

interface ExploreDirectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  directions: SuggestedDirection[];
  onSelectDirection: (direction: SuggestedDirection) => void;
  selectedTitle?: string;
}

export default function ExploreDirectionsModal({
  isOpen,
  onClose,
  directions,
  onSelectDirection,
  selectedTitle,
}: ExploreDirectionsModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const directionsList = directions || [];

  return (
    <div
      className="fixed inset-0 z-[150] overflow-y-auto p-4 sm:p-6 flex items-center justify-center bg-black/75 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl my-auto bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pinned Header */}
        <div className="px-6 py-5 border-b border-[var(--border)] flex items-center justify-between shrink-0 bg-[var(--card)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Compass size={18} className="text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] font-['Syne',sans-serif] leading-tight">
                Explore Potential Career Directions
              </h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Suggested trajectories based on your verified achievements
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0 space-y-5">
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            These directions are derived from patterns in your verified achievements, domain leadership, and stated priorities. They represent possibilities for you to evaluate and adopt, not predetermined career paths.
          </p>

          {/* Directions List */}
          <div className="space-y-4">
            {directionsList.map((d) => {
              const isMatch = selectedTitle && d.title.toLowerCase().includes(selectedTitle.toLowerCase());
              return (
                <div
                  key={d.id}
                  className={`p-5 rounded-2xl bg-[var(--bg-elevated)] border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                    isMatch ? "border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/5" : "border-[var(--border)] hover:border-amber-500/40"
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-[var(--text-primary)] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {d.title}
                      </h4>
                      {isMatch && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
                          Recommended
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-mono text-amber-600 dark:text-amber-400">
                      {d.trajectory}
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {d.rationale}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      onSelectDirection(d);
                      onClose();
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 text-brand-navy font-bold text-xs hover:bg-amber-400 transition-all shrink-0 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                  >
                    <span>Adopt Direction</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              );
            })}

            {directionsList.length === 0 && (
              <div className="p-6 rounded-2xl border border-dashed border-[var(--border)] text-xs text-[var(--text-muted)] text-center">
                No suggested directions found. Build more career capital in Career Value to generate directions.
              </div>
            )}
          </div>
        </div>

        {/* Pinned Footer */}
        <div className="px-6 py-4 border-t border-[var(--border)] flex justify-end shrink-0 bg-[var(--card)]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
