import { SkeletonBlock, SkeletonCircle } from "components/Skeletons/primitives";
import FanPredictionSection from "components/Sports/Basketball/GameDetails/FanPrediction/FanPredictionSection";
import PredictionGradient from "components/Sports/Basketball/GameDetails/FanPrediction/PredictionGradient";
import { Colors } from "constants/styles";
import { useMemo } from "react";
import { View } from "react-native";
import { FanPredictionStyles } from "styles/GameDetailStyles/FanPredictionStyles";

export default function FanPredictionSkeleton({ isDark }: { isDark: boolean }) {
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
              <SkeletonCircle size={40} />
              <SkeletonBlock width={60} height={18} />
              <SkeletonBlock width={36} height={18} />
            </View>
          </View>
        ))}
      </View>

      <View style={styles.statusRow}>
        <View style={styles.skeletonStatusCopy}>
          <SkeletonBlock width="80%" height={18} />
        </View>
        <SkeletonBlock width={56} height={18} />
      </View>

      <View style={styles.footer}>
        <SkeletonBlock width="90%" height={18} />
        <View style={styles.rankingsButton}>
          <SkeletonBlock width={132} height={24} />
        </View>
      </View>
    </FanPredictionSection>
  );
}
