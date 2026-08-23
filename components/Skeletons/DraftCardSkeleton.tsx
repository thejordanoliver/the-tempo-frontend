import {
  SkeletonBlock,
  SkeletonCircle,
} from "components/Skeletons/primitives";
import { StyleSheet, View } from "react-native";

export default function DraftCardSkeleton() {
  return (
    <View style={styles.container}>
      {/* Headshot + Name Row */}
      <View style={styles.headerRow}>
        <SkeletonCircle size={50} />
        <SkeletonBlock style={styles.nameBar} />
        <SkeletonBlock style={styles.rankBadge} />
      </View>

      {/* Bio row 1 */}
      <SkeletonBlock style={styles.starLine} />

      {/* Bio row 2 */}
      <SkeletonBlock style={styles.locationLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
    padding: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(150,150,150,0.2)",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  nameBar: {
    width: 140,
    height: 18,
    marginLeft: 10,
    borderRadius: 100,
  },

  rankBadge: {
    width: 45,
    height: 18,
    marginLeft: "auto",
    borderRadius: 6,
  },

  starLine: {
    width: 180,
    height: 14,
    marginBottom: 10,
    borderRadius: 6,
  },

  locationLine: {
    width: 210,
    height: 14,
    marginBottom: 10,
    borderRadius: 6,
  },

  commitLine: {
    width: 130,
    height: 14,
    borderRadius: 6,
  },
});
