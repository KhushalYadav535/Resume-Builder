import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 1. Check localStorage first
    const saved = localStorage.getItem('resume-optimizer-theme') as Theme | null;
    
    const applyTheme = (t: Theme) => {
      setTheme(t);
      document.documentElement.setAttribute('data-theme', t);
      if (t === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    if (saved) {
      // User has chosen a theme before
      applyTheme(saved);
    } else {
      // No saved preference — check system preference
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      
      applyTheme(systemPreference);
      localStorage.setItem('resume-optimizer-theme', systemPreference);
    }
    
    setMounted(true);
  }, []);

  // Toggle function
  const toggleTheme = (newTheme?: Theme) => {
    const next = newTheme || (theme === 'dark' ? 'light' : 'dark');
    
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('resume-optimizer-theme', next);

    // Optional: emit custom event so other tabs can sync
    window.dispatchEvent(new CustomEvent('theme-change', { detail: { theme: next } }));
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'resume-optimizer-theme' && e.newValue) {
        const val = e.newValue as Theme;
        setTheme(val);
        document.documentElement.setAttribute('data-theme', val);
        if (val === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };
  
    const handleThemeChangeEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ theme: Theme }>;
      const val = customEvent.detail.theme;
      setTheme(val);
      document.documentElement.setAttribute('data-theme', val);
      if (val === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
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
