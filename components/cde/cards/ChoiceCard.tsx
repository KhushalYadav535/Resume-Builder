"use client";

import React from 'react';
import { QuestionDef } from '@/lib/cde/questionConfig';

interface ChoiceCardProps {
  question: QuestionDef;
  onAnswer: (value: string) => void;
  onSkip?: () => void;
}

export const ChoiceCard = ({ question, onAnswer, onSkip }: ChoiceCardProps) => {
  return (
    <div className="flex flex-col h-full items-center text-center">
      <h2 className="text-2xl font-semibold mb-8 text-neutral-900 dark:text-neutral-100 max-w-sm">
        {question.question}
      </h2>
      
      {question.helpText && (
        <p className="text-neutral-500 mb-6">{question.helpText}</p>
      )}

      <div className="flex flex-col gap-3 w-full">
        {question.options?.map((option) => (
          <button
            key={option.value}
            onClick={() => onAnswer(option.value)}
            className="w-full p-4 rounded-full bg-blue-50/60 hover:bg-blue-100/80 dark:bg-uprole-blue/10 dark:hover:bg-uprole-blue/20 text-uprole-blue dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/40 transition-all text-lg font-medium shadow-sm hover:shadow"
          >
            {option.label}
          </button>
        ))}
      </div>

      {question.skipAllowed !== false && onSkip && (
        <button
          onClick={onSkip}
          className="mt-6 text-neutral-800 dark:text-neutral-200 font-medium transition-colors hover:opacity-70"
        >
          Skip question
        </button>
      )}
    </div>
  );
};
