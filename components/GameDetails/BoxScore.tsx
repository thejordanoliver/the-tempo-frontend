import { boxScoreStyles } from "styles/GameDetailStyles/BoxScoreStyles";
import { teamsById } from "constants/teams";
import { router } from "expo-router";
import { useGameLeaders } from "hooks/useGameLeaders";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  useColorScheme,
  View,
} from "react-native";
import HeadingTwo from "../Headings/HeadingTwo";
import BoxScoreSkeleton from "./BoxScoreSkeleton";

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
  const { data, isLoading, isError } = useGameLeaders(
    gameId,
    homeTeamId,
    awayTeamId
  );

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

  /** Generate placeholder players if no stats exist */
  const getPlayersForTeam = (teamType: "home" | "away") => {
    const targetTeamId = teamType === "home" ? homeTeamId : awayTeamId;

    const teamPlayers = data?.filter(
      (p) => Number(p.team?.id) === Number(targetTeamId)
    );

    if (teamPlayers && teamPlayers.length > 0) return teamPlayers;

    // fallback placeholders
    return Array.from({ length: 12 }).map((_, i) => ({
      localPlayer: {
        first_name: "Player",
        last_name: `${i + 1}`,
        player_id: i + 1,
      },
      teamType,
      min: 0,
      points: 0,
      fgm: 0,
      fga: 0,
      tpm: 0,
      tpa: 0,
      ftm: 0,
      fta: 0,
      offReb: 0,
      defReb: 0,
      totReb: 0,
      assists: 0,
      steals: 0,
      blocks: 0,
      turnovers: 0,
      pFouls: 0,
      plusMinus: 0,
      team: { id: targetTeamId },
    }));
  };

  const homePlayers = getPlayersForTeam("home");
  const awayPlayers = getPlayersForTeam("away");

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
      const players = code === homeCode ? homePlayers : awayPlayers;

      Animated.timing(heightAnimMap.current[code], {
        toValue: isExpanded
          ? players.length * PLAYER_ROW_HEIGHT
          : COLLAPSED_HEIGHT,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
  }, [expandedTeams, homePlayers.length, awayPlayers.length]);

  const formatMin = (min: string | number) => {
    if (!min) return "0.0";
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
    players: any[],
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
                const id =
                  p.localPlayer?.player_id ??
                  p.localPlayer?.id ??
                  `idx-${index}`;

                return (
                  <View key={`${teamCode}-${id}`} style={styles.tableRow}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() =>
                        router.push(
                          `/player/${p.localPlayer?.player_id}?teamId=${p.team?.id}`
                        )
                      }
                    >
                      <Text style={styles.cellName}>
                        {p.localPlayer?.first_name} {p.localPlayer?.last_name}
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
                  const id =
                    p.localPlayer?.player_id ??
                    p.localPlayer?.id ??
                    `idx-${index}`;

                  const cols = [
                    formatMin(p.min ?? 0),
                    p.points ?? 0,
                    p.fgm ?? 0,
                    p.fga ?? 0,
                    percent(p.fgm ?? 0, p.fga ?? 0),
                    p.tpm ?? 0,
                    p.tpa ?? 0,
                    percent(p.tpm ?? 0, p.tpa ?? 0),
                    p.ftm ?? 0,
                    p.fta ?? 0,
                    percent(p.ftm ?? 0, p.fta ?? 0),
                    p.offReb ?? 0,
                    p.defReb ?? 0,
                    p.totReb ?? 0,
                    p.assists ?? 0,
                    p.steals ?? 0,
                    p.blocks ?? 0,
                    p.turnovers ?? 0,
                    p.pFouls ?? 0,
                    p.plusMinus ?? 0,
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
          awayPlayers,
          awayTeam?.fullName ?? "Away Team",
          getTeamLogo(awayTeam),
          awayCode,
          expandedTeams[awayCode] ?? false,
          heightAnimMap.current[awayCode]
        )}
      </View>

      {renderTeamBox(
        homePlayers,
        homeTeam?.fullName ?? "Home Team",
        getTeamLogo(homeTeam),
        homeCode,
        expandedTeams[homeCode] ?? false,
        heightAnimMap.current[homeCode]
      )}
    </ScrollView>
  );
}

