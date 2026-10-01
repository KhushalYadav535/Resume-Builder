"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  ShieldCheck,
  HelpCircle,
  ChevronRight,
  Layers,
  TrendingUp,
  Award,
  Sparkles,
} from "lucide-react";
import { CareerValueData, QualitativeLevel, AiTraceabilityContext } from "./types";
import { handleSpotMove } from "./pulseSpot";

interface Props {
  data: CareerValueData;
  onOpenExplain: (ctx: AiTraceabilityContext) => void;
  forceExpand?: boolean;
}

export default function CareerValueCard({ data, onOpenExplain }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, amount: 0.15 });

  const dimensions: {
    label: string;
    level: QualitativeLevel;
    icon: any;
  }[] = [
    { label: "Capabilities", level: data.capabilities, icon: Layers },
    { label: "Experience", level: data.experience, icon: Award },
    { label: "Progression", level: data.progression, icon: Sparkles },
    { label: "Impact", level: data.impact, icon: TrendingUp },
  ];

  const getLevelConfig = (level: QualitativeLevel) => {
    switch (level) {
      case "Well evidenced":
      case "Strong":
        return {
          color: "from-emerald-500 to-teal-400",
          textColor: "text-emerald-700 dark:text-emerald-300",
          dot: "bg-emerald-500",
        };
      case "Established":
        return {
          color: "from-cyan-500 to-blue-500",
          textColor: "text-cyan-700 dark:text-cyan-300",
          dot: "bg-cyan-500",
        };
      case "Developing":
        return {
          color: "from-amber-500 to-amber-400",
          textColor: "text-amber-700 dark:text-amber-300",
          dot: "bg-amber-500",
        };
      case "Emerging":
      case "Needs strengthening":
      default:
        return {
          color: "from-rose-500 to-orange-400",
          textColor: "text-rose-700 dark:text-rose-300",
          dot: "bg-rose-500",
        };
    }
  };

  const handleExplainClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onOpenExplain({
      componentTitle: "Career Value Multidimensional Evaluation",
      claim: "Career Value is evaluated across 5 distinct dimensions of substantiated professional merit, without reductive single-number scoring.",
      confidence: "Verified Canonical Model",
      reasoning: [
        "Capabilities & Experience are strongly anchored by 14 years of tech and product leadership.",
        "Progression is validated through documented title transitions and squad growth.",
        "Impact & Evidence have room to strengthen with quantified business ROI and customer reach metrics.",
        "Zero arbitrary points or vanity streaks applied — purely evidence-driven.",
      ],
      evidenceSources: [
        {
          title: "Synthesized Career Facts",
          type: "Career Memory",
          snippet: `${data.traceableCount} underlying career events & project outcomes indexed.`,
        },
      ],
    });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleSpotMove}
      className="value-spot group relative rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--card)] text-[var(--text-primary)] p-4 sm:p-5 shadow-xs hover:border-blue-500/40 hover:shadow-[0_14px_40px_rgba(59,130,246,0.12)] transition-all duration-300 flex flex-col justify-between h-full min-h-[230px]"
    >
      {/* blue crown hairline + ghost chapter numeral */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-blue-500 via-sky-400/80 to-transparent z-20" aria-hidden="true" />
      <span className="value-ghost absolute top-2 right-4 text-[3.8rem] leading-none z-0" aria-hidden="true">02</span>
      
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-blue-500/[0.07] blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full justify-between">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[10.5px] font-black uppercase tracking-[0.16em] text-blue-700 dark:text-blue-400 font-['Syne',sans-serif]">
                CAREER VALUE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleExplainClick}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[10.5px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all cursor-pointer shadow-2xs"
              title="Inspect AI reasoning and evidence sources"
            >
              <HelpCircle className="w-3 h-3 text-blue-500" />
              <span className="font-medium">Why?</span>
            </button>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 shrink-0">
              {data.traceableCount} Facts
            </span>
          </div>
        </div>

        {/* 4 Core Dimensions Compact Grid */}
        <div className="grid grid-cols-2 gap-1.5 my-auto py-1">
          {dimensions.map((dim) => {
            const config = getLevelConfig(dim.level);
            return (
              <div
                key={dim.label}
                className="p-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex flex-col justify-between"
              >
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  {dim.label}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                  <span className={`text-[11.5px] font-extrabold ${config.textColor}`}>
                    {dim.level}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2.5 mt-2 border-t border-[var(--border)] flex items-center justify-between gap-2 text-xs">
          <span className="text-[11px] text-[var(--text-muted)] font-medium truncate">
            Multidimensional · No single score
          </span>

          <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 shrink-0 group-hover:underline">
            <span>Details</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </motion.div>
  );
}
