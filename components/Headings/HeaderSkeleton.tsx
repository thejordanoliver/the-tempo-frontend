// components/Games/Headings/HeaderSkeleton.tsx
import { Colors } from "constants/Colors";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";

export default function HeaderSkeleton() {
  const isDark = useColorScheme() === "dark";
  const pulseAnim = useRef(new Animated.Value(0.3)).current; // start at low opacity

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease), // ✅ use Easing directly
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1200,
          easing: Easing.inOut(Easing.ease), // ✅ use Easing directly
          useNativeDriver: true,
        }),
      ]),
      { resetBeforeIteration: false } // keeps it perfectly continuous
    );

    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const baseColor = isDark
    ? Colors.dark.itemBackground
    : Colors.light.itemBackground;

  const overlayColor = isDark
    ? "rgba(136, 136, 136, 0.5)"
    : "rgba(136, 136, 136, 0.5)";

  return (
    <View style={styles.container}>
      <View style={[styles.skeletonBase, { backgroundColor: baseColor }]}>
        <Animated.View
          style={[
            styles.overlay,
            {
              backgroundColor: overlayColor,
              opacity: pulseAnim,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginHorizontal: 12,
  },
  skeletonBase: {
    height: 28,
    width: 160,
    borderRadius: 6,
    overflow: "hidden",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 6,
  },
});
