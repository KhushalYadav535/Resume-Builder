"use client";

import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "accent"
  | "neutral";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

export function Badge({
  variant = "neutral",
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    success:
      "bg-[#D1FAE5] text-[#065F46] border-[#6EE7B7] dark:bg-[#064E3B] dark:text-[#A7F3D0] dark:border-[#047857]",
    warning:
      "bg-[#FEF3C7] text-[#92400E] border-[#FCD34D] dark:bg-[#78350F] dark:text-[#FDE68A] dark:border-[#B45309]",
    danger:
      "bg-[#FEE2E2] text-[#991B1B] border-[#FCA5A5] dark:bg-[#7F1D1D] dark:text-[#FECACA] dark:border-[#B91C1C]",
    info:
      "bg-[#DBEAFE] text-[#1E40AF] border-[#93C5FD] dark:bg-[#1E3A8A] dark:text-[#BFDBFE] dark:border-[#1D4ED8]",
    accent:
      "bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--border-accent)]",
    neutral:
      "bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border)]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-[var(--radius-full)] border",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: "currentColor" }}
        />
      )}
      {children}
    </span>
  );
}
