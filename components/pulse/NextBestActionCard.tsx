"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  HelpCircle,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { NextBestActionData, AiTraceabilityContext } from "./types";
import { handleSpotMove } from "./pulseSpot";

interface Props {
  action: NextBestActionData;
  onOpenExplain: (ctx: AiTraceabilityContext) => void;
  onOpenCaptureModal?: () => void;
  onComplete?: () => void;
  onDismiss?: () => void;
  forceExpand?: boolean;
}

export default function NextBestActionCard({
  action,
  onOpenExplain,
  onOpenCaptureModal,
  onComplete,
}: Props) {
  const [completed, setCompleted] = useState(false);

  const handleExplainClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
    if (
      onOpenCaptureModal &&
      (action.actionType === "evidence" ||
        action.ctaLink === "/career-journal" ||
        action.cta.toLowerCase().includes("capture") ||
        action.cta.toLowerCase().includes("log"))
    ) {
      e.preventDefault();
      e.stopPropagation();
      onOpenCaptureModal();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleSpotMove}
      className="value-spot group relative rounded-2xl overflow-hidden border-2 border-amber-500/40 bg-[var(--card)] text-[var(--text-primary)] p-4 sm:p-5 shadow-xs hover:border-amber-500/60 hover:shadow-[0_14px_40px_rgba(245,158,11,0.18)] transition-all duration-300 flex flex-col justify-between h-full min-h-[230px]"
    >
      {/* flowing gold crown + ghost chapter numeral */}
      <div className="value-border-flow absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 z-20" aria-hidden="true" />
      <span className="value-ghost absolute top-2 right-4 text-[3.8rem] leading-none z-0" aria-hidden="true">07</span>
      
      {/* High-priority ambient golden aura */}
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-amber-500/[0.12] blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />

      <div className="relative z-10 flex flex-col h-full justify-between">
        {/* Header Strip */}
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
            </span>
            <div>
              <span className="text-[10.5px] font-black uppercase tracking-[0.16em] text-amber-800 dark:text-amber-300 font-['Syne',sans-serif]">
                NEXT BEST ACTION
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleExplainClick}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[10.5px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all cursor-pointer shadow-2xs"
              title="Inspect recommendation reasoning"
            >
              <HelpCircle className="w-3 h-3 text-amber-500" />
              <span className="font-medium">Why?</span>
            </button>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40 shrink-0">
              High Impact
            </span>
          </div>
        </div>

        {/* Bite-sized Action Content */}
        <div className="my-auto space-y-1.5 py-1">
          <h3 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] font-['Syne',sans-serif] leading-tight line-clamp-1">
            {action.title}
          </h3>

          <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
            {action.reason}
          </p>

          <div className="pt-0.5">
            <Link
              href={action.ctaLink || "/value"}
              onClick={handleCtaClick}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-brand-navy font-bold text-[11px] shadow-xs transition-all no-underline"
            >
              <span>{action.cta || "Take Action"}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2.5 mt-2 border-t border-[var(--border)] flex items-center justify-between gap-2 text-xs">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const next = !completed;
              setCompleted(next);
              if (next) onComplete?.();
            }}
            className="flex items-center gap-1 text-[11px] font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${completed ? "text-emerald-500" : "text-[var(--text-muted)]"}`} />
            <span>{completed ? "Completed" : "Mark done"}</span>
          </button>

          <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 shrink-0 group-hover:underline">
            <span>Details</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </motion.div>
  );
}
