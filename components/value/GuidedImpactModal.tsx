"use client";

import { useState } from "react";
import {
  X,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Check,
  Edit3,
  ThumbsUp,
  AlertCircle,
  Loader2,
  TrendingUp,
  Award
} from "lucide-react";
import { CareerGap } from "@/app/api/value/detect-gaps/route";
import { ImpactInterpretation } from "@/app/api/value/interpret-impact/route";
import { useToast } from "@/components/ui/toast-1";

interface GuidedImpactModalProps {
  gap: CareerGap;
  resumeId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedBullet?: string) => void;
  remainingGapsCount?: number;
}

export default function GuidedImpactModal({
  gap,
  resumeId,
  isOpen,
  onClose,
  onSuccess,
  remainingGapsCount,
}: GuidedImpactModalProps) {
  const { showToast } = useToast();

  // Multi-step state: 1, 2, 3 (Questions), 4 (Interpretation Review), 5 (Progress Summary)
  const [currentStep, setCurrentStep] = useState(1);

  // User answers
  const [step1Selected, setStep1Selected] = useState<string>("");
  const [step1Custom, setStep1Custom] = useState<string>("");

  const [step2Selected, setStep2Selected] = useState<string>("");

  const [step3Selected, setStep3Selected] = useState<string>("");
  const [step3Custom, setStep3Custom] = useState<string>("");

  // Interpretation state
  const [interpreting, setInterpreting] = useState(false);
  const [interpretation, setInterpretation] = useState<ImpactInterpretation | null>(null);
  const [editableBullet, setEditableBullet] = useState("");
  const [isEditingBullet, setIsEditingBullet] = useState(false);

  // Saving state
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const currentQ = gap.questions.find((q) => q.step === currentStep);

  // Handle advancing through questions
  const handleNextQuestion = async () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    } else if (currentStep === 3) {
      // Advance to Interpretation Review (Screen S3)
      setInterpreting(true);
      setCurrentStep(4);
      try {
        const res = await fetch("/api/value/interpret-impact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gapId: gap.id,
            originalText: gap.originalText,
            recordTitle: gap.recordTitle,
            recordSubtitle: gap.recordSubtitle,
            step1Answer: step1Custom.trim() || step1Selected,
            step2Answer: step2Selected,
            step3Answer: step3Custom.trim() || step3Selected,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setInterpretation(data.interpretation);
          setEditableBullet(data.interpretation.suggestedBulletRewrite);
        } else {
          showToast("Failed to interpret response. Please try again.", "error");
          setCurrentStep(3);
        }
      } catch (err) {
        console.error(err);
        showToast("Error processing impact interpretation.", "error");
        setCurrentStep(3);
      } finally {
        setInterpreting(false);
      }
    }
  };

  // Handle Confirming & Saving
  const handleConfirmSave = async () => {
    if (!interpretation) return;
    setSaving(true);
    try {
      const res = await fetch("/api/value/save-impact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gapId: gap.id,
          resumeId,
          sourceType: gap.sourceType,
          sourceId: gap.sourceId,
          originalText: gap.originalText,
          confirmedBullet: editableBullet.trim() || interpretation.suggestedBulletRewrite,
          problem: interpretation.problem,
          contribution: interpretation.contribution,
          impact: interpretation.potentialImpact,
        }),
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        const finalBullet = editableBullet.trim() || data.updatedBullet || interpretation.suggestedBulletRewrite;
        showToast("Impact confirmed and saved to your career record!", "success");
        onSuccess(finalBullet);
        setCurrentStep(5); // Advance to Screen S4 (Progress Celebration)
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.error || "Failed to save impact. Please try again.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error saving impact.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (currentStep === 5) {
      onSuccess(editableBullet);
    }
    onClose();
  };

  const isStepValid = () => {
    if (currentStep === 1) return !!step1Selected || !!step1Custom.trim();
    if (currentStep === 2) return !!step2Selected;
    if (currentStep === 3) return !!step3Selected || !!step3Custom.trim();
    return true;
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
              <Sparkles size={16} />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Stage 2 · Guided Impact Discovery
              </div>
              <div className="text-xs font-semibold text-[var(--text-muted)]">
                {gap.recordSubtitle} · {gap.recordTitle}
              </div>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          {/* ─── STEPS 1, 2, 3: GUIDED QUESTIONS ─── */}
          {currentStep <= 3 && currentQ && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-[var(--text-muted)]">
                  <span>Question {currentStep} of 3</span>
                  <span>{Math.round((currentStep / 3) * 100)}% Completed</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all duration-300 rounded-full"
                    style={{ width: `${(currentStep / 3) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question Header */}
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text-primary)] font-['Syne',sans-serif]">
                  {currentQ.title}
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                  {currentQ.subtitle}
                </p>
              </div>

              {/* Selectable Chips Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentQ.chipOptions.map((chip, idx) => {
                  const isSelected =
                    currentStep === 1
                      ? step1Selected === chip
                      : currentStep === 2
                      ? step2Selected === chip
                      : step3Selected === chip;

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        if (currentStep === 1) setStep1Selected(chip);
                        if (currentStep === 2) setStep2Selected(chip);
                        if (currentStep === 3) setStep3Selected(chip);
                      }}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-amber-500/15 border-amber-500 text-brand-navy dark:text-amber-300 shadow-sm"
                          : "bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-secondary)] hover:border-slate-400 dark:hover:border-slate-600 hover:text-[var(--text-primary)]"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                          isSelected
                            ? "bg-amber-500 text-brand-navy"
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

              {/* Optional Custom Input */}
              {currentQ.allowCustomText && (
                <div className="pt-2">
                  <div className="text-[11px] font-semibold text-[var(--text-muted)] mb-1.5">
                    Or specify in your own words:
                  </div>
                  <input
                    type="text"
                    value={currentStep === 1 ? step1Custom : step3Custom}
                    onChange={(e) => {
                      if (currentStep === 1) setStep1Custom(e.target.value);
                      if (currentStep === 3) setStep3Custom(e.target.value);
                    }}
                    placeholder={currentQ.customPlaceholder || "Type your response..."}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>
              )}
            </div>
          )}

          {/* ─── STEP 4: SCREEN S3 — AI INTERPRETATION REVIEW ─── */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {interpreting ? (
                <div className="py-12 text-center space-y-3">
                  <Loader2 size={32} className="text-amber-500 animate-spin mx-auto" />
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    Analyzing Discovered Impact...
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Structuring your answers into verified Problem, Contribution, and Outcome signals.
                  </p>
                </div>
              ) : interpretation ? (
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        Screen S3 · System Interpretation
                      </span>
                      <h2 className="text-xl font-bold text-[var(--text-primary)] font-['Syne',sans-serif]">
                        What We Understood
                      </h2>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                      Review Required
                    </span>
                  </div>

                  {/* 4 Structured Dimensions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
                      <div className="text-[11px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
                        Problem Solved
                      </div>
                      <p className="text-xs font-semibold text-[var(--text-primary)] mt-1 leading-relaxed">
                        {interpretation.problem}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
                      <div className="text-[11px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
                        Personal Contribution
                      </div>
                      <p className="text-xs font-semibold text-[var(--text-primary)] mt-1 leading-relaxed">
                        {interpretation.contribution}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
                      <div className="text-[11px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
                        Potential Impact
                      </div>
                      <p className="text-xs font-semibold text-[var(--text-primary)] mt-1 leading-relaxed">
                        {interpretation.potentialImpact}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
                      <div className="text-[11px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
                        Evidence Status
                      </div>
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1 leading-relaxed">
                        {interpretation.evidenceStatus}
                      </p>
                    </div>
                  </div>

                  {/* Suggested Resume Bullet Rewrite */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-transparent to-purple-500/10 border border-amber-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                        Suggested Resume Bullet Rewrite
                      </span>
                      {!isEditingBullet && (
                        <button
                          onClick={() => setIsEditingBullet(true)}
                          className="text-xs font-semibold text-amber-500 hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 size={12} />
                          <span>Edit</span>
                        </button>
                      )}
                    </div>

                    {isEditingBullet ? (
                      <textarea
                        value={editableBullet}
                        onChange={(e) => setEditableBullet(e.target.value)}
                        rows={3}
                        className="w-full p-2.5 text-xs rounded-xl border border-amber-500/50 bg-[var(--bg-elevated)] text-[var(--text-primary)] focus:outline-none"
                      />
                    ) : (
                      <p className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] leading-relaxed">
                        "{editableBullet}"
                      </p>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* ─── STEP 5: SCREEN S4 — PROGRESS SUMMARY & CELEBRATION ─── */}
          {currentStep === 5 && (
            <div className="py-6 text-center space-y-6 animate-in fade-in duration-200">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 size={30} />
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Screen S4 · Career Intelligence Enriched
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] font-['Syne',sans-serif] mt-1">
                  Your Career Story is Becoming Clearer
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-md mx-auto">
                  Newly discovered impact has been successfully linked to your Career Memory and verified facts.
                </p>
              </div>

              {/* Progress Summary Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto text-left">
                <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
                  <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase">
                    Discovered Contribution
                  </div>
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                    <Sparkles size={12} />
                    <span>+1 Impact Metric</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
                  <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase">
                    Evidence Level
                  </div>
                  <div className="text-xs font-bold text-[var(--text-primary)] mt-0.5 flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    <span>User Confirmed</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
                  <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase">
                    Remaining Opportunities
                  </div>
                  <div className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                    {typeof remainingGapsCount === "number" ? `${Math.max(0, remainingGapsCount - 1)} gaps to explore` : "More to explore"}
                  </div>
                </div>
              </div>

              {/* Next Suggested Question Preview */}
              <div className="p-4 rounded-2xl bg-amber-500/[0.06] border border-amber-500/20 text-left max-w-lg mx-auto">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1 flex items-center gap-1.5">
                  <TrendingUp size={12} />
                  <span>Next Recommended Exploration</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Continue exploring related projects or clarify execution speed, team scale, and customer satisfaction metrics to further strengthen your career narrative.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    onSuccess(editableBullet);
                    onClose();
                  }}
                  className="px-6 py-2.5 rounded-xl text-xs font-black text-brand-navy bg-amber-500 hover:bg-amber-400 transition-all shadow-md shadow-amber-500/25 cursor-pointer"
                >
                  Done for now
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer (Steps 1 to 4) */}
        {currentStep <= 4 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border)] bg-[var(--bg-elevated)]">
            {currentStep > 1 && currentStep <= 3 ? (
              <button
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>Back</span>
              </button>
            ) : currentStep === 4 ? (
              <button
                onClick={() => setCurrentStep(3)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>Correct answers</span>
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

              {currentStep <= 3 ? (
                <button
                  disabled={!isStepValid()}
                  onClick={handleNextQuestion}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-brand-navy bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-amber-500/25 cursor-pointer"
                >
                  <span>{currentStep === 3 ? "Generate Interpretation" : "Continue"}</span>
                  <ArrowRight size={13} />
                </button>
              ) : (
                <button
                  disabled={saving || interpreting}
                  onClick={handleConfirmSave}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-black text-brand-navy bg-amber-500 hover:bg-amber-400 disabled:opacity-50 transition-all shadow-md shadow-amber-500/25 cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check size={13} strokeWidth={3} />
                      <span>Confirm & Save Impact</span>
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
