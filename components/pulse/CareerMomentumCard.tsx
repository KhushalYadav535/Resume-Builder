"use client";

import { useRef } from "react";
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
}

export default function CareerMomentumCard({ momentum }: Props) {
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
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      whileHover={{ y: -4, transition: { duration: 0.22 } }}
      transition={{ duration: 0.45, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-gradient-to-br dark:from-[#101736] dark:via-[#121E45] dark:to-[#0C142E] text-[var(--text-primary)] p-7 sm:p-8 shadow-[0_4px_24px_rgba(16,27,59,0.06)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.5)] hover:shadow-[0_16px_48px_rgba(16,27,59,0.14)] dark:hover:shadow-[0_32px_80px_rgba(0,0,0,0.8)] hover:border-slate-300 dark:hover:border-white/20 transition-shadow transition-colors duration-300 flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl ${config.bgColor} flex items-center justify-center ${config.color} shadow-inner`}>
              <StateIcon className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className={`text-[11px] font-black uppercase tracking-[0.16em] ${config.color} font-['Syne',sans-serif]`}>
                Career Momentum
              </span>
              <p className="text-[12px] text-[var(--text-muted)] font-medium">
                Qualitative career progression signal
              </p>
            </div>
          </div>

          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${config.bgColor} ${config.color}`}>
            {momentum.state}
          </span>
        </div>

        {/* Big Trajectory Vector */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex items-center gap-5 mb-5">
          {/* Breathing arrow animation */}
          <motion.div
            animate={{
              scale: [1, 1.06, 1],
              boxShadow: [
                `0 0 0px ${config.glow}`,
                `0 0 24px ${config.glow}`,
                `0 0 0px ${config.glow}`,
              ],
            }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-white/[0.06] border border-amber-200 dark:border-white/10 flex items-center justify-center text-3xl font-black text-amber-600 dark:text-amber-400 font-['Syne',sans-serif] shrink-0"
          >
            {config.arrow}
          </motion.div>

          <div>
            <div className="text-xl sm:text-2xl font-black text-[var(--text-primary)] font-['Syne',sans-serif]">
              {momentum.state}
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-1">
              {momentum.summary}
            </p>
          </div>
        </div>

        {/* Verified Inputs (Valid career signals only) */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Validated Contributing Signals
          </div>
          <div className="space-y-1.5">
            {momentum.signals.map((sig, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -8 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.5 + idx * 0.08, duration: 0.25 }}
                whileHover={{ x: 3, transition: { duration: 0.15 } }}
                className="flex items-center gap-2 text-xs text-[var(--text-secondary)] bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.05] p-2 rounded-lg border border-slate-200 dark:border-white/5 transition-colors cursor-default"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{sig}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4 mt-6 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs">
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
