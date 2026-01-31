import { Colors } from "constants/Styles";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, useColorScheme, View } from "react-native";

export default function GameLocationSkeleton() {
  const isDark = useColorScheme() === "dark";

  // Shared pulse animation value
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  function SkeletonBlock({ style }: { style: any }) {
    return <Animated.View style={[style, { opacity: pulseAnim }]} />;
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? Colors.dark.itemBackground
            : Colors.light.itemBackground,
        },
      ]}
    >
      {/* Title */}
      <SkeletonBlock style={styles.title} />

      {/* Image */}
      <SkeletonBlock style={styles.image} />

      {/* Text */}
      <SkeletonBlock style={styles.text} />
      <SkeletonBlock style={styles.temperature} />
      <SkeletonBlock style={styles.capacity} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  title: {
    width: 120,
    height: 28,
    borderRadius: 6,
    marginBottom: 16,
    backgroundColor: Colors.midTone,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: Colors.midTone,
  },
  text: {
    width: "80%",
    height: 16,
    borderRadius: 6,
    marginTop: 12,
    backgroundColor: Colors.midTone,
  },
  temperature: {
    width: "40%",
    height: 16,
    borderRadius: 6,
    marginTop: 12,
    backgroundColor: Colors.midTone,
  },
  capacity: {
    width: "20%",
    height: 16,
    borderRadius: 6,
    marginTop: 12,
    backgroundColor: Colors.midTone,
  },
});
