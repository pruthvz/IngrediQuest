// themed view component that adapts its background color
// based on whether the app is in light or dark mode
import { View, type ViewProps } from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";

// props extend regular view props with theme colors
export type ThemedViewProps = ViewProps & {
  lightColor?: string; // custom light mode color
  darkColor?: string; // custom dark mode color
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedViewProps) {
  // get the right background color based on theme
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background"
  );

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
