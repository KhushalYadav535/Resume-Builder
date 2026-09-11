"use client";

import React, { useState } from 'react';
import { QuestionDef } from '@/lib/cde/questionConfig';
import { Loader2 } from 'lucide-react';

interface AIChatCardProps {
  question: QuestionDef;
  onAnswer: (value: string, extractedFacts?: any) => void;
  onSkip?: () => void;
}

export const AIChatCard = ({ question, onAnswer, onSkip }: AIChatCardProps) => {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleContinue = async () => {
    if (!text.trim()) return;
    
    setIsAnalyzing(true);
    try {
      // We will call the AI inference API here
      const res = await fetch('/api/cde/inference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text, 
          promptHint: question.aiHint 
        })
      });

      if (!res.ok) throw new Error("Failed to extract facts");

      const data = await res.json();
      
      // Pass both the raw text and the extracted facts
      onAnswer(text, data.facts);
    } catch (error) {
      console.error("Inference error", error);
      // Fallback
      onAnswer(text);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-3xl font-medium mb-4 text-neutral-900 dark:text-neutral-100">
        {question.question}
      </h2>
      
      {question.helpText && (
        <p className="text-neutral-500 mb-6">{question.helpText}</p>
      )}

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type or dictate your answer here..."
        className="w-full h-48 p-4 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 bg-transparent outline-none focus:border-blue-500 transition-colors text-lg resize-none"
      />

      <div className="flex items-center justify-between mt-8">
        {question.skipAllowed !== false && onSkip && (
          <button
            onClick={onSkip}
            disabled={isAnalyzing}
            className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 font-medium transition-colors disabled:opacity-50"
          >
            Skip for now
          </button>
        )}
        <button
          onClick={handleContinue}
          disabled={text.trim().length === 0 || isAnalyzing}
          className="ml-auto flex items-center gap-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 px-8 py-3 rounded-full font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Continue'
          )}
        </button>
      </div>
    </div>
  );
};
