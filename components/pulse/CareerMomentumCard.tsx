"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import {
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Award,
} from "lucide-react";
import { CareerMomentumData } from "./types";

interface Props {
  momentum: CareerMomentumData;
  forceExpand?: boolean;
}

export default function CareerMomentumCard({ momentum, forceExpand }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const expanded = forceExpand !== undefined ? forceExpand : isExpanded;

  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, amount: 0.15 });
  const getStateConfig = (state: string) => {
    switch (state) {
      case "Accelerating":
        return {
          icon: Flame,
          arrow: "⇈",
          color: "text-amber-600 dark:text-amber-400",
          bgColor: "bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/30 dark:border-amber-400/30",
          glow: "rgba(245, 158, 11, 0.4)",
        };
      case "Building":
      default:
        return {
          icon: TrendingUp,
          arrow: "↗",
          color: "text-emerald-700 dark:text-emerald-400",
          bgColor: "bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/30 dark:border-emerald-400/30",
          glow: "rgba(16, 185, 129, 0.4)",
        };
      case "Moving":
        return {
          icon: TrendingUp,
          arrow: "→",
          color: "text-blue-700 dark:text-blue-400",
          bgColor: "bg-blue-500/10 dark:bg-blue-500/15 border-blue-500/30 dark:border-blue-400/30",
          glow: "rgba(37, 99, 235, 0.4)",
        };
      case "Goal Milestone Reached":
        return {
          icon: Award,
          arrow: "★",
          color: "text-purple-700 dark:text-purple-400",
          bgColor: "bg-purple-500/10 dark:bg-purple-500/15 border-purple-500/30 dark:border-purple-400/30",
          glow: "rgba(124, 58, 237, 0.4)",
        };
      case "Needs Attention":
        return {
          icon: AlertTriangle,
          arrow: "⚠",
          color: "text-rose-700 dark:text-rose-400",
          bgColor: "bg-rose-500/10 dark:bg-rose-500/15 border-rose-500/30 dark:border-rose-400/30",
          glow: "rgba(244, 63, 94, 0.4)",
        };
    }
  };

  const config = getStateConfig(momentum.state);
  const StateIcon = config.icon;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-gradient-to-br dark:from-[#101736] dark:via-[#121E45] dark:to-[#0C142E] text-[var(--text-primary)] p-5 sm:p-6 shadow-[0_4px_20px_rgba(16,27,59,0.05)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.5)] hover:shadow-[0_12px_36px_rgba(16,27,59,0.12)] dark:hover:shadow-[0_24px_64px_rgba(0,0,0,0.7)] hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl ${config.bgColor} flex items-center justify-center ${config.color} shadow-inner`}>
              <StateIcon className="w-4 h-4" />
            </div>
            <div>
              <span className={`text-[11px] font-black uppercase tracking-[0.16em] ${config.color} font-['Syne',sans-serif]`}>
                CAREER MOMENTUM
              </span>
              <p className="text-[11.5px] text-[var(--text-muted)] font-medium">
                Meaningful movement indicator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${config.bgColor} ${config.color}`}>
              {momentum.state}
            </span>
            <button
              type="button"
              onClick={() => setIsExpanded(!expanded)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/15 text-[11px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer shadow-2xs"
            >
              <span>{expanded ? "Collapse" : "Expand"}</span>
              <span className="text-[9px]">{expanded ? "▴" : "▾"}</span>
            </button>
          </div>
        </div>

        {/* Big Trajectory Vector */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex items-center gap-4 mb-3">
          {/* Breathing arrow animation */}
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              boxShadow: [
                `0 0 0px ${config.glow}`,
                `0 0 20px ${config.glow}`,
                `0 0 0px ${config.glow}`,
              ],
            }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            className="w-13 h-13 rounded-xl bg-amber-50 dark:bg-white/[0.06] border border-amber-200 dark:border-white/10 flex items-center justify-center text-2xl font-black text-amber-600 dark:text-amber-400 font-['Syne',sans-serif] shrink-0"
          >
            {config.arrow}
          </motion.div>

          <div>
            <div className="text-lg sm:text-xl font-black text-[var(--text-primary)] font-['Syne',sans-serif]">
              {momentum.state}
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-0.5">
              {momentum.summary}
            </p>
          </div>
        </div>

        {/* Verified Inputs (Valid career signals only - revealed in expanded view or default compact top 2) */}
        {expanded && (
          <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-white/10 animate-fadeIn">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Validated Contributing Signals
            </div>
            <div className="space-y-1">
              {momentum.signals.map((sig, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-xs text-[var(--text-secondary)] bg-slate-50 dark:bg-white/[0.02] p-2 rounded-lg border border-slate-200 dark:border-white/5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{sig}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="pt-3 mt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs">
        <span className="text-[var(--text-muted)] text-[11px]">
          Derived from verified career signals
        </span>
        <Link
          href="/momentum"
          className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-bold hover:underline no-underline"
        >
          View Momentum details →
        </Link>
      </div>
    </motion.div>
  );
}
