import {
  Athlete,
  PlayerStats,
} from "@/hooks/BasketballHooks/useBasketballGameDetails";
import HeadingTwo from "components/Headings/HeadingTwo";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { boxScoreStyles } from "styles/GameDetailStyles/BoxScoreStyles";
import {
  Colors,
  activeOpacity,
  globalStyles,
} from "../../../../constants/styles";
import BoxScoreSkeleton from "../../../Skeletons/GameDetails/BoxScoreSkeleton";

const COLUMN_WIDTH = 50;
const COLLAPSED_ROWS = 5;

const DEFAULT_LABELS = [
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

const DEFAULT_KEYS = [
  "minutes",
  "points",
  "fieldGoalsMade-fieldGoalsAttempted",
  "threePointFieldGoalsMade-threePointFieldGoalsAttempted",
  "freeThrowsMade-freeThrowsAttempted",
  "rebounds",
  "assists",
  "turnovers",
  "steals",
  "blocks",
  "offensiveRebounds",
  "defensiveRebounds",
  "fouls",
  "plusMinus",
];

/*
 * PlayerStats is currently declared as an array in the hook.
 * PlayerStats[number] gives us one team box-score block.
 */
type TeamBlock = PlayerStats[number];
type TeamInfo = TeamBlock["team"];

type AthleteRecord = Athlete & {
  espnId?: number | string | null;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  displayName?: string | null;
  teamId?: number | string | null;
  team?: {
    id?: number | string | null;
  } | null;
  athlete?: {
    id?: number | string | null;
    espnId?: number | string | null;
    firstName?: string | null;
    lastName?: string | null;
    fullName?: string | null;
    displayName?: string | null;
    shortName?: string | null;
    headshot?: string | null;
    jersey?: string | null;
    position?: string | null;
    teamId?: number | string | null;
    team?: {
      id?: number | string | null;
    } | null;
  } | null;
};

type Props = {
  homeId: number | string;
  awayId: number | string;
  homeName: string;
  awayName: string;
  homeLogo: any;
  awayLogo: any;

  /*
   * The union temporarily supports both:
   * - the actual API array
   * - the nested array caused by PlayerStats[] in the hook
   */
  playerStats: PlayerStats | PlayerStats[];

  isLoading?: boolean;
  isError?: boolean;
  isDark: boolean;
  league: string;
  state: string | null;
};

const normalizeIdentifier = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
};

const collectTeamIdentifiers = (team?: TeamInfo | null): string[] => {
  if (!team) {
    return [];
  }

  return [
    team.id,
    team.espnId,
    team.name,
    team.fullName,
    team.code,
    team.location,
    team.city,
    team.state,
  ]
    .map(normalizeIdentifier)
    .filter(Boolean);
};

const isTeamBlock = (value: unknown): value is TeamBlock => {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    "team" in value
  );
};

const normalizePlayerStats = (
  playerStats: PlayerStats | PlayerStats[],
): TeamBlock[] => {
  if (!Array.isArray(playerStats)) {
    return [];
  }

  const blocks: TeamBlock[] = [];

  for (const item of playerStats) {
    if (Array.isArray(item)) {
      for (const nestedItem of item) {
        if (isTeamBlock(nestedItem)) {
          blocks.push(nestedItem);
        }
      }

      continue;
    }

    if (isTeamBlock(item)) {
      blocks.push(item);
    }
  }

  return blocks;
};

const getPlayers = (teamBlock: TeamBlock | null): Athlete[] => {
  return Array.isArray(teamBlock?.athletes) ? teamBlock.athletes : [];
};

const getStatLabels = (teamBlock: TeamBlock | null): string[] => {
  if (Array.isArray(teamBlock?.labels) && teamBlock.labels.length > 0) {
    return teamBlock.labels;
  }

  if (Array.isArray(teamBlock?.names) && teamBlock.names.length > 0) {
    return teamBlock.names;
  }

  return DEFAULT_LABELS;
};

const getStatKeys = (teamBlock: TeamBlock | null): string[] => {
  if (Array.isArray(teamBlock?.keys) && teamBlock.keys.length > 0) {
    return teamBlock.keys;
  }

  return DEFAULT_KEYS;
};

const getAthleteId = (player: AthleteRecord): number | string | null => {
  return player.id ?? null;
};

const getAthleteTeamId = (
  player: AthleteRecord,
  fallbackTeamId: number | string,
): number | string => {
  return (
    player.teamId ??
    player.team?.id ??
    player.athlete?.teamId ??
    player.athlete?.team?.id ??
    fallbackTeamId
  );
};

const getAthleteName = (player: AthleteRecord): string => {
  return player.shortName ?? "Unknown Player";
};

const getStatValue = (
  player: Athlete,
  statKey: string | undefined,
  statIndex: number,
): string => {
  const playerRecord = player as AthleteRecord;
  const statsByKey = playerRecord.statsByKey as
    | Record<string, string>
    | undefined;

  if (statKey && statsByKey) {
    const keyedValue = statsByKey[statKey];

    if (keyedValue !== null && keyedValue !== undefined && keyedValue !== "") {
      return String(keyedValue);
    }
  }

  if (Array.isArray(playerRecord.stats)) {
    const indexedValue = playerRecord.stats[statIndex];

    if (
      indexedValue !== null &&
      indexedValue !== undefined &&
      indexedValue !== ""
    ) {
      return String(indexedValue);
    }
  }

  return "—";
};

const getDidNotPlayText = (player: Athlete): string => {
  const reason = player.reason?.trim();

  return reason ? `DID NOT PLAY: ${reason}` : "DID NOT PLAY";
};

export default function BoxScore({
  homeId,
  awayId,
  homeName,
  awayName,
  homeLogo,
  awayLogo,
  playerStats = [],
  isLoading = false,
  isError = false,
  league,
  isDark,
  state,
}: Props) {
  const styles = boxScoreStyles(isDark);
  const global = globalStyles(isDark);

  const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>(
    {},
  );

  const normalizedPlayerStats = useMemo(
    () => normalizePlayerStats(playerStats),
    [playerStats],
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

  const findTeamBlock = useCallback(
    ({
      targetTeamId,
      targetName,
      fallbackIndex,
    }: {
      targetTeamId: number | string;
      targetName: string;
      fallbackIndex: number;
    }): TeamBlock | null => {
      const targetIdentifiers = new Set(
        [targetTeamId, targetName].map(normalizeIdentifier).filter(Boolean),
      );

      const matchedBlock = normalizedPlayerStats.find((block) => {
        const blockIdentifiers = collectTeamIdentifiers(block.team);

        return blockIdentifiers.some((identifier) =>
          targetIdentifiers.has(identifier),
        );
      });

      return matchedBlock ?? normalizedPlayerStats[fallbackIndex] ?? null;
    },
    [normalizedPlayerStats],
  );

  const awayTeamBlock = useMemo(
    () =>
      findTeamBlock({
        targetTeamId: awayId,
        targetName: awayName,
        fallbackIndex: 0,
      }),
    [awayId, awayName, findTeamBlock],
  );

  const homeTeamBlock = useMemo(
    () =>
      findTeamBlock({
        targetTeamId: homeId,
        targetName: homeName,
        fallbackIndex: 1,
      }),
    [homeId, homeName, findTeamBlock],
  );

  const hasPlayerStats =
    getPlayers(awayTeamBlock).length > 0 ||
    getPlayers(homeTeamBlock).length > 0;

  const toggleExpand = useCallback((sectionKey: string) => {
    setExpandedTeams((previous) => ({
      ...previous,
      [sectionKey]: !previous[sectionKey],
    }));
  }, []);

  const handlePlayerPress = useCallback(
    (
      playerId: number | string | null,
      teamId: number | string | null,
      league: string,
    ) => {
      if (
        playerId === null ||
        playerId === undefined ||
        teamId === null ||
        teamId === undefined
      ) {
        return;
      }

      router.push({
        pathname: "/player/basketball/[id]",
        params: {
          id: String(playerId),
          teamId: String(teamId),
          league,
        },
      });
    },
    [],
  );

  const renderTeamBox = ({
    sectionKey,
    teamId,
    teamName,
    teamLogo,
    teamBlock,
  }: {
    sectionKey: "away" | "home";
    teamId: number | string;
    teamName: string;
    teamLogo: any;
    teamBlock: TeamBlock | null;
  }) => {
    const players = getPlayers(teamBlock);

    if (players.length === 0) {
      return null;
    }

    const labels = getStatLabels(teamBlock);
    const statKeys = getStatKeys(teamBlock);
    const resolvedTeamId = teamBlock?.team?.id ?? teamId;
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

            {visiblePlayers.map((player, index) => {
              const athlete = player as AthleteRecord;
              const playerId = getAthleteId(athlete);
              const playerTeamId = getAthleteTeamId(athlete, resolvedTeamId);
              const playerName = getAthleteName(athlete);

              return (
                <View
                  key={`${sectionKey}-name-${playerId ?? index}`}
                  style={[
                    styles.tableRow,
                    {
                      backgroundColor: getRowBackground(index),
                    },
                  ]}
                >
                  <TouchableOpacity
                    activeOpacity={activeOpacity}
                    onPress={() =>
                      handlePlayerPress(playerId, playerTeamId, league.toUpperCase())
                    }
                  >
                    <Text style={styles.cellName} numberOfLines={1}>
                      {playerName}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              <View
                style={[
                  styles.tableHeader,
                  {
                    minWidth: labels.length * COLUMN_WIDTH,
                  },
                ]}
              >
                {labels.map((label, index) => (
                  <Text key={`${label}-${index}`} style={styles.cell}>
                    {label}
                  </Text>
                ))}
              </View>

              {visiblePlayers.map((player, index) => {
                const athlete = player as AthleteRecord;
                const playerId = getAthleteId(athlete);

                return (
                  <View
                    key={`${sectionKey}-stats-${playerId ?? index}`}
                    style={[
                      styles.tableRow,
                      {
                        backgroundColor: getRowBackground(index),
                      },
                    ]}
                  >
                    {player.didNotPlay ? (
                      <View
                        style={[
                          styles.didNotPlayerRow,
                          {
                            minWidth: labels.length * COLUMN_WIDTH,
                          },
                        ]}
                      >
                        <Text style={styles.didNotPlayCell}>
                          {getDidNotPlayText(player)}
                        </Text>
                      </View>
                    ) : (
                      labels.map((label, statIndex) => (
                        <View
                          key={`${sectionKey}-${
                            playerId ?? index
                          }-${label}-${statIndex}`}
                          style={styles.cellContainer}
                        >
                          <Text style={styles.cell}>
                            {getStatValue(
                              player,
                              statKeys[statIndex],
                              statIndex,
                            )}
                          </Text>
                        </View>
                      ))
                    )}
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {players.length > COLLAPSED_ROWS && (
          <TouchableOpacity
            activeOpacity={activeOpacity}
            onPress={() => toggleExpand(sectionKey)}
            style={{
              padding: 10,
              alignItems: "center",
            }}
          >
            <Text style={styles.showMoreLess}>
              {isExpanded ? "Show Less" : "Show More"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (state === "pre") {
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

      {!hasPlayerStats ? (
        <Text
          style={[
            styles.cellName,
            {
              paddingVertical: 12,
              opacity: 0.7,
            },
          ]}
        >
          No box score available.
        </Text>
      ) : (
        <>
          <View style={{ marginBottom: 24 }}>
            {renderTeamBox({
              sectionKey: "away",
              teamId: awayId,
              teamName: awayName || "Away Team",
              teamLogo: awayLogo,
              teamBlock: awayTeamBlock,
            })}
          </View>

          {renderTeamBox({
            sectionKey: "home",
            teamId: homeId,
            teamName: homeName || "Home Team",
            teamLogo: homeLogo,
            teamBlock: homeTeamBlock,
          })}
        </>
      )}
    </ScrollView>
  );
}
