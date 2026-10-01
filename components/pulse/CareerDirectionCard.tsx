"use client";

import { motion } from "framer-motion";
import {
  Compass,
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import { CareerDirectionData, AiTraceabilityContext } from "./types";
import { handleSpotMove } from "./pulseSpot";

interface Props {
  direction: CareerDirectionData | null;
  onOpenExplain: (ctx: AiTraceabilityContext) => void;
  forceExpand?: boolean;
}

export default function CareerDirectionCard({
  direction,
  onOpenExplain,
}: Props) {
  const handleExplainClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
      onMouseMove={handleSpotMove}
      className="value-spot group relative rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--card)] text-[var(--text-primary)] p-4 sm:p-5 shadow-xs hover:border-indigo-500/40 hover:shadow-[0_14px_40px_rgba(99,102,241,0.12)] transition-all duration-300 flex flex-col justify-between h-full min-h-[230px]"
    >
      {/* indigo crown hairline + ghost chapter numeral */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-indigo-500 via-sky-400/80 to-transparent z-20" aria-hidden="true" />
      <span className="value-ghost absolute top-2 right-4 text-[3.8rem] leading-none z-0" aria-hidden="true">05</span>

      <div className="relative z-10 flex flex-col h-full justify-between">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[10.5px] font-black uppercase tracking-[0.16em] text-indigo-700 dark:text-indigo-400 font-['Syne',sans-serif]">
                CAREER DIRECTION
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {direction && (
              <button
                type="button"
                onClick={handleExplainClick}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[10.5px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all cursor-pointer shadow-2xs"
                title="Inspect AI trajectory reasoning"
              >
                <HelpCircle className="w-3 h-3 text-indigo-500" />
                <span className="font-medium">Why?</span>
              </button>
            )}
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 shrink-0">
              {direction ? direction.confidence : "Open"}
            </span>
          </div>
        </div>

        {/* Bite-sized Direction */}
        <div className="my-auto space-y-1.5 py-1">
          {direction ? (
            <>
              <h3 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] font-['Syne',sans-serif] leading-snug line-clamp-2">
                {direction.title}
              </h3>

              <div className="flex flex-wrap gap-1 pt-1">
                {direction.signals.slice(0, 2).map((sig) => (
                  <span
                    key={sig}
                    className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] truncate max-w-[130px]"
                  >
                    {sig}
                  </span>
                ))}
                {direction.signals.length > 2 && (
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 self-center">
                    +{direction.signals.length - 2} more
                  </span>
                )}
              </div>
            </>
          ) : (
            <p className="text-xs text-[var(--text-muted)] italic">
              Explore your emerging trajectory pathways.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2.5 mt-2 border-t border-[var(--border)] flex items-center justify-between gap-2 text-xs">
          <span className="text-[11px] text-[var(--text-muted)] font-medium truncate">
            Pattern-matched trajectory
          </span>

          <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 shrink-0 group-hover:underline">
            <span>Details</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </motion.div>
  );
}
