"use client";

import React, { useRef } from "react";

interface ValueSpotlightProps {
  className?: string;
  children: React.ReactNode;
}

/**
 * Cursor-tracking amber spotlight for premium cards.
 * Pure presentational — no data, no logic changes.
 */
export default function ValueSpotlight({ className = "", children }: ValueSpotlightProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--spot-x", `${e.clientX - r.left}px`);
    el.style.setProperty("--spot-y", `${e.clientY - r.top}px`);
  };

  return (
    <div ref={ref} onMouseMove={onMove} className={`value-spot ${className}`}>
      {children}
    </div>
  );
}
