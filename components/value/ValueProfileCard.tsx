"use client";

import React from "react";
import {
  Brain,
  Zap,
  Briefcase,
  TrendingUp,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  Layers,
  HelpCircle,
} from "lucide-react";
import {
  CareerInterpretation,
  ExperienceDimension,
  ProgressionSignalItem,
} from "@/types/value";

interface ValueProfileCardProps {
  capabilities: CareerInterpretation[];
  impact: CareerInterpretation[];
  experience: ExperienceDimension;
  progression: {
    signals: ProgressionSignalItem[];
    evolutionSummary: string;
  };
  onSelectInterpretation: (interp: CareerInterpretation) => void;
  onExploreDimension: (dim: "capabilities" | "impact" | "experience" | "progression") => void;
}

export default function ValueProfileCard({
  capabilities,
  impact,
  experience,
  progression,
  onSelectInterpretation,
  onExploreDimension,
}: ValueProfileCardProps) {
  return (
    <div className="rounded-3xl bg-[var(--card)] border border-[var(--border)] p-6 sm:p-8 space-y-6 shadow-sm relative overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-wider mb-1">
            <Layers size={14} />
            <span>Area 1 · Core Framework</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] font-['Syne',sans-serif] tracking-tight">
            Career Value Profile
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            A multidimensional qualitative synthesis derived from verified career facts and evidence.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold self-start sm:self-auto">
          <ShieldCheck size={14} />
          <span>Multidimensional Profile · Zero Pseudo-Score</span>
        </div>
      </div>

      {/* 4 Dimension Columns Grid (Section 5 & 6) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Dimension 1: Capabilities */}
        <div className="rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] p-5 space-y-4 flex flex-col justify-between hover:border-amber-500/30 transition-all group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
                  <Brain size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[var(--text-primary)]">Capabilities</h3>
                  <p className="text-[11px] text-[var(--text-muted)]">What experience proves</p>
                </div>
              </div>
              <button
                onClick={() => onExploreDimension("capabilities")}
                className="text-[var(--text-muted)] hover:text-amber-500 transition-colors p-1"
                title="Explore Capabilities"
                aria-label="Explore Capabilities"
              >
                <ArrowUpRight size={15} />
              </button>
            </div>

            {/* List of items */}
            <div className="space-y-2 pt-1">
              {capabilities.length === 0 ? (
                <div className="p-4 rounded-xl bg-[var(--card)] text-xs text-[var(--text-muted)] italic text-center border border-dashed border-[var(--border)]">
                  Building from your career history...
                </div>
              ) : (
                capabilities.slice(0, 3).map((cap) => {
                  const isConfirmed = cap.status === "ACCEPTED" || cap.status === "EDITED";
                  return (
                    <button
                      key={cap.id}
                      onClick={() => onSelectInterpretation(cap)}
                      className="w-full text-left p-2.5 rounded-xl bg-[var(--card)] hover:bg-amber-500/10 border border-[var(--border)] hover:border-amber-500/40 transition-all group/item cursor-pointer space-y-1"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-[var(--text-primary)] group-hover/item:text-amber-500 line-clamp-1">
                          {cap.title}
                        </span>
                        <ChevronRight size={13} className="text-[var(--text-muted)] group-hover/item:text-amber-500 shrink-0" />
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span
                          className={`px-1.5 py-0.2 rounded font-semibold ${
                            isConfirmed
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {isConfirmed ? "Observed" : "Suggested"}
                        </span>
                        <span className="text-[var(--text-muted)]">
                          {cap.confidence} Confidence
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <button
            onClick={() => onExploreDimension("capabilities")}
            className="w-full text-center text-xs font-bold text-amber-500 hover:text-amber-400 py-1.5 border-t border-[var(--border)] pt-2 cursor-pointer flex items-center justify-center gap-1"
          >
            <span>{capabilities.length > 0 ? `View all (${capabilities.length})` : "Explore Dimension"}</span>
            <ChevronRight size={12} />
          </button>
        </div>

        {/* Dimension 2: Impact */}
        <div className="rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] p-5 space-y-4 flex flex-col justify-between hover:border-emerald-500/30 transition-all group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                  <Zap size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[var(--text-primary)]">Impact</h3>
                  <p className="text-[11px] text-[var(--text-muted)]">What changed from work</p>
                </div>
              </div>
              <button
                onClick={() => onExploreDimension("impact")}
                className="text-[var(--text-muted)] hover:text-emerald-500 transition-colors p-1"
                title="Explore Impact"
                aria-label="Explore Impact"
              >
                <ArrowUpRight size={15} />
              </button>
            </div>

            {/* List of impact items */}
            <div className="space-y-2 pt-1">
              {impact.length === 0 ? (
                <div className="p-4 rounded-xl bg-[var(--card)] text-xs text-[var(--text-muted)] italic text-center border border-dashed border-[var(--border)]">
                  Building from your career history...
                </div>
              ) : (
                impact.slice(0, 3).map((imp) => (
                  <button
                    key={imp.id}
                    onClick={() => onSelectInterpretation(imp)}
                    className="w-full text-left p-2.5 rounded-xl bg-[var(--card)] hover:bg-emerald-500/10 border border-[var(--border)] hover:border-emerald-500/40 transition-all group/item cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-[var(--text-primary)] group-hover/item:text-emerald-500 line-clamp-1">
                        {imp.title}
                      </span>
                      <ChevronRight size={13} className="text-[var(--text-muted)] group-hover/item:text-emerald-500 shrink-0" />
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] line-clamp-1">
                      {imp.description}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => onExploreDimension("impact")}
            className="w-full text-center text-xs font-bold text-emerald-500 hover:text-emerald-400 py-1.5 border-t border-[var(--border)] pt-2 cursor-pointer flex items-center justify-center gap-1"
          >
            <span>{impact.length > 0 ? `View all (${impact.length})` : "Explore Dimension"}</span>
            <ChevronRight size={12} />
          </button>
        </div>

        {/* Dimension 3: Experience */}
        <div className="rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] p-5 space-y-4 flex flex-col justify-between hover:border-sky-500/30 transition-all group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-500">
                  <Briefcase size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[var(--text-primary)]">Experience</h3>
                  <p className="text-[11px] text-[var(--text-muted)]">Breadth & context</p>
                </div>
              </div>
              <button
                onClick={() => onExploreDimension("experience")}
                className="text-[var(--text-muted)] hover:text-sky-500 transition-colors p-1"
                title="Explore Experience"
                aria-label="Explore Experience"
              >
                <ArrowUpRight size={15} />
              </button>
            </div>

            {/* Metrics Chips */}
            {experience.rolesCount === 0 ? (
              <div className="p-4 rounded-xl bg-[var(--card)] text-xs text-[var(--text-muted)] italic text-center border border-dashed border-[var(--border)]">
                Building from your career history...
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)]">
                  <div className="text-base font-black text-[var(--text-primary)]">
                    {experience.totalYears} yrs
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">Tenure</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)]">
                  <div className="text-base font-black text-[var(--text-primary)]">
                    {experience.rolesCount} roles
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">Positions</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)] col-span-2">
                  <div className="text-[11px] font-bold text-[var(--text-primary)] truncate">
                    {experience.industries.slice(0, 2).join(", ") || "Technology"}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">
                    {experience.industries.length} Industries · {experience.organizations.length} Organizations
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => onExploreDimension("experience")}
            className="w-full text-center text-xs font-bold text-sky-500 hover:text-sky-400 py-1.5 border-t border-[var(--border)] pt-2 cursor-pointer flex items-center justify-center gap-1"
          >
            <span>Explore Context</span>
            <ChevronRight size={12} />
          </button>
        </div>

        {/* Dimension 4: Progression */}
        <div className="rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] p-5 space-y-4 flex flex-col justify-between hover:border-violet-500/30 transition-all group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-500">
                  <TrendingUp size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[var(--text-primary)]">Progression</h3>
                  <p className="text-[11px] text-[var(--text-muted)]">Trajectory & evolution</p>
                </div>
              </div>
              <button
                onClick={() => onExploreDimension("progression")}
                className="text-[var(--text-muted)] hover:text-violet-500 transition-colors p-1"
                title="Explore Progression"
                aria-label="Explore Progression"
              >
                <ArrowUpRight size={15} />
              </button>
            </div>

            {/* Progression trajectory items */}
            <div className="space-y-2 pt-1">
              {progression.signals.length === 0 ? (
                <div className="p-4 rounded-xl bg-[var(--card)] text-xs text-[var(--text-muted)] italic text-center border border-dashed border-[var(--border)]">
                  Building from your career history...
                </div>
              ) : (
                progression.signals.slice(0, 3).map((sig) => (
                  <div
                    key={sig.id}
                    className="p-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)] space-y-1 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--text-primary)] line-clamp-1">
                        {sig.title}
                      </span>
                      <span className="text-[10px] font-black text-violet-500 bg-violet-500/10 px-1 rounded">
                        ↑ Scope
                      </span>
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] line-clamp-1">
                      {sig.description}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => onExploreDimension("progression")}
            className="w-full text-center text-xs font-bold text-violet-500 hover:text-violet-400 py-1.5 border-t border-[var(--border)] pt-2 cursor-pointer flex items-center justify-center gap-1"
          >
            <span>{progression.signals.length > 0 ? `View Timeline (${progression.signals.length})` : "Explore Dimension"}</span>
            <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
