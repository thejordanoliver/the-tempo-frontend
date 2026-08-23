import { SkeletonBlock } from "components/Skeletons/primitives";
import { StyleSheet, View } from "react-native";

export default function TeamRankCardSkeleton() {
  return (
    <View style={styles.cardWrapper}>
      {/* Right-side watermark block */}

      {/* Fake gradient strip */}
      <View style={styles.cardGradient} />

      {/* Content */}
      <View style={styles.cardContent}>
        <View style={styles.row}>
          {/* Rank block */}
          <SkeletonBlock style={styles.rankBlock} />

          {/* Team name block */}
          <SkeletonBlock style={styles.teamNameBlock} />
        </View>

        {/* Points line */}
        <SkeletonBlock style={styles.pointsBlock} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    position: "relative",
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(150,150,150,0.25)",
    overflow: "hidden",
  },

  /* Logo watermark */
  logoContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    alignItems: "flex-end",
    justifyContent: "center",
    width: "45%",
    overflow: "hidden",
  },

  backgroundLogo: {
    height: "200%",
    aspectRatio: 1,
    marginRight: -40,
    borderRadius: 12,
    opacity: 0.3,
  },

  /* Gradient placeholder */
  cardGradient: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: "110%",
    opacity: 0.25,
  },

  cardContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },

  rankBlock: {
    width: 40,
    height: 28,
    borderRadius: 6,
  },

  teamNameBlock: {
    width: 160,
    height: 28,
    borderRadius: 100,
  },

  pointsBlock: {
    width: 120,
    height: 18,
    marginTop: 6,
    borderRadius: 6,
  },
});
