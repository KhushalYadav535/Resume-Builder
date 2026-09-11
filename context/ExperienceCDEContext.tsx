"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ExperienceRoleData, RoleAnchor, AchievementDetail, GeneratedBullet } from '@/types/uprole-cde';

interface ExperienceCDEState {
  currentCardIndex: number;
  roleData: ExperienceRoleData;
  isLoading: boolean;
}

interface ExperienceCDEContextProps extends ExperienceCDEState {
  nextCard: () => void;
  prevCard: () => void;
  updateAnchor: (anchor: Partial<RoleAnchor>) => void;
  setRoleFrame: (frames: string[]) => void;
  setJargonCheck: (needsRewrite: boolean, rewrittenTitle?: string) => void;
  approveJargonRewrite: () => void;
  setAchievementTags: (tags: string[]) => void;
  updateAchievementDetail: (detail: AchievementDetail) => void;
  setStoryLine: (story: string | null) => void;
  setGeneratedBullets: (bullets: GeneratedBullet[]) => void;
  updateBulletStatus: (id: string, status: GeneratedBullet['status'], newText?: string) => void;
  onComplete?: (bullets: string[]) => void;
}

const ExperienceCDEContext = createContext<ExperienceCDEContextProps | undefined>(undefined);

const initialRoleData: ExperienceRoleData = {
  role_id: Math.random().toString(36).substr(2, 9),
  anchor: {
    designation: '',
    company: '',
    start_date: '',
    end_date: null,
    location: ''
  },
  role_frame: [],
  title_clarity_flag: true,
  title_ai_rewrite: null,
  title_rewrite_approved: false,
  achievement_tags: [],
  achievement_details: [],
  story_line: null,
  generated_bullets: []
};

export const ExperienceCDEProvider = ({ 
  children,
  initialAnchor,
  onComplete
}: { 
  children: ReactNode;
  initialAnchor?: Partial<RoleAnchor>;
  onComplete?: (bullets: string[]) => void;
}) => {
  const [state, setState] = useState<ExperienceCDEState>({
    currentCardIndex: initialAnchor ? 2 : 1, // Skip Card 1 if we have initial anchor
    roleData: {
      ...initialRoleData,
      anchor: { ...initialRoleData.anchor, ...(initialAnchor || {}) }
    },
    isLoading: false,
  });

  const updateRoleData = (updates: Partial<ExperienceRoleData>) => {
    setState(prev => ({
      ...prev,
      roleData: { ...prev.roleData, ...updates }
    }));
  };

  const nextCard = () => {
    setState(prev => ({
      ...prev,
      currentCardIndex: Math.min(prev.currentCardIndex + 1, 7)
    }));
  };

  const prevCard = () => {
    setState(prev => ({
      ...prev,
      currentCardIndex: Math.max(prev.currentCardIndex - 1, 1)
    }));
  };

  const updateAnchor = (anchorUpdates: Partial<RoleAnchor>) => {
    setState(prev => ({
      ...prev,
      roleData: {
        ...prev.roleData,
        anchor: { ...prev.roleData.anchor, ...anchorUpdates }
      }
    }));
  };

  const setRoleFrame = (frames: string[]) => {
    updateRoleData({ role_frame: frames });
  };

  const setJargonCheck = (isClear: boolean, rewrittenTitle?: string) => {
    updateRoleData({
      title_clarity_flag: isClear,
      title_ai_rewrite: rewrittenTitle || null,
      title_rewrite_approved: isClear // automatically approved if it was clear to begin with
    });
  };

  const approveJargonRewrite = () => {
    updateRoleData({ title_rewrite_approved: true });
  };

  const setAchievementTags = (tags: string[]) => {
    updateRoleData({ achievement_tags: tags });
  };

  const updateAchievementDetail = (detail: AchievementDetail) => {
    setState(prev => {
      const existing = prev.roleData.achievement_details.filter(d => d.tag !== detail.tag);
      return {
        ...prev,
        roleData: {
          ...prev.roleData,
          achievement_details: [...existing, detail]
        }
      };
    });
  };

  const setStoryLine = (story: string | null) => {
    updateRoleData({ story_line: story });
  };

  const setGeneratedBullets = (bullets: GeneratedBullet[]) => {
    updateRoleData({ generated_bullets: bullets });
  };

  const updateBulletStatus = (id: string, status: GeneratedBullet['status'], newText?: string) => {
    setState(prev => ({
      ...prev,
      roleData: {
        ...prev.roleData,
        generated_bullets: prev.roleData.generated_bullets.map(b => 
          b.id === id ? { ...b, status, text: newText ?? b.text } : b
        )
      }
    }));
  };

  return (
    <ExperienceCDEContext.Provider value={{
      ...state,
      nextCard,
      prevCard,
      updateAnchor,
      setRoleFrame,
      setJargonCheck,
      approveJargonRewrite,
      setAchievementTags,
      updateAchievementDetail,
      setStoryLine,
      setGeneratedBullets,
      updateBulletStatus,
      onComplete
    }}>
      {children}
    </ExperienceCDEContext.Provider>
  );
};

export const useExperienceCDE = () => {
  const context = useContext(ExperienceCDEContext);
  if (!context) {
    throw new Error('useExperienceCDE must be used within an ExperienceCDEProvider');
  }
  return context;
};
