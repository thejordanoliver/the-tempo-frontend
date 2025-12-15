import { Colors } from "constants/Colors";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";

export default function GameCardSkeleton() {
  const isDark = useColorScheme() === "dark";
  const styles = getStyles(isDark);

  // Shared pulse animation for all skeleton parts
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
    <View style={styles.card}>
      {/* Top Team */}
      <View style={styles.teamSection}>
        <SkeletonBlock style={styles.logoSkeleton} />
        <SkeletonBlock style={styles.nameSkeleton} />
      </View>

      {/* Top Score */}
      <SkeletonBlock style={styles.scoreSkeleton} />

      {/* Game Info */}
      <View style={styles.info}>
        <SkeletonBlock style={styles.timeSkeleton} />
        <SkeletonBlock style={styles.broadcastSkeleton} />
      </View>

      {/* Bottom Score */}
      <SkeletonBlock style={styles.scoreSkeleton} />

      {/* Bottom Team */}
      <View style={styles.teamSection}>
        <SkeletonBlock style={styles.logoSkeleton} />
        <SkeletonBlock style={styles.nameSkeleton} />
      </View>
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      borderRadius: 8,
     paddingVertical: 18,
      paddingHorizontal: 20,
      alignItems: "center",
      justifyContent: "space-evenly",
    },
    teamSection: {
      alignItems: "center",
      width: 80,
    },
    logoSkeleton: {
      width: 40,
      height: 40,
      borderRadius: 100,
      backgroundColor: isDark
        ? Colors.darkGray
        : Colors.lightGray,
      marginBottom: 4,
    },
    nameSkeleton: {
      width: 40,
      height: 12,
      borderRadius: 4,
      backgroundColor: isDark
        ? Colors.darkGray
        : Colors.lightGray,
    },
    scoreSkeleton: {
      width: 40,
      height: 20,
      borderRadius: 6,
      backgroundColor: isDark
        ? Colors.darkGray
        : Colors.lightGray,
    },
    info: {
      alignItems: "center",
      justifyContent: "center",
      width: 120,
    },
    broadcastSkeleton: {
      width: 40,
      height: 12,
      borderRadius: 6,
      backgroundColor: isDark
        ? Colors.darkGray
        : Colors.lightGray,
    },
    timeSkeleton: {
      width: 80,
      height: 12,
      marginVertical: 6,
      borderRadius: 6,
      backgroundColor: isDark
        ? Colors.darkGray
        : Colors.lightGray,
    },
  });
