"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Calendar,
  Sparkles,
  ArrowRight,
  Plus,
  Layers,
  Award,
  BookOpen,
  Zap,
} from "lucide-react";
import { CareerEventData } from "./types";

interface Props {
  event: CareerEventData | null;
  onOpenCaptureEvent: () => void;
  forceExpand?: boolean;
}

export default function RecentCareerEventCard({
  event,
  onOpenCaptureEvent,
  forceExpand,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const expanded = forceExpand !== undefined ? forceExpand : isExpanded;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-gradient-to-br dark:from-[#121A3B] dark:via-[#14234E] dark:to-[#0E1632] text-[var(--text-primary)] p-5 sm:p-6 shadow-[0_4px_20px_rgba(16,27,59,0.05)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.5)] flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-400/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-inner">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-purple-700 dark:text-purple-400 font-['Syne',sans-serif]">
                RECENT EVENT
              </span>
              <p className="text-[11.5px] text-[var(--text-muted)] font-medium">
                Latest event
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {event && (
              <button
                type="button"
                onClick={() => setIsExpanded(!expanded)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/15 text-[11px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer shadow-2xs"
              >
                <span>{expanded ? "Collapse" : "Expand"}</span>
                <span className="text-[9px]">{expanded ? "▴" : "▾"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenCaptureEvent}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-500/20 hover:bg-purple-100 dark:hover:bg-purple-500/30 border border-purple-200 dark:border-purple-400/30 text-[11px] font-bold text-purple-700 dark:text-purple-300 hover:text-purple-800 dark:hover:text-white transition-all cursor-pointer shadow-2xs"
            >
              <Plus className="w-3 h-3" />
              <span>Log Event</span>
            </button>
          </div>
        </div>

        {/* Content */}
        {event ? (
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 space-y-2.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{event.date}</span>
                </div>

                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-500/15 border border-purple-200 dark:border-purple-400/30 text-purple-700 dark:text-purple-300">
                  {event.capability}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] font-['Syne',sans-serif] leading-tight">
                {event.title}
              </h3>

              {/* Impact Highlight (always visible in compact) */}
              <div className="p-2.5 rounded-lg bg-purple-50/90 dark:bg-purple-500/10 border border-purple-200/80 dark:border-purple-400/20 text-xs text-purple-900 dark:text-purple-200">
                <span className="font-bold text-purple-700 dark:text-purple-300">Impact: </span>
                <span>{event.impact}</span>
              </div>

              {/* Context (revealed in expanded view) */}
              {expanded && (
                <div className="pt-2 border-t border-slate-200 dark:border-white/10 text-xs text-[var(--text-secondary)] leading-relaxed animate-fadeIn">
                  <span className="font-bold text-[var(--text-primary)]">Context: </span>
                  <span>{event.context}</span>
                </div>
              )}

              {/* View Event CTA (Spec Section 8) */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-end">
                <Link
                  href="/career-journal#events"
                  className="inline-flex items-center gap-1 text-[11.5px] font-bold text-purple-700 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-200 transition-all no-underline"
                >
                  <span>View Event</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Empty state */
          <div className="p-5 rounded-xl bg-purple-50/70 dark:bg-purple-500/10 border border-purple-200/80 dark:border-purple-400/20 text-center space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-400/30 text-purple-700 dark:text-purple-300 mx-auto flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-[var(--text-primary)] font-['Syne',sans-serif]">
              Capture your latest milestone
            </h4>
            <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
              Have you solved a key problem, taken on new responsibility, or delivered an impactful project?
            </p>
            <button
              type="button"
              onClick={onOpenCaptureEvent}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 dark:bg-purple-500 text-white font-bold text-xs hover:bg-purple-700 dark:hover:bg-purple-600 transition-all cursor-pointer shadow-sm"
            >
              <span>Capture Event</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      <div className="pt-3 mt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs">
        <span className="text-[var(--text-muted)] text-[11px]">
          Source: Career Memory
        </span>
        <Link
          href="/career-journal#events"
          className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-bold hover:underline no-underline"
        >
          View all events →
        </Link>
      </div>
    </motion.div>
  );
}
