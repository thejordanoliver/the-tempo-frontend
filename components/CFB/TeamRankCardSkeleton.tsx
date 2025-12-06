import { Colors } from "constants/Colors";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, useColorScheme } from "react-native";

export default function TeamRankCardSkeleton() {
  const isDark = useColorScheme() === "dark";

  // Pulse animation
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const bg = isDark ? Colors.darkGray : Colors.lightGray;

  return (
    <Animated.View style={[styles.cardWrapper, { opacity }]}>
      {/* Right-side watermark block */}

      {/* Fake gradient strip */}
      <View style={styles.cardGradient} />

      {/* Content */}
      <View style={styles.cardContent}>
        <View style={styles.row}>
          {/* Rank block */}
          <View style={[styles.rankBlock, { backgroundColor: bg }]} />

          {/* Team name block */}
          <View style={[styles.teamNameBlock, { backgroundColor: bg }]} />
        </View>

        {/* Points line */}
        <View style={[styles.pointsBlock, { backgroundColor: bg }]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    overflow: "hidden",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(150,150,150,0.25)",
    position: "relative",
    paddingVertical: 10,
  },

  /* Logo watermark */
  logoContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "45%",
    justifyContent: "center",
    alignItems: "flex-end",
    overflow: "hidden",
  },

  backgroundLogo: {
    height: "200%",
    aspectRatio: 1,
    opacity: 0.3,
    marginRight: -40,
    borderRadius: 12,
  },

  /* Gradient placeholder */
  cardGradient: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "110%",
    opacity: 0.25,
  },

  cardContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },

  rankBlock: {
    width: 40,
    height: 28,
    borderRadius: 6,
  },

  teamNameBlock: {
    height: 28,
    width: 160,
    borderRadius: 100,
  },

  pointsBlock: {
    marginTop: 6,
    height: 18,
    width: 120,
    borderRadius: 6,
  },
});
