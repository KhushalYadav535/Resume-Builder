"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  TrendingUp,
  Award,
  MessageSquare,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { EvidenceSummaryData } from "@/app/api/value/evidence-summary/route";

interface EvidenceProgressViewProps {
  onNudgeClick?: () => void;
}

export default function EvidenceProgressView({ onNudgeClick }: EvidenceProgressViewProps) {
  const [summary, setSummary] = useState<EvidenceSummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/value/evidence-summary")
      .then((res) => res.json())
      .then((data) => {
        if (data.summary) setSummary(data.summary);
      })
      .catch((err) => console.error("Error fetching evidence summary:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center gap-3 text-xs text-[var(--text-muted)] shadow-xs">
        <Loader2 size={16} className="animate-spin text-teal-500" />
        <span>Loading verified career evidence telemetry...</span>
      </div>
    );
  }

  if (!summary || summary.totalEvidence === 0) return null;

  const signals = [
    {
      label: "Impact Contributions",
      count: summary.impactCount,
      icon: TrendingUp,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      status: summary.impactCount > 0 ? "confirmed" : "pending",
    },
    {
      label: "Recognition Signals",
      count: summary.recognitionCount,
      icon: Award,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      status: summary.recognitionCount > 0 ? "captured" : "pending",
    },
    {
      label: "Progression Signals",
      count: summary.progressionCount,
      icon: Sparkles,
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
      borderColor: "border-violet-500/20",
      status: summary.progressionCount > 0 ? "confirmed" : "needs clarification",
    },
    {
      label: "Feedback & Endorsements",
      count: summary.feedbackCount,
      icon: MessageSquare,
      color: "text-teal-500",
      bgColor: "bg-teal-500/10",
      borderColor: "border-teal-500/20",
      status: summary.feedbackCount > 0 ? "captured" : "pending",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 shadow-sm transition-all hover:shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500/20 to-teal-500/5 border border-teal-500/30 text-teal-500 flex items-center justify-center shadow-xs">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Stage 3 · Career Proof Vault
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] font-['Syne',sans-serif]">
              Evidence & Progression Signals
            </h3>
          </div>
        </div>

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 flex items-center gap-1.5 self-start sm:self-center shadow-xs">
          <CheckCircle2 size={13} />
          <span>{summary.totalEvidence} verified signals</span>
        </span>
      </div>

      <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-6 max-w-3xl">
        Every metric, project milestone, and feedback piece substantiated here gives you empirical leverage in career mobility, reviews, and executive transitions.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {signals.map((sig) => {
          const Icon = sig.icon;
          return (
            <div
              key={sig.label}
              className={`p-4 rounded-2xl ${sig.bgColor} border ${sig.borderColor} space-y-2 transition-all hover:scale-[1.02] shadow-xs`}
            >
              <div className="flex items-center justify-between">
                <Icon size={18} className={sig.color} />
                <span className="text-2xl font-black text-[var(--text-primary)] font-['Syne',sans-serif]">
                  {sig.count}
                </span>
              </div>
              <div className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                {sig.label}
              </div>
              <div className="flex items-center gap-1 text-[11px]">
                {sig.count > 0 ? (
                  <>
                    <CheckCircle2 size={11} className="text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold capitalize">
                      {sig.status}
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={11} className="text-amber-500" />
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">
                      Pending
                    </span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {summary.recentEntries.length > 0 && (
        <div className="mt-6 pt-5 border-t border-[var(--border)] space-y-2.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Recent Audit Data Logged
          </div>
          <div className="space-y-2">
            {summary.recentEntries.slice(0, 3).map((entry, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)] bg-[var(--bg-elevated)]/60 px-3 py-2 rounded-xl border border-[var(--border)]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0 mt-1.5" />
                <span className="line-clamp-1 flex-1 font-medium">{entry.content}</span>
                <span className="text-[10px] text-[var(--text-muted)] shrink-0 font-mono">
                  {entry.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
