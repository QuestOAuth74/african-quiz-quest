import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'brown-gold' | 'lake';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Graceful fallback to avoid crashes if used outside provider (e.g., during initial mount)
    const fallback: ThemeContextType = {
      theme: (typeof window !== 'undefined' && (localStorage.getItem('app-theme') as Theme)) || 'brown-gold',
      setTheme: () => {},
      toggleTheme: () => {},
    };
    return fallback;
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('app-theme');
    return (saved as Theme) || 'brown-gold';
  });

  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    
    // Remove all theme classes first
    document.documentElement.classList.remove('theme-brown-gold', 'theme-lake');
    
    // Add the new theme class
    document.documentElement.classList.add(`theme-${theme}`);
    
    // Debug logging to verify theme switching
    console.log('Theme switched to:', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'brown-gold' ? 'lake' : 'brown-gold');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};