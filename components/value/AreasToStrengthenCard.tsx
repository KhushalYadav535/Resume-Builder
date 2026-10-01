"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Sprout } from "lucide-react";
import { StrengtheningArea } from "@/types/value";
import ValueSectionHeader from "./ValueSectionHeader";

interface AreasToStrengthenCardProps {
  areas: StrengtheningArea[];
}

function levelStyle(level: string) {
  const l = level.toLowerCase();
  if (l.includes("limited")) {
    return {
      dot: "bg-violet-500",
      pill: "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30",
      bar: "from-violet-500 to-purple-400",
      width: "32%",
      border: "hover:border-violet-500/40",
      edge: "from-violet-500 to-transparent",
    };
  }
  if (l.includes("moderate")) {
    return {
      dot: "bg-amber-500",
      pill: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
      bar: "from-amber-500 to-amber-300",
      width: "62%",
      border: "hover:border-amber-500/40",
      edge: "from-amber-500 to-transparent",
    };
  }
  return {
    dot: "bg-emerald-500",
    pill: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    bar: "from-emerald-500 to-teal-400",
    width: "88%",
    border: "hover:border-emerald-500/40",
    edge: "from-emerald-500 to-transparent",
  };
}

export default function AreasToStrengthenCard({ areas }: AreasToStrengthenCardProps) {
  if (!areas || areas.length === 0) return null;

  return (
    <section id="value-strengthen" aria-label="Areas to strengthen" className="value-anchor relative rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-[0_6px_24px_rgba(16,27,59,0.04)] overflow-hidden">
      {/* 2px Crown hairline */}
      <div className="h-[2px] w-full bg-gradient-to-r from-violet-500 via-amber-500/60 to-emerald-500/60" aria-hidden="true" />
      <span className="value-ghost absolute top-2 right-4 text-[4rem]" aria-hidden="true">04</span>

      <div className="p-5 sm:p-6 space-y-4 relative z-10">
        <ValueSectionHeader
          index="04"
          eyebrow="Opportunity Discovery"
          eyebrowClass="text-violet-600 dark:text-violet-400"
          icon={<Sprout size={18} strokeWidth={2.2} />}
          iconClass="bg-gradient-to-br from-violet-500 to-purple-600 text-white border-violet-500/40 shadow-xs"
          title="Areas to Strengthen"
          description="Actionable prompts to substantiate your record. Absence of evidence is not absence of capability."
          badge={
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-600 dark:text-violet-400 text-xs font-bold">
              <Sparkles size={14} />
              <span>Evidence Opportunities</span>
            </div>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {areas.map((area, idx) => {
            const s = levelStyle(area.level);
            return (
              <div
                key={idx}
                className={`group relative rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] overflow-hidden transition-all duration-300 hover:-translate-y-1 p-4 flex flex-col justify-between shadow-2xs ${s.border}`}
              >
                <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r ${s.edge}`} aria-hidden="true" />

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold tracking-tight text-[var(--text-primary)] font-['Syne',sans-serif]">
                      <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                      {area.dimension}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${s.pill}`}>
                      {area.level}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                    {area.explanation}
                  </p>

                  {/* Evidence coverage meter mini */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      <span>Coverage</span>
                      <span className="tabular-nums">{s.width.replace("%", "")}%</span>
                    </div>
                    <div className="h-1 rounded-full bg-[var(--border)] overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${s.bar}`} style={{ width: s.width }} />
                    </div>
                  </div>
                </div>

                <div className="pt-2.5 mt-2.5 border-t border-[var(--border)] flex items-center justify-between gap-2 text-xs">
                  <span className="text-[11px] text-[var(--text-muted)] truncate max-w-[200px]">
                    {area.suggestedAction}
                  </span>
                  <Link
                    href={area.actionLink || "/career-journal"}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline shrink-0 group/link"
                  >
                    <span>Add Event</span>
                    <ArrowRight size={12} className="group-hover/link:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
