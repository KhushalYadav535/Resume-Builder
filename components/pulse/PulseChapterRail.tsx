"use client";

import React, { useEffect, useState } from "react";

const chapters = [
  { id: "pulse-snapshot", index: "01", label: "Snapshot" },
  { id: "pulse-value", index: "02", label: "Value" },
  { id: "pulse-progress", index: "03", label: "Progress" },
  { id: "pulse-event", index: "04", label: "Event" },
  { id: "pulse-direction", index: "05", label: "Direction" },
  { id: "pulse-goal", index: "06", label: "Goal" },
  { id: "pulse-action", index: "07", label: "Action" },
  { id: "pulse-momentum", index: "08", label: "Momentum" },
  { id: "pulse-explore", index: "09", label: "Explore" },
];

/**
 * Floating chapter rail (xl screens) — scroll-spy dots that mirror
 * the card in view; click jumps to any chapter. Pure presentational.
 */
export default function PulseChapterRail() {
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-35% 0px -55% 0px" }
    );
    chapters.forEach((c) => {
      const el = document.getElementById(c.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <nav
      aria-label="Pulse chapters"
      className="hidden xl:flex fixed right-5 top-1/2 -translate-y-1/2 z-40 flex-col items-end gap-2.5"
    >
      {chapters.map((c) => {
        const isActive = active === c.id;
        return (
          <a
            key={c.id}
            href={`#${c.id}`}
            aria-label={`Jump to ${c.label}`}
            aria-current={isActive ? "true" : undefined}
            className="group flex items-center gap-2"
          >
            <span
              className={`text-[10px] font-black tabular-nums tracking-wider transition-all duration-300 ${
                isActive
                  ? "opacity-100 text-amber-600 dark:text-amber-400"
                  : "opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 text-[var(--text-muted)]"
              }`}
            >
              {c.index} · {c.label}
            </span>
            <span
              className={`rounded-full border transition-all duration-300 ${
                isActive
                  ? "w-2.5 h-2.5 bg-amber-500 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.8)]"
                  : "w-2 h-2 bg-[var(--card)] border-[var(--border-strong)] group-hover:border-amber-500/60 group-hover:scale-125"
              }`}
            />
          </a>
        );
      })}
      <span className="mt-1 w-px h-10 bg-gradient-to-b from-amber-500/60 to-transparent mx-[3px]" aria-hidden="true" />
    </nav>
  );
}
