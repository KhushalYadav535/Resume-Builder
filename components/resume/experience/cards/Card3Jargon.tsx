"use client";

import React, { useState } from 'react';
import { useExperienceCDE } from '@/context/ExperienceCDEContext';
import { Loader2 } from 'lucide-react';

export const Card3Jargon = () => {
  const { roleData, setJargonCheck, approveJargonRewrite, nextCard } = useExperienceCDE();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedYesNo, setSelectedYesNo] = useState<boolean | null>(null);

  const handleNo = async () => {
    setSelectedYesNo(false);
    setIsGenerating(true);
    // Simulate AI rewrite (In production, call an API)
    setTimeout(() => {
      setJargonCheck(false, "Senior Manager of Operations"); // Example rewrite
      setIsGenerating(false);
    }, 1500);
  };

  const handleYes = () => {
    setSelectedYesNo(true);
    setJargonCheck(true);
    nextCard();
  };

  return (
    <div className="flex flex-col h-full w-full items-center text-center">
      <h2 className="text-2xl font-semibold mb-2 text-neutral-900 dark:text-neutral-100">
        Jargon Check
      </h2>
      <p className="text-neutral-500 mb-8 max-w-sm">
        Would someone outside your company understand your job title <strong>"{roleData.anchor.designation}"</strong> as written?
      </p>
      
      {!isGenerating && !roleData.title_ai_rewrite && (
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={handleYes}
            className="w-full p-4 rounded-full bg-pink-50 hover:bg-pink-100 dark:bg-pink-950/30 dark:hover:bg-pink-900/40 text-pink-700 dark:text-pink-300 transition-all font-medium border border-transparent"
          >
            Yes, it's clear
          </button>
          <button
            onClick={handleNo}
            className="w-full p-4 rounded-full border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all font-medium"
          >
            No, it has internal jargon
          </button>
        </div>
      )}

      {isGenerating && (
        <div className="flex flex-col items-center mt-4">
          <Loader2 className="w-8 h-8 text-pink-500 animate-spin mb-4" />
          <p className="text-neutral-500">Rewriting into plain English...</p>
        </div>
      )}

      {roleData.title_ai_rewrite && !roleData.title_rewrite_approved && (
        <div className="w-full mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-6">
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">Suggested Rewrite</p>
          <p className="text-xl font-semibold mb-6 text-neutral-900 dark:text-neutral-100">
            {roleData.title_ai_rewrite}
          </p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => {
                approveJargonRewrite();
                nextCard();
              }}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium"
            >
              Accept
            </button>
            <button 
              onClick={() => {
                // Reject, just use original
                setJargonCheck(true);
                nextCard();
              }}
              className="px-6 py-2 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded-full font-medium"
            >
              Keep Original
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
