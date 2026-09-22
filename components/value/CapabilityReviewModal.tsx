"use client";

import { useState } from "react";
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Check,
  Edit3,
  Trash2,
  Loader2,
  Building,
  Briefcase,
  Shield,
  HelpCircle,
  ArrowRight
} from "lucide-react";
import { CapabilityHypothesis } from "@/app/api/value/derive-profile/route";
import { useToast } from "@/components/ui/toast-1";

interface CapabilityReviewModalProps {
  capability: CapabilityHypothesis;
  isOpen: boolean;
  onClose: () => void;
  onReviewed: (action: "confirm" | "edit" | "reject", updatedCap?: CapabilityHypothesis) => void;
}

export default function CapabilityReviewModal({
  capability,
  isOpen,
  onClose,
  onReviewed,
}: CapabilityReviewModalProps) {
  const { showToast } = useToast();

  const [mode, setMode] = useState<"view" | "edit" | "reject">("view");

  // Edit fields
  const [editedName, setEditedName] = useState(capability.name);
  const [editedDescription, setEditedDescription] = useState(capability.description);

  // Reject reason
  const [rejectionReason, setRejectionReason] = useState("Not accurate");

  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/value/review-capability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          capabilityId: capability.id,
          capabilityName: capability.name,
          action: "confirm",
        }),
      });

      if (res.ok) {
        showToast("Capability confirmed and added to your profile!", "success");
        onReviewed("confirm", { ...capability, status: "confirmed" });
        onClose();
      } else {
        showToast("Failed to confirm capability.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error processing confirmation.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/value/review-capability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          capabilityId: capability.id,
          capabilityName: capability.name,
          action: "edit",
          editedName,
          editedDescription,
        }),
      });

      if (res.ok) {
        showToast("Capability updated successfully!", "success");
        onReviewed("edit", {
          ...capability,
          name: editedName,
          description: editedDescription,
          status: "modified",
        });
        onClose();
      } else {
        showToast("Failed to update capability.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error saving capability edit.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmReject = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/value/review-capability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          capabilityId: capability.id,
          capabilityName: capability.name,
          action: "reject",
          rejectionReason,
        }),
      });

      if (res.ok) {
        showToast("Capability hypothesis dismissed.", "info");
        onReviewed("reject");
        onClose();
      } else {
        showToast("Failed to reject capability.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error processing rejection.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs">
              <Sparkles size={16} />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Stage 4 · Capability Interpretation Review
              </div>
              <div className="text-xs font-semibold text-[var(--text-muted)]">
                AI Hypothesis · User Confirmation Required
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          {mode === "view" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-[var(--border)]">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
                    Capability Hypothesis
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] font-['Syne',sans-serif] mt-0.5">
                    {capability.name}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                    Confidence: {capability.confidence}
                  </span>
                </div>
              </div>

              {/* Explanation */}
              <div className="space-y-1.5">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  What This Demonstrates
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {capability.description}
                </p>
              </div>

              {/* Supporting Career Evidence */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                    <Shield size={13} className="text-amber-500" />
                    <span>Supporting Career Evidence ({capability.supportingEvidence.length})</span>
                  </div>
                  <span className="text-[11px] text-[var(--text-muted)]">
                    Traceable to verified records
                  </span>
                </div>

                <div className="space-y-2.5">
                  {capability.supportingEvidence.map((ev, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-1 text-left"
                    >
                      <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
                        {ev.sourceType === "employment" ? (
                          <Building size={13} className="text-amber-500 shrink-0" />
                        ) : (
                          <Briefcase size={13} className="text-blue-500 shrink-0" />
                        )}
                        <span>{ev.sourceTitle}</span>
                        <span className="text-[var(--text-muted)] font-normal">
                          · {ev.sourceSubtitle}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] pl-5 leading-relaxed">
                        "{ev.factText}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {mode === "edit" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] font-['Syne',sans-serif]">
                  Refine Capability Definition
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Adjust the title or description to match your exact professional scope:
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase">
                  Capability Title
                </label>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-purple-500/30 font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase">
                  Description & Demonstrated Scope
                </label>
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  rows={3}
                  className="w-full p-3 text-xs rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-purple-500/30 leading-relaxed"
                />
              </div>
            </div>
          )}

          {mode === "reject" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <strong>Dismiss Capability Hypothesis:</strong> This will remove "{capability.name}" from your profile. Underlying career facts and experiences will remain untouched.
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase">
                  Select Reason (Optional)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    "Not accurate",
                    "Not relevant to my career direction",
                    "Overstated scope",
                    "Missing critical context",
                    "Wrong interpretation",
                  ].map((reason) => (
                    <button
                      key={reason}
                      onClick={() => setRejectionReason(reason)}
                      className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                        rejectionReason === reason
                          ? "bg-red-500/15 border-red-500 text-red-700 dark:text-red-300"
                          : "bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-secondary)]"
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border)] bg-[var(--bg-elevated)]">
          {mode !== "view" ? (
            <button
              onClick={() => setMode("view")}
              className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              Back to review
            </button>
          ) : (
            <button
              onClick={() => setMode("reject")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-400 cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Reject hypothesis</span>
            </button>
          )}

          <div className="flex items-center gap-2.5">
            {mode === "view" && (
              <>
                <button
                  onClick={() => setMode("edit")}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg)] transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 size={12} />
                  <span>Edit</span>
                </button>

                <button
                  disabled={saving}
                  onClick={handleConfirm}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-black text-brand-navy bg-amber-500 hover:bg-amber-400 transition-all shadow-md shadow-amber-500/25 cursor-pointer"
                >
                  {saving ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Check size={13} strokeWidth={3} />
                  )}
                  <span>Confirm Capability</span>
                </button>
              </>
            )}

            {mode === "edit" && (
              <button
                disabled={saving}
                onClick={handleSaveEdit}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-black text-brand-navy bg-amber-500 hover:bg-amber-400 transition-all shadow-md shadow-amber-500/25 cursor-pointer"
              >
                {saving && <Loader2 size={13} className="animate-spin" />}
                <span>Save & Confirm Edit</span>
              </button>
            )}

            {mode === "reject" && (
              <button
                disabled={saving}
                onClick={handleConfirmReject}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 transition-all shadow-md shadow-red-600/25 cursor-pointer"
              >
                {saving && <Loader2 size={13} className="animate-spin" />}
                <span>Confirm Rejection</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
