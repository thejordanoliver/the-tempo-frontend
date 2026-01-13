import HeaderSkeleton from "components/Headings/HeaderSkeleton";
import { Colors } from "constants/Colors";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";

// Reusable pulse block
const PulseBlock = ({ style }: { style: any }) => {
  const isDark = useColorScheme() === "dark";
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: pulseAnim, // ✅ ACTUALLY animated now
          backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
        },
      ]}
    />
  );
};

const SkeletonCard = () => {
  const isDark = useColorScheme() === "dark";
  const pulseAnim = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();
    return () => pulse.stop();
  }, []);

  // Interpolate between two subtle border shades
  const borderColor = pulseAnim.interpolate({
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
  const pulseAnim = useRef(new Animated.Value(0.3)).current;


  useEffect(() => {
  const pulse = Animated.loop(
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false, // ✅ REQUIRED for color
      }),
      Animated.timing(pulseAnim, {
        toValue: 0.3,
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
    ])
  );

  pulse.start();
  return () => pulse.stop();
}, []);


  const borderColor = pulseAnim.interpolate({
    inputRange: [0.4, 1],
    outputRange: [
      isDark ? Colors.darkGray : Colors.lightGray,
      isDark ? Colors.lightGray : Colors.darkGray,
    ],
  });

  return (
    <View>
      <HeaderSkeleton />
      <Animated.View style={[styles.wrapper, { borderColor }]}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 12,
            marginBottom: 16,
          }}
        >
          {[...Array(4)].map((_, idx) => (
            <PulseBlock
              key={idx}
              style={{
                width: 80,
                height: 26,
                borderRadius: 8,
              }}
            />
          ))}
        </View>

        {[...Array(2)].map((_, idx) => (
          <SkeletonCard key={idx} />
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderWidth: 1,
    borderRadius: 8,
    paddingTop: 12,
  },
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
