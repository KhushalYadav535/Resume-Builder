"use client";

import React from "react";
import { Sparkles, HelpCircle, ArrowRight, Quote, ShieldCheck } from "lucide-react";
import { CareerInterpretation } from "@/types/value";

interface ValuePatternCardProps {
  pattern: CareerInterpretation | null;
  onWhyWeSayThis: (pattern: CareerInterpretation) => void;
}

export default function ValuePatternCard({
  pattern,
  onWhyWeSayThis,
}: ValuePatternCardProps) {
  if (!pattern) return null;

  return (
    <div className="rounded-3xl bg-gradient-to-br from-amber-500/10 via-[var(--card)] to-[var(--bg-elevated)] border border-amber-500/30 p-6 sm:p-8 space-y-5 shadow-sm relative overflow-hidden">
      {/* Decorative Brand Glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">
              Area 2 · AI Synthesis
            </div>
            <h2 className="text-lg sm:text-xl font-black text-[var(--text-primary)] font-['Syne',sans-serif]">
              Your Value Pattern
            </h2>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold self-start sm:self-auto">
          <span>AI Pattern Synthesis · Evidence Grounded</span>
        </div>
      </div>

      {/* Pattern Statement Quote Box */}
      <div className="relative z-10 bg-[var(--card)]/90 backdrop-blur-md rounded-2xl border border-[var(--border)] p-5 sm:p-6 space-y-3">
        <div className="flex items-start gap-3">
          <Quote className="text-amber-500 shrink-0 mt-1 opacity-70" size={24} />
          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)] leading-snug">
              {pattern.title}
            </h3>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed italic">
              &ldquo;{pattern.description}&rdquo;
            </p>
          </div>
        </div>

        {/* Traceability Trigger (Spec Section 7.1) */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[var(--border)]">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>
              {pattern.supportingEvidence && pattern.supportingEvidence.length > 0
                ? `Traceable to ${pattern.supportingEvidence.length} evidence cluster${pattern.supportingEvidence.length === 1 ? "" : "s"} & verified career facts`
                : "Traceable to verified career facts"}
            </span>
          </div>

          <button
            onClick={() => onWhyWeSayThis(pattern)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 hover:border-amber-500/50 transition-all cursor-pointer group"
          >
            <span>Why do we say this?</span>
            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
