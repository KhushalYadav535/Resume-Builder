"use client";

import React from "react";

export default function PricingSection() {
  return (
    <div className="w-full bg-[var(--bg-default)] text-[var(--text-primary)] py-20 relative z-10">
      {/* Header */}
      <div className="px-6 text-center max-w-4xl mx-auto space-y-6">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-['Syne',sans-serif] leading-tight text-[var(--text-primary)]">
          Always free to build your career.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] via-[var(--accent-2)] to-indigo-400">
            Pay only when you&apos;re moving it forward.
          </span>
        </h2>
        
        {/* Sub-line styled as a premium gradient pill/banner */}
        <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/25 rounded-full text-xs md:text-sm font-bold text-indigo-400">
          <span>Free is where you build. Paid is where you sprint.</span>
        </div>

        <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-3xl mx-auto pt-2">
          UpRole isn&apos;t a 14-day trial or a locked demo — it&apos;s free for life. Your resumes, your Career Journal, your progress: permanently yours, whether you&apos;re job-hunting or not. The only thing you ever pay for is momentum. When you&apos;re actively applying, unlock full access for exactly as long as the search takes — 30 days, 90 days, or just the week of an interview. When it&apos;s over, you&apos;re back to free. Automatically. No renewal chasing you down.
        </p>
      </div>
    </div>
  );
}
