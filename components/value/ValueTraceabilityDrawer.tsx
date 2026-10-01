"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Edit3,
  Trash2,
  Check,
  ArrowRight,
  Layers,
  Sparkles,
  Quote,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { CareerInterpretation } from "@/types/value";

interface ValueTraceabilityDrawerProps {
  interpretation: CareerInterpretation | null;
  isOpen: boolean;
  onClose: () => void;
  onAccept: (interp: CareerInterpretation) => Promise<void>;
  onEdit: (interp: CareerInterpretation, newTitle: string, newDesc: string, userNote?: string) => Promise<void>;
  onReject: (interp: CareerInterpretation, reason?: string) => Promise<void>;
  onViewAllEvidence?: () => void;
}

export default function ValueTraceabilityDrawer({
  interpretation,
  isOpen,
  onClose,
  onAccept,
  onEdit,
  onReject,
  onViewAllEvidence,
}: ValueTraceabilityDrawerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editUserNote, setEditUserNote] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (interpretation) {
      setEditTitle(interpretation.title);
      setEditDesc(interpretation.description);
      setEditUserNote(interpretation.userNote || "");
      setIsEditing(false);
      setIsRejecting(false);
      setRejectReason("");
    }
  }, [interpretation]);

  // Lock body scroll when drawer open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen || !interpretation) return null;

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editDesc.trim()) return;
    setSubmitting(true);
    try {
      await onEdit(interpretation, editTitle, editDesc, editUserNote);
      setIsEditing(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmReject = async () => {
    setSubmitting(true);
    try {
      await onReject(interpretation, rejectReason);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const isConfirmed = interpretation.status === "ACCEPTED" || interpretation.status === "EDITED";

  const confidenceColor =
    interpretation.confidence === "HIGH"
      ? "text-emerald-600 dark:text-emerald-400"
      : interpretation.confidence === "MODERATE"
      ? "text-amber-600 dark:text-amber-400"
      : "text-[var(--text-muted)]";

  return (
    <>
      {/* Full-screen overlay */}
      <div
        className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel — slides in from right, full height, z-index above navbar */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Why We Say This — Traceability"
        className="fixed top-0 right-0 bottom-0 z-[1001] w-full max-w-xl lg:max-w-2xl bg-[var(--card)] border-l border-[var(--border)] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
      >
        {/* ── STICKY HEADER ────────────────────────────────────── */}
        <div className="shrink-0 px-6 py-5 border-b border-[var(--border)] bg-[var(--card)] flex items-start justify-between gap-4">
          <div className="space-y-1 min-w-0">
            {/* Type + confidence pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                {interpretation.type.replace("_", " ")}
              </span>
              <span className={`flex items-center gap-1 text-[11px] font-semibold ${confidenceColor}`}>
                <ShieldCheck size={13} />
                {interpretation.confidence} Confidence
              </span>
              {isConfirmed && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  ✓ Accepted
                </span>
              )}
            </div>

            <h2 className="text-xl font-black text-[var(--text-primary)] font-['Syne',sans-serif] leading-tight">
              Why We Say This
            </h2>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              5-level traceability: Career Value → Interpretation → Evidence → Facts → Source
            </p>
          </div>

          <button
            onClick={onClose}
            className="shrink-0 p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
            aria-label="Close drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── SCROLLABLE BODY ───────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="p-6 space-y-5">

            {/* LEVEL 1 — Career Value Component */}
            <div className="p-4 rounded-2xl bg-amber-500/8 border border-amber-500/25 space-y-1.5">
              <div className="flex items-center gap-2 text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                Level 1 · Career Value Component
              </div>
              <p className="text-lg font-black text-[var(--text-primary)] font-['Syne',sans-serif] leading-snug">
                {interpretation.title}
              </p>
            </div>

            {/* LEVEL 2 — AI Interpretation */}
            <div className="rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] overflow-hidden">
              <div className="px-4 pt-4 pb-3 flex items-center justify-between gap-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2 text-[10px] font-black text-violet-500 uppercase tracking-widest">
                  <Sparkles size={13} />
                  Level 2 · Interpretation Statement
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    isConfirmed
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                      : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                  }`}
                >
                  {interpretation.status}
                </span>
              </div>

              <div className="p-4">
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-bold text-[var(--text-muted)] block mb-1 uppercase tracking-wider">
                        Interpretation Title
                      </label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[var(--text-muted)] block mb-1 uppercase tracking-wider">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-amber-500 resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[var(--text-muted)] block mb-1 uppercase tracking-wider">
                        Personal Note (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Aligns with my senior leadership goals"
                        value={editUserNote}
                        onChange={(e) => setEditUserNote(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="flex items-center gap-2 justify-end pt-1">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--card)] transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        disabled={submitting || !editTitle.trim() || !editDesc.trim()}
                        className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-brand-navy hover:bg-amber-400 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {submitting ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <Quote size={18} className="text-amber-500/60 shrink-0 mt-0.5" />
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed italic">
                        {interpretation.description}
                      </p>
                    </div>
                    {interpretation.userNote && (
                      <div className="mt-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400">
                        <span className="font-bold">Your note: </span>
                        {interpretation.userNote}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* LEVELS 3 & 4 — Supporting Evidence & Facts */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                  <Layers size={13} />
                  Level 3 & 4 · Evidence & Facts
                </div>
                <span className="text-[11px] text-[var(--text-muted)] font-medium">
                  {interpretation.supportingEvidence?.length || 0} evidence cluster{interpretation.supportingEvidence?.length !== 1 ? "s" : ""}
                </span>
              </div>

              {interpretation.supportingEvidence && interpretation.supportingEvidence.length > 0 ? (
                interpretation.supportingEvidence.map((evItem, evIdx) => (
                  <div
                    key={evItem.evidenceId || evIdx}
                    className="rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] overflow-hidden"
                  >
                    {/* Evidence (Level 3) */}
                    <div className="px-4 py-3 flex items-start gap-3 border-b border-[var(--border)]">
                      <span className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-black shrink-0">
                        E{evIdx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-0.5">
                          Evidence
                        </div>
                        <p className="text-xs font-semibold text-[var(--text-primary)] leading-snug">
                          {evItem.statement}
                        </p>
                      </div>
                    </div>

                    {/* Facts (Level 4) */}
                    <div className="px-4 py-3 space-y-2">
                      <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">
                        Grounded in Facts (Level 4)
                      </div>
                      {evItem.facts && evItem.facts.length > 0 ? (
                        evItem.facts.map((fact, fIdx) => (
                          <div
                            key={fact.id || fIdx}
                            className="p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] space-y-1.5"
                          >
                            <p className="text-xs text-[var(--text-primary)] font-medium leading-relaxed">
                              {fact.statement}
                            </p>
                            {/* Level 5: Source */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--bg-elevated)] border border-[var(--border)] text-[10px] font-bold text-[var(--text-secondary)]">
                                <FileText size={10} />
                                {fact.sourceType}
                              </span>
                              <span className="text-[10px] text-[var(--text-muted)]">{fact.sourceTitle}</span>
                              {fact.sourceDate && (
                                <span className="text-[10px] text-[var(--text-muted)]">· {fact.sourceDate}</span>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-[var(--text-muted)] italic">
                          Facts linked from active resume.
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-xs text-[var(--text-muted)] italic text-center">
                  Supporting evidence synthesized from verified resume milestones.
                </div>
              )}

              {/* View all evidence link (Spec §7.1) */}
              {onViewAllEvidence && (
                <button
                  onClick={() => { onClose(); onViewAllEvidence(); }}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[var(--bg-elevated)] hover:bg-amber-500/8 border border-[var(--border)] hover:border-amber-500/40 text-[var(--text-secondary)] hover:text-amber-500 transition-all flex items-center justify-center gap-1.5 cursor-pointer group"
                >
                  <span>View all supporting evidence & facts</span>
                  <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}
            </div>

            {/* Rejection inline panel */}
            {isRejecting && (
              <div className="p-4 rounded-2xl bg-red-500/8 border border-red-500/25 space-y-3">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertTriangle size={14} strokeWidth={2.5} />
                  <span className="text-xs font-bold">Reject this AI Interpretation?</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Rejecting removes it from confirmed Career Value. Your underlying resume facts remain 100% intact and can support future re-derivation.
                </p>
                <input
                  type="text"
                  placeholder="Optional reason (e.g. Not representative of my goals)"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-red-500"
                />
                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() => setIsRejecting(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--card)] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmReject}
                    disabled={submitting}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold bg-red-500 text-white hover:bg-red-600 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? "Rejecting..." : "Confirm Rejection"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── STICKY FOOTER ─────────────────────────────────────── */}
        <div className="shrink-0 px-6 py-4 border-t border-[var(--border)] bg-[var(--card)]">
          {/* Two rows on mobile, one row on desktop */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Left — Destructive & edit actions */}
            <div className="flex items-center gap-2">
              {!isRejecting && (
                <button
                  onClick={() => { setIsEditing(false); setIsRejecting(true); }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 border border-red-500/25 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                  Reject
                </button>
              )}

              {!isEditing && !isRejecting && (
                <button
                  onClick={() => { setIsRejecting(false); setIsEditing(true); }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  <Edit3 size={14} />
                  Edit Interpretation
                </button>
              )}
            </div>

            {/* Right — Primary + close */}
            <div className="flex items-center gap-2 sm:justify-end">
              {!isConfirmed && !isRejecting && (
                <button
                  onClick={async () => {
                    setSubmitting(true);
                    try {
                      await onAccept(interpretation);
                      onClose();
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-brand-navy shadow-sm shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Check size={14} strokeWidth={3} />
                  {submitting ? "Accepting..." : "Accept as Value"}
                </button>
              )}

              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card)] transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
