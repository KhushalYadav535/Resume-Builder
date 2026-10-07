"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Brain,
  Zap,
  Briefcase,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Building2,
  Compass,
  Filter,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import {
  CareerInterpretation,
  ExperienceDimension,
  ProgressionSignalItem,
  CapabilityClassification,
  EvidenceSummary,
} from "@/types/value";
import ValueSpotlight from "./ValueSpotlight";
import ValueDrilldownHero from "./ValueDrilldownHero";

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
  /** Optional evidence totals for the hero "Based on" strip (Spec §3). Falls back to computed counts. */
  evidenceSummary?: EvidenceSummary;
}

/** Informational basis stats — counts only, never scores (Spec §3, §8). */
function basisStats(
  evidenceSummary: EvidenceSummary | undefined,
  computed: { value: string | number; label: string }[]
): { value: string | number; label: string }[] {
  if (evidenceSummary) {
    return [
      { value: evidenceSummary.confirmedFacts, label: "confirmed facts" },
      { value: evidenceSummary.evidenceItems, label: "evidence items" },
      { value: evidenceSummary.careerEvents, label: "career events" },
    ];
  }
  return computed;
}

function evidenceClusterTotal(items: CareerInterpretation[]): number {
  return items.reduce((n, i) => n + (i.supportingEvidence?.length ?? 0), 0);
}

export default function ValueDimensionDetailView({
  dimension,
  capabilities,
  impact,
  experience,
  progression,
  onSelectInterpretation,
  onExploreFacts,
  evidenceSummary,
}: ValueDimensionDetailViewProps) {
  // Dimension filters (Spec §6: All | Strong Evidence / Demonstrated | Emerging | Suggested)
  const [capabilityFilter, setCapabilityFilter] = useState<string>("ALL");
  const [impactFilter, setImpactFilter] = useState<string>("ALL");

  const filteredCapabilities = useMemo(() => {
    if (capabilityFilter === "ALL") return capabilities;
    return capabilities.filter((c) => {
      const classification = c.classification || (c.status === "ACCEPTED" || c.status === "EDITED" ? "DEMONSTRATED" : "SUGGESTED");
      return classification === capabilityFilter;
    });
  }, [capabilities, capabilityFilter]);

  const filteredImpact = useMemo(() => {
    if (impactFilter === "ALL") return impact;
    return impact.filter((i) => {
      if (impactFilter === "DEMONSTRATED") return i.confidence === "HIGH";
      if (impactFilter === "EMERGING") return i.confidence === "MODERATE";
      if (impactFilter === "SUGGESTED") return i.confidence === "DEVELOPING" || i.status === "SUGGESTED";
      return true;
    });
  }, [impact, impactFilter]);

  // Helper for Spec §5 Capability Classification Badge
  const renderClassificationBadge = (interp: CareerInterpretation) => {
    const classification: CapabilityClassification =
      interp.classification ||
      (interp.status === "ACCEPTED" || interp.status === "EDITED" ? "DEMONSTRATED" : "SUGGESTED");

    if (classification === "DEMONSTRATED") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
          <span className="text-xs">●</span>
          <span>Demonstrated</span>
        </span>
      );
    }
    if (classification === "EMERGING") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
          <span className="text-xs">◐</span>
          <span>Emerging</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
        <span className="text-xs">○</span>
        <span>Suggested</span>
      </span>
    );
  };

  if (dimension === "capabilities") {
    const demonstratedCount = capabilities.filter(
      (c) => c.status === "ACCEPTED" || c.status === "EDITED"
    ).length;
    const topCaps = capabilities.slice(0, 3).map((c) => c.title);
    return (
      <div className="space-y-6">
        <ValueDrilldownHero
          crumbs={[{ label: "Value", href: "/value" }, { label: "Capabilities" }]}
          eyebrow="Deep Dive · Capabilities"
          title="Demonstrated Capabilities"
          description="What your career experience demonstrates you can do. Each capability is classified by evidence strength: Demonstrated (●), Emerging (◐), or Suggested (○)."
          icon={<Brain size={22} strokeWidth={2.2} />}
          accent="amber"
          ghostWord="CAPABILITIES"
          summary={
            topCaps.length > 0
              ? `Your experience shows a strong pattern of ${topCaps.join(", ")}.`
              : undefined
          }
          stats={basisStats(evidenceSummary, [
            { value: capabilities.length, label: "capabilities" },
            { value: evidenceClusterTotal(capabilities), label: "evidence clusters" },
            { value: demonstratedCount, label: "demonstrated" },
          ])}
          badge={
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-300 text-[11px] font-bold tabular-nums">
              {capabilities.length} capabilit{capabilities.length === 1 ? "y" : "ies"}
            </span>
          }
        />

        {/* Spec §6: Dimension Filter Bar — segmented premium control */}
        <div className="value-rise value-delay-2 flex items-center justify-between gap-3 flex-wrap rounded-2xl border border-[var(--border)] bg-[var(--card)]/80 backdrop-blur px-2.5 py-2 shadow-xs">
          <div className="flex items-center gap-1 overflow-x-auto value-noscroll rounded-full bg-[var(--bg-elevated)]/70 border border-[var(--border)]/70 p-1" role="tablist" aria-label="Filter capabilities">
            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.14em] pl-2.5 pr-1 hidden sm:flex items-center gap-1 shrink-0">
              <Filter size={12} />
            </span>
            {[
              { id: "ALL", label: "All" },
              { id: "DEMONSTRATED", label: "● Demonstrated" },
              { id: "EMERGING", label: "◐ Emerging" },
              { id: "SUGGESTED", label: "○ Suggested" },
            ].map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={capabilityFilter === tab.id}
                onClick={() => setCapabilityFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer whitespace-nowrap ${
                  capabilityFilter === tab.id
                    ? "bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-brand-navy shadow-[0_6px_18px_rgba(245,158,11,0.4)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[var(--text-muted)] tabular-nums">
              {filteredCapabilities.length} shown
            </span>
            <Link
              href="/value/capabilities"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/25 hover:bg-amber-500/20 transition-colors"
            >
              <span>Dedicated Page</span>
              <ExternalLink size={12} />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCapabilities.map((cap, idx) => {
            const clusterCount = cap.supportingEvidence?.length || 0;
            const strengthPct = Math.min(100, 18 + clusterCount * 22);
            return (
            <ValueSpotlight
              key={cap.id}
              onOpen={() => onSelectInterpretation(cap)}
              label={`Open ${cap.title} evidence`}
              style={{ animationDelay: `${Math.min(idx, 7) * 0.06}s` }}
              className="value-rise relative p-6 rounded-[1.4rem] bg-[var(--card)] border border-[var(--border)] hover:border-amber-500/50 hover:-translate-y-1.5 hover:shadow-[0_22px_60px_rgba(245,158,11,0.16)] transition-all duration-300 space-y-4 flex flex-col justify-between overflow-hidden"
            >
              <span className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-amber-500 via-amber-400/70 to-transparent" aria-hidden="true" />
              {/* evidence-strength hairline */}
              <span className="absolute top-[3px] inset-x-0 h-[2px] bg-[var(--border)]/40" aria-hidden="true">
                <span
                  className="block h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all"
                  style={{ width: `${strengthPct}%` }}
                />
              </span>
              <span className="absolute top-4 right-5 text-4xl font-black font-['Syne',sans-serif] text-amber-500/[0.14] select-none tabular-nums" aria-hidden="true">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  {renderClassificationBadge(cap)}

                  {cap.isStale ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 flex items-center gap-1">
                      <AlertTriangle size={11} />
                      Needs Recalculation
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-1">
                      <ShieldCheck size={14} className="text-emerald-500" />
                      {cap.confidence} Confidence
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-extrabold tracking-tight text-[var(--text-primary)] font-['Syne',sans-serif]">
                  {cap.title}
                </h3>

                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {cap.description}
                </p>

                {cap.isStale && cap.staleReason && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300">
                    {cap.staleReason}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
                <span className="text-xs text-[var(--text-muted)] tabular-nums">
                  {clusterCount} evidence cluster{clusterCount !== 1 ? "s" : ""}
                </span>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/value/interpretations/${cap.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-amber-500"
                    title="Open standalone page"
                  >
                    <span>Full View</span>
                    <ExternalLink size={11} />
                  </Link>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectInterpretation(cap);
                    }}
                    className="group/why inline-flex items-center gap-1.5 text-xs font-black text-amber-600 dark:text-amber-400 hover:text-amber-500 cursor-pointer"
                  >
                    <span>Why do we say this?</span>
                    <ArrowRight size={13} className="group-hover/why:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </ValueSpotlight>
            );
          })}
        </div>
      </div>
    );
  }

  if (dimension === "impact") {
    const topImpacts = impact.slice(0, 2).map((i) => i.title);
    return (
      <div className="space-y-6">
        <ValueDrilldownHero
          crumbs={[{ label: "Value", href: "/value" }, { label: "Impact" }]}
          eyebrow="Deep Dive · Impact"
          title="Verified Career Impact"
          description="What changed because of your work. Measurable contributions, scale expansion, and operational transformations derived from real outcomes."
          icon={<Zap size={22} strokeWidth={2.2} />}
          accent="emerald"
          ghostWord="IMPACT"
          summary={
            topImpacts.length > 0
              ? `Strongest signals: ${topImpacts.join(" · ")}.`
              : undefined
          }
          stats={basisStats(evidenceSummary, [
            { value: impact.length, label: "impact signals" },
            { value: evidenceClusterTotal(impact), label: "evidence clusters" },
          ])}
          badge={
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold tabular-nums">
              {impact.length} impact signal{impact.length === 1 ? "" : "s"}
            </span>
          }
        />

        {/* Dimension Filter Bar — segmented premium control */}
        <div className="value-rise value-delay-2 flex items-center justify-between gap-3 flex-wrap rounded-2xl border border-[var(--border)] bg-[var(--card)]/80 backdrop-blur px-2.5 py-2 shadow-xs">
          <div className="flex items-center gap-1 overflow-x-auto value-noscroll rounded-full bg-[var(--bg-elevated)]/70 border border-[var(--border)]/70 p-1" role="tablist" aria-label="Filter impacts">
            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.14em] pl-2.5 pr-1 hidden sm:flex items-center gap-1 shrink-0">
              <Filter size={12} />
            </span>
            {[
              { id: "ALL", label: "All" },
              { id: "DEMONSTRATED", label: "● High Impact" },
              { id: "EMERGING", label: "◐ Moderate" },
              { id: "SUGGESTED", label: "○ Developing" },
            ].map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={impactFilter === tab.id}
                onClick={() => setImpactFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer whitespace-nowrap ${
                  impactFilter === tab.id
                    ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-[0_6px_18px_rgba(16,185,129,0.4)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[var(--text-muted)] tabular-nums">
              {filteredImpact.length} shown
            </span>
            <Link
              href="/value/impact"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-500/20 transition-colors"
            >
              <span>Dedicated Page</span>
              <ExternalLink size={12} />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredImpact.map((imp, idx) => {
            const clusterCount = imp.supportingEvidence?.length || 0;
            const strengthPct = Math.min(100, 18 + clusterCount * 22);
            return (
            <ValueSpotlight
              key={imp.id}
              onOpen={() => onSelectInterpretation(imp)}
              label={`Open ${imp.title} evidence`}
              style={{ animationDelay: `${Math.min(idx, 7) * 0.06}s` }}
              className="value-rise relative p-6 rounded-[1.4rem] bg-[var(--card)] border border-[var(--border)] hover:border-emerald-500/50 hover:-translate-y-1.5 hover:shadow-[0_22px_60px_rgba(16,185,129,0.16)] transition-all duration-300 space-y-4 flex flex-col justify-between overflow-hidden"
            >
              <span className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-emerald-500 via-teal-400/70 to-transparent" aria-hidden="true" />
              <span className="absolute top-[3px] inset-x-0 h-[2px] bg-[var(--border)]/40" aria-hidden="true">
                <span
                  className="block h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-300 transition-all"
                  style={{ width: `${strengthPct}%` }}
                />
              </span>
              <span className="absolute top-4 right-5 text-4xl font-black font-['Syne',sans-serif] text-emerald-500/[0.14] select-none tabular-nums" aria-hidden="true">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-[0_0_16px_rgba(16,185,129,0.25)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                    Demonstrated Impact
                  </span>
                  <span className="text-xs font-semibold text-[var(--text-muted)]">
                    {imp.confidence} Confidence
                  </span>
                </div>

                <h3 className="text-lg font-extrabold tracking-tight text-[var(--text-primary)] font-['Syne',sans-serif]">
                  {imp.title}
                </h3>

                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {imp.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
                <span className="text-xs text-[var(--text-muted)] tabular-nums">
                  {clusterCount} evidence cluster{clusterCount !== 1 ? "s" : ""}
                </span>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/value/interpretations/${imp.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-emerald-500"
                    title="Open standalone page"
                  >
                    <span>Full View</span>
                    <ExternalLink size={11} />
                  </Link>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectInterpretation(imp);
                    }}
                    className="group/why inline-flex items-center gap-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 cursor-pointer"
                  >
                    <span>Why do we say this?</span>
                    <ArrowRight size={13} className="group-hover/why:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </ValueSpotlight>
            );
          })}
        </div>
      </div>
    );
  }

  if (dimension === "experience") {
    const expStats = [
      { value: experience.totalYears, unit: "Years", label: "Professional Tenure" },
      { value: experience.rolesCount, unit: "Roles", label: "Distinct Positions" },
      { value: experience.industries.length, unit: "Sectors", label: "Industries Navigated" },
      { value: experience.organizations.length, unit: "Companies", label: "Organizations" },
    ];
    return (
      <div className="space-y-6">
        <ValueDrilldownHero
          crumbs={[{ label: "Value", href: "/value" }, { label: "Experience" }]}
          eyebrow="Deep Dive · Experience"
          title="Breadth & Organizational Context"
          description="The environments, scale, and operational domains across your career trajectory. Experience is descriptive context rather than a capability rating."
          icon={<Briefcase size={22} strokeWidth={2.2} />}
          accent="sky"
          ghostWord="EXPERIENCE"
          stats={basisStats(evidenceSummary, [
            { value: `${experience.totalYears}y`, label: "tenure" },
            { value: experience.rolesCount, label: "roles" },
            { value: experience.industries.length, label: "sectors" },
          ])}
          badge={
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-700 dark:text-sky-300 text-[11px] font-bold tabular-nums">
              {experience.totalYears}y · {experience.rolesCount} roles
            </span>
          }
        />

        {/* Narrative Box */}
        <div className="value-rise value-delay-2 relative p-6 sm:p-7 rounded-[1.4rem] bg-[var(--card)] border border-[var(--border)] hover:border-sky-500/35 transition-colors space-y-3 overflow-hidden">
          <span className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-sky-400 to-blue-600" aria-hidden="true" />
          <div className="absolute -right-16 -top-16 w-56 h-56 bg-sky-500/[0.07] rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
          <h3 className="relative text-[11px] font-black uppercase tracking-[0.16em] text-[var(--text-muted)]">
            Contextual Summary
          </h3>
          <p className="relative text-sm sm:text-[15px] text-[var(--text-secondary)] leading-relaxed">
            <span className="font-serif italic text-lg text-sky-500 leading-none mr-1" aria-hidden="true">&ldquo;</span>
            {experience.narrative}
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {expStats.map((s, i) => (
            <div
              key={s.label}
              style={{ animationDelay: `${0.15 + i * 0.07}s` }}
              className="value-rise group relative p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-sky-500/40 hover:-translate-y-1 hover:shadow-[0_16px_44px_rgba(14,165,233,0.14)] transition-all duration-300 space-y-1.5 overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-sky-500 via-blue-400/70 to-transparent" aria-hidden="true" />
              <span className="absolute -bottom-3 right-2 text-5xl font-black font-['Syne',sans-serif] text-sky-500/[0.10] select-none tabular-nums leading-none" aria-hidden="true">
                {String(s.value).padStart(2, "0")}
              </span>
              <div className="relative text-[10.5px] font-black text-[var(--text-muted)] uppercase tracking-[0.12em]">
                {s.label}
              </div>
              <div className="relative text-3xl font-black text-[var(--text-primary)] font-['Syne',sans-serif] tabular-nums leading-none">
                {s.value}
                <span className="ml-1.5 text-xs font-bold text-sky-500 uppercase tracking-wider">{s.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Organizations & Domains */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="value-rise value-delay-3 p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] hover:border-sky-500/30 transition-colors space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
              <span className="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-500 shrink-0">
                <Building2 size={14} />
              </span>
              <span>Organizations Served</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {experience.organizations.map((org, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-xs font-semibold text-[var(--text-primary)] hover:border-sky-500/50 hover:text-sky-600 dark:hover:text-sky-400 hover:-translate-y-px transition-all cursor-default"
                >
                  {org}
                </span>
              ))}
            </div>
          </div>

          <div className="value-rise value-delay-4 p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] hover:border-sky-500/30 transition-colors space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
              <span className="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-500 shrink-0">
                <Compass size={14} />
              </span>
              <span>Domain & Sector Exposure</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {experience.industries.map((ind, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-xs font-semibold text-[var(--text-primary)] hover:border-sky-500/50 hover:text-sky-600 dark:hover:text-sky-400 hover:-translate-y-px transition-all cursor-default"
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
      <ValueDrilldownHero
        crumbs={[{ label: "Value", href: "/value" }, { label: "Progression" }]}
        eyebrow="Deep Dive · Progression"
        title="Career Evolution & Scope Growth"
        description="How your responsibility, organizational reach, and autonomous ownership have expanded across career milestones."
        icon={<TrendingUp size={22} strokeWidth={2.2} />}
        accent="violet"
        ghostWord="PROGRESSION"
        summary={
          progression.evolutionSummary
            ? progression.evolutionSummary.length > 160
              ? `${progression.evolutionSummary.slice(0, 157).trim()}…`
              : progression.evolutionSummary
            : undefined
        }
        stats={basisStats(evidenceSummary, [
          { value: progression.signals.length, label: "milestones" },
        ])}
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-700 dark:text-violet-300 text-[11px] font-bold tabular-nums">
            {progression.signals.length} milestone{progression.signals.length === 1 ? "" : "s"}
          </span>
        }
      />

      {/* Evolution Summary Box */}
      <div className="value-rise value-delay-2 relative p-6 sm:p-7 rounded-[1.4rem] bg-[var(--card)] border border-[var(--border)] hover:border-violet-500/35 transition-colors space-y-3 overflow-hidden">
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-violet-400 to-purple-600" aria-hidden="true" />
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-violet-500/[0.07] rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
        <h3 className="relative text-[11px] font-black uppercase tracking-[0.16em] text-[var(--text-muted)]">
          Evolutionary Trajectory
        </h3>
        <p className="relative text-sm sm:text-[15px] text-[var(--text-secondary)] leading-relaxed">
          {progression.evolutionSummary}
        </p>
      </div>

      {/* Timeline Signals — glowing vertical rail */}
      <div className="relative pl-1">
        <div className="absolute left-[27px] top-4 bottom-4 w-px bg-gradient-to-b from-violet-500/70 via-amber-500/40 to-transparent" aria-hidden="true" />
        <div className="space-y-3">
          {progression.signals.map((sig, idx) => (
            <div
              key={sig.id || idx}
              style={{ animationDelay: `${0.15 + Math.min(idx, 7) * 0.07}s` }}
              className="value-rise group relative ml-0 pl-12 p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-violet-500/45 hover:-translate-y-0.5 hover:shadow-[0_16px_44px_rgba(139,92,246,0.14)] transition-all duration-300 space-y-2 overflow-hidden"
            >
              <span
                className="absolute left-[19px] top-6 w-[17px] h-[17px] rounded-full bg-[var(--card)] border-[3px] border-violet-500 shadow-[0_0_14px_rgba(139,92,246,0.65)] group-hover:scale-110 transition-transform"
                aria-hidden="true"
              />
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-[10px] font-black tabular-nums text-violet-500/70">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <h4 className="text-sm sm:text-[15px] font-extrabold tracking-tight text-[var(--text-primary)] font-['Syne',sans-serif]">
                    {sig.title}
                  </h4>
                </div>
                <span className="text-[11px] font-bold text-violet-500 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20 shrink-0">
                  ↑ Scope Expansion
                </span>
              </div>

              <p className="text-xs sm:text-[13px] text-[var(--text-secondary)] leading-relaxed">
                {sig.description}
              </p>

              <div className="pt-2 mt-1 border-t border-[var(--border)]/70 text-[11px] text-[var(--text-muted)] flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] italic font-medium text-[var(--text-primary)]/80">
                  &ldquo;{sig.evidence}&rdquo;
                </span>
                <span>· Source: {sig.source}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
