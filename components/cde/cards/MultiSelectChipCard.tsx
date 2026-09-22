"use client";

import React, { useState, useMemo } from 'react';
import { QuestionDef } from '@/lib/cde/questionConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, X, Sparkles, Search } from 'lucide-react';

interface MultiSelectChipCardProps {
  question: QuestionDef;
  onAnswer: (value: string[]) => void;
  onSkip?: () => void;
}

const DEFAULT_FALLBACK_CHIPS = [
  '.NET Core', 'C#', 'AngularJS', 'TypeScript', 'React', 'Next.js',
  'Node.js', 'Python', 'SQL Server', 'Azure Cloud', 'Docker', 'Agile Scrum'
];

export const MultiSelectChipCard = ({ question, onAnswer, onSkip }: MultiSelectChipCardProps) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const availableOptions: string[] = useMemo(() => {
    if (question.options && question.options.length > 0) {
      return question.options.map((o) => o.label);
    }
    return DEFAULT_FALLBACK_CHIPS;
  }, [question.options]);

  const filteredChips = useMemo(() => {
    if (!searchTerm.trim()) return availableOptions;
    return availableOptions.filter((c) =>
      c.toLowerCase().includes(searchTerm.trim().toLowerCase())
    );
  }, [availableOptions, searchTerm]);

  const toggleChip = (chip: string) => {
    const newSet = new Set(selected);
    if (newSet.has(chip)) {
      newSet.delete(chip);
    } else {
      if (newSet.size < 12) {
        newSet.add(chip);
      }
    }
    setSelected(newSet);
  };

  const handleAddCustom = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      toggleChip(inputValue.trim());
      setInputValue('');
    }
  };

  const handleContinue = () => {
    onAnswer(Array.from(selected));
  };

  return (
    <div className="flex flex-col h-full items-center text-center">
      {/* Category Pill */}
      {question.title && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-[11px] font-black uppercase tracking-wider mb-3">
          <Sparkles size={12} />
          <span>{question.title}</span>
        </div>
      )}

      <h2 className="text-xl sm:text-2xl font-bold mb-2 text-[var(--text-primary)] max-w-lg font-['Syne',sans-serif] tracking-tight">
        {question.question}
      </h2>

      {question.helpText && (
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-5 max-w-md leading-relaxed">
          {question.helpText}
        </p>
      )}

      {/* Selected Chips Strip */}
      {selected.size > 0 && (
        <div className="w-full max-w-lg mb-4 p-3 rounded-2xl bg-amber-500/[0.07] border border-amber-500/20 flex flex-wrap items-center gap-1.5 justify-center">
          <span className="text-[11px] font-black text-amber-700 dark:text-amber-300 uppercase tracking-wider mr-1">
            Selected ({selected.size}):
          </span>
          <AnimatePresence>
            {Array.from(selected).map((chip) => (
              <motion.button
                key={chip}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={() => toggleChip(chip)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-brand-navy shadow-xs hover:bg-amber-400 transition-all cursor-pointer"
              >
                <span>{chip}</span>
                <X size={12} />
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Search & Custom Input Bar */}
      <div className="w-full max-w-lg mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search suggested technologies..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-xs placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          />
        </div>
        <div className="relative flex-1">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleAddCustom}
            placeholder="Or type custom & press Enter..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-xs placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          />
        </div>
      </div>

      {/* Suggested Chips Grid */}
      <div className="flex-1 w-full max-w-lg max-h-52 overflow-y-auto p-1">
        <div className="flex flex-wrap gap-2 justify-center">
          {filteredChips.map((chip) => {
            const isSelected = selected.has(chip);
            return (
              <motion.button
                key={chip}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => toggleChip(chip)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-amber-500 text-brand-navy border-amber-500 shadow-sm'
                    : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border)] hover:border-amber-500/40 hover:text-[var(--text-primary)]'
                }`}
              >
                {isSelected ? <Check size={12} strokeWidth={3} /> : <Plus size={12} />}
                <span>{chip}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col items-center gap-3 mt-6 w-full max-w-sm mx-auto">
        <button
          onClick={handleContinue}
          disabled={selected.size === 0}
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-black text-xs text-brand-navy bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-amber-500/25 cursor-pointer active:scale-[0.98]"
        >
          <span>Continue with {selected.size} Skills</span>
        </button>

        {question.skipAllowed !== false && onSkip && (
          <button
            onClick={onSkip}
            className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            Skip for now &rarr;
          </button>
        )}
      </div>
    </div>
  );
};
