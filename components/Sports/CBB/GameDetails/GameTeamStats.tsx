import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors } from "constants/Styles";
import { getTeamByESPNId } from "constants/teamsCBB";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import Svg, { Defs, Path, Pattern, Rect } from "react-native-svg";
import { gameTeamStatsStyles } from "styles/GameDetailStyles/GameTeamStatsStyles";

const COLLAPSED_ROWS = 5;
const ROW_HEIGHT = 64;

const STAT_KEYS = [
  {
    key: "fieldGoalsMade-fieldGoalsAttempted",
    label: "Field Goals Made/Attempted",
    type: "text",
  },
  {
    key: "threePointFieldGoalsMade-threePointFieldGoalsAttempted",
    label: "3PT Made/Attempted",
    type: "text",
  },

  {
    key: "freeThrowsMade-freeThrowsAttempted",
    label: "Free Thows Made/Attempted",
    type: "text",
  },
  {
    key: "freeThrowPct",
    label: "Free Throws Percentage",
    type: "percent",
  },
  {
    key: "totalRebounds",
    label: "Total Rebounds",
    type: "text",
  },
  {
    key: "offensiveRebounds",
    label: "Offensive Rebounds",
    type: "text",
  },
  {
    key: "defensiveRebounds",
    label: "Defensive Rebounds",
    type: "text",
  },
  {
    key: "assists",
    label: "Assists",
    type: "text",
  },
  {
    key: "steals",
    label: "Steals",
    type: "text",
  },
  {
    key: "blocks",
    label: "Blocks",
    type: "text",
  },
  {
    key: "turnovers",
    label: "Turnovers",
    type: "text",
  },
  {
    key: "teamTurnovers",
    label: "Team Turnovers",
    type: "text",
  },
  {
    key: "totalTurnovers",
    label: "Total Turnovers",
    type: "text",
  },

  {
    key: "turnoverPoints",
    label: "Points Off Turnovers",
    type: "text",
  },
  {
    key: "fastBreakPoints",
    label: "Fast Break Points",
    type: "text",
  },
  {
    key: "pointsInPaint",
    label: "Points in Paint",
    type: "text",
  },
  {
    key: "fouls",
    label: "Fouls",
    type: "text",
  },
  {
    key: "largestLead",
    label: "Largest Lead",
    type: "text",
  },
  {
    key: "leadChanges",
    label: "Lead Changes",
    type: "text",
  },
  {
    key: "leadPercentage",
    label: "Percent Led",
    type: "percent",
  },

  {
    key: "streak",
    label: "Streak",
    type: "text",
  },
  {
    key: "threePointFieldGoalPct",
    label: "Three Point Percentage",
    type: "percent",
  },
  {
    key: "avgPointsAgainst",
    label: "Points Against",
    type: "text",
  },
  {
    key: "avgPoints",
    label: "Points Per Game",
    type: "text",
  },
  {
    key: "fieldGoalPct",
    label: "Field Goal Percentage",
    type: "percent",
  },
  {
    key: "technicalFouls",
    label: "Technical Fouls",
    type: "text",
  },
  {
    key: "totalTechnicalFouls",
    label: "Total Technical Fouls",
    type: "text",
  },
  {
    key: "flagrantFouls",
    label: "Flagrant Fouls",
    type: "text",
  },
  {
    key: "avgRebounds",
    label: "Rebounds Per Game",
    type: "text",
  },
  {
    key: "avgAssists",
    label: "Assists Per Game",
    type: "text",
  },
  {
    key: "avgBlocks",
    label: "Blocks Per Game",
    type: "text",
  },
  {
    key: "avgSteals",
    label: "Steals Per Game",
    type: "text",
  },
  {
    key: "avgTeamTurnovers",
    label: "Team Turnovers Per Game",
    type: "text",
  },
  {
    key: "avgTotalTurnovers",
    label: "Total Turnovers Per Game",
    type: "text",
  },
] as const;

export default function GameTeamStats({
  stats,
  gameStatusDescription,
  lighter = false,
  league = "CBB",
}: {
  gameStatusDescription: string;
  stats: any[];
  lighter?: boolean;
  league: string;
}) {
  const isDark = useColorScheme() === "dark";
  const styles = gameTeamStatsStyles(isDark, lighter);

  const isWomen = "WCBB";
  const isScheduled = gameStatusDescription === "Scheduled";

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

  const awayTeam = getTeamByESPNId(away.team.id);
  const homeTeam = getTeamByESPNId(home.team.id);

  const extractNumber = (value?: string) => {
    if (!value) return 0;

    // Handle "made-attempted" like "12-30"
    if (value.includes("-")) {
      const [made] = value.split("-");
      return Number(made) || 0;
    }

    return Number(value) || 0;
  };

  const awayLogo =
    lighter && isWomen
      ? awayTeam?.wLogo || awayTeam?.logoLight || awayTeam?.logo
      : lighter
        ? awayTeam?.logoLight || awayTeam?.logo
        : isDark && isWomen
          ? awayTeam?.wLogo || awayTeam?.logoLight || awayTeam?.logo
          : isWomen
            ? awayTeam?.wLogo || awayTeam?.logo
            : isDark
              ? awayTeam?.logoLight || awayTeam?.logo
              : awayTeam?.logo;

  const homeLogo =
    lighter && isWomen
      ? homeTeam?.wLogo || homeTeam?.logoLight || homeTeam?.logo
      : lighter
        ? homeTeam?.logoLight || homeTeam?.logo
        : isDark && isWomen
          ? homeTeam?.wLogo || homeTeam?.logoLight || homeTeam?.logo
          : isWomen
            ? homeTeam?.wLogo || homeTeam?.logo
            : isDark
              ? homeTeam?.logoLight || homeTeam?.logo
              : homeTeam?.logo;

  const awayColor = lighter
    ? awayTeam?.secondaryColor
    : ((isDark ? awayTeam?.secondaryColor : awayTeam?.color) ??
      (isDark ? Colors.white : Colors.black));

  const homeColor = lighter
    ? homeTeam?.secondaryColor
    : ((isDark ? homeTeam?.secondaryColor : homeTeam?.color) ??
      (isDark ? Colors.white : Colors.black));

  return (
    <View>
      <HeadingTwo lighter={lighter}>
        {isScheduled ? "Team Stats" : "Game Stats"}
      </HeadingTwo>
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
                          fill={
                            lighter
                              ? Colors.black
                              : isDark
                                ? Colors.black
                                : Colors.white
                          }
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
