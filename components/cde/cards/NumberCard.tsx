"use client";

import React, { useState } from 'react';
import { QuestionDef } from '@/lib/cde/questionConfig';

interface NumberCardProps {
  question: QuestionDef;
  onAnswer: (value: number) => void;
  onSkip?: () => void;
}

export const NumberCard = ({ question, onAnswer, onSkip }: NumberCardProps) => {
  const [value, setValue] = useState<number | ''>('');

  return (
    <div className="flex flex-col h-full justify-center">
      <h2 className="text-3xl font-medium mb-12 text-center text-neutral-900 dark:text-neutral-100">
        {question.question}
      </h2>

      <div className="flex flex-col items-center max-w-sm mx-auto w-full">
        <input 
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value === '' ? '' : Number(e.target.value))}
          placeholder="0"
          className="w-full text-center text-6xl font-bold text-uprole-blue bg-transparent border-b-4 border-neutral-200 dark:border-neutral-800 focus:border-uprole-blue outline-none pb-4 transition-colors"
        />
      </div>

      <div className="flex items-center justify-between mt-16">
        {question.skipAllowed !== false && onSkip && (
          <button
            onClick={onSkip}
            className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 font-medium transition-colors"
          >
            Skip for now
          </button>
        )}
        <button
          onClick={() => onAnswer(value as number)}
          disabled={value === ''}
          className="ml-auto bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 px-8 py-3 rounded-full font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          Continue
        </button>
      </div>
    </div>
  );
};
