"use client";

import React from "react";
import { Compass, Sparkles, ArrowRight, RefreshCw } from "lucide-react";

interface MomentumHeaderProps {
  isEmptyState: boolean;
  onToggleEmptyState?: () => void;
  onResetData?: () => void;
}

export default function MomentumHeader({
  isEmptyState,
  onToggleEmptyState,
  onResetData,
}: MomentumHeaderProps) {
  return (
    <section className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--card)] py-9 px-6 sm:px-8">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2.5">
              <Compass size={14} className="text-amber-500 animate-spin-slow" />
              <span>Career Direction & Agency · UpRole Foundation</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] font-['Syne',sans-serif]">
              Momentum
            </h1>
            <p className="mt-1.5 text-base sm:text-lg text-[var(--text-secondary)] font-medium">
              Where do you want your career to go?
            </p>
            <p className="mt-1 text-xs sm:text-sm text-[var(--text-muted)] max-w-2xl leading-relaxed">
              Convert your career priorities into clear direction and active goals. Move from{" "}
              <em className="text-[var(--text-primary)] not-italic font-semibold">&ldquo;career is happening to me&rdquo;</em> to{" "}
              <span className="text-amber-600 dark:text-amber-400 font-semibold">&ldquo;I choose what to do next.&rdquo;</span>
            </p>
          </div>

          {/* Quick controls / Agency indicator */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Agency: Active Choices</span>
            </div>

            {onToggleEmptyState && (
              <button
                onClick={onToggleEmptyState}
                className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                title="Toggle between populated dashboard and psychologically supportive empty state"
              >
                {isEmptyState ? "View Populated Dashboard" : "Preview New User State"}
              </button>
            )}

            {onResetData && (
              <button
                onClick={onResetData}
                className="p-2 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                title="Refresh with real profile data"
                aria-label="Refresh with real profile data"
              >
                <RefreshCw size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
