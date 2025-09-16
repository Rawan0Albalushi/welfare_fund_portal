import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  actualMode: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const AppThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem('theme') as ThemeMode) || 'system';
  });

  const [actualMode, setActualMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const updateActualMode = () => {
      if (mode === 'system') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setActualMode(systemPrefersDark ? 'dark' : 'light');
      } else {
        setActualMode(mode);
      }
    };

    updateActualMode();
    localStorage.setItem('theme', mode);

    if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', updateActualMode);
      return () => mediaQuery.removeEventListener('change', updateActualMode);
    }
  }, [mode]);

  // Apply Tailwind dark mode class to document
  useEffect(() => {
    const root = document.documentElement;
    if (actualMode === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-mui-color-scheme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-mui-color-scheme', 'light');
    }
  }, [actualMode]);

  return (
    <ThemeContext.Provider value={{ mode, setMode, actualMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
