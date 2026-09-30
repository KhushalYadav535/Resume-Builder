"use client";

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
}

export default function RecentProgressCard({ items }: Props) {
  const primaryItem = items.find((i) => i.isPrimary) || items[0];
  const secondaryItems = items.filter((i) => i !== primaryItem).slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-gradient-to-br dark:from-[#101F3D] dark:via-[#132852] dark:to-[#0E1B38] text-[var(--text-primary)] p-7 sm:p-8 shadow-[0_4px_24px_rgba(16,27,59,0.06)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.5)] flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-500/20 border border-teal-200 dark:border-teal-400/30 flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-inner">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-teal-700 dark:text-teal-400 font-['Syne',sans-serif]">
                What Changed · Recent Progress
              </span>
              <p className="text-[12px] text-[var(--text-muted)] font-medium">
                Verified career milestones &amp; documented progression
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-teal-50 dark:bg-teal-400/10 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-400/20">
            Validated
          </span>
        </div>

        {/* Primary Progress Item (Hero Highlight) */}
        {primaryItem ? (
          <div className="p-5 rounded-2xl bg-teal-50/70 dark:bg-gradient-to-br dark:from-teal-500/15 dark:via-white/[0.04] dark:to-transparent border border-teal-200/80 dark:border-teal-400/25 relative overflow-hidden mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-800 dark:text-teal-300 border border-teal-400/30">
                {primaryItem.category || "Primary Movement"}
              </span>
              <span className="text-[11px] text-[var(--text-muted)] font-medium">
                Recent advancement
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] font-['Syne',sans-serif] mb-2 leading-snug">
              {primaryItem.title}
            </h3>

            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
              {primaryItem.description}
            </p>

            <Link
              href={primaryItem.evidenceLink || "/career-journal#events"}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 hover:translate-x-0.5 transition-all no-underline"
            >
              <span>View Evidence Record</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 text-center mb-4">
            <p className="text-sm text-[var(--text-secondary)]">
              No recent progress recorded yet. Log an achievement or new responsibility to establish trajectory.
            </p>
          </div>
        )}

        {/* Secondary Items (1-2 compact items) */}
        {secondaryItems.length > 0 && (
          <div className="space-y-2.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Supporting Developments
            </div>
            {secondaryItems.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100/70 dark:hover:bg-white/[0.06] border border-slate-200 dark:border-white/5 transition-all flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-lg bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
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

      <div className="pt-4 mt-6 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs">
        <span className="text-[var(--text-muted)]">
          Source: Verified Career Journal entries
        </span>
        <Link
          href="/career-journal"
          className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-bold hover:underline no-underline"
        >
          View all history →
        </Link>
      </div>
    </motion.div>
  );
}
