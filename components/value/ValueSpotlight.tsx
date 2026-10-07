"use client";

import React, { useRef } from "react";

interface ValueSpotlightProps {
  className?: string;
  children: React.ReactNode;
  /** Optional card-level open action — inner links/buttons keep their own behavior. */
  onOpen?: () => void;
  label?: string;
  style?: React.CSSProperties;
}

/**
 * Cursor-tracking amber spotlight for premium cards.
 * Pure presentational — no data, no logic changes.
 */
export default function ValueSpotlight({ className = "", children, onOpen, label, style }: ValueSpotlightProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--spot-x", `${e.clientX - r.left}px`);
    el.style.setProperty("--spot-y", `${e.clientY - r.top}px`);
  };

  if (!onOpen) {
    return (
      <div ref={ref} onMouseMove={onMove} style={style} className={`value-spot ${className}`}>
        {children}
      </div>
    );
  }

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button, a, input, select, textarea")) return;
    onOpen();
  };
  const handleKey = (e: React.KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button, a, input, select, textarea")) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen();
    }
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onClick={handleClick}
      onKeyDown={handleKey}
      role="button"
      tabIndex={0}
      aria-label={label}
      title={label}
      style={style}
      className={`value-spot cursor-pointer ${className}`}
    >
      {children}
    </div>
  );
}
