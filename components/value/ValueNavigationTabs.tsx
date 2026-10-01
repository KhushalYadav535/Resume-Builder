"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  Brain,
  Zap,
  Briefcase,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import { ValueNavigationTab } from "@/types/value";
import ValueScrollProgress from "./ValueScrollProgress";

interface ValueNavigationTabsProps {
  activeTab: ValueNavigationTab;
  onTabChange: (tab: ValueNavigationTab) => void;
  factsCount?: number;
  unconfirmedFactsCount?: number;
}

export default function ValueNavigationTabs({
  activeTab,
  onTabChange,
  factsCount = 0,
  unconfirmedFactsCount = 0,
}: ValueNavigationTabsProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });

  const tabs: {
    id: ValueNavigationTab;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
    needsReview?: boolean;
  }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "capabilities", label: "Capabilities", icon: Brain },
    { id: "impact", label: "Impact", icon: Zap },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "progression", label: "Progression", icon: TrendingUp },
    {
      id: "facts",
      label: "Facts",
      icon: CheckCircle2,
      badge: unconfirmedFactsCount > 0 ? `${unconfirmedFactsCount} to review` : factsCount > 0 ? factsCount : undefined,
      needsReview: unconfirmedFactsCount > 0,
    },
  ];

  const activeIndex = Math.max(0, tabs.findIndex((t) => t.id === activeTab));

  // Sliding indicator measurement — re-run on tab, counts, resize & fonts.
  useLayoutEffect(() => {
    const measure = () => {
      const el = tabRefs.current[activeIndex];
      if (!el) return;
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth, ready: true });
    };
    measure();
    window.addEventListener("resize", measure);
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && trackRef.current) {
      ro = new ResizeObserver(measure);
      ro.observe(trackRef.current);
    }
    document.fonts?.ready.then(measure).catch(() => {});
    return () => {
      window.removeEventListener("resize", measure);
      ro?.disconnect();
    };
  }, [activeIndex, factsCount, unconfirmedFactsCount]);

  /** Arrow-key roving focus across tabs (a11y). */
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let next: number | null = null;
    if (e.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    if (next !== null) {
      e.preventDefault();
      tabRefs.current[next]?.focus();
      onTabChange(tabs[next].id);
    }
  };

  return (
    <div className="w-full sticky top-[65px] z-30">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-3">
        <nav
          role="tablist"
          aria-label="Value Navigation Tabs"
          className="relative rounded-[1.15rem] border border-[var(--border-strong)] bg-[var(--card)]/85 backdrop-blur-xl shadow-[0_14px_44px_rgba(16,27,59,0.12)] overflow-hidden"
        >
          {/* top sheen */}
          <span className="absolute top-0 inset-x-6 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent pointer-events-none" aria-hidden="true" />

          <div ref={trackRef} className="relative flex items-center justify-between gap-1.5 sm:gap-2 overflow-x-auto value-noscroll p-1.5 w-full">
            {/* sliding gold indicator */}
            <span
              aria-hidden="true"
              className="absolute top-1.5 bottom-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 shadow-[0_8px_24px_rgba(245,158,11,0.4)]"
              style={{
                left: indicator.left,
                width: indicator.width,
                opacity: indicator.ready ? 1 : 0,
                transition: "left 0.32s cubic-bezier(0.16, 1, 0.3, 1), width 0.32s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s",
              }}
            />

            {tabs.map((tab, i) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  role="tab"
                  aria-selected={isActive}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => onTabChange(tab.id)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  className={`group relative z-10 flex flex-1 min-w-fit items-center justify-center gap-2 rounded-xl px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-[13px] font-bold whitespace-nowrap cursor-pointer transition-colors duration-200 ${
                    isActive ? "text-brand-navy" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {/* index */}
                  <span
                    className={`hidden lg:inline text-[9px] font-black tabular-nums tracking-wider ${
                      isActive ? "text-brand-navy/60" : "text-[var(--text-muted)]/70"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  {/* icon tile */}
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-all duration-200 ${
                      isActive
                        ? "bg-black/15 border-black/10 text-brand-navy"
                        : "bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-muted)] group-hover:text-amber-500 group-hover:border-amber-500/40 group-hover:shadow-[0_4px_14px_rgba(245,158,11,0.2)]"
                    }`}
                  >
                    <Icon size={14} strokeWidth={isActive ? 2.6 : 2} />
                  </span>

                  <span className={isActive ? "font-extrabold" : ""}>{tab.label}</span>

                  {tab.badge !== undefined && (
                    <span
                      className={`ml-0.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider tabular-nums ${
                        isActive
                          ? "bg-black/15 text-brand-navy"
                          : tab.needsReview
                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                          : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border)]"
                      }`}
                    >
                      {tab.needsReview && !isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      )}
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
        <ValueScrollProgress />
      </div>
    </div>
  );
}
