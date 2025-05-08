// animated waving hand emoji component
// creates a cute waving animation by rotating the emoji
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";

export function HelloWave() {
  // track the rotation value for animation
  const rotationAnimation = useSharedValue(0);

  useEffect(() => {
    // create a sequence of rotations that:
    // 1. rotates 25 degrees in 150ms
    // 2. rotates back to 0 in 150ms
    // 3. repeats this 4 times
    rotationAnimation.value = withRepeat(
      withSequence(
        withTiming(25, { duration: 150 }),
        withTiming(0, { duration: 150 })
      ),
      4 // wave 4 times
    );
  }, []);

  // apply the rotation to the emoji
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotationAnimation.value}deg` }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <ThemedText style={styles.text}>👋</ThemedText>
    </Animated.View>
  );
}

// style the emoji text
const styles = StyleSheet.create({
  text: {
    fontSize: 28,
    lineHeight: 32,
    marginTop: -6, // adjust vertical alignment
  },
});
