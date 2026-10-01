'use client';

import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return <div className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] animate-pulse" />;
  }

  return (
    <button
      type="button"
      onClick={() => toggleTheme()}
      className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] hover:border-amber-500/40 text-[var(--text-secondary)] hover:text-amber-500 flex items-center justify-center transition-all duration-200 shrink-0 shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      title={`Current theme: ${theme}`}
    >
      {theme === 'light' ? (
        <Moon size={17} className="text-slate-700" />
      ) : (
        <Sun size={17} className="text-amber-400" />
      )}
    </button>
  );
}
