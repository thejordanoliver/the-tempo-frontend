import HeaderSkeleton from "components/Skeletons/HeaderSkeleton";
import { SkeletonBlock } from "components/Skeletons/primitives";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { StyleSheet, View } from "react-native";
export default function SeasonStatCardSkeleton() {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";

  const bg = isDark ? Colors.dark.itemBackground : Colors.light.itemBackground;
  const styles = statSeasonCardSkeleton(isDark);
  return (
    <View>
      {/* Title bar */}
      <HeaderSkeleton style={styles.title} />
      <View style={[styles.wrapper, { backgroundColor: bg }]}>
        {/* Stat row */}
        <View style={styles.statHeader}>
          {[1, 2, 3, 4].map((i) => (
            <SkeletonBlock key={i} style={styles.statBox} />
          ))}
        </View>
        {/* Stat row */}
        <View style={styles.statRow}>
          {[1, 2, 3, 4].map((i) => (
            <SkeletonBlock key={i} style={styles.statBox} />
          ))}
        </View>
      </View>
    </View>
  );
}

export const statSeasonCardSkeleton = (isDark: boolean) =>
  StyleSheet.create({
    wrapper: {
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      padding: 12,
      borderRadius: 8,
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
