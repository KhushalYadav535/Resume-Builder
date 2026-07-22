"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useExperienceCDE } from '@/context/ExperienceCDEContext';
import { ArrowLeft, Briefcase } from 'lucide-react';
import { Card1Anchor } from './cards/Card1Anchor';
import { Card2RoleFrame } from './cards/Card2RoleFrame';
import { Card3Jargon } from './cards/Card3Jargon';
import { Card4Achievements } from './cards/Card4Achievements';
import { Card5Quantify } from './cards/Card5Quantify';
import { Card6Story } from './cards/Card6Story';
import { Card7DraftReview } from './cards/Card7DraftReview';

export const ExperienceForm = () => {
  const { currentCardIndex, prevCard } = useExperienceCDE();

  const renderCard = () => {
    switch (currentCardIndex) {
      case 1: return <Card1Anchor />;
      case 2: return <Card2RoleFrame />;
      case 3: return <Card3Jargon />;
      case 4: return <Card4Achievements />;
      case 5: return <Card5Quantify />;
      case 6: return <Card6Story />;
      case 7: return <Card7DraftReview />;
      default: return null;
    }
  };

  const progress = (currentCardIndex / 7) * 100;

  return (
    <div className="flex flex-col min-h-[90vh] max-w-2xl mx-auto w-full px-4 py-8 bg-neutral-100 dark:bg-neutral-950/50 rounded-t-3xl">
      <header className="flex items-center justify-between mb-16 relative z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={prevCard}
            disabled={currentCardIndex === 1}
            className="p-3 bg-white dark:bg-neutral-900 shadow-sm border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-full transition-colors disabled:opacity-50"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-xl font-semibold">Experience Details</span>
        </div>
        <span className="text-sm font-medium text-neutral-500">Step {currentCardIndex} of 7</span>
      </header>

      <main className="flex-1 flex flex-col relative w-full items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCardIndex}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="w-full relative flex flex-col items-center h-full"
          >
            <div className="absolute top-[-16px] w-[88%] h-20 bg-white/40 dark:bg-neutral-800/40 rounded-3xl -z-20 border border-neutral-200/50 dark:border-neutral-700/50"></div>
            <div className="absolute top-[-8px] w-[94%] h-20 bg-white/70 dark:bg-neutral-800/70 rounded-3xl -z-10 border border-neutral-200/50 dark:border-neutral-700/50 shadow-sm"></div>
            
            <div className="relative w-full min-h-[400px] flex flex-col bg-white dark:bg-neutral-900 rounded-[2rem] shadow-2xl border border-neutral-200 dark:border-neutral-800 px-6 pb-8 pt-12 z-0">
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-blue-600 rounded-full p-3 border-[6px] border-neutral-100 dark:border-neutral-950 text-white shadow-sm z-10">
                <Briefcase className="w-6 h-6" />
              </div>
              
              {renderCard()}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
      
      <div className="mt-12 pt-8 flex flex-col items-center w-full">
         <span className="text-sm font-medium mb-3 text-neutral-500">Role Completeness</span>
         <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
         </div>
      </div>
    </div>
  );
};
