"use client";

import React from "react";
import { SuggestedDirection } from "@/types/momentum";
import { Compass, Sparkles, ArrowRight, PlusCircle } from "lucide-react";

interface EmptyMomentumStateProps {
  suggestedDirections: SuggestedDirection[];
  onExploreDirections: () => void;
  onSetCareerGoal: () => void;
  onSelectSuggestedDirection: (direction: SuggestedDirection) => void;
}

export default function EmptyMomentumState({
  suggestedDirections,
  onExploreDirections,
  onSetCareerGoal,
  onSelectSuggestedDirection,
}: EmptyMomentumStateProps) {
  const directionsList = suggestedDirections || [];

  return (
    <div className="space-y-8 py-6">
      {/* Psychologically Supportive Hero Block */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-gradient-to-b from-[var(--card)] to-[var(--bg-elevated)] p-8 sm:p-12 text-center shadow-sm">
        <div className="absolute top-0 right-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Compass size={14} className="animate-spin-slow text-amber-500" />
            <span>UpRole Career Agency</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] font-['Syne',sans-serif] tracking-tight">
            Where do you want to go?
          </h2>

          <p className="text-base sm:text-lg font-semibold text-[var(--text-primary)]">
            You already have a career story.
            <br />
            Now choose what you want that story to become.
          </p>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-xl mx-auto">
            Based on the career capital and experience you&apos;ve built so far, you can explore possible directions or define your own goal.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onExploreDirections}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[var(--bg-elevated)] border border-amber-500/40 text-xs sm:text-sm font-bold text-[var(--text-primary)] hover:border-amber-500 hover:bg-amber-500/10 transition-all shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <Compass size={16} className="text-amber-500" />
              <span>Explore Career Directions</span>
            </button>

            <button
              onClick={onSetCareerGoal}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 text-brand-navy text-xs sm:text-sm font-extrabold hover:bg-amber-400 transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <PlusCircle size={16} />
              <span>Set My Career Goal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Suggested Directions from Career Value */}
      {directionsList.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                <Sparkles size={14} />
                <span>Possible Directions Based on Your Experience</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                These remain possibilities derived from your Career Value, not recommendations presented as fact.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {directionsList.map((item) => (
              <div
                key={item.id}
                className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-amber-500/50 shadow-xs transition-all flex flex-col justify-between group"
              >
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {item.title}
                  </h3>

                  <div className="mt-2 text-xs font-mono text-amber-600 dark:text-amber-400 bg-amber-500/5 px-2.5 py-1 rounded-lg border border-amber-500/15">
                    {item.trajectory}
                  </div>

                  <p className="mt-3 text-xs text-[var(--text-secondary)] leading-relaxed">
                    {item.rationale}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--border)]">
                  <button
                    onClick={() => onSelectSuggestedDirection(item)}
                    className="inline-flex items-center justify-between w-full text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:text-amber-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded p-1"
                  >
                    <span>Adopt this direction</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
