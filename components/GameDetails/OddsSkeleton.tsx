import HeaderSkeleton from "components/Headings/HeaderSkeleton";
import { Colors } from "constants/Colors";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, useColorScheme, View } from "react-native";
// Reusable pulsing component
const Pulse = ({ style, color }: { style?: any; color: string }) => {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 1300,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return <Animated.View style={[style, { backgroundColor: color, opacity }]} />;
};

export const OddsSkeleton = () => {
  const isDark = useColorScheme() === "dark";

  const skeletonColor = isDark ? Colors.darkGray : Colors.lightGray;

  return (
    <View style={[styles.container]}>
      {/* Header Row Skeleton */}
      <HeaderSkeleton style={{ marginLeft: 0 }} />

    
      <View style={styles.headerRow}>
        <Pulse
          style={[styles.headerCell, { flex: 1, marginRight: 12 }]}
          color={skeletonColor}
        />
        {[...Array(3)].map((_, i) => (
          <Pulse
            key={`header-${i}`}
            style={[
              styles.headerCell,
              { flex: 0.2, marginLeft: i === 0 ? 12 : 8 },
            ]}
            color={skeletonColor}
          />
        ))}
      </View>
      {/* Away Team Row Skeleton */}
      <View style={styles.teamRow}>
        <View style={[styles.teamInfo, { flex: 2 }]}>
          <Pulse style={styles.logoSkeleton} color={skeletonColor} />
          <Pulse style={styles.teamNameSkeleton} color={skeletonColor} />
        </View>

        {[...Array(3)].map((_, i) => (
          <Pulse
            key={`away-odd-${i}`}
            style={[
              styles.oddsCell,
              { flex: 0.5, marginLeft: i === 0 ? 12 : 8 },
            ]}
            color={skeletonColor}
          />
        ))}
      </View>

      {/* Divider */}
      <View
        style={{
          borderBottomColor: Colors.midTone,
          borderBottomWidth: 1,
          marginVertical: 8,
        }}
      />

      {/* Home Team Row Skeleton */}
      <View style={styles.teamRow}>
        <View style={[styles.teamInfo, { flex: 2 }]}>
          <Pulse style={styles.logoSkeleton} color={skeletonColor} />
          <Pulse style={styles.teamNameSkeleton} color={skeletonColor} />
        </View>

        {[...Array(3)].map((_, i) => (
          <Pulse
            key={`home-odd-${i}`}
            style={[
              styles.oddsCell,
              { flex: 0.5, marginLeft: i === 0 ? 12 : 8 },
            ]}
            color={skeletonColor}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    borderRadius: 12,
    marginBottom: 10,
    paddingHorizontal: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  headerCell: {
    height: 8,
    borderRadius: 6,
  },
  teamRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  teamInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoSkeleton: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  teamNameSkeleton: {
    width: 100,
    height: 16,
    borderRadius: 6,
    marginLeft: 8,
  },
  oddsCell: {
    height: 16,
    borderRadius: 6,
  },
});

export default OddsSkeleton;
