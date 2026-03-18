import HeaderSkeleton from "components/Skeletons/HeaderSkeleton";
import { Colors } from "constants/Styles";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, useColorScheme } from "react-native";
export default function SeasonStatCardSkeleton() {
  const opacity = useRef(new Animated.Value(0.3)).current;
  const isDark = useColorScheme() === "dark";

  // Pulse animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const bg = isDark ? Colors.dark.itemBackground : Colors.light.itemBackground;
  const bar = isDark ? Colors.darkGray : Colors.lightGray;
  const styles = statSeasonCardSkeleton(isDark);
  return (
    <>
      <HeaderSkeleton style={styles.title} />
      <View style={[styles.card, { backgroundColor: bg }]}>
        {/* Title bar */}

        {/* Stat row */}
        <View style={styles.statHeader}>
          {[1, 2, 3, 4].map((i) => (
            <Animated.View
              key={i}
              style={[styles.statBox, { opacity, backgroundColor: bar }]}
            />
          ))}
        </View>
        {/* Stat row */}
        <View style={styles.statRow}>
          {[1, 2, 3, 4].map((i) => (
            <Animated.View
              key={i}
              style={[styles.statBox, { opacity, backgroundColor: bar }]}
            />
          ))}
        </View>
      </View>
    </>
  );
}

const statSeasonCardSkeleton = (isDark: boolean) =>
  StyleSheet.create({
    card: {
      borderRadius: 8,
      padding: 16,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    title: {
      alignItems: "center",
      marginBottom: 12,
    },
    statHeader: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: 8,
    },
    statRow: {
      flexDirection: "row",
      justifyContent: "space-around",
    },
    statBox: {
      width: "10%",
      height: 20,
      borderRadius: 8,
    },
  });
