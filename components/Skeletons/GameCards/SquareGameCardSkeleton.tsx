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
            <SkeletonCircle size={20} style={styles.logoSkeleton} />
            <SkeletonBlock style={styles.nameSkeleton} />
          </View>
          <SkeletonBlock style={styles.scoreSkeleton} />
        </View>

        {/* Home team section */}
        <View style={styles.teamSection}>
          <View style={styles.teamWrapper}>
            <SkeletonCircle size={20} style={styles.logoSkeleton} />
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
      minHeight: 120,
      paddingHorizontal: 12,
      paddingTop: 28,
      paddingBottom: 20,
      borderRadius: 8,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    cardWrapper: {
      flex: 1,
      minWidth: 0,
      flexDirection: "column",
      justifyContent: "center",
      gap: 8,
      borderRightWidth: 0.5,
      borderRightColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    teamSection: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 4,
      flex: 1,
      minWidth: 0,
      paddingRight: 8,
    },
    teamWrapper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
      gap: 4,
      flex: 1,
      minWidth: 0,
    },
    logoSkeleton: {
      width: 20,
      height: 20,
      borderRadius: 100,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    nameSkeleton: {
      flex: 1,
      height: 14,
      borderRadius: 6,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    scoreSkeleton: {
      width: 20,
      height: 14,
      borderRadius: 6,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    info: {
      alignItems: "center",
      justifyContent: "center",
      width: 70,
      flexShrink: 0,
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
