import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 1. Check localStorage first
    const saved = localStorage.getItem('resume-optimizer-theme') as Theme | null;
    
    if (saved) {
      // User has chosen a theme before
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    } else {
      // No saved preference — check system preference
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      
      setTheme(systemPreference);
      document.documentElement.setAttribute('data-theme', systemPreference);
      localStorage.setItem('resume-optimizer-theme', systemPreference);
    }
    
    setMounted(true);
  }, []);

  // Toggle function
  const toggleTheme = (newTheme?: Theme) => {
    const next = newTheme || (theme === 'dark' ? 'light' : 'dark');
    
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('resume-optimizer-theme', next);

    // Optional: emit custom event so other tabs can sync
    window.dispatchEvent(new CustomEvent('theme-change', { detail: { theme: next } }));
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'resume-optimizer-theme' && e.newValue) {
        setTheme(e.newValue as Theme);
        document.documentElement.setAttribute('data-theme', e.newValue);
      }
    };
  
    const handleThemeChangeEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ theme: Theme }>;
      setTheme(customEvent.detail.theme);
      document.documentElement.setAttribute('data-theme', customEvent.detail.theme);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+T to toggle theme
      if (e.ctrlKey && e.shiftKey && e.code === 'KeyT') {
        e.preventDefault();
        setTheme((prevTheme) => {
          const next = prevTheme === 'dark' ? 'light' : 'dark';
          document.documentElement.setAttribute('data-theme', next);
          localStorage.setItem('resume-optimizer-theme', next);
          window.dispatchEvent(new CustomEvent('theme-change', { detail: { theme: next } }));
          return next;
        });
      }
    };
  
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('theme-change', handleThemeChangeEvent);
    window.addEventListener('keydown', handleKeyDown);
  
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('theme-change', handleThemeChangeEvent);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return {
    theme,
    toggleTheme,
    mounted, // Use this to prevent hydration mismatch
  };
}
