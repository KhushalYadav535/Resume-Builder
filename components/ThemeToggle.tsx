'use client';

import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    // Prevent hydration mismatch — render a placeholder
    return <div className="w-16 h-8 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse" />;
  }

  return (
    <button
      onClick={() => toggleTheme()}
      style={{
        position: "relative",
        width: "64px",
        height: "32px",
        borderRadius: "9999px",
        background: "linear-gradient(to right, #6366f1, #a855f7)",
        display: "flex",
        alignItems: "center",
        transition: "all 0.3s",
        border: "none",
        cursor: "pointer",
        padding: "0 4px",
        flexShrink: 0,
        marginRight: "8px"
      }}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      title={`Current theme: ${theme}`}
    >
      {/* Animated background circle */}
      <div
        style={{
          position: "absolute",
          width: "24px",
          height: "24px",
          backgroundColor: "#ffffff",
          borderRadius: "50%",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          transition: "transform 0.3s",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: theme === 'light' ? 'translateX(2px)' : 'translateX(30px)',
        }}
      >
        {theme === 'light' ? (
          <Sun size={16} className="text-amber-500" strokeWidth={2.5} />
        ) : (
          <Moon size={16} className="text-indigo-600" strokeWidth={2.5} />
        )}
      </div>

      {/* Invisible label for accessibility */}
      <span className="sr-only">
        {theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      </span>
    </button>
  );
}
