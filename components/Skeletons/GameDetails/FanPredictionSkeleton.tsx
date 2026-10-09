import FanPredictionSection from "@/components/FanPrediction/FanPredictionSection";
import PredictionGradient from "@/components/FanPrediction/PredictionGradient";
import { SkeletonBlock, SkeletonCircle } from "components/Skeletons/primitives";
import { Colors } from "constants/styles";
import { useMemo } from "react";
import { View } from "react-native";
import { FanPredictionStyles } from "styles/GameDetailStyles/FanPredictionStyles";

export default function FanPredictionSkeleton({
  isDark,
  isLive = false,
  canVote = false,
  resultsRevealed = true,
  showLiveStatus = false,
}: {
  isDark: boolean;
  isLive?: boolean;
  canVote?: boolean;
  resultsRevealed?: boolean;
  showLiveStatus?: boolean;
}) {
  const styles = useMemo(() => FanPredictionStyles(isDark), [isDark]);

  return (
    <FanPredictionSection>
      {canVote && (
        <View style={styles.bonusRow}>
          <SkeletonBlock width={160} height={styles.subtitle.fontSize} />
        </View>
      )}
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
              {resultsRevealed && (
                <SkeletonBlock
                  width={36}
                  height={styles.votePercentage.lineHeight}
                />
              )}
            </View>
          </View>
        ))}
      </View>

      {(!isLive || showLiveStatus) && (
        <View style={styles.statusRow}>
          <View style={styles.skeletonStatusCopy}>
            <SkeletonBlock width="80%" height={styles.subtitle.fontSize} />
          </View>
          {!isLive && resultsRevealed && (
            <SkeletonBlock width={56} height={styles.totalVotesText.fontSize} />
          )}
        </View>
      )}

      {!isLive && (
        <View style={styles.footer}>
          <View
            style={{
              minHeight: styles.rankingHint.lineHeight * 2,
              justifyContent: "center",
              alignItems: "center",
              gap: styles.rankingHint.lineHeight - styles.rankingHint.fontSize,
            }}
          >
            <SkeletonBlock width="90%" height={styles.rankingHint.fontSize} />
            <SkeletonBlock width="45%" height={styles.rankingHint.fontSize} />
          </View>
          <View style={styles.rankingsButton}>
            <SkeletonBlock width={110} height={styles.textLink.fontSize} />
          </View>
        </View>
      )}
    </FanPredictionSection>
  );
}
