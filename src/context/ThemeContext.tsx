// this context manages the app's theme (dark/light mode)
// it syncs with system preferences and allows manual toggling

import React, { createContext, useState, useContext, useEffect } from "react";
import { useColorScheme } from "react-native";

// functions available through the context
type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// provider component that wraps the app
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // get system color scheme and set initial theme
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === "dark");

  // update theme when system preference changes
  useEffect(() => {
    setIsDark(systemColorScheme === "dark");
  }, [systemColorScheme]);

  // toggle between dark and light mode
  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// hook to use theme in components
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
