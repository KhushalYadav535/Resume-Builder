"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
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
  ExternalLink,
} from "lucide-react";
import { CareerInterpretation, CapabilityClassification } from "@/types/value";

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
  const closeBtnRef = useRef<HTMLButtonElement>(null);

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

  // Lock body scroll + Escape to close + autofocus close (a11y)
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });
  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "";
      return () => { document.body.style.overflow = ""; };
    }
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
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

  const classification: CapabilityClassification =
    interpretation.classification ||
    (isConfirmed ? "DEMONSTRATED" : "SUGGESTED");

  return (
    <>
      {/* Full-screen overlay — deeper cinematic dim */}
      <div
        className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel — slides in from right, full height, z-index above navbar */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Why We Say This — Traceability"
        className="fixed top-0 right-0 bottom-0 z-[1001] w-full max-w-xl lg:max-w-2xl bg-[var(--card)] border-l border-[var(--border-strong)] shadow-[0_30px_120px_rgba(0,0,0,0.5)] flex flex-col animate-in slide-in-from-right duration-300 overflow-hidden sm:rounded-l-[1.75rem]"
      >
        <div className="h-[3px] w-full bg-gradient-to-r from-amber-500 via-violet-500/60 to-emerald-500/60 shrink-0" aria-hidden="true" />

        {/* ── STICKY HEADER ────────────────────────────────────── */}
        <div className="shrink-0 px-6 py-5 border-b border-[var(--border)] bg-[var(--card)]/95 backdrop-blur flex items-start justify-between gap-4 relative overflow-hidden">
          <div className="absolute -top-20 right-6 w-64 h-64 bg-amber-500/[0.12] rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
          <div className="absolute -bottom-24 left-10 w-56 h-56 bg-violet-500/[0.08] rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-amber-500 via-violet-500/50 to-emerald-500/50" aria-hidden="true" />
          <div className="relative space-y-1 min-w-0">
            {/* Breadcrumb trail (Spec §25) */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)] flex-wrap">
              <Link href="/value" onClick={onClose} className="hover:text-[var(--text-primary)] transition-colors">
                Value
              </Link>
              <span className="opacity-50" aria-hidden="true">/</span>
              <span>{interpretation.type.replace("_", " ").toLowerCase()}</span>
              <span className="opacity-50" aria-hidden="true">/</span>
              <span aria-current="page" className="text-amber-600 dark:text-amber-400 truncate max-w-[160px] sm:max-w-[240px]">
                {interpretation.title}
              </span>
            </nav>
            {/* Type + confidence + 3-tier pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                {interpretation.type.replace("_", " ")}
              </span>

              {classification === "DEMONSTRATED" && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  ● Demonstrated
                </span>
              )}
              {classification === "EMERGING" && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  ◐ Emerging
                </span>
              )}
              {classification === "SUGGESTED" && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                  ○ Suggested
                </span>
              )}

              <span className={`flex items-center gap-1 text-[11px] font-semibold ${confidenceColor}`}>
                <ShieldCheck size={13} />
                {interpretation.confidence} Confidence
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <h2 className="text-xl font-black text-[var(--text-primary)] font-['Syne',sans-serif] leading-tight">
                Why We Say This
              </h2>
              <Link
                href={`/value/interpretations/${interpretation.id}`}
                onClick={onClose}
                className="text-xs font-bold text-amber-500 hover:underline inline-flex items-center gap-1 shrink-0"
              >
                <span>Full Page View</span>
                <ExternalLink size={12} />
              </Link>
            </div>

            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              5-level traceability: Career Value → Interpretation → Evidence → Facts → Source
            </p>

            {/* Level rail — glowing connected journey */}
            <ol className="flex items-center gap-1 pt-2" aria-label="Traceability levels">
              {["Value", "Interp.", "Evidence", "Facts", "Source"].map((lvl, i) => (
                <React.Fragment key={lvl}>
                  <li className="flex items-center gap-1.5">
                    <span className="relative flex w-4 h-4 shrink-0">
                      {i === 0 && (
                        <span className="absolute inline-flex w-full h-full rounded-full bg-amber-500 opacity-60 animate-ping" aria-hidden="true" />
                      )}
                      <span className={`relative inline-flex w-4 h-4 rounded-full items-center justify-center text-[8px] font-black tabular-nums ${i === 0 ? "bg-amber-500 text-brand-navy shadow-[0_0_12px_rgba(245,158,11,0.7)]" : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"}`}>
                        {i + 1}
                      </span>
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)] hidden sm:inline">{lvl}</span>
                  </li>
                  {i < 4 && <span className="flex-1 min-w-2.5 h-px bg-gradient-to-r from-amber-500/70 via-amber-500/30 to-emerald-500/40 shrink-0" aria-hidden="true" />}
                </React.Fragment>
              ))}
            </ol>
          </div>

          <button
            ref={closeBtnRef}
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

            {/* Stale Warning (Spec §31) */}
            {interpretation.isStale && (
              <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200">
                <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Interpretation Stale: </span>
                  {interpretation.staleReason || "Underlying facts were recently edited or rejected. Recalculation advised."}
                </div>
              </div>
            )}

            {/* LEVEL 1 — Career Value Component */}
            <div className="value-rise relative p-5 sm:p-6 rounded-[1.6rem] bg-gradient-to-br from-amber-500/[0.12] via-amber-500/[0.04] to-transparent border border-amber-500/25 space-y-1.5 overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-amber-600" aria-hidden="true" />
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-500/[0.12] rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
              <span className="value-ghost absolute right-4 top-1/2 -translate-y-1/2 text-[2.6rem] leading-none" aria-hidden="true">01</span>
              <div className="relative flex items-center gap-2 text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-[0.18em]">
                <span className="relative flex w-2 h-2 shrink-0">
                  <span className="absolute inline-flex w-full h-full rounded-full bg-amber-500 opacity-60 animate-ping" aria-hidden="true" />
                  <span className="relative inline-flex w-2 h-2 rounded-full bg-amber-500" />
                </span>
                Level 1 · Career Value Component
              </div>
              <p className="relative text-xl sm:text-2xl font-black tracking-tight text-[var(--text-primary)] font-['Syne',sans-serif] leading-snug">
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
                <div className="relative space-y-3 before:absolute before:left-[15px] before:top-3 before:bottom-3 before:w-px before:bg-gradient-to-b before:from-emerald-500/50 before:via-amber-500/40 before:to-transparent">
                {interpretation.supportingEvidence.map((evItem, evIdx) => (
                  <div
                    key={evItem.evidenceId || evIdx}
                    style={{ animationDelay: `${0.1 + Math.min(evIdx, 5) * 0.08}s` }}
                    className="value-rise relative ml-0 pl-9 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] overflow-hidden hover:border-emerald-500/40 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(16,185,129,0.14)] transition-all duration-300"
                  >
                    <span className="absolute left-[9px] top-4 w-[13px] h-[13px] rounded-full bg-[var(--card)] border-2 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" aria-hidden="true" />
                    
                    {/* Evidence (Level 3) with deep link */}
                    <div className="px-4 py-3 flex items-start justify-between gap-3 border-b border-[var(--border)]">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-black shrink-0">
                          E{evIdx + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-0.5">
                            Evidence (Level 3)
                          </div>
                          <p className="text-xs font-semibold text-[var(--text-primary)] leading-snug">
                            {evItem.statement}
                          </p>
                        </div>
                      </div>

                      <Link
                        href={`/value/evidence/${evItem.evidenceId}`}
                        onClick={onClose}
                        className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline shrink-0 flex items-center gap-1"
                      >
                        <span>Inspect</span>
                        <ArrowRight size={11} />
                      </Link>
                    </div>

                    {/* Facts (Level 4) with deep links */}
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
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs text-[var(--text-primary)] font-medium leading-relaxed">
                                {fact.statement}
                              </p>
                              <Link
                                href={`/value/facts/${fact.id}`}
                                onClick={onClose}
                                className="text-[10px] font-bold text-amber-500 hover:underline shrink-0"
                              >
                                Detail
                              </Link>
                            </div>
                            {/* Level 5: Source */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link
                                href={`/value/sources/${fact.sourceId || "default"}`}
                                onClick={onClose}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--bg-elevated)] border border-[var(--border)] text-[10px] font-bold text-[var(--text-secondary)] hover:text-amber-500"
                              >
                                <FileText size={10} />
                                {fact.sourceType}
                              </Link>
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
                ))}
                </div>
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
        <div className="shrink-0 px-6 py-4 border-t border-[var(--border)] bg-[var(--card)]/95 backdrop-blur relative overflow-hidden">
          <div className="absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent pointer-events-none" aria-hidden="true" />
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
                  className="group relative overflow-hidden inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-brand-navy bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-[0_8px_24px_rgba(16,185,129,0.4)] hover:-translate-y-px active:translate-y-0 transition-all cursor-pointer disabled:opacity-50"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" aria-hidden="true" />
                  <CheckCircle2 size={14} className="relative" />
                  <span className="relative">Accept Interpretation</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
