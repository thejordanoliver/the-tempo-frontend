import { Athlete } from "@/hooks/BasketballHooks/useBasketballGameDetails";
import HeadingTwo from "components/Headings/HeadingTwo";
import { getNBATeam } from "constants/teams";
import { getCBBTeamByESPNId } from "constants/teamsCBB";
import { getWNBATeamByESPNId } from "constants/teamsWNBA";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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
  team?: TeamInfo | null;
  names?: string[];
  keys?: string[];
  labels?: string[];
  athletes?: Athlete[];
};

type Props = {
  homeTeamId: number;
  awayTeamId: number;
  homeName: string;
  awayName: string;
  homeLogo: any;
  awayLogo: any;
  playerStats?: TeamBlock[];
  isLoading?: boolean;
  isError?: boolean;
  isDark: boolean;
  league: string;
  state: string | undefined;
};

type AthleteRecord = Athlete["athlete"] & Record<string, any>;

const normalizeIdentifier = (value: unknown) => {
  if (value === null || value === undefined) return null;

  const normalized = String(value).trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
};

const collectTeamIdentifiers = (team?: TeamInfo | null) => {
  if (!team) return [];

  return [
    team.id,
    team.teamId,
    team.team_id,
    team.espnId,
    team.espn_id,
    team.wid,
    team.code,
    team.abbreviation,
    team.name,
    team.fullName,
    team.displayName,
    team.shortName,
    team.short_name,
    team.shortDisplayName,
  ]
    .map(normalizeIdentifier)
    .filter((value): value is string => Boolean(value));
};

const getAthleteId = (athlete?: AthleteRecord | null) =>
  athlete?.playerId ?? athlete?.id ?? athlete?.espnId ?? athlete?.espn_id;

const getAthleteTeamId = (
  athlete?: AthleteRecord | null,
  fallbackTeamId?: number | string,
) =>
  athlete?.teamId ??
  athlete?.team_id ??
  athlete?.team?.id ??
  athlete?.team?.teamId ??
  fallbackTeamId;

const getAthleteName = (athlete?: AthleteRecord | null) =>
  athlete?.shortName ??
  athlete?.short_name ??
  athlete?.displayName ??
  athlete?.fullName ??
  athlete?.name ??
  "Player";

const getPlayers = (teamBlock?: TeamBlock | null) =>
  Array.isArray(teamBlock?.athletes) ? teamBlock.athletes : [];

const getStatLabels = (teamBlock?: TeamBlock | null) => {
  if (Array.isArray(teamBlock?.labels) && teamBlock.labels.length > 0) {
    return teamBlock.labels;
  }

  if (Array.isArray(teamBlock?.names) && teamBlock.names.length > 0) {
    return teamBlock.names;
  }

  return DEFAULT_LABELS;
};

const getStatKeys = (teamBlock?: TeamBlock | null) => {
  if (Array.isArray(teamBlock?.keys) && teamBlock.keys.length > 0) {
    return teamBlock.keys;
  }

  return DEFAULT_KEYS;
};

const getStatValue = (
  player: Athlete,
  statKey: string | undefined,
  statIndex: number,
) => {
  const playerRecord = player as Athlete & Record<string, any>;

  if (Array.isArray(playerRecord.stats)) {
    const value = playerRecord.stats[statIndex];
    return value === null || value === undefined || value === "" ? "—" : value;
  }

  const value =
    playerRecord[statKey ?? ""] ??
    playerRecord.statistics?.[statKey ?? ""] ??
    playerRecord.stats?.[statKey ?? ""];

  return value === null || value === undefined || value === "" ? "—" : value;
};

const getDidNotPlayText = (player: Athlete) => {
  const playerRecord = player as Athlete & Record<string, any>;

  const reason =
    playerRecord.reason ??
    playerRecord.didNotPlayReason ??
    playerRecord.status ??
    playerRecord.comment;

  return reason ? `DID NOT PLAY: ${String(reason).toUpperCase()}` : "DID NOT PLAY";
};

export default function BoxScore({
  homeTeamId,
  awayTeamId,
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

  const isNBA = league === "NBA" || league === "SL";
  const isWNBA = league === "WNBA";

  const normalizedPlayerStats = useMemo(
    () =>
      Array.isArray(playerStats)
        ? playerStats.filter(
            (block): block is TeamBlock =>
              Boolean(block) && typeof block === "object",
          )
        : [],
    [playerStats],
  );

  const homeTeam = useMemo(
    () =>
      isNBA
        ? getNBATeam(homeTeamId)
        : isWNBA
          ? getWNBATeamByESPNId(homeTeamId)
          : getCBBTeamByESPNId(homeTeamId),
    [homeTeamId, isNBA, isWNBA],
  );

  const awayTeam = useMemo(
    () =>
      isNBA
        ? getNBATeam(awayTeamId)
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

  const findTeamBlock = useCallback(
    ({
      targetTeamId,
      targetName,
      targetTeam,
      fallbackIndex,
    }: {
      targetTeamId: number | string;
      targetName: string;
      targetTeam?: TeamInfo | null;
      fallbackIndex: number;
    }) => {
      const targetIdentifiers = new Set([
        normalizeIdentifier(targetTeamId),
        normalizeIdentifier(targetName),
        ...collectTeamIdentifiers(targetTeam),
      ]);

      const matchedBlock = normalizedPlayerStats.find((block) => {
        const blockIdentifiers = collectTeamIdentifiers(block.team);
        return blockIdentifiers.some((id) => targetIdentifiers.has(id));
      });

      return matchedBlock ?? normalizedPlayerStats[fallbackIndex] ?? null;
    },
    [normalizedPlayerStats],
  );

  const awayTeamBlock = useMemo(
    () =>
      findTeamBlock({
        targetTeamId: awayTeamId,
        targetName: awayName,
        targetTeam: awayTeam,
        fallbackIndex: 0,
      }),
    [awayName, awayTeam, awayTeamId, findTeamBlock],
  );

  const homeTeamBlock = useMemo(
    () =>
      findTeamBlock({
        targetTeamId: homeTeamId,
        targetName: homeName,
        targetTeam: homeTeam,
        fallbackIndex: 1,
      }),
    [homeName, homeTeam, homeTeamId, findTeamBlock],
  );

  const hasPlayerStats =
    getPlayers(awayTeamBlock).length > 0 || getPlayers(homeTeamBlock).length > 0;

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

      router.push({
        pathname: isNBA ? "/player/[id]" : "/player/basketball/[id]",
        params: {
          id: String(playerId),
          teamId: String(teamId),
          league,
        },
      });
    },
    [isNBA, league],
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
    const players = getPlayers(teamBlock);
    if (players.length === 0) return null;

    const labels = getStatLabels(teamBlock);
    const statKeys = getStatKeys(teamBlock);
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
              const athlete = player.athlete as AthleteRecord;
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

              {visiblePlayers.map((player, index) => {
                const athlete = player.athlete as AthleteRecord;
                const playerId = getAthleteId(athlete);
                const playerRecord = player as Athlete & Record<string, any>;

                return (
                  <View
                    key={`${sectionKey}-stats-${playerId ?? index}`}
                    style={[
                      styles.tableRow,
                      { backgroundColor: getRowBackground(index) },
                    ]}
                  >
                    {playerRecord.didNotPlay ? (
                      <View
                        style={[
                          styles.didNotPlayerRow,
                          { minWidth: labels.length * COLUMN_WIDTH },
                        ]}
                      >
                        <Text style={styles.didNotPlayCell}>
                          {getDidNotPlayText(player)}
                        </Text>
                      </View>
                    ) : (
                      labels.map((label, statIndex) => (
                        <View
                          key={`${sectionKey}-${playerId ?? index}-${label}`}
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
        </>
      )}
    </ScrollView>
  );
}