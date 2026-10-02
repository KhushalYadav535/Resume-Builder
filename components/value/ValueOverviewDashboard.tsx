"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Brain,
  Zap,
  Briefcase,
  TrendingUp,
  Sparkles,
  Database,
  Sprout,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Quote,
  Copy,
  Check,
  ListChecks,
} from "lucide-react";
import type {
  CareerInterpretation,
  EvidenceSummary,
  ExperienceDimension,
  ProgressionSignalItem,
  StrengtheningArea,
} from "@/types/value";

export type ValueDimension = "capabilities" | "impact" | "experience" | "progression";

interface ValueOverviewDashboardProps {
  capabilities: CareerInterpretation[];
  impact: CareerInterpretation[];
  experience: ExperienceDimension;
  progression: {
    signals: ProgressionSignalItem[];
    evolutionSummary: string;
  };
  pattern: CareerInterpretation | null;
  evidenceSummary: EvidenceSummary;
  strengtheningAreas: StrengtheningArea[];
  confirmedFactsCount: number;
  totalFactsCount: number;
  unconfirmedFactsCount: number;
  onOpenDimension: (dim: ValueDimension) => void;
  onOpenInterpretation: (interp: CareerInterpretation) => void;
  onOpenFacts: () => void;
  onOpenStrengthen: (link: string) => void;
}

/* ── Shared compact tile shell — same theme tokens as the rest of Value ── */
function TileShell({
  id,
  topBar,
  ghost,
  hoverBorder,
  onOpen,
  label,
  className = "",
  children,
  footer,
}: {
  id?: string;
  topBar: string;
  ghost: string;
  hoverBorder: string;
  onOpen: () => void;
  label: string;
  className?: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button, a, input, select, textarea")) return;
    onOpen();
  };
  const handleKey = (e: React.KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button, a, input, select, textarea")) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen();
    }
  };
  return (
    <div
      id={id}
      role="button"
      tabIndex={0}
      aria-label={label}
      title={label}
      onClick={handleClick}
      onKeyDown={handleKey}
      className={`group relative rounded-2xl bg-[var(--card)] border border-[var(--border)] overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between h-full min-h-[238px] p-4 sm:p-5 shadow-xs ${hoverBorder} ${className}`}
    >
      <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r ${topBar} z-20`} aria-hidden="true" />
      <span aria-hidden="true" className="value-ghost pointer-events-none absolute top-2 right-4 text-[3rem] leading-none z-0">
        {ghost}
      </span>
      <div className="relative z-10 flex flex-col flex-1">{children}</div>
      <div className="relative z-10">{footer}</div>
    </div>
  );
}

function TileHead({
  icon,
  iconWrap,
  eyebrow,
  eyebrowClass,
  badge,
}: {
  icon: React.ReactNode;
  iconWrap: string;
  eyebrow: string;
  eyebrowClass: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2 mb-2">
      <div className="flex items-center gap-2 min-w-0">
        <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${iconWrap}`}>
          {icon}
        </div>
        <span className={`text-[10.5px] font-black uppercase tracking-[0.16em] font-['Syne',sans-serif] truncate ${eyebrowClass}`}>
          {eyebrow}
        </span>
      </div>
      {badge}
    </div>
  );
}

function TileFoot({ hint, action = "Open" }: { hint: string; action?: string }) {
  return (
    <div className="pt-2.5 mt-2 border-t border-[var(--border)] flex items-center justify-between gap-2 text-xs">
      <span className="text-[11px] text-[var(--text-muted)] font-medium truncate">{hint}</span>
      <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 shrink-0 group-hover:underline">
        <span>{action}</span>
        <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
      </span>
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <div className="p-3 rounded-xl bg-[var(--surface)] text-[11px] text-[var(--text-muted)] italic text-center border border-dashed border-[var(--border)]">
      {text}
    </div>
  );
}

function strengthenStyle(level: string) {
  const l = level.toLowerCase();
  if (l.includes("limited"))
    return { dot: "bg-violet-500", pill: "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30", bar: "from-violet-500 to-purple-400", width: "32%" };
  if (l.includes("moderate"))
    return { dot: "bg-amber-500", pill: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30", bar: "from-amber-500 to-amber-300", width: "62%" };
  return { dot: "bg-emerald-500", pill: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30", bar: "from-emerald-500 to-teal-400", width: "88%" };
}

/**
 * Pulse-style compact overview — 2 rows on desktop instead of 4 stacked
 * sections. Every tile opens its particular page (dimension tab, facts tab,
 * traceability drawer or strengthen action). Same theme, no new tokens.
 */
export default function ValueOverviewDashboard({
  capabilities,
  impact,
  experience,
  progression,
  pattern,
  evidenceSummary,
  strengtheningAreas,
  confirmedFactsCount,
  totalFactsCount,
  unconfirmedFactsCount,
  onOpenDimension,
  onOpenInterpretation,
  onOpenFacts,
  onOpenStrengthen,
}: ValueOverviewDashboardProps) {
  const [copied, setCopied] = useState(false);
  const evidenceCount = pattern?.supportingEvidence?.length ?? 0;
  const topArea = strengtheningAreas[0];

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!pattern) return;
    try {
      await navigator.clipboard.writeText(`${pattern.title} — ${pattern.description}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch">
      {/* ── ROW 1: 4 dimension tiles ── */}

      {/* Capabilities */}
      <TileShell
        id="value-profile"
        topBar="from-amber-500 via-amber-400 to-amber-500"
        ghost="01"
        hoverBorder="hover:border-amber-500/40 hover:shadow-[0_14px_40px_rgba(245,158,11,0.12)]"
        onOpen={() => onOpenDimension("capabilities")}
        label="Open Capabilities dimension"
        footer={<TileFoot hint="What experience proves" />}
      >
        <TileHead
          icon={<Brain size={16} />}
          iconWrap="bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400"
          eyebrow="01 · Capabilities"
          eyebrowClass="text-amber-600 dark:text-amber-400"
          badge={
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 shrink-0 tabular-nums">
              {capabilities.length} found
            </span>
          }
        />
        <h3 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] font-['Syne',sans-serif] leading-tight mb-1.5">
          Demonstrated Skills
        </h3>
        <div className="flex-1 flex flex-col justify-center">
          {capabilities.length === 0 ? (
            <EmptyHint text="Building from career history…" />
          ) : (
            <div className="space-y-1.5">
              {capabilities.slice(0, 2).map((cap) => {
                const isConfirmed = cap.status === "ACCEPTED" || cap.status === "EDITED";
                return (
                  <button
                    key={cap.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenInterpretation(cap);
                    }}
                    className="w-full p-2 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] transition-all flex items-center justify-between gap-1.5 text-xs cursor-pointer"
                  >
                    <span className="font-bold text-[var(--text-primary)] truncate text-[11.5px]">{cap.title}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase shrink-0 border ${
                        isConfirmed
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                          : "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {isConfirmed ? "Observed" : "Suggested"}
                    </span>
                  </button>
                );
              })}
              {capabilities.length > 2 && (
                <div className="text-[10.5px] font-bold text-amber-600 dark:text-amber-400 pt-0.5">
                  +{capabilities.length - 2} more verified
                </div>
              )}
            </div>
          )}
        </div>
      </TileShell>

      {/* Impact */}
      <TileShell
        topBar="from-emerald-500 via-teal-400 to-emerald-500"
        ghost="02"
        hoverBorder="hover:border-emerald-500/40 hover:shadow-[0_14px_40px_rgba(16,185,129,0.12)]"
        onOpen={() => onOpenDimension("impact")}
        label="Open Impact dimension"
        footer={<TileFoot hint="Business & ROI impact" />}
      >
        <TileHead
          icon={<Zap size={16} />}
          iconWrap="bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
          eyebrow="02 · Impact"
          eyebrowClass="text-emerald-600 dark:text-emerald-400"
          badge={
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 shrink-0 tabular-nums">
              {impact.length} found
            </span>
          }
        />
        <h3 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] font-['Syne',sans-serif] leading-tight mb-1.5">
          Measurable Outcomes
        </h3>
        <div className="flex-1 flex flex-col justify-center">
          {impact.length === 0 ? (
            <EmptyHint text="Building from career history…" />
          ) : (
            <div className="space-y-1.5">
              {impact.slice(0, 2).map((imp) => (
                <button
                  key={imp.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenInterpretation(imp);
                  }}
                  className="w-full p-2 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] transition-all text-xs text-left cursor-pointer"
                >
                  <div className="font-bold text-[var(--text-primary)] truncate text-[11.5px]">{imp.title}</div>
                  <p className="text-[10.5px] text-[var(--text-muted)] line-clamp-1 leading-tight mt-0.5">{imp.description}</p>
                </button>
              ))}
              {impact.length > 2 && (
                <div className="text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400 pt-0.5">
                  +{impact.length - 2} more wins recorded
                </div>
              )}
            </div>
          )}
        </div>
      </TileShell>

      {/* Experience */}
      <TileShell
        topBar="from-sky-500 via-blue-400 to-sky-500"
        ghost="03"
        hoverBorder="hover:border-sky-500/40 hover:shadow-[0_14px_40px_rgba(14,165,233,0.12)]"
        onOpen={() => onOpenDimension("experience")}
        label="Open Experience dimension"
        footer={<TileFoot hint="Operational scope" />}
      >
        <TileHead
          icon={<Briefcase size={16} />}
          iconWrap="bg-sky-500/15 border-sky-500/30 text-sky-600 dark:text-sky-400"
          eyebrow="03 · Experience"
          eyebrowClass="text-sky-600 dark:text-sky-400"
          badge={
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30 shrink-0 tabular-nums">
              {experience.rolesCount} roles
            </span>
          }
        />
        <h3 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] font-['Syne',sans-serif] leading-tight mb-1.5">
          Tenure & Breadth
        </h3>
        <div className="flex-1 flex flex-col justify-center">
          {experience.rolesCount === 0 ? (
            <EmptyHint text="Building from career history…" />
          ) : (
            <div className="space-y-1.5">
              <div className="grid grid-cols-2 gap-1.5">
                <div className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-center">
                  <div className="text-base font-black text-[var(--text-primary)] font-['Syne',sans-serif] tabular-nums leading-tight">
                    {experience.totalYears}<span className="text-[10px] font-bold text-[var(--text-muted)] ml-0.5">y</span>
                  </div>
                  <div className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Tenure</div>
                </div>
                <div className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-center">
                  <div className="text-base font-black text-[var(--text-primary)] font-['Syne',sans-serif] tabular-nums leading-tight">
                    {experience.rolesCount}<span className="text-[10px] font-bold text-[var(--text-muted)] ml-0.5">roles</span>
                  </div>
                  <div className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Positions</div>
                </div>
              </div>
              <div className="p-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[11px] font-semibold text-[var(--text-secondary)] truncate">
                {experience.industries.slice(0, 2).join(" · ") || "Technology"}
              </div>
            </div>
          )}
        </div>
      </TileShell>

      {/* Progression */}
      <TileShell
        topBar="from-violet-500 via-purple-400 to-violet-500"
        ghost="04"
        hoverBorder="hover:border-violet-500/40 hover:shadow-[0_14px_40px_rgba(139,92,246,0.12)]"
        onOpen={() => onOpenDimension("progression")}
        label="Open Progression dimension"
        footer={<TileFoot hint="Evolution & title growth" />}
      >
        <TileHead
          icon={<TrendingUp size={16} />}
          iconWrap="bg-violet-500/15 border-violet-500/30 text-violet-600 dark:text-violet-400"
          eyebrow="04 · Progression"
          eyebrowClass="text-violet-600 dark:text-violet-400"
          badge={
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30 shrink-0 tabular-nums">
              {progression.signals.length} signals
            </span>
          }
        />
        <h3 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] font-['Syne',sans-serif] leading-tight mb-1.5">
          Career Trajectory
        </h3>
        <div className="flex-1 flex flex-col justify-center">
          {progression.signals.length === 0 ? (
            <EmptyHint text="Building from career history…" />
          ) : (
            <div className="space-y-1.5">
              {progression.signals.slice(0, 2).map((sig, i) => (
                <div key={sig.id || i} className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11.5px] font-bold text-[var(--text-primary)] truncate">{sig.title}</span>
                    <span className="text-[9px] font-black text-violet-600 dark:text-violet-400 bg-violet-500/10 px-1 py-px rounded border border-violet-500/20 shrink-0">
                      ↑ Scope
                    </span>
                  </div>
                </div>
              ))}
              {progression.signals.length > 2 && (
                <div className="text-[10.5px] font-bold text-violet-600 dark:text-violet-400 pt-0.5">
                  +{progression.signals.length - 2} more milestones
                </div>
              )}
            </div>
          )}
        </div>
      </TileShell>

      {/* ── ROW 2: pattern (span 2) + evidence + strengthen ── */}

      {/* Value Pattern */}
      {pattern && (
        <TileShell
          id="value-pattern"
          topBar="from-amber-500 via-amber-400/80 to-violet-500/60"
          ghost="05"
          hoverBorder="hover:border-amber-500/40 hover:shadow-[0_14px_40px_rgba(245,158,11,0.12)]"
          onOpen={() => onOpenInterpretation(pattern)}
          label="Open value pattern detail"
          className="md:col-span-2 xl:col-span-2"
          footer={
            <div className="pt-2.5 mt-2 border-t border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] min-w-0">
                <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                <span className="text-[11.5px] truncate">
                  Confidence: <strong className="text-[var(--text-primary)]">{pattern.confidence}</strong> · {pattern.status}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
                  title="Copy pattern statement"
                >
                  {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenInterpretation(pattern);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-brand-navy bg-amber-500 hover:bg-amber-400 shadow-xs transition-all cursor-pointer"
                >
                  <span>Why do we say this?</span>
                  <ArrowRight size={13} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          }
        >
          <TileHead
            icon={<Sparkles size={16} />}
            iconWrap="bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400"
            eyebrow="05 · Value Pattern"
            eyebrowClass="text-amber-700 dark:text-amber-400"
            badge={
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/25 shrink-0 tabular-nums">
                {evidenceCount} cluster{evidenceCount === 1 ? "" : "s"}
              </span>
            }
          />
          <div className="flex items-start gap-3 flex-1">
            <span className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 hidden sm:flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
              <Quote size={15} />
            </span>
            <div className="space-y-1 min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] font-['Syne',sans-serif] leading-snug line-clamp-1">
                {pattern.title}
              </h3>
              <p className="text-xs sm:text-[13px] text-[var(--text-secondary)] leading-relaxed italic line-clamp-3">
                “{pattern.description}”
              </p>
            </div>
          </div>
        </TileShell>
      )}

      {/* Evidence Foundation */}
      <TileShell
        id="value-evidence"
        topBar="from-emerald-500 via-sky-500/60 to-violet-500/60"
        ghost="06"
        hoverBorder="hover:border-emerald-500/40 hover:shadow-[0_14px_40px_rgba(16,185,129,0.12)]"
        onOpen={onOpenFacts}
        label="Open evidence and facts"
        className={pattern ? "" : "md:col-span-2 xl:col-span-2"}
        footer={<TileFoot hint="No scores, only proof" action="Explore Facts" />}
      >
        <TileHead
          icon={<Database size={16} />}
          iconWrap="bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
          eyebrow="06 · Evidence"
          eyebrowClass="text-emerald-600 dark:text-emerald-400"
          badge={
            unconfirmedFactsCount > 0 ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 shrink-0 tabular-nums">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                {unconfirmedFactsCount} to review
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 shrink-0">
                <ShieldCheck size={11} />
                Provable
              </span>
            )
          }
        />
        <h3 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] font-['Syne',sans-serif] leading-tight mb-1.5">
          Evidence Foundation
        </h3>
        <div className="flex-1 flex flex-col justify-center space-y-1.5">
          {[
            { n: evidenceSummary.confirmedFacts, l: "Confirmed facts", c: "text-emerald-600 dark:text-emerald-400" },
            { n: evidenceSummary.careerEvents, l: "Career events", c: "text-sky-600 dark:text-sky-400" },
            { n: evidenceSummary.evidenceItems, l: "Evidence links", c: "text-violet-600 dark:text-violet-400" },
          ].map((s) => (
            <div key={s.l} className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
              <span className="text-[11.5px] font-semibold text-[var(--text-secondary)]">{s.l}</span>
              <span className={`text-base font-black font-['Syne',sans-serif] tabular-nums ${s.c}`}>{s.n}</span>
            </div>
          ))}
          {totalFactsCount > 0 && (
            <div className="text-[10.5px] font-bold text-[var(--text-muted)] tabular-nums">
              {confirmedFactsCount}/{totalFactsCount} facts verified
            </div>
          )}
        </div>
      </TileShell>

      {/* Strengthen (or Facts Review fallback keeps the grid balanced) */}
      {topArea ? (
        <TileShell
          id="value-strengthen"
          topBar="from-violet-500 via-amber-500/60 to-emerald-500/60"
          ghost="07"
          hoverBorder="hover:border-violet-500/40 hover:shadow-[0_14px_40px_rgba(139,92,246,0.12)]"
          onOpen={() => onOpenStrengthen(topArea.actionLink || "/career-journal")}
          label={`Strengthen ${topArea.dimension}`}
          footer={
            <div className="pt-2.5 mt-2 border-t border-[var(--border)] flex items-center justify-between gap-2 text-xs">
              <span className="text-[11px] text-[var(--text-muted)] truncate max-w-[150px]">{topArea.suggestedAction}</span>
              <Link
                href={topArea.actionLink || "/career-journal"}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline shrink-0"
              >
                <span>Add Event</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          }
        >
          <TileHead
            icon={<Sprout size={16} />}
            iconWrap="bg-violet-500/15 border-violet-500/30 text-violet-600 dark:text-violet-400"
            eyebrow="07 · Strengthen"
            eyebrowClass="text-violet-600 dark:text-violet-400"
            badge={
              strengtheningAreas.length > 1 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/25 shrink-0 tabular-nums">
                  +{strengtheningAreas.length - 1} more
                </span>
              ) : undefined
            }
          />
          <h3 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] font-['Syne',sans-serif] leading-tight mb-1.5 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full shrink-0 ${strengthenStyle(topArea.level).dot}`} />
            <span className="truncate">{topArea.dimension}</span>
          </h3>
          <div className="flex-1 flex flex-col justify-center space-y-1.5">
            <span className={`self-start px-2 py-0.5 rounded-full text-[10px] font-bold border ${strengthenStyle(topArea.level).pill}`}>
              {topArea.level}
            </span>
            <p className="text-[11.5px] text-[var(--text-secondary)] leading-relaxed line-clamp-3">{topArea.explanation}</p>
          </div>
        </TileShell>
      ) : (
        <TileShell
          id="value-strengthen"
          topBar="from-emerald-500 via-teal-400 to-emerald-500"
          ghost="07"
          hoverBorder="hover:border-emerald-500/40 hover:shadow-[0_14px_40px_rgba(16,185,129,0.12)]"
          onOpen={onOpenFacts}
          label="Open facts review"
          footer={<TileFoot hint="You approve every fact" action="Review Facts" />}
        >
          <TileHead
            icon={<ListChecks size={16} />}
            iconWrap="bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
            eyebrow="07 · Fact Review"
            eyebrowClass="text-emerald-600 dark:text-emerald-400"
            badge={
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 shrink-0 tabular-nums">
                {confirmedFactsCount}/{totalFactsCount}
              </span>
            }
          />
          <h3 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] font-['Syne',sans-serif] leading-tight mb-1.5">
            Record Fully Evidenced
          </h3>
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[12px] font-semibold text-[var(--text-secondary)]">
              <span className="w-6 h-6 rounded-lg bg-emerald-500/12 border border-emerald-500/25 flex items-center justify-center text-emerald-500 shrink-0">
                <CheckCircle2 size={13} />
              </span>
              <span>Every dimension is well supported — review facts anytime.</span>
            </div>
          </div>
        </TileShell>
      )}
    </div>
  );
}
