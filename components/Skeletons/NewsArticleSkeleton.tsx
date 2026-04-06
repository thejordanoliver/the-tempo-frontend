// components/NewsArticleSkeleton.tsx
import { Colors } from "constants/styles";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, useColorScheme, View } from "react-native";
export default function NewsArticleSkeleton() {
  const isDark = useColorScheme() === "dark";

  // 🔁 Master animation value
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
      ]),
    ).start();
  }, [pulseAnim]);

  const baseColor = isDark
    ? Colors.dark.itemBackground
    : Colors.light.itemBackground;

  const PulseBlock = ({ style }: { style: any }) => (
    <Animated.View
      style={[
        styles.block,
        style,
        {
          backgroundColor: baseColor,
          opacity: pulseAnim,
        },
      ]}
    />
  );

  return (
    <View style={styles.container}>
      {/* Title placeholders */}
      <PulseBlock style={styles.title} />
      <PulseBlock style={styles.titleRowTwo} />

      {/* Image placeholder */}
      <PulseBlock style={styles.image} />

      {/* Content line placeholders */}
      {[...Array(12)].map((_, i) => (
        <PulseBlock
          key={i}
          style={[styles.contentLine, { width: i === 11 ? "70%" : "100%" }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 12 },
  block: {
    borderRadius: 8,
    marginBottom: 12,
  },

  title: {
    height: 28,
    width: "60%",
    marginBottom: 20,
  },

  titleRowTwo: {
    height: 28,
    width: "80%",
    marginBottom: 20,
  },

  image: {
    height: 180,
    width: "100%",
    borderRadius: 8,
    marginBottom: 20,
  },

  contentLine: {
    height: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
});
