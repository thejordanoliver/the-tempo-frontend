import { SkeletonBlock, SkeletonCircle } from "components/Skeletons/primitives";
import FanPredictionSection from "components/Sports/Basketball/GameDetails/FanPrediction/FanPredictionSection";
import PredictionGradient from "components/Sports/Basketball/GameDetails/FanPrediction/PredictionGradient";
import { Colors } from "constants/styles";
import { useMemo } from "react";
import { View } from "react-native";
import { FanPredictionStyles } from "styles/GameDetailStyles/FanPredictionStyles";

export default function FanPredictionSkeleton({
  isDark,
  isLive = false,
}: {
  isDark: boolean;
  isLive?: boolean;
}) {
  const styles = useMemo(() => FanPredictionStyles(isDark), [isDark]);

  return (
    <FanPredictionSection>
      <View style={styles.cardsRow}>
        {["away", "home"].map((team) => (
          <View key={team} style={styles.predictionCard}>
            <PredictionGradient
              color={Colors.midTone}
              fillPercentage={0}
              isSelected={false}
              isDark={isDark}
            />
            <View style={styles.cardContent}>
              <SkeletonCircle size={styles.teamLogo.width} />
              <SkeletonBlock width={60} height={styles.teamLabel.lineHeight} />
              <SkeletonBlock width={36} height={styles.votePercentage.lineHeight} />
            </View>
          </View>
        ))}
      </View>

      <View style={styles.statusRow}>
        <View style={styles.skeletonStatusCopy}>
          <SkeletonBlock width="80%" height={styles.subtitle.fontSize} />
        </View>
        {!isLive && (
          <SkeletonBlock width={56} height={styles.totalVotesText.fontSize} />
        )}
      </View>

      {!isLive && (
        <View style={styles.footer}>
          <View
            style={{
              height: styles.rankingHint.lineHeight,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <SkeletonBlock width="90%" height={styles.rankingHint.fontSize} />
          </View>
          <View style={styles.rankingsButton}>
            <SkeletonBlock width={110} height={styles.textLink.fontSize} />
          </View>
        </View>
      )}
    </FanPredictionSection>
  );
}
