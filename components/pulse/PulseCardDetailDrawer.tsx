"use client";

import React, { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Award,
  Layers,
  Building2,
  Users,
  Briefcase,
  HelpCircle,
  ArrowUpRight,
  Clock,
  Calendar,
  Zap,
  Target,
  Compass,
  CheckCircle2,
  Activity,
  Plus,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import {
  PulseCardId,
  PulseDashboardData,
  AiTraceabilityContext,
  QualitativeLevel,
} from "./types";

interface Props {
  cardId: PulseCardId | null;
  isOpen: boolean;
  onClose: () => void;
  data: PulseDashboardData;
  onSelectCard: (id: PulseCardId) => void;
  onOpenCaptureEvent: () => void;
  onOpenExplain: (ctx: AiTraceabilityContext) => void;
}

const CARD_ORDER: PulseCardId[] = [
  "snapshot",
  "value",
  "progress",
  "event",
  "direction",
  "goal",
  "action",
  "momentum",
  "explore",
];

const CARD_METADATA: Record<
  PulseCardId,
  { chapter: string; title: string; category: string; icon: React.ElementType; color: string }
> = {
  snapshot: {
    chapter: "01",
    title: "Career Snapshot",
    category: "Current Positioning",
    icon: Sparkles,
    color: "text-amber-500 bg-amber-500/10 border-amber-500/30",
  },
  value: {
    chapter: "02",
    title: "Career Value",
    category: "Multidimensional Equity",
    icon: ShieldCheck,
    color: "text-blue-500 bg-blue-500/10 border-blue-500/30",
  },
  progress: {
    chapter: "03",
    title: "Recent Progress",
    category: "Meaningful Movement",
    icon: TrendingUp,
    color: "text-teal-500 bg-teal-500/10 border-teal-500/30",
  },
  event: {
    chapter: "04",
    title: "Recent Career Event",
    category: "Latest Achievement",
    icon: Award,
    color: "text-purple-500 bg-purple-500/10 border-purple-500/30",
  },
  direction: {
    chapter: "05",
    title: "Career Direction",
    category: "Trajectory Alignment",
    icon: Compass,
    color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/30",
  },
  goal: {
    chapter: "06",
    title: "Career Goal",
    category: "Desired Outcome",
    icon: Target,
    color: "text-rose-500 bg-rose-500/10 border-rose-500/30",
  },
  action: {
    chapter: "07",
    title: "Next Best Action",
    category: "Priority Recommendation",
    icon: Zap,
    color: "text-amber-500 bg-amber-500/15 border-amber-500/40",
  },
  momentum: {
    chapter: "08",
    title: "Career Momentum",
    category: "Velocity Indicator",
    icon: Activity,
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
  },
  explore: {
    chapter: "09",
    title: "Explore Your Career",
    category: "Pathways & Opportunities",
    icon: Compass,
    color: "text-sky-500 bg-sky-500/10 border-sky-500/30",
  },
};

const getLevelConfig = (level: QualitativeLevel) => {
  switch (level) {
    case "Well evidenced":
    case "Strong":
      return {
        percent: 88,
        color: "from-blue-600 to-indigo-500",
        badgeBg: "bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-400/30",
      };
    case "Established":
      return {
        percent: 68,
        color: "from-emerald-600 to-teal-500",
        badgeBg: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-400/30",
      };
    case "Developing":
      return {
        percent: 48,
        color: "from-amber-600 to-yellow-500",
        badgeBg: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-400/30",
      };
    case "Emerging":
      return {
        percent: 30,
        color: "from-orange-600 to-amber-500",
        badgeBg: "bg-orange-500/15 text-orange-800 dark:text-orange-300 border-orange-400/30",
      };
    case "Needs strengthening":
    default:
      return {
        percent: 18,
        color: "from-rose-600 to-pink-500",
        badgeBg: "bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-400/30",
      };
  }
};

export default function PulseCardDetailDrawer({
  cardId,
  isOpen,
  onClose,
  data,
  onSelectCard,
  onOpenCaptureEvent,
  onOpenExplain,
}: Props) {
  // Navigation between cards
  const currentIndex = cardId ? CARD_ORDER.indexOf(cardId) : -1;
  const prevCard = currentIndex > 0 ? CARD_ORDER[currentIndex - 1] : null;
  const nextCard = currentIndex >= 0 && currentIndex < CARD_ORDER.length - 1 ? CARD_ORDER[currentIndex + 1] : null;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && prevCard) {
        onSelectCard(prevCard);
      } else if (e.key === "ArrowRight" && nextCard) {
        onSelectCard(nextCard);
      }
    },
    [isOpen, onClose, prevCard, nextCard, onSelectCard]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!cardId || !isOpen) return null;

  const meta = CARD_METADATA[cardId];
  const IconComponent = meta.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          aria-hidden="true"
        />

        {/* Slide-over Drawer */}
        <motion.aside
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 280 }}
          className="relative z-10 w-full max-w-xl sm:max-w-2xl h-full bg-[var(--card)] border-l border-[var(--border)] shadow-2xl flex flex-col overflow-hidden text-[var(--text-primary)]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="drawer-title"
        >
          {/* Top gold hairline */}
          <div className="h-[2px] w-full bg-gradient-to-r from-amber-500/80 via-amber-400 to-amber-500/40" />

          {/* Drawer Top Navigation Bar */}
          <div className="px-5 sm:px-6 py-4 border-b border-[var(--border)] flex items-center justify-between gap-3 bg-[var(--bg-elevated)]/40 shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-[0.14em] bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                Chapter {meta.chapter} / 09
              </span>
              <span className="text-xs font-semibold text-[var(--text-muted)] truncate hidden sm:inline">
                {meta.category}
              </span>
            </div>

            {/* Nav Arrows & Close */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={!prevCard}
                onClick={() => prevCard && onSelectCard(prevCard)}
                className={`p-1.5 rounded-xl border border-[var(--border)] text-xs font-semibold flex items-center gap-1 transition-all ${
                  prevCard
                    ? "hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] cursor-pointer"
                    : "opacity-30 cursor-not-allowed text-[var(--text-muted)]"
                }`}
                title="Previous card (Left Arrow)"
                aria-label="Previous card"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline pr-1">Prev</span>
              </button>

              <button
                type="button"
                disabled={!nextCard}
                onClick={() => nextCard && onSelectCard(nextCard)}
                className={`p-1.5 rounded-xl border border-[var(--border)] text-xs font-semibold flex items-center gap-1 transition-all ${
                  nextCard
                    ? "hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] cursor-pointer"
                    : "opacity-30 cursor-not-allowed text-[var(--text-muted)]"
                }`}
                title="Next card (Right Arrow)"
                aria-label="Next card"
              >
                <span className="hidden sm:inline pl-1">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="h-4 w-px bg-[var(--border)] mx-1" />

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all cursor-pointer"
                title="Close detail view (Esc)"
                aria-label="Close detail view"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Drawer Body — Deep Dive Details */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 value-noise">
            {/* Header Block */}
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-inner ${meta.color}`}
              >
                <IconComponent className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h2 id="drawer-title" className="text-xl sm:text-2xl font-black font-['Syne',sans-serif] tracking-tight">
                    {meta.title}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25">
                    Live Verified
                  </span>
                </div>
                <p className="text-xs sm:text-[13px] text-[var(--text-secondary)]">
                  {meta.category} · Detailed evidence breakdown and career impact calibration
                </p>
              </div>
            </div>

            {/* Content for: 01. Career Snapshot */}
            {cardId === "snapshot" && (
              <div className="space-y-5">
                <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-elevated)]/60 border border-[var(--border)] space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-xs font-bold text-amber-700 dark:text-amber-300">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>{data.snapshot.experience} Years Relevant Industry Experience</span>
                    <span className="w-1 h-1 rounded-full bg-amber-500/60" />
                    <span>{data.snapshot.evidenceCount} Verified Facts</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black font-['Syne',sans-serif] text-[var(--text-primary)]">
                    {data.snapshot.headline}
                  </h3>

                  <div className="p-3.5 rounded-xl bg-[var(--card)] border border-[var(--border)] space-y-2">
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4 text-amber-500 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-[var(--text-primary)]">{data.snapshot.currentRole}</p>
                        <p className="text-xs text-[var(--text-muted)] font-medium">{data.snapshot.organization}</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-[var(--border)] flex items-start gap-2">
                      <Users className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        <span className="font-bold text-[var(--text-primary)]">Organizational Scope: </span>
                        {data.snapshot.scope}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Capabilities Cloud */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-amber-500" />
                      Substantiated Capabilities ({data.snapshot.capabilities.length})
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data.snapshot.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] hover:border-amber-500/40 transition-colors shadow-2xs"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Progression Signal & AI Traceability */}
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse mt-1 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Progression Trajectory</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">{data.snapshot.progressionSignal}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      onOpenExplain({
                        componentTitle: "Career Snapshot Positioning",
                        claim: `Identified as "${data.snapshot.headline}" with ${data.snapshot.experience} years of tracked industry leadership.`,
                        confidence: "94% Evidence Calibration",
                        reasoning: [
                          "Synthesized from your current role responsibility and multi-team organizational scope.",
                          "Demonstrated technical and strategic ownership across major product deployments.",
                          "Progression signals corroborate consistent lateral and vertical advancements.",
                        ],
                        evidenceSources: [
                          {
                            title: `${data.snapshot.currentRole} at ${data.snapshot.organization}`,
                            type: "Work Experience",
                            snippet: data.snapshot.scope,
                          },
                        ],
                      })
                    }
                    className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Inspect AI Reasoning & Evidence Sources</span>
                  </button>

                  <Link
                    href="/value/profile"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-brand-navy font-bold text-xs hover:bg-amber-400 transition-all no-underline shadow-sm"
                  >
                    <span>View Full Profile</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* Content for: 02. Career Value */}
            {cardId === "value" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
                  <div>
                    <p className="text-xs font-bold text-[var(--text-primary)]">Substantiated Career Facts</p>
                    <p className="text-[11px] text-[var(--text-muted)]">Verified from your career telemetry & evidence</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                    {data.careerValue.traceableCount} Verified Facts
                  </span>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    5 Multidimensional Pillars
                  </h4>
                  {(
                    [
                      { label: "Capabilities", level: data.careerValue.capabilities, desc: "Technical & strategic problem solving skills applied in production" },
                      { label: "Impact", level: data.careerValue.impact, desc: "Documented business, financial, and operational ROI outcomes" },
                      { label: "Experience", level: data.careerValue.experience, desc: "Senior role complexity, operational tenure, and leadership ownership" },
                      { label: "Progression", level: data.careerValue.progression, desc: "Trajectory of expanding scope, titles, and team responsibility" },
                      { label: "Evidence", level: data.careerValue.evidence, desc: "Documentary verification, artifacts, and quantifiable telemetry records" },
                    ] as const
                  ).map((dim) => {
                    const cfg = getLevelConfig(dim.level);
                    return (
                      <div key={dim.label} className="p-3.5 rounded-xl bg-[var(--bg-elevated)]/60 border border-[var(--border)] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[var(--text-primary)]">{dim.label}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${cfg.badgeBg}`}>
                            {dim.level}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[var(--border)] overflow-hidden">
                          <div className={`h-full rounded-full bg-gradient-to-r ${cfg.color}`} style={{ width: `${cfg.percent}%` }} />
                        </div>
                        <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{dim.desc}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <Link
                    href="/value"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline no-underline"
                  >
                    <span>Open Career Value Derivation Engine</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href="/value/profile"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 transition-all no-underline shadow-sm"
                  >
                    <span>View Value Profile</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* Content for: 03. Recent Progress */}
            {cardId === "progress" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Recent Career Advancements ({data.recentProgress.length})
                  </h4>
                  <Link href="/career-journal" className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline no-underline">
                    View Journal →
                  </Link>
                </div>

                <div className="space-y-3">
                  {data.recentProgress.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border space-y-2 ${
                        item.isPrimary
                          ? "bg-teal-500/[0.08] border-teal-500/35"
                          : "bg-[var(--bg-elevated)]/60 border-[var(--border)]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                          {item.title}
                        </span>
                        {item.category && (
                          <span className="px-2 py-0.5 rounded-md text-[9.5px] font-bold uppercase tracking-wider bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/25 shrink-0">
                            {item.category}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{item.description}</p>
                      {item.evidenceLink && (
                        <Link
                          href={item.evidenceLink}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline no-underline pt-1"
                        >
                          <span>Review evidence record</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content for: 04. Recent Career Event */}
            {cardId === "event" && (
              <div className="space-y-5">
                {data.recentEvent ? (
                  <div className="p-5 rounded-2xl bg-[var(--bg-elevated)]/60 border border-[var(--border)] space-y-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                        {data.recentEvent.date}
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)] font-medium">Logged in Career Telemetry</span>
                    </div>

                    <h3 className="text-lg font-black font-['Syne',sans-serif] text-[var(--text-primary)]">
                      {data.recentEvent.title}
                    </h3>

                    <div className="p-3.5 rounded-xl bg-[var(--card)] border border-[var(--border)] space-y-2">
                      <p className="text-xs font-bold text-[var(--text-primary)]">Strategic Context</p>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{data.recentEvent.context}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-purple-500/[0.08] border border-purple-500/25 space-y-1.5">
                      <p className="text-xs font-bold text-purple-800 dark:text-purple-300">Quantifiable Business Impact</p>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-semibold">{data.recentEvent.impact}</p>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs text-[var(--text-muted)]">Demonstrated Capability:</span>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[var(--card)] border border-[var(--border)] text-[var(--text-primary)]">
                        {data.recentEvent.capability}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl border border-dashed border-[var(--border)] text-center space-y-2">
                    <p className="text-xs text-[var(--text-muted)]">No recent career event logged yet.</p>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenCaptureEvent();
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-500 transition-all cursor-pointer shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Log New Career Event</span>
                  </button>

                  <Link href="/career-journal" className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] no-underline">
                    Browse All Events →
                  </Link>
                </div>
              </div>
            )}

            {/* Content for: 05. Career Direction */}
            {cardId === "direction" && (
              <div className="space-y-5">
                <div className="p-5 rounded-2xl bg-[var(--bg-elevated)]/60 border border-[var(--border)] space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                      {data.careerDirection.confidence}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">Market-Validated Trajectory</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black font-['Syne',sans-serif] text-[var(--text-primary)]">
                    {data.careerDirection.title}
                  </h3>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Core Alignment Signals ({data.careerDirection.signals.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {data.careerDirection.signals.map((sig) => (
                      <div key={sig} className="p-3 rounded-xl bg-[var(--bg-elevated)]/60 border border-[var(--border)] flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                        <span className="text-xs font-semibold text-[var(--text-primary)]">{sig}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Documented Evidence Precedents
                  </h4>
                  <div className="space-y-2">
                    {data.careerDirection.evidence.map((ev) => (
                      <div key={ev} className="p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs text-[var(--text-secondary)] leading-relaxed">
                        • {ev}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Content for: 06. Career Goal */}
            {cardId === "goal" && (
              <div className="space-y-5">
                {data.careerGoal ? (
                  <>
                    <div className="p-5 rounded-2xl bg-[var(--bg-elevated)]/60 border border-[var(--border)] space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                          {data.careerGoal.status}
                        </span>
                        <span className="text-xs font-semibold text-[var(--text-muted)]">{data.careerGoal.timeframe}</span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-black font-['Syne',sans-serif] text-[var(--text-primary)]">
                        {data.careerGoal.title}
                      </h3>

                      <div className="space-y-1.5 pt-2">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span>Readiness Completion</span>
                          <span className="text-rose-600 dark:text-rose-400">{data.careerGoal.progressPercent}%</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-[var(--border)] overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-500" style={{ width: `${data.careerGoal.progressPercent}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                        Goal Milestone Checklist
                      </h4>
                      <div className="space-y-2.5">
                        {data.careerGoal.milestones.map((ms, idx) => {
                          const isDone = idx < data.careerGoal!.currentMilestoneIndex;
                          const isCurrent = idx === data.careerGoal!.currentMilestoneIndex;
                          return (
                            <div
                              key={ms}
                              className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                                isCurrent
                                  ? "bg-rose-500/[0.08] border-rose-500/35"
                                  : isDone
                                  ? "bg-[var(--bg-elevated)]/40 border-[var(--border)] opacity-80"
                                  : "bg-[var(--card)] border-[var(--border)] opacity-60"
                              }`}
                            >
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                                  isDone
                                    ? "bg-emerald-500 text-white"
                                    : isCurrent
                                    ? "bg-rose-500 text-white"
                                    : "bg-[var(--border)] text-[var(--text-muted)]"
                                }`}
                              >
                                {isDone ? "✓" : idx + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-bold ${isCurrent ? "text-rose-700 dark:text-rose-300" : "text-[var(--text-primary)]"}`}>
                                  {ms}
                                </p>
                                {isCurrent && (
                                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                                    → Current focus milestone to advance readiness
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-6 rounded-2xl border border-dashed border-[var(--border)] text-center space-y-2">
                    <p className="text-xs text-[var(--text-muted)]">No primary career goal set yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* Content for: 07. Next Best Action */}
            {cardId === "action" && (
              <div className="space-y-5">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-[var(--bg-elevated)] to-[var(--card)] border border-amber-500/30 space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Top Priority Career Move</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black font-['Syne',sans-serif] text-[var(--text-primary)]">
                    {data.nextBestAction.title}
                  </h3>

                  <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] space-y-2">
                    <p className="text-xs font-bold text-[var(--text-primary)]">Why This Matters Right Now</p>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{data.nextBestAction.reason}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-500/[0.08] border border-amber-500/20 space-y-1">
                    <p className="text-xs font-bold text-amber-800 dark:text-amber-300">Goal Alignment</p>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{data.nextBestAction.goalRelevance}</p>
                  </div>

                  <div className="pt-2">
                    <Link
                      href={data.nextBestAction.ctaLink}
                      className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-brand-navy font-black text-sm hover:brightness-105 transition-all shadow-md no-underline"
                    >
                      <span>{data.nextBestAction.cta}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Content for: 08. Career Momentum */}
            {cardId === "momentum" && (
              <div className="space-y-5">
                <div className="p-5 rounded-2xl bg-[var(--bg-elevated)]/60 border border-[var(--border)] space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                      State: {data.momentum.state}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Trajectory: {data.momentum.trajectory.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold font-['Syne',sans-serif] text-[var(--text-primary)]">
                    {data.momentum.summary}
                  </h3>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Recent Velocity Signals ({data.momentum.signals.length})
                  </h4>
                  <div className="space-y-2">
                    {data.momentum.signals.map((sig) => (
                      <div key={sig} className="p-3.5 rounded-xl bg-[var(--bg-elevated)]/60 border border-[var(--border)] flex items-start gap-2.5">
                        <Activity className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-xs font-semibold text-[var(--text-primary)]">{sig}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Content for: 09. Explore Career */}
            {cardId === "explore" && (
              <div className="space-y-5">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Target Leadership Pathways ({data.careerExploration.length})
                  </h4>
                  <div className="space-y-3">
                    {data.careerExploration.map((item) => (
                      <div key={item.id} className="p-4 rounded-xl bg-[var(--bg-elevated)]/60 border border-[var(--border)] space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <h5 className="text-sm font-bold text-[var(--text-primary)]">{item.role}</h5>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30">
                            {item.alignmentScore}% Match
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{item.rationale}</p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {item.relevantCapabilities.map((c) => (
                            <span key={c} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[var(--card)] border border-[var(--border)] text-[var(--text-muted)]">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 sm:p-5 border-t border-[var(--border)] bg-[var(--bg-elevated)]/40 flex items-center justify-between gap-3 shrink-0">
            <span className="text-[11px] text-[var(--text-muted)] hidden sm:inline">
              Use ← → arrow keys to navigate cards · Esc to close
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all cursor-pointer ml-auto"
            >
              Close Details
            </button>
          </div>
        </motion.aside>
      </div>
    </AnimatePresence>
  );
}
