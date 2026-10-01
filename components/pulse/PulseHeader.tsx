"use client";

import Link from "next/link";
import {
  Upload,
  Plus,
  RefreshCw,
  Activity,
  Sparkles,
} from "lucide-react";
import { ScenarioPreset } from "./types";

interface Props {
  currentScenario?: ScenarioPreset;
  onScenarioChange?: (preset: ScenarioPreset) => void;
  onOpenCaptureEvent: () => void;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export default function PulseHeader({
  onOpenCaptureEvent,
  isRefreshing,
  onRefresh,
}: Props) {
  return (
    <header className="value-noise relative mb-6 sm:mb-8 overflow-hidden rounded-[20px] border border-[var(--border)] bg-[var(--card)] shadow-[0_1px_2px_rgba(16,27,59,0.04),0_12px_32px_-12px_rgba(16,27,59,0.12)] dark:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.5)]">
      {/* Premium gold crown hairline */}
      <div
        className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#F59E0B] to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute top-[2px] inset-x-8 h-px bg-gradient-to-r from-transparent via-amber-200/60 to-transparent dark:via-amber-500/20"
        aria-hidden="true"
      />

      {/* Ambient premium glows */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-28 right-[6%] w-[380px] h-[380px] rounded-full bg-amber-500/[0.07] blur-[100px]" />
        <div className="absolute -bottom-32 left-[8%] w-[320px] h-[320px] rounded-full bg-violet-500/[0.06] blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.04),transparent_60%)]" />
      </div>

      <div className="relative z-10 px-6 sm:px-8 py-6 sm:py-7 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* ── Left: eyebrow + title + sub ── */}
        <div className="min-w-0 max-w-[640px]">
          {/* Eyebrow row */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 pl-2.5 pr-3 py-[5px] rounded-full bg-gradient-to-b from-amber-500/[0.14] to-amber-500/[0.06] border border-amber-500/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_8px_rgba(245,158,11,0.12)] text-amber-700 dark:text-amber-300 text-[11px] font-extrabold uppercase tracking-[0.12em]">
              <span className="relative flex w-[7px] h-[7px]">
                <span className="absolute inline-flex w-full h-full rounded-full bg-amber-500 opacity-60 animate-ping" />
                <span className="relative inline-flex w-[7px] h-[7px] rounded-full bg-gradient-to-b from-amber-400 to-amber-600 ring-2 ring-amber-500/20" />
              </span>
              <Activity className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span>Uprole Pulse · Live</span>
            </span>

            <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--text-muted)]">
              <Sparkles className="w-3.5 h-3.5 text-amber-500/70" />
              Your career snapshot
            </span>
          </div>

          {/* Display title */}
          <h1 className="mt-3 text-[32px] sm:text-[40px] leading-[1.04] tracking-[-0.02em] font-['Syne',sans-serif]">
            <span className="font-extrabold text-[var(--text-primary)]">Pulse </span>
            <span className="font-['Playfair_Display',serif] italic font-medium bg-gradient-to-r from-[#D97706] via-[#F59E0B] to-[#D97706] bg-clip-text text-transparent pr-1">
              snapshot.
            </span>
          </h1>

          {/* Subcopy */}
          <p className="mt-2.5 text-[14px] sm:text-[15px] leading-relaxed text-slate-500 dark:text-slate-400 max-w-[560px] text-balance">
            Where you stand, what has changed, where you are heading, and your
            next best action —{" "}
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              in 15 seconds.
            </span>
          </p>
        </div>

        {/* ── Right: action cluster ── */}
        <div className="flex items-center gap-3 shrink-0 lg:pl-6">
          {/* Refresh — circular ghost */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh Pulse telemetry"
            aria-label="Refresh Pulse telemetry"
            className="group h-11 w-11 inline-flex items-center justify-center rounded-full bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 hover:shadow-[0_4px_16px_rgba(16,27,59,0.08)] transition-all duration-200 cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#101B3B] disabled:opacity-70 disabled:cursor-wait active:scale-95"
          >
            <RefreshCw
              className={`w-[18px] h-[18px] ${isRefreshing ? "animate-spin text-amber-500" : "transition-transform duration-500 group-hover:rotate-[120deg]"}`}
            />
          </button>

          {/* Hairline divider */}
          <div
            className="w-px h-9 bg-slate-200 dark:bg-white/10"
            aria-hidden="true"
          />

          {/* Import Resume — secondary pill */}
          <Link
            href="/resume/upload"
            title="Import or update your resume"
            className="h-11 inline-flex items-center gap-2 px-5 rounded-full bg-white dark:bg-white/[0.04] border border-slate-300/80 dark:border-white/15 text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-white/25 hover:shadow-[0_4px_16px_rgba(16,27,59,0.10)] hover:-translate-y-px active:translate-y-0 active:scale-[0.98] text-[14px] font-bold transition-all duration-200 no-underline shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#101B3B]"
          >
            <Upload className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <span className="whitespace-nowrap">Import Resume</span>
          </Link>

          {/* Log Event — primary amber pill */}
          <button
            type="button"
            onClick={onOpenCaptureEvent}
            className="group relative h-11 inline-flex items-center gap-1.5 pl-4 pr-6 rounded-full bg-gradient-to-b from-[#FFB51A] via-[#FF9D00] to-[#F88A00] text-[#101B3B] text-[14px] font-extrabold tracking-tight transition-all duration-200 shadow-[0_8px_24px_-6px_rgba(255,157,0,0.55),inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-1px_0_rgba(0,0,0,0.08)] hover:shadow-[0_12px_32px_-6px_rgba(255,157,0,0.65),inset_0_1px_0_rgba(255,255,255,0.6)] hover:-translate-y-0.5 hover:brightness-[1.03] active:translate-y-0 active:scale-[0.98] cursor-pointer shrink-0 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#101B3B]"
          >
            {/* sheen sweep */}
            <span
              className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              aria-hidden="true"
            />
            <Plus className="relative w-[18px] h-[18px]" strokeWidth={3} />
            <span className="relative whitespace-nowrap">Log Event</span>
          </button>
        </div>
      </div>

      {/* Bottom inner highlight for premium depth */}
      <div
        className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-900/[0.06] to-transparent dark:via-white/[0.06]"
        aria-hidden="true"
      />
    </header>
  );
}
