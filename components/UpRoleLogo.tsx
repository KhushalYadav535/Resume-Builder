"use client";

import Link from "next/link";

interface UpRoleLogoProps {
  href?: string;
  showSubtitle?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark" | "auto";
  className?: string;
}

/**
 * Canonical UpRole Brand Logo
 * Governed by UpRole Brand + Product Foundation:
 * - Symbol: The Career Path (Upward / forward continuous progression)
 * - Treatment: Deep Navy (#101B3B) + Warm Amber (#F59E0B)
 * - Dynamic expression: Navy -> Blue -> Teal -> Amber
 * - Sub-label: HIGHER CAREERS AHEAD
 */
export default function UpRoleLogo({
  href = "/",
  showSubtitle = true,
  size = "md",
  variant = "auto",
  className = "",
}: UpRoleLogoProps) {
  const iconDimensions = {
    sm: { w: 20, h: 24 },
    md: { w: 24, h: 28 },
    lg: { w: 30, h: 35 },
  }[size];

  const textClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  }[size];

  const subTextClasses = {
    sm: "text-[8px] tracking-[1.8px] -mt-0.5",
    md: "text-[9px] tracking-[2.2px] -mt-1",
    lg: "text-[10px] tracking-[2.6px] -mt-1",
  }[size];

  const textColorClass =
    variant === "dark"
      ? "text-white"
      : variant === "light"
      ? "text-[#101B3B]"
      : "text-[#101B3B] dark:text-white";

  const subColorClass =
    variant === "dark"
      ? "text-slate-400"
      : variant === "light"
      ? "text-[#64748B]"
      : "text-[#64748B] dark:text-slate-400";

  const content = (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* The Career Path Symbol: Distinctive upward/forward form */}
      <svg
        width={iconDimensions.w}
        height={iconDimensions.h}
        viewBox="0 0 24 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200 group-hover:scale-105"
        aria-hidden="true"
      >
        <rect
          x="2"
          y="7"
          width="6"
          height="17"
          rx="3"
          transform="rotate(-12 2 7)"
          fill="url(#uproleCareerPath1)"
        />
        <rect
          x="12"
          y="2"
          width="6"
          height="22"
          rx="3"
          transform="rotate(-12 12 2)"
          fill="url(#uproleCareerPath2)"
        />
        <defs>
          {/* Bar 1: Deep Navy (#101B3B) -> UpRole Blue (#2563EB) */}
          <linearGradient
            id="uproleCareerPath1"
            x1="2"
            y1="7"
            x2="8"
            y2="24"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#101B3B" />
            <stop offset="1" stopColor="#2563EB" />
          </linearGradient>
          {/* Bar 2: UpRole Teal (#14B8A6) -> Warm Amber (#F59E0B) */}
          <linearGradient
            id="uproleCareerPath2"
            x1="12"
            y1="2"
            x2="18"
            y2="24"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#14B8A6" />
            <stop offset="1" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
      </svg>

      {/* Wordmark & Subtitle */}
      <div className="flex flex-col">
        <span
          className={`font-serif font-bold tracking-tight leading-none ${textClasses} ${textColorClass}`}
        >
          Up<span className="text-[#F59E0B]">Role</span>
        </span>
        {showSubtitle && (
          <span
            className={`font-sans font-extrabold uppercase ${subTextClasses} ${subColorClass}`}
          >
            Higher Careers Ahead
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="no-underline group inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}
