import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors, globalStyles } from "constants/styles";
import {
  getNBATeam,
  getTeamByESPNId as getNBATeamByESPNId,
  getTeamLogo,
} from "constants/teams";
import { getCBBTeamLogo, getTeamByESPNId } from "constants/teamsCBB";
import { getWNBATeamByESPNId, getWNBATeamLogo } from "constants/teamsWNBA";
import { router } from "expo-router";
import { Athlete } from "hooks/NBAHooks/useGameDetails";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { boxScoreStyles } from "styles/GameDetailStyles/BoxScoreStyles";
import BoxScoreSkeleton from "../../../Skeletons/GameDetails/BoxScoreSkeleton";

const COLUMN_WIDTH = 50;
const PLAYER_ROW_HEIGHT = 36;
const COLLAPSED_ROWS = 5;
const COLLAPSED_HEIGHT = PLAYER_ROW_HEIGHT * COLLAPSED_ROWS;

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type TeamBlock = {
  team: { id: number };
  athletes: Athlete[];
};

type Props = {
  homeTeamId: number;
  awayTeamId: number;
  playerStats: TeamBlock[];
  isLoading?: boolean;
  isError?: boolean;
  isDark: boolean;
  league: "NBA" | "WNBA" | "CBB" | "WCBB" | "SL";
  gameStatusDescription: string | undefined;
};

export default function BoxScore({
  homeTeamId,
  awayTeamId,
  playerStats,
  isLoading = false,
  isError = false,
  league,
  isDark,
  gameStatusDescription,
}: Props) {
  const styles = boxScoreStyles(isDark);
  const global = globalStyles(isDark);
  const heightAnimMap = useRef<Record<string, Animated.Value>>({});
  const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>(
    {},
  );

  const getRowBackground = useCallback(
    (index: number) =>
      index % 2 === 1
        ? isDark
          ? Colors.transparentDarkGray
          : Colors.transparentLightGray
        : "transparent",
    [isDark],
  );

  const labels =
    league === "CBB" || league === "WCBB"
      ? [
          "MIN",
          "PTS",
          "FG",
          "3PT",
          "FT",
          "REB",
          "AST",
          "TO",
          "STL",
          "BLK",
          "OREB",
          "DREB",
          "PF",
        ]
      : [
          "MIN",
          "PTS",
          "FG",
          "3PT",
          "FT",
          "REB",
          "AST",
          "TO",
          "STL",
          "BLK",
          "OREB",
          "DREB",
          "PF",
          "+/-",
        ];

  const homeTeam =
    league === "NBA" || league === "SL"
      ? getNBATeamByESPNId(homeTeamId)
      : league === "WNBA"
        ? getWNBATeamByESPNId(homeTeamId)
        : getTeamByESPNId(homeTeamId);
  const awayTeam =
    league === "NBA" || league === "SL"
      ? getNBATeamByESPNId(awayTeamId)
      : league === "WNBA"
        ? getWNBATeamByESPNId(awayTeamId)
        : getTeamByESPNId(awayTeamId);

  const homeCode = homeTeam?.code ?? "home";
  const awayCode = awayTeam?.code ?? "away";

  const homeLogo =
    league === "CBB" || league === "WCBB"
      ? getCBBTeamLogo(homeTeam?.id, isDark, league === "WCBB")
      : league === "NBA" || league === "SL"
        ? getTeamLogo(homeTeam?.id, isDark)
        : league === "WNBA"
          ? getWNBATeamLogo(homeTeam?.id, isDark)
          : null;

  const awayLogo =
    league === "CBB" || league === "WCBB"
      ? getCBBTeamLogo(awayTeam?.id, isDark, league === "WCBB")
      : league === "NBA" || league === "SL"
        ? getTeamLogo(awayTeam?.id, isDark)
        : league === "WNBA"
          ? getWNBATeamLogo(awayTeam?.id, isDark)
          : null;

  // Initialize animated heights
  [homeCode, awayCode].forEach((code) => {
    if (!heightAnimMap.current[code]) {
      heightAnimMap.current[code] = new Animated.Value(COLLAPSED_HEIGHT);
    }
  });

  /** Animate expansion */
  useEffect(() => {
    [homeCode, awayCode].forEach((code) => {
      const isExpanded = expandedTeams[code] ?? false;
      const teamBlock = playerStats.find((t) => String(t.team.id) === code);
      const playerCount = teamBlock?.athletes.length ?? 0;

      const targetHeight = isExpanded
        ? playerCount * PLAYER_ROW_HEIGHT
        : Math.min(playerCount, COLLAPSED_ROWS) * PLAYER_ROW_HEIGHT;

      Animated.timing(heightAnimMap.current[code], {
        toValue: targetHeight,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
  }, [expandedTeams, playerStats]);

  const toggleExpand = (teamCode: string) => {
    setExpandedTeams((prev) => ({
      ...prev,
      [teamCode]: !prev[teamCode],
    }));
  };

  const renderTeamBox = (teamCode: string, teamName: string, teamLogo: any) => {
    const teamBlock = playerStats.find((t) => String(t.team.id) === teamCode);
    if (!teamBlock) return null;

    const players = teamBlock.athletes;
    const isExpanded = expandedTeams[teamCode] ?? false;
    const visiblePlayers = isExpanded
      ? players
      : players.slice(0, COLLAPSED_ROWS);

    return (
      <View style={styles.teamContainer}>
        {/* HEADER */}
        <View style={styles.teamHeader}>
          <Text style={styles.teamLabel}>{teamName}</Text>
          {teamLogo && (
            <Image
              source={teamLogo}
              style={styles.teamLogo}
              resizeMode="contain"
            />
          )}
        </View>

        {/* PLAYER NAMES */}
        <View style={styles.playerColumn}>
          <View style={styles.playerNameColumn}>
            <View style={styles.tableHeader}>
              <Text style={styles.cellName}>Player</Text>
            </View>
            <Animated.View
              style={{
                maxHeight: heightAnimMap.current[teamCode],
                overflow: "hidden",
              }}
            >
              {visiblePlayers.map((p: Athlete, index) => {
                const teamId = p.athlete.teamId;
                const team =
                  league === "NBA" || league === "SL"
                    ? getNBATeam(teamId)
                    : getTeamByESPNId(teamId);
                const id =
                  league === "NBA"
                    ? p.athlete.playerId
                    : (p.athlete.id ?? `idx-${index}`);

                const isNBA = league === "NBA" || league === "SL";

                const playerId = isNBA ? p.athlete.playerId : p.athlete.id;

                return (
                  <View
                    key={`${teamCode}-${id}`} // ✅ FIX key here too
                    style={[
                      styles.tableRow,
                      { backgroundColor: getRowBackground(index) },
                    ]}
                  >
                    <TouchableOpacity
                      key={p.athlete.id}
                      onPress={() => {
                        // Determine league route only if not NBA
                        const leagueRoute = !isNBA
                          ? league === "CBB" || league === "WCBB"
                            ? "cbb"
                            : undefined
                          : undefined;

                        if (playerId && teamId) {
                          router.push({
                            pathname: isNBA
                              ? `/player/[id]`
                              : leagueRoute
                                ? `/player/${leagueRoute}/[id]`
                                : `/player/[id]`, // fallback
                            params: {
                              id: playerId,
                              teamId: teamId,
                              league,
                            },
                          });
                        }
                      }}
                    >
                      <Text style={styles.cellName}>{p.athlete.shortName}</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </Animated.View>
          </View>

          {/* STATS */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              <View
                style={[
                  styles.tableHeader,
                  { minWidth: labels.length * COLUMN_WIDTH },
                ]}
              >
                {labels.map((label) => (
                  <Text key={label} style={styles.cell}>
                    {label}
                  </Text>
                ))}
              </View>

              <Animated.View
                style={{
                  maxHeight: heightAnimMap.current[teamCode],
                  overflow: "hidden",
                }}
              >
                {visiblePlayers.map((p: Athlete, index) => (
                  <View
                    key={p.athlete.id}
                    style={[
                      styles.tableRow,
                      { backgroundColor: getRowBackground(index) },
                    ]}
                  >
                    {p.didNotPlay ? (
                      <View
                        style={[
                          styles.didNotPlayerRow,
                          {
                            minWidth: labels.length * COLUMN_WIDTH,
                          },
                        ]}
                      >
                        <Text style={styles.didNotPlayCell}>
                          DID NOT PLAY: COACH DECISION
                        </Text>
                      </View>
                    ) : (
                      p.stats.map((val: string | number, i: number) => (
                        <View
                          key={`${p.athlete.id}-${i}`}
                          style={styles.cellContainer}
                        >
                          <Text style={styles.cell}>{val ?? 0}</Text>
                        </View>
                      ))
                    )}
                  </View>
                ))}
              </Animated.View>
            </View>
          </ScrollView>
        </View>

        {/* EXPAND / COLLAPSE */}
        {players.length > COLLAPSED_ROWS && (
          <TouchableOpacity
            activeOpacity={0.85}
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

  if (gameStatusDescription === "Scheduled") {
    return null;
  }

  if (isLoading) {
    return (
      <ScrollView>
        <HeadingTwo isDark={isDark}>Box Score</HeadingTwo>
        <BoxScoreSkeleton isDark={isDark} />
      </ScrollView>
    );
  }
  if (isError)
    return (
      <ScrollView>
        <HeadingTwo isDark={isDark}>Box Score</HeadingTwo>
        <Text style={global.errorText}>Failed to load box score.</Text>
      </ScrollView>
    );

  return (
    <ScrollView>
      <HeadingTwo isDark={isDark}>Box Score</HeadingTwo>
      <View style={{ marginBottom: 24 }}>
        {renderTeamBox(
          String(awayTeamId),
          awayTeam?.fullName ?? "Away Team",
          awayLogo,
        )}
      </View>
      {renderTeamBox(
        String(homeTeamId),
        homeTeam?.fullName ?? "Home Team",
        homeLogo,
      )}
    </ScrollView>
  );
}
