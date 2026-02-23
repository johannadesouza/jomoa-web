import React, { createContext, useContext, useEffect, useState } from "react";
import { getItem, setItem } from "../../lib/store/storage";
import { storageKeys } from "../../lib/store/storage";

export type ThemeMode = "light" | "dark";

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    getItem<ThemeMode>(storageKeys.PREFERRED_THEME).then((saved) => {
      if (saved === "light" || saved === "dark") {
        setThemeState(saved);
      }
      setIsLoaded(true);
    });
  }, []);

  const setTheme = (next: ThemeMode) => {
    setThemeState(next);
    setItem(storageKeys.PREFERRED_THEME, next);
  };

  const value: ThemeContextValue = {
    theme,
    setTheme,
    isDark: theme === "dark",
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
