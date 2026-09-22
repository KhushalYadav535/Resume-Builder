"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, Brain, CheckCircle2, Award, ChevronRight } from "lucide-react";
import Link from "next/link";
import { CapabilityHypothesis } from "@/app/api/value/derive-profile/route";

interface DerivationNudgeCardProps {
  unreviewedCapabilities: CapabilityHypothesis[];
  onReviewNow: (capability: CapabilityHypothesis) => void;
  onDismiss?: () => void;
}

export default function DerivationNudgeCard({
  unreviewedCapabilities,
  onReviewNow,
  onDismiss,
}: DerivationNudgeCardProps) {
  const [snoozed, setSnoozed] = useState(false);

  if (snoozed || unreviewedCapabilities.length === 0) return null;

  const firstCap = unreviewedCapabilities[0];
  const count = unreviewedCapabilities.length;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600/15 via-[var(--card)] to-indigo-500/5 border border-violet-500/30 p-6 sm:p-7 shadow-sm transition-all duration-300 hover:border-violet-500/50 hover:shadow-md animate-in fade-in">
      {/* Ambient Glow Orb */}
      <div className="absolute top-0 right-10 w-56 h-56 bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 relative z-10">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/25 to-violet-500/10 border border-violet-500/30 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            <Brain size={20} />
          </div>

          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-700 dark:text-violet-300 border border-violet-500/30 inline-flex items-center gap-1.5 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                UpRole Synthesis · Value Derivation
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-mono">
                {count} {count === 1 ? "hypothesis" : "hypotheses"} ready for review
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] font-['Syne',sans-serif] tracking-tight">
              Synthesized capabilities discovered in your career record
            </h3>

            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Based on your experiences, projects, and evidence, UpRole has identified{" "}
              <strong className="text-[var(--text-primary)]">"{firstCap.name}"</strong>{" "}
              {count > 1 ? `and ${count - 1} other capability hypotheses` : ""}.
              Confirm them to substantiate your executive positioning.
            </p>

            <div className="pt-2 flex items-center gap-3 text-xs text-[var(--text-muted)] flex-wrap">
              <span className="inline-flex items-center gap-1.5 bg-violet-500/10 px-2.5 py-1 rounded-lg border border-violet-500/20 text-violet-600 dark:text-violet-400 font-semibold">
                <Brain size={13} />
                <span>Confidence: {firstCap.confidence}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 bg-[var(--bg-elevated)] px-2.5 py-1 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] font-medium">
                <Award size={13} className="text-indigo-500" />
                <span>{firstCap.supportingEvidence.length} supporting {firstCap.supportingEvidence.length === 1 ? "fact" : "facts"}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-2.5 sm:self-center shrink-0 flex-wrap">
          <button
            onClick={() => {
              setSnoozed(true);
              onDismiss?.();
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] border border-[var(--border)] transition-colors cursor-pointer"
          >
            Later
          </button>

          <Link
            href="/value/profile"
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] border border-[var(--border)] transition-colors no-underline shadow-xs"
          >
            View Profile
          </Link>

          <button
            onClick={() => onReviewNow(firstCap)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-white bg-violet-600 hover:bg-violet-500 transition-all shadow-md shadow-violet-600/25 active:scale-[0.98] cursor-pointer"
          >
            <span>Review now</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
