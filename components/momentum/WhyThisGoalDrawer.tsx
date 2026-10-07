"use client";

import React, { useEffect } from "react";
import { WhyThisGoal } from "@/types/momentum";
import { X, Sparkles, ShieldCheck, CheckCircle2, FileText, ArrowRight, Info, Check } from "lucide-react";
import Link from "next/link";

interface WhyThisGoalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  whyThisGoal: WhyThisGoal | null;
  activeGoalTitle?: string;
  onConfirmGoal?: () => void;
  onEditPriorities?: () => void;
}

export default function WhyThisGoalDrawer({
  isOpen,
  onClose,
  whyThisGoal,
  activeGoalTitle,
  onConfirmGoal,
  onEditPriorities,
}: WhyThisGoalDrawerProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !whyThisGoal) return null;

  const experienceFactors = whyThisGoal.experienceFactors || [];
  const priorityAlignment = whyThisGoal.priorityAlignment || [];
  const supportingEvidence = whyThisGoal.supportingEvidence || [];

  return (
    <div
      className="fixed inset-0 z-[150] flex justify-end bg-black/75 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[var(--card)] border-l border-[var(--border)] h-full shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pinned Header */}
        <div className="px-6 py-5 border-b border-[var(--border)] flex items-center justify-between shrink-0 bg-[var(--card)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
              <Sparkles size={18} className="text-purple-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] font-['Syne',sans-serif] leading-tight">
                Why This Goal?
              </h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                AI reasoning synthesis and career capital alignment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 transition-colors"
            aria-label="Close drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0 space-y-4">
          {/* Goal Reference */}
          {activeGoalTitle && (
            <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block mb-0.5">
                Active Career Target
              </span>
              <span className="text-sm font-black text-[var(--text-primary)]">
                {activeGoalTitle}
              </span>
            </div>
          )}

          {/* Core Reasoning Statement */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              AI Reasoning Synthesis
            </h4>
            <p className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed bg-[var(--bg-elevated)] p-4 rounded-xl border border-[var(--border)] font-medium">
              &ldquo;{whyThisGoal.summary}&rdquo;
            </p>
          </div>

          {/* Experience Factors */}
          {experienceFactors.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>Experience Factors from Career Value</span>
              </h4>
              <div className="space-y-2">
                {experienceFactors.map((factor, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-xs text-[var(--text-secondary)] leading-relaxed flex items-start gap-2.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{factor}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Priority Alignment */}
          {priorityAlignment.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-amber-500" />
                  <span>Alignment With Your Stated Priorities</span>
                </h4>
                {onEditPriorities && (
                  <button
                    onClick={() => {
                      onClose();
                      onEditPriorities();
                    }}
                    className="text-[11px] font-bold text-amber-500 hover:underline"
                  >
                    Edit
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {priorityAlignment.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-xs text-[var(--text-secondary)] leading-relaxed flex items-start gap-2.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Supporting Evidence snippets */}
          {supportingEvidence.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                <FileText size={14} className="text-blue-500" />
                <span>Supporting Evidence Captured ({supportingEvidence.length})</span>
              </h4>
              <div className="space-y-2">
                {supportingEvidence.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[var(--text-primary)]">{ev.title}</span>
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono text-[10px]">
                        {ev.category}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {ev.snippet}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Principle Note */}
          <div className="p-3.5 rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-elevated)] text-[11px] text-[var(--text-muted)] leading-relaxed flex items-start gap-2">
            <Info size={14} className="text-purple-500 mt-0.5 shrink-0" />
            <span>
              <strong>Agency Principle:</strong> UpRole exposes reasoning so you can critique and choose your direction. AI never silently establishes your career goals.
            </span>
          </div>
        </div>

        {/* Pinned Footer */}
        <div className="px-6 py-4 border-t border-[var(--border)] flex items-center justify-between gap-3 shrink-0 bg-[var(--card)]">
          {onConfirmGoal ? (
            <button
              onClick={() => {
                onConfirmGoal();
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 transition-all shadow-xs"
            >
              <Check size={14} />
              <span>Confirm & Keep This Goal</span>
            </button>
          ) : (
            <Link
              href="/value"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
            >
              <span>Explore Career Value</span>
              <ArrowRight size={13} />
            </Link>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--card)] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
