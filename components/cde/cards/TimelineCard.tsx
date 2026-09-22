"use client";

import React, { useState } from 'react';
import { QuestionDef } from '@/lib/cde/questionConfig';
import { Calendar, Sparkles, ArrowRight } from 'lucide-react';

interface TimelineCardProps {
  question: QuestionDef;
  onAnswer: (value: { startYear: string; endYear: string }) => void;
  onSkip?: () => void;
}

export const TimelineCard = ({ question, onAnswer, onSkip }: TimelineCardProps) => {
  const currentYear = new Date().getFullYear();
  const [startYear, setStartYear] = useState('2020');
  const [endYear, setEndYear] = useState('Present');

  const years = Array.from({ length: 30 }, (_, i) => (currentYear - i).toString());

  return (
    <div className="flex flex-col h-full items-center text-center justify-center">
      {/* Category Pill */}
      {question.title && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 text-[11px] font-black uppercase tracking-wider mb-3">
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

      <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto w-full items-center p-6 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-sm">
        <div className="flex-1 w-full text-left">
          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
            Start Year
          </label>
          <div className="relative">
            <select
              value={startYear}
              onChange={(e) => setStartYear(e.target.value)}
              className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500/30 cursor-pointer"
            >
              <option value="" disabled>Select Year</option>
              {years.map((y) => (
                <option key={y} value={y} className="bg-[var(--card)]">
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="hidden sm:flex items-center justify-center text-[var(--text-muted)] pt-5">
          &rarr;
        </div>

        <div className="flex-1 w-full text-left">
          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
            End Year
          </label>
          <div className="relative">
            <select
              value={endYear}
              onChange={(e) => setEndYear(e.target.value)}
              className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500/30 cursor-pointer"
            >
              <option value="" disabled>Select Year</option>
              <option value="Present" className="bg-[var(--card)]">Present (Current)</option>
              {years.map((y) => (
                <option key={y} value={y} className="bg-[var(--card)]">
                  {y}
                </option>
              ))}
            </select>
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
          onClick={() => onAnswer({ startYear, endYear })}
          disabled={!startYear || !endYear}
          className="ml-auto inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl font-black text-xs text-brand-navy bg-amber-500 hover:bg-amber-400 transition-all shadow-md shadow-amber-500/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          <span>Confirm Timeline</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};
