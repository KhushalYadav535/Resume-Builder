"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Compass,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Layers,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { ExplorationItem } from "./types";

interface Props {
  items: ExplorationItem[];
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
      className="group relative rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 bg-gradient-to-br from-violet-50/60 via-white to-indigo-50/40 dark:from-[#0D1530] dark:via-[#111C40] dark:to-[#0A1126] text-[var(--text-primary)] p-7 sm:p-8 shadow-sm dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-sm"
    >
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/3 w-96 h-96 rounded-full bg-violet-500/10 dark:bg-violet-600/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 dark:bg-violet-500/20 border border-violet-500/20 dark:border-violet-400/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
              <Compass className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.16em] text-violet-600 dark:text-violet-400 font-['Syne',sans-serif]">
              Possibilities · Explore Your Career
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-['Syne',sans-serif]">
            What else could you do from here?
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
            Plausible trajectories identified from your evidence base. Open possibilities without lock-in.
          </p>
        </div>

        <Link
          href="/career-copilot"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/15 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white shadow-sm transition-all no-underline shrink-0"
        >
          <span>Explore All Options</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 3 Directions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
        {items.slice(0, 3).map((item, idx) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-white/80 dark:bg-white/[0.03] hover:bg-white dark:hover:bg-white/[0.06] border border-slate-200 dark:border-white/10 hover:border-violet-400 dark:hover:border-violet-400/40 shadow-sm transition-all duration-300 flex flex-col justify-between group/card"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-black text-slate-400 dark:text-slate-500 font-['Syne',sans-serif]">
                  0{idx + 1}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getAlignmentBadge(
                    item.alignment
                  )}`}
                >
                  {item.alignment}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-['Syne',sans-serif] group-hover/card:text-violet-600 dark:group-hover/card:text-violet-300 transition-colors mb-2">
                {item.role}
              </h3>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 mb-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Why this appeared:
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {item.rationale}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {item.relevantCapabilities.map((cap) => (
                  <span
                    key={cap}
                    className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </div>

            <Link
              href={`/career-copilot?tab=skillgap&role=${encodeURIComponent(item.role)}`}
              className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs font-bold text-violet-600 dark:text-violet-400 group-hover/card:text-violet-700 dark:group-hover/card:text-violet-300 no-underline"
            >
              <span>Explore Trajectory</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover/card:translate-x-1 transition-transform" />
            </Link>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
