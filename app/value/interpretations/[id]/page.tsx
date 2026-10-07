"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { CareerInterpretation, EvidenceFactItem } from "@/types/value";
import {
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Edit3,
  Trash2,
  Layers,
  AlertTriangle,
  FileText,
  Quote,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/ui/toast-1";

export default function InterpretationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const id = params?.id as string;
  const [interpretation, setInterpretation] = useState<CareerInterpretation | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Edit / Reject states
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  const loadData = () => {
    if (!user || !id) return;
    setLoading(true);
    fetch(`/api/value/interpretations/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.interpretation) {
          setInterpretation(data.interpretation);
          setEditTitle(data.interpretation.title);
          setEditDesc(data.interpretation.description);
        }
      })
      .catch((err) => console.error("Error loading interpretation:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [user, id]);

  const handleAccept = async () => {
    if (!interpretation) return;
    setSubmitting(true);
    try {
      await fetch(`/api/value/interpretations/${interpretation.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept" }),
      });
      showToast("Interpretation confirmed as Career Value", "success");
      loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!interpretation || !editTitle.trim() || !editDesc.trim()) return;
    setSubmitting(true);
    try {
      await fetch(`/api/value/interpretations/${interpretation.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "edit",
          title: editTitle,
          description: editDesc,
        }),
      });
      setIsEditing(false);
      showToast("Interpretation successfully updated", "success");
      loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!interpretation) return;
    setSubmitting(true);
    try {
      await fetch(`/api/value/interpretations/${interpretation.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          reason: rejectReason,
        }),
      });
      showToast("Interpretation rejected", "info");
      router.push("/value");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col font-sans">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 w-full flex items-center justify-center">
          <Loader2 className="animate-spin text-amber-500" size={32} />
        </div>
      </div>
    );
  }

  if (!interpretation) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col font-sans">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 w-full text-center space-y-4">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Interpretation not found</h2>
          <Link href="/value" className="inline-block px-4 py-2 rounded-xl bg-amber-500 text-brand-navy font-bold text-xs">
            Return to Career Value
          </Link>
        </div>
      </div>
    );
  }

  const isConfirmed = interpretation.status === "ACCEPTED" || interpretation.status === "EDITED";
  const dimensionName = interpretation.dimension || "capabilities";

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col font-sans">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 w-full flex-1 space-y-6">
        {/* Spec §25: Breadcrumbs (Value > Dimension > Interpretation) */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] flex-wrap">
          <Link href="/value" className="hover:text-[var(--text-primary)] transition-colors">
            Value
          </Link>
          <ChevronRight size={13} />
          <Link href={`/value/${dimensionName}`} className="capitalize hover:text-[var(--text-primary)] transition-colors">
            {dimensionName}
          </Link>
          <ChevronRight size={13} />
          <span className="text-amber-500 font-extrabold truncate max-w-xs">{interpretation.title}</span>
        </nav>

        {/* Level 2 Main Interpretation Hero */}
        <div className="relative rounded-[1.75rem] bg-[var(--card)] border border-[var(--border)] p-6 sm:p-8 overflow-hidden shadow-[0_20px_60px_rgba(16,27,59,0.08)] space-y-4">
          <div className="h-[3px] absolute top-0 inset-x-0 bg-gradient-to-r from-violet-500 via-amber-400 to-emerald-500" aria-hidden="true" />
          
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/30">
                Level 2 · Interpretation
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                {interpretation.type.replace(/_/g, " ")}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-1">
                <ShieldCheck size={14} className="text-emerald-500" />
                {interpretation.confidence} Confidence
              </span>
              {isConfirmed && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  ✓ Confirmed
                </span>
              )}
            </div>
          </div>

          {/* Stale State Banner (Spec §31) */}
          {interpretation.isStale && (
            <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-200">
              <AlertTriangle size={18} className="shrink-0 text-amber-500 mt-0.5" />
              <div>
                <span className="font-bold">This interpretation may need recalculation. </span>
                {interpretation.staleReason || "Your underlying career facts were recently modified or rejected."}
              </div>
            </div>
          )}

          {isEditing ? (
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>
              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-secondary)]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-brand-navy hover:bg-amber-400"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] font-['Syne',sans-serif]">
                {interpretation.title}
              </h1>
              <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed italic">
                &ldquo;{interpretation.description}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Spec §8: Why does UpRole see this? */}
        <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] space-y-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <Sparkles size={15} />
            <span>Why Does UpRole See This as Part of Your Career Value?</span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            This capability was derived by analyzing recurring responsibilities and measurable outcomes across your employment timeline.
            UpRole identified consistent signals across multiple career milestones that corroborate this competency.
          </p>
        </div>

        {/* Spec §9: Supporting Evidence Summary (Grouped Themes) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
              <Layers size={16} className="text-emerald-500" />
              <span>Supporting Evidence Clusters (Level 3)</span>
            </h3>
            <span className="text-xs text-[var(--text-muted)] font-semibold">
              {interpretation.supportingEvidence?.length || 0} clusters
            </span>
          </div>

          <div className="space-y-3">
            {interpretation.supportingEvidence && interpretation.supportingEvidence.length > 0 ? (
              interpretation.supportingEvidence.map((ev, evIdx) => (
                <div
                  key={ev.evidenceId || evIdx}
                  className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-emerald-500/40 hover:shadow-md transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                        E{evIdx + 1}
                      </span>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-[var(--text-primary)]">
                          {ev.statement}
                        </h4>
                        <span className="inline-block text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          {ev.confidence || "Strong evidence"} · {ev.facts?.length || 0} supporting facts
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/value/evidence/${ev.evidenceId}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-elevated)] hover:bg-emerald-500/10 border border-[var(--border)] hover:border-emerald-500/30 text-xs font-bold text-[var(--text-primary)] hover:text-emerald-600 shrink-0 transition-colors"
                    >
                      <span>Inspect Evidence</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>

                  {/* Supporting Facts Snippet */}
                  <div className="pl-9 space-y-2 pt-2 border-t border-[var(--border)]">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Atomic Facts (Level 4)
                    </div>
                    {ev.facts?.map((f, fIdx) => (
                      <div key={f.id || fIdx} className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-[var(--text-secondary)] truncate">
                          • {f.statement}
                        </span>
                        <Link
                          href={`/value/facts/${f.id}`}
                          className="text-[11px] font-semibold text-amber-500 hover:underline shrink-0"
                        >
                          View Fact
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center rounded-2xl bg-[var(--card)] border border-[var(--border)] text-xs text-[var(--text-muted)]">
                No active evidence clusters found.
              </div>
            )}
          </div>
        </div>

        {/* Spec §10: Actions Bar */}
        <div className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-between gap-3 flex-wrap">
          <div className="text-xs font-bold text-[var(--text-muted)]">
            Is this interpretation accurate?
          </div>

          <div className="flex items-center gap-2">
            {!isRejecting && (
              <button
                onClick={() => setIsRejecting(true)}
                className="px-3 py-2 rounded-xl text-xs font-bold text-red-600 border border-red-500/30 hover:bg-red-500/10 cursor-pointer"
              >
                Reject
              </button>
            )}
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-2 rounded-xl text-xs font-bold text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--bg-elevated)] cursor-pointer"
              >
                Edit
              </button>
            )}
            {!isConfirmed && (
              <button
                onClick={handleAccept}
                disabled={submitting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm cursor-pointer"
              >
                Confirm as Value
              </button>
            )}
          </div>
        </div>

        {isRejecting && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-3">
            <div className="text-xs font-bold text-red-600 flex items-center gap-1.5">
              <AlertTriangle size={14} />
              <span>Confirm Rejection of Interpretation</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Rejecting this will remove it from confirmed Career Value. Your underlying resume facts remain 100% intact.
            </p>
            <input
              type="text"
              placeholder="Reason for rejection (e.g. Not representative of career trajectory)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs text-[var(--text-primary)]"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsRejecting(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-secondary)]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={submitting}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-red-600 text-white"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
