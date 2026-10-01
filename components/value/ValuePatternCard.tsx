"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight, Quote, ShieldCheck, Copy, Check } from "lucide-react";
import { CareerInterpretation } from "@/types/value";

interface ValuePatternCardProps {
  pattern: CareerInterpretation | null;
  onWhyWeSayThis: (pattern: CareerInterpretation) => void;
}

export default function ValuePatternCard({
  pattern,
  onWhyWeSayThis,
}: ValuePatternCardProps) {
  const [copied, setCopied] = useState(false);

  if (!pattern) return null;

  const evidenceCount = pattern.supportingEvidence?.length ?? 0;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${pattern.title} — ${pattern.description}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section id="value-pattern" aria-label="Your value pattern" className="value-anchor relative rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-[0_6px_24px_rgba(16,27,59,0.04)] overflow-hidden">
      {/* 2px Crown hairline */}
      <div className="h-[2px] w-full bg-gradient-to-r from-amber-500 via-amber-400/80 to-violet-500/60" aria-hidden="true" />
      <span className="value-ghost absolute top-2 right-4 text-[4rem]" aria-hidden="true">02</span>

      <div className="p-5 sm:p-6 space-y-4 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner shrink-0">
              <Sparkles size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10.5px] font-black uppercase tracking-[0.16em] text-amber-700 dark:text-amber-400 font-['Syne',sans-serif]">
                  YOUR VALUE PATTERN
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/25">
                  AI Synthesis
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)] font-['Syne',sans-serif]">
                Recurring Career Value Pattern
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer shadow-2xs"
              title="Copy pattern statement"
            >
              {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
            <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-300 text-[11px] font-bold">
              {evidenceCount} evidence cluster{evidenceCount === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        {/* Statement quote box */}
        <div className="relative rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5 overflow-hidden">
          <div className="flex items-start gap-3">
            <span className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
              <Quote size={15} />
            </span>
            <div className="space-y-1 min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] font-['Syne',sans-serif] leading-snug">
                {pattern.title}
              </h3>
              <p className="text-xs sm:text-[13px] text-[var(--text-secondary)] leading-relaxed italic">
                “{pattern.description}”
              </p>
            </div>
          </div>

          {/* Footer inside quote */}
          <div className="mt-3.5 pt-3 border-t border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
              <span className="text-[11.5px]">
                Confidence: <strong className="text-[var(--text-primary)]">{pattern.confidence}</strong> · Status: {pattern.status}
              </span>
            </div>

            <button
              onClick={() => onWhyWeSayThis(pattern)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-brand-navy bg-amber-500 hover:bg-amber-400 shadow-xs hover:shadow-sm transition-all cursor-pointer shrink-0"
            >
              <span>Why do we say this?</span>
              <ArrowRight size={13} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
