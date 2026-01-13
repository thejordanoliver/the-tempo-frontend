import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  StyleProp,
  StyleSheet,
  useColorScheme,
  View,
  ViewStyle,
} from "react-native";
import { Colors } from "constants/Colors";

type GameSquareCardSkeletonProps = {
  style?: StyleProp<ViewStyle>;
};

export default function GameSquareCardSkeleton({
  style,
}: GameSquareCardSkeletonProps) {
  const isDark = useColorScheme() === "dark";
  const styles = getStyles(isDark);

  // Pulse animation value
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.6,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const Skeleton = ({ style }: { style: any }) => (
    <Animated.View style={[style, { opacity: pulse }]} />
  );

  return (
    <View style={[styles.card, style]}>
      <View style={styles.cardWrapper}>
        {/* Away team section */}
        <View style={styles.teamSection}>
          <View style={styles.teamWrapper}>
            <Skeleton style={styles.logoSkeleton} />
            <Skeleton style={styles.nameSkeleton} />
          </View>
          <Skeleton style={styles.scoreSkeleton} />
        </View>

        {/* Home team section */}
        <View style={styles.teamSection}>
          <View style={styles.teamWrapper}>
            <Skeleton style={styles.logoSkeleton} />
            <Skeleton style={styles.nameSkeleton} />
          </View>
          <Skeleton style={styles.scoreSkeleton} />
        </View>
      </View>

      {/* Game info section */}
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
      width: "100%",
      height: 120,
      backgroundColor: isDark ? "#2e2e2e" : "#eee",
      justifyContent: "space-between",
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 16,
    },
    cardWrapper: {
      flexDirection: "column",
      justifyContent: "center",
      borderRightColor: isDark ? "#444" : "#888",
      borderRightWidth: 0.5,
      paddingRight: 12,
      gap: 8,
    },
    teamSection: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 4,
    },
    teamWrapper: {
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
      gap: 8,
      width: 88,
    },
    logoSkeleton: {
      width: 28,
      height: 28,
      borderRadius: 100,
            backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
      
    },
    nameSkeleton: {
      width: 28,
      height: 24,
      borderRadius: 6,
            backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,

    },
    scoreSkeleton: {
      width: 24,
      height: 24,
      borderRadius: 6,
            backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,

    },
    info: {
      justifyContent: "center",
      minHeight: 40,
      alignItems: "center",
    },
    dateSkeleton: {
      width: 36,
      height: 16,
      borderRadius: 6,
            backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,

      marginBottom: 6,
    },
    timeSkeleton: {
      width: 20,
      height: 14,
      borderRadius: 6,
            backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,

    },
  });
