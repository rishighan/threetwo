/**
 * @fileoverview Custom React hook for managing dark/light theme mode.
 * Provides theme persistence using localStorage and applies theme classes
 * to the document root element for CSS-based theming.
 * @module hooks/useDarkMode
 */

import React, { useEffect, useState } from "react";

/**
 * Custom hook for managing dark mode theme state.
 * Persists the user's theme preference to localStorage and applies
 * the appropriate CSS class to the document root element.
 *
 * @returns {[string, React.Dispatch<React.SetStateAction<string>>]} A tuple containing:
 *   - theme: The current theme value ("dark" or "light")
 *   - setTheme: State setter function to change the theme
 * @example
 * const [theme, setTheme] = useDarkMode();
 *
 * // Toggle theme
 * const toggleTheme = () => {
 *   setTheme(theme === "dark" ? "light" : "dark");
 * };
 *
 * // Use in JSX
 * <button onClick={toggleTheme}>
 *   Current theme: {theme}
 * </button>
 */
export const useDarkMode = () => {
  const [theme, setTheme] = useState(localStorage.theme);
  const colorTheme = theme === "dark" ? "light" : "dark";

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(colorTheme);
    root.classList.add(theme);

    // save theme to local storage
    localStorage.setItem("theme", theme);
  }, [theme, colorTheme]);

  return [theme, setTheme];
};
