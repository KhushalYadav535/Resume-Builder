"use client";

import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCDE } from '@/context/CDEContext';
import { ArrowLeft, CheckCircle2, Building2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface CDEContainerProps {
  children: ReactNode;
}

export const CDEContainer = ({ children }: CDEContainerProps) => {
  const { profileStrength, currentQuestionId, goBack, history, isComplete, skipQuestion } = useCDE();

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6 w-full max-w-2xl mx-auto">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
          className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-10 shadow-xl w-full"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", bounce: 0.6 }}
          >
            <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
          </motion.div>
          
          <h1 className="text-3xl font-bold mb-3 text-neutral-900 dark:text-neutral-100">Profile Complete!</h1>
          <p className="text-muted-foreground text-lg mb-8">We've extracted all the key facts to build your perfect resume.</p>
          
          {/* Gamification Stats */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-neutral-50 dark:bg-neutral-950 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 flex flex-col items-center">
              <span className="text-3xl font-bold text-uprole-blue mb-1">{profileStrength}%</span>
              <span className="text-sm font-medium text-neutral-500">Profile Strength</span>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-950 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 flex flex-col items-center">
              <span className="text-3xl font-bold text-uprole-purple mb-1">85+</span>
              <span className="text-sm font-medium text-neutral-500">ATS Readiness</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => window.location.href = '/resume-builder'} 
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-brand-navy py-4 rounded-full font-bold text-lg transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 active:scale-[0.99]"
            >
              Preview Generated Resume
            </button>
            <button 
              onClick={() => window.location.href = '/career-journal'} 
              className="w-full bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-100 py-4 rounded-full font-medium transition-colors"
            >
              Save to Journal
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[100vh] max-w-2xl mx-auto w-full px-4 py-8 bg-neutral-100 dark:bg-neutral-950/50 rounded-t-3xl">
      {/* Header */}
      <header className="flex items-center justify-between mb-16 relative z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={goBack}
            disabled={history.length === 0}
            className="p-3 bg-white dark:bg-neutral-900 shadow-sm border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-full transition-colors disabled:opacity-50"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-xl font-semibold">Contribute</span>
        </div>

        <button 
          onClick={skipQuestion}
          className="text-blue-600 font-medium px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
        >
          Skip
        </button>
      </header>

      {/* Main Content Area with Stacked Cards */}
      <main className="flex-1 flex flex-col relative w-full items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionId}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="w-full relative flex flex-col items-center"
          >
            {/* Stacked background cards for depth */}
            <div className="absolute top-[-16px] w-[88%] h-20 bg-white/40 dark:bg-neutral-800/40 rounded-3xl -z-20 border border-neutral-200/50 dark:border-neutral-700/50"></div>
            <div className="absolute top-[-8px] w-[94%] h-20 bg-white/70 dark:bg-neutral-800/70 rounded-3xl -z-10 border border-neutral-200/50 dark:border-neutral-700/50 shadow-sm"></div>
            
            {/* Main Interactive Card */}
            <div className="relative w-full bg-white dark:bg-neutral-900 rounded-[2rem] shadow-2xl border border-neutral-200 dark:border-neutral-800 px-6 pb-8 pt-12 z-0">
              
              {/* Floating Top Icon */}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-brand-navy rounded-full p-3 border-[6px] border-neutral-100 dark:border-neutral-950 text-brand-amber shadow-md z-10">
                <Building2 className="w-6 h-6" />
              </div>
              
              {children}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
      
      {/* Footer Progress */}
      <div className="mt-auto pt-8 flex flex-col items-center">
         <span className="text-sm font-medium mb-3 text-neutral-500">Profile Progress</span>
         <div className="w-full max-w-xs h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-uprole-teal rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${profileStrength}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
         </div>
      </div>
    </div>
  );
};
