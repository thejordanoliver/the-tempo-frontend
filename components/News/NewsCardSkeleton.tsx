import { Colors } from "constants/Colors";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, useColorScheme, View } from "react-native";

type PulseBlockProps = {
  style?: any;
};

export default function NewsCardSkeleton() {
  const isDark = useColorScheme() === "dark";
  const styles = newsCardSkeletonStyles(isDark);

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
      ])
    ).start();
  }, [pulseAnim]);

  const baseColor = isDark
    ? Colors.dark.itemBackground
    : Colors.light.itemBackground;

  const shimmerColor = isDark ? Colors.darkGray : Colors.lightGray;

  const PulseBlock = ({ style }: PulseBlockProps) => (
    <Animated.View
      style={[
        style,
        {
          opacity: pulseAnim,
        },
      ]}
    />
  );

  return (
    <View style={styles.card}>
      {/* Thumbnail */}
      <PulseBlock style={styles.thumbnail} />

      <View style={styles.content}>
        {/* Title */}
        <PulseBlock style={styles.title} />

        {/* Source */}
        <PulseBlock style={styles.source} />
      </View>
    </View>
  );
}

const newsCardSkeletonStyles = (isDark: boolean) =>
  StyleSheet.create({
    card: {
      borderRadius: 8,
      overflow: "hidden",
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderWidth: 1,
    },

    content: {
      padding: 12,
    },

    thumbnail: {
      height: 300,
      width: "100%",
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    title: {
      height: 16,
      width: "60%",
      borderRadius: 8,
      marginTop: 12,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    source: {
      height: 12,
      width: "20%",
      borderRadius: 8,
      marginTop: 10,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
  });
