"use client";

import React, { useState } from 'react';
import { QuestionDef } from '@/lib/cde/questionConfig';

interface TimelineCardProps {
  question: QuestionDef;
  onAnswer: (value: { startYear: string; endYear: string }) => void;
  onSkip?: () => void;
}

export const TimelineCard = ({ question, onAnswer, onSkip }: TimelineCardProps) => {
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => (currentYear - i).toString());

  return (
    <div className="flex flex-col h-full justify-center">
      <h2 className="text-3xl font-medium mb-12 text-center text-neutral-900 dark:text-neutral-100">
        {question.question}
      </h2>

      <div className="flex flex-col md:flex-row gap-6 max-w-xl mx-auto w-full items-center">
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-neutral-500 mb-2">Start Year</label>
          <select 
            value={startYear}
            onChange={(e) => setStartYear(e.target.value)}
            className="w-full p-4 rounded-xl border-2 border-neutral-200 dark:border-neutral-800 bg-transparent text-lg focus:border-blue-500 outline-none"
          >
            <option value="" disabled>Select Year</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div className="hidden md:block w-8 h-1 bg-neutral-200 dark:bg-neutral-800 rounded mt-6"></div>

        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-neutral-500 mb-2">End Year</label>
          <select 
            value={endYear}
            onChange={(e) => setEndYear(e.target.value)}
            className="w-full p-4 rounded-xl border-2 border-neutral-200 dark:border-neutral-800 bg-transparent text-lg focus:border-blue-500 outline-none"
          >
            <option value="" disabled>Select Year</option>
            <option value="Present">Present</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
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
          onClick={() => onAnswer({ startYear, endYear })}
          disabled={!startYear || !endYear}
          className="ml-auto bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 px-8 py-3 rounded-full font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          Continue
        </button>
      </div>
    </div>
  );
};
