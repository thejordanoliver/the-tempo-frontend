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
  awayColor,
  awayChance,
  size = 184,
  isDark,
  state,
}) => {
  const styles = mathupPredictorStyles(isDark);
  const strokeWidth = 10;
  const radius = 44.8;

  const animatedHome = useRef(new Animated.Value(0)).current;
  const animatedAway = useRef(new Animated.Value(0)).current;

  const [homePercent, setHomePercent] = useState(0);
  const [awayPercent, setAwayPercent] = useState(0);

  // Animate percentage values
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

  // Sync animated values to state
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

  const createArcPath = (
    startAngle: number,
    percentage: number,
    clockwise: boolean = true,
  ) => {
    const GAP = 2.5; // gap size at BOTH top and bottom
    const TOP = 0; // keep this since your top already looks correct

    const halfGap = GAP / 2;

    // usable arc space excludes both gaps
    const usableDegrees = 360 - GAP * 2;

    const adjustedStart = clockwise ? TOP + halfGap : TOP - halfGap;

    const sweep = (percentage / 100) * usableDegrees;

    const endAngle = clockwise ? adjustedStart + sweep : adjustedStart - sweep;

    const start = polarToCartesian(50, 50, radius, adjustedStart);
    const end = polarToCartesian(50, 50, radius, endAngle);

    const largeArc = sweep > 180 ? 1 : 0;

    return `
    M ${start.x} ${start.y}
    A ${radius} ${radius} 0 ${largeArc} ${clockwise ? 1 : 0}
    ${end.x} ${end.y}
  `;
  };

  const dividerHeight = radius + 20;
  const dividerTop = 50 - dividerHeight / 2;
  const dividerBottom = 50 + dividerHeight / 2;

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

            {/* Background ring */}
            <Circle
              cx="50"
              cy="50"
              r={radius}
              stroke={"transparent"}
              strokeWidth={strokeWidth}
              fill="none"
            />

            {/* Away (left – counter clockwise from top) */}
            <Path
              d={createArcPath(0, awayPercent, false)}
              stroke="url(#awayPattern)"
              strokeWidth={strokeWidth}
              fill="none"
            />

            {/* Home (right – clockwise from top) */}
            <Path
              d={createArcPath(0, homePercent, true)}
              stroke={homeColor}
              strokeWidth={strokeWidth}
              fill="none"
            />

            {/* Center divider */}
            <Path
              d={`M 50 ${dividerTop} L 50 ${dividerBottom}`}
              stroke={isDark ? Colors.white : Colors.black}
              strokeWidth={0.6}
              strokeDasharray="1,1"
            />
          </Svg>

          {/* Center content */}
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
                style={[styles.legendSwatch, { backgroundColor: homeColor }]}
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

const mathupPredictorStyles = (isDark: boolean) =>
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
