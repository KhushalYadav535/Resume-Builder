"use client";

import React, { useMemo } from 'react';
import { useExperienceCDE } from '@/context/ExperienceCDEContext';
import { cn } from '@/components/cde/CDEContainer';

const UNIVERSAL_TAGS = [
  'Save time', 'Save money', 'Fix a recurring problem', 
  'Get thanked or recognized', 'Train or mentor someone', 
  'Launch something new', 'Handle a crisis'
];

const FRAME_TAGS: Record<string, string[]> = {
  'Building/Creating': ['Ship a feature/product', 'Design a new process', 'Build from scratch (0→1)', 'Improve reliability/quality'],
  'Managing/Leading': ['Grow or restructure a team', 'Set goals others hit', 'Resolve team conflict', 'Improve a team metric'],
  'Fixing/Improving': ['Reduce errors/defects', 'Cut turnaround time', 'Automate a manual task', 'Improve a broken process'],
  'Selling/Growing': ['Hit or beat a target', 'Win a new account/client', 'Grow revenue or usage', 'Expand into new market/segment'],
  'Supporting/Helping': ['Improve customer satisfaction', 'Resolve escalations', 'Reduce complaint volume', 'Improve response time'],
  'Analyzing/Advising': ['Identify a costly problem', 'Build a report/dashboard used by others', 'Influence a decision with data', 'Forecast or predict something accurately']
};

export const Card4Achievements = () => {
  const { roleData, setAchievementTags, nextCard } = useExperienceCDE();
  const selected = roleData.achievement_tags;

  // Compute available tags based on selected role frames
  const availableTags = useMemo(() => {
    const tags = new Set<string>(UNIVERSAL_TAGS);
    roleData.role_frame.forEach(frame => {
      if (FRAME_TAGS[frame]) {
        FRAME_TAGS[frame].forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags);
  }, [roleData.role_frame]);

  const toggleTag = (tag: string) => {
    if (selected.includes(tag)) {
      setAchievementTags(selected.filter(t => t !== tag));
    } else {
      setAchievementTags([...selected, tag]);
    }
  };

  return (
    <div className="flex flex-col h-full w-full items-center text-center">
      <h2 className="text-2xl font-semibold mb-2 text-neutral-900 dark:text-neutral-100">
        Did you...
      </h2>
      <p className="text-neutral-500 mb-8 max-w-sm">
        Select anything that applies to what you did in this role.
      </p>
      
      <div className="flex flex-wrap gap-2 justify-center mb-12 max-w-lg">
        {availableTags.map(tag => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={cn(
              "px-4 py-2 rounded-full border-2 transition-all font-medium text-sm",
              selected.includes(tag)
                ? "bg-pink-500 border-pink-500 text-white shadow-md"
                : "border-neutral-200 dark:border-neutral-800 hover:border-pink-300 dark:hover:border-pink-700 bg-transparent text-neutral-700 dark:text-neutral-300"
            )}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
        <button
          onClick={nextCard}
          disabled={selected.length === 0}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white py-4 rounded-full font-medium disabled:opacity-50 transition-colors"
        >
          Continue
        </button>
        <button
          onClick={nextCard}
          className="text-neutral-800 dark:text-neutral-200 font-medium transition-colors hover:opacity-70 mt-2"
        >
          Skip (None of these)
        </button>
      </div>
    </div>
  );
};
