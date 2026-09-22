"use client";

import React from 'react';
import { QuestionDef } from '@/lib/cde/questionConfig';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';

interface ChoiceCardProps {
  question: QuestionDef;
  onAnswer: (value: string) => void;
  onSkip?: () => void;
}

export const ChoiceCard = ({ question, onAnswer, onSkip }: ChoiceCardProps) => {
  return (
    <div className="flex flex-col h-full items-center text-center">
      {/* Category Pill */}
      {question.title && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px] font-black uppercase tracking-wider mb-3">
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

      <div className="flex flex-col gap-2.5 w-full max-w-md">
        {question.options?.map((option, idx) => (
          <motion.button
            key={option.value}
            whileHover={{ scale: 1.015, y: -1 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => onAnswer(option.value)}
            className="group relative flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-elevated)] hover:bg-amber-500/[0.08] dark:hover:bg-amber-500/10 border border-[var(--border)] hover:border-amber-500/50 text-[var(--text-primary)] transition-all shadow-xs hover:shadow-md cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[var(--border)] group-hover:bg-amber-500/20 group-hover:text-amber-600 dark:group-hover:text-amber-300 text-[var(--text-muted)] text-xs font-black flex items-center justify-center transition-colors">
                {idx + 1}
              </span>
              <span className="text-sm sm:text-base font-semibold leading-snug">
                {option.label}
              </span>
            </div>
            <div className="w-5 h-5 rounded-full border border-[var(--border)] group-hover:border-amber-500 group-hover:bg-amber-500 group-hover:text-brand-navy flex items-center justify-center shrink-0 transition-all opacity-70 group-hover:opacity-100">
              <Check size={11} strokeWidth={3} className="hidden group-hover:block" />
            </div>
          </motion.button>
        ))}
      </div>

      {question.skipAllowed !== false && onSkip && (
        <button
          onClick={onSkip}
          className="mt-6 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer py-1.5 px-3 rounded-lg hover:bg-[var(--bg-elevated)]"
        >
          Skip this step &rarr;
        </button>
      )}
    </div>
  );
};
