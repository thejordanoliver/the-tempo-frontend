import { Colors } from "@/constants/styles";
import { FanPredictionStyles } from "@/styles/GameDetailStyles/FanPredictionStyles";
import { Image } from "expo-image";
import { memo, useEffect, useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type PredictionCardProps = {
  code: string;
  logo: any;
  color: string;
  fillPercentage: number;
  onPress: () => void;
  disabled: boolean;
  isSelected: boolean;
  showPercent: boolean;
  percentText: string;
  isDark: boolean;
  style?: object;
};

const FILL_ANIMATION_DURATION_MS = 250;

function clampPercentage(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(value, 1));
}

function PredictionCard({
  code,
  logo,
  color,
  fillPercentage,
  onPress,
  disabled,
  isSelected,
  showPercent,
  percentText,
  isDark,
  style,
}: PredictionCardProps) {
  const styles = useMemo(() => FanPredictionStyles(isDark), [isDark]);
  const teamLabel = code || "team";
  const fillProgress = useSharedValue(clampPercentage(fillPercentage));

  const selectedTeamColor = isDark ? Colors.dark.green : Colors.light.green;

  const fillColor = isSelected ? selectedTeamColor : color;

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
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.7}
      style={[
        styles.predictionCard,
        isSelected && styles.predictionCardSelected,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={
        showPercent
          ? `${teamLabel}, ${percentText} of the vote`
          : `Vote for ${teamLabel}`
      }
      accessibilityState={{
        disabled,
        selected: isSelected,
      }}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.voteFill,
          {
            backgroundColor: fillColor,
          },
          animatedVoteFillStyle,
        ]}
      />

      <View style={styles.cardContent}>
        <Image
          source={typeof logo === "string" ? { uri: logo } : logo}
          style={styles.teamLogo}
          contentFit="contain"
          transition={120}
        />

        <Text numberOfLines={1} style={styles.teamLabel}>
          {teamLabel}
        </Text>

        {showPercent ? (
          <Text style={styles.votePercentage}>{percentText}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

export default memo(PredictionCard);
