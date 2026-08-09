import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors, Fonts } from "constants/styles";
import React, { useEffect, useMemo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Defs, Path, Pattern, Rect } from "react-native-svg";

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

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const ANIMATION_DURATION = 850;
const GAP_DEGREES = 2.5;
const FULL_CIRCLE_DEGREES = 360;

const clampPercentage = (percentage: number) => {
  "worklet";

  const safePercentage = Number.isFinite(percentage) ? percentage : 0;

  return Math.max(0, Math.min(safePercentage, 100));
};

const getArcLength = (percentage: number, usableArcLength: number) => {
  "worklet";

  return (clampPercentage(percentage) / 100) * usableArcLength;
};

const MatchupPredictor: React.FC<Props> = ({
  homeCode,
  homeLogo,
  homeColor,
  homeChance,
  awayCode,
  awayLogo,
  awayChance,
  size = 184,
  isDark,
  state,
}) => {
  const styles = useMemo(() => matchupPredictorStyles(isDark), [isDark]);

  const strokeWidth = 10;
  const homeBorderThickness = 0.5;
  const homeBorderWidth = strokeWidth + homeBorderThickness * 2;
  const homeBorderColor = isDark ? Colors.white : Colors.black;

  const svgCenter = 50;
  const svgPadding = 1.5;

  const radius = svgCenter - homeBorderWidth / 2 - svgPadding;
  const circumference = 2 * Math.PI * radius;
  const usableArcLength =
    (circumference * (FULL_CIRCLE_DEGREES - GAP_DEGREES * 2)) /
    FULL_CIRCLE_DEGREES;
  const strokeDasharray = `${circumference} ${circumference}`;
  const halfGapDegrees = GAP_DEGREES / 2;

  const animatedHomePercent = useSharedValue(0);
  const animatedAwayPercent = useSharedValue(0);

  useEffect(() => {
    animatedHomePercent.value = withTiming(clampPercentage(homeChance), {
      duration: ANIMATION_DURATION,
      easing: Easing.out(Easing.cubic),
    });

    animatedAwayPercent.value = withTiming(clampPercentage(awayChance), {
      duration: ANIMATION_DURATION,
      easing: Easing.out(Easing.cubic),
    });
  }, [animatedAwayPercent, animatedHomePercent, awayChance, homeChance]);

  const homeRingProps = useAnimatedProps(() => {
    const arcLength = getArcLength(animatedHomePercent.value, usableArcLength);

    return {
      strokeDashoffset: circumference - arcLength,
    };
  });

  const awayRingProps = useAnimatedProps(() => {
    const arcLength = getArcLength(animatedAwayPercent.value, usableArcLength);

    return {
      strokeDashoffset: circumference + arcLength,
    };
  });

  const dividerHeight = radius + 20;
  const dividerTop = svgCenter - dividerHeight / 2;
  const dividerBottom = svgCenter + dividerHeight / 2;

  if (state !== "pre") return null;
  if (!homeChance || !awayChance) return null;

  return (
    <View style={styles.outerContainer}>
      <HeadingTwo isDark={isDark}>Matchup Predictor</HeadingTwo>

      <View style={styles.wrapper}>
        <View style={[styles.container, { width: size, height: size }]}>
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Defs>
              <Pattern
                id="awayPattern"
                patternUnits="userSpaceOnUse"
                width="1.5"
                height="1"
                patternTransform="rotate(20)"
              >
                <Path
                  d="M 0 0 L 0 4"
                  stroke={isDark ? Colors.white : Colors.black}
                  strokeWidth={1.5}
                />
              </Pattern>
            </Defs>

            <Circle
              cx={svgCenter}
              cy={svgCenter}
              r={radius}
              stroke={
                isDark
                  ? Colors.dark.transparentItemBackground
                  : Colors.light.transparentItemBackground
              }
              strokeWidth={strokeWidth}
              fill="none"
            />

            {/* Away ring */}
            <AnimatedCircle
              animatedProps={awayRingProps}
              cx={svgCenter}
              cy={svgCenter}
              r={radius}
              stroke="url(#awayPattern)"
              strokeWidth={strokeWidth}
              strokeLinecap="butt"
              strokeDasharray={strokeDasharray}
              fill="none"
              rotation={-90 - halfGapDegrees}
              origin={`${svgCenter}, ${svgCenter}`}
            />

            {/* Home border ring */}
            <AnimatedCircle
              animatedProps={homeRingProps}
              cx={svgCenter}
              cy={svgCenter}
              r={radius}
              stroke={homeBorderColor}
              strokeWidth={homeBorderWidth}
              strokeLinecap="butt"
              strokeDasharray={strokeDasharray}
              fill="none"
              rotation={-90 + halfGapDegrees}
              origin={`${svgCenter}, ${svgCenter}`}
            />

            {/* Home color ring */}
            <AnimatedCircle
              animatedProps={homeRingProps}
              cx={svgCenter}
              cy={svgCenter}
              r={radius}
              stroke={homeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="butt"
              strokeDasharray={strokeDasharray}
              fill="none"
              rotation={-90 + halfGapDegrees}
              origin={`${svgCenter}, ${svgCenter}`}
            />

            {/* Center divider */}
            <Path
              d={`M ${svgCenter} ${dividerTop} L ${svgCenter} ${dividerBottom}`}
              stroke={isDark ? Colors.white : Colors.black}
              strokeWidth={0.6}
              strokeDasharray="1,1"
            />
          </Svg>

          <View style={styles.innerContent}>
            <View style={styles.teamContainer}>
              <Image source={awayLogo} style={styles.logo} />
            </View>

            <View style={styles.teamContainer}>
              <Image source={homeLogo} style={styles.logo} />
            </View>
          </View>
        </View>

        <View style={styles.legendContainer}>
          <View>
            <View style={styles.legendItem}>
              <Svg width={30} height={20} viewBox="0 0 30 20">
                <Defs>
                  <Pattern
                    id="legendAwayPattern"
                    patternUnits="userSpaceOnUse"
                    width="2.5"
                    height="1"
                    patternTransform="rotate(45)"
                  >
                    <Path
                      d="M 0 0 L 0 4"
                      stroke={isDark ? Colors.white : Colors.black}
                      strokeWidth={8}
                    />
                  </Pattern>
                </Defs>

                <Rect
                  x="0"
                  y="0"
                  width="30"
                  height="20"
                  rx="6"
                  ry="6"
                  fill="url(#legendAwayPattern)"
                />
              </Svg>

              <Text style={styles.legendText}>{awayCode}</Text>
            </View>

            <Text style={styles.chanceText}>{awayChance.toFixed(1)}%</Text>
          </View>

          <View>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendSwatch,
                  {
                    backgroundColor: homeColor,
                    borderWidth: 1,
                    borderColor: isDark ? Colors.white : "transparent",
                  },
                ]}
              />

              <Text style={styles.legendText}>{homeCode}</Text>
            </View>

            <Text style={styles.chanceText}>{homeChance.toFixed(1)}%</Text>
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
      alignItems: "center",
    },
    container: {
      justifyContent: "center",
      alignItems: "center",
    },
    innerContent: {
      position: "absolute",
      flexDirection: "row",
      justifyContent: "space-evenly",
      width: "100%",
      height: "100%",
      alignItems: "center",
    },
    teamContainer: {
      alignItems: "center",
    },
    logo: {
      width: 42,
      height: 42,
    },
    chanceText: {
      fontFamily: Fonts.OSSEMIBOLD,
      fontSize: 20,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
      marginTop: 4,
    },
    legendContainer: {
      position: "absolute",
      top: 0,
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 16,
      width: "100%",
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    legendSwatch: {
      width: 30,
      height: 20,
      borderRadius: 6,
    },
    legendText: {
      fontFamily: Fonts.OSSEMIBOLD,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
    },
  });

export default MatchupPredictor;
