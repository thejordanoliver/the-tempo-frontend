import { SkeletonBlock, SkeletonCircle } from "components/Skeletons/primitives";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { StyleSheet, View } from "react-native";

export default function RecruitCardSkeleton() {
  const { resolvedColorScheme } = usePreferences();
  const theme = resolvedColorScheme === "dark" ? Colors.dark : Colors.light;
  return (
    <View style={[styles.card, { backgroundColor: theme.itemBackground }]}>
      <View style={styles.header}>
        <SkeletonCircle size={50} />
        <View style={styles.identity}>
          <SkeletonBlock width="85%" height={18} />
          <SkeletonBlock width={32} height={14} />
        </View>
        <View style={styles.rank}>
          <SkeletonBlock width={36} height={26} />
          <SkeletonBlock width={48} height={8} />
        </View>
      </View>
      <View style={styles.detailRow}>
        {[0, 1, 2].map((item) => (
          <SkeletonBlock key={item} width={48} height={14} />
        ))}
      </View>
      <View style={styles.detailRow}>
        <View style={styles.stars}>
          {[0, 1, 2, 3, 4].map((item) => (
            <SkeletonBlock key={item} width={14} height={14} radius={3} />
          ))}
        </View>
        <SkeletonBlock width={45} height={14} />
      </View>
      <View style={styles.detailRow}>
        <View style={styles.identity}>
          <SkeletonBlock width="90%" height={14} />
        </View>
        <SkeletonBlock width={32} height={14} />
        <SkeletonBlock width={48} height={14} />
      </View>
      <View style={[styles.footer, { borderColor: theme.transparentGray }]}>
        <SkeletonBlock width="65%" height={14} />
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 21,
    marginBottom: 4,
  },
  stars: { flexDirection: "row", gap: 4 },
});
