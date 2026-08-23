import { SkeletonBlock, SkeletonCircle } from "components/Skeletons/primitives";
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
      justifyContent: "space-between",
      height: 120,
      paddingHorizontal: 8,
      paddingVertical: 16,
      borderRadius: 12,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    cardWrapper: {
      flexDirection: "column",
      justifyContent: "center",
      gap: 8,
      paddingRight: 12,
      borderRightWidth: 0.5,
      borderRightColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    teamSection: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 4,
    },
    teamWrapper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
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
      alignItems: "center",
      justifyContent: "center",
      minHeight: 40,
    },
    dateSkeleton: {
      width: 36,
      height: 16,
      marginBottom: 6,
      borderRadius: 6,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    timeSkeleton: {
      width: 20,
      height: 14,
      borderRadius: 6,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
  });
