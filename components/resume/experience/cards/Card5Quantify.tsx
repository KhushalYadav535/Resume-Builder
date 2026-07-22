"use client";

import React, { useMemo, useState } from 'react';
import { useExperienceCDE } from '@/context/ExperienceCDEContext';
import { cn } from '@/components/cde/CDEContainer';

// Quantify chip logic mapping
const QUANTIFY_CHIPS: Record<string, string[]> = {
  'percentage': ['<10%', '10–25%', '25–50%', '50%+'],
  'currency': ['<₹1L', '₹1L–10L', '₹10L–1Cr', '₹1Cr+'],
  'scale': ['Solo', '2–5 people', '6–15 people', '16+ people'],
  'frequency': ['One-time', 'Few times', 'Ongoing/Recurring'],
  'source': ['Manager', 'Client/Customer', 'Peer/Team', 'Leadership/Org-wide']
};

const getChipTypeForTag = (tag: string): string => {
  const t = tag.toLowerCase();
  if (t.includes('time') || t.includes('response')) return 'percentage';
  if (t.includes('money') || t.includes('revenue') || t.includes('target')) return 'currency';
  if (t.includes('mentor') || t.includes('team') || t.includes('conflict')) return 'scale';
  if (t.includes('recurring') || t.includes('crisis')) return 'frequency';
  if (t.includes('thanked') || t.includes('account')) return 'source';
  return 'percentage'; // fallback
};

export const Card5Quantify = () => {
  const { roleData, updateAchievementDetail, nextCard } = useExperienceCDE();
  const tags = roleData.achievement_tags;
  
  // We paginate through the selected tags if there are multiple
  const [currentTagIndex, setCurrentTagIndex] = useState(0);

  if (tags.length === 0) {
    // If no tags selected in Card 4, skip Card 5 completely.
    // In a real flow, the CDEContainer would handle skipping this render, but we can just auto-forward.
    setTimeout(() => nextCard(), 0);
    return null;
  }

  const currentTag = tags[currentTagIndex];
  const chipType = getChipTypeForTag(currentTag);
  const options = QUANTIFY_CHIPS[chipType];
  
  const currentDetail = roleData.achievement_details.find(d => d.tag === currentTag);
  const selectedRange = currentDetail?.range_or_scale || null;
  const scopeNote = currentDetail?.scope_note || '';

  const handleSelect = (val: string) => {
    updateAchievementDetail({
      tag: currentTag,
      range_or_scale: val,
      scope_note: scopeNote
    });
  };

  const handleNext = () => {
    if (currentTagIndex < tags.length - 1) {
      setCurrentTagIndex(prev => prev + 1);
    } else {
      nextCard();
    }
  };

  return (
    <div className="flex flex-col h-full w-full items-center text-center">
      <h2 className="text-xl font-medium mb-1 text-neutral-500">
        Let's add some detail to:
      </h2>
      <h3 className="text-2xl font-bold mb-8 text-neutral-900 dark:text-neutral-100">
        "{currentTag}"
      </h3>
      
      <div className="flex flex-col gap-3 w-full max-w-sm mb-6">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => handleSelect(opt)}
            className={cn(
              "w-full p-4 rounded-full border-2 transition-all font-medium text-lg",
              selectedRange === opt
                ? "bg-pink-500 border-pink-500 text-white shadow-md"
                : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 bg-transparent text-neutral-700 dark:text-neutral-300"
            )}
          >
            {opt}
          </button>
        ))}
      </div>

      <div className="w-full max-w-sm mb-12">
        <input 
          type="text" 
          value={scopeNote}
          onChange={(e) => updateAchievementDetail({
            tag: currentTag,
            range_or_scale: selectedRange || options[0],
            scope_note: e.target.value
          })}
          placeholder="Add a quick note (e.g. 'APAC region') - optional"
          className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent focus:border-pink-500 outline-none text-sm text-center"
        />
      </div>

      <div className="flex items-center justify-between w-full max-w-sm">
        <button
          onClick={handleNext}
          className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 font-medium transition-colors"
        >
          Skip this detail
        </button>
        <button
          onClick={handleNext}
          disabled={!selectedRange}
          className="bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 px-8 py-3 rounded-full font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          {currentTagIndex < tags.length - 1 ? 'Next Detail' : 'Continue'}
        </button>
      </div>
    </div>
  );
};
