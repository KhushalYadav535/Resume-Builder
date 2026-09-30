"use client";

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
}

export default function RecentCareerEventCard({
  event,
  onOpenCaptureEvent,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-gradient-to-br dark:from-[#121A3B] dark:via-[#14234E] dark:to-[#0E1632] text-[var(--text-primary)] p-7 sm:p-8 shadow-[0_4px_24px_rgba(16,27,59,0.06)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.5)] flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-400/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-inner">
              <BookOpen className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-purple-700 dark:text-purple-400 font-['Syne',sans-serif]">
                What Changed · Recent Career Event
              </span>
              <p className="text-[12px] text-[var(--text-muted)] font-medium">
                Latest verified milestone in your living career record
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenCaptureEvent}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-500/20 hover:bg-purple-100 dark:hover:bg-purple-500/30 border border-purple-200 dark:border-purple-400/30 text-xs font-bold text-purple-700 dark:text-purple-300 hover:text-purple-800 dark:hover:text-white transition-all cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Event</span>
          </button>
        </div>

        {/* Content */}
        {event ? (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 space-y-3.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 dark:text-purple-300">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{event.date}</span>
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 dark:bg-purple-500/15 border border-purple-200 dark:border-purple-400/30 text-purple-700 dark:text-purple-300">
                  {event.capability}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] font-['Syne',sans-serif] leading-tight">
                {event.title}
              </h3>

              <div className="space-y-2 text-xs text-[var(--text-secondary)] leading-relaxed">
                <div>
                  <span className="font-bold text-[var(--text-primary)]">Context: </span>
                  <span>{event.context}</span>
                </div>
                <div className="p-3 rounded-xl bg-purple-50/90 dark:bg-purple-500/10 border border-purple-200/80 dark:border-purple-400/20 text-purple-900 dark:text-purple-200">
                  <span className="font-bold text-purple-700 dark:text-purple-300">Impact: </span>
                  <span>{event.impact}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty state matching Scenario D in Section 14 */
          <div className="p-6 rounded-2xl bg-purple-50/70 dark:bg-purple-500/10 border border-purple-200/80 dark:border-purple-400/20 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-400/30 text-purple-700 dark:text-purple-300 mx-auto flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-[var(--text-primary)] font-['Syne',sans-serif]">
              What&apos;s changed recently?
            </h4>
            <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
              Have you solved an important problem, taken on new responsibility, or achieved something worth remembering?
            </p>
            <button
              type="button"
              onClick={onOpenCaptureEvent}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 dark:bg-purple-500 text-white font-bold text-xs hover:bg-purple-700 dark:hover:bg-purple-600 transition-all cursor-pointer shadow-md"
            >
              <span>Capture Career Event</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="pt-4 mt-6 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs">
        <span className="text-[var(--text-muted)]">
          Source: Career Memory &amp; Journal
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
