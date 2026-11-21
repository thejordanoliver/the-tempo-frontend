import { SkeletonBlock } from "components/Skeletons/primitives";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { StyleSheet, View } from "react-native";

export default function TeamRankCardSkeleton() {
  const { resolvedColorScheme } = usePreferences();
  const theme = resolvedColorScheme === "dark" ? Colors.dark : Colors.light;
  return (
    <View style={[styles.card, { backgroundColor: theme.itemBackground }]}>
      <View style={styles.header}>
        <View style={styles.rankColumn}>
          <SkeletonBlock width={40} height={30} />
          <SkeletonBlock width={60} height={16} radius={8} />
        </View>
        <View style={styles.identity}>
          <SkeletonBlock width="85%" height={22} />
          <SkeletonBlock width="55%" height={13} />
        </View>
      </View>
      <View style={[styles.stats, { borderColor: theme.transparentGray }]}>
        {[0, 1, 2, 3, 4].map((item) => (
          <View key={item} style={styles.stat}>
            <SkeletonBlock width={item === 4 ? 38 : 24} height={20} />
            <SkeletonBlock width={item === 0 ? 34 : 22} height={10} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12,
    marginBottom: 10,
    borderRadius: 8,
    padding: 12,
    overflow: "hidden",
  },
  row: { flexDirection: "row", alignItems: "center" },
  identity: { flex: 1, minWidth: 0, gap: 6 },
  rank: { width: 50, alignItems: "center", gap: 5 },
  footer: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 8 },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  rankColumn: { width: 76, gap: 5 },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
    marginTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  stat: { flex: 1, minWidth: 0, alignItems: "center", gap: 5 },
});
