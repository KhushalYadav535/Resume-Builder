"use client";

import React from "react";
import Link from "next/link";
import { PlusCircle, HelpCircle, ArrowRight, ShieldAlert, Sparkles, CheckCircle2 } from "lucide-react";
import { StrengtheningArea } from "@/types/value";

interface AreasToStrengthenCardProps {
  areas: StrengtheningArea[];
}

export default function AreasToStrengthenCard({ areas }: AreasToStrengthenCardProps) {
  if (!areas || areas.length === 0) return null;

  return (
    <div className="rounded-3xl bg-[var(--card)] border border-[var(--border)] p-6 sm:p-8 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div>
          <div className="flex items-center gap-2 text-violet-500 font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles size={14} />
            <span>Area 4 · Opportunity Discovery</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] font-['Syne',sans-serif] tracking-tight">
            Areas to Strengthen
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            Constructive opportunities to record additional career evidence. Absence of evidence is not absence of ability.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 text-xs font-semibold self-start sm:self-auto">
          <span>Non-Judgmental Evidence Map</span>
        </div>
      </div>

      {/* Grid of Strengthening Opportunities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {areas.map((area, idx) => {
          const isLimited = area.level === "Limited evidence currently available";
          const isModerate = area.level === "Moderate evidence";

          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl border transition-all space-y-3 flex flex-col justify-between ${
                isLimited
                  ? "bg-violet-500/5 border-violet-500/30 hover:border-violet-500/50"
                  : isModerate
                  ? "bg-amber-500/5 border-amber-500/30 hover:border-amber-500/50"
                  : "bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-500/50"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    {area.dimension}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      isLimited
                        ? "bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/30"
                        : isModerate
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                        : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    }`}
                  >
                    {area.level}
                  </span>
                </div>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {area.explanation}
                </p>
              </div>

              {/* Actionable Prompt */}
              <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
                <span className="text-[11px] text-[var(--text-muted)] truncate max-w-[240px]">
                  {area.suggestedAction}
                </span>

                <Link
                  href={area.actionLink || "/career-journal"}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 transition-colors shrink-0"
                >
                  <span>Add Event</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
