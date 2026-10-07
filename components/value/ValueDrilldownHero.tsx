"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type DrilldownAccent = "amber" | "emerald" | "sky" | "violet";

export interface HeroCrumb {
  label: string;
  href?: string;
}

export interface HeroStat {
  value: string | number;
  label: string;
}

const ACCENT: Record<
  DrilldownAccent,
  {
    crown: string;
    orbA: string;
    orbB: string;
    eyebrow: string;
    iconWrap: string;
    statValue: string;
    chip: string;
  }
> = {
  amber: {
    crown: "from-amber-500 via-amber-400/70 to-transparent",
    orbA: "bg-amber-500/[0.10]",
    orbB: "bg-violet-500/[0.07]",
    eyebrow: "text-amber-600 dark:text-amber-400",
    iconWrap: "bg-amber-500/12 text-amber-500 border-amber-500/30 shadow-[0_6px_18px_rgba(245,158,11,0.25)]",
    statValue: "text-amber-600 dark:text-amber-400",
    chip: "bg-amber-500/10 border-amber-500/25 text-amber-700 dark:text-amber-300",
  },
  emerald: {
    crown: "from-emerald-500 via-teal-400/70 to-transparent",
    orbA: "bg-emerald-500/[0.10]",
    orbB: "bg-sky-500/[0.07]",
    eyebrow: "text-emerald-600 dark:text-emerald-400",
    iconWrap: "bg-emerald-500/12 text-emerald-500 border-emerald-500/30 shadow-[0_6px_18px_rgba(16,185,129,0.22)]",
    statValue: "text-emerald-600 dark:text-emerald-400",
    chip: "bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-300",
  },
  sky: {
    crown: "from-sky-500 via-blue-400/70 to-transparent",
    orbA: "bg-sky-500/[0.10]",
    orbB: "bg-violet-500/[0.07]",
    eyebrow: "text-sky-600 dark:text-sky-400",
    iconWrap: "bg-sky-500/12 text-sky-500 border-sky-500/30 shadow-[0_6px_18px_rgba(14,165,233,0.22)]",
    statValue: "text-sky-600 dark:text-sky-400",
    chip: "bg-sky-500/10 border-sky-500/25 text-sky-700 dark:text-sky-300",
  },
  violet: {
    crown: "from-violet-500 via-purple-400/70 to-transparent",
    orbA: "bg-violet-500/[0.10]",
    orbB: "bg-amber-500/[0.07]",
    eyebrow: "text-violet-600 dark:text-violet-400",
    iconWrap: "bg-violet-500/12 text-violet-500 border-violet-500/30 shadow-[0_6px_18px_rgba(139,92,246,0.24)]",
    statValue: "text-violet-600 dark:text-violet-400",
    chip: "bg-violet-500/10 border-violet-500/25 text-violet-700 dark:text-violet-300",
  },
};

interface ValueDrilldownHeroProps {
  crumbs: HeroCrumb[];
  eyebrow: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  accent?: DrilldownAccent;
  ghostWord: string;
  /** Informational counts only — never scores (Spec §3, §8). */
  stats?: HeroStat[];
  /** AI summary line shown above the stats. */
  summary?: string;
  badge?: React.ReactNode;
}

/**
 * Cinematic drill-down hero — breadcrumb trail (Spec §25), ghost display
 * type, ambient mesh orbs and an informational stat strip. Same theme
 * tokens everywhere; only the accent varies per dimension.
 */
export default function ValueDrilldownHero({
  crumbs,
  eyebrow,
  title,
  description,
  icon,
  accent = "amber",
  ghostWord,
  stats,
  summary,
  badge,
}: ValueDrilldownHeroProps) {
  const a = ACCENT[accent];

  return (
    <section className="value-rise relative rounded-[1.75rem] bg-[var(--card)] border border-[var(--border)] overflow-hidden shadow-[0_20px_60px_rgba(16,27,59,0.08)]">
      {/* crown hairline */}
      <div className={`h-[3px] absolute top-0 inset-x-0 bg-gradient-to-r ${a.crown} z-20`} aria-hidden="true" />
      {/* ambient mesh */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-dot-matrix opacity-40" />
        <div className={`value-drift absolute -top-24 right-[6%] w-72 h-72 rounded-full ${a.orbA} blur-[100px]`} />
        <div className={`value-drift-slow absolute -bottom-28 left-[10%] w-64 h-64 rounded-full ${a.orbB} blur-[100px]`} />
      </div>
      {/* ghost display word */}
      <span className="value-ghost absolute right-5 top-1/2 -translate-y-1/2 text-[2.6rem] sm:text-[3.6rem] hidden md:block select-none" aria-hidden="true">
        {ghostWord}
      </span>

      <div className="relative z-10 p-6 sm:p-8 space-y-5">
        {/* breadcrumb trail (Spec §25) */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)] flex-wrap">
          {crumbs.map((c, i) => {
            const last = i === crumbs.length - 1;
            return (
              <React.Fragment key={`${c.label}-${i}`}>
                {i > 0 && <ChevronRight size={12} className="opacity-50 shrink-0" aria-hidden="true" />}
                {c.href && !last ? (
                  <Link href={c.href} className="hover:text-[var(--text-primary)] transition-colors">
                    {c.label}
                  </Link>
                ) : (
                  <span aria-current={last ? "page" : undefined} className={last ? a.eyebrow : undefined}>
                    {c.label}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${a.iconWrap}`}>
              {icon}
            </div>
            <div className="min-w-0">
              <div className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] ${a.eyebrow}`}>
                <span>{eyebrow}</span>
                <span className="w-8 h-px bg-current opacity-40" aria-hidden="true" />
              </div>
              <h2 className="mt-1 text-2xl sm:text-[2rem] font-extrabold tracking-[-0.02em] leading-[1.1] text-[var(--text-primary)] font-['Syne',sans-serif]">
                {title}
              </h2>
              <p className="mt-1.5 text-[13px] sm:text-sm text-[var(--text-muted)] max-w-2xl leading-relaxed">
                {description}
              </p>
            </div>
          </div>
          {badge && <div className="self-start lg:self-auto shrink-0">{badge}</div>}
        </div>

        {(summary || (stats && stats.length > 0)) && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)]/60 backdrop-blur px-4 sm:px-5 py-4 space-y-3">
            {summary && (
              <p className="text-[13px] sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                <span className={`font-black ${a.statValue}`}>✦ </span>
                <em className="font-medium text-[var(--text-primary)]">{summary}</em>
              </p>
            )}
            {stats && stats.length > 0 && (
              <div className={`flex items-center gap-5 sm:gap-8 flex-wrap ${summary ? "pt-3 border-t border-[var(--border)]/70" : ""}`}>
                <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--text-muted)]">Based on</span>
                {stats.map((s) => (
                  <span key={s.label} className="inline-flex items-baseline gap-1.5">
                    <span className="text-xl font-black font-['Syne',sans-serif] tabular-nums text-[var(--text-primary)]">
                      {s.value}
                    </span>
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      {s.label}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
