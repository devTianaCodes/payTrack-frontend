import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const storageKey = 'paytrack-theme';
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem(storageKey) ?? 'light');

  useEffect(() => {
    localStorage.setItem(storageKey, theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const value = useMemo(
    () => ({
      isDarkMode: theme === 'dark',
      setDarkMode(isEnabled) {
        setTheme(isEnabled ? 'dark' : 'light');
      },
      theme,
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }

  return context;
}
