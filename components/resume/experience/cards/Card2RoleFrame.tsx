"use client";

import React from 'react';
import { useExperienceCDE } from '@/context/ExperienceCDEContext';
import { cn } from '@/components/cde/CDEContainer'; // Using the existing cn util

const FRAMES = [
  'Building/Creating',
  'Managing/Leading',
  'Fixing/Improving',
  'Selling/Growing',
  'Supporting/Helping',
  'Analyzing/Advising'
];

export const Card2RoleFrame = () => {
  const { roleData, setRoleFrame, nextCard } = useExperienceCDE();
  const selected = roleData.role_frame;

  const toggleFrame = (frame: string) => {
    if (selected.includes(frame)) {
      setRoleFrame(selected.filter(f => f !== frame));
    } else {
      setRoleFrame([...selected, frame]);
    }
  };

  return (
    <div className="flex flex-col h-full w-full items-center text-center">
      <h2 className="text-2xl font-semibold mb-2 text-neutral-900 dark:text-neutral-100">
        What was this role mostly about?
      </h2>
      <p className="text-neutral-500 mb-8">Select all that apply.</p>
      
      <div className="flex flex-wrap gap-3 justify-center mb-12">
        {FRAMES.map(frame => (
          <button
            key={frame}
            onClick={() => toggleFrame(frame)}
            className={cn(
              "px-5 py-3 rounded-full border-2 transition-all font-medium",
              selected.includes(frame)
                ? "bg-pink-500 border-pink-500 text-white shadow-md"
                : "border-neutral-200 dark:border-neutral-800 hover:border-pink-300 dark:hover:border-pink-700 bg-transparent text-neutral-700 dark:text-neutral-300"
            )}
          >
            {frame}
          </button>
        ))}
      </div>

      <button
        onClick={nextCard}
        disabled={selected.length === 0}
        className="w-full max-w-xs mx-auto bg-pink-500 hover:bg-pink-600 text-white py-4 rounded-full font-medium disabled:opacity-50 transition-colors"
      >
        Continue
      </button>
    </div>
  );
};
