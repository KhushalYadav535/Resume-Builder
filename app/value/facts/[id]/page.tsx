"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { CareerFact } from "@/types/value";
import {
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Edit3,
  Trash2,
  Calendar,
  Layers,
  Compass,
  AlertTriangle,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/ui/toast-1";

export default function FactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const id = params?.id as string;
  const [fact, setFact] = useState<CareerFact | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Edit / Reject states
  const [isEditing, setIsEditing] = useState(false);
  const [editStatement, setEditStatement] = useState("");
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
    fetch(`/api/value/facts/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.fact) {
          setFact(data.fact);
          setEditStatement(data.fact.statement);
        }
      })
      .catch((err) => console.error("Error loading fact:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [user, id]);

  const handleConfirmFact = async () => {
    if (!fact) return;
    setSubmitting(true);
    try {
      await fetch(`/api/value/facts/${fact.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm", statement: fact.statement }),
      });
      showToast("Fact confirmed successfully", "success");
      loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!fact || !editStatement.trim()) return;
    setSubmitting(true);
    try {
      await fetch(`/api/value/facts/${fact.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statement: editStatement }),
      });
      setIsEditing(false);
      showToast("Fact updated. Dependent interpretations flagged for review.", "success");
      loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!fact) return;
    setSubmitting(true);
    try {
      await fetch(`/api/value/facts/${fact.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", rejectionReason: rejectReason }),
      });
      showToast("Fact rejected. Removed from active value derivation.", "info");
      router.push("/value?tab=facts");
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

  if (!fact) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col font-sans">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 w-full text-center space-y-4">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Fact not found</h2>
          <Link href="/value?tab=facts" className="inline-block px-4 py-2 rounded-xl bg-amber-500 text-brand-navy font-bold text-xs">
            Return to Career Facts
          </Link>
        </div>
      </div>
    );
  }

  const isConfirmed = fact.status === "CONFIRMED" || fact.status === "EDITED";

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col font-sans">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 w-full flex-1 space-y-6">
        {/* Spec §25: Breadcrumbs (Value > Facts > Fact) */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] flex-wrap">
          <Link href="/value" className="hover:text-[var(--text-primary)] transition-colors">
            Value
          </Link>
          <ChevronRight size={13} />
          <Link href="/value?tab=facts" className="hover:text-[var(--text-primary)] transition-colors">
            Facts
          </Link>
          <ChevronRight size={13} />
          <span className="text-amber-500 font-extrabold truncate max-w-xs">{fact.statement}</span>
        </nav>

        {/* Spec §16: What UpRole Knows vs What UpRole Thinks */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 text-xs text-amber-700 dark:text-amber-300">
          <FileText size={18} className="shrink-0 text-amber-500" />
          <div>
            <span className="font-black uppercase tracking-wider">What UpRole Knows: </span>
            This screen contains atomic, verifiable career information extracted from user documents and confirmed by you.
          </div>
        </div>

        {/* Spec §17: Main Fact Statement Card */}
        <div className="relative rounded-[1.75rem] bg-[var(--card)] border border-[var(--border)] p-6 sm:p-8 overflow-hidden shadow-[0_20px_60px_rgba(16,27,59,0.08)] space-y-4">
          <div className="h-[3px] absolute top-0 inset-x-0 bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-500" aria-hidden="true" />
          
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              Level 4 · Career Fact
            </span>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                isConfirmed
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                  : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
              }`}
            >
              <CheckCircle2 size={13} />
              <span>{fact.status}</span>
            </span>
          </div>

          {isEditing ? (
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-[var(--text-muted)] block">Edit Statement</label>
              <textarea
                rows={3}
                value={editStatement}
                onChange={(e) => setEditStatement(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-sm font-semibold text-[var(--text-primary)] focus:outline-none focus:border-amber-500 resize-none"
              />
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
                  Save Fact
                </button>
              </div>
            </div>
          ) : (
            <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] font-['Syne',sans-serif] leading-snug">
              &ldquo;{fact.statement}&rdquo;
            </h1>
          )}
        </div>

        {/* Spec §18: Fact Metadata Table */}
        <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">
            Provenance & Fact Metadata
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-1">
              <span className="text-[var(--text-muted)] block font-semibold">Origin Document / Source</span>
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-[var(--text-primary)]">{fact.sourceType} · {fact.sourceTitle}</span>
                <Link
                  href={`/value/sources/${fact.sourceId || "default"}`}
                  className="text-amber-500 hover:underline flex items-center gap-1 font-bold"
                >
                  <span>Source Detail</span>
                  <ExternalLink size={12} />
                </Link>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-1">
              <span className="text-[var(--text-muted)] block font-semibold">Source Section / Context</span>
              <span className="font-bold text-[var(--text-primary)]">
                {fact.extractedFromContext || `Section: ${fact.category}`}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-1">
              <span className="text-[var(--text-muted)] block font-semibold">Fact Category</span>
              <span className="font-bold text-[var(--text-primary)]">{fact.category}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-1">
              <span className="text-[var(--text-muted)] block font-semibold">Timeline / Date Reference</span>
              <span className="font-bold text-[var(--text-primary)]">{fact.sourceDate || "Tenure Period"}</span>
            </div>
          </div>
        </div>

        {/* Spec §19: Fact Relationships (This fact contributes to...) */}
        <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] space-y-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <Compass size={15} />
            <span>This Fact Contributes To (Reverse Hierarchy)</span>
          </div>

          {fact.contributesTo && fact.contributesTo.length > 0 ? (
            <div className="space-y-2.5">
              {fact.contributesTo.map((rel, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mr-2">
                      {rel.dimension}
                    </span>
                    <span className="font-bold text-[var(--text-primary)]">{rel.interpretationTitle}</span>
                    <span className="text-[var(--text-muted)] ml-2">via &ldquo;{rel.evidenceTitle}&rdquo;</span>
                  </div>

                  <Link
                    href={`/value/interpretations/${rel.interpretationId}`}
                    className="inline-flex items-center gap-1 font-bold text-amber-500 hover:text-amber-400 shrink-0"
                  >
                    <span>View Target</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[var(--text-muted)] italic">
              Contributes directly to baseline career profile metrics and verified background record.
            </p>
          )}
        </div>

        {/* Spec §20 & §21: Actions (Confirm, Edit, Reject) */}
        <div className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-between gap-3 flex-wrap">
          <div className="text-xs font-bold text-[var(--text-muted)]">
            Fact Status: <span className="text-[var(--text-primary)]">{fact.status}</span>
          </div>

          <div className="flex items-center gap-2">
            {!isRejecting && (
              <button
                onClick={() => setIsRejecting(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 border border-red-500/30 hover:bg-red-500/10 cursor-pointer"
              >
                Reject Fact
              </button>
            )}
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--bg-elevated)] cursor-pointer"
              >
                Edit Fact
              </button>
            )}
            {!isConfirmed && (
              <button
                onClick={handleConfirmFact}
                disabled={submitting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-brand-navy hover:bg-amber-400 cursor-pointer shadow-sm"
              >
                Confirm Fact
              </button>
            )}
          </div>
        </div>

        {isRejecting && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-3">
            <div className="text-xs font-bold text-red-600 flex items-center gap-1.5">
              <AlertTriangle size={14} />
              <span>Confirm Fact Rejection</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Rejecting this fact will remove it from supporting any Career Value interpretations and will trigger re-derivation.
            </p>
            <input
              type="text"
              placeholder="Reason for rejection (e.g. Inaccurate team size)"
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
