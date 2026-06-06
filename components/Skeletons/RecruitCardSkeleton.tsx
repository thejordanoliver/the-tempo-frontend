import {
  SkeletonBlock,
  SkeletonCircle,
} from "components/Skeletons/primitives";
import { StyleSheet, View } from "react-native";

export default function RecruitCardSkeleton() {
  return (
    <View style={styles.container}>
      {/* Headshot + Name Row */}
      <View style={styles.headerRow}>
        <SkeletonCircle size={50} />
        <SkeletonBlock style={styles.nameBar} />
        <SkeletonBlock style={styles.rankBadge} />
      </View>

      {/* Stars + position line */}
      <SkeletonBlock style={styles.starLine} />

      {/* Location line */}
      <SkeletonBlock style={styles.locationLine} />

      {/* Commit line */}
      <SkeletonBlock style={styles.commitLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(150,150,150,0.2)",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  nameBar: {
    height: 18,
    width: 140,
    borderRadius: 100,
    marginLeft: 10,
  },

  rankBadge: {
    height: 18,
    width: 45,
    borderRadius: 6,
    marginLeft: "auto",
  },

  starLine: {
    height: 14,
    width: 180,
    borderRadius: 6,
    marginBottom: 10,
  },

  locationLine: {
    height: 14,
    width: 210,
    borderRadius: 6,
    marginBottom: 10,
  },

  commitLine: {
    height: 14,
    width: 130,
    borderRadius: 6,
  },
});
