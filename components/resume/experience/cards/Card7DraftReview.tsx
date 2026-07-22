"use client";

import React, { useEffect, useState } from 'react';
import { useExperienceCDE } from '@/context/ExperienceCDEContext';
import { Check, X, Edit2, Loader2, Save } from 'lucide-react';
import { cn } from '@/components/cde/CDEContainer';

export const Card7DraftReview = () => {
  const { roleData, setGeneratedBullets, updateBulletStatus, onComplete } = useExperienceCDE();
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const bullets = roleData.generated_bullets;

  useEffect(() => {
    if (bullets.length > 0) return;

    const generateBullets = async () => {
      setIsGenerating(true);
      try {
        const res = await fetch('/api/builder/assemble-bullets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role_id: roleData.role_id,
            role_frame: roleData.role_frame,
            achievement_tags: roleData.achievement_tags,
            achievement_details: roleData.achievement_details,
            story_line: roleData.story_line,
            title_context: {
              designation: roleData.anchor.designation,
              clarified_title: roleData.title_ai_rewrite
            }
          })
        });

        if (!res.ok) throw new Error("Failed to generate");
        const data = await res.json();
        
        // Add local UI state fields
        const formattedBullets = data.bullets.map((b: any) => ({
          ...b,
          id: Math.random().toString(36).substr(2, 9),
          status: 'pending'
        }));
        
        setGeneratedBullets(formattedBullets);
      } catch (err) {
        console.error(err);
      } finally {
        setIsGenerating(false);
      }
    };

    generateBullets();
  }, [bullets.length, roleData, setGeneratedBullets]);

  const handleEditSave = (id: string) => {
    updateBulletStatus(id, 'edited', editValue);
    setEditingId(null);
  };

  const isAllReviewed = bullets.length > 0 && bullets.every(b => b.status !== 'pending');

  if (isGenerating) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center text-center py-12">
        <Loader2 className="w-12 h-12 text-pink-500 animate-spin mb-6" />
        <h2 className="text-2xl font-semibold mb-2">Drafting your experience...</h2>
        <p className="text-neutral-500">Combining your tags, numbers, and stories.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full items-center">
      <h2 className="text-2xl font-semibold mb-2 text-neutral-900 dark:text-neutral-100 text-center">
        Review Drafts
      </h2>
      <p className="text-neutral-500 mb-8 text-center max-w-sm">
        Nothing goes on your resume without your approval. Accept, edit, or discard these bullet points.
      </p>
      
      <div className="flex flex-col gap-4 w-full mb-12">
        {bullets.map(bullet => (
          <div 
            key={bullet.id}
            className={cn(
              "p-5 rounded-2xl border-2 transition-all w-full",
              bullet.status === 'accepted' ? "border-green-500 bg-green-50 dark:bg-green-950/20" :
              bullet.status === 'discarded' ? "border-neutral-200 opacity-50 bg-neutral-50" :
              "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm"
            )}
          >
            {editingId === bullet.id ? (
              <div className="flex flex-col gap-3">
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent text-sm min-h-[80px]"
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setEditingId(null)} className="text-neutral-500 text-sm">Cancel</button>
                  <button onClick={() => handleEditSave(bullet.id)} className="flex items-center gap-1 bg-neutral-900 text-white px-3 py-1.5 rounded-lg text-sm">
                    <Save className="w-4 h-4" /> Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className={cn("text-neutral-800 dark:text-neutral-200 text-lg mb-4", bullet.status === 'discarded' && "line-through")}>
                  {bullet.text}
                </p>
                
                {bullet.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => updateBulletStatus(bullet.id, 'accepted')}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl font-medium transition-colors"
                    >
                      <Check className="w-4 h-4" /> Accept
                    </button>
                    <button 
                      onClick={() => {
                        setEditValue(bullet.text);
                        setEditingId(bullet.id);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-medium transition-colors"
                    >
                      <Edit2 className="w-4 h-4" /> Edit
                    </button>
                    <button 
                      onClick={() => updateBulletStatus(bullet.id, 'discarded')}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-medium transition-colors"
                    >
                      <X className="w-4 h-4" /> Discard
                    </button>
                  </div>
                )}
                {bullet.status !== 'pending' && (
                  <div className="flex justify-end">
                     <button 
                      onClick={() => updateBulletStatus(bullet.id, 'pending')}
                      className="text-xs text-neutral-400 hover:text-neutral-700 underline"
                    >
                      Undo
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <button
        disabled={!isAllReviewed}
        onClick={() => {
           const acceptedBullets = bullets.filter(b => b.status === 'accepted' || b.status === 'edited').map(b => b.text);
           if (onComplete) {
             onComplete(acceptedBullets);
           } else {
             alert("Role saved to resume!");
             window.location.href = '/resume-builder';
           }
        }}
        className="w-full max-w-xs mx-auto bg-pink-500 hover:bg-pink-600 text-white py-4 rounded-full font-medium disabled:opacity-50 transition-colors"
      >
        Finish Role Entry
      </button>
    </div>
  );
};
