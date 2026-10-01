"use client";

import Link from "next/link";
import {
  Upload,
  Plus,
  RefreshCw,
  Activity,
} from "lucide-react";
import { ScenarioPreset } from "./types";

interface Props {
  currentScenario?: ScenarioPreset;
  onScenarioChange?: (preset: ScenarioPreset) => void;
  onOpenCaptureEvent: () => void;
  isRefreshing: boolean;
  onRefresh: () => void;
  isAllExpanded?: boolean;
  onToggleExpandAll?: () => void;
}

export default function PulseHeader({
  currentScenario = "live",
  onScenarioChange,
  onOpenCaptureEvent,
  isRefreshing,
  onRefresh,
  isAllExpanded = false,
  onToggleExpandAll,
}: Props) {
  return (
    <div className="relative mb-6 pb-5 border-b border-slate-200 dark:border-white/10 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
        {/* Title and description */}
        <div className="space-y-1.5 min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25 dark:border-amber-400/30 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5 animate-pulse text-amber-500" />
            <span>UpRole Pulse</span>
          </div>

          <div className="flex items-baseline gap-2.5 sm:gap-3 flex-wrap">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[var(--text-primary)] font-['Syne',sans-serif]">
              Pulse
            </h1>
            <span className="text-[var(--text-muted)] text-sm sm:text-base lg:text-lg font-medium">
              — Your career snapshot
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            Understand where you stand, what has changed, where you are heading, and your next best action — in 15 seconds.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Section 14: Scenario Preset Selector */}
          {onScenarioChange && (
            <select
              value={currentScenario}
              onChange={(e) => onScenarioChange(e.target.value as ScenarioPreset)}
              className="px-2.5 py-2 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/15 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer shadow-2xs outline-none"
              title="Switch career profile state / scenario (Section 14)"
            >
              <option value="live">Live Data</option>
              <option value="full">Established Leader (Full)</option>
              <option value="scenarioA_new">Scenario A: New User</option>
              <option value="scenarioB_partial">Scenario B: Partial Value</option>
              <option value="scenarioC_no_goal">Scenario C: No Goal</option>
              <option value="scenarioD_no_event">Scenario D: No Event</option>
            </select>
          )}

          {/* Toggle All Cards View: Compact vs Detailed */}
          {onToggleExpandAll && (
            <button
              type="button"
              onClick={onToggleExpandAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/15 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer shadow-2xs"
              title={isAllExpanded ? "Collapse cards to compact view" : "Expand all cards with full details"}
            >
              <span>{isAllExpanded ? "Collapse View" : "Expand View"}</span>
              <span className="text-[10px] opacity-70">{isAllExpanded ? "▴" : "▾"}</span>
            </button>
          )}

          {/* Refresh Pulse Button */}
          <button
            type="button"
            onClick={onRefresh}
            className="p-2.5 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/15 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer shadow-2xs shrink-0"
            title="Recalculate Pulse state"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? "animate-spin text-amber-500" : ""}`}
            />
          </button>

          {/* Subtle separator */}
          <div className="h-6 w-px bg-slate-200 dark:bg-white/15 mx-0.5" />

          {/* Import Career Doc Action — Secondary Utility Button */}
          <Link
            href="/resume/upload"
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/15 hover:border-slate-300 dark:hover:border-white/25 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-semibold transition-all shadow-2xs no-underline group shrink-0"
            title="Import or update your resume to refresh your career snapshot"
          >
            <Upload className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500 transition-colors" />
            <span>Import Resume</span>
          </Link>

          {/* Log Event Action — Primary Pulse Action */}
          <button
            type="button"
            onClick={onOpenCaptureEvent}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-[0_4px_14px_rgba(124,58,237,0.25)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.35)] cursor-pointer active:scale-95 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Event</span>
          </button>
        </div>
      </div>
    </div>
  );
}
