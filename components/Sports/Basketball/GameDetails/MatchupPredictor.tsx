import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors, Fonts } from "constants/styles";
import React, { useEffect, useMemo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface Props {
  homeCode: string;
  homeLogo: any;
  homeColor: string;
  homeChance: number;
  awayCode: string;
  awayLogo: any;
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

const MatchupPredictor: React.FC<Props> = ({
  homeCode,
  homeLogo,
  homeColor,
  homeChance,
  awayCode,
  awayLogo,
  awayColor,
  awayChance,
  isDark,
  state,
}) => {
  const styles = useMemo(() => matchupPredictorStyles(isDark), [isDark]);
  const animatedSplitPercent = useSharedValue(50);

  const homePct = clampPercentage(homeChance);
  const awayPct = clampPercentage(awayChance);
  const totalChance = homePct + awayPct;
  const awayTrackPct = totalChance > 0 ? (awayPct / totalChance) * 100 : 50;
  const isHomeFavorite = homePct >= awayPct;
  const favoriteCode = isHomeFavorite ? homeCode : awayCode;
  const favoriteLogo = isHomeFavorite ? homeLogo : awayLogo;
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
        accessibilityLabel={`${awayCode} ${awayPct.toFixed(1)} percent, ${homeCode} ${homePct.toFixed(1)} percent. ${favoriteCode} has a ${edge.toFixed(1)} point edge.`}
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
            <View style={[styles.logoBadge, styles.homeLogoBadge]}>
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
          <Text
            style={[
              styles.edgeLabel,
              { borderColor: isHomeFavorite ? homeColor : awayColor },
            ]}
          >
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
};

const matchupPredictorStyles = (isDark: boolean) =>
  StyleSheet.create({
    outerContainer: {
      flex: 1,
      justifyContent: "center",
    },
    wrapper: {
      borderColor: Colors.midTone,
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      justifyContent: "center",
      gap: 12,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
    },
    teamHeader: {
      flex: 1,
      minWidth: 0,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    homeHeader: {
      justifyContent: "flex-end",
    },
    teamCopy: {
      flex: 1,
      minWidth: 0,
    },
    homeCopy: {
      alignItems: "flex-end",
    },
    logoBadge: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: Colors.white,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    homeLogoBadge: {
      borderColor: Colors.white,
    },
    logo: {
      width: 32,
      height: 32,
      resizeMode: "contain",
    },
    teamCode: {
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 16,
      lineHeight: 20,
      color: isDark ? Colors.white : Colors.black,
    },
    trackArea: {
      height: 58,
      justifyContent: "center",
      position: "relative",
    },
    logoMarker: {
      position: "absolute",
      top: 10,
      alignItems: "center",
      justifyContent: "center",
      transform: [{ translateX: -0 }],
      width: 40,
      height: 40,
      borderRadius: 23,
      borderWidth: 1,
      borderColor: Colors.midTone,
      overflow: "hidden",
      zIndex: 2,
    },
    homeLogoMarker: {
      borderColor: Colors.white,
    },
    markerLogo: {
      width: 28,
      height: 28,
    },
    track: {
      height: 8,
      borderRadius: 999,
      overflow: "hidden",
      backgroundColor: isDark
        ? Colors.dark.transparentItemBackground
        : Colors.light.transparentItemBackground,
      position: "relative",
    },
    awayMeter: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      overflow: "hidden",
    },
    awayStripeRow: {
      minWidth: 360,
      height: "100%",
      flexDirection: "row",
      gap: 3,
    },
    awayStripe: {
      width: 2,
      height: "100%",
      backgroundColor: isDark ? Colors.white : Colors.black,
      opacity: 0.75,
      transform: [{ skewX: "-18deg" }],
    },
    homeMeter: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      opacity: 0.92,
      borderColor: isDark ? Colors.white : "transparent",
      borderWidth: 1.5,
    },

    percentRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    homePercent: {
      alignItems: "flex-end",
    },
    chanceText: {
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 22,
      lineHeight: 27,
      color: isDark ? Colors.white : Colors.black,
    },
    percentLabel: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      lineHeight: 15,
      color: Colors.midTone,
    },
    edgeLabel: {
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 11,
      lineHeight: 14,
      color: isDark ? Colors.white : Colors.black,
      borderWidth: 1,
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 4,
      overflow: "hidden",
    },
  });

export default MatchupPredictor;
