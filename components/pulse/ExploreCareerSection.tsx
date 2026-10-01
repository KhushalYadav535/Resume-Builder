"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Compass,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { ExplorationItem } from "./types";
import { handleSpotMove } from "./pulseSpot";

interface Props {
  items: ExplorationItem[];
  forceExpand?: boolean;
}

export default function ExploreCareerSection({ items }: Props) {
  const getAlignmentBadge = (alignment: string) => {
    switch (alignment) {
      case "Strong alignment":
        return "bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300";
      case "High potential":
        return "bg-blue-500/10 dark:bg-blue-500/15 border-blue-500/30 text-blue-700 dark:text-blue-300";
      case "Emerging opportunity":
      default:
        return "bg-purple-500/10 dark:bg-purple-500/15 border-purple-500/30 text-purple-700 dark:text-purple-300";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleSpotMove}
      className="value-spot group relative rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--card)] text-[var(--text-primary)] p-4 sm:p-5 shadow-xs hover:border-violet-500/40 hover:shadow-[0_14px_40px_rgba(139,92,246,0.12)] transition-all duration-300"
    >
      {/* violet crown hairline + ghost chapter numeral */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-violet-500 via-purple-400/80 to-transparent z-20" aria-hidden="true" />
      <span className="value-ghost absolute top-2 right-4 text-[3.8rem] leading-none z-0" aria-hidden="true">09</span>
      
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/3 w-80 h-80 rounded-full bg-violet-500/[0.05] blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10.5px] font-black uppercase tracking-[0.16em] text-violet-600 dark:text-violet-400 font-['Syne',sans-serif]">
              EXPLORE YOUR CAREER
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/career-copilot"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-violet-400/40 text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-2xs transition-all no-underline shrink-0"
          >
            <span>Explore All Options</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* 3 Directions Grid (compact) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 relative z-10">
        {items.slice(0, 3).map((item, idx) => (
          <div
            key={item.id}
            className="p-3 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-violet-400/50 shadow-xs transition-all duration-300 flex flex-col justify-between group/card"
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="text-[10px] font-black text-[var(--text-muted)] font-['Syne',sans-serif]">
                  0{idx + 1}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${getAlignmentBadge(
                    item.alignment
                  )}`}
                >
                  {item.alignment}
                </span>
              </div>

              <h3 className="text-xs sm:text-sm font-extrabold text-[var(--text-primary)] font-['Syne',sans-serif] group-hover/card:text-violet-600 dark:group-hover/card:text-violet-300 transition-colors truncate mb-1">
                {item.role}
              </h3>

              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed line-clamp-1 mb-2">
                {item.rationale}
              </p>

              <div className="flex flex-wrap gap-1 mb-1">
                {item.relevantCapabilities.slice(0, 2).map((cap) => (
                  <span
                    key={cap}
                    className="px-1.5 py-0.5 rounded-md text-[9px] font-medium bg-[var(--card)] border border-[var(--border)] text-[var(--text-muted)] truncate max-w-[110px]"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 mt-1 border-t border-[var(--border)] flex items-center justify-between text-[11px] font-bold text-violet-600 dark:text-violet-400">
              <span>View Trajectory</span>
              <ChevronRight className="w-3 h-3 group-hover/card:translate-x-0.5 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
