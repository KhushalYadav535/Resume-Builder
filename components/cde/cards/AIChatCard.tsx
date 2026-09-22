"use client";

import React, { useState } from 'react';
import { QuestionDef } from '@/lib/cde/questionConfig';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, ArrowRight, Lightbulb } from 'lucide-react';

interface AIChatCardProps {
  question: QuestionDef;
  onAnswer: (value: string, extractedFacts?: any) => void;
  onSkip?: () => void;
}

const PROMPT_SUGGESTIONS = [
  'Reduced geocoding duplication errors by 40% across 500+ locations',
  'Automated port restriction updates, cutting turnaround from 24 to 6 months',
  'Spearheaded .NET Core Web API refactoring, lowering latency by 35%',
  'Delivered mission-critical vessel compatibility engine on schedule',
];

export const AIChatCard = ({ question, onAnswer, onSkip }: AIChatCardProps) => {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleContinue = async () => {
    if (!text.trim()) return;

    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/cde/inference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          promptHint: question.aiHint,
        }),
      });

      if (!res.ok) throw new Error('Failed to extract facts');

      const data = await res.json();
      onAnswer(text, data.facts);
    } catch (error) {
      console.warn('Inference note:', error);
      onAnswer(text);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full items-center text-center justify-center">
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
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-4 max-w-md leading-relaxed">
          {question.helpText}
        </p>
      )}

      {/* Suggested Prompt Ideas */}
      <div className="w-full max-w-lg mb-3 text-left">
        <div className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1 mb-1.5">
          <Lightbulb size={11} className="text-amber-500" />
          <span>Quick Inspiration (Click to fill):</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PROMPT_SUGGESTIONS.map((sug, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setText(sug)}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] hover:bg-amber-500/10 border border-[var(--border)] hover:border-amber-500/40 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer truncate max-w-full"
            >
              &ldquo;{sug.slice(0, 48)}...&rdquo;
            </button>
          ))}
        </div>
      </div>

      {/* Textarea */}
      <div className="w-full max-w-lg relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="e.g. Led technical delivery of the geocoding engine using .NET Core and AngularJS, achieving a 40% reduction in duplication errors..."
          className="w-full p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] text-xs sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-amber-500/30 resize-none shadow-xs"
        />
        <div className="absolute right-3 bottom-3 text-[10px] font-bold text-[var(--text-muted)]">
          {text.length} chars
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 w-full max-w-lg mx-auto">
        {question.skipAllowed !== false && onSkip && (
          <button
            onClick={onSkip}
            disabled={isAnalyzing}
            className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            Skip for now &rarr;
          </button>
        )}
        <button
          onClick={handleContinue}
          disabled={text.trim().length === 0 || isAnalyzing}
          className="ml-auto inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs text-brand-navy bg-amber-500 hover:bg-amber-400 transition-all shadow-md shadow-amber-500/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {isAnalyzing ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              <span>Analyzing Impact...</span>
            </>
          ) : (
            <>
              <span>Extract & Continue</span>
              <ArrowRight size={13} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
