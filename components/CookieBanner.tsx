"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, X, Check } from "lucide-react";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already decided on cookies
    const consent = localStorage.getItem("uprole-cookie-consent");
    if (!consent) {
      // Show after a brief delay for smoother initial load
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (level: "all" | "essential") => {
    localStorage.setItem("uprole-cookie-consent", level);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 md:left-6 md:max-w-md z-[999] animate-in slide-in-from-bottom-5 duration-300 font-sans"
    >
      <div className="p-4 md:p-5 rounded-2xl bg-[var(--bg-elevated)]/95 backdrop-blur-xl border border-[var(--border)] shadow-2xl shadow-black/20 text-[var(--text-primary)] space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center shrink-0">
              <ShieldCheck size={16} />
            </div>
            <div className="font-bold text-xs uppercase tracking-wider font-['Syne',sans-serif]">
              Privacy &amp; Cookie Consent
            </div>
          </div>

          <button
            onClick={() => handleConsent("essential")}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
            aria-label="Dismiss cookie banner"
          >
            <X size={15} />
          </button>
        </div>

        <p className="text-xs text-[var(--text-muted)] leading-relaxed m-0">
          We use essential cookies to maintain secure sessions and optimize your resume scanning performance. We never sell your career data. Read our{" "}
          <Link href="/privacy" className="text-amber-500 hover:underline font-semibold">
            Privacy Policy
          </Link>
          .
        </p>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleConsent("all")}
            className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-brand-navy font-black text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1"
          >
            <Check size={13} />
            <span>Accept All</span>
          </button>

          <button
            type="button"
            onClick={() => handleConsent("essential")}
            className="flex-1 py-2 px-3 rounded-xl bg-[var(--bg-page)] hover:bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-secondary)] font-bold text-xs transition-all cursor-pointer"
          >
            Essential Only
          </button>
        </div>
      </div>
    </div>
  );
}
