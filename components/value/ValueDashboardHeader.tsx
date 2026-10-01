"use client";

import { Sparkles, RefreshCw, CheckCircle2, FileText, ArrowRight, ShieldCheck, ChevronRight, BadgeCheck, Fingerprint, SearchCheck } from "lucide-react";
import ValueOrbitBadge from "./ValueOrbitBadge";
import ValueMarquee from "./ValueMarquee";
import ValueTraceChain from "./ValueTraceChain";
import { useEffect, useState } from "react";

/** rAF count-up for an array of targets (reduced-motion aware). */
function useCountUp(targets: number[], duration = 1000): number[] {
  const [values, setValues] = useState<number[]>(targets.map(() => 0));
  const key = targets.join(",");
  useEffect(() => {
    const list = key.split(",").map(Number);
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const total = reduced ? 1 : duration;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / total);
      const eased = 1 - Math.pow(1 - p, 3);
      setValues(list.map((t) => Math.round(eased * t)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return values;
}
import { Resume } from "@/types";

interface ValueDashboardHeaderProps {
  resumes: Resume[];
  selectedResumeId: string;
  onSelectResume: (id: string) => void;
  onExploreValue: () => void;
  onReviewFacts: () => void;
  onRecalculate: () => void;
  recalculating: boolean;
  totalFactsCount?: number;
  confirmedFactsCount?: number;
  careerEventsCount?: number;
  evidenceItemsCount?: number;
}

export default function ValueDashboardHeader({
  resumes,
  selectedResumeId,
  onSelectResume,
  onExploreValue,
  onReviewFacts,
  onRecalculate,
  recalculating,
  totalFactsCount = 0,
  confirmedFactsCount = 0,
  careerEventsCount = 0,
  evidenceItemsCount = 0,
}: ValueDashboardHeaderProps) {
  const snapshot = [
    { label: "Confirmed facts", value: confirmedFactsCount },
    { label: "Career events", value: careerEventsCount },
    { label: "Evidence links", value: evidenceItemsCount },
  ];

  const animatedSnapshot = useCountUp(snapshot.map((s) => s.value));

  const trust = [
    { icon: BadgeCheck, text: "You approve every fact" },
    { icon: Fingerprint, text: "Every claim traces to source" },
    { icon: SearchCheck, text: "No scores, no hallucinations" },
  ];

  return (
    <section className="value-noise relative overflow-hidden border-b border-[var(--border)] bg-[var(--card)]">
      {/* ── Editorial mesh backdrop (same theme, deeper stage) ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-dot-matrix opacity-50" />
        <div className="value-drift absolute -top-40 right-[4%] w-[560px] h-[560px] rounded-full bg-amber-500/[0.12] blur-[130px]" />
        <div className="value-drift-slow absolute -bottom-48 left-[2%] w-[480px] h-[480px] rounded-full bg-violet-500/[0.11] blur-[130px]" />
        <div className="absolute top-[-120px] left-[38%] w-[420px] h-[300px] rounded-full bg-sky-500/[0.08] blur-[110px]" />
        {/* giant ghost watermark */}
        <div className="value-watermark absolute -bottom-8 left-1/2 -translate-x-1/2 text-[22vw] lg:text-[19rem]">
          VALUE
        </div>
        {/* gold crown + floor fade */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400/80 via-amber-500/60 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[var(--bg)]/60 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 px-6 sm:px-8 pt-7 sm:pt-9 pb-9 sm:pb-11">
        {/* Top row: breadcrumb + engine + controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <nav className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]" aria-label="Breadcrumb">
              <span>Value</span>
              <ChevronRight size={12} className="opacity-60" />
              <span className="text-amber-600 dark:text-amber-400">Overview</span>
            </nav>
            <span className="hidden sm:inline w-px h-4 bg-[var(--border)]" />
            <div className="inline-flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-amber-500/[0.12] border border-amber-500/30 text-amber-700 dark:text-amber-300 text-[11px] font-bold uppercase tracking-[0.12em]">
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex w-full h-full rounded-full bg-amber-500 opacity-60 animate-ping" />
                <span className="relative inline-flex w-2 h-2 rounded-full bg-amber-500" />
              </span>
              <Sparkles size={12} className="text-amber-500" />
              <span>Career Value Engine · Evidence-Backed</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {resumes.length > 1 && (
              <label className="flex items-center gap-2 bg-[var(--bg-elevated)]/80 backdrop-blur border border-[var(--border)] rounded-xl pl-3 pr-2 py-1.5 shadow-xs hover:border-amber-500/40 transition-colors cursor-pointer">
                <FileText size={14} className="text-amber-500 shrink-0" />
                <select
                  value={selectedResumeId}
                  onChange={(e) => onSelectResume(e.target.value)}
                  className="bg-transparent text-xs font-bold text-[var(--text-primary)] focus:outline-none cursor-pointer max-w-[190px] truncate"
                  aria-label="Select Resume Source"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id} className="bg-[var(--card)] text-[var(--text-primary)]">
                      {r.file_name || "Untitled Resume"}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <button
              onClick={onRecalculate}
              disabled={recalculating}
              className="group inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[var(--bg-elevated)]/80 backdrop-blur border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-amber-500/50 hover:shadow-[0_4px_18px_rgba(245,158,11,0.18)] transition-all cursor-pointer disabled:opacity-50"
              title="Recalculate Career Value from confirmed facts"
              aria-label="Recalculate Career Value from confirmed facts"
            >
              <RefreshCw size={13} className={recalculating ? "animate-spin text-amber-500" : "group-hover:rotate-90 transition-transform duration-300 text-amber-500"} />
              <span>{recalculating ? "Deriving…" : "Recalculate"}</span>
            </button>
          </div>
        </div>

        {/* Hero grid */}
        <div className="mt-7 sm:mt-9 grid lg:grid-cols-[1.35fr_0.9fr] gap-8 lg:gap-10 items-center">
          {/* Left: editorial statement */}
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <p className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-amber-600 dark:text-amber-400">
                <span className="w-8 h-px bg-amber-500" aria-hidden="true" />
                Your Career Value
              </p>
              <div className="hidden md:block">
                <ValueOrbitBadge />
              </div>
            </div>
            <h1 className="text-[clamp(2.6rem,6vw,4.6rem)] font-extrabold tracking-[-0.025em] leading-[1.0] text-[var(--text-primary)] font-['Syne',sans-serif]">
              <span className="value-word" style={{ animationDelay: "0.05s" }}>Understand</span>{" "}
              <span className="value-word" style={{ animationDelay: "0.13s" }}>what</span>
              <br />
              <span className="value-word" style={{ animationDelay: "0.21s" }}>your</span>{" "}
              <span className="value-word" style={{ animationDelay: "0.29s" }}>experience</span>{" "}
              <span className="value-word font-editorial font-medium text-gradient-amber pr-2" style={{ animationDelay: "0.38s" }}>
                proves.
              </span>
            </h1>
            <p className="text-[14px] sm:text-[15.5px] text-[var(--text-secondary)] max-w-xl leading-relaxed">
              {confirmedFactsCount > 0
                ? <>Grounded in <strong className="text-[var(--text-primary)] tabular-nums">{confirmedFactsCount} verified facts</strong>, <strong className="text-[var(--text-primary)] tabular-nums">{careerEventsCount} career events</strong> and <strong className="text-[var(--text-primary)] tabular-nums">{evidenceItemsCount} evidence links</strong> — every insight below traces back to its source.</>
                : "Capabilities, impact and progression — derived from verified career facts, never guessed. Every insight traces back to its source."}
            </p>

            {/* CTAs */}
            <div className="flex items-center gap-3 flex-wrap pt-1">
              <button
                onClick={onExploreValue}
                className="group relative overflow-hidden inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-black text-brand-navy bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 bg-[length:200%_auto] hover:bg-right shadow-[0_12px_36px_rgba(245,158,11,0.45)] hover:shadow-[0_16px_44px_rgba(245,158,11,0.55)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all cursor-pointer"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" aria-hidden="true" />
                <Sparkles size={16} strokeWidth={2.5} className="relative" />
                <span className="relative">Explore Value</span>
                <ArrowRight size={14} strokeWidth={2.5} className="relative group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onReviewFacts}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold bg-[var(--bg-elevated)]/70 backdrop-blur border border-[var(--border-strong)] text-[var(--text-primary)] hover:border-amber-500/60 hover:bg-amber-500/[0.06] hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-xs cursor-pointer"
              >
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span>Review Facts</span>
                {totalFactsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 tabular-nums">
                    {confirmedFactsCount}/{totalFactsCount}
                  </span>
                )}
              </button>
            </div>

            {/* Traceability pipeline */}
            <ValueTraceChain />
          </div>

          {/* Right: live evidence snapshot card */}
          <aside
            aria-label="Live evidence snapshot"
            className="value-pop relative rounded-[1.6rem] border border-[var(--border-strong)] bg-[var(--bg-elevated)]/60 backdrop-blur-xl shadow-[0_24px_70px_rgba(16,27,59,0.14)] overflow-hidden"
          >
            <div className="h-[3px] w-full bg-gradient-to-r from-amber-500 via-emerald-500/70 to-violet-500/70" aria-hidden="true" />
            <div className="absolute -top-20 right-[-40px] w-56 h-56 bg-amber-500/[0.12] rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
            <div className="relative p-6 sm:p-7 space-y-5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Live evidence snapshot
                </span>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-600 dark:text-emerald-400">
                  <span className="relative flex w-2 h-2">
                    <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-500 opacity-60 animate-ping" />
                    <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500" />
                  </span>
                  Live
                </span>
              </div>

              <div className="grid grid-cols-3 divide-x divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--card)]/70 overflow-hidden">
                {snapshot.map((s, si) => (
                  <div key={s.label} className="px-3 py-4 text-center">
                    <div className="text-[1.7rem] leading-none font-extrabold tracking-tight text-[var(--text-primary)] font-['Syne',sans-serif] tabular-nums">
                      {animatedSnapshot[si] ?? s.value}
                    </div>
                    <div className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-muted)] leading-tight">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              <ul className="space-y-2.5">
                {trust.map((t) => {
                  const Icon = t.icon;
                  return (
                    <li key={t.text} className="flex items-center gap-2.5 text-[12.5px] font-semibold text-[var(--text-secondary)]">
                      <span className="w-6 h-6 rounded-lg bg-emerald-500/12 border border-emerald-500/25 flex items-center justify-center text-emerald-500 shrink-0">
                        <Icon size={13} />
                      </span>
                      {t.text}
                    </li>
                  );
                })}
              </ul>

              <div className="flex items-center gap-1.5 pt-1 text-[11px] font-semibold text-[var(--text-muted)]">
                <ShieldCheck size={13} className="text-amber-500" />
                Multidimensional profile · zero pseudo-scores
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Brand drumbeat */}
      <div className="relative z-10 mt-8 sm:mt-10">
        <ValueMarquee />
      </div>
    </section>
  );
}
