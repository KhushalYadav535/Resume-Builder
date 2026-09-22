"use client";

import React, { useState } from 'react';
import { QuestionDef } from '@/lib/cde/questionConfig';
import { motion } from 'framer-motion';
import { Sparkles, Award, ArrowRight } from 'lucide-react';

interface SliderCardProps {
  question: QuestionDef;
  onAnswer: (value: number) => void;
  onSkip?: () => void;
}

export const SliderCard = ({ question, onAnswer, onSkip }: SliderCardProps) => {
  const [value, setValue] = useState(8);

  const getBenchmarkText = (val: number) => {
    if (val <= 2) return '🌱 Early Career Foundation';
    if (val <= 5) return '⚡ Mid-Level Systems Practitioner';
    if (val <= 9) return '⭐ Senior Technical Specialist (Top 15% of Industry)';
    return '👑 Principal / Lead Architect (Executive Tier)';
  };

  return (
    <div className="flex flex-col h-full items-center text-center justify-center">
      {/* Category Pill */}
      {question.title && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-black uppercase tracking-wider mb-3">
          <Sparkles size={12} />
          <span>{question.title}</span>
        </div>
      )}

      <h2 className="text-xl sm:text-2xl font-bold mb-2 text-[var(--text-primary)] max-w-lg font-['Syne',sans-serif] tracking-tight">
        {question.question}
      </h2>

      {question.helpText && (
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-6 max-w-md leading-relaxed">
          {question.helpText}
        </p>
      )}

      <div className="flex flex-col items-center max-w-md mx-auto w-full p-6 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-sm">
        {/* Animated Big Number Display */}
        <motion.div
          key={value}
          initial={{ scale: 0.9, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-baseline gap-2 mb-2"
        >
          <span className="text-5xl sm:text-6xl font-black text-amber-600 dark:text-amber-400 font-['Syne',sans-serif] tracking-tight">
            {value}
          </span>
          <span className="text-lg font-bold text-[var(--text-muted)]">
            {value === 1 ? 'Year' : 'Years'}
          </span>
        </motion.div>

        {/* Dynamic Tier Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold mb-6">
          <Award size={13} className="shrink-0" />
          <span>{getBenchmarkText(value)}</span>
        </div>

        {/* Range Slider */}
        <div className="w-full px-2">
          <input
            type="range"
            min="0"
            max="20"
            step="1"
            value={value}
            onChange={(e) => setValue(parseInt(e.target.value, 10))}
            className="w-full h-2.5 bg-slate-200 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between w-full mt-3 text-xs font-bold text-[var(--text-muted)]">
            <span>0 Yrs (Entry)</span>
            <span>10 Yrs (Senior)</span>
            <span>20+ Yrs (Principal)</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-8 w-full max-w-md mx-auto">
        {question.skipAllowed !== false && onSkip && (
          <button
            onClick={onSkip}
            className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            Skip for now &rarr;
          </button>
        )}
        <button
          onClick={() => onAnswer(value)}
          className="ml-auto inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl font-black text-xs text-brand-navy bg-amber-500 hover:bg-amber-400 transition-all shadow-md shadow-amber-500/25 cursor-pointer active:scale-[0.98]"
        >
          <span>Confirm {value} Years</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};
