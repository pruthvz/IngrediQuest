// this component provides a layout for authentication pages (login/register)
// it centers content and limits the width on web platforms

import React from "react";
import { View, Platform, StyleSheet } from "react-native";
import FontAwesomeScript from "./FontAwesomeScript";

export default function WebAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // return normal view on mobile platforms
  if (Platform.OS !== "web") {
    return <>{children}</>;
  }

  return (
    <View style={styles.container as any}>
      <FontAwesomeScript />
      <View style={styles.content as any}>{children}</View>
    </View>
  );
}

// styles for the layout
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    minHeight: "100%", // makes container fill the screen
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    width: "100%",
    maxWidth: 480, // limits content width on larger screens
    padding: 20,
  },
});
