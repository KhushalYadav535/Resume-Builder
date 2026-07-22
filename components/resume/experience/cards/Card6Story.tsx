"use client";

import React, { useMemo } from 'react';
import { useExperienceCDE } from '@/context/ExperienceCDEContext';

const PROMPTS = [
  "What made your manager happiest about this?",
  "What's the one thing about this role you'd tell a friend?",
  "What was the hardest part you got through?",
  "Did anyone specifically thank you for this?"
];

export const Card6Story = () => {
  const { roleData, setStoryLine, nextCard } = useExperienceCDE();
  
  // Randomly select one prompt on mount
  const prompt = useMemo(() => PROMPTS[Math.floor(Math.random() * PROMPTS.length)], []);

  return (
    <div className="flex flex-col h-full w-full items-center text-center">
      <h2 className="text-2xl font-semibold mb-2 text-neutral-900 dark:text-neutral-100">
        Story Time
      </h2>
      <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8 max-w-sm">
        {prompt}
      </p>
      
      <div className="w-full max-w-md mb-8">
        <textarea
          value={roleData.story_line || ''}
          onChange={(e) => setStoryLine(e.target.value)}
          placeholder="Just brain-dump a sentence or two here..."
          className="w-full h-32 p-4 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 bg-transparent focus:border-pink-500 outline-none resize-none text-lg"
        />
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs mx-auto mt-auto">
        <button
          onClick={nextCard}
          disabled={!roleData.story_line?.trim()}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white py-4 rounded-full font-medium disabled:opacity-50 transition-colors shadow-md"
        >
          Generate Bullets
        </button>
        <button
          onClick={() => {
            setStoryLine(null);
            nextCard();
          }}
          className="text-neutral-800 dark:text-neutral-200 font-medium transition-colors hover:opacity-70 mt-2"
        >
          Skip (Generate Now)
        </button>
      </div>
    </div>
  );
};
