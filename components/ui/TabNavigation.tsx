"use client";

import Link from "next/link";
import { 
  BarChart2, Users, Zap, Key, CreditCard, Megaphone, Settings 
} from "lucide-react";

interface TabNavigationProps {
  activeTab: string;
}

export default function TabNavigation({ activeTab }: TabNavigationProps) {
  const tabs = [
    { id: 'overview', label: 'Analytics Overview', icon: <BarChart2 size={16} />, href: '/admin' },
    { id: 'users', label: 'User Management', icon: <Users size={16} />, href: '/admin/users' },
    { id: 'ai-usage', label: 'AI Usage Log', icon: <Zap size={16} />, href: '/admin/ai-usage' },
    { id: 'keywords', label: 'ATS Keywords', icon: <Key size={16} />, href: '/admin/keywords' },
    { id: 'billing', label: 'Billing & Credits', icon: <CreditCard size={16} />, href: '/admin/billing' },
    { id: 'broadcast', label: 'Broadcasts', icon: <Megaphone size={16} />, href: '/admin/broadcast' },
    { id: 'settings', label: 'Settings', icon: <Settings size={16} />, href: '/admin/settings' },
  ];

  return (
    <nav className="flex gap-2 border-b border-slate-200 dark:border-white/10 overflow-x-auto pb-4 no-scrollbar mb-8" aria-label="Admin navigation">
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <Link key={tab.id} href={tab.href} className="no-underline">
            <button
              className={`
                px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm flex items-center gap-2
                transition-all duration-300 whitespace-nowrap border border-solid cursor-pointer
                ${isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg border-indigo-600'
                  : 'text-slate-500 dark:text-gray-400 bg-slate-100 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'
                }
              `}
            >
              <span className="flex items-center justify-center">{tab.icon}</span>
              {tab.label}
            </button>
          </Link>
        );
      })}
    </nav>
  );
}
