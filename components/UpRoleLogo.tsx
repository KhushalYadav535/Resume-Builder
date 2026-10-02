"use client";

import Link from "next/link";
import Image from "next/image";

interface UpRoleLogoProps {
  href?: string;
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark" | "auto";
  className?: string;
  imageClassName?: string;
  showSubtitle?: boolean;
}

/**
 * Canonical UpRole Brand Logo
 * Displays the official dual-leaf flame emblem and UpRole wordmark from /logo.png & /logo-white.png.
 * Supports light, dark, and auto modes seamlessly with full responsive fidelity and crisp anti-aliasing.
 */
export default function UpRoleLogo({
  href = "/",
  size = "md",
  variant = "auto",
  className = "",
  imageClassName = "",
}: UpRoleLogoProps) {
  // Height classes calibrated to 2.69:1 aspect ratio of official logo
  const sizeClasses = {
    sm: "h-7 w-auto",
    md: "h-8 sm:h-9 w-auto",
    lg: "h-11 sm:h-12 w-auto",
  }[size];

  const content = (
    <div className={`relative inline-flex items-center select-none ${className}`}>
      {variant === "light" && (
        <Image
          src="/logo.png"
          alt="UpRole"
          width={1050}
          height={390}
          priority
          className={`${sizeClasses} object-contain ${imageClassName}`}
        />
      )}

      {variant === "dark" && (
        <Image
          src="/logo-white.png"
          alt="UpRole"
          width={1050}
          height={390}
          priority
          className={`${sizeClasses} object-contain ${imageClassName}`}
        />
      )}

      {variant === "auto" && (
        <>
          <Image
            src="/logo.png"
            alt="UpRole"
            width={1050}
            height={390}
            priority
            className={`${sizeClasses} object-contain dark:hidden ${imageClassName}`}
          />
          <Image
            src="/logo-white.png"
            alt="UpRole"
            width={1050}
            height={390}
            priority
            className={`${sizeClasses} object-contain hidden dark:block ${imageClassName}`}
          />
        </>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="no-underline group inline-flex items-center transition-transform duration-200 hover:scale-[1.02] focus:outline-none"
        aria-label="UpRole - Higher Careers Ahead"
      >
        {content}
      </Link>
    );
  }

  return content;
}

