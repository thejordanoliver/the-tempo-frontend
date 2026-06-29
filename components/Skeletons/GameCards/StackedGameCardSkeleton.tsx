import { SkeletonBlock, SkeletonCircle } from "components/Skeletons/primitives";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { StyleSheet, View } from "react-native";

export default function StackedGameCardSkeleton() {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = getStyles(isDark);

  return (
    <View style={styles.card}>
      {/* Away Team */}
      <View style={styles.cardWrapper}>
        <View style={styles.teamSection}>
          <View style={styles.teamWrapper}>
            <SkeletonCircle size={24} style={styles.logoSkeleton} />
            <SkeletonBlock style={styles.nameSkeleton} />
          </View>
          <SkeletonBlock style={styles.scoreSkeleton} />
        </View>

        {/* Spacer */}
        <View style={{ height: 8 }} />

        {/* Home Team */}
        <View style={styles.teamSection}>
          <View style={styles.teamWrapper}>
            <SkeletonCircle size={24} style={styles.logoSkeleton} />
            <SkeletonBlock style={styles.nameSkeleton} />
          </View>
          <SkeletonBlock style={styles.scoreSkeleton} />
        </View>
      </View>

      {/* Game Info */}
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
