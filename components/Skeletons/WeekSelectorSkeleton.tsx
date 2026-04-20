// components/WeekSelectorSkeleton.tsx
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

export default function WeekSelectorSkeleton({
  itemCount = 10,
}: {
  itemCount?: number;
}) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = getStyles(isDark);

  // Pulse animation
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

  const SkeletonBlock = ({ style }: { style: any }) => (
    <Animated.View style={[style, { opacity: pulseAnim }]} />
  );

  return (
    <View style={styles.container}>
      {Array.from({ length: itemCount }).map((_, i) => (
        <SkeletonBlock key={i} style={styles.weekButton} />
      ))}
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      marginVertical: 8,
      paddingVertical: 6,
      paddingHorizontal: 4,
    },
    weekButton: {
      width: 60,
      height: 16,
      borderRadius: 12,
      marginRight: 8,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
  });
