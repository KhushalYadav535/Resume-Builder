"use client";

import { useRef, useEffect } from "react";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import {
  Sparkles,
  Building2,
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import { SnapshotData, AiTraceabilityContext } from "./types";
import { handleSpotMove } from "./pulseSpot";

interface Props {
  data: SnapshotData;
  onOpenExplain: (ctx: AiTraceabilityContext) => void;
  forceExpand?: boolean;
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
        ease: [0.33, 1, 0.68, 1],
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
      onMouseMove={handleSpotMove}
      className="value-spot group relative rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--card)] text-[var(--text-primary)] p-4 sm:p-5 shadow-xs hover:shadow-[0_14px_40px_rgba(245,158,11,0.14)] hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between h-full min-h-[230px]"
    >
      {/* gold crown hairline + ghost chapter numeral */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-amber-500 via-amber-400/80 to-transparent z-20" aria-hidden="true" />
      <span className="value-ghost absolute top-2 right-4 text-[3.8rem] leading-none z-0" aria-hidden="true">01</span>
      
      {/* Ambient background glows */}
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-amber-500/[0.08] blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full justify-between">
        {/* Top header */}
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[10.5px] font-black uppercase tracking-[0.16em] text-amber-700 dark:text-amber-400 font-['Syne',sans-serif]">
                CAREER SNAPSHOT
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
              <HelpCircle className="w-3 h-3 text-amber-500" />
              <span className="font-medium">Why?</span>
            </button>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 shrink-0">
              <motion.span>{yearsDisplay}</motion.span>y exp
            </span>
          </div>
        </div>

        {/* Bite-sized Role & Scope */}
        <div className="my-auto space-y-1.5 py-1">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <h3 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] truncate font-['Syne',sans-serif]">
              {data.currentRole}
            </h3>
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-medium truncate">
            {data.organization} · {data.headline}
          </p>
          <p className="text-[11.5px] text-[var(--text-muted)] line-clamp-1 leading-relaxed">
            {data.scope}
          </p>

          {/* Capabilities badge row (compact 2 items) */}
          <div className="flex items-center gap-1 pt-0.5">
            {data.capabilities.slice(0, 2).map((cap) => (
              <span
                key={cap}
                className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] truncate max-w-[120px]"
              >
                {cap}
              </span>
            ))}
            {data.capabilities.length > 2 && (
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                +{data.capabilities.length - 2} more
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2.5 mt-2 border-t border-[var(--border)] flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981] shrink-0" />
            <span className="text-[11px] text-[var(--text-muted)] font-medium truncate">{data.progressionSignal}</span>
          </div>

          <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 shrink-0 group-hover:underline">
            <span>Details</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </motion.div>
  );
}
