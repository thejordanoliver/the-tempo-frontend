import HeadingTwo from "components/Headings/HeadingTwo";
import { teamsById } from "constants/teams";
import { router } from "expo-router";
import { useGameLeaders } from "hooks/useGameLeaders";
import usePlayersByTeam, { Player } from "hooks/usePlayersByTeam";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  UIManager,
  useColorScheme,
  View,
} from "react-native";
import { boxScoreStyles } from "styles/GameDetailStyles/BoxScoreStyles";
import BoxScoreSkeleton from "../../../Skeletons/GameDetails/BoxScoreSkeleton";

const COLUMN_WIDTH = 50;
const NAME_COLUMN_WIDTH = 160;
const PLAYER_ROW_HEIGHT = 36;
const COLLAPSED_ROWS = 5;
const COLLAPSED_HEIGHT = PLAYER_ROW_HEIGHT * COLLAPSED_ROWS;

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
  gameId: string;
  homeTeamId: number;
  awayTeamId: number;
  lighter?: boolean;
};

export default function BoxScore({
  gameId,
  homeTeamId,
  awayTeamId,
  lighter = false,
}: Props) {
  // Fetch game leaders/stats
  const { data: leadersData, isLoading, isError } = useGameLeaders(
    gameId,
    homeTeamId,
    awayTeamId
  );

  // Fetch full team rosters
  const { players: homeTeamPlayers } = usePlayersByTeam(String(homeTeamId));
  const { players: awayTeamPlayers } = usePlayersByTeam(String(awayTeamId));

  const isDark = useColorScheme() === "dark";
  const styles = boxScoreStyles(isDark, lighter);

  const [expandedTeams, setExpandedTeams] = useState<{
    [teamCode: string]: boolean;
  }>({});

  const heightAnimMap = useRef<{ [teamCode: string]: Animated.Value }>({});

  const homeTeam = teamsById[homeTeamId];
  const awayTeam = teamsById[awayTeamId];
  const homeCode = homeTeam?.code ?? "home";
  const awayCode = awayTeam?.code ?? "away";

  /** Map leadersData for quick lookup by player_id */
  const statsMap = leadersData?.reduce((acc: Record<number, any>, player) => {
    if (player.localPlayer?.player_id) {
      acc[player.localPlayer.player_id] = player;
    }
    return acc;
  }, {}) ?? {};

  /** Sort players by minutes played */
  const sortPlayersByMinutes = (players: Player[]) => {
    return [...players].sort((a, b) => {
      const aStats = statsMap[a.player_id] ?? {};
      const bStats = statsMap[b.player_id] ?? {};

      const aMin = typeof aStats.min === "string" && aStats.min.includes(":")
        ? parseInt(aStats.min.split(":")[0], 10) + parseInt(aStats.min.split(":")[1], 10) / 60
        : Number(aStats.min ?? 0);

      const bMin = typeof bStats.min === "string" && bStats.min.includes(":")
        ? parseInt(bStats.min.split(":")[0], 10) + parseInt(bStats.min.split(":")[1], 10) / 60
        : Number(bStats.min ?? 0);

      return bMin - aMin; // Descending order
    }).slice(0, 15); // Limit to 15 players
  };

  const homePlayersSorted = sortPlayersByMinutes(homeTeamPlayers);
  const awayPlayersSorted = sortPlayersByMinutes(awayTeamPlayers);

  /** Initialize animation values */
  [homeCode, awayCode].forEach((code) => {
    if (!heightAnimMap.current[code]) {
      heightAnimMap.current[code] = new Animated.Value(COLLAPSED_HEIGHT);
    }
  });

  /** Animate expansion */
  useEffect(() => {
    [homeCode, awayCode].forEach((code) => {
      const isExpanded = expandedTeams[code] ?? false;
      const players = code === homeCode ? homePlayersSorted : awayPlayersSorted;

      Animated.timing(heightAnimMap.current[code], {
        toValue: isExpanded
          ? players.length * PLAYER_ROW_HEIGHT
          : COLLAPSED_HEIGHT,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
  }, [expandedTeams, homePlayersSorted.length, awayPlayersSorted.length]);

  const formatMin = (min: string | number) => {
    if (!min) return "DNP";
    if (typeof min === "string" && min.includes(":")) {
      const [m, s] = min.split(":").map(Number);
      return (m + s / 60).toFixed(1);
    }
    return Number(min).toFixed(0);
  };

  const STAT_LABELS = [
    "MIN",
    "PTS",
    "FGM",
    "FGA",
    "FG%",
    "3PM",
    "3PA",
    "3P%",
    "FTM",
    "FTA",
    "FT%",
    "OREB",
    "DREB",
    "REB",
    "AST",
    "STL",
    "BLK",
    "TO",
    "PF",
    "+/-",
  ];

  const percent = (made: number, att: number) =>
    att ? ((made / att) * 100).toFixed(1) + "%" : "0.0%";

  const toggleExpand = (teamCode: string) => {
    setExpandedTeams((prev) => ({
      ...prev,
      [teamCode]: !prev[teamCode],
    }));
  };

  const getTeamLogo = (team: typeof homeTeam | typeof awayTeam) => {
    if (!team) return "";
    return isDark ? team.logoLight ?? team.logo ?? "" : team.logo ?? "";
  };

  /** Render team box */
  const renderTeamBox = (
    players: Player[],
    teamName: string,
    teamLogo: any,
    teamCode: string,
    isExpanded: boolean,
    heightAnim: Animated.Value
  ) => {
    return (
      <View style={styles.teamBox}>
        {/* Team Header */}
        <View style={styles.teamHeader}>
          <Text style={styles.teamLabel}>{teamName}</Text>
          {!!teamLogo && (
            <Image
              source={teamLogo}
              style={styles.teamLogo}
              resizeMode="contain"
            />
          )}
        </View>

        {/* Table */}
        <View style={{ flexDirection: "row", width: "100%" }}>
          {/* Player names */}
          <View style={{ width: NAME_COLUMN_WIDTH }}>
            <View style={styles.tableHeader}>
              <Text style={styles.cellName}>Player</Text>
            </View>

            <Animated.View
              style={{ maxHeight: heightAnim, overflow: "hidden" }}
            >
              {players.map((p, index) => {
                const id = p.player_id ?? `idx-${index}`;
                return (
                  <View key={`${teamCode}-${id}`} style={styles.tableRow}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() =>
                        router.push(`/player/${p.player_id}?teamId=${p.team_id}`)
                      }
                    >
                      <Text style={styles.cellName}>
                        {p.first_name} {p.last_name}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </Animated.View>
          </View>

          {/* Stats */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              <View
                style={[
                  styles.tableHeader,
                  { minWidth: STAT_LABELS.length * COLUMN_WIDTH },
                ]}
              >
                {STAT_LABELS.map((label) => (
                  <Text key={label} style={styles.cellHeader}>
                    {label}
                  </Text>
                ))}
              </View>

              <Animated.View
                style={{ maxHeight: heightAnim, overflow: "hidden" }}
              >
                {players.map((p, index) => {
                  const id = p.player_id ?? `idx-${index}`;
                  const stats = statsMap[p.player_id] ?? {};

                  const fgm = stats.fgm ?? 0;
                  const fga = stats.fga ?? 0;
                  const tpm = stats.tpm ?? 0;
                  const tpa = stats.tpa ?? 0;
                  const ftm = stats.ftm ?? 0;
                  const fta = stats.fta ?? 0;

                  const cols = [
                    formatMin(stats.min ?? 0),
                    stats.points ?? 0,
                    fgm,
                    fga,
                    percent(fgm, fga),
                    tpm,
                    tpa,
                    percent(tpm, tpa),
                    ftm,
                    fta,
                    percent(ftm, fta),
                    stats.offReb ?? 0,
                    stats.defReb ?? 0,
                    stats.totReb ?? 0,
                    stats.assists ?? 0,
                    stats.steals ?? 0,
                    stats.blocks ?? 0,
                    stats.turnovers ?? 0,
                    stats.pFouls ?? 0,
                    stats.plusMinus ?? 0,
                  ];

                  return (
                    <View key={`${teamCode}-${id}`} style={styles.tableRow}>
                      {cols.map((val, i) => (
                        <View
                          key={`${id}-col-${i}`}
                          style={styles.cellContainer}
                        >
                          <Text style={styles.cell}>{val}</Text>
                        </View>
                      ))}
                    </View>
                  );
                })}
              </Animated.View>
            </View>
          </ScrollView>
        </View>

        {/* Expand / collapse */}
        {players.length > COLLAPSED_ROWS && (
          <TouchableOpacity
            onPress={() => toggleExpand(teamCode)}
            style={{ padding: 10, alignItems: "center" }}
          >
            <Text style={styles.showMoreLess}>
              {isExpanded ? "Show Less" : "Show More"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // ⏳ Loading state — render skeleton only
  if (isLoading) {
    return (
      <ScrollView>
        <HeadingTwo lighter={lighter}>Box Score</HeadingTwo>
        <BoxScoreSkeleton lighter={lighter} />
      </ScrollView>
    );
  }

  if (isError) {
    return (
      <ScrollView>
        <HeadingTwo lighter={lighter}>Box Score</HeadingTwo>
        <Text style={styles.error}>Failed to load box score.</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView>
      <HeadingTwo lighter={lighter}>Box Score</HeadingTwo>

      <View style={{ marginBottom: 24 }}>
        {renderTeamBox(
          awayPlayersSorted,
          awayTeam?.fullName ?? "Away Team",
          getTeamLogo(awayTeam),
          awayCode,
          expandedTeams[awayCode] ?? false,
          heightAnimMap.current[awayCode]
        )}
      </View>

      {renderTeamBox(
        homePlayersSorted,
        homeTeam?.fullName ?? "Home Team",
        getTeamLogo(homeTeam),
        homeCode,
        expandedTeams[homeCode] ?? false,
        heightAnimMap.current[homeCode]
      )}
    </ScrollView>
  );
}
