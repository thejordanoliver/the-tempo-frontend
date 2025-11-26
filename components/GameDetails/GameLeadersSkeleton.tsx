import { Colors } from "constants/Colors";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;

// Reusable pulse block
const PulseBlock = ({ style }: { style: any }) => {
  const opacity = useRef(new Animated.Value(0.4)).current;
  const isDark = useColorScheme() === "dark";

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

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
        },
      ]}
    />
  );
};

const SkeletonCard = () => {
  const isDark = useColorScheme() === "dark";

  // 🔥 Pulse for border bottom
  const borderOpacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(borderOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: false, // must be false since it's a color
        }),
        Animated.timing(borderOpacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  // Interpolate between two subtle border shades
  const borderColor = borderOpacity.interpolate({
    inputRange: [0.4, 1],
    outputRange: [
      isDark ? Colors.darkGray : Colors.lightGray,
      isDark ? Colors.lightGray : Colors.darkGray,
    ],
  });

  return (
    <Animated.View
      style={[
        styles.card,
        {
          borderBottomColor: borderColor,
        },
      ]}
    >
      {/* Avatar */}
      <PulseBlock style={styles.avatar} />

      <View style={styles.infoSection}>
        {/* Name Row */}
        <View style={styles.nameRow}>
          <PulseBlock style={[styles.line, { width: 100, height: 14 }]} />
          <PulseBlock
            style={[styles.line, { width: 30, height: 12, marginLeft: 6 }]}
          />
        </View>

        {/* Stat Row */}
        <View style={styles.statRow}>
          {[...Array(3)].map((_, idx) => (
            <View key={idx} style={styles.statBlock}>
              <PulseBlock style={[styles.line, { width: 24, height: 10 }]} />
              <PulseBlock
                style={[styles.line, { width: 28, height: 14, marginTop: 4 }]}
              />
            </View>
          ))}
        </View>
      </View>

      {/* Team Logo */}
      <PulseBlock style={styles.teamLogo} />
    </Animated.View>
  );
};

export default function GameLeadersSkeleton() {
  const isDark = useColorScheme() === "dark";
  const bg = isDark ? Colors.darkGray : Colors.lightGray;

  return (
    <View style={{ marginTop: 12 }}>
      {/* Tab Bar Placeholder */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 12,
          marginBottom: 16,
        }}
      >
        {[...Array(3)].map((_, idx) => (
          <PulseBlock
            key={idx}
            style={{
              width: 100,
              height: 26,
              borderRadius: 8,
            }}
          />
        ))}
      </View>

      {[...Array(2)].map((_, idx) => (
        <SkeletonCard key={idx} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginBottom: 10,
    borderRadius: 8,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  infoSection: {
    flex: 1,
    marginLeft: 10,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  statRow: {
    flexDirection: "row",
    marginTop: 6,
    justifyContent: "space-between",
    paddingRight: 12,
  },
  statBlock: {
    alignItems: "flex-start",
    flex: 1,
  },
  line: {
    borderRadius: 6,
  },
  teamLogo: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 50,
  },
});
