import { SkeletonBlock, SkeletonCircle } from "components/Skeletons/primitives";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { StyleSheet, View } from "react-native";

export default function DraftCardSkeleton() {
  const { resolvedColorScheme } = usePreferences();
  const theme = resolvedColorScheme === "dark" ? Colors.dark : Colors.light;
  return (
    <View style={[styles.card, { backgroundColor: theme.itemBackground }]}>
      <View style={styles.header}>
        <SkeletonCircle size={50} />
        <View style={styles.identity}>
          <SkeletonBlock width="85%" height={18} />
          <SkeletonBlock width={32} height={12} />
        </View>
        <View style={styles.rank}>
          <SkeletonBlock width={36} height={26} />
          <SkeletonBlock width={44} height={8} />
        </View>
      </View>
      <View style={styles.details}>
        <View style={styles.identity}>
          <SkeletonBlock width="90%" height={12} />
        </View>
        <SkeletonBlock width={32} height={12} />
        <SkeletonBlock width={42} height={12} />
      </View>
      <View
        style={[
          styles.footer,
          styles.details,
          { borderColor: theme.transparentGray },
        ]}
      >
        <View style={styles.identity}>
          <SkeletonBlock width="75%" height={12} />
        </View>
        <SkeletonBlock width={32} height={12} />
        <SkeletonBlock width={42} height={12} />
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
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  details: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 10,
    minHeight: 16,
  },
});
