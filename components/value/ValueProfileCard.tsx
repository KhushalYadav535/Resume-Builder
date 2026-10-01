"use client";

import React from "react";
import {
  Brain,
  Zap,
  Briefcase,
  TrendingUp,
  ChevronRight,
  ShieldCheck,
  Layers,
} from "lucide-react";
import ValueSectionHeader from "./ValueSectionHeader";
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

const dimensionMeta = {
  capabilities: {
    accent: "amber" as const,
    topBar: "from-amber-500 via-amber-400 to-amber-500",
    iconWrap: "bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400",
    hoverBorder: "hover:border-amber-500/40 hover:shadow-[0_14px_40px_rgba(245,158,11,0.12)]",
    link: "text-amber-600 dark:text-amber-400",
    badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  },
  impact: {
    accent: "emerald" as const,
    topBar: "from-emerald-500 via-teal-400 to-emerald-500",
    iconWrap: "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
    hoverBorder: "hover:border-emerald-500/40 hover:shadow-[0_14px_40px_rgba(16,185,129,0.12)]",
    link: "text-emerald-600 dark:text-emerald-400",
    badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  },
  experience: {
    accent: "sky" as const,
    topBar: "from-sky-500 via-blue-400 to-sky-500",
    iconWrap: "bg-sky-500/15 border-sky-500/30 text-sky-600 dark:text-sky-400",
    hoverBorder: "hover:border-sky-500/40 hover:shadow-[0_14px_40px_rgba(14,165,233,0.12)]",
    link: "text-sky-600 dark:text-sky-400",
    badge: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30",
  },
  progression: {
    accent: "violet" as const,
    topBar: "from-violet-500 via-purple-400 to-violet-500",
    iconWrap: "bg-violet-500/15 border-violet-500/30 text-violet-600 dark:text-violet-400",
    hoverBorder: "hover:border-violet-500/40 hover:shadow-[0_14px_40px_rgba(139,92,246,0.12)]",
    link: "text-violet-600 dark:text-violet-400",
    badge: "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30",
  },
};

function DimensionShell({
  id,
  index,
  title,
  subtitle,
  icon,
  count,
  countLabel,
  onExplore,
  children,
}: {
  id: keyof typeof dimensionMeta;
  index: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  count?: number;
  countLabel?: string;
  onExplore: () => void;
  children: React.ReactNode;
}) {
  const m = dimensionMeta[id];

  const handleCardClick = (e: React.MouseEvent) => {
    // If user clicked an inner button with its own handler, let that proceed
    const target = e.target as HTMLElement;
    if (target.closest("button, a") && target.closest("button, a") !== e.currentTarget) {
      return;
    }
    onExplore();
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative rounded-2xl bg-[var(--card)] border border-[var(--border)] overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between h-full min-h-[230px] p-4 sm:p-5 shadow-xs ${m.hoverBorder}`}
      title={`Click to explore ${title} dimension`}
    >
      {/* 2px Crown Hairline */}
      <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r ${m.topBar} z-20`} aria-hidden="true" />
      
      {/* Watermark Numeral */}
      <span aria-hidden="true" className="value-ghost pointer-events-none absolute top-2 right-4 text-[3.8rem] leading-none z-0">
        {title.charAt(0)}
      </span>

      <div className="relative z-10 flex flex-col h-full justify-between">
        {/* Header */}
        <div className="flex items-center justify-between gap-2.5 mb-2.5">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${m.iconWrap}`}>
              {icon}
            </div>
            <div>
              <span className={`text-[10.5px] font-black uppercase tracking-[0.16em] ${m.link} font-['Syne',sans-serif]`}>
                {index}
              </span>
            </div>
          </div>

          {typeof count === "number" && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${m.badge} shrink-0 tabular-nums`}>
              {count} {countLabel || ""}
            </span>
          )}
        </div>

        {/* Bite-sized Body */}
        <div className="my-auto py-1 space-y-1.5 flex-1 flex flex-col justify-center">
          <h3 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] font-['Syne',sans-serif] leading-tight">
            {title}
          </h3>
          <div className="pt-0.5">{children}</div>
        </div>

        {/* Footer */}
        <div className="pt-2.5 mt-2 border-t border-[var(--border)] flex items-center justify-between gap-2 text-xs">
          <span className="text-[11px] text-[var(--text-muted)] font-medium truncate">
            {subtitle}
          </span>

          <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold ${m.link} shrink-0 group-hover:underline`}>
            <span>Explore</span>
            <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
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

export default function ValueProfileCard({
  capabilities,
  impact,
  experience,
  progression,
  onSelectInterpretation,
  onExploreDimension,
}: ValueProfileCardProps) {
  return (
    <section id="value-profile" aria-label="Career value profile" className="value-anchor relative rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-[0_6px_24px_rgba(16,27,59,0.04)] overflow-hidden">
      {/* Gold crown hairline */}
      <div className="h-[2px] w-full bg-gradient-to-r from-amber-500 via-amber-400/80 to-violet-500/60" aria-hidden="true" />
      <span className="value-ghost absolute top-2 right-4 text-[4rem]" aria-hidden="true">01</span>

      <div className="p-5 sm:p-6 space-y-5 relative z-10">
        {/* Header */}
        <ValueSectionHeader
          index="01"
          eyebrow="Core Framework · 4 dimensions"
          eyebrowClass="text-amber-600 dark:text-amber-400"
          icon={<Layers size={18} strokeWidth={2.4} />}
          iconClass="bg-gradient-to-br from-amber-500 to-amber-600 text-brand-navy border-amber-500 shadow-xs"
          title="Career Value Profile"
          description="A multidimensional synthesis derived from verified career facts — never a single score."
          badge={
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              <ShieldCheck size={14} />
              <span>Verified Facts</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          }
        />

        {/* 4 Dimension Tiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch">
          {/* Capabilities */}
          <DimensionShell
            id="capabilities"
            index="Capabilities"
            title="Demonstrated Skills"
            subtitle="What experience proves"
            icon={<Brain size={16} />}
            count={capabilities.length}
            countLabel="found"
            onExplore={() => onExploreDimension("capabilities")}
          >
            {capabilities.length === 0 ? (
              <EmptyHint text="Building from career history…" />
            ) : (
              <div className="space-y-1.5">
                {capabilities.slice(0, 2).map((cap) => {
                  const isConfirmed = cap.status === "ACCEPTED" || cap.status === "EDITED";
                  return (
                    <div
                      key={cap.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectInterpretation(cap);
                      }}
                      className="p-2 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] transition-all flex items-center justify-between gap-1.5 text-xs"
                    >
                      <span className="font-bold text-[var(--text-primary)] truncate text-[11.5px]">
                        {cap.title}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase shrink-0 border ${
                          isConfirmed
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                            : "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {isConfirmed ? "Observed" : "Suggested"}
                      </span>
                    </div>
                  );
                })}
                {capabilities.length > 2 && (
                  <div className="text-[10.5px] font-bold text-amber-600 dark:text-amber-400 pt-0.5">
                    +{capabilities.length - 2} more capabilities verified
                  </div>
                )}
              </div>
            )}
          </DimensionShell>

          {/* Impact */}
          <DimensionShell
            id="impact"
            index="Impact"
            title="Measurable Outcomes"
            subtitle="Business & ROI impact"
            icon={<Zap size={16} />}
            count={impact.length}
            countLabel="found"
            onExplore={() => onExploreDimension("impact")}
          >
            {impact.length === 0 ? (
              <EmptyHint text="Building from career history…" />
            ) : (
              <div className="space-y-1.5">
                {impact.slice(0, 2).map((imp) => (
                  <div
                    key={imp.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectInterpretation(imp);
                    }}
                    className="p-2 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] transition-all text-xs"
                  >
                    <div className="font-bold text-[var(--text-primary)] truncate text-[11.5px]">
                      {imp.title}
                    </div>
                    <p className="text-[10.5px] text-[var(--text-muted)] line-clamp-1 leading-tight mt-0.5">
                      {imp.description}
                    </p>
                  </div>
                ))}
                {impact.length > 2 && (
                  <div className="text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400 pt-0.5">
                    +{impact.length - 2} more impact wins recorded
                  </div>
                )}
              </div>
            )}
          </DimensionShell>

          {/* Experience */}
          <DimensionShell
            id="experience"
            index="Experience"
            title="Tenure & Breadth"
            subtitle="Operational scope"
            icon={<Briefcase size={16} />}
            count={experience.rolesCount}
            countLabel="roles"
            onExplore={() => onExploreDimension("experience")}
          >
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
          </DimensionShell>

          {/* Progression */}
          <DimensionShell
            id="progression"
            index="Progression"
            title="Career Trajectory"
            subtitle="Evolution & title growth"
            icon={<TrendingUp size={16} />}
            count={progression.signals.length}
            countLabel="signals"
            onExplore={() => onExploreDimension("progression")}
          >
            {progression.signals.length === 0 ? (
              <EmptyHint text="Building from career history…" />
            ) : (
              <div className="space-y-1.5">
                {progression.signals.slice(0, 2).map((sig, i) => (
                  <div
                    key={sig.id || i}
                    className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11.5px] font-bold text-[var(--text-primary)] truncate">
                        {sig.title}
                      </span>
                      <span className="text-[9px] font-black text-violet-600 dark:text-violet-400 bg-violet-500/10 px-1 py-px rounded border border-violet-500/20 shrink-0">
                        ↑ Scope
                      </span>
                    </div>
                  </div>
                ))}
                {progression.signals.length > 2 && (
                  <div className="text-[10.5px] font-bold text-violet-600 dark:text-violet-400 pt-0.5">
                    +{progression.signals.length - 2} more progression milestones
                  </div>
                )}
              </div>
            )}
          </DimensionShell>
        </div>
      </div>
    </section>
  );
}
