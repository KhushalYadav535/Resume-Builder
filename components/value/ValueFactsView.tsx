"use client";

import React, { useState, useMemo } from "react";
import {
  CheckCircle2,
  Edit3,
  Trash2,
  Filter,
  Search,
  Check,
  FileText,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  Layers,
  X,
  AlertTriangle,
} from "lucide-react";
import { CareerFact, CareerFactCategory, CareerFactStatus, CareerInterpretation } from "@/types/value";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

interface ValueFactsViewProps {
  facts: CareerFact[];
  onConfirmFact: (fact: CareerFact) => Promise<void>;
  onEditFact: (fact: CareerFact, newStatement: string) => Promise<void>;
  onRejectFact: (fact: CareerFact, reason?: string) => Promise<void>;
  onBatchConfirm: (facts: CareerFact[]) => Promise<void>;
  loading?: boolean;
  /** All current interpretations — used to show which capabilities/patterns a rejected fact will affect */
  allInterpretations?: CareerInterpretation[];
}

export default function ValueFactsView({
  facts,
  onConfirmFact,
  onEditFact,
  onRejectFact,
  onBatchConfirm,
  loading = false,
  allInterpretations = [],
}: ValueFactsViewProps) {
  /** Returns interpretations that reference a given fact ID in their supportingEvidence */
  const getAffectedInterpretations = (factId: string): CareerInterpretation[] => {
    return allInterpretations.filter((interp) =>
      interp.supportingEvidence?.some((ev) =>
        ev.facts?.some((f) => f.id === factId)
      )
    );
  };
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [editingFactId, setEditingFactId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>("");
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [batching, setBatching] = useState(false);
  const [rejectingFact, setRejectingFact] = useState<CareerFact | null>(null);
  const [rejectAffected, setRejectAffected] = useState<CareerInterpretation[]>([]);

  // Filtered facts
  const filteredFacts = useMemo(() => {
    return facts.filter((f) => {
      // Status filter
      if (statusFilter !== "ALL" && f.status !== statusFilter) {
        return false;
      }
      // Category filter
      if (categoryFilter !== "ALL" && f.category !== categoryFilter) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchStatement = f.statement.toLowerCase().includes(q);
        const matchSource = f.sourceTitle.toLowerCase().includes(q);
        const matchCategory = f.category.toLowerCase().includes(q);
        if (!matchStatement && !matchSource && !matchCategory) return false;
      }
      return true;
    });
  }, [facts, statusFilter, categoryFilter, searchQuery]);

  // Counts
  const unconfirmedCount = useMemo(
    () => facts.filter((f) => f.status === "EXTRACTED").length,
    [facts]
  );
  const confirmedCount = useMemo(
    () => facts.filter((f) => f.status === "CONFIRMED" || f.status === "EDITED").length,
    [facts]
  );
  const rejectedCount = useMemo(
    () => facts.filter((f) => f.status === "REJECTED").length,
    [facts]
  );

  const handleStartEdit = (f: CareerFact) => {
    setEditingFactId(f.id);
    setEditingText(f.statement);
  };

  const handleSaveEdit = async (f: CareerFact) => {
    if (!editingText.trim() || editingText === f.statement) {
      setEditingFactId(null);
      return;
    }
    setSubmittingId(f.id);
    try {
      await onEditFact(f, editingText);
      setEditingFactId(null);
    } finally {
      setSubmittingId(null);
    }
  };

  const handleConfirm = async (f: CareerFact) => {
    setSubmittingId(f.id);
    try {
      await onConfirmFact(f);
    } finally {
      setSubmittingId(null);
    }
  };

  const handleReject = async (f: CareerFact) => {
    setSubmittingId(f.id);
    try {
      await onRejectFact(f, "User marked as inaccurate");
    } finally {
      setSubmittingId(null);
    }
  };

  const handleConfirmAllVisible = async () => {
    const unconfirmedVisible = filteredFacts.filter((f) => f.status === "EXTRACTED");
    if (unconfirmedVisible.length === 0) return;
    setBatching(true);
    try {
      await onBatchConfirm(unconfirmedVisible);
    } finally {
      setBatching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header with Explanation & Counters */}
      <div className="rounded-3xl bg-[var(--card)] border border-[var(--border)] p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-wider mb-1">
              <ShieldCheck size={14} />
              <span>Fact Governance & Provenance</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] font-['Syne',sans-serif]">
              Career Facts Review
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Atomic facts extracted from your resume and career events. Only confirmed and edited facts support your Career Value.
            </p>
          </div>

          {unconfirmedCount > 0 && (
            <button
              onClick={handleConfirmAllVisible}
              disabled={batching}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-brand-navy bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] transition-all cursor-pointer shadow-sm disabled:opacity-50 self-start sm:self-auto"
            >
              <CheckCircle2 size={15} strokeWidth={2.5} />
              <span>{batching ? "Confirming..." : `Confirm All Visible (${unconfirmedCount})`}</span>
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: "ALL", label: `All (${facts.length})` },
              { id: "EXTRACTED", label: `Extracted (${unconfirmedCount})`, alert: unconfirmedCount > 0 },
              { id: "CONFIRMED", label: `Confirmed (${confirmedCount})` },
              { id: "REJECTED", label: `Rejected (${rejectedCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? "bg-amber-500 text-brand-navy shadow-xs"
                    : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]"
                }`}
              >
                <span>{tab.label}</span>
                {tab.alert && statusFilter !== tab.id && (
                  <span className="ml-1.5 w-2 h-2 inline-block rounded-full bg-amber-500 animate-pulse" />
                )}
              </button>
            ))}
          </div>

          {/* Search & Category Filter */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <div className="relative flex-1 sm:w-64">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />
              <input
                type="text"
                placeholder="Search facts or sources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-amber-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter facts by category"
              className="px-3 py-1.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-xs font-semibold text-[var(--text-primary)] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Categories ({facts.length})</option>
              <option value="ROLE">Roles ({facts.filter(f => f.category === "ROLE").length})</option>
              <option value="RESPONSIBILITY">Responsibilities ({facts.filter(f => f.category === "RESPONSIBILITY").length})</option>
              <option value="TEAM">Team & Leadership ({facts.filter(f => f.category === "TEAM").length})</option>
              <option value="PROMOTION">Promotions ({facts.filter(f => f.category === "PROMOTION").length})</option>
              <option value="ACHIEVEMENT">Achievements ({facts.filter(f => f.category === "ACHIEVEMENT").length})</option>
              <option value="BUSINESS_OUTCOME">Business Outcomes ({facts.filter(f => f.category === "BUSINESS_OUTCOME").length})</option>
              <option value="METRIC">Quantified Metrics ({facts.filter(f => f.category === "METRIC").length})</option>
              <option value="PROJECT">Projects ({facts.filter(f => f.category === "PROJECT").length})</option>
              <option value="TECHNOLOGY">Tech Stack ({facts.filter(f => f.category === "TECHNOLOGY").length})</option>
              <option value="RECOGNITION">Recognitions & Awards ({facts.filter(f => f.category === "RECOGNITION").length})</option>
              <option value="EDUCATION">Education ({facts.filter(f => f.category === "EDUCATION").length})</option>
              <option value="CERTIFICATION">Certifications ({facts.filter(f => f.category === "CERTIFICATION").length})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Facts List */}
      <div className="space-y-3">
        {filteredFacts.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[var(--card)] border border-[var(--border)] space-y-2">
            <p className="text-sm font-bold text-[var(--text-primary)]">
              No facts match the selected filters.
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Try switching the status filter or clearing your search term.
            </p>
          </div>
        ) : (
          filteredFacts.map((fact) => {
            const isEditing = editingFactId === fact.id;
            const isSubmitting = submittingId === fact.id;
            const isConfirmed = fact.status === "CONFIRMED" || fact.status === "EDITED";
            const isRejected = fact.status === "REJECTED";

            return (
              <div
                key={fact.id}
                className={`p-5 rounded-2xl bg-[var(--card)] border transition-all space-y-3 ${
                  isRejected
                    ? "border-red-500/20 opacity-60 bg-red-500/5"
                    : isConfirmed
                    ? "border-emerald-500/30 hover:border-emerald-500/50"
                    : "border-amber-500/30 hover:border-amber-500/50"
                }`}
              >
                {/* Meta Header */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-secondary)]">
                      {fact.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        isConfirmed
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                          : isRejected
                          ? "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30"
                          : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {fact.status}
                    </span>
                  </div>

                  {/* Provenance Badge */}
                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                    <span className="font-semibold text-[var(--text-secondary)]">
                      Source: {fact.sourceType}
                    </span>
                    <span>· {fact.sourceTitle}</span>
                    {fact.sourceDate && <span>({fact.sourceDate})</span>}
                  </div>
                </div>

                {/* Statement Body or Inline Editor */}
                {isEditing ? (
                  <div className="space-y-2 pt-1">
                    <textarea
                      rows={2}
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-amber-500"
                    />
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => setEditingFactId(null)}
                        className="px-2.5 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(fact)}
                        disabled={isSubmitting}
                        className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-500 text-brand-navy hover:bg-amber-400 cursor-pointer"
                      >
                        Save Statement
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm font-medium text-[var(--text-primary)] leading-relaxed">
                    {fact.statement}
                  </p>
                )}

                {/* Actions Footer */}
                {!isEditing && (
                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
                    <div className="text-[10px] text-[var(--text-muted)]">
                      {isRejected
                        ? "Rejected facts cannot support active Career Value interpretations."
                        : isConfirmed
                        ? "Active input in Career Value derivation."
                        : "Awaiting confirmation from user."}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStartEdit(fact)}
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
                      >
                        <Edit3 size={12} />
                        <span>Edit</span>
                      </button>

                      {!isRejected && (
                        <button
                          onClick={() => {
                            const affected = getAffectedInterpretations(fact.id);
                            setRejectAffected(affected);
                            setRejectingFact(fact);
                          }}
                          disabled={isSubmitting}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 size={12} />
                          <span>Reject</span>
                        </button>
                      )}

                      {!isConfirmed && (
                        <button
                          onClick={() => handleConfirm(fact)}
                          disabled={isSubmitting}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-black bg-emerald-500 text-brand-navy hover:bg-emerald-400 transition-all cursor-pointer shadow-xs"
                        >
                          <Check size={12} strokeWidth={3} />
                          <span>Confirm</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Rejection Confirmation Modal — shows affected interpretations (Spec Rule 5 & 6) */}
      <ConfirmationModal
        isOpen={!!rejectingFact}
        title="Reject Career Fact?"
        message={``}
        confirmLabel="Reject Fact"
        cancelLabel="Keep Fact"
        isDanger={true}
        onConfirm={async () => {
          if (!rejectingFact) return;
          const target = rejectingFact;
          setRejectingFact(null);
          setRejectAffected([]);
          await handleReject(target);
        }}
        onCancel={() => {
          setRejectingFact(null);
          setRejectAffected([]);
        }}
        customContent={
          rejectingFact && (
            <div className="space-y-4">
              {/* Fact being rejected */}
              <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Fact to reject
                </p>
                <p className="text-xs text-[var(--text-primary)] leading-relaxed font-medium">
                  &ldquo;{rejectingFact.statement}&rdquo;
                </p>
                <p className="text-[10px] text-[var(--text-muted)]">
                  Source: {rejectingFact.sourceType} · {rejectingFact.sourceTitle}
                </p>
              </div>

              {/* Impact warning */}
              {rejectAffected.length > 0 ? (
                <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/25 space-y-2">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertTriangle size={13} strokeWidth={2.5} />
                    <p className="text-[11px] font-bold uppercase tracking-wider">
                      {rejectAffected.length} career value interpretation{rejectAffected.length === 1 ? "" : "s"} will be affected
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    {rejectAffected.map((interp) => (
                      <div
                        key={interp.id}
                        className="flex items-start gap-2 px-2 py-1.5 rounded-lg bg-[var(--card)] border border-red-500/20"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                        <div>
                          <p className="text-[11px] font-bold text-[var(--text-primary)]">
                            {interp.title}
                          </p>
                          <p className="text-[10px] text-[var(--text-muted)] capitalize">
                            {interp.type.toLowerCase().replace("_", " ")} · {interp.confidence} confidence
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
                    These interpretations may weaken or disappear after the fact is rejected. Underlying facts from other sources remain intact.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
                  <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                    This fact is not currently linked to any active interpretation. Rejecting it will not affect your visible Career Value profile.
                  </p>
                </div>
              )}
            </div>
          )
        }
      />
    </div>
  );
}
