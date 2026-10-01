"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, RefreshCw, CheckCircle2, FileText, ArrowRight, Layers, ShieldCheck } from "lucide-react";
import { Resume } from "@/types";

interface ValueDashboardHeaderProps {
  resumes: Resume[];
  selectedResumeId: string;
  onSelectResume: (id: string) => void;
  onExploreValue: () => void;
  onReviewFacts: () => void;
  onRecalculate: () => void;
  recalculating: boolean;
  totalFactsCount?: number;
  confirmedFactsCount?: number;
  careerEventsCount?: number;
  evidenceItemsCount?: number;
}

export default function ValueDashboardHeader({
  resumes,
  selectedResumeId,
  onSelectResume,
  onExploreValue,
  onReviewFacts,
  onRecalculate,
  recalculating,
  totalFactsCount = 0,
  confirmedFactsCount = 0,
  careerEventsCount = 0,
  evidenceItemsCount = 0,
}: ValueDashboardHeaderProps) {
  const dynamicSubtitle =
    confirmedFactsCount > 0
      ? `Based on your ${confirmedFactsCount} confirmed facts, ${careerEventsCount} career events, and ${evidenceItemsCount} evidence links. Every capability and impact pattern is traceable to verified career facts.`
      : "Based on your career experience, evidence and progression. Every capability and impact pattern is traceable to verified career facts.";
  return (
    <section className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--card)] py-10 px-6 sm:px-8">
      {/* Luminous Brand Backing Glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[420px] h-[420px] bg-violet-500/10 rounded-full blur-[110px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-6">
        {/* Top telemetry pill */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <Sparkles size={13} className="text-amber-500" />
            <span>Career Value Engine · Evidence-Backed Derivation</span>
          </div>

          {/* Quick Actions & Resume Selector */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {resumes.length > 1 && (
              <div className="flex items-center gap-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-3 py-2 shadow-xs">
                <FileText size={14} className="text-amber-500" />
                <select
                  value={selectedResumeId}
                  onChange={(e) => onSelectResume(e.target.value)}
                  className="bg-transparent text-xs font-bold text-[var(--text-primary)] focus:outline-none cursor-pointer"
                  aria-label="Select Resume Source"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id} className="bg-[var(--card)] text-[var(--text-primary)]">
                      {r.file_name || "Untitled Resume"}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={onRecalculate}
              disabled={recalculating}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-amber-500/40 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              title="Recalculate Career Value from confirmed facts"
              aria-label="Recalculate Career Value from confirmed facts"
            >
              <RefreshCw size={13} className={recalculating ? "animate-spin text-amber-500" : ""} />
              <span>{recalculating ? "Deriving..." : "Recalculate"}</span>
            </button>
          </div>
        </div>

        {/* Main Title & Action Row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--text-primary)] font-['Syne',sans-serif]">
              Your Career <span className="text-amber-500 font-normal">Value</span>
            </h1>
            <p className="text-base sm:text-lg font-medium text-[var(--text-primary)]/90">
              Understand what your experience demonstrates.
            </p>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-2xl leading-relaxed">
              {dynamicSubtitle}
            </p>
          </div>

          {/* Primary & Secondary Actions (Spec Section 4.1) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onExploreValue}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black text-brand-navy bg-amber-500 hover:bg-amber-400 active:scale-[0.98] transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Sparkles size={16} strokeWidth={2.5} />
              <span>Explore Value</span>
              <ArrowRight size={14} strokeWidth={2.5} />
            </button>

            <button
              onClick={onReviewFacts}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] hover:border-amber-500/50 hover:bg-amber-500/5 transition-all shadow-xs cursor-pointer"
            >
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span>Review Facts</span>
              {totalFactsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  {confirmedFactsCount}/{totalFactsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
