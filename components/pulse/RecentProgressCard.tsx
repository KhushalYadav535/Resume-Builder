"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { ProgressItem } from "./types";

interface Props {
  items: ProgressItem[];
  forceExpand?: boolean;
}

export default function RecentProgressCard({ items, forceExpand }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const expanded = forceExpand !== undefined ? forceExpand : isExpanded;
  const primaryItem = items.find((i) => i.isPrimary) || items[0];
  const secondaryItems = items.filter((i) => i !== primaryItem).slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-gradient-to-br dark:from-[#101F3D] dark:via-[#132852] dark:to-[#0E1B38] text-[var(--text-primary)] p-5 sm:p-6 shadow-[0_4px_20px_rgba(16,27,59,0.05)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.5)] flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-500/20 border border-teal-200 dark:border-teal-400/30 flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-inner">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-teal-700 dark:text-teal-400 font-['Syne',sans-serif]">
                RECENT PROGRESS
              </span>
              <p className="text-[11.5px] text-[var(--text-muted)] font-medium">
                Meaningful career movement
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-400/10 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-400/20">
              Validated
            </span>
            {secondaryItems.length > 0 && (
              <button
                type="button"
                onClick={() => setIsExpanded(!expanded)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/15 text-[11px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer shadow-2xs"
              >
                <span>{expanded ? "Collapse" : "Expand"}</span>
                <span className="text-[9px]">{expanded ? "▴" : "▾"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Primary Progress Item (Hero Highlight) */}
        {primaryItem ? (
          <div className="p-3.5 sm:p-4 rounded-xl bg-teal-50/70 dark:bg-gradient-to-br dark:from-teal-500/15 dark:via-white/[0.04] dark:to-transparent border border-teal-200/80 dark:border-teal-400/25 relative overflow-hidden mb-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded-md text-[9.5px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-800 dark:text-teal-300 border border-teal-400/30">
                {primaryItem.category || "Primary Movement"}
              </span>
              <span className="text-[10.5px] text-[var(--text-muted)] font-medium">
                Recent advancement
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] font-['Syne',sans-serif] mb-1.5 leading-snug">
              {primaryItem.title}
            </h3>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3">
              {primaryItem.description}
            </p>

            <Link
              href={primaryItem.evidenceLink || "/career-journal#events"}
              className="inline-flex items-center gap-1 text-[11.5px] font-bold text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 transition-all no-underline"
            >
              <span>View Evidence Record</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 text-center mb-3">
            <p className="text-xs text-[var(--text-secondary)]">
              No recent progress recorded yet. Log an achievement to establish trajectory.
            </p>
          </div>
        )}

        {/* Secondary Items (visible when expanded) */}
        {expanded && secondaryItems.length > 0 && (
          <div className="space-y-2 mb-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Supporting Developments
            </div>
            {secondaryItems.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100/70 dark:hover:bg-white/[0.06] border border-slate-200 dark:border-white/5 transition-all flex items-start gap-2.5"
              >
                <div className="w-5 h-5 rounded-md bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-[var(--text-primary)] font-['Syne',sans-serif]">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] leading-relaxed mt-0.5 line-clamp-2">
                    {item.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-[11.5px]">
        <span className="text-[var(--text-muted)]">
          Source: Verified Journal entries
        </span>
        <Link
          href="/career-journal"
          className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-bold no-underline"
        >
          View history →
        </Link>
      </div>
    </motion.div>
  );
}
