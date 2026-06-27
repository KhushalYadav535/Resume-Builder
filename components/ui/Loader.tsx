"use client";

import React from "react";

export function ClassicLoader({ className = "" }: { className?: string }) {
  return (
    <div className={`border-[var(--accent)] flex h-8 w-8 animate-spin items-center justify-center rounded-full border-3 border-t-transparent ${className}`}></div>
  );
}

export function ConcentricLoader({ className = "", text }: { className?: string; text?: string }) {
  return (
    <div className={`flex w-full flex-col items-center justify-center gap-4 py-4 ${className}`}>
      <div className="flex h-16 w-16 animate-spin items-center justify-center rounded-full border-4 border-transparent border-t-[var(--accent)] text-4xl text-[var(--accent)]">
        <div className="flex h-12 w-12 animate-spin items-center justify-center rounded-full border-4 border-transparent border-t-[var(--accent-2)] text-2xl text-[var(--accent-2)]"></div>
      </div>
      {text && (
        <p className="text-sm font-semibold text-[var(--accent)] animate-pulse tracking-wide">
          {text}
        </p>
      )}
    </div>
  );
}

export default ConcentricLoader;
