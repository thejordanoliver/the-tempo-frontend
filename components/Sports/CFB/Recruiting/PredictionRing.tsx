import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors, Fonts } from "constants/styles";
import { getCFBTeam, getCFBTeamLogo } from "constants/teamsCFB";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedProps,
  useAnimatedReaction,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/* ---------------- Types ---------------- */

type Props = {
  percentage: number;
  isDark?: boolean;

  /** Visual */
  size?: number;

  /** Animation */
  duration?: number;
  delay?: number;

  /** Colors */
  lowColor?: string;
  midColor?: string;
  highColor?: string;

  /** Optional title */
  title?: string;
  prediction?: string;
  teamId: number;
};

/* ---------------- Constants ---------------- */

const MIN_SIZE = 140;
const MAX_SIZE = 260;

/* ---------------- Component ---------------- */

export default function PredictionRing({
  percentage,
  isDark = false,

  size = 180,
  duration = 1200,
  delay = 300,

  lowColor = Colors.light.red,
  midColor = Colors.light.yellow,
  highColor = Colors.light.green,

  title = "Prediction",
  prediction,
  teamId,
}: Props) {
  const styles = predictionRingStyles(isDark);

  /* ---------------- Clamp size ---------------- */

  const clampedSize = Math.min(Math.max(size, MIN_SIZE), MAX_SIZE);

  /* ---------------- Derived sizing ---------------- */

  const strokeWidth = Math.max(clampedSize * 0.07, 10);
  const radius = (clampedSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const percentageFontSize = Math.max(clampedSize * 0.18, 22);
  const logoSize = Math.max(clampedSize * 0.28, 36);
  const dotSize = Math.max(clampedSize * 0.012, 2);

  /* ---------------- Logic ---------------- */

  const progress = Math.min(Math.max(percentage, 0), 100);
  const animatedProgress = useSharedValue(0);
  const [displayValue, setDisplayValue] = useState(0);

  const team = getCFBTeam(teamId);
  const teamLogo = getCFBTeamLogo(teamId, isDark);

  const ringColor =
    progress >= 70 && isDark
      ? Colors.dark.leafGreen
      : progress >= 70
        ? highColor
        : progress >= 40
          ? midColor
          : lowColor;

  /* ---------------- Animate ---------------- */

  useEffect(() => {
    animatedProgress.value = withDelay(
      delay,
      withTiming(progress, {
        duration,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [progress, delay, duration]);

  const animatedCircleProps = useAnimatedProps(() => {
    const strokeDashoffset =
      circumference - (circumference * animatedProgress.value) / 100;

    return { strokeDashoffset };
  });

  useAnimatedReaction(
    () => Math.round(animatedProgress.value),
    (current, previous) => {
      if (current !== previous) {
        runOnJS(setDisplayValue)(current);
      }
    },
  );

  /* ---------------- Render ---------------- */

  return (
    <View style={styles.container}>
      {title && <HeadingTwo isDark={isDark}>{title}</HeadingTwo>}

      <View style={styles.ringWrapper}>
        <Svg width={clampedSize} height={clampedSize}>
          {/* Background ring */}
          <Circle
            cx={clampedSize / 2}
            cy={clampedSize / 2}
            r={radius}
            stroke={Colors.midTone}
            strokeWidth={strokeWidth}
            opacity={0.25}
            fill="none"
          />

          {/* Animated progress ring */}
          <AnimatedCircle
            cx={clampedSize / 2}
            cy={clampedSize / 2}
            r={radius}
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            animatedProps={animatedCircleProps}
            fill="none"
            rotation="-90"
            origin={`${clampedSize / 2}, ${clampedSize / 2}`}
          />
        </Svg>

        {/* Center content */}
        <View style={styles.centerText}>
          <Animated.Text
            style={[
              styles.percentage,
              {
                color: ringColor,
                fontSize: percentageFontSize,
              },
            ]}
          >
            {displayValue}%
          </Animated.Text>

          {/* Scaled thin horizontal line */}
          <View
            style={[
              styles.hairline,
              {
                width: clampedSize >= 300 ? 150 : clampedSize >= 200 ? 100 : 75, // scale based on size
              },
            ]}
          />

          {teamLogo && (
            <Image
              source={teamLogo}
              style={{
                width: logoSize,
                height: logoSize,
              }}
              resizeMode="contain"
            />
          )}
        </View>
      </View>
    </View>
  );
}

/* ---------------- Styles ---------------- */

const predictionRingStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 12,
      justifyContent: "center",
    },
    ringWrapper: {
      alignItems: "center",
      justifyContent: "center",
      padding: 12,
    },
    centerText: {
      position: "absolute",
      alignItems: "center",
      justifyContent: "center",
    },
    hairline: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: Colors.midTone,
      marginVertical: 8,
    },

    percentage: {
      fontFamily: Fonts.OSBOLD,
    },
  });
