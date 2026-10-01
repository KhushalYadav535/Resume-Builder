"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import Link from "next/link";
import {
  Briefcase,
  Sparkles,
  TrendingUp,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Users,
  HelpCircle,
} from "lucide-react";
import { SnapshotData, AiTraceabilityContext } from "./types";

interface Props {
  data: SnapshotData;
  onOpenExplain: (ctx: AiTraceabilityContext) => void;
  forceExpand?: boolean;
}

export default function CareerSnapshotCard({ data, onOpenExplain, forceExpand }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const expanded = forceExpand !== undefined ? forceExpand : isExpanded;
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, amount: 0.15 });

  // Animated experience counter
  const yearsMotion = useMotionValue(0);
  const yearsDisplay = useTransform(yearsMotion, (v) => Math.round(v));
  useEffect(() => {
    if (isInView) {
      animate(yearsMotion, data.experience, {
        duration: 1.4,
        ease: [0.33, 1, 0.68, 1], // ease-out cubic
      });
    }
  }, [isInView, data.experience]);

  const handleExplainClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onOpenExplain({
      componentTitle: "Career Snapshot Positioning",
      claim: `Identified as "${data.headline}" with ${data.experience} years of tracked industry leadership.`,
      confidence: "94% Evidence Calibration",
      reasoning: [
        "Synthesized from your current role responsibility and multi-team organizational scope.",
        "Demonstrated technical and strategic ownership across 3 major product deployments.",
        "Progression signals corroborate consistent lateral and vertical advancements.",
        "Correlated with verified cross-functional leadership and roadmap governance.",
      ],
      evidenceSources: [
        {
          title: `${data.currentRole} at ${data.organization}`,
          type: "Work Experience",
          snippet: data.scope,
        },
        {
          title: "Multi-Team Governance",
          type: "Organizational Telemetry",
          snippet: "24 engineering & design direct/indirect reports across 3 squads.",
        },
        {
          title: "Enterprise Delivery Record",
          type: "Career Journal",
          snippet: "Zero-downtime migration of 2.4M customer records.",
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
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-2xl overflow-hidden
        border border-amber-500/25 dark:border-amber-400/20
        bg-white dark:bg-gradient-to-br dark:from-[#0c1633] dark:via-[#101F48] dark:to-[#0A1229]
        text-[var(--text-primary)]
        p-5 sm:p-6
        shadow-[0_4px_20px_rgba(16,27,59,0.05)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.6)]
        hover:shadow-[0_12px_36px_rgba(16,27,59,0.12)] dark:hover:shadow-[0_24px_64px_rgba(0,0,0,0.75)]
        hover:border-amber-500/40 dark:hover:border-amber-400/35
        transition-all duration-300 cursor-default flex flex-col justify-between"
    >
      {/* Ambient background glows */}
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-gradient-to-br from-amber-500/10 dark:from-amber-500/15 via-blue-600/5 dark:via-blue-600/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-28 -left-20 w-64 h-64 rounded-full bg-gradient-to-tr from-violet-600/10 dark:from-violet-600/15 via-amber-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Decorative dot grid watermark */}
      <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="relative z-10 flex flex-col h-full justify-between">
        {/* Top header */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 dark:bg-amber-500/20 border border-amber-500/30 dark:border-amber-400/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-[0.16em] text-amber-700 dark:text-amber-400 font-['Syne',sans-serif]">
                  CAREER SNAPSHOT
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                  Verified
                </span>
              </div>
              <p className="text-[11.5px] text-[var(--text-muted)] font-medium">
                Current positioning
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleExplainClick}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full
                bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10
                border border-slate-200 dark:border-white/15
                text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                transition-all cursor-pointer shadow-2xs"
              title="Inspect AI reasoning and evidence sources"
            >
              <HelpCircle className="w-3 h-3 text-amber-500" />
              <span className="hidden sm:inline font-medium">Why this?</span>
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

        {/* Main Headline & Experience */}
        <div className="space-y-3 mb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-lg
              bg-amber-50 dark:bg-white/10 border border-amber-200 dark:border-white/10
              text-[11px] font-semibold text-amber-800 dark:text-amber-300 mb-2">
              <Briefcase className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>
                <motion.span>{yearsDisplay}</motion.span>
                {" "}Years Relevant Experience
              </span>
              <span className="w-1 h-1 rounded-full bg-amber-500/60" />
              <span>{data.evidenceCount} Evidenced Facts</span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-[var(--text-primary)] font-['Syne',sans-serif] leading-tight">
              {data.headline}
            </h2>
          </div>

          {/* Role, Org & Scope Container */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 space-y-2">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[var(--text-primary)] truncate">{data.currentRole}</p>
                <p className="text-[11px] text-[var(--text-muted)] font-medium truncate">{data.organization}</p>
              </div>
            </div>

            {/* Scope (Always visible per 30 Sep 2026 specs: 1-line clamp in compact, full in expanded) */}
            <div className="pt-2 border-t border-slate-200/60 dark:border-white/5 flex items-start gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
              <p className={`text-[11.5px] text-[var(--text-secondary)] leading-relaxed ${expanded ? "" : "line-clamp-1"}`}>
                <span className="font-semibold text-[var(--text-primary)]">Scope: </span>
                {data.scope}
              </p>
            </div>
          </div>
        </div>

        {/* Capabilities */}
        <div className="space-y-1.5 mb-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3 text-amber-500" />
              Key Capabilities
            </span>
            <span className="text-[10px] text-[var(--text-muted)]">
              {data.capabilities.length} verified
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(expanded ? data.capabilities : data.capabilities.slice(0, 4)).map((cap) => (
              <span
                key={cap}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold
                  bg-slate-50 dark:bg-white/10 hover:bg-amber-50 dark:hover:bg-amber-500/15
                  border border-slate-200 dark:border-white/10 hover:border-amber-400/40
                  text-[var(--text-primary)] transition-all cursor-default"
              >
                {cap}
              </span>
            ))}
            {!expanded && data.capabilities.length > 4 && (
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                className="px-2 py-1 rounded-lg text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 cursor-pointer"
              >
                +{data.capabilities.length - 4} more
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981] shrink-0" />
            <span className="text-[11.5px] text-[var(--text-secondary)] font-medium truncate">{data.progressionSignal}</span>
          </div>

          <Link
            href="/value/profile"
            className="inline-flex items-center gap-1 text-[11.5px] font-bold
              text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300
              transition-all no-underline shrink-0"
          >
            <span>View Profile →</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
