"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { QuestionDef } from '@/lib/cde/questionConfig';
import { motion } from 'framer-motion';
import { Building2, Search, Check, Sparkles, ArrowRight } from 'lucide-react';

interface SearchCardProps {
  question: QuestionDef;
  onAnswer: (value: string) => void;
  onSkip?: () => void;
}

const DEFAULT_POPULAR_COMPANIES = [
  'Hexaware Technologies',
  'Investis Digital',
  'Cybage Software',
  'Google',
  'Microsoft',
  'Amazon',
  'TCS',
  'Infosys',
];

export const SearchCard = ({ question, onAnswer, onSkip }: SearchCardProps) => {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState('');

  const companyList = useMemo(() => {
    if (question.options && question.options.length > 0) {
      return question.options.map((o) => o.label);
    }
    return DEFAULT_POPULAR_COMPANIES;
  }, [question.options]);

  const filteredResults = useMemo(() => {
    if (!query.trim() || selected === query) return [];
    return companyList.filter((c) =>
      c.toLowerCase().includes(query.trim().toLowerCase())
    );
  }, [companyList, query, selected]);

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

      {/* Suggested Quick Selection Chips */}
      <div className="w-full max-w-md mb-4 flex flex-wrap gap-2 justify-center">
        {companyList.slice(0, 6).map((comp) => {
          const isSelected = selected === comp || query === comp;
          return (
            <motion.button
              key={comp}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setSelected(comp);
                setQuery(comp);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-amber-500 text-brand-navy border-amber-500 shadow-sm'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border)] hover:border-amber-500/50 hover:text-[var(--text-primary)]'
              }`}
            >
              <Building2 size={12} />
              <span>{comp}</span>
              {isSelected && <Check size={12} strokeWidth={3} />}
            </motion.button>
          );
        })}
      </div>

      {/* Search Input Box */}
      <div className="max-w-md mx-auto w-full relative">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected('');
            }}
            placeholder="Or type custom employer name..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] text-sm font-semibold text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-amber-500/30 shadow-xs"
          />
        </div>

        {/* Dropdown Results */}
        {filteredResults.length > 0 && (
          <ul className="absolute z-20 w-full mt-2 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl max-h-48 overflow-y-auto text-left p-1.5">
            {filteredResults.map((comp) => (
              <li
                key={comp}
                onClick={() => {
                  setSelected(comp);
                  setQuery(comp);
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer text-xs font-bold transition-colors"
              >
                <Building2 size={13} className="text-amber-500" />
                <span>{comp}</span>
              </li>
            ))}
          </ul>
        )}
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
          onClick={() => onAnswer(selected || query.trim())}
          disabled={!query.trim()}
          className="ml-auto inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl font-black text-xs text-brand-navy bg-amber-500 hover:bg-amber-400 transition-all shadow-md shadow-amber-500/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          <span>Continue</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};
