import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/styles";
import { FanPredictionStyles } from "@/styles/GameDetailStyles/FanPredictionStyles";
import { Image, type ImageProps } from "expo-image";
import { memo, useMemo } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import PredictionGradient from "./PredictionGradient";

type PredictionCardProps = {
  code: string;
  logo: ImageProps["source"];
  color: string;
  fillPercentage: number;
  onPress: () => void;
  disabled: boolean;
  isSelected: boolean;
  showPercent: boolean;
  percentText: string;
  isDark: boolean;
  style?: StyleProp<ViewStyle>;
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
}: PredictionCardProps) {
  const styles = useMemo(() => FanPredictionStyles(isDark), [isDark]);
  const teamLabel = code || "team";

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
      accessibilityLabel={`${isSelected ? "Your pick: " : ""}${
        showPercent
          ? `${teamLabel}, ${percentText} of the vote`
          : `Vote for ${teamLabel}`
      }`}
      accessibilityState={{
        disabled,
        selected: isSelected,
      }}
    >
      <PredictionGradient
        color={color}
        fillPercentage={fillPercentage}
        isSelected={isSelected}
        isDark={isDark}
      />

      {isSelected ? (
        <View style={styles.selectedBadge} pointerEvents="none" accessible={false}>
          <Ionicons
            name="checkmark"
            size={14}
            color={isDark ? Colors.black : Colors.white}
          />
        </View>
      ) : null}

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
