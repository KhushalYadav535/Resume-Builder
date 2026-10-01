"use client";

import React from "react";
import { Sparkles } from "lucide-react";

/** Rotating circular-text badge — the awwwards signature stamp. */
export default function ValueOrbitBadge() {
  return (
    <div
      className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 text-amber-600 dark:text-amber-400"
      aria-hidden="true"
    >
      <span className="absolute inset-0 rounded-full border border-dashed border-amber-500/40" />
      <svg viewBox="0 0 100 100" className="value-spin-slower absolute inset-0 h-full w-full">
        <defs>
          <path
            id="value-orbit-circle"
            d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0"
            fill="none"
          />
        </defs>
        <text fontSize="10" letterSpacing="2.2" fill="currentColor" fontWeight={800}>
          <textPath href="#value-orbit-circle">
            EVIDENCE BACKED • TRACEABLE •
          </textPath>
        </text>
      </svg>
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-brand-navy shadow-[0_8px_24px_rgba(245,158,11,0.5)]">
          <Sparkles size={16} strokeWidth={2.5} />
        </span>
      </span>
    </div>
  );
}
