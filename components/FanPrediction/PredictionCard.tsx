import { Colors } from "@/constants/styles";
import { FanPredictionStyles } from "@/styles/FanPredictionStyles/FanPredictionStyles";
import { Ionicons } from "@expo/vector-icons";
import CustomActivityIndicator from "components/CustomActivityIndicator";

import { memo, useEffect, useMemo } from "react";
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  type ImageProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import PredictionGradient from "./PredictionGradient";

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

type PredictionCardProps = {
  code: string;
  logo: ImageProps["source"] | string;
  color: string;
  fillPercentage: number;
  onPress: () => void;
  disabled: boolean;
  isSelected: boolean;
  showPercent: boolean;
  percentText: string;
  isDark: boolean;
  style?: StyleProp<ViewStyle>;
  variant?: "default" | "matchup";
  isSubmitting?: boolean;
};

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
  variant = "default",
  isSubmitting = false,
}: PredictionCardProps) {
  const styles = useMemo(() => FanPredictionStyles(isDark), [isDark]);
  const teamLabel = code || "team";
  const isMatchup = variant === "matchup";
  const selectionProgress = useSharedValue(isSelected ? 1 : 0);
  const selectedBorderColor = styles.predictionCardSelected.borderColor;

  useEffect(() => {
    selectionProgress.value = withTiming(isSelected ? 1 : 0, {
      duration: 250,
      easing: Easing.inOut(Easing.cubic),
    });

    return () => cancelAnimation(selectionProgress);
  }, [isSelected, selectionProgress]);

  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      selectionProgress.value,
      [0, 1],
      ["transparent", selectedBorderColor],
    ),
  }));

  return (
    <AnimatedTouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.7}
      style={[
        styles.predictionCard,
        isMatchup && styles.matchupCard,
        style,
        animatedBorderStyle,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${isSelected ? "Your pick: " : ""}${
        showPercent
          ? `${teamLabel}, ${percentText} of the vote`
          : `Vote for ${teamLabel}`
      }`}
      accessibilityState={{
        disabled,
        selected: isSelected,
        busy: isSubmitting,
      }}
    >
      <PredictionGradient
        color={color}
        fillPercentage={fillPercentage}
        isSelected={isSelected}
        isDark={isDark}
      />

      {isSelected ? (
        <View
          style={[
            styles.selectedBadge,
            isMatchup && styles.matchupSelectedBadge,
          ]}
          pointerEvents="none"
          accessible={false}
        >
          {isSubmitting ? (
            <CustomActivityIndicator size={14} thickness={2} />
          ) : (
            <Ionicons
              name="checkmark"
              size={14}
              color={isDark ? Colors.black : Colors.white}
            />
          )}
        </View>
      ) : null}

      <View
        style={[styles.cardContent, isMatchup && styles.matchupCardContent]}
      >
        {isMatchup ? (
          <>
            <View style={styles.matchupIdentity}>
              <Image
                source={typeof logo === "string" ? { uri: logo } : logo}
                style={styles.teamLogo}
                resizeMode="contain"
                fadeDuration={120}
              />
              <Text numberOfLines={1} style={styles.matchupTeamLabel}>
                {teamLabel}
              </Text>
            </View>
            {showPercent ? (
              <View>
                <Text style={styles.matchupPercentage}>{percentText}</Text>
                <Text style={styles.matchupPercentageLabel}>
                  {isSubmitting ? "Saving…" : "of fan picks"}
                </Text>
              </View>
            ) : (
              <View style={styles.matchupAction}>
                <View style={styles.selectionRing} />
                <Text numberOfLines={1} style={styles.matchupActionText}>
                  {disabled ? "Picks unavailable" : `Pick ${teamLabel}`}
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
            <Image
              source={typeof logo === "string" ? { uri: logo } : logo}
              style={styles.teamLogo}
              resizeMode="contain"
              fadeDuration={120}
            />
            <Text numberOfLines={1} style={styles.teamLabel}>
              {teamLabel}
            </Text>
            {showPercent && (
              <Text style={styles.votePercentage}>{percentText}</Text>
            )}
          </>
        )}
      </View>
    </AnimatedTouchableOpacity>
  );
}

export default memo(PredictionCard);
