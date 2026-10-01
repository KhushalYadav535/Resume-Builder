"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  Plus,
  BookOpen,
  ChevronRight,
  Zap,
} from "lucide-react";
import { CareerEventData } from "./types";
import { handleSpotMove } from "./pulseSpot";

interface Props {
  event: CareerEventData | null;
  onOpenCaptureEvent: () => void;
  forceExpand?: boolean;
}

export default function RecentCareerEventCard({
  event,
  onOpenCaptureEvent,
}: Props) {
  const handleLogClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onOpenCaptureEvent();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleSpotMove}
      className="value-spot group relative rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--card)] text-[var(--text-primary)] p-4 sm:p-5 shadow-xs hover:border-purple-500/40 hover:shadow-[0_14px_40px_rgba(168,85,247,0.12)] transition-all duration-300 flex flex-col justify-between h-full min-h-[230px]"
    >
      {/* purple crown hairline + ghost chapter numeral */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-purple-500 via-indigo-400/80 to-transparent z-20" aria-hidden="true" />
      <span className="value-ghost absolute top-2 right-4 text-[3.8rem] leading-none z-0" aria-hidden="true">04</span>

      <div className="relative z-10 flex flex-col h-full justify-between">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-inner">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[10.5px] font-black uppercase tracking-[0.16em] text-purple-700 dark:text-purple-400 font-['Syne',sans-serif]">
                RECENT EVENT
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogClick}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-[10.5px] font-bold text-purple-700 dark:text-purple-300 transition-all cursor-pointer shadow-2xs"
          >
            <Plus className="w-3 h-3" />
            <span>Log</span>
          </button>
        </div>

        {/* Bite-sized Event Content */}
        <div className="my-auto space-y-1.5 py-1">
          {event ? (
            <>
              <div className="flex items-center justify-between gap-1 text-[10.5px] text-[var(--text-muted)] font-semibold">
                <span className="flex items-center gap-1 truncate">
                  <Calendar className="w-3 h-3 text-purple-500 shrink-0" />
                  <span className="truncate">{event.date.split("·")[0].trim()}</span>
                </span>
                <span className="px-1.5 py-0.5 rounded-md text-[9.5px] font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 truncate shrink-0">
                  {event.capability.split("&")[0].trim()}
                </span>
              </div>

              <h3 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] font-['Syne',sans-serif] leading-tight line-clamp-1">
                {event.title}
              </h3>

              <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[11.5px] text-purple-950 dark:text-purple-200">
                <span className="font-bold text-purple-700 dark:text-purple-300">Impact: </span>
                <span className="line-clamp-2 leading-tight">{event.impact}</span>
              </div>
            </>
          ) : (
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center space-y-1">
              <Zap className="w-4 h-4 text-purple-500 mx-auto" />
              <p className="text-xs font-bold text-[var(--text-primary)]">Capture milestone</p>
              <p className="text-[11px] text-[var(--text-muted)]">Log a recent win to track your career ROI</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2.5 mt-2 border-t border-[var(--border)] flex items-center justify-between gap-2 text-xs">
          <span className="text-[11px] text-[var(--text-muted)] font-medium truncate">
            Source: Career Memory
          </span>

          <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-purple-600 dark:text-purple-400 shrink-0 group-hover:underline">
            <span>Details</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </motion.div>
  );
}
