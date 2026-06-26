"use client";

import React, { useRef } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  glowColor?: string;
}

export function Card({
  children,
  className,
  hoverable = true,
  glowColor,
  style,
  ...props
}: CardProps) {
  const innerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hoverable || !innerRef.current) return;
    // Check if the user is on a touch device to disable tilt
    if (window.matchMedia && window.matchMedia("(hover: none)").matches) return;

    const rect = innerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    // Apply the 3D transform and translateY(-6px) for the lift effect
    innerRef.current.style.transform = `perspective(1200px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) translateY(-6px)`;
    
    // Applying custom glow if provided, else rely on CSS var(--shadow-3d)
    if (glowColor) {
      innerRef.current.style.boxShadow = `0 20px 60px ${glowColor}, 0 8px 24px rgba(0,0,0,0.1), 0 2px 6px rgba(0,0,0,0.06)`;
    } else {
      innerRef.current.style.boxShadow = "var(--shadow-3d)";
    }
    innerRef.current.style.borderColor = "var(--border-accent)";
  };

  const handleMouseLeave = () => {
    if (!hoverable || !innerRef.current) return;
    innerRef.current.style.transform = "";
    innerRef.current.style.boxShadow = "";
    innerRef.current.style.borderColor = "var(--border)";
  };

  return (
    <div
      ref={innerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("transition-all duration-150 ease-out will-change-transform", className)}
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "24px",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
