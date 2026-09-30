"use client";

import { useRef, useEffect } from "react";
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
}

export default function CareerSnapshotCard({ data, onOpenExplain }: Props) {
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
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      whileHover={{ y: -4, transition: { duration: 0.22 } }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-3xl overflow-hidden
        border border-amber-500/25 dark:border-amber-400/20
        bg-white dark:bg-gradient-to-br dark:from-[#0c1633] dark:via-[#101F48] dark:to-[#0A1229]
        text-[var(--text-primary)]
        p-7 sm:p-8
        shadow-[0_4px_24px_rgba(16,27,59,0.06)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.65)]
        hover:shadow-[0_16px_48px_rgba(16,27,59,0.14)] dark:hover:shadow-[0_32px_80px_rgba(0,0,0,0.8)]
        hover:border-amber-500/50 dark:hover:border-amber-400/40
        transition-shadow transition-colors duration-300 cursor-default"
    >
      {/* Ambient background glows */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-gradient-to-br from-amber-500/10 dark:from-amber-500/15 via-blue-600/5 dark:via-blue-600/10 to-transparent blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
      <div className="absolute -bottom-28 -left-20 w-72 h-72 rounded-full bg-gradient-to-tr from-violet-600/10 dark:from-violet-600/15 via-amber-500/5 to-transparent blur-3xl pointer-events-none group-hover:opacity-70 transition-opacity duration-500" />

      {/* Decorative dot grid watermark */}
      <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="relative z-10 flex flex-col h-full justify-between">
        {/* Top header */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2.5">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.4 } }}
              className="w-9 h-9 rounded-xl bg-amber-500/15 dark:bg-amber-500/20 border border-amber-500/30 dark:border-amber-400/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner"
            >
              <Sparkles className="w-4 h-4" />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-[0.16em] text-amber-700 dark:text-amber-400 font-['Syne',sans-serif]">
                  Where I Stand · Career Snapshot
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                  Verified Snapshot
                </span>
              </div>
              <p className="text-[12px] text-[var(--text-muted)] font-medium">
                Living snapshot of your current professional footprint
              </p>
            </div>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExplainClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
              bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10
              border border-slate-200 dark:border-white/15
              text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]
              transition-all cursor-pointer shadow-sm"
            title="Inspect AI reasoning and evidence sources"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline font-medium">Why this?</span>
          </motion.button>
        </div>

        {/* Main Headline & Experience */}
        <div className="space-y-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg
              bg-amber-50 dark:bg-white/10 border border-amber-200 dark:border-white/10
              text-xs font-semibold text-amber-800 dark:text-amber-300 mb-2.5">
              <Briefcase className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              {/* Animated counter */}
              <span>
                <motion.span>{yearsDisplay}</motion.span>
                {" "}Years Relevant Experience
              </span>
              <span className="w-1 h-1 rounded-full bg-amber-500/60" />
              <span>{data.evidenceCount} Evidenced Facts</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[var(--text-primary)] font-['Syne',sans-serif] leading-tight">
              {data.headline}
            </h1>
          </div>

          {/* Role & Scope Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-2xl
            bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10
            hover:bg-slate-100/70 dark:hover:bg-white/[0.06] transition-colors duration-200">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                <Building2 className="w-3.5 h-3.5 text-amber-500" />
                <span>Current Role & Org</span>
              </div>
              <p className="text-[14px] font-bold text-[var(--text-primary)]">{data.currentRole}</p>
              <p className="text-[12px] text-[var(--text-muted)] font-medium">{data.organization}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                <Users className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                <span>Responsibility & Scope</span>
              </div>
              <p className="text-[13px] text-[var(--text-secondary)] leading-snug line-clamp-2">{data.scope}</p>
            </div>
          </div>
        </div>

        {/* Capabilities */}
        <div className="space-y-2 mb-6">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-500" />
              Core Capabilities Established
            </span>
            <span className="text-[11px] text-[var(--text-muted)] lowercase">
              {data.capabilities.length} verified
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {data.capabilities.map((cap, i) => (
              <motion.span
                key={cap}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.3 + i * 0.06, duration: 0.25 }}
                whileHover={{ scale: 1.05, y: -1 }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold
                  bg-slate-50 dark:bg-white/10 hover:bg-amber-50 dark:hover:bg-amber-500/15
                  border border-slate-200 dark:border-white/10 hover:border-amber-400/40
                  text-[var(--text-primary)] transition-all shadow-sm cursor-default"
              >
                {cap}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
            <span className="text-xs text-[var(--text-secondary)] font-medium">{data.progressionSignal}</span>
          </div>

          <motion.div whileHover={{ x: 2 }}>
            <Link
              href="/value/profile"
              className="inline-flex items-center gap-1.5 text-xs font-bold
                text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300
                transition-all no-underline group/link"
            >
              <span>Explore Career Profile</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
