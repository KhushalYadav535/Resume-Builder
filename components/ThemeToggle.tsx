'use client';

import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return <div className="w-9 h-9 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] animate-pulse" />;
  }

  return (
    <button
      onClick={() => toggleTheme()}
      className="w-9 h-9 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] hover:border-amber-500/40 text-[var(--text-secondary)] hover:text-amber-500 flex items-center justify-center transition-all duration-200 shrink-0 shadow-xs cursor-pointer"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      title={`Current theme: ${theme}`}
    >
      {theme === 'light' ? (
        <Moon size={16} className="text-slate-700" />
      ) : (
        <Sun size={16} className="text-amber-400" />
      )}
    </button>
  );
}
