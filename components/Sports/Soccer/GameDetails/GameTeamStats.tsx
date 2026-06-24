import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors } from "constants/styles";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Defs, Path, Pattern, Rect } from "react-native-svg";
import { gameTeamStatsStyles } from "styles/GameDetailStyles/GameTeamStatsStyles";

const COLLAPSED_ROWS = 5;
const ROW_HEIGHT = 64;

const STAT_KEYS = [
  {
    key: "foulsCommitted",
    type: "text",
    label: "Fouls",
  },
  {
    key: "yellowCards",
    type: "text",
    label: "Yellow Cards",
  },
  {
    key: "redCards",
    type: "text",
    label: "Red Cards",
  },
  {
    key: "offsides",
    type: "text",
    label: "Offsides",
  },
  {
    key: "wonCorners",
    type: "text",
    label: "Corner Kicks",
  },
  {
    key: "saves",
    type: "text",
    label: "Saves",
  },
  {
    key: "possessionPct",
    type: "percent",
    label: "Possession",
  },
  {
    key: "totalShots",
    type: "text",
    label: "Shots",
  },
  {
    key: "shotsOnTarget",
    type: "text",
    label: "On Goal",
  },
  {
    key: "shotPct",
    type: "percent",
    label: "On Target %",
  },
  {
    key: "penaltyKickGoals",
    type: "text",
    label: "Penalty Goals",
  },
  {
    key: "penaltyKickShots",
    type: "text",
    label: "Penalty Kicks Taken",
  },
  {
    key: "accuratePasses",
    type: "text",
    label: "Accurate Passes",
  },
  {
    key: "totalPasses",
    type: "text",
    label: "Passes",
  },
  {
    key: "passPct",
    type: "percent",
    label: "Pass Completion %",
  },
  {
    key: "accurateCrosses",
    type: "text",
    label: "Accurate Crosses",
  },
  {
    key: "totalCrosses",
    type: "text",
    label: "Crosses",
  },
  {
    key: "crossPct",
    type: "percent",
    label: "Cross %",
  },
  {
    key: "totalLongBalls",
    type: "text",
    label: "Long Balls",
  },
  {
    key: "accurateLongBalls",
    type: "text",
    label: "Accurate Long Balls",
  },
  {
    key: "longballPct",
    type: "percent",
    label: "Long Balls %",
  },
  {
    key: "blockedShots",
    type: "text",
    label: "Blocked Shots",
  },
  {
    key: "effectiveTackles",
    type: "text",
    label: "Effective Tackles",
  },
  {
    key: "totalTackles",
    type: "text",
    label: "Tackles",
  },
  {
    key: "tacklePct",
    type: "percent",
    label: "Tackle %",
  },
  {
    key: "interceptions",
    type: "text",
    label: "Interceptions",
  },
  {
    key: "effectiveClearance",
    type: "text",
    label: "Effective Clearances",
  },
  {
    key: "totalClearance",
    type: "text",
    label: "Clearances",
  },
] as const;

export default function GameTeamStats({
  stats,
  state,
  isDark,
  homeLogo,
  awayLogo,
  homeCode,
  awayCode,
  awayColor,
  homeColor,
}: {
  homeLogo: any;
  awayLogo: any;
  homeCode: string | undefined;
  awayCode: string | undefined;
  awayColor: string;
  homeColor: string;
  state: string | undefined;
  stats: any[] | undefined;
  isDark: boolean;
}) {
  const isScheduled = state === "pre";
  const styles = gameTeamStatsStyles(isDark);
  const [expanded, setExpanded] = useState(false);
  const [fullHeight, setFullHeight] = useState(0);
  const heightAnim = useRef(
    new Animated.Value(COLLAPSED_ROWS * ROW_HEIGHT),
  ).current;

  useEffect(() => {
    const toValue = expanded ? fullHeight : COLLAPSED_ROWS * ROW_HEIGHT;

    Animated.timing(heightAnim, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [expanded, fullHeight, heightAnim]);

  if (!Array.isArray(stats) || stats.length < 2) return null;

  const away = stats[0];
  const home = stats[1];

  if (!Array.isArray(away.stats) || !Array.isArray(home.stats)) {
    return null;
  }

  const mapStats = (stats: any[]) =>
    Object.fromEntries(stats.map((s) => [s.name, s.displayValue]));

  const awayStats = mapStats(away.stats);
  const homeStats = mapStats(home.stats);

  const extractNumber = (value?: string) => {
    if (!value) return 0;

    // Handle "made-attempted" like "12-30"
    if (value.includes("-")) {
      const [made] = value.split("-");
      return Number(made) || 0;
    }

    return Number(value) || 0;
  };

  const awayTeamColor = isDark ? Colors.white : awayColor;

  const homeTeamColor = homeColor;

  if (isScheduled) return null;

  return (
    <View>
      <HeadingTwo isDark={isDark}>Team Stats</HeadingTwo>
      <View style={styles.logosRow}>
        <View style={styles.teamContainer}>
          <Image source={{ uri: awayLogo }} style={styles.logo} />
          <Text style={styles.teamLabel}>{awayCode}</Text>
        </View>

        <View style={styles.teamContainer}>
          <Image source={{ uri: homeLogo }} style={styles.logo} />
          <Text style={styles.teamLabel}>{homeCode}</Text>
        </View>
      </View>
      <ScrollView style={styles.container}>
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            opacity: 0,
          }}
          onLayout={(e) => setFullHeight(e.nativeEvent.layout.height)}
        >
          {STAT_KEYS.map(({ key, label, type }) => {
            const awayValue = awayStats[key];
            const homeValue = homeStats[key];
            if (!awayValue && !homeValue) return null;

            const awayNum =
              type === "percent" ? Number(awayValue) : extractNumber(awayValue);
            const homeNum =
              type === "percent" ? Number(homeValue) : extractNumber(homeValue);
            const max = Math.max(awayNum, homeNum, 1);

            return (
              <View key={key} style={styles.statSection}>
                <Text style={styles.statLabel}>{label}</Text>
                <View style={styles.row}>
                  <Text style={styles.barText}>
                    {type === "percent" ? `${awayValue}%` : awayValue}
                  </Text>
                  <View style={styles.barContainerLeft}>
                    <View
                      style={[
                        styles.bar,
                        {
                          width: `${(awayNum / max) * 100}%`,
                          backgroundColor: awayTeamColor,
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.barContainerRight}>
                    <View
                      style={[
                        styles.bar,
                        {
                          width: `${(homeNum / max) * 100}%`,
                          backgroundColor: homeTeamColor,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barText}>
                    {type === "percent" ? `${homeValue}%` : homeValue}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Animated content */}
        <Animated.View style={{ maxHeight: heightAnim, overflow: "hidden" }}>
          {STAT_KEYS.map(({ key, label, type }, index) => {
            const awayValue = awayStats[key];
            const homeValue = homeStats[key];
            if (!awayValue && !homeValue) return null;

            // Convert value to number for bar calculation
            let awayNum =
              type === "percent" ? Number(awayValue) : extractNumber(awayValue);
            let homeNum =
              type === "percent" ? Number(homeValue) : extractNumber(homeValue);

            const awayWins = awayNum > homeNum;
            const homeWins = homeNum > awayNum;
            const isTie = awayNum === homeNum;
            const max = Math.max(awayNum, homeNum, 1);

            return (
              <View key={key} style={styles.statSection}>
                <Text style={styles.statLabel}>{label}</Text>
                <View style={styles.row}>
                  <Text
                    style={[
                      styles.barText,
                      { opacity: isTie ? 1 : awayWins ? 1 : 0.4 },
                    ]}
                  >
                    {type === "percent" ? `${awayValue}%` : awayValue}
                  </Text>
                  <View style={styles.barContainerLeft}>
                    <View
                      style={[
                        styles.bar,
                        {
                          width: `${(awayNum / max) * 100}%`,
                          opacity: isTie ? 1 : awayWins ? 1 : 0.4,
                          borderRadius: 6, // 👈 make sure this exists
                          overflow: "hidden",
                        },
                      ]}
                    >
                      <Svg width="100%" height="100%">
                        <Defs>
                          <Pattern
                            id="diagonalHatch"
                            patternUnits="userSpaceOnUse"
                            width="6"
                            height="6"
                          >
                            <Path
                              d="M-1,1 l2,-2 M0,6 l6,-6 M5,7 l2,-2"
                              stroke={awayTeamColor}
                              strokeWidth={2}
                            />
                          </Pattern>
                        </Defs>

                        {/* Base color fill (optional but recommended) */}
                        <Rect
                          width="100%"
                          height="100%"
                          fill={isDark ? Colors.black : Colors.white}
                        />

                        {/* Hatch overlay */}
                        <Rect
                          width="100%"
                          height="100%"
                          fill="url(#diagonalHatch)"
                        />
                      </Svg>
                    </View>
                  </View>
                  <View style={styles.barContainerRight}>
                    <View
                      style={[
                        styles.bar,
                        {
                          width: `${(homeNum / max) * 100}%`,
                          backgroundColor: homeTeamColor,
                          opacity: isTie ? 1 : homeWins ? 1 : 0.4,
                          borderWidth: 1,
                          borderColor: isDark ? Colors.white : "transparent",
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.barText,
                      { opacity: isTie ? 1 : homeWins ? 1 : 0.4 },
                    ]}
                  >
                    {type === "percent" ? `${homeValue}%` : homeValue}
                  </Text>
                </View>
              </View>
            );
          })}
        </Animated.View>

        <View style={styles.showMoreLessContainer}>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => setExpanded((prev) => !prev)}
          >
            <Text style={styles.showMoreLess}>
              {expanded ? "Show Less" : "Show More"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
