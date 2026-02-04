// components/WeekSelectorSkeleton.tsx
import { Colors } from "constants/Styles";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, useColorScheme, View } from "react-native";

export default function MonthSelectorSkeleton({
  itemCount = 10,
}: {
  itemCount?: number;
}) {
  const isDark = useColorScheme() === "dark";
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
      ])
    ).start();
  }, [pulseAnim]);

  const SkeletonBlock = ({ style }: { style: any }) => (
    <Animated.View style={[style, { opacity: pulseAnim }]} />
  );

  return (
    <View style={styles.container}>
      {Array.from({ length: itemCount }).map((_, i) => (
        <View key={i} style={styles.buttonContainer}>
          <SkeletonBlock style={styles.month} />
          <SkeletonBlock style={styles.gameCount} />
        </View>
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
    buttonContainer: {
      gap: 4,
      justifyContent: "center",
      alignItems: "center",
    },
    month: {
      width: 60,
      height: 16,
      borderRadius: 12,
      marginRight: 8,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    gameCount: {
      width: 30,
      height: 12,
      borderRadius: 12,
      marginRight: 8,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
  });
