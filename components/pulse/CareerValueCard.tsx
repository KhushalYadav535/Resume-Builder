"use client";

import { useRef } from "react";
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
}

export default function CareerValueCard({ data, onOpenExplain }: Props) {
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
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      whileHover={{ y: -4, transition: { duration: 0.22 } }}
      transition={{ duration: 0.45, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-gradient-to-br dark:from-[#101A38] dark:via-[#12224F] dark:to-[#0D1530] text-[var(--text-primary)] p-7 sm:p-8 shadow-[0_4px_24px_rgba(16,27,59,0.06)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)] hover:shadow-[0_16px_48px_rgba(16,27,59,0.14)] dark:hover:shadow-[0_32px_80px_rgba(0,0,0,0.8)] hover:border-slate-300 dark:hover:border-white/20 transition-shadow transition-colors duration-300 flex flex-col justify-between"
    >
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-violet-600/5 dark:bg-violet-600/10 blur-3xl pointer-events-none" />

      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-400/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-[0.16em] text-blue-700 dark:text-blue-400 font-['Syne',sans-serif]">
                  What I Have Built · Career Value
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-800 dark:text-blue-300 border border-blue-400/30">
                  Multidimensional
                </span>
              </div>
              <p className="text-[12px] text-[var(--text-muted)] font-medium">
                5 qualitative pillars of substantiated career equity
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExplainClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/15 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer shadow-2xs"
            title="Inspect dimension criteria"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden sm:inline font-medium">Criteria</span>
          </button>
        </div>

        {/* 5 Dimensions Meter List */}
        <div className="space-y-4 mb-6">
          {dimensions.map((dim) => {
            const config = getLevelConfig(dim.level);
            const Icon = dim.icon;
            return (
            <motion.div
                key={dim.label}
                whileHover={{ scale: 1.01, x: 2, transition: { duration: 0.18 } }}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100/70 dark:hover:bg-white/[0.06] border border-slate-200 dark:border-white/5 transition-all cursor-default"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span className="text-xs font-bold text-[var(--text-primary)] font-['Syne',sans-serif]">
                      {dim.label}
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${config.badgeBg}`}
                  >
                    {dim.level}
                  </span>
                </div>

                {/* Qualitative Bar Meter — animates when card scrolls into view */}
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={isInView ? { width: `${config.percent}%` } : { width: 0 }}
                    transition={{ duration: 0.9, delay: dimensions.indexOf(dim) * 0.12, ease: "easeOut" }}
                    className={`h-full rounded-full bg-gradient-to-r ${config.color} shadow-sm`}
                    style={{ boxShadow: `0 0 12px ${config.glow}` }}
                  />
                </div>
                <p className="text-[11px] text-[var(--text-muted)] mt-1.5 font-medium line-clamp-1">
                  {dim.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Footer & Deep Dive CTA */}
      <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>
            {data.traceableCount} verified facts ·{" "}
            {data.pendingReviewCount > 0
              ? `${data.pendingReviewCount} ready for review`
              : "fully calibrated"}
          </span>
        </div>

        <Link
          href="/value/profile"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/30 border border-blue-200 dark:border-blue-400/30 text-xs font-bold text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-white transition-all shadow-xs no-underline w-fit"
        >
          <span>View Career Value</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}
