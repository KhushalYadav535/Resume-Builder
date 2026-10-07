"use client";

import React from "react";
import { WhyThisGoal } from "@/types/momentum";
import { Sparkles, ArrowRight } from "lucide-react";

interface WhyThisGoalCardProps {
  whyThisGoal: WhyThisGoal | null;
  onSeeReasoning: () => void;
  onSeeEvidence?: () => void;
}

export default function WhyThisGoalCard({
  whyThisGoal,
  onSeeReasoning,
  onSeeEvidence,
}: WhyThisGoalCardProps) {
  const experienceFactors = whyThisGoal?.experienceFactors || [];
  const supportingEvidenceCount = whyThisGoal?.supportingEvidence?.length || 0;

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-slate-700">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            <Sparkles size={14} />
            <span>Why This Goal</span>
            <span className="text-[var(--text-muted)] lowercase font-normal hidden sm:inline">
              · &ldquo;Why does this matter?&rdquo;
            </span>
          </div>
          <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            Transparent AI
          </span>
        </div>

        {/* Dynamic Summary based on user experience & priorities */}
        <p className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] leading-relaxed">
          {whyThisGoal?.summary || "Based on your verified experience and stated priorities."}
        </p>

        {/* Key Reasoning Factors */}
        <div className="mt-3.5 space-y-2">
          {experienceFactors.slice(0, 2).map((factor, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)] leading-snug"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
              <span>{factor}</span>
            </div>
          ))}
          {experienceFactors.length === 0 && (
            <p className="text-xs text-[var(--text-muted)] italic">
              Goal formation verified against your current trajectory and career priorities.
            </p>
          )}
        </div>
      </div>

      {/* Footer Call to Action (Explicitly [See reasoning] from Section 4 & [See supporting evidence] from Section 8) */}
      <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center justify-between">
        <button
          onClick={onSeeReasoning}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 rounded-lg py-1 px-1.5"
        >
          <span>See reasoning</span>
          <ArrowRight size={13} />
        </button>

        <button
          onClick={onSeeEvidence || onSeeReasoning}
          className="text-[11px] text-[var(--text-muted)] hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
        >
          {supportingEvidenceCount} verified evidence signals
        </button>
      </div>
    </div>
  );
}
