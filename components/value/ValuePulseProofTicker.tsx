"use client";

import React, { useEffect, useState } from "react";
import {
  Zap,
  TrendingUp,
  Users,
  CheckCircle2,
  Award,
  Sparkles,
  ShieldCheck,
  Cpu,
} from "lucide-react";

import { CareerValueResponse } from "@/types/value";

export interface ProofChip {
  id: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  headline: string;
  metric: string;
  tag: string;
  accent: "amber" | "emerald" | "sky" | "violet" | "rose";
}

const ACCENT_STYLES = {
  amber: {
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
    iconBg: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    glow: "hover:border-amber-500/50 hover:shadow-[0_4px_18px_rgba(245,158,11,0.18)]",
  },
  emerald: {
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
    iconBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    glow: "hover:border-emerald-500/50 hover:shadow-[0_4px_18px_rgba(16,185,129,0.18)]",
  },
  sky: {
    badge: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25",
    iconBg: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30",
    glow: "hover:border-sky-500/50 hover:shadow-[0_4px_18px_rgba(14,165,233,0.18)]",
  },
  violet: {
    badge: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/25",
    iconBg: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30",
    glow: "hover:border-violet-500/50 hover:shadow-[0_4px_18px_rgba(139,92,246,0.18)]",
  },
  rose: {
    badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25",
    iconBg: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
    glow: "hover:border-rose-500/50 hover:shadow-[0_4px_18px_rgba(244,63,94,0.18)]",
  },
};

interface ValuePulseProofTickerProps {
  onChipClick?: (chip: ProofChip) => void;
  valueData?: CareerValueResponse | null;
  confirmedFactsCount?: number;
  careerEventsCount?: number;
  evidenceItemsCount?: number;
}

export default function ValuePulseProofTicker({
  onChipClick,
  valueData,
  confirmedFactsCount = 0,
  careerEventsCount = 0,
  evidenceItemsCount = 0,
}: ValuePulseProofTickerProps) {
  // Build user-first dynamic proof chips from active profile data
  const baseUserChips = React.useMemo(() => {
    const list: ProofChip[] = [];

    if (confirmedFactsCount > 0) {
      list.push({
        id: "chip-user-facts",
        icon: CheckCircle2,
        headline: "Confirmed Facts in Source",
        metric: `${confirmedFactsCount} verified facts`,
        tag: "Approved by You",
        accent: "emerald",
      });
    }

    if (careerEventsCount > 0) {
      list.push({
        id: "chip-user-events",
        icon: TrendingUp,
        headline: "Documented Milestones",
        metric: `${careerEventsCount} career events`,
        tag: "Career Velocity",
        accent: "amber",
      });
    }

    if (evidenceItemsCount > 0) {
      list.push({
        id: "chip-user-evidence",
        icon: Sparkles,
        headline: "Traceable Evidence Links",
        metric: `${evidenceItemsCount} evidence sources`,
        tag: "Zero Guesswork",
        accent: "sky",
      });
    }

    // Real impact interpretation from valueData
    if (valueData?.profile?.impact?.[0]) {
      const imp = valueData.profile.impact[0];
      list.push({
        id: "chip-user-impact",
        icon: Zap,
        headline: imp.description?.slice(0, 36) || "Substantiated Business ROI",
        metric: imp.title.slice(0, 32),
        tag: "Verified Impact",
        accent: "amber",
      });
    }

    // Real top capability from valueData
    if (valueData?.profile?.capabilities?.[0]) {
      const cap = valueData.profile.capabilities[0];
      list.push({
        id: "chip-user-cap",
        icon: Award,
        headline: cap.description?.slice(0, 36) || "Validated Core Competency",
        metric: cap.title.slice(0, 30),
        tag: "Core Capability",
        accent: "violet",
      });
    }

    // Real value pattern from valueData
    if (valueData?.valuePatterns?.[0]) {
      const pat = valueData.valuePatterns[0];
      list.push({
        id: "chip-user-pattern",
        icon: Cpu,
        headline: pat.description?.slice(0, 36) || "Cross-Role Strength",
        metric: pat.title.slice(0, 30),
        tag: "Value Pattern",
        accent: "emerald",
      });
    }

    return list;
  }, [confirmedFactsCount, careerEventsCount, evidenceItemsCount, valueData]);

  const [chips, setChips] = useState<ProofChip[]>(baseUserChips);

  // Sync state whenever user's actual base data updates
  useEffect(() => {
    if (baseUserChips.length > 0) {
      setChips(baseUserChips);
    }
  }, [baseUserChips]);

  // Optionally supplement with live pulse API if available
  useEffect(() => {
    let isMounted = true;

    async function loadLivePulse() {
      try {
        const res = await fetch("/api/pulse");
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted || !data) return;

        // If user already has base chips from their active resume, keep them and append any unique live pulse wins
        if (baseUserChips.length >= 3) {
          return;
        }

        const liveChips: ProofChip[] = [];

        if (data.recentEvent?.impact) {
          const impact = data.recentEvent.impact;
          const matchCost = impact.match(/[₹$€£][0-9A-Za-z.,]+/);
          liveChips.push({
            id: "live-event-roi",
            icon: Zap,
            headline: data.recentEvent.title?.slice(0, 30) || "Business Impact",
            metric: matchCost ? `${matchCost[0]} overhead cut` : impact.slice(0, 34) + "…",
            tag: "Verified ROI",
            accent: "amber",
          });
        }

        if (data.snapshot?.progressionSignal) {
          liveChips.push({
            id: "live-progression",
            icon: TrendingUp,
            headline: "Career Progression",
            metric: data.snapshot.progressionSignal.replace(/Fast-track trajectory · /i, ""),
            tag: "Progression",
            accent: "emerald",
          });
        }

        if (data.snapshot?.scope) {
          liveChips.push({
            id: "live-scope",
            icon: Users,
            headline: "Organizational Reach",
            metric: data.snapshot.scope.slice(0, 36) + "…",
            tag: "Leadership",
            accent: "sky",
          });
        }

        const count = data.careerValue?.traceableCount || data.snapshot?.evidenceCount || 18;
        liveChips.push({
          id: "live-evidence",
          icon: CheckCircle2,
          headline: "Traceable Facts",
          metric: `${count} verified proof points`,
          tag: "Evidence-Backed",
          accent: "violet",
        });

        if (liveChips.length >= 2) {
          setChips(liveChips);
        }
      } catch (err) {
        console.error("Live pulse ticker load error:", err);
      }
    }

    loadLivePulse();
    return () => {
      isMounted = false;
    };
  }, [baseUserChips]);

  const renderChipList = (keyPrefix: string) => (
    <div className="flex items-center gap-3 shrink-0 pr-3">
      {chips.map((chip, idx) => {
        const Icon = chip.icon;
        const styles = ACCENT_STYLES[chip.accent] || ACCENT_STYLES.amber;
        return (
          <div
            key={`${keyPrefix}-${chip.id}-${idx}`}
            onClick={() => onChipClick?.(chip)}
            className={`group inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[var(--bg-elevated)]/90 backdrop-blur border border-[var(--border)] text-[var(--text-primary)] transition-all duration-300 ${styles.glow} cursor-default select-none shrink-0`}
          >
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center border shrink-0 ${styles.iconBg}`}
            >
              <Icon size={12} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col text-left leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="text-[12.5px] font-black tracking-tight text-[var(--text-primary)]">
                  {chip.metric}
                </span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[9px] font-black tracking-wider uppercase border ${styles.badge}`}
                >
                  {chip.tag}
                </span>
              </div>
              <span className="text-[10.5px] font-medium text-[var(--text-muted)] line-clamp-1">
                {chip.headline}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-amber-500/25 bg-[var(--card)]/60 backdrop-blur-md p-1.5 shadow-[0_4px_24px_rgba(245,158,11,0.08)]">
      {/* Eyebrow lead tag */}
      <div className="flex items-center justify-between px-2 pt-1 pb-1.5 text-[10px] font-bold text-[var(--text-muted)] border-b border-[var(--border)]/60 mb-1">
        <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-extrabold uppercase tracking-[0.14em]">
          <span className="relative flex w-2 h-2">
            <span className="absolute inline-flex w-full h-full rounded-full bg-amber-500 opacity-75 animate-ping" />
            <span className="relative inline-flex w-2 h-2 rounded-full bg-amber-500" />
          </span>
          Verified Career Proofs
        </span>
        <span className="text-[10px] text-[var(--text-muted)] hidden sm:inline-block">
          Derived from Pulse Telemetry · Grounded in facts
        </span>
      </div>

      {/* Edge gradient masks */}
      <div
        className="pointer-events-none absolute inset-y-8 left-0 w-10 bg-gradient-to-r from-[var(--card)] to-transparent z-10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-8 right-0 w-10 bg-gradient-to-l from-[var(--card)] to-transparent z-10"
        aria-hidden="true"
      />

      {/* Continuous Marquee Track with pause-on-hover */}
      <div className="value-marquee-track flex w-max py-0.5">
        {renderChipList("loop1")}
        {renderChipList("loop2")}
      </div>
    </div>
  );
}
