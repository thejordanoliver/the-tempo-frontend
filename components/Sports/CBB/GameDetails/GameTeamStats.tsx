import HeadingTwo from "components/Headings/HeadingTwo";
import { gameTeamStatsStyles } from "components/Sports/NBA/GameDetails/GameTeamStats";
import { Colors } from "constants/Styles";
import { getTeamByESPNId } from "constants/teamsCBB";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from "react-native";

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
}: {
  gameStatusDescription: string;
  stats: any[];
  lighter?: boolean;
}) {
  const isDark = useColorScheme() === "dark";
  const styles = gameTeamStatsStyles(isDark, lighter);

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
    new Animated.Value(COLLAPSED_ROWS * ROW_HEIGHT)
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

  return (
    <View>
      <HeadingTwo lighter={lighter}>
        {isScheduled ? "Team Stats" : "Game Stats"}
      </HeadingTwo>
      <View style={styles.logosRow}>
        <View style={styles.teamContainer}>
          <Image
            source={
              lighter
                ? awayTeam?.logoLight || awayTeam?.logo
                : isDark
                ? awayTeam?.logoLight || awayTeam?.logo
                : awayTeam?.logo
            }
            style={styles.logo}
          />
          <Text style={styles.teamLabel}>{awayTeam?.code}</Text>
        </View>

        <View style={styles.teamContainer}>
          <Image
            source={
              lighter
                ? homeTeam?.logoLight || homeTeam?.logo
                : isDark
                ? homeTeam?.logoLight || homeTeam?.logo
                : homeTeam?.logo
            }
            style={styles.logo}
          />
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
                          backgroundColor: lighter
                            ? Colors.white
                            : isDark
                            ? Colors.white
                            : Colors.black,
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
                          backgroundColor:  lighter
                            ? Colors.white
                            : isDark
                            ? Colors.white
                            : Colors.black,
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
                {index !== 0 && <View style={styles.dividerLine} />}
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
                          backgroundColor:  lighter
                            ? Colors.white
                            : isDark
                            ? Colors.white
                            : Colors.black,
                          opacity: isTie ? 1 : awayWins ? 1 : 0.4,
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
                          backgroundColor:  lighter
                            ? Colors.white
                            : isDark
                            ? Colors.white
                            : Colors.black,
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

        <Pressable
          onPress={() => setExpanded((prev) => !prev)}
          style={{
            paddingVertical: 12,
            justifyContent: "center",
            alignItems: "center",
            borderColor: Colors.midTone,
            borderTopWidth: 1,
          }}
        >
          <Text style={styles.showMoreLess}>
            {expanded ? "Show Less" : "Show More"}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
