"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Calendar, Link2, ArrowRight, ShieldCheck, Database, Ban } from "lucide-react";
import { EvidenceSummary } from "@/types/value";
import ValueSectionHeader from "./ValueSectionHeader";

interface EvidenceFoundationCardProps {
  evidenceSummary: EvidenceSummary;
  onExploreFacts: () => void;
}

function useCountUp(target: number, duration = 1100): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const total = reduced ? 1 : duration;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / total);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function MetricPillar({
  label,
  value,
  hint,
  footer,
  icon,
  iconWrap,
  bar,
  max,
  delay,
  rank,
  onClick,
}: {
  label: string;
  value: number;
  hint: string;
  footer: string;
  icon: React.ReactNode;
  iconWrap: string;
  bar: string;
  max: number;
  delay: string;
  rank: string;
  onClick: () => void;
}) {
  const animated = useCountUp(value);
  const pct = Math.max(8, Math.round((value / max) * 100));

  return (
    <div
      onClick={onClick}
      className="group relative p-4 sm:p-5 rounded-2xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-emerald-500/40 overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between shadow-xs"
      title={`Click to explore ${label}`}
    >
      <span aria-hidden="true" className="value-ghost pointer-events-none absolute top-2 right-4 text-[3.8rem] leading-none z-0">
        {rank}
      </span>

      <div className="relative z-10 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10.5px] font-black text-[var(--text-muted)] uppercase tracking-wider font-['Syne',sans-serif]">
            {label}
          </span>
          <span className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${iconWrap} shadow-2xs`}>
            {icon}
          </span>
        </div>

        <div
          className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)] font-['Syne',sans-serif] tabular-nums leading-none"
          aria-label={`${label}: ${value}`}
        >
          {animated}
        </div>

        <p className="text-[11.5px] text-[var(--text-muted)] line-clamp-1 leading-relaxed">
          {hint}
        </p>

        <div
          className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden"
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        >
          <div
            className={`h-full rounded-full bg-gradient-to-r ${bar} transition-all`}
            style={{ width: `${pct}%`, transitionDelay: delay }}
          />
        </div>
      </div>

      <div className="relative z-10 pt-2.5 mt-2 border-t border-[var(--border)] flex items-center justify-between text-xs">
        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{footer}</span>
        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 group-hover:underline flex items-center gap-0.5">
          <span>Explore</span>
          <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </div>
  );
}

export default function EvidenceFoundationCard({
  evidenceSummary,
  onExploreFacts,
}: EvidenceFoundationCardProps) {
  const max = Math.max(1, evidenceSummary.confirmedFacts, evidenceSummary.careerEvents, evidenceSummary.evidenceItems);

  return (
    <section id="value-evidence" aria-label="Evidence foundation" className="value-anchor relative rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-[0_6px_24px_rgba(16,27,59,0.04)] overflow-hidden">
      {/* 2px Crown hairline */}
      <div className="h-[2px] w-full bg-gradient-to-r from-emerald-500 via-sky-500/60 to-violet-500/60" aria-hidden="true" />
      <span className="value-ghost absolute top-2 right-4 text-[4rem]" aria-hidden="true">03</span>

      <div className="p-5 sm:p-6 space-y-4 relative z-10">
        <ValueSectionHeader
          index="03"
          eyebrow="Grounded Record"
          eyebrowClass="text-emerald-600 dark:text-emerald-400"
          icon={<Database size={18} strokeWidth={2.2} />}
          iconClass="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-500/40 shadow-xs"
          title="Evidence Foundation"
          description="The verifiable substrate beneath every claim — facts, events and links. No scores, only proof."
          badge={
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              <ShieldCheck size={14} />
              <span>Provable Record</span>
            </div>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <MetricPillar
            label="Confirmed Facts"
            value={evidenceSummary.confirmedFacts}
            hint="Verified atomic facts from resume & journal"
            footer="Authoritative inputs"
            icon={<CheckCircle2 size={14} />}
            iconWrap="bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
            bar="from-emerald-500 to-teal-400"
            max={max}
            delay="0.1s"
            rank="01"
            onClick={onExploreFacts}
          />
          <MetricPillar
            label="Career Events"
            value={evidenceSummary.careerEvents}
            hint="Milestones, achievements & leadership tenures"
            footer="Timeline anchored"
            icon={<Calendar size={14} />}
            iconWrap="bg-sky-500/15 border-sky-500/30 text-sky-600 dark:text-sky-400"
            bar="from-sky-500 to-blue-400"
            max={max}
            delay="0.22s"
            rank="02"
            onClick={onExploreFacts}
          />
          <MetricPillar
            label="Evidence Links"
            value={evidenceSummary.evidenceItems}
            hint="Clusters connecting verified facts to meaning"
            footer="Interpretation-ready"
            icon={<Link2 size={14} />}
            iconWrap="bg-violet-500/15 border-violet-500/30 text-violet-600 dark:text-violet-400"
            bar="from-violet-500 to-purple-400"
            max={max}
            delay="0.34s"
            rank="03"
            onClick={onExploreFacts}
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] leading-relaxed">
            <Ban size={14} className="text-amber-500 shrink-0" />
            <span>
              Zero arbitrary scores. Value is derived purely from your verified career facts.
            </span>
          </div>

          <button
            onClick={onExploreFacts}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[var(--card)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-primary)] hover:border-emerald-500/50 transition-all cursor-pointer shrink-0"
          >
            <span>Explore Facts</span>
            <ArrowRight size={13} className="text-emerald-500" />
          </button>
        </div>
      </div>
    </section>
  );
}
