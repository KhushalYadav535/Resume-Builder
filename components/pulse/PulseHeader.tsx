"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Upload,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  Activity,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { ScenarioPreset } from "./types";

interface Props {
  currentScenario: ScenarioPreset;
  onScenarioChange: (preset: ScenarioPreset) => void;
  onOpenCaptureEvent: () => void;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export default function PulseHeader({
  currentScenario,
  onScenarioChange,
  onOpenCaptureEvent,
  isRefreshing,
  onRefresh,
}: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const presets: { id: ScenarioPreset; label: string; desc: string }[] = [
    {
      id: "full",
      label: "🌟 Established Leader (Canonical)",
      desc: "Head of Product, 14 yrs, fully evidenced career snapshot",
    },
    {
      id: "live",
      label: "👤 My Live Account Data",
      desc: "Synthesized from your active resume & journal in DB",
    },
    {
      id: "scenarioA_new",
      label: "🌱 Scenario A: New User",
      desc: "Initial orientation, guidance on what to uncover",
    },
    {
      id: "scenarioB_partial",
      label: "⚖️ Scenario B: Partial Evidence",
      desc: "Known vs needs evidence breakdown",
    },
    {
      id: "scenarioC_no_goal",
      label: "🎯 Scenario C: No Goal Set",
      desc: "Interactive goal selection prompt",
    },
    {
      id: "scenarioD_no_event",
      label: "⚡ Scenario D: No Recent Event",
      desc: "Inspirational prompt to capture continuity",
    },
  ];

  // Short display label on button face to prevent horizontal clutter & wrapping
  const getDisplayLabel = (scenario: ScenarioPreset) => {
    switch (scenario) {
      case "full":
        return "🌟 Established Leader";
      case "live":
        return "👤 Live Account Data";
      case "scenarioA_new":
        return "🌱 New User (A)";
      case "scenarioB_partial":
        return "⚖️ Partial Evidence (B)";
      case "scenarioC_no_goal":
        return "🎯 No Goal Set (C)";
      case "scenarioD_no_event":
        return "⚡ No Recent Event (D)";
      default:
        return "🌟 Established Leader";
    }
  };

  const currentLabel = getDisplayLabel(currentScenario);

  return (
    <div className="relative mb-8 pb-6 border-b border-slate-200 dark:border-white/10 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
        {/* Title and description */}
        <div className="space-y-2 min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25 dark:border-amber-400/30 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5 animate-pulse text-amber-500" />
            <span>UpRole Pulse · Living Snapshot</span>
          </div>

          <div className="flex items-baseline gap-2.5 sm:gap-3 flex-wrap">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[var(--text-primary)] font-['Syne',sans-serif]">
              Pulse
            </h1>
            <span className="text-[var(--text-muted)] text-sm sm:text-base lg:text-lg font-medium">
              — A living snapshot of your career right now.
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            Understand where you stand, what has changed, where you are heading, and your next best action — in 15 seconds.
          </p>
        </div>

        {/* Action Controls & Preset Scenario Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-2.5 shrink-0">
          {/* Context & Data Controls Group */}
          <div className="flex items-center gap-2">
            {/* Scenario Preset Selector */}
            <div className="relative flex-1 sm:flex-initial">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 px-3 sm:px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/15 text-xs font-bold text-[var(--text-primary)] transition-all cursor-pointer shadow-2xs"
                title="Switch demo scenarios (Section 14)"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="truncate max-w-[140px] sm:max-w-[170px] text-left">
                    {currentLabel}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-[calc(100vw-32px)] sm:w-80 rounded-2xl bg-white dark:bg-[#0D1530] border border-slate-200 dark:border-white/15 p-2 shadow-xl dark:shadow-2xl z-50 space-y-1">
                    <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] border-b border-slate-100 dark:border-white/10">
                      Test Scenarios (Spec Section 14)
                    </div>
                    {presets.map((preset) => {
                      const isSelected = currentScenario === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            onScenarioChange(preset.id);
                            setDropdownOpen(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl transition-all text-xs cursor-pointer flex items-start justify-between gap-2 ${
                            isSelected
                              ? "bg-amber-500/15 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-400/40"
                              : "hover:bg-slate-50 dark:hover:bg-white/5 text-[var(--text-primary)]"
                          }`}
                        >
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold">{preset.label}</span>
                            <span className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-relaxed">
                              {preset.desc}
                            </span>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

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
          </div>

          {/* Subtle separator on desktop */}
          <div className="hidden sm:block h-6 w-px bg-slate-200 dark:bg-white/15 mx-0.5" />

          {/* Action Group: Import (Secondary) & Log Event (Primary) */}
          <div className="flex items-center gap-2">
            {/* Import Career Doc Action — Secondary Utility Button */}
            <Link
              href="/resume/upload"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/15 hover:border-slate-300 dark:hover:border-white/25 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-semibold transition-all shadow-2xs no-underline group shrink-0"
              title="Import or update your resume to refresh your career snapshot"
            >
              <Upload className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500 transition-colors" />
              <span>Import Resume</span>
            </Link>

            {/* Log Event Action — Primary Pulse Action */}
            <button
              type="button"
              onClick={onOpenCaptureEvent}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-[0_4px_14px_rgba(124,58,237,0.25)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.35)] cursor-pointer active:scale-95 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Event</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
