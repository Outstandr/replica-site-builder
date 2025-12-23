import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type GenderTheme = 'female' | 'male';

interface ThemeContextType {
  theme: GenderTheme;
  toggleTheme: () => void;
  setTheme: (theme: GenderTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<GenderTheme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gender-theme');
      return (saved as GenderTheme) || 'female';
    }
    return 'female';
  });

  useEffect(() => {
    // Set data-theme attribute on document.documentElement (html tag)
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('gender-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'female' ? 'male' : 'female');
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
