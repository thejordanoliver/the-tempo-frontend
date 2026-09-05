import { MatchupPredictorStyles } from "@/styles/GameDetailStyles/MatchupPredictorStyles";
import HeadingTwo from "components/Headings/HeadingTwo";
import { useEffect, useMemo } from "react";
import { Image, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface Props {
  homeId: number;
  homeCode: string;
  homeLogo: any;
  homeHeaderLogo: any;
  homeColor: string;
  homeChance: number;
  awayId: number;
  awayCode: string;
  awayLogo: any;
  awayHeaderLogo: any;
  awayColor: string;
  awayChance: number;
  size?: number;
  isDark: boolean;
  state?: string | null;
}

const ANIMATION_DURATION = 850;
const AWAY_STRIPES = Array.from({ length: 80 }, (_, index) => index);

const clampPercentage = (percentage: number) => {
  "worklet";

  const safePercentage = Number.isFinite(percentage) ? percentage : 0;

  return Math.max(0, Math.min(safePercentage, 100));
};

const getLogoSource = (logo: any) =>
  typeof logo === "string" ? { uri: logo } : logo;

export default function MatchupPredictor({
  homeId,
  homeCode,
  homeLogo,
  homeHeaderLogo,
  homeColor,
  homeChance,
  awayId,
  awayCode,
  awayLogo,
  awayHeaderLogo,
  awayColor,
  awayChance,
  isDark,
  state,
}: Props) {
  const styles = useMemo(() => MatchupPredictorStyles(isDark), [isDark]);
  const animatedSplitPercent = useSharedValue(50);

  const homePct = clampPercentage(homeChance);
  const awayPct = clampPercentage(awayChance);
  const totalChance = homePct + awayPct;

  const awayTrackPct = totalChance > 0 ? (awayPct / totalChance) * 100 : 50;

  const isHomeFavorite = homePct >= awayPct;

  const favoriteCode = isHomeFavorite ? homeCode : awayCode;
  const favoriteLogo = isHomeFavorite ? homeHeaderLogo : awayHeaderLogo;
  const favoriteColor = isHomeFavorite ? homeColor : awayColor;

  const edge = Math.abs(homePct - awayPct);

  useEffect(() => {
    animatedSplitPercent.value = withTiming(awayTrackPct, {
      duration: ANIMATION_DURATION,
      easing: Easing.out(Easing.cubic),
    });
  }, [animatedSplitPercent, awayTrackPct]);

  const awayMeterStyle = useAnimatedStyle(() => ({
    width: `${animatedSplitPercent.value}%`,
  }));

  const homeMeterStyle = useAnimatedStyle(() => ({
    left: `${animatedSplitPercent.value}%`,
  }));

  const markerStyle = useAnimatedStyle(() => ({
    left: `${animatedSplitPercent.value}%`,
  }));

  if (state !== "pre") return null;
  if (!homeChance || !awayChance) return null;

  return (
    <View style={styles.outerContainer}>
      <HeadingTwo isDark={isDark}>Matchup Predictor</HeadingTwo>

      <View
        style={styles.wrapper}
        accessible
        accessibilityLabel={`${awayCode} ${awayPct.toFixed(
          1,
        )} percent, ${homeCode} ${homePct.toFixed(
          1,
        )} percent. ${favoriteCode} has a ${edge.toFixed(1)} point edge.`}
      >
        <View style={styles.headerRow}>
          <View style={styles.teamHeader}>
            <View style={styles.logoBadge}>
              <Image
                source={getLogoSource(awayLogo)}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <View style={styles.teamCopy}>
              <Text style={styles.teamCode} numberOfLines={1}>
                {awayCode}
              </Text>
            </View>
          </View>

          <View style={[styles.teamHeader, styles.homeHeader]}>
            <View style={[styles.teamCopy, styles.homeCopy]}>
              <Text style={styles.teamCode} numberOfLines={1}>
                {homeCode}
              </Text>
            </View>

            <View style={styles.logoBadge}>
              <Image
                source={getLogoSource(homeLogo)}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>

        <View style={styles.trackArea}>
          <Animated.View
            style={[
              styles.logoMarker,
              { backgroundColor: favoriteColor },
              isHomeFavorite && styles.homeLogoMarker,
              markerStyle,
            ]}
          >
            <Image
              source={getLogoSource(favoriteLogo)}
              style={styles.markerLogo}
              resizeMode="contain"
            />
          </Animated.View>

          <View style={styles.track}>
            <Animated.View style={[styles.awayMeter, awayMeterStyle]}>
              <View style={styles.awayStripeRow}>
                {AWAY_STRIPES.map((stripe) => (
                  <View key={stripe} style={styles.awayStripe} />
                ))}
              </View>
            </Animated.View>

            <Animated.View
              style={[
                styles.homeMeter,
                { backgroundColor: homeColor },
                homeMeterStyle,
              ]}
            />
          </View>
        </View>

        <View style={styles.percentRow}>
          <View>
            <Text style={styles.chanceText}>{awayPct.toFixed(1)}%</Text>
            <Text style={styles.percentLabel}>{awayCode}</Text>
          </View>

          <Text style={styles.edgeLabel}>
            {favoriteCode} +{edge.toFixed(1)}
          </Text>

          <View style={styles.homePercent}>
            <Text style={styles.chanceText}>{homePct.toFixed(1)}%</Text>
            <Text style={styles.percentLabel}>{homeCode}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
