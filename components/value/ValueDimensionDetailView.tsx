"use client";

import React from "react";
import {
  Brain,
  Zap,
  Briefcase,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Layers,
  CheckCircle2,
  Calendar,
  Building2,
  Compass,
} from "lucide-react";
import {
  CareerInterpretation,
  ExperienceDimension,
  ProgressionSignalItem,
  ValueNavigationTab,
} from "@/types/value";
import ValueSectionHeader from "./ValueSectionHeader";
import ValueSpotlight from "./ValueSpotlight";

interface ValueDimensionDetailViewProps {
  dimension: "capabilities" | "impact" | "experience" | "progression";
  capabilities: CareerInterpretation[];
  impact: CareerInterpretation[];
  experience: ExperienceDimension;
  progression: {
    signals: ProgressionSignalItem[];
    evolutionSummary: string;
  };
  onSelectInterpretation: (interp: CareerInterpretation) => void;
  onExploreFacts: () => void;
}

export default function ValueDimensionDetailView({
  dimension,
  capabilities,
  impact,
  experience,
  progression,
  onSelectInterpretation,
  onExploreFacts,
}: ValueDimensionDetailViewProps) {
  if (dimension === "capabilities") {
    return (
      <div className="space-y-6">
        <div className="relative rounded-[1.75rem] bg-[var(--card)] border border-[var(--border)] p-6 sm:p-8 overflow-hidden shadow-[0_20px_60px_rgba(16,27,59,0.08)]">
          <div className="h-[3px] absolute top-0 inset-x-0 bg-gradient-to-r from-amber-500 via-amber-400/70 to-transparent" aria-hidden="true" />
          <div className="absolute -top-20 right-0 w-64 h-64 bg-amber-500/[0.07] rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
          <span className="value-ghost absolute right-5 top-1/2 -translate-y-1/2 text-[3rem] sm:text-[4.2rem] hidden md:block" aria-hidden="true">CAPABILITIES</span>
          <div className="relative">
            <ValueSectionHeader
              index="Deep Dive"
              eyebrow="Capabilities"
              eyebrowClass="text-amber-600 dark:text-amber-400"
              icon={<Brain size={20} strokeWidth={2.2} />}
              iconClass="bg-amber-500/12 text-amber-500 border-amber-500/30 shadow-[0_6px_18px_rgba(245,158,11,0.25)]"
              title="Demonstrated Capabilities"
              description="What your career experience demonstrates you can do. Each capability is backed by clusters of verified evidence and atomic career facts."
              badge={
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-300 text-[11px] font-bold tabular-nums">
                  {capabilities.length} capabilit{capabilities.length === 1 ? "y" : "ies"}
                </span>
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {capabilities.map((cap, idx) => {
            const isConfirmed = cap.status === "ACCEPTED" || cap.status === "EDITED";
            return (
              <ValueSpotlight
                key={cap.id}
                className="relative p-6 rounded-[1.4rem] bg-[var(--card)] border border-[var(--border)] hover:border-amber-500/40 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(245,158,11,0.12)] transition-all space-y-4 flex flex-col justify-between overflow-hidden"
              >
                <span className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-amber-500 via-amber-400/70 to-transparent" aria-hidden="true" />
                <span className="absolute top-4 right-5 text-4xl font-black font-['Syne',sans-serif] text-amber-500/[0.12] select-none tabular-nums" aria-hidden="true">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        isConfirmed
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {isConfirmed ? "Confirmed Capability" : "Suggested Hypothesis"}
                    </span>
                    <span className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-1">
                      <ShieldCheck size={14} className="text-emerald-500" />
                      {cap.confidence} Confidence
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[var(--text-primary)]">
                    {cap.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    {cap.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
                  <span className="text-xs text-[var(--text-muted)]">
                    {cap.supportingEvidence?.length || 0} evidence clusters
                  </span>
                  <button
                    onClick={() => onSelectInterpretation(cap)}
                    className="inline-flex items-center gap-1.5 text-xs font-black text-amber-600 dark:text-amber-400 hover:text-amber-500 cursor-pointer"
                  >
                    <span>Why do we say this?</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </ValueSpotlight>
            );
          })}
        </div>
      </div>
    );
  }

  if (dimension === "impact") {
    return (
      <div className="space-y-6">
        <div className="relative rounded-[1.75rem] bg-[var(--card)] border border-[var(--border)] p-6 sm:p-8 overflow-hidden shadow-[0_20px_60px_rgba(16,27,59,0.08)]">
          <div className="h-[3px] absolute top-0 inset-x-0 bg-gradient-to-r from-emerald-500 via-teal-400/70 to-transparent" aria-hidden="true" />
          <div className="absolute -top-20 right-0 w-64 h-64 bg-emerald-500/[0.07] rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
          <span className="value-ghost absolute right-5 top-1/2 -translate-y-1/2 text-[3rem] sm:text-[4.2rem] hidden md:block" aria-hidden="true">IMPACT</span>
          <div className="relative">
            <ValueSectionHeader
              index="Deep Dive"
              eyebrow="Impact"
              eyebrowClass="text-emerald-600 dark:text-emerald-400"
              icon={<Zap size={20} strokeWidth={2.2} />}
              iconClass="bg-emerald-500/12 text-emerald-500 border-emerald-500/30 shadow-[0_6px_18px_rgba(16,185,129,0.22)]"
              title="Verified Career Impact"
              description="What changed because of your work. Measurable contributions, scale expansion, and operational transformations derived from real outcomes."
              badge={
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold tabular-nums">
                  {impact.length} impact signal{impact.length === 1 ? "" : "s"}
                </span>
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {impact.map((imp, idx) => (
            <ValueSpotlight
              key={imp.id}
              className="relative p-6 rounded-[1.4rem] bg-[var(--card)] border border-[var(--border)] hover:border-emerald-500/40 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(16,185,129,0.12)] transition-all space-y-4 flex flex-col justify-between overflow-hidden"
            >
              <span className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-emerald-500 via-teal-400/70 to-transparent" aria-hidden="true" />
              <span className="absolute top-4 right-5 text-4xl font-black font-['Syne',sans-serif] text-emerald-500/[0.12] select-none tabular-nums" aria-hidden="true">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    Demonstrated Impact
                  </span>
                  <span className="text-xs font-semibold text-[var(--text-muted)]">
                    {imp.confidence} Confidence
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  {imp.title}
                </h3>

                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {imp.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
                <span className="text-xs text-[var(--text-muted)]">
                  {imp.supportingEvidence?.length || 0} evidence clusters
                </span>
                <button
                  onClick={() => onSelectInterpretation(imp)}
                  className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 cursor-pointer"
                >
                  <span>Why do we say this?</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </ValueSpotlight>
          ))}
        </div>
      </div>
    );
  }

  if (dimension === "experience") {
    return (
      <div className="space-y-6">
        <div className="relative rounded-[1.75rem] bg-[var(--card)] border border-[var(--border)] p-6 sm:p-8 overflow-hidden shadow-[0_20px_60px_rgba(16,27,59,0.08)]">
          <div className="h-[3px] absolute top-0 inset-x-0 bg-gradient-to-r from-sky-500 via-blue-400/70 to-transparent" aria-hidden="true" />
          <div className="absolute -top-20 right-0 w-64 h-64 bg-sky-500/[0.07] rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
          <span className="value-ghost absolute right-5 top-1/2 -translate-y-1/2 text-[3rem] sm:text-[4.2rem] hidden md:block" aria-hidden="true">EXPERIENCE</span>
          <div className="relative">
            <ValueSectionHeader
              index="Deep Dive"
              eyebrow="Experience"
              eyebrowClass="text-sky-600 dark:text-sky-400"
              icon={<Briefcase size={20} strokeWidth={2.2} />}
              iconClass="bg-sky-500/12 text-sky-500 border-sky-500/30 shadow-[0_6px_18px_rgba(14,165,233,0.22)]"
              title="Breadth & Organizational Context"
              description="The environments, scale, and operational domains across your career trajectory. Experience is descriptive context rather than a capability rating."
              badge={
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-700 dark:text-sky-300 text-[11px] font-bold tabular-nums">
                  {experience.totalYears}y · {experience.rolesCount} roles
                </span>
              }
            />
          </div>
        </div>

        {/* Narrative Box */}
        <div className="relative p-6 sm:p-7 rounded-[1.4rem] bg-[var(--card)] border border-[var(--border)] space-y-3 overflow-hidden">
          <span className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-sky-400 to-blue-600" aria-hidden="true" />
          <h3 className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--text-muted)]">
            Contextual Summary
          </h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {experience.narrative}
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-1">
            <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Total Professional Tenure
            </div>
            <div className="text-3xl font-black text-[var(--text-primary)] font-['Syne',sans-serif]">
              {experience.totalYears} Years
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-1">
            <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Distinct Positions Held
            </div>
            <div className="text-3xl font-black text-[var(--text-primary)] font-['Syne',sans-serif]">
              {experience.rolesCount} Roles
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-1">
            <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Industries Navigated
            </div>
            <div className="text-3xl font-black text-[var(--text-primary)] font-['Syne',sans-serif]">
              {experience.industries.length} Sectors
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-1">
            <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Organizations
            </div>
            <div className="text-3xl font-black text-[var(--text-primary)] font-['Syne',sans-serif]">
              {experience.organizations.length} Companies
            </div>
          </div>
        </div>

        {/* Organizations & Domains */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
              <Building2 size={15} className="text-sky-500" />
              <span>Organizations Served</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {experience.organizations.map((org, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-xs font-semibold text-[var(--text-primary)]"
                >
                  {org}
                </span>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
              <Compass size={15} className="text-sky-500" />
              <span>Domain & Sector Exposure</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {experience.industries.map((ind, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-xs font-semibold text-[var(--text-primary)]"
                >
                  {ind}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Progression
  return (
    <div className="space-y-6">
      <div className="relative rounded-[1.75rem] bg-[var(--card)] border border-[var(--border)] p-6 sm:p-8 overflow-hidden shadow-[0_20px_60px_rgba(16,27,59,0.08)]">
        <div className="h-[3px] absolute top-0 inset-x-0 bg-gradient-to-r from-violet-500 via-purple-400/70 to-transparent" aria-hidden="true" />
        <div className="absolute -top-20 right-0 w-64 h-64 bg-violet-500/[0.07] rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
        <span className="value-ghost absolute right-5 top-1/2 -translate-y-1/2 text-[3rem] sm:text-[4.2rem] hidden md:block" aria-hidden="true">PROGRESSION</span>
        <div className="relative">
          <ValueSectionHeader
            index="Deep Dive"
            eyebrow="Progression"
            eyebrowClass="text-violet-600 dark:text-violet-400"
            icon={<TrendingUp size={20} strokeWidth={2.2} />}
            iconClass="bg-violet-500/12 text-violet-500 border-violet-500/30 shadow-[0_6px_18px_rgba(139,92,246,0.24)]"
            title="Career Evolution & Scope Growth"
            description="How your responsibility, organizational reach, and autonomous ownership have expanded across career milestones."
            badge={
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-700 dark:text-violet-300 text-[11px] font-bold tabular-nums">
                {progression.signals.length} milestone{progression.signals.length === 1 ? "" : "s"}
              </span>
            }
          />
        </div>
      </div>

      {/* Evolution Summary Box */}
      <div className="relative p-6 sm:p-7 rounded-[1.4rem] bg-[var(--card)] border border-[var(--border)] space-y-3 overflow-hidden">
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-violet-400 to-purple-600" aria-hidden="true" />
        <h3 className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--text-muted)]">
          Evolutionary Trajectory
        </h3>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          {progression.evolutionSummary}
        </p>
      </div>

      {/* Timeline Signals */}
      <div className="space-y-3">
        {progression.signals.map((sig, idx) => (
          <div
            key={sig.id || idx}
            className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-2 relative overflow-hidden"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-violet-500/15 text-violet-600 dark:text-violet-400 flex items-center justify-center text-xs font-black">
                  {idx + 1}
                </span>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">
                  {sig.title}
                </h4>
              </div>
              <span className="text-[11px] font-bold text-violet-500 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20">
                Scope Expansion
              </span>
            </div>

            <p className="text-xs text-[var(--text-secondary)] pl-8">
              {sig.description}
            </p>

            <div className="pl-8 pt-1 text-[11px] text-[var(--text-muted)] flex items-center gap-2">
              <span className="italic font-medium text-[var(--text-primary)]/80">
                &ldquo;{sig.evidence}&rdquo;
              </span>
              <span>· Source: {sig.source}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
