"use client";

import React from "react";
import {
  LayoutDashboard,
  Brain,
  Zap,
  Briefcase,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import { ValueNavigationTab } from "@/types/value";

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
  const tabs: {
    id: ValueNavigationTab;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
    badgeColor?: string;
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
      badgeColor:
        unconfirmedFactsCount > 0
          ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
          : "bg-[var(--border)] text-[var(--text-muted)]",
    },
  ];

  return (
    <div className="w-full border-b border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-md sticky top-[65px] z-30">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar py-2.5" aria-label="Value Navigation Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? "bg-amber-500 text-brand-navy shadow-sm shadow-amber-500/25 font-extrabold"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                }`}
              >
                <Icon size={15} strokeWidth={isActive ? 2.5 : 2} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      isActive ? "bg-black/15 text-brand-navy" : tab.badgeColor
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
