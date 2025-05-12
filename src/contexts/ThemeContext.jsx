import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

/**
 * ThemeProvider component - Manages application theme settings (light/dark mode)
 * 
 * @param {ReactNode} children - Child components
 */
export const ThemeProvider = ({ children }) => {
  // Check if dark mode is saved in localStorage or use system preference
  const getSavedTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
      return savedTheme;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  };
  
  const [theme, setTheme] = useState(() => getSavedTheme());
  
  // Apply theme when it changes
  useEffect(() => {
    const root = window.document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Save theme to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      const savedTheme = localStorage.getItem('theme');
      
      // Only follow system preference if theme is not explicitly set
      if (!savedTheme) {
        setTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };
    
    // Add event listener
    mediaQuery.addEventListener('change', handleChange);
    
    // Clean up
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  // Toggle theme
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  // Set specific theme
  const setThemeMode = (mode) => {
    if (mode === 'light' || mode === 'dark' || mode === 'system') {
      if (mode === 'system') {
        // Clear localStorage and use system preference
        localStorage.removeItem('theme');
        const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        setTheme(systemPreference);
      } else {
        setTheme(mode);
      }
    }
  };
  
  const value = {
    theme,
    isDarkMode: theme === 'dark',
    toggleTheme,
    setTheme: setThemeMode,
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default ThemeContext; 