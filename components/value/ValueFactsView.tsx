"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
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
import ValueSpotlight from "./ValueSpotlight";

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

  const isFiltered = statusFilter !== "ALL" || categoryFilter !== "ALL" || searchQuery.trim() !== "";

  const handleClearFilters = () => {
    setStatusFilter("ALL");
    setCategoryFilter("ALL");
    setSearchQuery("");
  };

  return (
    <div className="space-y-6">
      {/* View Header with Explanation & Counters */}
      <div className="value-rise relative rounded-[1.75rem] bg-[var(--card)] border border-[var(--border)] p-6 sm:p-8 space-y-4 overflow-hidden shadow-[0_20px_60px_rgba(16,27,59,0.08)]">
        <div className="h-[3px] absolute top-0 inset-x-0 bg-gradient-to-r from-emerald-500 via-amber-500/60 to-violet-500/50 z-20" aria-hidden="true" />
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute inset-0 bg-dot-matrix opacity-40" />
          <div className="value-drift absolute -top-24 right-[4%] w-72 h-72 bg-emerald-500/[0.08] rounded-full blur-[100px]" />
          <div className="value-drift-slow absolute -bottom-24 left-[8%] w-60 h-60 bg-amber-500/[0.07] rounded-full blur-[100px]" />
        </div>
        <span className="value-ghost absolute right-5 top-1/2 -translate-y-1/2 text-[2.6rem] sm:text-[3.4rem] hidden md:block select-none" aria-hidden="true">FACTS</span>
        {/* Breadcrumb trail (Spec §25) */}
        <nav aria-label="Breadcrumb" className="relative flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
          <Link href="/value" className="hover:text-[var(--text-primary)] transition-colors">
            Value
          </Link>
          <span className="opacity-50" aria-hidden="true">/</span>
          <span aria-current="page" className="text-emerald-600 dark:text-emerald-400">Facts</span>
        </nav>
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-wider mb-1">
              <ShieldCheck size={14} />
              <span>Fact Governance & Provenance</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text-primary)] font-['Syne',sans-serif]">
              Career Facts Review
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Atomic facts extracted from your resume and career events. Only confirmed and edited facts support your Career Value.
            </p>
            {/* Review progress */}
            {facts.length > 0 && (
              <div className="mt-3 flex items-center gap-2.5 max-w-sm">
                <div
                  className="flex-1 h-1.5 rounded-full bg-[var(--border)]/60 overflow-hidden"
                  role="progressbar"
                  aria-valuenow={confirmedCount}
                  aria-valuemin={0}
                  aria-valuemax={facts.length}
                  aria-label="Fact review progress"
                >
                  <div
                    className="value-bar h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                    style={{ width: `${Math.round((confirmedCount / facts.length) * 100)}%` }}
                  />
                </div>
                <span className="text-[11px] font-bold text-[var(--text-muted)] tabular-nums whitespace-nowrap" aria-live="polite">
                  {confirmedCount}/{facts.length} reviewed
                </span>
              </div>
            )}
          </div>

          {unconfirmedCount > 0 && (
            <button
              onClick={handleConfirmAllVisible}
              disabled={batching}
              className="group relative overflow-hidden inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black text-brand-navy bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_8px_24px_rgba(16,185,129,0.35)] hover:-translate-y-px active:translate-y-0 transition-all cursor-pointer disabled:opacity-50 self-start sm:self-auto"
            >
              <CheckCircle2 size={15} strokeWidth={2.5} />
              <span>{batching ? "Confirming…" : `Confirm All Visible (${unconfirmedCount})`}</span>
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
          {/* Status Tabs — segmented premium control */}
          <div className="flex items-center gap-1 overflow-x-auto value-noscroll rounded-full bg-[var(--bg-elevated)]/70 border border-[var(--border)]/70 p-1" role="tablist" aria-label="Filter facts by status">
            {[
              { id: "ALL", label: `All (${facts.length})` },
              { id: "EXTRACTED", label: `To review (${unconfirmedCount})`, alert: unconfirmedCount > 0 },
              { id: "CONFIRMED", label: `Confirmed (${confirmedCount})` },
              { id: "REJECTED", label: `Rejected (${rejectedCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={statusFilter === tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  statusFilter === tab.id
                    ? "bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-brand-navy shadow-[0_6px_18px_rgba(245,158,11,0.4)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card)]"
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
                type="search"
                placeholder="Search facts or sources…"
                aria-label="Search facts or sources"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-amber-500 focus:shadow-[0_0_0_3px_rgba(245,158,11,0.12)] transition-shadow"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
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
              className="px-3 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:border-amber-500 cursor-pointer"
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

        {/* Result meta row */}
        <div className="relative flex items-center justify-between gap-3 pt-1">
          <p className="text-[11px] font-semibold text-[var(--text-muted)] tabular-nums" aria-live="polite">
            Showing <strong className="text-[var(--text-primary)]">{filteredFacts.length}</strong> of <strong className="text-[var(--text-primary)]">{facts.length}</strong> facts
            {isFiltered && <span> · filtered</span>}
          </p>
          {isFiltered && (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-600 dark:text-amber-400 hover:text-amber-500 transition-colors cursor-pointer"
            >
              <X size={12} strokeWidth={2.5} />
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Facts List */}
      <div className="space-y-3" aria-live="polite">
        {filteredFacts.length === 0 ? (
          <div className="value-pop p-12 text-center rounded-[1.75rem] bg-[var(--card)] border border-dashed border-[var(--border-strong)] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500 mx-auto">
              <Search size={20} />
            </div>
            <p className="text-sm font-extrabold text-[var(--text-primary)]">
              {facts.length === 0 ? "No career facts yet." : "No facts match these filters."}
            </p>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto leading-relaxed">
              {facts.length === 0
                ? "Upload your resume or add a career event — extracted facts will appear here for your review."
                : "Try a different search term, or reset filters to see the full evidence base."}
            </p>
            {isFiltered && (
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold text-brand-navy bg-amber-500 hover:bg-amber-400 transition-all cursor-pointer"
              >
                <X size={13} strokeWidth={2.5} />
                Reset filters
              </button>
            )}
          </div>
        ) : (
          filteredFacts.map((fact, idx) => {
            const isEditing = editingFactId === fact.id;
            const isSubmitting = submittingId === fact.id;
            const isConfirmed = fact.status === "CONFIRMED" || fact.status === "EDITED";
            const isRejected = fact.status === "REJECTED";

            return (
              <ValueSpotlight
                key={fact.id}
                style={{ animationDelay: `${Math.min(idx, 9) * 0.045}s` }}
                className={`value-rise relative p-5 pl-6 rounded-[1.4rem] bg-[var(--card)] border transition-all duration-300 hover:-translate-y-0.5 space-y-3 overflow-hidden ${
                  isRejected
                    ? "border-red-500/20 opacity-60 bg-red-500/5"
                    : isConfirmed
                    ? "border-emerald-500/25 hover:border-emerald-500/50 hover:shadow-[0_16px_44px_rgba(16,185,129,0.12)]"
                    : "border-amber-500/25 hover:border-amber-500/50 hover:shadow-[0_16px_44px_rgba(245,158,11,0.12)]"
                }`}
              >
                <span
                  className={`absolute left-0 top-0 bottom-0 w-1 ${
                    isRejected
                      ? "bg-gradient-to-b from-red-400 to-red-600"
                      : isConfirmed
                      ? "bg-gradient-to-b from-emerald-400 to-teal-600"
                      : "bg-gradient-to-b from-amber-300 to-amber-600"
                  }`}
                  aria-hidden="true"
                />
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
                    <Link
                      href={`/value/sources/${fact.sourceId || "default"}`}
                      className="font-semibold text-[var(--text-secondary)] hover:text-amber-500 hover:underline"
                    >
                      Source: {fact.sourceType}
                    </Link>
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
                  <div className="space-y-2">
                    <p className="text-xs sm:text-sm font-medium text-[var(--text-primary)] leading-relaxed">
                      {fact.statement}
                    </p>

                    {/* Spec §19: Reverse Contributes To Pills */}
                    {fact.contributesTo && fact.contributesTo.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                          Contributes to:
                        </span>
                        {fact.contributesTo.map((rel, rIdx) => (
                          <Link
                            key={rIdx}
                            href={`/value/interpretations/${rel.interpretationId}`}
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                          >
                            {rel.interpretationTitle}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions Footer */}
                {!isEditing && (
                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border)] flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div className="text-[10px] text-[var(--text-muted)]">
                        {isRejected
                          ? "Rejected facts cannot support active interpretations."
                          : isConfirmed
                          ? "Active input in Career Value."
                          : "Awaiting confirmation."}
                      </div>

                      <Link
                        href={`/value/facts/${fact.id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500 hover:text-amber-400 hover:underline"
                      >
                        <span>Fact Detail</span>
                        <ArrowRight size={11} />
                      </Link>
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
              </ValueSpotlight>
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
