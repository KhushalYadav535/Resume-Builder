"use client";

import { useState } from "react";
import { Sparkles, HelpCircle, ArrowRight, Clock, CheckCircle2, X } from "lucide-react";
import { CareerGap } from "@/app/api/value/detect-gaps/route";

interface ImpactNudgeCardProps {
  gap: CareerGap;
  onAnswerNow: () => void;
  onDismiss?: () => void;
}

export default function ImpactNudgeCard({
  gap,
  onAnswerNow,
  onDismiss,
}: ImpactNudgeCardProps) {
  const [snoozed, setSnoozed] = useState(false);

  if (snoozed) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/15 via-[var(--card)] to-amber-500/5 border border-amber-500/30 p-6 sm:p-7 shadow-sm transition-all duration-300 hover:border-amber-500/50 hover:shadow-md animate-in fade-in">
      {/* Ambient Glow Orb */}
      <div className="absolute top-0 right-10 w-56 h-56 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 relative z-10">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/25 to-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            <Sparkles size={20} />
          </div>

          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 inline-flex items-center gap-1.5 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                UpRole Insight · Priority Question
              </span>
              <span className="text-xs font-semibold text-[var(--text-muted)]">
                {gap.recordSubtitle} · {gap.recordTitle}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] font-['Syne',sans-serif] tracking-tight">
              {gap.promptTitle}
            </h3>

            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {gap.promptContext}
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs text-[var(--text-muted)] flex-wrap">
              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                <HelpCircle size={12} className="shrink-0" />
                <span>Why this matters:</span>
              </span>
              <span>{gap.whyAsking}</span>
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-3 sm:self-center shrink-0">
          <button
            onClick={() => {
              setSnoozed(true);
              onDismiss?.();
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] border border-[var(--border)] transition-colors cursor-pointer"
          >
            Later
          </button>

          <button
            onClick={onAnswerNow}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-brand-navy bg-amber-500 hover:bg-amber-400 transition-all shadow-md shadow-amber-500/25 active:scale-[0.98] cursor-pointer"
          >
            <span>Answer now</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
