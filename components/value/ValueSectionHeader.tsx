"use client";

import React from "react";

interface ValueSectionHeaderProps {
  index: string;
  eyebrow: string;
  eyebrowClass: string;
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  description?: string;
  badge?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Shared premium header — one rhythm for every Value section.
 * Same theme tokens; icon gradient + eyebrow color vary per section.
 */
export default function ValueSectionHeader({
  index,
  eyebrow,
  eyebrowClass,
  icon,
  iconClass,
  title,
  description,
  badge,
  children,
}: ValueSectionHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div className="flex items-start gap-3.5">
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${iconClass}`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <div className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] ${eyebrowClass}`}>
            <span>{index} · {eyebrow}</span>
            <span className="w-8 h-px bg-current opacity-40" aria-hidden="true" />
          </div>
          <h2 className="mt-1 text-xl sm:text-[1.65rem] font-extrabold tracking-tight text-[var(--text-primary)] font-['Syne',sans-serif]">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-[13px] text-[var(--text-muted)] max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
          {children}
        </div>
      </div>

      {badge && <div className="self-start lg:self-auto shrink-0">{badge}</div>}
    </div>
  );
}
