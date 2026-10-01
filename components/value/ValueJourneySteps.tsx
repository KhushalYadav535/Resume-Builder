"use client";

import React, { useEffect, useState } from "react";
import { Layers, Sparkles, Database, Sprout } from "lucide-react";

const steps = [
  { id: "value-profile", index: "01", label: "Profile", hint: "4 dimensions", icon: Layers },
  { id: "value-pattern", index: "02", label: "Pattern", hint: "AI synthesis", icon: Sparkles },
  { id: "value-evidence", index: "03", label: "Evidence", hint: "Proof base", icon: Database },
  { id: "value-strengthen", index: "04", label: "Strengthen", hint: "Next steps", icon: Sprout },
];

/**
 * Anchor stepper with scroll-spy — orients the user in the 4-area
 * journey, highlights the chapter in view, one-tap jumps.
 * Pure presentational.
 */
export default function ValueJourneySteps() {
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-25% 0px -65% 0px" }
    );
    steps.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <nav
      aria-label="Career value journey"
      className="value-noscroll flex items-stretch gap-2 overflow-x-auto px-1 py-1"
    >
      {steps.map((s, i) => {
        const Icon = s.icon;
        const isActive = active === s.id;
        return (
          <React.Fragment key={s.id}>
            <a
              href={`#${s.id}`}
              aria-current={isActive ? "true" : undefined}
              className={`group flex min-w-[150px] flex-1 items-center gap-2.5 rounded-2xl border px-3.5 py-2.5 transition-all hover:-translate-y-0.5 ${
                isActive
                  ? "border-amber-500/60 bg-amber-500/[0.08] shadow-[0_12px_30px_rgba(245,158,11,0.16)]"
                  : "border-[var(--border)] bg-[var(--card)]/80 hover:border-amber-500/50 hover:shadow-[0_12px_30px_rgba(245,158,11,0.14)]"
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                  isActive
                    ? "bg-amber-500 text-brand-navy border-amber-500 shadow-[0_6px_18px_rgba(245,158,11,0.4)]"
                    : "bg-amber-500/10 border-amber-500/25 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-brand-navy group-hover:border-amber-500"
                }`}
              >
                <Icon size={15} />
              </span>
              <span className="leading-tight">
                <span className={`block text-[10px] font-black uppercase tracking-[0.14em] ${isActive ? "text-amber-600 dark:text-amber-400" : "text-[var(--text-muted)]"}`}>
                  {s.index} · {s.hint}
                </span>
                <span className="block text-[13px] font-extrabold text-[var(--text-primary)]">
                  {s.label}
                </span>
              </span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" aria-hidden="true" />
              )}
            </a>
            {i < steps.length - 1 && (
              <span
                className="hidden sm:block w-6 self-center h-px bg-gradient-to-r from-amber-500/60 to-[var(--border-strong)] shrink-0"
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
