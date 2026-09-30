"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Edit3,
  ThumbsUp,
  ThumbsDown,
  Layers,
  FileText,
} from "lucide-react";
import { AiTraceabilityContext } from "./types";

interface Props {
  context: AiTraceabilityContext | null;
  onClose: () => void;
  onConfirm?: () => void;
  onReject?: () => void;
}

export default function AiTraceabilityModal({
  context,
  onClose,
  onConfirm,
  onReject,
}: Props) {
  const [feedbackGiven, setFeedbackGiven] = useState<string | null>(null);
  const [correctionMode, setCorrectionMode] = useState(false);
  const [correctionText, setCorrectionText] = useState("");

  const handleConfirmAction = () => {
    setFeedbackGiven("confirmed");
    onConfirm?.();
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleRejectAction = () => {
    setFeedbackGiven("rejected");
    onReject?.();
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  if (!context) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-[#0D1530] border border-slate-200 dark:border-white/15 text-[var(--text-primary)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Ambient Header Glow */}
          <div className="absolute top-0 right-1/4 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 dark:border-amber-400/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-[0.16em] text-amber-600 dark:text-amber-400 font-['Syne',sans-serif]">
                  AI Reasoning &amp; Evidence Traceability
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Syne',sans-serif]">
                  {context.componentTitle}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700 dark:text-slate-200 relative z-10 flex-1">
            {/* The AI Claim */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Synthesized Interpretation
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 border border-amber-400/30 text-amber-700 dark:text-amber-300">
                  {context.confidence}
                </span>
              </div>
              <p className="text-base font-bold text-slate-900 dark:text-white font-['Syne',sans-serif]">
                {context.claim}
              </p>
            </div>

            {/* Reasoning Chain */}
            <div className="space-y-2.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>How UpRole Arrived at this Interpretation</span>
              </div>
              <ul className="space-y-2">
                {context.reasoning.map((item, idx) => (
                  <li
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed"
                  >
                    <span className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Evidence Sources */}
            <div className="space-y-2.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Underlying Career Evidence Sources</span>
              </div>
              <div className="space-y-2">
                {context.evidenceSources.map((source, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 font-['Syne',sans-serif]">
                        {source.title}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/10 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/20 dark:border-blue-400/20">
                        {source.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic border-l-2 border-amber-500/50 pl-2 mt-1">
                      &ldquo;{source.snippet}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* User Correction Form */}
            {correctionMode && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 space-y-3">
                <div className="text-xs font-bold text-amber-800 dark:text-amber-300">
                  Suggest Correction to this AI Interpretation:
                </div>
                <textarea
                  value={correctionText}
                  onChange={(e) => setCorrectionText(e.target.value)}
                  placeholder="Explain what needs adjustment (e.g., 'My primary focus has been B2B enterprise sales rather than marketing leadership')..."
                  className="w-full h-24 p-3 rounded-xl bg-slate-100 dark:bg-[#080E24] border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 resize-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setCorrectionMode(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setFeedbackGiven("correction_saved");
                      setCorrectionMode(false);
                      setTimeout(() => onClose(), 1400);
                    }}
                    className="px-4 py-1.5 rounded-lg bg-amber-500 text-brand-navy font-bold text-xs hover:bg-amber-400 cursor-pointer"
                  >
                    Save Correction
                  </button>
                </div>
              </div>
            )}

            {feedbackGiven && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  {feedbackGiven === "confirmed" && "Interpretation verified as accurate. Closing..."}
                  {feedbackGiven === "rejected" && "Interpretation rejected. Calibration adjusted."}
                  {feedbackGiven === "correction_saved" && "Correction saved to your Career Memory. Closing..."}
                </span>
              </motion.div>
            )}
          </div>

          {/* Footer with User Agency Actions */}
          <div className="p-5 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0A1026] flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Users maintain ultimate ownership over interpretation
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCorrectionMode(true)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Correct</span>
              </button>

              <button
                type="button"
                onClick={handleRejectAction}
                className="px-3 py-2 rounded-xl bg-rose-500/10 dark:bg-rose-500/15 hover:bg-rose-500/20 dark:hover:bg-rose-500/25 border border-rose-500/20 dark:border-rose-500/30 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:text-rose-800 dark:hover:text-rose-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmAction}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-brand-navy font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Confirm Accurate</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
