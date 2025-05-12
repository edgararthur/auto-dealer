import React from 'react';
import PropTypes from 'prop-types';
import { FiSun, FiMoon, FiMonitor } from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * ThemeSwitcher Component - Allows users to toggle between light and dark themes
 * @param {string} variant - Style variant (icon, dropdown, toggle)
 * @param {string} className - Additional CSS classes
 */
const ThemeSwitcher = ({ variant = 'icon', className = '' }) => {
  const { theme, toggleTheme, setTheme } = useTheme();

  // Handle theme change in dropdown
  const handleThemeChange = (e) => {
    setTheme(e.target.value);
  };

  // Simple icon button variant
  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        className={`p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 ${
          theme === 'dark'
            ? 'text-yellow-300 hover:text-yellow-200'
            : 'text-neutral-700 hover:text-neutral-900'
        } ${className}`}
        aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      >
        {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
      </button>
    );
  }

  // Dropdown variant with system option
  if (variant === 'dropdown') {
    return (
      <div className={`flex items-center ${className}`}>
        <label htmlFor="theme-select" className="sr-only">
          Choose theme
        </label>
        <div className="relative">
          <select
            id="theme-select"
            value={theme}
            onChange={handleThemeChange}
            className={`appearance-none pr-8 pl-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              theme === 'dark'
                ? 'bg-neutral-800 text-white border-neutral-700'
                : 'bg-white text-neutral-800 border-neutral-300'
            }`}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
            <span className={theme === 'dark' ? 'text-neutral-400' : 'text-neutral-500'}>
              {theme === 'light' && <FiSun size={16} />}
              {theme === 'dark' && <FiMoon size={16} />}
              {theme === 'system' && <FiMonitor size={16} />}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Toggle switch variant
  if (variant === 'toggle') {
    return (
      <div className={`flex items-center ${className}`}>
        <FiSun
          size={16}
          className={`mr-2 ${theme === 'light' ? 'text-yellow-500' : 'text-neutral-400'}`}
        />
        <label className="inline-flex relative items-center cursor-pointer">
          <input
            type="checkbox"
            value=""
            className="sr-only peer"
            checked={theme === 'dark'}
            onChange={toggleTheme}
          />
          <div className="w-11 h-6 bg-neutral-300 rounded-full peer peer-checked:bg-primary-600 peer-focus:ring-2 peer-focus:ring-primary-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
        </label>
        <FiMoon
          size={16}
          className={`ml-2 ${theme === 'dark' ? 'text-primary-400' : 'text-neutral-400'}`}
        />
      </div>
    );
  }

  return null;
};

ThemeSwitcher.propTypes = {
  variant: PropTypes.oneOf(['icon', 'dropdown', 'toggle']),
  className: PropTypes.string
};

export default ThemeSwitcher; 