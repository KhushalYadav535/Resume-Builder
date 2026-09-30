"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  HelpCircle,
  RotateCw,
  Zap,
  Target,
  FileCheck,
} from "lucide-react";
import { NextBestActionData, AiTraceabilityContext } from "./types";

interface Props {
  action: NextBestActionData;
  onOpenExplain: (ctx: AiTraceabilityContext) => void;
  onOpenCaptureModal?: () => void;
  onComplete?: () => void;
  onDismiss?: () => void;
}

export default function NextBestActionCard({
  action,
  onOpenExplain,
  onOpenCaptureModal,
  onComplete,
  onDismiss,
}: Props) {
  const [completed, setCompleted] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const handleExplainClick = () => {
    onOpenExplain({
      componentTitle: "Next Best Action Synthesis",
      claim: `Priority Recommendation: "${action.title}"`,
      confidence: "Calibrated to Target Role Readiness",
      reasoning: [
        action.reason,
        action.goalRelevance,
        "Derived from Career Value gaps and verified historical trajectory.",
        "Zero arbitrary task lists — specifically designed to increase interview and committee conversion.",
      ],
      evidenceSources: [
        {
          title: "Career Goal Alignment",
          type: "Goal Benchmark",
          snippet: action.goalRelevance,
        },
        {
          title: "Identified Evidence Gap",
          type: "Evidence Audit",
          snippet: action.reason,
        },
      ],
    });
  };

  const handleCtaClick = (e: React.MouseEvent) => {
    // If the action is evidence/capture focused and we have a capture modal, open it directly
    if (
      onOpenCaptureModal &&
      (action.actionType === "evidence" ||
        action.ctaLink === "/career-journal" ||
        action.cta.toLowerCase().includes("capture") ||
        action.cta.toLowerCase().includes("log"))
    ) {
      e.preventDefault();
      onOpenCaptureModal();
    }
  };

  if (dismissed) {
    return (
      <div className="rounded-3xl p-6 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-3">
        <span>Recommendation dismissed.</span>
        <button
          onClick={() => setDismissed(false)}
          className="text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer"
        >
          Restore recommendation
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-3xl overflow-hidden border-2 border-amber-500/40 dark:border-amber-400/35 bg-gradient-to-br from-[#FFFBEB] via-[#FEF3C7]/40 to-[#FFF7ED] dark:from-[#121B38] dark:via-[#172554] dark:to-[#0E1736] text-[var(--text-primary)] p-7 sm:p-8 shadow-[0_8px_32px_rgba(245,158,11,0.18)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.7)] flex flex-col justify-between"
    >
      {/* High-priority ambient golden aura */}
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-gradient-to-br from-amber-500/15 dark:from-amber-500/20 via-orange-500/10 to-transparent blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-blue-600/5 dark:bg-blue-600/15 blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">
        {/* Top Header Strip */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
            </span>
            <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-[0.18em] bg-amber-500/15 dark:bg-amber-500/20 border border-amber-500/30 dark:border-amber-400/40 text-amber-800 dark:text-amber-300 font-['Syne',sans-serif]">
              ⚡ Next Best Action
            </span>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 dark:bg-white/10 text-amber-900 dark:text-amber-300 border border-amber-400/30">
              Priority Focus
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExplainClick}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-amber-200 dark:border-white/15 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer shadow-2xs hover:scale-105"
              title="Inspect why this action is recommended"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-medium">Why this?</span>
            </button>
          </div>
        </div>

        {/* Action Title */}
        <div className="space-y-3 mb-6">
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] font-['Syne',sans-serif] leading-tight">
            {completed ? (
              <span className="line-through text-slate-400 dark:text-slate-500">
                {action.title}
              </span>
            ) : (
              action.title
            )}
          </h2>

          {completed ? (
            /* Celebratory Completed Feedback State */
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-2xl bg-emerald-500/15 dark:bg-emerald-500/20 border border-emerald-400/40 text-emerald-900 dark:text-emerald-200 flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-emerald-800 dark:text-emerald-300">
                  Action Completed! 🎉
                </div>
                <div className="text-emerald-700 dark:text-emerald-400 mt-0.5">
                  Great job advancing your career readiness. Momentum score updated.
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="p-4 rounded-2xl bg-white/90 dark:bg-white/[0.04] border border-amber-200/80 dark:border-white/10 shadow-xs space-y-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                  Context &amp; Trigger
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {action.reason}
                </p>
              </div>

              <div className="pt-2.5 border-t border-amber-200/50 dark:border-white/10">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-amber-500" />
                  <span>Why this matters for your Goal</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                  {action.goalRelevance}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="relative z-10 pt-4 border-t border-amber-200/60 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              const nextState = !completed;
              setCompleted(nextState);
              if (nextState) onComplete?.();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              completed
                ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-800 dark:text-emerald-300"
                : "bg-white/80 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border-slate-200 dark:border-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${completed ? "text-emerald-500" : "text-slate-400"}`} />
            <span>{completed ? "Completed ✓" : "Mark as Done"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setDismissed(true);
              onDismiss?.();
            }}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] font-medium hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>

        <Link
          href={action.ctaLink || "/value"}
          onClick={handleCtaClick}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-brand-navy font-black text-sm shadow-[0_4px_24px_rgba(245,158,11,0.4)] hover:shadow-[0_6px_28px_rgba(245,158,11,0.55)] transition-all no-underline transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
        >
          <span>{action.cta}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}
