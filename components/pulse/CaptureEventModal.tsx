"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, BookOpen, Calendar, ArrowRight, Check } from "lucide-react";
import { CareerEventData } from "./types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CareerEventData) => void;
}

export default function CaptureEventModal({ isOpen, onClose, onSave }: Props) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("September 2026");
  const [context, setContext] = useState("");
  const [impact, setImpact] = useState("");
  const [capability, setCapability] = useState("Technical Leadership");
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    const newEvent: CareerEventData = {
      id: `evt-${Date.now()}`,
      title: title.trim(),
      date: date.trim(),
      context: context.trim() || "Captured strategic career milestone.",
      impact: impact.trim() || "Demonstrated high-leverage execution.",
      capability: capability.trim(),
    };

    setTimeout(() => {
      onSave(newEvent);
      setSaving(false);
      onClose();
    }, 400);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0D1530] border border-slate-200 dark:border-white/15 text-[var(--text-primary)] shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 border border-purple-500/20 dark:border-purple-400/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-[0.16em] text-purple-600 dark:text-purple-400 font-['Syne',sans-serif]">
                  Career Continuity
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Syne',sans-serif]">
                  Capture Career Event
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Event Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Led migration of 2M customer records or Promoted to Lead"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Date / Period
                </label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="e.g. Q3 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Capability Tag
                </label>
                <input
                  type="text"
                  value={capability}
                  onChange={(e) => setCapability(e.target.value)}
                  placeholder="e.g. Cloud Architecture"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400"
                />
              </div>
            </div>

            {/* Quick-Pick Capability Chips for Rapid Logging */}
            <div>
              <div className="text-[11px] font-medium text-[var(--text-muted)] mb-1.5">
                Quick suggestion:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Product Strategy",
                  "Technical Leadership",
                  "Cloud Infrastructure",
                  "Team Scaling",
                  "Architecture",
                  "P&L / ROI",
                ].map((cap) => (
                  <button
                    key={cap}
                    type="button"
                    onClick={() => setCapability(cap)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                      capability === cap
                        ? "bg-purple-600 text-white shadow-xs"
                        : "bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100 dark:hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-400/20"
                    }`}
                  >
                    {cap}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Situation &amp; Context
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="What was the background, scope, or challenge faced?"
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Measurable Impact / Outcome
              </label>
              <textarea
                value={impact}
                onChange={(e) => setImpact(e.target.value)}
                placeholder="Numbers, % improvements, revenue or time savings achieved..."
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 resize-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !title.trim()}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                {saving ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <span>Save to Career Record</span>
                    <Check className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
