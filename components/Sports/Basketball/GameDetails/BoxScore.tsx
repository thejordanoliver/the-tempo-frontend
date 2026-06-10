import { Athlete } from "@/hooks/BasketballHooks/useBasketballGameDetails";
import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors, globalStyles } from "constants/styles";
import { getTeamByESPNId as getNBATeamByESPNId } from "constants/teams";
import { getCBBTeamByESPNId } from "constants/teamsCBB";
import { getWNBATeamByESPNId } from "constants/teamsWNBA";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type TeamInfo = {
  id?: number | string | null;
  teamId?: number | string | null;
  team_id?: number | string | null;
  espnId?: number | string | null;
  espn_id?: number | string | null;
  wid?: number | string | null;
  code?: string | null;
  abbreviation?: string | null;
  name?: string | null;
  fullName?: string | null;
  displayName?: string | null;
  shortName?: string | null;
  short_name?: string | null;
  shortDisplayName?: string | null;
};

type TeamBlock = {
  team: TeamInfo;
  athletes: Athlete[];
};

type Props = {
  homeTeamId: number;
  awayTeamId: number;
  homeName: string;
  awayName: string;
  homeLogo: any;
  awayLogo: any;
  playerStats: TeamBlock[];
  isLoading?: boolean;
  isError?: boolean;
  isDark: boolean;
  league: string;
  gameStatusDescription: string | undefined;
};

const normalizeIdentifier = (value: unknown) => {
  if (value === null || value === undefined) return null;

  const normalized = String(value).trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
};

const collectTeamIdentifiers = (team?: TeamInfo | null) => {
  const values = [
    team?.id,
    team?.teamId,
    team?.team_id,
    team?.espnId,
    team?.espn_id,
    team?.wid,
    team?.code,
    team?.abbreviation,
    team?.name,
    team?.fullName,
    team?.displayName,
    team?.shortName,
    team?.short_name,
    team?.shortDisplayName,
  ];

  return values
    .map(normalizeIdentifier)
    .filter((value): value is string => Boolean(value));
};

const getAthleteId = (athlete: Athlete["athlete"] & Record<string, any>) =>
  athlete?.playerId ?? athlete?.id ?? athlete?.espnId ?? athlete?.espn_id;

const getAthleteTeamId = (
  athlete: Athlete["athlete"] & Record<string, any>,
  fallbackTeamId?: number | string,
) =>
  athlete?.teamId ??
  athlete?.team_id ??
  athlete?.team?.id ??
  athlete?.team?.teamId ??
  fallbackTeamId;

const getAthleteName = (athlete: Athlete["athlete"] & Record<string, any>) =>
  athlete?.shortName ??
  athlete?.short_name ??
  athlete?.displayName ??
  athlete?.fullName ??
  athlete?.name ??
  "Player";

export default function BoxScore({
  homeTeamId,
  awayTeamId,
  homeName,
  awayName,
  homeLogo,
  awayLogo,
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

  const isNBA = league === "NBA" || league === "SL";
  const isCollege = league === "CBB" || league === "WCBB";
  const isWNBA = league === "WNBA";

  const labels =
    isCollege || isWNBA
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

  const homeTeam = useMemo(
    () =>
      isNBA
        ? getNBATeamByESPNId(homeTeamId)
        : isWNBA
          ? getWNBATeamByESPNId(homeTeamId)
          : getCBBTeamByESPNId(homeTeamId),
    [homeTeamId, isNBA, isWNBA],
  );

  const awayTeam = useMemo(
    () =>
      isNBA
        ? getNBATeamByESPNId(awayTeamId)
        : isWNBA
          ? getWNBATeamByESPNId(awayTeamId)
          : getCBBTeamByESPNId(awayTeamId),
    [awayTeamId, isNBA, isWNBA],
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

  const getHeightAnim = useCallback((sectionKey: string) => {
    if (!heightAnimMap.current[sectionKey]) {
      heightAnimMap.current[sectionKey] = new Animated.Value(
        PLAYER_ROW_HEIGHT * COLLAPSED_ROWS,
      );
    }

    return heightAnimMap.current[sectionKey];
  }, []);

  const findTeamBlock = useCallback(
    (
      targetTeamId: number | string,
      targetTeam?: TeamInfo | null,
      fallbackIndex?: number,
    ) => {
      const targetIdentifiers = new Set([
        normalizeIdentifier(targetTeamId),
        ...collectTeamIdentifiers(targetTeam),
      ]);

      const matchedBlock = playerStats.find((block) => {
        const blockIdentifiers = collectTeamIdentifiers(block.team);
        return blockIdentifiers.some((id) => targetIdentifiers.has(id));
      });

      if (matchedBlock) return matchedBlock;

      // ESPN box score arrays usually come in away/home order.
      // This fallback fixes WNBA cases where the team block id shape differs.
      if (
        typeof fallbackIndex === "number" &&
        playerStats.length > fallbackIndex
      ) {
        return playerStats[fallbackIndex];
      }

      return null;
    },
    [playerStats],
  );

  const awayTeamBlock = useMemo(
    () => findTeamBlock(awayTeamId, awayTeam, 0),
    [awayTeamId, awayTeam, findTeamBlock],
  );

  const homeTeamBlock = useMemo(
    () => findTeamBlock(homeTeamId, homeTeam, 1),
    [homeTeamId, homeTeam, findTeamBlock],
  );

  useEffect(() => {
    const sections = [
      {
        key: "away",
        teamBlock: awayTeamBlock,
      },
      {
        key: "home",
        teamBlock: homeTeamBlock,
      },
    ];

    sections.forEach(({ key, teamBlock }) => {
      const isExpanded = expandedTeams[key] ?? false;
      const playerCount = teamBlock?.athletes?.length ?? 0;

      const targetHeight = isExpanded
        ? playerCount * PLAYER_ROW_HEIGHT
        : Math.min(playerCount, COLLAPSED_ROWS) * PLAYER_ROW_HEIGHT;

      Animated.timing(getHeightAnim(key), {
        toValue: targetHeight,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
  }, [awayTeamBlock, expandedTeams, getHeightAnim, homeTeamBlock]);

  const toggleExpand = useCallback((sectionKey: string) => {
    setExpandedTeams((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  }, []);

  const handlePlayerPress = useCallback(
    (
      playerId: number | string | undefined | null,
      teamId: number | string | undefined | null,
    ) => {
      if (!playerId || !teamId) return;

      const leagueRoute = isCollege ? "cbb" : undefined;

      router.push({
        pathname: isNBA
          ? "/player/[id]"
          : leagueRoute
            ? "/player/cbb/[id]"
            : "/player/[id]",
        params: {
          id: String(playerId),
          teamId: String(teamId),
          league,
        },
      });
    },
    [isCollege, isNBA, league],
  );

  const renderTeamBox = ({
    sectionKey,
    teamId,
    teamName,
    teamLogo,
    teamBlock,
  }: {
    sectionKey: "away" | "home";
    teamId: number;
    teamName: string;
    teamLogo: any;
    teamBlock: TeamBlock | null;
  }) => {
    if (!teamBlock) return null;

    const players = Array.isArray(teamBlock.athletes) ? teamBlock.athletes : [];
    const isExpanded = expandedTeams[sectionKey] ?? false;
    const visiblePlayers = isExpanded
      ? players
      : players.slice(0, COLLAPSED_ROWS);

    return (
      <View style={styles.teamContainer}>
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

        <View style={styles.playerColumn}>
          <View style={styles.playerNameColumn}>
            <View style={styles.tableHeader}>
              <Text style={styles.cellName}>Player</Text>
            </View>

            <Animated.View
              style={{
                maxHeight: getHeightAnim(sectionKey),
                overflow: "hidden",
              }}
            >
              {visiblePlayers.map((p: Athlete, index) => {
                const athlete = p.athlete as Athlete["athlete"] &
                  Record<string, any>;

                const playerId = getAthleteId(athlete);
                const playerTeamId = getAthleteTeamId(athlete, teamId);
                const playerName = getAthleteName(athlete);

                return (
                  <View
                    key={`${sectionKey}-name-${playerId ?? index}`}
                    style={[
                      styles.tableRow,
                      { backgroundColor: getRowBackground(index) },
                    ]}
                  >
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handlePlayerPress(playerId, playerTeamId)}
                    >
                      <Text style={styles.cellName} numberOfLines={1}>
                        {playerName}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </Animated.View>
          </View>

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
                  maxHeight: getHeightAnim(sectionKey),
                  overflow: "hidden",
                }}
              >
                {visiblePlayers.map((p: Athlete, index) => {
                  const athlete = p.athlete as Athlete["athlete"] &
                    Record<string, any>;

                  const playerId = getAthleteId(athlete);
                  const stats = Array.isArray(p.stats) ? p.stats : [];

                  return (
                    <View
                      key={`${sectionKey}-stats-${playerId ?? index}`}
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
                        labels.map((_, i) => (
                          <View
                            key={`${sectionKey}-${playerId ?? index}-${i}`}
                            style={styles.cellContainer}
                          >
                            <Text style={styles.cell}>{stats[i] ?? 0}</Text>
                          </View>
                        ))
                      )}
                    </View>
                  );
                })}
              </Animated.View>
            </View>
          </ScrollView>
        </View>

        {players.length > COLLAPSED_ROWS && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => toggleExpand(sectionKey)}
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

  if (isError) {
    return (
      <ScrollView>
        <HeadingTwo isDark={isDark}>Box Score</HeadingTwo>
        <Text style={global.errorText}>Failed to load box score.</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView>
      <HeadingTwo isDark={isDark}>Box Score</HeadingTwo>

      <View style={{ marginBottom: 24 }}>
        {renderTeamBox({
          sectionKey: "away",
          teamId: awayTeamId,
          teamName: awayName ?? "Away Team",
          teamLogo: awayLogo,
          teamBlock: awayTeamBlock,
        })}
      </View>

      {renderTeamBox({
        sectionKey: "home",
        teamId: homeTeamId,
        teamName: homeName ?? "Home Team",
        teamLogo: homeLogo,
        teamBlock: homeTeamBlock,
      })}
    </ScrollView>
  );
}
