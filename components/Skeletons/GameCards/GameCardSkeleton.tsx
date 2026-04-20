import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

export default function GameCardSkeleton() {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
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
      ]),
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

const getStyles = (isDark: boolean) => {
  const skeletonColor = isDark ? Colors.darkGray : Colors.lightGray;

  return StyleSheet.create({
    /* =========================
       🧱 CARD LAYOUT (match real)
    ========================= */
    card: {
      flexDirection: "row",
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      borderRadius: 8,
      padding: 14, // ✅ match real card
      alignItems: "center",
      justifyContent: "space-between",
    },

    /* =========================
       🏀 TEAM SECTION
    ========================= */
    teamSection: {
      alignItems: "center",
      width: 60,
    },

    logoSkeleton: {
      width: 40,
      height: 40,
      borderRadius: 100,
      backgroundColor: skeletonColor,
    },

    nameSkeleton: {
      width: 60, // ✅ closer to real teamName width feel
      height: 12,
      borderRadius: 4,
      backgroundColor: skeletonColor,
      marginTop: 6, // ✅ match spacing from logo → name
    },

    /* =========================
       🔢 SCORE
    ========================= */
    scoreSkeleton: {
      width: 50,
      height: 28, // ✅ match large score feel
      borderRadius: 6,
      backgroundColor: skeletonColor,
    },

    /* =========================
       📊 CENTER INFO
    ========================= */
    info: {
      alignItems: "center",
      justifyContent: "center",
      width: 120,
    },

    timeSkeleton: {
      width: 70,
      height: 14,
      borderRadius: 6,
      backgroundColor: skeletonColor,
      marginBottom: 6,
    },

    broadcastSkeleton: {
      width: 50,
      height: 10,
      borderRadius: 6,
      backgroundColor: skeletonColor,
    },
  });
};
