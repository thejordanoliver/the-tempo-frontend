import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors, Fonts } from "constants/styles";
import { getCFBTeamLogo } from "constants/teamsCFB";
import React, { useEffect, useMemo, useState } from "react";
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

export type PredictionRingSchool = {
  team_id: number | null;
  team_name: string;
  team_title?: string | null;
  percentage: number | string | null;
  confidence_score?: number | null;
  confidence_text?: string | null;
  image_url?: string | null;
};

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

  /** Backwards-compatible single prediction props */
  prediction?: string;
  teamId?: number | null;

  /** New multi-prediction support */
  predictedSchools?: PredictionRingSchool[];
};

/* ---------------- Constants ---------------- */

const MIN_SIZE = 140;
const MAX_SIZE = 260;

/* ---------------- Helpers ---------------- */

function toNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(String(value).replace("%", "").trim());

  return Number.isFinite(parsed) ? parsed : null;
}

function getTopTiedSchools(
  predictedSchools: PredictionRingSchool[] | undefined,
) {
  if (!Array.isArray(predictedSchools) || predictedSchools.length === 0) {
    return [];
  }

  const sorted = predictedSchools
    .map((school) => ({
      ...school,
      normalizedPercentage: toNumber(school.percentage),
    }))
    .filter(
      (school) => school.team_name && school.normalizedPercentage !== null,
    )
    .sort((a, b) => {
      const percentageA = a.normalizedPercentage ?? -1;
      const percentageB = b.normalizedPercentage ?? -1;

      if (percentageB !== percentageA) {
        return percentageB - percentageA;
      }

      const confidenceA = a.confidence_score ?? -1;
      const confidenceB = b.confidence_score ?? -1;

      return confidenceB - confidenceA;
    });

  if (!sorted.length) {
    return [];
  }

  const topPercentage = sorted[0].normalizedPercentage;

  return sorted.filter(
    (school) => school.normalizedPercentage === topPercentage,
  );
}

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
  predictedSchools,
}: Props) {
  const styles = useMemo(() => predictionRingStyles(isDark), [isDark]);

  /* ---------------- Clamp size ---------------- */

  const clampedSize = Math.min(Math.max(size, MIN_SIZE), MAX_SIZE);

  /* ---------------- Derived sizing ---------------- */

  const strokeWidth = Math.max(clampedSize * 0.07, 10);
  const radius = (clampedSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const percentageFontSize = Math.max(clampedSize * 0.18, 22);
  const logoSize = Math.max(clampedSize * 0.28, 36);
  const splitLogoSize = Math.max(clampedSize * 0.2, 30);

  /* ---------------- Logic ---------------- */

  const progress = Math.min(Math.max(percentage, 0), 100);
  const animatedProgress = useSharedValue(0);
  const [displayValue, setDisplayValue] = useState(0);

  const topTiedSchools = useMemo(
    () => getTopTiedSchools(predictedSchools),
    [predictedSchools],
  );

  const shouldShowSplitSchools = topTiedSchools.length > 1;

  const singleTeamLogo = teamId ? getCFBTeamLogo(teamId, isDark) : null;

  const splitSchools = useMemo(() => {
    if (!shouldShowSplitSchools) {
      return [];
    }

    return topTiedSchools
      .slice(0, 2)
      .map((school) => {
        const logo = school.team_id
          ? getCFBTeamLogo(school.team_id, isDark)
          : null;

        return {
          ...school,
          logo,
        };
      })
      .filter((school) => school.logo);
  }, [isDark, shouldShowSplitSchools, topTiedSchools]);

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
  }, [animatedProgress, progress, delay, duration]);

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

          <View
            style={[
              styles.hairline,
              {
                width: clampedSize >= 300 ? 150 : clampedSize >= 200 ? 100 : 75,
              },
            ]}
          />

          {shouldShowSplitSchools && splitSchools.length > 1 ? (
            <View style={styles.splitContent}>
              <View style={styles.splitLogoRow}>
                {splitSchools.map((school) => (
                  <View
                    key={`${school.team_id}-${school.team_name}`}
                    style={styles.splitLogoBubble}
                  >
                    <Image
                      source={school.logo!}
                      style={{
                        width: splitLogoSize,
                        height: splitLogoSize,
                      }}
                      resizeMode="contain"
                    />
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <>
              {singleTeamLogo && (
                <Image
                  source={singleTeamLogo}
                  style={{
                    width: logoSize,
                    height: logoSize,
                  }}
                  resizeMode="contain"
                />
              )}
            </>
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

    splitContent: {
      alignItems: "center",
      justifyContent: "center",
    },

    splitLogoRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },

    splitLogoBubble: {
      alignItems: "center",
      justifyContent: "center",
    },
  });
