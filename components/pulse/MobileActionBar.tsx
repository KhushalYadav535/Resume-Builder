"use client";

import { motion } from "framer-motion";
import { Plus, Zap } from "lucide-react";
import Link from "next/link";

interface Props {
  onLogEvent: () => void;
  nextActionCta: string;
  nextActionLink: string;
}

export default function MobileActionBar({ onLogEvent, nextActionCta, nextActionLink }: Props) {
  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
    >
      {/* Frosted glass backdrop */}
      <div className="absolute inset-0 bg-white/85 dark:bg-[#050B1A]/90 backdrop-blur-xl border-t border-slate-200/80 dark:border-white/8" />

      <div className="relative px-4 py-3 pb-safe flex items-center gap-2.5">
        {/* Log Event — secondary */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onLogEvent}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl
            bg-purple-50 dark:bg-purple-500/15
            hover:bg-purple-100 dark:hover:bg-purple-500/25
            border border-purple-200 dark:border-purple-400/30
            text-xs font-bold text-purple-700 dark:text-purple-300
            transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Log Event</span>
        </motion.button>

        {/* Next Best Action CTA — primary, takes remaining space */}
        <motion.div whileTap={{ scale: 0.98 }} className="flex-1">
          <Link
            href={nextActionLink || "/value"}
            onClick={(e) => {
              if (
                nextActionCta.toLowerCase().includes("capture") ||
                nextActionCta.toLowerCase().includes("log") ||
                nextActionLink === "/career-journal"
              ) {
                e.preventDefault();
                onLogEvent();
              }
            }}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl
              bg-gradient-to-r from-amber-500 to-amber-600
              hover:from-amber-400 hover:to-amber-500
              text-brand-navy font-black text-sm
              shadow-[0_4px_20px_rgba(245,158,11,0.45)]
              transition-all no-underline"
          >
            <Zap className="w-4 h-4 shrink-0" />
            <span className="truncate">{nextActionCta || "Take Action"}</span>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
