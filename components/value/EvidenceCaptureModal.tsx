"use client";

import { useState } from "react";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Award,
  TrendingUp,
  FileCheck,
  Sparkles
} from "lucide-react";
import { EvidenceGap } from "@/app/api/value/detect-evidence-gaps/route";
import { useToast } from "@/components/ui/toast-1";

interface EvidenceCaptureModalProps {
  gap: EvidenceGap;
  resumeId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EvidenceCaptureModal({
  gap,
  resumeId,
  isOpen,
  onClose,
  onSuccess,
}: EvidenceCaptureModalProps) {
  const { showToast } = useToast();

  // Steps: 1 (Select Cards), 2 (Targeted Follow-up), 3 (Review & Confirm), 4 (Celebration)
  const [currentStep, setCurrentStep] = useState(1);

  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [followUpSelected, setFollowUpSelected] = useState<string>("");
  const [followUpCustom, setFollowUpCustom] = useState<string>("");

  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const toggleCard = (id: string) => {
    setSelectedCardIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedCards = gap.cardOptions.filter((c) => selectedCardIds.includes(c.id));
  const primaryCardId = selectedCardIds[0] || "";
  const primaryCard = gap.cardOptions.find((c) => c.id === primaryCardId);
  const followUpData = primaryCardId ? gap.followUpQuestions[primaryCardId] : null;

  // Deriving structured signal
  const getSupportingSignal = (cardId: string) => {
    switch (cardId) {
      case "manager":
        return "Manager endorsement indicates verified dependability, technical problem-solving, and cross-functional trust.";
      case "review":
        return "Top-tier appraisal ratings substantiate executive promotion readiness and high-performance delivery.";
      case "award":
        return "Formal awards provide verified third-party proof of standout innovation and execution.";
      case "customer":
        return "Direct customer praise demonstrates business value creation, client retention, and stakeholder alignment.";
      case "leadership":
        return "Executive visibility signals organizational trust and readiness for larger strategic ownership.";
      case "promotion":
        return "Promotion validates progressive career trajectory and sustained outperformance.";
      case "scope":
        return "Expanded responsibility indicates scope growth and leadership capacity before formal title changes.";
      default:
        return "Self-reported execution of core professional responsibilities.";
    }
  };

  const handleConfirmSave = async () => {
    setSaving(true);
    try {
      const detailAnswer = followUpCustom.trim() || followUpSelected;

      // Save each selected evidence card
      for (const card of selectedCards) {
        await fetch("/api/value/save-evidence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resumeId,
            sourceType: gap.sourceType,
            sourceId: gap.sourceId,
            recordTitle: gap.recordTitle,
            recordSubtitle: gap.recordSubtitle,
            evidenceType: card.id,
            evidenceLabel: card.label,
            detailAnswer: detailAnswer || `Verified ${card.label}`,
            supportingSignal: getSupportingSignal(card.id),
          }),
        });
      }

      showToast(`${selectedCards.length} evidence signal${selectedCards.length > 1 ? "s" : ""} confirmed and linked!`, "success");
      setCurrentStep(4);
    } catch (err) {
      console.error(err);
      showToast("Error saving evidence.", "error");
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
            <div className="w-8 h-8 rounded-lg bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xs">
              <ShieldCheck size={16} />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Stage 3 · Evidence & Progression Capture
              </div>
              <div className="text-xs font-semibold text-[var(--text-muted)]">
                {gap.recordSubtitle} · {gap.recordTitle}
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
          {/* ─── STEP 1: SCREEN S2 — EVIDENCE CARDS ─── */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  Screen S2 · Evidence Cards
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text-primary)] font-['Syne',sans-serif] mt-1">
                  How Was Your Contribution Supported?
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                  Select the primary third-party recognition, feedback, or scope signal:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {gap.cardOptions.map((card) => {
                  const isSelected = selectedCardIds.includes(card.id);

                  return (
                    <button
                      key={card.id}
                      onClick={() => toggleCard(card.id)}
                      className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "bg-teal-500/15 border-teal-500 text-teal-900 dark:text-teal-200 shadow-sm"
                          : "bg-[var(--bg-elevated)] border-[var(--border)] hover:border-slate-400 dark:hover:border-slate-600 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 text-[10px] ${
                          isSelected
                            ? "bg-teal-600 text-white"
                            : "border border-slate-400 dark:border-slate-600"
                        }`}
                      >
                        {isSelected && <Check size={10} strokeWidth={3} />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[var(--text-primary)]">
                          {card.label}
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-snug">
                          {card.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── STEP 2: SCREEN S3 — PROGRESSIVE FOLLOW-UP ─── */}
          {currentStep === 2 && followUpData && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  Screen S3 · Targeted Follow-Up
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text-primary)] font-['Syne',sans-serif] mt-1">
                  {followUpData.title}
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                  {followUpData.subtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {followUpData.chips.map((chip, idx) => {
                  const isSelected = followUpSelected === chip;

                  return (
                    <button
                      key={idx}
                      onClick={() => setFollowUpSelected(chip)}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-teal-500/15 border-teal-500 text-teal-900 dark:text-teal-200 shadow-sm"
                          : "bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-secondary)] hover:border-slate-400 dark:hover:border-slate-600 hover:text-[var(--text-primary)]"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                          isSelected
                            ? "bg-teal-600 text-white"
                            : "border border-slate-400 dark:border-slate-600"
                        }`}
                      >
                        {isSelected && <Check size={10} strokeWidth={3} />}
                      </div>
                      <span className="leading-snug">{chip}</span>
                    </button>
                  );
                })}
              </div>

              {followUpData.allowCustomText && (
                <div className="pt-2">
                  <div className="text-[11px] font-semibold text-[var(--text-muted)] mb-1.5">
                    Or specify additional details:
                  </div>
                  <input
                    type="text"
                    value={followUpCustom}
                    onChange={(e) => setFollowUpCustom(e.target.value)}
                    placeholder={followUpData.customPlaceholder || "Add clarification..."}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                  />
                </div>
              )}
            </div>
          )}

          {/* ─── STEP 3: SCREEN S4 — EVIDENCE CONFIRMATION ─── */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    Screen S4 · Evidence Confirmation
                  </span>
                  <h2 className="text-xl font-bold text-[var(--text-primary)] font-['Syne',sans-serif]">
                    Confirm Evidence Signals
                  </h2>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30">
                  Ready to Link ({selectedCards.length})
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-4">
                <div>
                  <div className="text-[11px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
                    Selected Evidence Categories
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedCards.map((c) => (
                      <span
                        key={c.id}
                        className="text-xs font-bold px-2.5 py-1 rounded-lg bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30"
                      >
                        {c.label}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
                    User-Confirmed Details
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--text-primary)] mt-1 font-medium leading-relaxed">
                    {followUpCustom.trim() || followUpSelected || "Verified professional evidence"}
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border)] space-y-2">
                  <div className="text-[11px] font-extrabold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                    Supporting Signal Interpretations
                  </div>
                  {selectedCards.map((c) => (
                    <div key={c.id} className="text-xs text-[var(--text-secondary)] leading-relaxed flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0 mt-1.5" />
                      <div>
                        <span className="font-bold text-[var(--text-primary)]">{c.label}: </span>
                        {getSupportingSignal(c.id)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                  <CheckCircle2 size={13} />
                  <span>Status: User-confirmed ({selectedCards.length} signals)</span>
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 4: SCREEN S5 — EVIDENCE PROGRESS CELEBRATION ─── */}
          {currentStep === 4 && (
            <div className="py-8 text-center space-y-6 animate-in fade-in duration-200">
              <div className="w-16 h-16 rounded-3xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto shadow-sm">
                <FileCheck size={32} />
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  Screen S5 · Proof Vault Updated
                </span>
                <h2 className="text-2xl font-extrabold text-[var(--text-primary)] font-['Syne',sans-serif] mt-1">
                  Your Career Evidence is Growing
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-md mx-auto">
                  Third-party recognition and progression signals strengthen your Career Value Profile without requiring sensitive confidential documents.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto text-left">
                <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
                  <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase">
                    Signals Added
                  </div>
                  <div className="text-xs font-bold text-[var(--text-primary)] mt-0.5">
                    {selectedCards.map((c) => c.label).join(", ") || "Career Evidence"}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
                  <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase">
                    Proof Vault
                  </div>
                  <div className="text-xs font-bold text-teal-500 mt-0.5">
                    Synced to Career Memory
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    onSuccess();
                    onClose();
                  }}
                  className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-teal-600 hover:bg-teal-500 transition-all shadow-md shadow-teal-600/25 cursor-pointer"
                >
                  Done for now
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {currentStep <= 3 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border)] bg-[var(--bg-elevated)]">
            {currentStep > 1 ? (
              <button
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2.5">
              <button
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg)] transition-colors cursor-pointer"
              >
                Cancel
              </button>

              {currentStep === 1 ? (
                <button
                  disabled={selectedCardIds.length === 0}
                  onClick={() => setCurrentStep(2)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-teal-600/25 cursor-pointer"
                >
                  <span>Continue ({selectedCardIds.length})</span>
                  <ArrowRight size={13} />
                </button>
              ) : currentStep === 2 ? (
                <button
                  onClick={() => setCurrentStep(3)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white bg-teal-600 hover:bg-teal-500 transition-all shadow-md shadow-teal-600/25 cursor-pointer"
                >
                  <span>Review Evidence</span>
                  <ArrowRight size={13} />
                </button>
              ) : (
                <button
                  disabled={saving}
                  onClick={handleConfirmSave}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-black text-white bg-teal-600 hover:bg-teal-500 disabled:opacity-50 transition-all shadow-md shadow-teal-600/25 cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check size={13} strokeWidth={3} />
                      <span>Confirm & Save Evidence ({selectedCardIds.length})</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
