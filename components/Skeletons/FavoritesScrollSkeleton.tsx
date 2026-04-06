import { Colors } from "constants/styles";
import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  useColorScheme,
} from "react-native";
import { favoritesScrollSkeletonStyles } from "styles/HomeStyles/FavoritesScrollSkeletonStyles";

export default function FavoritesScrollSkeleton() {
  const isDark = useColorScheme() === "dark";
  const styles = favoritesScrollSkeletonStyles(isDark);

  // Smooth breathing shimmer animation
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      { resetBeforeIteration: false },
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
    <View style={styles.wrapper}>
      {Array.from({ length: 4 }).map((_, index) => (
        <View key={index} style={styles.skeletonItem}>
          {/* Circle (team logo placeholder) */}
          <View style={styles.circleWrapper}>
            <View
              style={[
                styles.circle,
                { backgroundColor: baseColor, overflow: "hidden" },
              ]}
            >
              <Animated.View
                style={[
                  StyleSheet.absoluteFillObject,
                  {
                    backgroundColor: overlayColor,
                    opacity: pulseAnim,
                  },
                ]}
              />
            </View>
          </View>

          {/* Label (team name placeholder) */}
          <View style={styles.labelWrapper}>
            <View
              style={[
                styles.label,
                { backgroundColor: baseColor, overflow: "hidden" },
              ]}
            >
              <Animated.View
                style={[
                  StyleSheet.absoluteFillObject,
                  {
                    backgroundColor: overlayColor,
                    opacity: pulseAnim,
                  },
                ]}
              />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}
