"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Award,
  Layers,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { CareerValueData, QualitativeLevel, AiTraceabilityContext } from "./types";

interface Props {
  data: CareerValueData;
  onOpenExplain: (ctx: AiTraceabilityContext) => void;
  forceExpand?: boolean;
}

export default function CareerValueCard({ data, onOpenExplain, forceExpand }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const expanded = forceExpand !== undefined ? forceExpand : isExpanded;
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, amount: 0.15 });
  const dimensions: {
    label: string;
    level: QualitativeLevel;
    icon: any;
    description: string;
  }[] = [
    {
      label: "Capabilities",
      level: data.capabilities,
      icon: Layers,
      description: "Demonstrated technical & strategic problem solving skills",
    },
    {
      label: "Impact",
      level: data.impact,
      icon: TrendingUp,
      description: "Documented business, financial, and organizational ROI",
    },
    {
      label: "Experience",
      level: data.experience,
      icon: Award,
      description: "Tenure, senior role complexity & operational ownership",
    },
    {
      label: "Progression",
      level: data.progression,
      icon: Sparkles,
      description: "Trajectory of expanding scope, titles, and team leadership",
    },
    {
      label: "Evidence",
      level: data.evidence,
      icon: ShieldCheck,
      description: "Traceable real-world facts, metrics & stakeholder validation",
    },
  ];

  const getLevelConfig = (level: QualitativeLevel) => {
    switch (level) {
      case "Well evidenced":
        return {
          percent: 100,
          color: "from-emerald-500 to-teal-400",
          textColor: "text-emerald-700 dark:text-emerald-300",
          badgeBg: "bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/30 text-emerald-800 dark:text-emerald-300",
          glow: "rgba(16, 185, 129, 0.35)",
        };
      case "Strong":
        return {
          percent: 85,
          color: "from-emerald-500 to-emerald-400",
          textColor: "text-emerald-700 dark:text-emerald-300",
          badgeBg: "bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/30 text-emerald-800 dark:text-emerald-300",
          glow: "rgba(16, 185, 129, 0.25)",
        };
      case "Established":
        return {
          percent: 68,
          color: "from-cyan-500 to-blue-500",
          textColor: "text-cyan-700 dark:text-cyan-300",
          badgeBg: "bg-cyan-500/10 dark:bg-cyan-500/15 border-cyan-500/30 text-cyan-800 dark:text-cyan-300",
          glow: "rgba(6, 182, 212, 0.25)",
        };
      case "Developing":
        return {
          percent: 48,
          color: "from-amber-500 to-amber-400",
          textColor: "text-amber-700 dark:text-amber-300",
          badgeBg: "bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/30 text-amber-800 dark:text-amber-300",
          glow: "rgba(245, 158, 11, 0.25)",
        };
      case "Emerging":
      case "Needs strengthening":
      default:
        return {
          percent: 30,
          color: "from-rose-500 to-orange-400",
          textColor: "text-rose-700 dark:text-rose-300",
          badgeBg: "bg-rose-500/10 dark:bg-rose-500/15 border-rose-500/30 text-rose-800 dark:text-rose-300",
          glow: "rgba(244, 63, 94, 0.25)",
        };
    }
  };

  const handleExplainClick = () => {
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
        {
          title: "User Agency Protocol",
          type: "AI Guardrail",
          snippet: "You can modify, reject, or enrich each capability hypothesis.",
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
      className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-gradient-to-br dark:from-[#101A38] dark:via-[#12224F] dark:to-[#0D1530] text-[var(--text-primary)] p-5 sm:p-6 shadow-[0_4px_20px_rgba(16,27,59,0.05)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.6)] hover:shadow-[0_12px_36px_rgba(16,27,59,0.12)] dark:hover:shadow-[0_24px_64px_rgba(0,0,0,0.75)] hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300 flex flex-col justify-between"
    >
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-violet-600/5 dark:bg-violet-600/10 blur-3xl pointer-events-none" />

      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-400/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-[0.16em] text-blue-700 dark:text-blue-400 font-['Syne',sans-serif]">
                  CAREER VALUE
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-blue-500/15 text-blue-800 dark:text-blue-300 border border-blue-400/30">
                  Multidimensional
                </span>
              </div>
              <p className="text-[11.5px] text-[var(--text-muted)] font-medium">
                5 qualitative pillars of substantiated career equity
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleExplainClick}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/15 text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer shadow-2xs"
              title="Inspect dimension criteria"
            >
              <HelpCircle className="w-3 h-3 text-blue-500" />
              <span className="hidden sm:inline font-medium">Criteria</span>
            </button>
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

        {/* 5 Dimensions Meter List */}
        <div className="space-y-2 mb-4">
          {dimensions.map((dim) => {
            const config = getLevelConfig(dim.level);
            const Icon = dim.icon;
            return (
              <div
                key={dim.label}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100/70 dark:hover:bg-white/[0.06] border border-slate-200 dark:border-white/5 transition-all cursor-default"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span className="text-xs font-bold text-[var(--text-primary)] font-['Syne',sans-serif]">
                      {dim.label}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${config.badgeBg}`}
                  >
                    {dim.level}
                  </span>
                </div>

                {/* Qualitative Bar Meter */}
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={isInView ? { width: `${config.percent}%` } : { width: 0 }}
                    transition={{ duration: 0.8, delay: dimensions.indexOf(dim) * 0.1, ease: "easeOut" }}
                    className={`h-full rounded-full bg-gradient-to-r ${config.color}`}
                  />
                </div>
                {expanded && (
                  <p className="text-[10.5px] text-[var(--text-muted)] mt-1 font-medium leading-tight">
                    {dim.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer & Deep Dive CTA */}
      <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>
            {data.traceableCount} verified facts
            {expanded && data.pendingReviewCount > 0 && ` · ${data.pendingReviewCount} review pending`}
          </span>
        </div>

        <Link
          href="/value"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/30 border border-blue-200 dark:border-blue-400/30 text-xs font-bold text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-white transition-all shadow-2xs no-underline"
        >
          <span>View Career Value</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </motion.div>
  );
}
