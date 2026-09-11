"use client";

import React, { useState } from 'react';
import { SkillItem } from '@/types/uprole-cde';
import { cn } from '@/components/cde/CDEContainer';
import { Plus, X } from 'lucide-react';

const SUGGESTED_SKILLS = [
  'JavaScript', 'React', 'Node.js', 'Python', 'SQL', 
  'AWS', 'TypeScript', 'Docker', 'GraphQL', 'Tailwind CSS'
];

export const SkillsForm = ({
  initialSkills = [],
  onSave
}: {
  initialSkills?: string[];
  onSave?: (technicalSkills: string[]) => void;
}) => {
  const [skills, setSkills] = useState<SkillItem[]>(
    initialSkills.map(name => ({ name, source: 'custom', proficiency: null }))
  );
  const [customInput, setCustomInput] = useState('');

  const toggleSuggestedSkill = (name: string) => {
    const existing = skills.find(s => s.name === name);
    if (existing) {
      setSkills(skills.filter(s => s.name !== name));
    } else {
      setSkills([...skills, { name, source: 'suggested', proficiency: null }]);
    }
  };

  const addCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    
    if (!skills.find(s => s.name.toLowerCase() === customInput.toLowerCase())) {
      setSkills([...skills, { name: customInput.trim(), source: 'custom', proficiency: null }]);
    }
    setCustomInput('');
  };

  const removeSkill = (name: string) => {
    setSkills(skills.filter(s => s.name !== name));
  };

  const setProficiency = (name: string, level: SkillItem['proficiency']) => {
    setSkills(skills.map(s => s.name === name ? { ...s, proficiency: level } : s));
  };

  return (
    <div className="flex flex-col min-h-[90vh] max-w-2xl mx-auto w-full px-4 py-8 bg-neutral-100 dark:bg-neutral-950/50 rounded-t-3xl">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold mb-2 text-neutral-900 dark:text-neutral-100">Skills</h1>
        <p className="text-neutral-500">Tap to add skills, or type your own.</p>
      </header>

      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-800 mb-8">
        <h2 className="text-sm font-medium text-neutral-500 mb-4 uppercase tracking-wider">Suggested for you</h2>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_SKILLS.map(skill => {
            const isSelected = skills.some(s => s.name === skill);
            return (
              <button
                key={skill}
                onClick={() => toggleSuggestedSkill(skill)}
                className={cn(
                  "px-4 py-2 rounded-full border-2 transition-all font-medium text-sm",
                  isSelected 
                    ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                    : "border-neutral-200 dark:border-neutral-800 hover:border-blue-300 dark:hover:border-blue-700 bg-transparent text-neutral-700 dark:text-neutral-300"
                )}
              >
                {skill}
              </button>
            )
          })}
        </div>

        <form onSubmit={addCustomSkill} className="mt-6 flex gap-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="+ Add custom skill..."
            className="flex-1 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:border-blue-500 outline-none"
          />
          <button 
            type="submit"
            disabled={!customInput.trim()}
            className="px-4 py-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl font-medium disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
          </button>
        </form>
      </div>

      {skills.length > 0 && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-800">
          <h2 className="text-sm font-medium text-neutral-500 mb-4 uppercase tracking-wider">Your Skills Tray ({skills.length})</h2>
          
          <div className="flex flex-col gap-3">
            {skills.map(skill => (
              <div key={skill.name} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-950 rounded-2xl border border-neutral-100 dark:border-neutral-800 gap-4">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => removeSkill(skill.name)}
                    className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full text-neutral-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <span className="font-semibold text-lg">{skill.name}</span>
                </div>
                
                <div className="flex items-center gap-2 bg-white dark:bg-neutral-900 p-1 rounded-full border border-neutral-200 dark:border-neutral-800">
                  {(['Familiar', 'Proficient', 'Expert'] as const).map(level => (
                    <button
                      key={level}
                      onClick={() => setProficiency(skill.name, level)}
                      className={cn(
                        "px-4 py-1.5 rounded-full text-xs font-medium transition-colors",
                        skill.proficiency === level 
                          ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-sm"
                          : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      )}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-auto pt-8">
        <button
          onClick={() => {
            if (onSave) onSave(skills.map(s => s.name));
            else alert("Skills saved!");
          }}
          disabled={skills.length === 0}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-full font-semibold text-lg transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50"
        >
          Save Skills
        </button>
      </div>
    </div>
  );
};
