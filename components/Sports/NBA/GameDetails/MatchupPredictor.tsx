import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors, Fonts } from "constants/styles";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";
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
  state: string | undefined;
}

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
  const styles = matchupPredictorStyles(isDark);

  const strokeWidth = 10;
  const homeBorderThickness = 0.5;
  const homeBorderWidth = strokeWidth + homeBorderThickness * 2;
  const homeBorderColor = isDark ? Colors.white : Colors.black;

  const svgCenter = 50;
  const svgPadding = 1.5;

  const radius = svgCenter - homeBorderWidth / 2 - svgPadding;

  const animatedHome = useRef(new Animated.Value(0)).current;
  const animatedAway = useRef(new Animated.Value(0)).current;

  const [homePercent, setHomePercent] = useState(0);
  const [awayPercent, setAwayPercent] = useState(0);

  useEffect(() => {
    animatedHome.setValue(0);
    animatedAway.setValue(0);

    Animated.parallel([
      Animated.timing(animatedHome, {
        toValue: homeChance,
        duration: 600,
        useNativeDriver: false,
      }),
      Animated.timing(animatedAway, {
        toValue: awayChance,
        duration: 600,
        useNativeDriver: false,
      }),
    ]).start();
  }, [homeChance, awayChance, animatedHome, animatedAway]);

  useEffect(() => {
    const homeListener = animatedHome.addListener(({ value }) => {
      setHomePercent(value);
    });

    const awayListener = animatedAway.addListener(({ value }) => {
      setAwayPercent(value);
    });

    return () => {
      animatedHome.removeListener(homeListener);
      animatedAway.removeListener(awayListener);
    };
  }, [animatedHome, animatedAway]);

  const polarToCartesian = (
    cx: number,
    cy: number,
    r: number,
    degrees: number,
  ) => {
    const radians = ((degrees - 90) * Math.PI) / 180;

    return {
      x: cx + r * Math.cos(radians),
      y: cy + r * Math.sin(radians),
    };
  };

  const getArcAngles = (percentage: number, clockwise: boolean = true) => {
    const GAP = 2.5;
    const TOP = 0;
    const halfGap = GAP / 2;
    const usableDegrees = 360 - GAP * 2;
    const safePercentage = Math.max(0, Math.min(percentage, 100));

    const adjustedStart = clockwise ? TOP + halfGap : TOP - halfGap;
    const sweep = (safePercentage / 100) * usableDegrees;
    const endAngle = clockwise ? adjustedStart + sweep : adjustedStart - sweep;

    return {
      startAngle: adjustedStart,
      endAngle,
      sweep,
      clockwise,
    };
  };

  const createArcPath = (percentage: number, clockwise: boolean = true) => {
    const { startAngle, endAngle, sweep } = getArcAngles(percentage, clockwise);

    const start = polarToCartesian(svgCenter, svgCenter, radius, startAngle);
    const end = polarToCartesian(svgCenter, svgCenter, radius, endAngle);

    const largeArc = sweep > 180 ? 1 : 0;

    return `
      M ${start.x} ${start.y}
      A ${radius} ${radius} 0 ${largeArc} ${clockwise ? 1 : 0}
      ${end.x} ${end.y}
    `;
  };

  const createArcBandPath = ({
    percentage,
    clockwise = true,
    outerRadius,
    innerRadius,
  }: {
    percentage: number;
    clockwise?: boolean;
    outerRadius: number;
    innerRadius: number;
  }) => {
    const { startAngle, endAngle, sweep } = getArcAngles(percentage, clockwise);

    if (sweep <= 0) return "";

    const outerStart = polarToCartesian(
      svgCenter,
      svgCenter,
      outerRadius,
      startAngle,
    );
    const outerEnd = polarToCartesian(
      svgCenter,
      svgCenter,
      outerRadius,
      endAngle,
    );
    const innerStart = polarToCartesian(
      svgCenter,
      svgCenter,
      innerRadius,
      startAngle,
    );
    const innerEnd = polarToCartesian(
      svgCenter,
      svgCenter,
      innerRadius,
      endAngle,
    );

    const largeArc = sweep > 180 ? 1 : 0;
    const outerSweepFlag = clockwise ? 1 : 0;
    const innerSweepFlag = clockwise ? 0 : 1;

    return `
      M ${outerStart.x} ${outerStart.y}
      A ${outerRadius} ${outerRadius} 0 ${largeArc} ${outerSweepFlag}
      ${outerEnd.x} ${outerEnd.y}
      L ${innerEnd.x} ${innerEnd.y}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} ${innerSweepFlag}
      ${innerStart.x} ${innerStart.y}
      Z
    `;
  };

  const homeAngles = getArcAngles(homePercent, true);

  const homeBorderOuterRadius = radius + homeBorderWidth / 2;
  const homeBorderInnerRadius = radius - homeBorderWidth / 2;

  const homeOuterRadius = radius + strokeWidth / 2;
  const homeInnerRadius = radius - strokeWidth / 2;

  const createHomeEndCapPath = (angle: number) => {
    const inner = polarToCartesian(
      svgCenter,
      svgCenter,
      homeInnerRadius,
      angle,
    );

    const outer = polarToCartesian(
      svgCenter,
      svgCenter,
      homeOuterRadius,
      angle,
    );

    return `
      M ${inner.x} ${inner.y}
      L ${outer.x} ${outer.y}
    `;
  };

  const showHomeCapBorders = homeAngles.sweep > 0;

  const dividerHeight = radius + 20;
  const dividerTop = svgCenter - dividerHeight / 2;
  const dividerBottom = svgCenter + dividerHeight / 2;

  if (!homeChance || !awayChance) return null;
  if (state === "In Progress") return null;

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
              stroke="transparent"
              strokeWidth={strokeWidth}
              fill="none"
            />

            {/* Away ring */}
            <Path
              d={createArcPath(awayPercent, false)}
              stroke="url(#awayPattern)"
              strokeWidth={strokeWidth}
              fill="none"
            />

            {/* Home full border shape */}
            <Path
              d={createArcBandPath({
                percentage: homePercent,
                clockwise: true,
                outerRadius: homeBorderOuterRadius,
                innerRadius: homeBorderInnerRadius,
              })}
              fill={homeBorderColor}
            />

            {/* Home color shape */}
            <Path
              d={createArcBandPath({
                percentage: homePercent,
                clockwise: true,
                outerRadius: homeOuterRadius,
                innerRadius: homeInnerRadius,
              })}
              fill={homeColor}
            />

            {/* Home end-cap borders */}
            {showHomeCapBorders ? (
              <>
                <Path
                  d={createHomeEndCapPath(homeAngles.startAngle)}
                  stroke={homeBorderColor}
                  strokeWidth={homeBorderThickness}
                  strokeLinecap="butt"
                  fill="none"
                />

                <Path
                  d={createHomeEndCapPath(homeAngles.endAngle)}
                  stroke={homeBorderColor}
                  strokeWidth={homeBorderThickness}
                  strokeLinecap="butt"
                  fill="none"
                />
              </>
            ) : null}

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
