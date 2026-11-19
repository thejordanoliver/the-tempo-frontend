import type { ReactNode } from "react";
import { Image, type ImageSourcePropType, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GradientGameCardStyles } from "styles/GamecardStyles/GradientGameCardStyles";
import { getTeamCardGradientColors } from "utils/games/teamCardGradient";

type Props = {
  isDark: boolean;
  isChampionship?: boolean;
  awayColor?: string;
  homeColor?: string;
  awayLogo: ImageSourcePropType;
  homeLogo: ImageSourcePropType;
  children: ReactNode;
};

/**
 * The gradient and both team logos share one isolated compositing group.
 * Logos blend at full strength; no opacity is applied.
 * Scores, team names, and status render above the blended artwork.
 */
export default function GradientGameCardBackground({
  isDark,
  isChampionship = false,
  awayColor,
  homeColor,
  awayLogo,
  homeLogo,
  children,
}: Props) {
  const styles = GradientGameCardStyles(isDark, isChampionship);

  return (
    <View style={styles.gradientFrame}>
      <LinearGradient
        colors={getTeamCardGradientColors(
          isDark,
          awayColor,
          homeColor,
          isChampionship ? (isDark ? "#50412a" : "#CDA765") : undefined,
        )}
        locations={[0, 0.28, 0.5, 0.72, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.gradientBackground}
        pointerEvents="none"
      />
      <Image
        source={awayLogo}
        style={styles.gradientAwayBackdropLogo}
        resizeMode="contain"
        pointerEvents="none"
        accessible={false}
      />
      <Image
        source={homeLogo}
        style={styles.gradientHomeBackdropLogo}
        resizeMode="contain"
        pointerEvents="none"
        accessible={false}
      />
      <View style={styles.gradientForeground}>{children}</View>
    </View>
  );
}
