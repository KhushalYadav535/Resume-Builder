'use client';

import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return <div className="w-9 h-9 rounded-full bg-white/10 animate-pulse" />;
  }

  return (
    <button
      onClick={() => toggleTheme()}
      className="w-9 h-9 rounded-full border border-white/20 bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200 shrink-0"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      title={`Current theme: ${theme}`}
    >
      {theme === 'light' ? (
        <Moon size={16} className="text-slate-200" />
      ) : (
        <Sun size={16} className="text-amber-400" />
      )}
    </button>
  );
}
