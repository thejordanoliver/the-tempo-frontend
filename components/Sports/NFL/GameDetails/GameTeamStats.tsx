import { Colors } from "constants/styles";
import { getCFBTeam, getCFBTeamLogo } from "constants/teamsCFB";
import { getNFLTeam, getNFLTeamLogo } from "constants/teamsNFL";
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
import HeadingTwo from "../../../Headings/HeadingTwo";
const COLLAPSED_ROWS = 5;
const ROW_HEIGHT = 64;

type GameTeamStatsProps = {
  stats: any[] | null | undefined;
  isDark: boolean;
  league: "NFL" | "CFB";
};

// NFL-specific stat keys to display
const STAT_KEYS: { key: string; label: string; type?: "percent" | "number" }[] =
  [
    { key: "plays.total", label: "Total Plays", type: "number" },
    { key: "first_downs.total", label: "First Downs", type: "number" },
    {
      key: "first_downs.third_down_efficiency",
      label: "Third Down Efficiency",
      type: "number",
    },
    {
      key: "first_downs.fourth_down_efficiency",
      label: "Fourth Down Efficiency",
      type: "number",
    },
    { key: "passing.total", label: "Passing Yards", type: "number" },
    { key: "passing.comp_att", label: "Passing CMP/ATT", type: "number" },
    {
      key: "passing.yards_per_pass",
      label: "Passing Yards Per Pass",
      type: "number",
    },
    {
      key: "passing.sacks_yards_lost",
      label: "Sacks Yards Lost",
      type: "number",
    },
    { key: "rushings.total", label: "Rushing Yards", type: "number" },
    { key: "yards.total", label: "Total Yards", type: "number" },
    { key: "yards.yards_per_play", label: "Yards Per Play", type: "number" },
    { key: "turnovers.total", label: "Turnovers", type: "number" },
    { key: "penalties.total", label: "Penalties", type: "number" },
    { key: "posession.total", label: "Time of Possession", type: "number" },
    { key: "points_against.total", label: "Points Allowed", type: "number" },
    { key: "sacks.total", label: "Sacks", type: "number" },
  ];

function flattenStats(obj: any, prefix = ""): Record<string, any> {
  return Object.keys(obj).reduce(
    (acc, key) => {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (value && typeof value === "object" && !Array.isArray(value)) {
        Object.assign(acc, flattenStats(value, newKey));
      } else {
        acc[newKey] = value;
      }
      return acc;
    },
    {} as Record<string, any>,
  );
}
export default function GameTeamStats({
  stats,
  isDark,
  league,
}: GameTeamStatsProps) {
  const styles = gameTeamStatsStyles(isDark);

  const isNFL = league === "NFL";

  if (!Array.isArray(stats) || stats.length < 2) return null;

  const away = isNFL ? stats[0] : stats[1];
  const home = isNFL ? stats[1] : stats[0];

  const awayStats = flattenStats(away.statistics);
  const homeStats = flattenStats(home.statistics);

  // ✅ SAFE: All hooks after this point
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
  }, [expanded, fullHeight]);

  const awayTeam = isNFL ? getNFLTeam(away.team.id) : getCFBTeam(away.team.id);
  const homeTeam = isNFL ? getNFLTeam(home.team.id) : getCFBTeam(home.team.id);

  const extractNumber = (value?: string | number) => {
    if (value === null || value === undefined) return 0;

    // Convert numbers to string for "made-attempted" check
    const strValue = String(value);

    if (strValue.includes("-")) {
      const [made] = strValue.split("-");
      return Number(made) || 0;
    }

    return Number(value) || 0;
  };

  const awayLogo = isNFL
    ? getNFLTeamLogo(away.team.id, isDark)
    : getCFBTeamLogo(away.team.id, isDark);
  const homeLogo = isNFL
    ? getNFLTeamLogo(home.team.id, isDark)
    : getCFBTeamLogo(home.team.id, isDark);
  const awayColor = isDark ? Colors.white : Colors.black;

  const homeColor =
    (isDark ? homeTeam?.secondaryColor : homeTeam?.color) ??
    (isDark ? Colors.white : Colors.black);

  return (
    <View>
      <HeadingTwo isDark={isDark}>Game Stats</HeadingTwo>
      <View style={styles.logosRow}>
        <View style={styles.teamContainer}>
          <Image source={awayLogo} style={styles.logo} />
          <Text style={styles.teamLabel}>{awayTeam?.code}</Text>
        </View>

        <View style={styles.teamContainer}>
          <Image source={homeLogo} style={styles.logo} />
          <Text style={styles.teamLabel}>{homeTeam?.code}</Text>
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
                          backgroundColor: awayColor,
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
                          backgroundColor: homeColor,
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

            // ✅ Special handling for streak: consider negative streaks as well
            if (key === "streak") {
              // Streak can be like "W3" or "L2", so convert to number
              const parseStreak = (s?: string) => {
                if (!s) return 0;
                const match = s.match(/[WL](\d+)/);
                return match ? Number(match[1]) : 0;
              };
              awayNum = parseStreak(awayValue);
              homeNum = parseStreak(homeValue);
            }

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
                              stroke={awayColor}
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
                          backgroundColor: homeColor,
                          opacity: isTie ? 1 : homeWins ? 1 : 0.4,
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
