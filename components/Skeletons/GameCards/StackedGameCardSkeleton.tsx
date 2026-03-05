import { Colors } from "constants/Styles";
import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";

export default function StackedGameCardSkeleton() {
  const isDark = useColorScheme() === "dark";
  const styles = getStyles(isDark);

  // Smooth breathing pulse animation
  const pulse = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.3,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      { resetBeforeIteration: false }, // ensures a perfect continuous loop
    );

    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const Skeleton = ({ style }: { style: any }) => (
    <Animated.View
      style={[
        style,
        {
          opacity: pulse,
        },
      ]}
    />
  );

  return (
    <View style={styles.card}>
      {/* Away Team */}
      <View style={styles.cardWrapper}>
        <View style={styles.teamSection}>
          <View style={styles.teamWrapper}>
            <Skeleton style={styles.logoSkeleton} />
            <Skeleton style={styles.nameSkeleton} />
          </View>
          <Skeleton style={styles.scoreSkeleton} />
        </View>

        {/* Spacer */}
        <View style={{ height: 8 }} />

        {/* Home Team */}
        <View style={styles.teamSection}>
          <View style={styles.teamWrapper}>
            <Skeleton style={styles.logoSkeleton} />
            <Skeleton style={styles.nameSkeleton} />
          </View>
          <Skeleton style={styles.scoreSkeleton} />
        </View>
      </View>

      {/* Game Info */}
      <View style={styles.info}>
        <Skeleton style={styles.dateSkeleton} />
        <Skeleton style={styles.timeSkeleton} />
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
      justifyContent: "space-between",
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
    },
    cardWrapper: {
      flexDirection: "column",
      justifyContent: "center",
      borderRightColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderRightWidth: 0.5,
      paddingRight: 12,
      flex: 1,
    },
    teamSection: {
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
      gap: 4,
    },

    teamWrapper: {
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
      gap: 8,
      width: 100,
      flex: 1,
    },
    logoSkeleton: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    nameSkeleton: {
      width: 120,
      height: 14,
      borderRadius: 4,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
      marginHorizontal: 8,
    },
    scoreSkeleton: {
      width: 40,
      height: 18,
      borderRadius: 6,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    info: {
      alignItems: "center",
      justifyContent: "center",
      minHeight: 30,
      gap: 6,
      width: 100,
    },
    dateSkeleton: {
      width: 40,
      height: 12,
      borderRadius: 4,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    timeSkeleton: {
      width: 40,
      height: 12,
      borderRadius: 4,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
  });
