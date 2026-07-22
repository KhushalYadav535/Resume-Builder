"use client";

import React from 'react';
import { useExperienceCDE } from '@/context/ExperienceCDEContext';

export const Card1Anchor = () => {
  const { roleData, updateAnchor, nextCard } = useExperienceCDE();
  const { anchor } = roleData;

  const isComplete = anchor.designation && anchor.company && anchor.start_date && anchor.location;

  return (
    <div className="flex flex-col h-full w-full">
      <h2 className="text-2xl font-semibold mb-6 text-neutral-900 dark:text-neutral-100 text-center">
        The Basics
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-500 mb-1">Job Title / Designation</label>
          <input 
            type="text" 
            value={anchor.designation}
            onChange={e => updateAnchor({ designation: e.target.value })}
            placeholder="e.g. Software Engineer"
            className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent focus:border-pink-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-500 mb-1">Company</label>
          <input 
            type="text" 
            value={anchor.company}
            onChange={e => updateAnchor({ company: e.target.value })}
            placeholder="e.g. Acme Corp"
            className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent focus:border-pink-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-500 mb-1">Start Date</label>
            <input 
              type="month" 
              value={anchor.start_date}
              onChange={e => updateAnchor({ start_date: e.target.value })}
              className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent focus:border-pink-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-500 mb-1">End Date</label>
            <input 
              type="month" 
              value={anchor.end_date || ''}
              onChange={e => updateAnchor({ end_date: e.target.value || null })}
              className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent focus:border-pink-500 outline-none"
            />
            <div className="mt-1 flex items-center gap-2">
              <input 
                type="checkbox" 
                id="current" 
                checked={anchor.end_date === null}
                onChange={e => updateAnchor({ end_date: e.target.checked ? null : '' })}
              />
              <label htmlFor="current" className="text-xs text-neutral-500">I currently work here</label>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-500 mb-1">Location</label>
          <input 
            type="text" 
            value={anchor.location}
            onChange={e => updateAnchor({ location: e.target.value })}
            placeholder="e.g. Mumbai, India"
            className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent focus:border-pink-500 outline-none"
          />
        </div>
      </div>

      <button
        onClick={nextCard}
        disabled={!isComplete}
        className="mt-8 w-full bg-pink-500 hover:bg-pink-600 text-white py-4 rounded-full font-medium disabled:opacity-50 transition-colors"
      >
        Continue
      </button>
    </div>
  );
};
