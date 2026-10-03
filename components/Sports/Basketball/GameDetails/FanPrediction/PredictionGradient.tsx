import { LinearGradient } from "expo-linear-gradient";
import { memo, useEffect, useMemo } from "react";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { FanPredictionStyles } from "styles/GameDetailStyles/FanPredictionStyles";
import { getTeamGradient } from "utils/teamGradient";

type Props = {
  color: string;
  fillPercentage: number;
  isSelected: boolean;
  isDark: boolean;
};

const FILL_ANIMATION_DURATION_MS = 250;

function clampPercentage(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(value, 1));
}

function PredictionGradient({
  color,
  fillPercentage,
  isSelected,
  isDark,
}: Props) {
  const styles = useMemo(() => FanPredictionStyles(isDark), [isDark]);
  const fillProgress = useSharedValue(clampPercentage(fillPercentage));

  const gradientColors = useMemo(() => getTeamGradient(color), [color]);

  useEffect(() => {
    fillProgress.value = withTiming(clampPercentage(fillPercentage), {
      duration: FILL_ANIMATION_DURATION_MS,
      easing: Easing.out(Easing.cubic),
    });

    return () => cancelAnimation(fillProgress);
  }, [fillPercentage, fillProgress]);

  const animatedVoteFillStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: fillProgress.value }],
  }));

  return (
    <>
      <LinearGradient
        pointerEvents="none"
        colors={gradientColors}
        locations={[0, 0.5, 1]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={[
          styles.teamGradient,
          isSelected && styles.teamGradientSelected,
        ]}
      />

      <Animated.View
        pointerEvents="none"
        style={[styles.voteFill, animatedVoteFillStyle]}
      >
        <LinearGradient
          colors={gradientColors}
          locations={[0, 0.5, 1]}
          start={{ x: 0.5, y: 1 }}
          end={{ x: 0.5, y: 0 }}
          style={styles.gradientFill}
        />
      </Animated.View>
    </>
  );
}

export default memo(PredictionGradient);
