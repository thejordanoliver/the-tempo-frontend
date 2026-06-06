import {
  SkeletonBlock,
  SkeletonCircle,
} from "components/Skeletons/primitives";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

type SquareGameCardSkeletonProps = {
  style?: StyleProp<ViewStyle>;
};

export default function SquareGameCardSkeleton({
  style,
}: SquareGameCardSkeletonProps) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = getStyles(isDark);

  return (
    <View style={[styles.card, style]}>
      <View style={styles.cardWrapper}>
        {/* Away team section */}
        <View style={styles.teamSection}>
          <View style={styles.teamWrapper}>
            <SkeletonCircle size={28} style={styles.logoSkeleton} />
            <SkeletonBlock style={styles.nameSkeleton} />
          </View>
          <SkeletonBlock style={styles.scoreSkeleton} />
        </View>

        {/* Home team section */}
        <View style={styles.teamSection}>
          <View style={styles.teamWrapper}>
            <SkeletonCircle size={28} style={styles.logoSkeleton} />
            <SkeletonBlock style={styles.nameSkeleton} />
          </View>
          <SkeletonBlock style={styles.scoreSkeleton} />
        </View>
      </View>

      {/* Game info section */}
      <View style={styles.info}>
        <SkeletonBlock style={styles.dateSkeleton} />
        <SkeletonBlock style={styles.timeSkeleton} />
      </View>
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      height: 120,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      justifyContent: "space-between",
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 16,
    },
    cardWrapper: {
      flexDirection: "column",
      justifyContent: "center",
      borderRightColor: isDark ? Colors.darkGray : Colors.lightGray,
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
