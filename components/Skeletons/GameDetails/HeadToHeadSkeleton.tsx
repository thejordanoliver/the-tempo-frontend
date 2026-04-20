import { Colors } from "constants/styles";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import HeaderSkeleton from "../HeaderSkeleton";
import { usePreferences } from "contexts/PreferencesContext";

export default function HeadToHeadSkeleton() {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = getStyles(isDark);

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
  }, []);

  const Block = ({ style }: { style: any }) => (
    <Animated.View style={[style, { opacity: pulseAnim }]} />
  );

  const borderBottomColor = pulseAnim.interpolate({
    inputRange: [0.3, 1],
    outputRange: [
      isDark ? Colors.darkGray : Colors.midTone,
      isDark ? Colors.lightGray : Colors.midTone,
    ],
  });

  return (
    <View style={styles.container}>
      <HeaderSkeleton />
      {/* Series Score */}
      <Block style={styles.seriesSkeleton} />

      {/* Game Rows */}
      {[1, 2, 3].map((_, i) => (
        <View key={i} style={styles.row}>
          <View style={styles.team}>
            <Block style={styles.logo} />
            <Block style={styles.teamText} />
          </View>

          <Block style={styles.score} />

          <View style={styles.team}>
            <Block style={styles.logo} />
            <Block style={styles.teamText} />
          </View>
        </View>
      ))}
    </View>
  );
}

const getStyles = (isDark: boolean) => {
  const skeletonColor = isDark ? Colors.darkGray : Colors.lightGray;

  return StyleSheet.create({
    container: {
      marginTop: 12,
      gap: 12,
    },

    /* =========================
       SERIES TEXT
    ========================= */
    seriesSkeleton: {
      width: 140,
      height: 16,
      borderRadius: 6,
      backgroundColor: skeletonColor,
      alignSelf: "center",
    },

    /* =========================
       ROW
    ========================= */
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 10,
    },

    team: {
      alignItems: "center",
      width: 70,
    },

    logo: {
      width: 28,
      height: 28,
      borderRadius: 100,
      backgroundColor: skeletonColor,
    },

    teamText: {
      width: 40,
      height: 10,
      borderRadius: 4,
      backgroundColor: skeletonColor,
      marginTop: 4,
    },

    score: {
      width: 50,
      height: 16,
      borderRadius: 6,
      backgroundColor: skeletonColor,
    },
  });
};
