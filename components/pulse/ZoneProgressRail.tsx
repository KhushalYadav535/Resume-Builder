"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ZONES = [
  { id: "row-1", label: "Snapshot & Value", color: "bg-amber-500", ring: "ring-amber-400/40", label_color: "bg-amber-500" },
  { id: "row-2", label: "Progress & Event", color: "bg-teal-500", ring: "ring-teal-400/40", label_color: "bg-teal-500" },
  { id: "row-3", label: "Direction & Goal", color: "bg-blue-500", ring: "ring-blue-400/40", label_color: "bg-blue-500" },
  { id: "row-4", label: "Action & Momentum", color: "bg-amber-500", ring: "ring-amber-400/40", label_color: "bg-amber-500" },
  { id: "row-5", label: "Explore Career", color: "bg-violet-500", ring: "ring-violet-400/40", label_color: "bg-violet-500" },
];

export default function ZoneProgressRail() {
  const [activeZone, setActiveZone] = useState(0);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    ZONES.forEach((zone, idx) => {
      const el = document.getElementById(zone.id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveZone(idx);
        },
        {
          // Only the top 50% of viewport matters for "active" zone detection
          rootMargin: "0px 0px -50% 0px",
          threshold: 0.05,
        }
      );
      observer.observe(el);
      observers.push(observer);
    });

    // Mark zone-1 as active immediately on first render
    setActiveZone(0);

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    /*
     * Rail is fixed to the very left edge of the viewport.
     * Labels appear as floating tooltips to the RIGHT of the dot — using
     * absolute positioning and pointer-events-none so they NEVER overlap
     * the page content (which starts at px-4/px-6/px-10 from left edge).
     * Only visible on xl+ screens (1280px+).
     */
    <div className="hidden xl:flex fixed left-5 top-1/2 -translate-y-1/2 flex-col items-center z-30 select-none">
      {/* Connector line */}
      <div className="absolute left-[6px] top-5 bottom-5 w-px bg-slate-200 dark:bg-white/10 rounded-full" />

      {ZONES.map((zone, idx) => (
        <div
          key={zone.id}
          className="relative flex items-center py-4 group cursor-pointer"
          onClick={() => scrollTo(zone.id)}
          onMouseEnter={() => setHoveredIdx(idx)}
          onMouseLeave={() => setHoveredIdx(null)}
        >
          {/* Dot */}
          <motion.div
            animate={{
              scale: activeZone === idx ? 1.4 : 1,
              opacity: activeZone === idx ? 1 : 0.3,
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`relative z-10 w-3 h-3 rounded-full shrink-0 ${zone.color} ${
              activeZone === idx ? `ring-[3px] ring-offset-[2px] ring-offset-white dark:ring-offset-[#070D1E] ${zone.ring}` : ""
            } transition-shadow`}
          />

          {/* Floating tooltip — appears to the RIGHT, never overlaps content */}
          <AnimatePresence>
            {(hoveredIdx === idx || activeZone === idx) && (
              <motion.div
                key={`label-${idx}`}
                initial={{ opacity: 0, x: -6, scale: 0.92 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -4, scale: 0.96 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                // Positioned absolutely to the RIGHT of the dot, won't affect document flow
                className="absolute left-5 pointer-events-none whitespace-nowrap"
              >
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.12em] text-white shadow-lg
                    ${activeZone === idx ? zone.label_color : "bg-slate-700 dark:bg-slate-600"}`}
                >
                  <span>{idx + 1}. {zone.label}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
