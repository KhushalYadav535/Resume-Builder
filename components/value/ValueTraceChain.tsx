"use client";

import React from "react";
import { Database, FileCheck2, Link2, Sparkles, Crown } from "lucide-react";

const steps = [
  { label: "Source", icon: Database, title: "Resume, journal & career events" },
  { label: "Fact", icon: FileCheck2, title: "Verified atomic facts you approved" },
  { label: "Evidence", icon: Link2, title: "Why each fact matters" },
  { label: "Interpretation", icon: Sparkles, title: "What the evidence proves" },
  { label: "Value", icon: Crown, title: "Your career value profile", gold: true },
];

/**
 * Traceability pipeline — the 5-layer proof chain rendered as
 * a living journey: numbered nodes on a line with travelling light.
 * Pure presentational.
 */
export default function ValueTraceChain() {
  return (
    <div>
      <div className="relative">
        {/* base rail */}
        <div
          aria-hidden="true"
          className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-[var(--border-strong)] via-amber-500/40 to-[var(--border-strong)]"
        />
        {/* travelling light */}
        <div
          aria-hidden="true"
          className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-[3px] -mt-[1px] overflow-hidden rounded-full"
        >
          <div className="value-chain-flow h-full w-1/4 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
        </div>

        <ol
          aria-label="Traceability chain: source to value"
          className="value-noscroll relative flex items-center gap-2 sm:gap-2.5 overflow-x-auto py-1.5"
        >
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isGold = !!s.gold;
            return (
              <li
                key={s.label}
                title={s.title}
                className="value-pop shrink-0"
                style={{ animationDelay: `${0.15 + i * 0.09}s` }}
              >
                <span
                  className={`relative inline-flex items-center gap-1.5 pl-2 pr-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-[0.1em] backdrop-blur transition-all duration-300 hover:-translate-y-0.5 cursor-default ${
                    isGold
                      ? "bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-brand-navy border-amber-500 shadow-[0_8px_26px_rgba(245,158,11,0.5)]"
                      : "bg-[var(--bg-elevated)]/95 text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--text-primary)] hover:border-amber-500/60 hover:shadow-[0_8px_24px_rgba(245,158,11,0.22)]"
                  }`}
                >
                  <span
                    className={`text-[9px] font-black tabular-nums tracking-wider ${
                      isGold ? "text-brand-navy/60" : "text-amber-500/80"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <Icon
                    size={13}
                    strokeWidth={2.5}
                    className={isGold ? "text-brand-navy" : "text-amber-500"}
                  />
                  <span>{s.label}</span>
                  {isGold && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[var(--card)]" aria-hidden="true" />
                  )}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <p className="mt-1.5 text-[11px] font-medium text-[var(--text-muted)]">
        Five layers, zero gaps — open any interpretation to walk its proof, fact by fact.
      </p>
    </div>
  );
}
