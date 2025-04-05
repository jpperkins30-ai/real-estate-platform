import React, { createContext, useEffect } from 'react';
import { usePreferences } from '../hooks/usePreferences';

interface ThemeContextType {
  applyTheme: (element: HTMLElement) => void;
}

export const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { preferences } = usePreferences();
  const { colorMode, accentColor, fontSize } = preferences.theme;
  
  // Apply theme to root element when preferences change
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply color mode
    if (colorMode === 'dark') {
      root.classList.add('dark-mode');
      root.classList.remove('light-mode');
    } else if (colorMode === 'light') {
      root.classList.add('light-mode');
      root.classList.remove('dark-mode');
    } else {
      // System preference
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDarkMode) {
        root.classList.add('dark-mode');
        root.classList.remove('light-mode');
      } else {
        root.classList.add('light-mode');
        root.classList.remove('dark-mode');
      }
    }
    
    // Apply accent color if defined
    if (accentColor) {
      root.style.setProperty('--accent-color', accentColor);
    }
    
    // Apply font size if defined
    if (fontSize) {
      const fontSizes = {
        small: '14px',
        medium: '16px',
        large: '18px'
      };
      root.style.setProperty('--base-font-size', fontSizes[fontSize] || '16px');
    }
    
  }, [colorMode, accentColor, fontSize]);
  
  // Helper function to apply theme to any element
  const applyTheme = (element: HTMLElement) => {
    // Apply theme variables to the element
    if (accentColor) {
      element.style.setProperty('--accent-color', accentColor);
    }
    
    if (fontSize) {
      const fontSizes = {
        small: '14px',
        medium: '16px',
        large: '18px'
      };
      element.style.setProperty('--base-font-size', fontSizes[fontSize] || '16px');
    }
  };
  
  return (
    <ThemeContext.Provider value={{ applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}; 