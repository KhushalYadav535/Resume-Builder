import React from "react";

/**
 * Cursor-tracking amber spotlight for premium pulse cards.
 * Pairs with the global `.value-spot` style (same theme tokens).
 * Pure presentational — attach as onMouseMove on any card root.
 */
export function handleSpotMove(e: React.MouseEvent<HTMLDivElement>) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--spot-x", `${e.clientX - r.left}px`);
  el.style.setProperty("--spot-y", `${e.clientY - r.top}px`);
}
