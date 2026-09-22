"use client";

import React, { useState } from 'react';
import { QuestionDef } from '@/lib/cde/questionConfig';
import { motion } from 'framer-motion';
import { Users, Sparkles, ArrowRight, Plus, Minus } from 'lucide-react';

interface NumberCardProps {
  question: QuestionDef;
  onAnswer: (value: number) => void;
  onSkip?: () => void;
}

const PRESET_NUMBERS = [2, 4, 6, 8, 12, 20];

export const NumberCard = ({ question, onAnswer, onSkip }: NumberCardProps) => {
  const [value, setValue] = useState<number>(4);

  return (
    <div className="flex flex-col h-full items-center text-center justify-center">
      {/* Category Pill */}
      {question.title && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[11px] font-black uppercase tracking-wider mb-3">
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

      <div className="flex flex-col items-center max-w-sm mx-auto w-full p-6 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-sm">
        {/* Stepper Controls */}
        <div className="flex items-center justify-center gap-6 mb-4">
          <button
            type="button"
            onClick={() => setValue((prev) => Math.max(1, prev - 1))}
            className="w-10 h-10 rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--text-primary)] hover:border-amber-500 hover:text-amber-500 flex items-center justify-center font-black transition-colors cursor-pointer"
          >
            <Minus size={16} />
          </button>

          <motion.div
            key={value}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="flex items-baseline gap-1"
          >
            <span className="text-6xl font-black text-amber-600 dark:text-amber-400 font-['Syne',sans-serif]">
              {value}
            </span>
            <span className="text-sm font-bold text-[var(--text-muted)]">
              {value === 1 ? 'Person' : 'People'}
            </span>
          </motion.div>

          <button
            type="button"
            onClick={() => setValue((prev) => Math.min(100, prev + 1))}
            className="w-10 h-10 rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--text-primary)] hover:border-amber-500 hover:text-amber-500 flex items-center justify-center font-black transition-colors cursor-pointer"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap gap-1.5 justify-center mt-2">
          {PRESET_NUMBERS.map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setValue(num)}
              className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                value === num
                  ? 'bg-amber-500 text-brand-navy border-amber-500 shadow-xs'
                  : 'bg-[var(--card)] text-[var(--text-secondary)] border-[var(--border)] hover:border-amber-500/40'
              }`}
            >
              {num}+
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-8 w-full max-w-sm mx-auto">
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
          <span>Confirm {value}</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};
