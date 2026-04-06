import { Colors } from "constants/styles";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, useColorScheme } from "react-native";

export default function DraftCardSkeleton() {
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
      ]),
    ).start();
  }, []);

  const bg = isDark ? Colors.darkGray : Colors.lightGray;

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      {/* Headshot + Name Row */}
      <View style={styles.headerRow}>
        <View style={[styles.headshot, { backgroundColor: bg }]} />
        <View style={[styles.nameBar, { backgroundColor: bg }]} />
        <View style={[styles.rankBadge, { backgroundColor: bg }]} />
      </View>

      {/* Bio row 1 */}
      <View style={[styles.starLine, { backgroundColor: bg }]} />

      {/* Bio row 2 */}
      <View style={[styles.locationLine, { backgroundColor: bg }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    gap: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(150,150,150,0.2)",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  headshot: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },

  nameBar: {
    height: 18,
    width: 140,
    borderRadius: 100,
    marginLeft: 10,
  },

  rankBadge: {
    height: 18,
    width: 45,
    borderRadius: 6,
    marginLeft: "auto",
  },

  starLine: {
    height: 14,
    width: 180,
    borderRadius: 6,
    marginBottom: 10,
  },

  locationLine: {
    height: 14,
    width: 210,
    borderRadius: 6,
    marginBottom: 10,
  },

  commitLine: {
    height: 14,
    width: 130,
    borderRadius: 6,
  },
});
