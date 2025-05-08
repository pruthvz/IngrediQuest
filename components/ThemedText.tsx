// themed text component that adapts to light/dark mode
// supports different text styles like title, subtitle, etc.
import { Text, type TextProps, StyleSheet } from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";

// props extend regular text props with theme colors and text type
export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default", // default to regular text style
  ...rest
}: ThemedTextProps) {
  // get the right color based on theme
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return (
    <Text
      style={[
        { color },
        // apply the right text style based on type
        type === "default" ? styles.default : undefined,
        type === "title" ? styles.title : undefined,
        type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "link" ? styles.link : undefined,
        style, // custom styles override defaults
      ]}
      {...rest}
    />
  );
}

// predefined text styles for different uses
const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24, // comfortable reading height
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600", // slightly bolder than regular
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 32, // tighter for titles
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: "#0a7ea4", // blue link color
  },
});
