"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { ProgressItem } from "./types";
import { handleSpotMove } from "./pulseSpot";

interface Props {
  items: ProgressItem[];
  forceExpand?: boolean;
}

export default function RecentProgressCard({ items }: Props) {
  const primaryItem = items.find((i) => i.isPrimary) || items[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleSpotMove}
      className="value-spot group relative rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--card)] text-[var(--text-primary)] p-4 sm:p-5 shadow-xs hover:border-teal-500/40 hover:shadow-[0_14px_40px_rgba(20,184,166,0.12)] transition-all duration-300 flex flex-col justify-between h-full min-h-[230px]"
    >
      {/* teal crown hairline + ghost chapter numeral */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-teal-500 via-emerald-400/80 to-transparent z-20" aria-hidden="true" />
      <span className="value-ghost absolute top-2 right-4 text-[3.8rem] leading-none z-0" aria-hidden="true">03</span>

      <div className="relative z-10 flex flex-col h-full justify-between">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-inner">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[10.5px] font-black uppercase tracking-[0.16em] text-teal-700 dark:text-teal-400 font-['Syne',sans-serif]">
                RECENT PROGRESS
              </span>
            </div>
          </div>

          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30 shrink-0">
            {primaryItem?.category || "Movement"}
          </span>
        </div>

        {/* Bite-sized Primary Item */}
        <div className="my-auto space-y-1.5 py-1">
          {primaryItem ? (
            <>
              <h3 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] font-['Syne',sans-serif] leading-snug line-clamp-1">
                {primaryItem.title}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                {primaryItem.description}
              </p>
              {items.length > 1 && (
                <div className="flex items-center gap-1.5 pt-1 text-[11px] text-teal-700 dark:text-teal-300 font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>+{items.length - 1} supporting development{items.length > 2 ? "s" : ""}</span>
                </div>
              )}
            </>
          ) : (
            <p className="text-xs text-[var(--text-muted)] italic">
              No recent progress logged yet.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2.5 mt-2 border-t border-[var(--border)] flex items-center justify-between gap-2 text-xs">
          <span className="text-[11px] text-[var(--text-muted)] font-medium truncate">
            Source: Verified Journal
          </span>

          <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-teal-600 dark:text-teal-400 shrink-0 group-hover:underline">
            <span>Details</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </motion.div>
  );
}
