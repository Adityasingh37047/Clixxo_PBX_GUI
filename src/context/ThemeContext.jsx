import React, { useCallback, useEffect, useMemo, useState } from "react";
import ThemeContext from "./themeContextInstance";

const THEME_STORAGE_KEY = "clixxo-theme";

const applyThemeClass = (theme) => {
  const isDark = theme === "dark";
  document.body.classList.toggle("dark", isDark);
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
};

const readStoredTheme = () => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(readStoredTheme);

  useEffect(() => {
    applyThemeClass(theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      /* ignore storage errors */
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const setThemeMode = useCallback((mode) => {
    setTheme(mode === "dark" ? "dark" : "light");
  }, []);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === "dark",
      toggleTheme,
      setTheme: setThemeMode,
    }),
    [theme, toggleTheme, setThemeMode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
