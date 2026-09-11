"use client";

import React, { useState } from 'react';
import { QuestionDef } from '@/lib/cde/questionConfig';

interface SliderCardProps {
  question: QuestionDef;
  onAnswer: (value: number) => void;
  onSkip?: () => void;
}

export const SliderCard = ({ question, onAnswer, onSkip }: SliderCardProps) => {
  const [value, setValue] = useState(5);

  const minLabel = question.options?.[0]?.label || '0';
  const maxLabel = question.options?.[1]?.label || '10+';

  return (
    <div className="flex flex-col h-full justify-center">
      <h2 className="text-3xl font-medium mb-12 text-center text-neutral-900 dark:text-neutral-100">
        {question.question}
      </h2>

      <div className="flex flex-col items-center max-w-md mx-auto w-full">
        <div className="text-6xl font-bold text-blue-600 mb-8">
          {value}
        </div>
        
        <input 
          type="range"
          min="0"
          max="20"
          value={value}
          onChange={(e) => setValue(parseInt(e.target.value))}
          className="w-full h-3 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        
        <div className="flex justify-between w-full mt-4 text-neutral-500 font-medium text-lg">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
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
          onClick={() => onAnswer(value)}
          className="ml-auto bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 px-8 py-3 rounded-full font-medium hover:opacity-90 transition-opacity"
        >
          Continue
        </button>
      </div>
    </div>
  );
};
