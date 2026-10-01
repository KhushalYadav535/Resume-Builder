"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  TrendingUp,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Award,
  ChevronRight,
} from "lucide-react";
import { CareerMomentumData } from "./types";
import { handleSpotMove } from "./pulseSpot";

interface Props {
  momentum: CareerMomentumData;
  forceExpand?: boolean;
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
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleSpotMove}
      className="value-spot group relative rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--card)] text-[var(--text-primary)] p-4 sm:p-5 shadow-xs hover:border-emerald-500/40 hover:shadow-[0_14px_40px_rgba(16,185,129,0.12)] transition-all duration-300 flex flex-col justify-between h-full min-h-[230px]"
    >
      {/* emerald crown hairline + ghost chapter numeral */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-emerald-500 via-teal-400/80 to-transparent z-20" aria-hidden="true" />
      <span className="value-ghost absolute top-2 right-4 text-[3.8rem] leading-none z-0" aria-hidden="true">08</span>
      
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-emerald-500/[0.05] blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full justify-between">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg ${config.bgColor} flex items-center justify-center ${config.color} shadow-inner`}>
              <StateIcon className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className={`text-[10.5px] font-black uppercase tracking-[0.16em] ${config.color} font-['Syne',sans-serif]`}>
                CAREER MOMENTUM
              </span>
            </div>
          </div>

          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${config.bgColor} ${config.color} shrink-0`}>
            {momentum.state}
          </span>
        </div>

        {/* Bite-sized Trajectory & Sparkline */}
        <div className="my-auto space-y-1.5 py-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-base font-black text-amber-600 dark:text-amber-400 font-['Syne',sans-serif]">
                {config.arrow}
              </span>
              <span className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] font-['Syne',sans-serif]">
                {momentum.state}
              </span>
            </div>

            {/* Sparkline mini */}
            <div className="flex items-end gap-0.5 h-6 shrink-0" aria-hidden="true">
              {[38, 55, 44, 68, 58, 82, 100].map((h, i) => (
                <span
                  key={i}
                  className="w-1 rounded-full bg-gradient-to-t from-emerald-500/30 to-emerald-400"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
            {momentum.summary}
          </p>

          {momentum.signals.length > 0 && (
            <div className="flex items-center gap-1.5 text-[10.5px] text-[var(--text-muted)] truncate">
              <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
              <span className="truncate">{momentum.signals[0]}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2.5 mt-2 border-t border-[var(--border)] flex items-center justify-between gap-2 text-xs">
          <span className="text-[11px] text-[var(--text-muted)] font-medium truncate">
            Derived from verified signals
          </span>

          <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 shrink-0 group-hover:underline">
            <span>Details</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </motion.div>
  );
}
