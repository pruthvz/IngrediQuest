// provides theme context to the app based on system color scheme
// automatically switches between light and dark theme
import React from "react";
import { useColorScheme } from "react-native";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // get system color scheme (light/dark)
  const colorScheme = useColorScheme();

  return (
    // wrap children with theme provider using system theme
    <NavigationThemeProvider
      value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
    >
      {children}
    </NavigationThemeProvider>
  );
}
