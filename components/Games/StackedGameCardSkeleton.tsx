import { Colors } from "constants/Colors";
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, useColorScheme, View } from "react-native";

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
      { resetBeforeIteration: false } // ensures a perfect continuous loop
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
      borderRadius: 12,
      padding: 12,
      justifyContent: "space-between",
      height: 110,
    },
    cardWrapper: {
      flexDirection: "column",
      borderRightColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      justifyContent: "center",
      borderRightWidth: 0.5,
      paddingRight: 12,
      marginRight: 12,
      gap: 4,
      flex: 1,
    },
    teamSection: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 6,
    },
    teamWrapper: {
      flexDirection: "row",
      alignItems: "center",
    },
    logoSkeleton: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: isDark
        ? Colors.darkGray
        : Colors.lightGray,
    },
    nameSkeleton: {
      width: 120,
      height: 18,
      borderRadius: 4,
      backgroundColor: isDark
        ? Colors.darkGray
        : Colors.lightGray,
      marginHorizontal: 8,
    },
    scoreSkeleton: {
      width: 40,
      height: 18,
      borderRadius: 6,
      backgroundColor: isDark
        ? Colors.darkGray
        : Colors.lightGray,
    },
    info: {
      flexDirection: "column",
      justifyContent: "center",
      marginTop: 6,
      gap: 6,
    },
    dateSkeleton: {
      width: 40,
      height: 12,
      borderRadius: 4,
      backgroundColor: isDark
        ? Colors.darkGray
        : Colors.lightGray,
    },
    timeSkeleton: {
      width: 40,
      height: 12,
      borderRadius: 4,
      backgroundColor: isDark
        ? Colors.darkGray
        : Colors.lightGray,
    },
  });
