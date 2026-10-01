"use client";

import React, { useMemo } from "react";
import {
  User,
  Layers,
  TrendingUp,
  Compass,
  Zap,
  ChevronRight,
  Timer,
} from "lucide-react";
import { PulseDashboardData, QualitativeLevel } from "./types";

interface Props {
  data: PulseDashboardData;
}

const levelRank: Record<QualitativeLevel, number> = {
  "Needs strengthening": 0,
  Emerging: 1,
  Developing: 2,
  Established: 3,
  Strong: 4,
  "Well evidenced": 5,
};

interface GlanceItem {
  href: string;
  eyebrow: string;
  icon: React.ElementType;
  title: string;
  sub: string;
  accent: string;
}

/**
 * "Your 15-second pulse" — one glanceable strip answering the four
 * orientation questions. Each item jumps to its full card below.
 * Pure presentational; null-safe across all scenarios.
 */
export default function PulseAtAGlance({ data }: Props) {
  const items: GlanceItem[] = useMemo(() => {
    const dims: { key: string; level: QualitativeLevel }[] = [
      { key: "Capabilities", level: data.careerValue.capabilities },
      { key: "Impact", level: data.careerValue.impact },
      { key: "Experience", level: data.careerValue.experience },
      { key: "Progression", level: data.careerValue.progression },
      { key: "Evidence", level: data.careerValue.evidence },
    ];
    const sorted = [...dims].sort((a, b) => levelRank[b.level] - levelRank[a.level]);
    const strongest = sorted[0];
    const weakest = sorted[sorted.length - 1];

    const primaryProgress = data.recentProgress.find((i) => i.isPrimary) || data.recentProgress[0];

    const heading = data.careerGoal
      ? { title: data.careerGoal.title, sub: `${data.careerGoal.timeframe} · ${data.careerGoal.status}`, href: "#pulse-goal" }
      : {
          title: data.careerDirection.title,
          sub: `${data.careerDirection.confidence} trajectory`,
          href: "#pulse-direction",
        };

    return [
      {
        href: "#pulse-snapshot",
        eyebrow: "Where you stand",
        icon: User,
        title: data.snapshot.headline,
        sub: `${data.snapshot.currentRole} · ${data.snapshot.experience}y · ${data.snapshot.evidenceCount} facts`,
        accent: "text-amber-500",
      },
      {
        href: "#pulse-value",
        eyebrow: "What you've built",
        icon: Layers,
        title: `${data.careerValue.traceableCount} verified facts`,
        sub: `Strongest: ${strongest.key} · Focus: ${weakest.key}`,
        accent: "text-blue-500",
      },
      {
        href: "#pulse-progress",
        eyebrow: "What's moved",
        icon: TrendingUp,
        title: primaryProgress ? primaryProgress.title : "No movement logged yet",
        sub: primaryProgress
          ? primaryProgress.category || "Recent advancement"
          : "Log a win to start your trajectory",
        accent: "text-teal-500",
      },
      {
        href: heading.href,
        eyebrow: data.careerGoal ? "What you want" : "Where you're heading",
        icon: Compass,
        title: heading.title,
        sub: heading.sub,
        accent: "text-violet-500",
      },
      {
        href: "#pulse-action",
        eyebrow: "Do this next",
        icon: Zap,
        title: data.nextBestAction.title,
        sub: data.nextBestAction.cta,
        accent: "text-amber-500",
      },
    ];
  }, [data]);

  return (
    <section
      aria-label="Your 15 second pulse"
      className="value-rise relative rounded-[1.4rem] border border-[var(--border)] bg-[var(--card)]/85 backdrop-blur shadow-[0_12px_40px_rgba(16,27,59,0.08)] overflow-hidden mb-5 sm:mb-6"
    >
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" aria-hidden="true" />
      <div className="px-4 sm:px-5 pt-3.5 pb-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex w-2 h-2">
              <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-500 opacity-60 animate-ping" />
              <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--text-primary)] font-['Syne',sans-serif]">
              Your 15-second pulse
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--text-muted)]">
            <Timer size={12} className="text-amber-500" />
            <span className="hidden sm:inline">Tap any signal to jump to its card</span>
            <span className="sm:hidden">Tap to jump</span>
          </span>
        </div>

        <div className="value-noscroll flex gap-2.5 overflow-x-auto pb-1">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.href + item.eyebrow}
                href={item.href}
                className="group min-w-[210px] max-w-[260px] flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]/60 hover:bg-[var(--bg-elevated)] hover:border-amber-500/45 hover:shadow-[0_10px_28px_rgba(245,158,11,0.14)] hover:-translate-y-0.5 transition-all p-3 no-underline"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    {item.eyebrow}
                  </span>
                  <Icon size={13} className={`${item.accent} shrink-0`} />
                </div>
                <p className="text-[13px] font-extrabold text-[var(--text-primary)] leading-snug line-clamp-2">
                  {item.title}
                </p>
                <p className="mt-1 flex items-center justify-between gap-2 text-[11px] text-[var(--text-muted)]">
                  <span className="truncate">{item.sub}</span>
                  <ChevronRight size={12} className="shrink-0 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
                </p>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
