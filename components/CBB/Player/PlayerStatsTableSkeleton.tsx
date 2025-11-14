import { useEffect, useRef } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
} from "react-native";

const STAT_COLUMNS = 22;
const CELL_WIDTH = 60;
const TOTAL_WIDTH = STAT_COLUMNS * CELL_WIDTH;

export default function PlayerStatTableSkeleton() {
  const isDark = useColorScheme() === "dark";
  const styles = getStyles(isDark);

  // Animation value for pulsing effect
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, []);

  function SkeletonRow() {
    return (
      <Animated.View style={[styles.row, { opacity: pulseAnim }]}>
        <View style={styles.baseRow} />
      </Animated.View>
    );
  }

  return (
    <ScrollView horizontal>
      <View style={styles.container}>
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </View>
    </ScrollView>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      borderRadius: 4,
      overflow: "hidden",
    },
    row: {
      height: 24,
      width: TOTAL_WIDTH,
      marginBottom: 10,
      borderRadius: 6,
      overflow: "hidden",
    },
    baseRow: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: isDark ? "#444" : "#ddd",
    },
  });
