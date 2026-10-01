"use client";

import React from "react";
import { CheckCircle2, Calendar, Link2, ArrowRight, ShieldCheck, Database } from "lucide-react";
import { EvidenceSummary } from "@/types/value";

interface EvidenceFoundationCardProps {
  evidenceSummary: EvidenceSummary;
  onExploreFacts: () => void;
}

export default function EvidenceFoundationCard({
  evidenceSummary,
  onExploreFacts,
}: EvidenceFoundationCardProps) {
  return (
    <div className="rounded-3xl bg-[var(--card)] border border-[var(--border)] p-6 sm:p-8 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-wider mb-1">
            <Database size={14} />
            <span>Area 3 · Grounded Record</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] font-['Syne',sans-serif] tracking-tight">
            Evidence Foundation
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            The verifiable substrate of facts and career events backing your professional value.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold self-start sm:self-auto">
          <ShieldCheck size={14} />
          <span>Provable Substrate · No Hallucinated Claims</span>
        </div>
      </div>

      {/* 3 Metric Pillars (Confirmed Facts, Career Events, Evidence Links) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Pillar 1: Confirmed Facts */}
        <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Confirmed Facts
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
              <CheckCircle2 size={15} />
            </div>
          </div>
          <div className="text-3xl font-black text-[var(--text-primary)] font-['Syne',sans-serif]">
            {evidenceSummary.confirmedFacts}
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Verified atomic facts extracted from resume and journal.
          </p>
        </div>

        {/* Pillar 2: Career Events */}
        <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Career Events
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-500">
              <Calendar size={15} />
            </div>
          </div>
          <div className="text-3xl font-black text-[var(--text-primary)] font-['Syne',sans-serif]">
            {evidenceSummary.careerEvents}
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Recorded milestones, achievements, and tenures.
          </p>
        </div>

        {/* Pillar 3: Evidence Links */}
        <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Evidence Links
            </span>
            <div className="w-7 h-7 rounded-lg bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-500">
              <Link2 size={15} />
            </div>
          </div>
          <div className="text-3xl font-black text-[var(--text-primary)] font-['Syne',sans-serif]">
            {evidenceSummary.evidenceItems}
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Synthesized evidence clusters connecting facts to interpretations.
          </p>
        </div>
      </div>

      {/* Explore Facts Call to Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <p className="text-xs text-[var(--text-muted)] max-w-xl">
          UpRole intentionally rejects arbitrary numerical scores. Career value is measured by the verifiable breadth and depth of your proven record.
        </p>

        <button
          onClick={onExploreFacts}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all cursor-pointer self-start sm:self-auto group"
        >
          <span>Explore Facts</span>
          <ArrowRight size={14} className="text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
