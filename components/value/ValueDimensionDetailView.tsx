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
        <div className="rounded-3xl bg-[var(--card)] border border-[var(--border)] p-6 sm:p-8 space-y-3">
          <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-wider">
            <Brain size={16} />
            <span>Dimension Deep Dive · Capabilities</span>
          </div>
          <h2 className="text-2xl font-black text-[var(--text-primary)] font-['Syne',sans-serif]">
            Demonstrated Capabilities
          </h2>
          <p className="text-sm text-[var(--text-muted)] max-w-2xl leading-relaxed">
            What your career experience demonstrates you can do. Each capability is backed by clusters of verified evidence and atomic career facts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {capabilities.map((cap) => {
            const isConfirmed = cap.status === "ACCEPTED" || cap.status === "EDITED";
            return (
              <div
                key={cap.id}
                className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] hover:border-amber-500/40 transition-all space-y-4 flex flex-col justify-between"
              >
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
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (dimension === "impact") {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl bg-[var(--card)] border border-[var(--border)] p-6 sm:p-8 space-y-3">
          <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-wider">
            <Zap size={16} />
            <span>Dimension Deep Dive · Impact</span>
          </div>
          <h2 className="text-2xl font-black text-[var(--text-primary)] font-['Syne',sans-serif]">
            Verified Career Impact
          </h2>
          <p className="text-sm text-[var(--text-muted)] max-w-2xl leading-relaxed">
            What changed because of your work. Measurable contributions, scale expansion, and operational transformations derived from real outcomes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {impact.map((imp) => (
            <div
              key={imp.id}
              className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] hover:border-emerald-500/40 transition-all space-y-4 flex flex-col justify-between"
            >
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
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (dimension === "experience") {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl bg-[var(--card)] border border-[var(--border)] p-6 sm:p-8 space-y-3">
          <div className="flex items-center gap-2 text-sky-500 font-bold text-xs uppercase tracking-wider">
            <Briefcase size={16} />
            <span>Dimension Deep Dive · Experience</span>
          </div>
          <h2 className="text-2xl font-black text-[var(--text-primary)] font-['Syne',sans-serif]">
            Breadth & Organizational Context
          </h2>
          <p className="text-sm text-[var(--text-muted)] max-w-2xl leading-relaxed">
            The environments, scale, and operational domains across your career trajectory. Experience is descriptive context rather than a capability rating.
          </p>
        </div>

        {/* Narrative Box */}
        <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] space-y-4">
          <h3 className="text-base font-bold text-[var(--text-primary)]">
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
      <div className="rounded-3xl bg-[var(--card)] border border-[var(--border)] p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-2 text-violet-500 font-bold text-xs uppercase tracking-wider">
          <TrendingUp size={16} />
          <span>Dimension Deep Dive · Progression</span>
        </div>
        <h2 className="text-2xl font-black text-[var(--text-primary)] font-['Syne',sans-serif]">
          Career Evolution & Scope Growth
        </h2>
        <p className="text-sm text-[var(--text-muted)] max-w-2xl leading-relaxed">
          How your responsibility, organizational reach, and autonomous ownership have expanded across career milestones.
        </p>
      </div>

      {/* Evolution Summary Box */}
      <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] space-y-2">
        <h3 className="text-base font-bold text-[var(--text-primary)]">
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
