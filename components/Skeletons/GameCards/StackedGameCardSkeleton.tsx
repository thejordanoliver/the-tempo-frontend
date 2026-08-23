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
      justifyContent: "space-between",
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderRadius: 8,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    cardWrapper: {
      flex: 1,
      flexDirection: "column",
      justifyContent: "center",
      paddingRight: 12,
      borderRightWidth: 0.5,
      borderRightColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    teamSection: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
      gap: 4,
    },

    teamWrapper: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
      gap: 8,
      width: 100,
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
      marginHorizontal: 8,
      borderRadius: 4,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
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
      gap: 6,
      width: 100,
      minHeight: 30,
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
