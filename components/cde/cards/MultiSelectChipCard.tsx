"use client";

import React, { useState } from 'react';
import { QuestionDef } from '@/lib/cde/questionConfig';
import { cn } from '../CDEContainer';

interface MultiSelectChipCardProps {
  question: QuestionDef;
  onAnswer: (value: string[]) => void;
  onSkip?: () => void;
}

// A mock list of common skills for demonstration
const SUGGESTED_CHIPS = [
  'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 
  'Python', 'Java', 'AWS', 'Docker', 'Figma', 'UI/UX', 'SQL'
];

export const MultiSelectChipCard = ({ question, onAnswer, onSkip }: MultiSelectChipCardProps) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [inputValue, setInputValue] = useState('');

  const toggleChip = (chip: string) => {
    const newSet = new Set(selected);
    if (newSet.has(chip)) {
      newSet.delete(chip);
    } else {
      newSet.add(chip);
    }
    setSelected(newSet);
  };

  const handleAddCustom = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      toggleChip(inputValue.trim());
      setInputValue('');
    }
  };

  const handleContinue = () => {
    onAnswer(Array.from(selected));
  };

  return (
    <div className="flex flex-col h-full items-center text-center">
      <h2 className="text-2xl font-semibold mb-8 text-neutral-900 dark:text-neutral-100 max-w-sm">
        {question.question}
      </h2>
      
      {question.helpText && (
        <p className="text-neutral-500 mb-6">{question.helpText}</p>
      )}

      <div className="flex-1">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleAddCustom}
          placeholder="Type a skill and press Enter"
          className="w-full p-4 mb-6 rounded-xl border-2 border-neutral-200 dark:border-neutral-800 bg-transparent outline-none focus:border-blue-500 transition-colors text-lg"
        />

        <div className="flex flex-wrap gap-2 justify-center">
          {SUGGESTED_CHIPS.map(chip => (
            <button
              key={chip}
              onClick={() => toggleChip(chip)}
              className={cn(
                "px-6 py-3 rounded-full border-2 transition-all font-medium text-lg",
                selected.has(chip)
                  ? "bg-uprole-blue border-uprole-blue text-white shadow-md"
                  : "border-neutral-200 dark:border-neutral-800 hover:border-uprole-blue/60 bg-transparent"
              )}
            >
              {chip}
            </button>
          ))}
          {/* Custom chips not in suggested list */}
          {Array.from(selected).filter(c => !SUGGESTED_CHIPS.includes(c)).map(chip => (
            <button
              key={chip}
              onClick={() => toggleChip(chip)}
              className="px-6 py-3 rounded-full border-2 transition-all font-medium text-lg bg-uprole-blue border-uprole-blue text-white shadow-md"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 mt-12 w-full max-w-sm mx-auto">
        <button
          onClick={handleContinue}
          disabled={selected.size === 0}
          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-brand-navy py-4 rounded-full font-bold text-lg disabled:opacity-50 transition-all shadow-md shadow-amber-500/20"
        >
          Continue
        </button>
        {question.skipAllowed !== false && onSkip && (
          <button
            onClick={onSkip}
            className="text-neutral-800 dark:text-neutral-200 font-medium transition-colors hover:opacity-70"
          >
            Skip question
          </button>
        )}
      </div>
    </div>
  );
};
