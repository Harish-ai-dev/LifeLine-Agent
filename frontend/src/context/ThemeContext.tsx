'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ALWAYS default to light — clear any stale dark preference
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    // Wipe any old dark-mode preference from localStorage
    // so every fresh load starts in light mode
    const saved = localStorage.getItem('lifeline_theme') as Theme | null;
    if (saved === 'dark') {
      // Override: reset to light
      localStorage.setItem('lifeline_theme', 'light');
    }
    // Always ensure html element has no 'dark' class
    document.documentElement.classList.remove('dark');
    setThemeState('light');
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('lifeline_theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
