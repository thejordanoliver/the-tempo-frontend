import { SkeletonBlock, SkeletonCircle } from "components/Skeletons/primitives";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { StyleSheet, View } from "react-native";

export default function GameCardSkeleton() {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = getStyles(isDark);

  return (
    <View style={styles.card}>
      {/* Top Team */}
      <View style={styles.teamSection}>
        <SkeletonCircle size={40} style={styles.logoSkeleton} />
        <SkeletonBlock style={styles.nameSkeleton} />
      </View>

      {/* Top Score */}
      <SkeletonBlock style={styles.scoreSkeleton} />

      {/* Game Info */}
      <View style={styles.info}>
        <SkeletonBlock style={styles.timeSkeleton} />
        <SkeletonBlock style={styles.broadcastSkeleton} />
      </View>

      {/* Bottom Score */}
      <SkeletonBlock style={styles.scoreSkeleton} />

      {/* Bottom Team */}
      <View style={styles.teamSection}>
        <SkeletonCircle size={40} style={styles.logoSkeleton} />
        <SkeletonBlock style={styles.nameSkeleton} />
      </View>
    </View>
  );
}

const getStyles = (isDark: boolean) => {
  const skeletonColor = isDark ? Colors.darkGray : Colors.lightGray;

  return StyleSheet.create({
    /* =========================
       🧱 LAYOUT
    ========================= */
    card: {
      flexDirection: "row",
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      borderRadius: 8,
      padding: 8,
      alignItems: "center",
      justifyContent: "space-between",
    },

    /* =========================
       🏀 TEAM SECTION
    ========================= */
    teamSection: {
      alignItems: "center",
      width: 70,
    },

    logoSkeleton: {
      width: 40,
      height: 40,
      borderRadius: 100,
      backgroundColor: skeletonColor,
    },

    nameSkeleton: {
      width: 60, // ✅ closer to real teamName width feel
      height: 12,
      borderRadius: 4,
      backgroundColor: skeletonColor,
      marginTop: 6, // ✅ match spacing from logo → name
    },

    /* =========================
       🔢 SCORE
    ========================= */
    scoreSkeleton: {
      width: 50,
      height: 28, // ✅ match large score feel
      borderRadius: 6,
      backgroundColor: skeletonColor,
    },

    /* =========================
       📊 CENTER INFO
    ========================= */
    info: {
      alignItems: "center",
      justifyContent: "center",
      width: 100,
    },

    timeSkeleton: {
      width: 70,
      height: 12,
      borderRadius: 6,
      backgroundColor: skeletonColor,
      marginBottom: 6,
    },

    broadcastSkeleton: {
      width: 50,
      height: 10,
      borderRadius: 6,
      backgroundColor: skeletonColor,
    },
  });
};
