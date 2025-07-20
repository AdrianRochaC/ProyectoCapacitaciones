import React, { useState, useEffect } from 'react';
import { getCurrentTheme, toggleTheme, getThemeIcon, getThemeText } from '../utils/theme';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const [theme, setThemeState] = useState(getCurrentTheme());

  useEffect(() => {
    // Actualizar el estado cuando cambie el tema
    const handleStorageChange = () => {
      setThemeState(getCurrentTheme());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleToggle = () => {
    const newTheme = toggleTheme();
    setThemeState(newTheme);
  };

  return (
    <button 
      className="theme-toggle-btn" 
      onClick={handleToggle}
      title={getThemeText(theme)}
      aria-label={getThemeText(theme)}
    >
      <span className="theme-icon">{getThemeIcon(theme)}</span>
    </button>
  );
};

export default ThemeToggle; 