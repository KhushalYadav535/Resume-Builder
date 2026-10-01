"use client";

import { motion } from "framer-motion";

function SkeletonBlock({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl bg-slate-200 dark:bg-white/[0.06] animate-pulse ${className}`}
    />
  );
}

function CardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-7 sm:p-8 shadow-sm flex flex-col gap-4"
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <SkeletonBlock className="w-9 h-9 rounded-xl" />
          <div className="space-y-1.5">
            <SkeletonBlock className="h-2.5 w-32 rounded-full" />
            <SkeletonBlock className="h-2 w-44 rounded-full" />
          </div>
        </div>
        <SkeletonBlock className="h-7 w-20 rounded-full" />
      </div>

      {/* Content rows */}
      <div className="space-y-2 mt-2">
        <SkeletonBlock className="h-8 w-3/4 rounded-xl" />
        <SkeletonBlock className="h-4 w-full rounded-lg" />
        <SkeletonBlock className="h-4 w-5/6 rounded-lg" />
      </div>

      {/* Inner box */}
      <SkeletonBlock className="h-20 w-full rounded-2xl" />

      {/* Tag pills */}
      <div className="flex gap-2">
        <SkeletonBlock className="h-6 w-24 rounded-xl" />
        <SkeletonBlock className="h-6 w-20 rounded-xl" />
        <SkeletonBlock className="h-6 w-28 rounded-xl" />
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex justify-between">
        <SkeletonBlock className="h-3 w-36 rounded-full" />
        <SkeletonBlock className="h-3 w-20 rounded-full" />
      </div>
    </motion.div>
  );
}

function ActionCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.25 }}
      className="rounded-3xl border-2 border-amber-200/60 dark:border-amber-400/20 bg-gradient-to-br from-amber-50/50 to-white dark:from-white/[0.03] dark:to-white/[0.01] p-7 sm:p-8 shadow-sm flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SkeletonBlock className="w-3 h-3 rounded-full" />
          <SkeletonBlock className="h-6 w-44 rounded-full" />
        </div>
        <SkeletonBlock className="h-7 w-16 rounded-full" />
      </div>
      <SkeletonBlock className="h-10 w-2/3 rounded-xl" />
      <SkeletonBlock className="h-24 w-full rounded-2xl" />
      <div className="flex items-center justify-between pt-3 border-t border-amber-100/80 dark:border-white/5">
        <div className="flex gap-2">
          <SkeletonBlock className="h-8 w-28 rounded-xl" />
          <SkeletonBlock className="h-8 w-20 rounded-xl" />
        </div>
        <SkeletonBlock className="h-10 w-40 rounded-xl" />
      </div>
    </motion.div>
  );
}

export default function PulseSkeleton() {
  return (
    <div className="flex flex-col gap-5 sm:gap-6 animate-in fade-in duration-300">
      {/* Row 1: Snapshot & Value */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0 }}
          className="rounded-2xl border border-amber-200/60 dark:border-amber-400/15 bg-white dark:bg-white/[0.03] p-5 sm:p-6 shadow-sm flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <SkeletonBlock className="w-8 h-8 rounded-xl" />
              <div className="space-y-1.5">
                <SkeletonBlock className="h-2.5 w-32 rounded-full" />
                <SkeletonBlock className="h-2 w-40 rounded-full" />
              </div>
            </div>
            <SkeletonBlock className="h-6 w-16 rounded-full" />
          </div>
          <div className="space-y-2">
            <SkeletonBlock className="h-4 w-40 rounded-xl" />
            <SkeletonBlock className="h-8 w-3/4 rounded-xl" />
          </div>
          <SkeletonBlock className="h-16 w-full rounded-xl" />
          <div className="flex gap-1.5 flex-wrap">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonBlock key={i} className="h-6 w-24 rounded-lg" />
            ))}
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex justify-between">
            <SkeletonBlock className="h-3 w-36 rounded-full" />
            <SkeletonBlock className="h-3 w-24 rounded-full" />
          </div>
        </motion.div>
        <CardSkeleton delay={0.05} />
      </div>

      {/* Row 2: Progress & Event */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        <CardSkeleton delay={0.1} />
        <CardSkeleton delay={0.15} />
      </div>

      {/* Row 3: Direction & Goal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        <CardSkeleton delay={0.2} />
        <CardSkeleton delay={0.25} />
      </div>

      {/* Row 4: Next Best Action & Momentum */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        <ActionCardSkeleton />
        <CardSkeleton delay={0.35} />
      </div>

      {/* Row 5: Explore Career skeleton */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-5 sm:p-6 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1.5">
            <SkeletonBlock className="h-2.5 w-36 rounded-full" />
            <SkeletonBlock className="h-6 w-48 rounded-xl" />
          </div>
          <SkeletonBlock className="h-8 w-32 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {[1, 2, 3].map((i) => (
            <SkeletonBlock key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
