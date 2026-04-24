import { useState, useEffect } from 'react';

/**
 * Manages light/dark theme state.
 * - Reads initial value from localStorage (falls back to 'dark').
 * - Syncs by toggling the `dark` class on <html>, which drives all Tailwind dark: variants.
 * - Persists the preference back to localStorage on every change.
 */
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('expSplitterTheme') ?? 'dark'; }
    catch { return 'dark'; }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try { localStorage.setItem('expSplitterTheme', theme); } catch { /* storage blocked */ }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return { theme, toggleTheme };
}