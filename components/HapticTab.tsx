// adds haptic feedback to bottom tab bar buttons on ios
// gives a light tap feeling when pressing tabs
import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import * as Haptics from "expo-haptics";

export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        // only add haptics on ios devices
        if (process.env.EXPO_OS === "ios") {
          // light haptic feedback when pressing tab
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        // call original onPressIn if it exists
        props.onPressIn?.(ev);
      }}
    />
  );
}
