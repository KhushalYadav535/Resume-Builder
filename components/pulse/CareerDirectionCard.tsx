"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Compass,
  ArrowRight,
  Sparkles,
  HelpCircle,
  TrendingUp,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { CareerDirectionData, AiTraceabilityContext } from "./types";

interface Props {
  direction: CareerDirectionData | null;
  onOpenExplain: (ctx: AiTraceabilityContext) => void;
  forceExpand?: boolean;
}

export default function CareerDirectionCard({
  direction,
  onOpenExplain,
  forceExpand,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const expanded = forceExpand !== undefined ? forceExpand : isExpanded;

  const handleExplainClick = () => {
    if (!direction) return;
    onOpenExplain({
      componentTitle: "Career Direction Trajectory",
      claim: `Emergent trajectory toward "${direction.title}" based on current capability cluster.`,
      confidence: direction.confidence,
      reasoning: [
        "Trajectory is an emergent pattern from your experience, distinct from a conscious goal.",
        "Your capabilities heavily cluster around strategy, high-leverage team governance, and SaaS architecture.",
        "Market telemetry shows strong demand calibration for this profile.",
      ],
      evidenceSources: direction.evidence.map((ev, idx) => ({
        title: `Supporting Signal #${idx + 1}`,
        type: "Trajectory Evidence",
        snippet: ev,
      })),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-gradient-to-br dark:from-[#0E1A3D] dark:via-[#122252] dark:to-[#0A1430] text-[var(--text-primary)] p-5 sm:p-6 shadow-[0_4px_20px_rgba(16,27,59,0.05)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.55)] flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-400/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-[0.16em] text-blue-700 dark:text-blue-400 font-['Syne',sans-serif]">
                  CAREER DIRECTION
                </span>
              </div>
              <p className="text-[11.5px] text-[var(--text-muted)] font-medium">
                Current direction
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {direction && (
              <>
                <button
                  type="button"
                  onClick={handleExplainClick}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/15 text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer shadow-2xs"
                  title="Inspect why this direction is identified"
                >
                  <HelpCircle className="w-3 h-3 text-blue-500" />
                  <span className="hidden sm:inline font-medium">Why?</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsExpanded(!expanded)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/15 text-[11px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer shadow-2xs"
                >
                  <span>{expanded ? "Collapse" : "Expand"}</span>
                  <span className="text-[9px]">{expanded ? "▴" : "▾"}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        {direction ? (
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-bold">
                  Identified Trajectory
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-400/30 text-blue-700 dark:text-blue-300">
                  {direction.confidence}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)] font-['Syne',sans-serif] leading-tight">
                {direction.title}
              </h3>

              {/* Signals */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-white/10">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Supporting Capability Signals:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(expanded ? direction.signals : direction.signals.slice(0, 3)).map((sig) => (
                    <span
                      key={sig}
                      className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-white dark:bg-blue-500/10 border border-slate-200 dark:border-blue-400/20 text-[var(--text-primary)] dark:text-blue-200 shadow-2xs"
                    >
                      {sig}
                    </span>
                  ))}
                  {!expanded && direction.signals.length > 3 && (
                    <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 self-center">
                      +{direction.signals.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Evidence bullet points (revealed in expanded view) */}
            {expanded && (
              <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-1.5 text-xs text-[var(--text-secondary)] animate-fadeIn">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Based on your experience:
                </div>
                <ul className="space-y-1 pl-4 list-disc marker:text-blue-500">
                  {direction.evidence.slice(0, 3).map((ev, i) => (
                    <li key={i} className="leading-relaxed">
                      {ev}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          /* Empty state */
          <div className="p-5 rounded-xl bg-blue-50/70 dark:bg-blue-500/10 border border-blue-200/80 dark:border-blue-400/20 text-center space-y-2.5">
            <h4 className="text-sm font-bold text-[var(--text-primary)] font-['Syne',sans-serif]">
              Discover your possible career directions
            </h4>
            <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
              Based on your experience, UpRole has identified several directions worth exploring.
            </p>
            <Link
              href="/career-copilot?tab=skillgap"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 dark:bg-blue-500 text-white font-bold text-xs hover:bg-blue-700 dark:hover:bg-blue-600 transition-all no-underline shadow-sm"
            >
              <span>Explore Directions</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}
      </div>

      <div className="pt-3 mt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs">
        <span className="text-[var(--text-muted)] text-[11px]">Pattern-matched trajectory</span>
        <Link
          href="/career-copilot"
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold hover:underline no-underline"
        >
          Explore Pathways →
        </Link>
      </div>
    </motion.div>
  );
}
