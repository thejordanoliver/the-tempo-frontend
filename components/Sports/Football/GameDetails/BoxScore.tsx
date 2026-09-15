import type {
  BoxScorePlayerTeam,
  BoxScoreStatCategory,
} from "@/hooks/FootballHooks/useFootballGameDetails";
import HeadingTwo from "components/Headings/HeadingTwo";
import BoxScoreSkeleton from "components/Skeletons/GameDetails/BoxScoreSkeleton";
import { activeOpacity, globalStyles } from "constants/styles";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Image,
  ImageSourcePropType,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BoxScoreStyles } from "styles/GameDetailStyles/BoxScoreStyles";

const COLLAPSED_ROWS = 5;
const COLUMN_WIDTH = 52;

type Props = {
  playerStats?: BoxScorePlayerTeam[] | null;
  homeId: number | string;
  awayId: number | string;
  homeName: string;
  awayName: string;
  homeLogo?: ImageSourcePropType | null;
  awayLogo?: ImageSourcePropType | null;
  league: string;
  isDark: boolean;
  state?: string | null;
  isLoading?: boolean;
  isError?: boolean;
};

const normalizeIdentifier = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const getTeamIdentifiers = (block: BoxScorePlayerTeam) =>
  [
    block.team.id,
    block.team.espnId,
    block.team.name,
    block.team.shortName,
    block.team.code,
    block.team.location,
  ]
    .map(normalizeIdentifier)
    .filter(Boolean);

const getCategoryTitle = (category: BoxScoreStatCategory) => {
  const categoryNames: Record<string, string> = {
    defensive: "Defense",
    fumbles: "Fumbles",
    interceptions: "Interceptions",
    kickreturns: "Kick Returns",
    kicking: "Kicking",
    passing: "Passing",
    puntreturns: "Punt Returns",
    punting: "Punting",
    receiving: "Receiving",
    rushing: "Rushing",
  };
  const normalizedName = normalizeIdentifier(category.name);

  return (
    categoryNames[normalizedName] ??
    category.name
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/^./, (character) => character.toUpperCase())
  );
};

const hasCategoryData = (category: BoxScoreStatCategory) =>
  Boolean(category.athletes?.length || category.totals?.length);

export default function BoxScore({
  playerStats,
  homeId,
  awayId,
  homeName,
  awayName,
  homeLogo,
  awayLogo,
  league,
  isDark,
  state,
  isLoading = false,
  isError = false,
}: Props) {
  const styles = useMemo(() => BoxScoreStyles(isDark), [isDark]);
  const global = useMemo(() => globalStyles(isDark), [isDark]);
  const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>(
    {},
  );

  const teamBlocks = useMemo(
    () => (Array.isArray(playerStats) ? playerStats.filter(Boolean) : []),
    [playerStats],
  );

  const findTeamBlock = useCallback(
    (teamId: number | string, teamName: string, fallbackIndex: number) => {
      const targets = new Set(
        [teamId, teamName].map(normalizeIdentifier).filter(Boolean),
      );

      return (
        teamBlocks.find((block) =>
          getTeamIdentifiers(block).some((identifier) =>
            targets.has(identifier),
          ),
        ) ??
        teamBlocks[fallbackIndex] ??
        null
      );
    },
    [teamBlocks],
  );

  const awayTeamBlock = useMemo(
    () => findTeamBlock(awayId, awayName, 0),
    [awayId, awayName, findTeamBlock],
  );
  const homeTeamBlock = useMemo(
    () => findTeamBlock(homeId, homeName, 1),
    [findTeamBlock, homeId, homeName],
  );

  const handlePlayerPress = useCallback(
    (playerId: number | string | null | undefined, teamId: number | string) => {
      if (playerId === null || playerId === undefined) return;

      router.push({
        pathname: "/player/football/[id]",
        params: {
          id: String(playerId),
          teamId: String(teamId),
          league,
        },
      });
    },
    [league],
  );

  const toggleTeam = useCallback((teamKey: "away" | "home") => {
    setExpandedTeams((current) => ({
      ...current,
      [teamKey]: !current[teamKey],
    }));
  }, []);

  const renderCategory = (
    category: BoxScoreStatCategory,
    teamKey: "away" | "home",
    teamId: number | string,
    categoryIndex: number,
  ) => {
    const athletes = category.athletes ?? [];
    const labels = category.labels ?? category.keys ?? [];
    const isExpanded = expandedTeams[teamKey] ?? false;
    const visibleAthletes = isExpanded
      ? athletes
      : athletes.slice(0, COLLAPSED_ROWS);
    const totals = category.totals ?? [];
    const categoryKey = `${teamKey}-${category.name}-${categoryIndex}`;
    const tableWidth = Math.max(labels.length, totals.length, 1) * COLUMN_WIDTH;

    return (
      <View key={categoryKey} style={styles.section}>
        <View style={styles.categoryHeader}>
          <Text selectable style={styles.categoryLabel}>
            {getCategoryTitle(category)}
          </Text>
        </View>

        <View style={styles.playerColumn}>
          <View style={styles.playerNameColumn}>
            <View style={styles.tableHeader}>
              <Text selectable style={styles.cellName}>
                Player
              </Text>
            </View>

            {visibleAthletes.map(({ athlete }, athleteIndex) => {
              const playerId = athlete.id ?? athlete.espnId;
              const playerName =
                athlete.shortName ??
                athlete.displayName ??
                athlete.fullName ??
                "Unknown Player";

              return (
                <View
                  key={`${categoryKey}-name-${playerId ?? athleteIndex}`}
                  style={[
                    styles.tableRow,
                    athleteIndex % 2 === 1 && styles.rowAlt,
                  ]}
                >
                  <TouchableOpacity
                    activeOpacity={activeOpacity}
                    onPress={() => handlePlayerPress(playerId, teamId)}
                    style={styles.playerLink}
                    disabled={playerId === null || playerId === undefined}
                  >
                    <Text selectable style={styles.cellName} numberOfLines={1}>
                      {playerName}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}

            {totals.length > 0 && (
              <View style={[styles.tableRow, styles.totalsRow]}>
                <Text selectable style={[styles.cellName, styles.totalText]}>
                  Totals
                </Text>
              </View>
            )}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.statsScroller}
          >
            <View style={{ minWidth: tableWidth }}>
              <View style={styles.tableHeader}>
                {labels.map((label, labelIndex) => (
                  <Text
                    selectable
                    key={`${categoryKey}-label-${label}-${labelIndex}`}
                    style={[styles.cell, styles.cellHeader]}
                  >
                    {label}
                  </Text>
                ))}
              </View>

              {visibleAthletes.map(({ athlete, stats }, athleteIndex) => {
                const playerId = athlete.id ?? athlete.espnId;

                return (
                  <View
                    key={`${categoryKey}-stats-${playerId ?? athleteIndex}`}
                    style={[
                      styles.tableRow,
                      athleteIndex % 2 === 1 && styles.rowAlt,
                    ]}
                  >
                    {labels.map((label, statIndex) => (
                      <View
                        key={`${categoryKey}-${label}-${statIndex}`}
                        style={styles.cellContainer}
                      >
                        <Text selectable style={styles.cell}>
                          {stats[statIndex] ?? "—"}
                        </Text>
                      </View>
                    ))}
                  </View>
                );
              })}

              {totals.length > 0 && (
                <View style={[styles.tableRow, styles.totalsRow]}>
                  {labels.map((label, statIndex) => (
                    <View
                      key={`${categoryKey}-total-${label}-${statIndex}`}
                      style={styles.cellContainer}
                    >
                      <Text selectable style={[styles.cell, styles.totalText]}>
                        {totals[statIndex] ?? "—"}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    );
  };

  const renderTeam = ({
    teamKey,
    teamId,
    teamName,
    teamLogo,
    teamBlock,
  }: {
    teamKey: "away" | "home";
    teamId: number | string;
    teamName: string;
    teamLogo?: ImageSourcePropType | null;
    teamBlock: BoxScorePlayerTeam | null;
  }) => {
    if (!teamBlock) return null;

    const categories = teamBlock.statistics.filter(hasCategoryData);
    if (categories.length === 0) return null;

    const resolvedTeamId = teamBlock.team.id ?? teamId;
    const canExpand = categories.some(
      (category) => (category.athletes?.length ?? 0) > COLLAPSED_ROWS,
    );
    const isExpanded = expandedTeams[teamKey] ?? false;

    return (
      <View style={styles.teamContainer}>
        <View style={styles.teamHeader}>
          <View style={styles.teamIdentity}>
            {teamLogo ? (
              <Image source={teamLogo} style={styles.teamLogo} />
            ) : null}

            <Text style={styles.teamLabel} numberOfLines={1}>
              {teamName}
            </Text>
          </View>
        </View>

        {categories.map((category, categoryIndex) =>
          renderCategory(category, teamKey, resolvedTeamId, categoryIndex),
        )}

        {canExpand && (
          <TouchableOpacity
            activeOpacity={activeOpacity}
            onPress={() => toggleTeam(teamKey)}
            style={styles.showMoreLessButton}
          >
            <Text selectable style={styles.showMoreLess}>
              {isExpanded ? "Show Less" : "Show More"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (state === "pre" || state === "scheduled") return null;

  if (isLoading) {
    return (
      <View>
        <HeadingTwo isDark={isDark}>Box Score</HeadingTwo>
        <BoxScoreSkeleton isDark={isDark} />
      </View>
    );
  }

  if (isError) {
    return (
      <View>
        <HeadingTwo isDark={isDark}>Box Score</HeadingTwo>
        <Text selectable style={global.errorText}>
          Failed to load box score.
        </Text>
      </View>
    );
  }

  if (!awayTeamBlock && !homeTeamBlock) return null;

  return (
    <View>
      <HeadingTwo isDark={isDark}>Box Score</HeadingTwo>
      <View style={styles.teamsContainer}>
        {renderTeam({
          teamKey: "away",
          teamId: awayId,
          teamName: awayName,
          teamLogo: awayLogo,
          teamBlock: awayTeamBlock,
        })}
        {renderTeam({
          teamKey: "home",
          teamId: homeId,
          teamName: homeName,
          teamLogo: homeLogo,
          teamBlock: homeTeamBlock,
        })}
      </View>
    </View>
  );
}
