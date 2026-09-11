"use client";

import React, { useState, useEffect } from 'react';
import { QuestionDef } from '@/lib/cde/questionConfig';

interface SearchCardProps {
  question: QuestionDef;
  onAnswer: (value: string) => void;
  onSkip?: () => void;
}

const MOCK_COMPANIES = ['Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Netflix', 'TCS', 'Infosys', 'Wipro'];

export const SearchCard = ({ question, onAnswer, onSkip }: SearchCardProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => {
      // Mock search logic
      const filtered = MOCK_COMPANIES.filter(c => c.toLowerCase().includes(query.toLowerCase()));
      setResults(filtered);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="flex flex-col h-full justify-center">
      <h2 className="text-3xl font-medium mb-4 text-center text-neutral-900 dark:text-neutral-100">
        {question.question}
      </h2>
      
      {question.helpText && (
        <p className="text-center text-neutral-500 mb-8">{question.helpText}</p>
      )}

      <div className="max-w-md mx-auto w-full relative">
        <input 
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(''); // clear selection on edit
          }}
          placeholder="Start typing..."
          className="w-full p-4 rounded-xl border-2 border-neutral-200 dark:border-neutral-800 bg-transparent text-lg focus:border-blue-500 outline-none"
        />

        {results.length > 0 && !selected && (
          <ul className="absolute z-10 w-full mt-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg max-h-60 overflow-y-auto">
            {results.map(res => (
              <li 
                key={res} 
                onClick={() => {
                  setSelected(res);
                  setQuery(res);
                  setResults([]);
                }}
                className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer text-lg border-b border-neutral-100 dark:border-neutral-800 last:border-0"
              >
                {res}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between mt-16 max-w-md w-full mx-auto">
        {question.skipAllowed !== false && onSkip && (
          <button
            onClick={onSkip}
            className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 font-medium transition-colors"
          >
            Skip for now
          </button>
        )}
        <button
          onClick={() => onAnswer(selected || query)} // Allow custom input if not selected from list
          disabled={!query}
          className="ml-auto bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 px-8 py-3 rounded-full font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          Continue
        </button>
      </div>
    </div>
  );
};
