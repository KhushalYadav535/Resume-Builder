"use client";

import React, { useEffect, useState } from "react";

export interface ATSRingProps {
  score: number;
  size?: number;
  animate?: boolean;
  strokeWidth?: number;
}

export function ATSRing({ score, size = 120, animate = true, strokeWidth = 8 }: ATSRingProps) {
  // Wait for client mount to trigger animation properly
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const getScoreColor = (s: number) => {
    if (s >= 80) return "var(--score-high)";
    if (s >= 50) return "var(--score-mid)";
    return "var(--score-low)";
  };

  const color = getScoreColor(score);
  const radius = 52;
  const circumference = 2 * Math.PI * radius; // Approx 326.7
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      style={{ overflow: "visible" }}
    >
      <defs>
        <filter id="score-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <g transform="rotate(-90 60 60)">
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="var(--border-strong)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          filter="url(#score-glow)"
          style={{
            // Assign inline variables for the CSS animation
            ...(animate && mounted
              ? {
                  animation: "scoreReveal 1.4s ease-out forwards",
                }
              : { strokeDashoffset: dashOffset }),
          } as React.CSSProperties}
        />
      </g>

      <text
        x="60"
        y="58"
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          fontSize: "28px",
          fontWeight: 700,
          fontFamily: "var(--font-mono)",
          fill: color,
        }}
      >
        {score}
      </text>
      <text
        x="60"
        y="78"
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          fontSize: "11px",
          fill: "var(--text-muted)",
        }}
      >
        /100
      </text>

      {/* Inject custom variables into SVG to make CSS animation work */}
      <style dangerouslySetInnerHTML={{
        __html: `
          circle[filter="url(#score-glow)"] {
            --dash-total: ${circumference};
            --dash-offset: ${dashOffset};
          }
        `
      }} />
    </svg>
  );
}
