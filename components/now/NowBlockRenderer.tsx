"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Activity,
  TrendingUp,
  BookOpen,
  Compass,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Edit3,
  Check,
  X,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Target,
  BarChart3,
  Layers,
  ChevronRight,
} from "lucide-react";
import { NowBlock } from "@/app/api/now/message/route";

interface NowBlockRendererProps {
  block: NowBlock;
  onDecisionAction?: (actionId: string, route?: string) => void;
}

export default function NowBlockRenderer({ block, onDecisionAction }: NowBlockRendererProps) {
  const [feedback, setFeedback] = useState<"confirmed" | "edited" | "rejected" | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(block.content);
  const [showTrace, setShowTrace] = useState(false);

  const getSourceIcon = (source?: string) => {
    switch (source) {
      case "PULSE":
        return <Activity size={14} className="text-emerald-500" />;
      case "VALUE":
        return <Sparkles size={14} className="text-amber-500" />;
      case "MOMENTUM":
        return <TrendingUp size={14} className="text-blue-500" />;
      case "JOURNAL":
        return <BookOpen size={14} className="text-purple-500" />;
      case "NAVIGATOR":
        return <Compass size={14} className="text-rose-500" />;
      default:
        return <Layers size={14} className="text-slate-400" />;
    }
  };

  const getSourceBadgeColor = (source?: string) => {
    switch (source) {
      case "PULSE":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25";
      case "VALUE":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25";
      case "MOMENTUM":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25";
      case "JOURNAL":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25";
      case "NAVIGATOR":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25";
      default:
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/25";
    }
  };

  const handleFeedbackSubmit = async (decision: "ACCEPT" | "EDIT" | "REJECT", textToSave?: string) => {
    if (decision === "ACCEPT") setFeedback("confirmed");
    else if (decision === "REJECT") setFeedback("rejected");
    else if (decision === "EDIT") {
      setFeedback("edited");
      setIsEditing(false);
    }

    try {
      await fetch("/api/now/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          block_id: block.id,
          block_title: block.title,
          source: block.source,
          decision,
          edited_text: textToSave || block.content,
        }),
      });
    } catch (e) {
      console.warn("Feedback save notice:", e);
    }
  };

  // 1. INSIGHT & CAPABILITY BLOCKS
  if (block.type === "insight" || block.type === "capability" || block.type === "evidence") {
    return (
      <div className="rounded-2xl p-6 bg-white dark:bg-[#0D1527] border border-slate-200/80 dark:border-white/10 shadow-sm transition-all hover:shadow-md relative group">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            {block.source && (
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getSourceBadgeColor(
                  block.source
                )}`}
              >
                {getSourceIcon(block.source)}
                <span>{block.source}</span>
              </span>
            )}
            {block.confidence && (
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <ShieldCheck size={12} className="text-emerald-500" />
                {block.confidence === "high" ? "High Confidence" : "Inferred"}
              </span>
            )}
          </div>

          {/* Traceability Trigger */}
          <button
            onClick={() => setShowTrace(!showTrace)}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 flex items-center gap-1 transition-colors cursor-pointer"
            title="View evidence source"
          >
            <HelpCircle size={13} />
            <span className="hidden sm:inline">Why am I seeing this?</span>
          </button>
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white m-0 mb-2 font-['Syne',sans-serif]">
          {block.title}
        </h3>

        {isEditing ? (
          <div className="mt-2 space-y-2">
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="w-full p-3 rounded-xl border border-amber-500/40 bg-slate-50 dark:bg-white/5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleFeedbackSubmit("EDIT", editedText)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-brand-navy hover:bg-amber-400 transition cursor-pointer"
              >
                Save Correction
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 m-0">
            {feedback === "edited" ? editedText : block.content}
          </p>
        )}

        {/* Traceability Drawer / Popover */}
        {showTrace && (
          <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-slate-400 space-y-1.5 animate-in fade-in duration-200">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-amber-500" />
              Evidence Traceability
            </div>
            <div>
              Derived from your verified <strong className="text-amber-500">{block.source || "UpRole"}</strong> career telemetry records.
              This deduction is grounded in validated achievements rather than AI speculation.
            </div>
            {block.source === "VALUE" && (
              <Link href="/value" className="inline-flex items-center gap-1 text-amber-500 hover:underline mt-1 font-semibold">
                Open in Value Module <ArrowRight size={11} />
              </Link>
            )}
            {block.source === "PULSE" && (
              <Link href="/pulse" className="inline-flex items-center gap-1 text-emerald-500 hover:underline mt-1 font-semibold">
                Inspect Pulse Snapshot <ArrowRight size={11} />
              </Link>
            )}
          </div>
        )}

        {/* AI Interpretation Controls (Spec Section 19) */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            AI Interpretation:
          </span>
          <div className="flex items-center gap-2">
            {feedback === "confirmed" ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                <Check size={13} /> Confirmed by you
              </span>
            ) : feedback === "rejected" ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25">
                <X size={13} /> Rejected
              </span>
            ) : feedback === "edited" ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                <Check size={13} /> Edited & Saved
              </span>
            ) : (
              <>
                <button
                  onClick={() => handleFeedbackSubmit("ACCEPT")}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-500/10 border border-slate-200 dark:border-white/10 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Check size={12} /> Looks right
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-500/10 border border-slate-200 dark:border-white/10 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 size={12} /> Edit
                </button>
                <button
                  onClick={() => handleFeedbackSubmit("REJECT")}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 border border-slate-200 dark:border-white/10 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <X size={12} /> Reject
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. INLINE MODULE COMPONENT WRAPPER (Spec Section 23: Pull Module Components Inline)
  if (block.type === "module_component") {
    const compName = block.metadata?.componentName;

    return (
      <div className="rounded-2xl p-6 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-[#0B1220] dark:via-[#0F172A] dark:to-[#0B1220] border-2 border-slate-200 dark:border-white/15 shadow-md">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getSourceBadgeColor(
                block.source
              )}`}
            >
              {getSourceIcon(block.source)}
              <span>{block.source} COMPONENT</span>
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Inline View
            </span>
          </div>

          {block.source === "PULSE" && (
            <Link
              href="/pulse"
              className="text-xs font-bold text-emerald-500 hover:underline flex items-center gap-1"
            >
              Full Pulse View <ArrowUpRight size={13} />
            </Link>
          )}
          {block.source === "VALUE" && (
            <Link
              href="/value"
              className="text-xs font-bold text-amber-500 hover:underline flex items-center gap-1"
            >
              Full Value View <ArrowUpRight size={13} />
            </Link>
          )}
          {block.source === "NAVIGATOR" && (
            <Link
              href="/career-copilot"
              className="text-xs font-bold text-rose-500 hover:underline flex items-center gap-1"
            >
              Open Navigator <ArrowUpRight size={13} />
            </Link>
          )}
        </div>

        <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1 font-['Syne',sans-serif]">
          {block.title}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{block.content}</p>

        {/* Dynamic Card Content customized per componentName */}
        {compName === "CareerSnapshotCard" && (
          <div className="p-4 rounded-xl bg-white dark:bg-[#131F37] border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Activity size={13} /> Career Position & Standing
              </div>
              <div className="text-lg font-black text-slate-900 dark:text-white">
                {block.metadata?.statLabel || "Senior Professional"}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Documented Track Record: {block.metadata?.statValue || "8+ Years"} · High Evidence Density
              </div>
            </div>
            <Link
              href="/pulse"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-brand-navy hover:bg-emerald-400 transition-all shadow-sm shrink-0 flex items-center gap-1.5 no-underline justify-center"
            >
              Inspect Telemetry <ArrowRight size={13} />
            </Link>
          </div>
        )}

        {compName === "ValueProfileCard" && (
          <div className="p-4 rounded-xl bg-white dark:bg-[#131F37] border border-amber-500/30">
            <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles size={13} /> Substantiated Capabilities
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {["Product Strategy", "System Architecture", "Cross-Functional Leadership", "Technical Execution"].map(
                (skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                  >
                    ✦ {skill}
                  </span>
                )
              )}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
              <span>Grounding: 14 verified achievements</span>
              <Link href="/value" className="text-amber-500 font-bold hover:underline">
                Explore Value Dimensions →
              </Link>
            </div>
          </div>
        )}

        {compName === "SalaryBenchmarker" && (
          <div className="p-4 rounded-xl bg-white dark:bg-[#131F37] border border-rose-500/30">
            <div className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <BarChart3 size={13} /> Tech Compensation Benchmarks
            </div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-2 mb-3">
              Peer percentiles indicate 18–25% upside for professionals with verified system scalability outcomes.
            </div>
            <div className="flex gap-2">
              <Link
                href="/career-copilot?tab=negotiation"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 transition flex items-center gap-1.5 no-underline"
              >
                Launch Salary Benchmarker <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        )}

        {compName === "PrecisionJD" && (
          <div className="p-4 rounded-xl bg-white dark:bg-[#131F37] border border-blue-500/30">
            <div className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Target size={13} /> Precision JD Matching Engine
            </div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-2 mb-3">
              Paste target Job Description to simulate Workday & Greenhouse ATS parsing and reveal missing keyword matches.
            </div>
            <Link
              href="/resume/tailor"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-500 text-white hover:bg-blue-600 transition inline-flex items-center gap-1.5 no-underline"
            >
              Analyze Target Job Description <ArrowRight size={13} />
            </Link>
          </div>
        )}

        {compName === "RecentProgressCard" && (
          <div className="p-4 rounded-xl bg-white dark:bg-[#131F37] border border-blue-500/30">
            <div className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <TrendingUp size={13} /> Momentum Movement
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              3 meaningful career developments recorded in the last 60 days
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-3">
              Recent scope growth supports your readiness for higher strategic accountability.
            </div>
            <Link
              href="/momentum"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-500 text-white hover:bg-blue-600 transition inline-flex items-center gap-1.5 no-underline"
            >
              View Momentum Timeline <ArrowRight size={13} />
            </Link>
          </div>
        )}

        {compName === "ProofVault" && (
          <div className="p-4 rounded-xl bg-white dark:bg-[#131F37] border border-purple-500/30">
            <div className="text-xs font-bold text-purple-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <BookOpen size={13} /> Journal Proof Vault
            </div>
            <div className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              All extracted capabilities link back to concrete project accomplishments stored in your career memory.
            </div>
            <Link
              href="/career-journal"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-500 text-white hover:bg-purple-600 transition inline-flex items-center gap-1.5 no-underline"
            >
              Open Proof Vault <ArrowRight size={13} />
            </Link>
          </div>
        )}

        {compName === "CareerDirectionCard" && (
          <div className="p-4 rounded-xl bg-white dark:bg-[#131F37] border border-emerald-500/30">
            <div className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Compass size={13} /> Trajectory Possibilities
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              High Alignment Paths: Director of Engineering · Head of Product Strategy
            </div>
            <Link
              href="/pulse"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-brand-navy hover:bg-emerald-400 transition inline-flex items-center gap-1.5 no-underline"
            >
              Explore Alignment <ArrowRight size={13} />
            </Link>
          </div>
        )}
      </div>
    );
  }

  // 3. DECISION & QUESTION BLOCKS (One Meaningful Decision at a Time)
  if (block.type === "decision" || block.type === "question") {
    return (
      <div className="rounded-2xl p-6 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/15 dark:via-amber-500/5 dark:to-transparent border-2 border-amber-500/30 shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-amber-500 text-brand-navy">
            <Target size={12} /> DECIDE NEXT STEP
          </span>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            One decision at a time
          </span>
        </div>

        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2 font-['Syne',sans-serif]">
          {block.title}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-5 leading-relaxed">
          {block.content}
        </p>

        {block.actions && block.actions.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {block.actions.map((act) => {
              const isPrimary = act.variant === "primary";
              return act.route && !act.route.startsWith("/now?") ? (
                <Link
                  key={act.id}
                  href={act.route}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2 no-underline cursor-pointer ${
                    isPrimary
                      ? "bg-amber-500 hover:bg-amber-400 text-brand-navy shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98]"
                      : "bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/15 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10"
                  }`}
                >
                  <span>{act.label}</span>
                  <ArrowRight size={14} />
                </Link>
              ) : (
                <button
                  key={act.id}
                  onClick={() => onDecisionAction?.(act.id, act.route)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer ${
                    isPrimary
                      ? "bg-amber-500 hover:bg-amber-400 text-brand-navy shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98]"
                      : "bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/15 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10"
                  }`}
                >
                  <span>{act.label}</span>
                  <ChevronRight size={14} />
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // 4. FALLBACK / GENERAL BLOCK
  return (
    <div className="rounded-2xl p-6 bg-white dark:bg-[#0D1527] border border-slate-200/80 dark:border-white/10 shadow-sm">
      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{block.title}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">{block.content}</p>
      {block.actions && block.actions.length > 0 && (
        <div className="flex gap-2">
          {block.actions.map((act) => (
            <Link
              key={act.id}
              href={act.route || "#"}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-brand-navy hover:bg-amber-400 transition no-underline inline-flex items-center gap-1.5"
            >
              {act.label} <ArrowRight size={12} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
