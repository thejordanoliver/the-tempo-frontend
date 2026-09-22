import MainScrollTabBar from "@/components/TabBars/MainTabScrollBar";
import type {
  BaseballRosterLeague,
  BaseballRosterStats,
  BaseballSeasonStats,
  BaseballStatMap,
  BaseballStatValue,
  RosterPlayer,
} from "@/hooks/BaseballHooks/useRosterStats";
import type { TeamAggregatedStats } from "@/hooks/BaseballHooks/useTeamStats";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { activeOpacity, Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { rosterStatsStyles } from "styles/TeamStyles/RosterStatStyles";

type RosterStatsComponentProps = {
  rosterStats: BaseballRosterStats | RosterPlayer[] | null | undefined;
  teamId: string | number;
  teamStats?: TeamAggregatedStats | null;
  loading: boolean;
  error: Error | null;
  refreshing?: boolean;
  onRefresh?: () => void;
  league?: BaseballRosterLeague;
};

type StatTab = "Player Stats" | "Team Stats";
type StatGroupKey = "career-batting" | "advanced-batting" | "pitching";

type PlayerStatRow = {
  player: RosterPlayer;
  battingStats: BaseballStatMap | null;
  advancedBattingStats: BaseballStatMap | null;
  pitchingStats: BaseballStatMap | null;
};

type StatLeader = {
  row: PlayerStatRow;
  value: BaseballStatValue;
  numericValue: number;
};

type LeaderDefinition = {
  label: string;
  group: StatGroupKey;
  key: string;
  order: "asc" | "desc";
};

type StatColumn = {
  header: string;
  getValue: (row: PlayerStatRow) => BaseballStatValue | undefined;
};

type TeamStatRow = {
  label: string;
  value: BaseballStatValue | undefined;
};

const STAT_TABS = ["Player Stats", "Team Stats"] as const;

const STAT_CELL_WIDTH = 80;

const LEADER_STATS: readonly LeaderDefinition[] = [
  {
    label: "Batting Average",
    group: "career-batting",
    key: "avg",
    order: "desc",
  },
  {
    label: "Home Runs",
    group: "career-batting",
    key: "homeRuns",
    order: "desc",
  },
  { label: "RBIs", group: "career-batting", key: "RBIs", order: "desc" },
  { label: "OPS", group: "career-batting", key: "OPS", order: "desc" },
  {
    label: "Stolen Bases",
    group: "career-batting",
    key: "stolenBases",
    order: "desc",
  },
  { label: "ERA", group: "pitching", key: "ERA", order: "asc" },
  { label: "Wins", group: "pitching", key: "wins", order: "desc" },
  { label: "Strikeouts", group: "pitching", key: "strikeouts", order: "desc" },
  { label: "Saves", group: "pitching", key: "saves", order: "desc" },
  { label: "WHIP", group: "pitching", key: "WHIP", order: "asc" },
];

const PLAYER_STAT_COLUMNS: readonly StatColumn[] = [
  { header: "B-GP", getValue: (row) => row.battingStats?.gamesPlayed },
  { header: "AB", getValue: (row) => row.battingStats?.atBats },
  { header: "R", getValue: (row) => row.battingStats?.runs },
  { header: "H", getValue: (row) => row.battingStats?.hits },
  { header: "2B", getValue: (row) => row.battingStats?.doubles },
  { header: "3B", getValue: (row) => row.battingStats?.triples },
  { header: "HR", getValue: (row) => row.battingStats?.homeRuns },
  { header: "RBI", getValue: (row) => row.battingStats?.RBIs },
  { header: "B-BB", getValue: (row) => row.battingStats?.walks },
  { header: "B-SO", getValue: (row) => row.battingStats?.strikeouts },
  { header: "SB", getValue: (row) => row.battingStats?.stolenBases },
  { header: "AVG", getValue: (row) => row.battingStats?.avg },
  { header: "OBP", getValue: (row) => row.battingStats?.onBasePct },
  { header: "SLG", getValue: (row) => row.battingStats?.slugAvg },
  { header: "OPS", getValue: (row) => row.battingStats?.OPS },
  {
    header: "bWAR",
    getValue: (row) =>
      row.battingStats?.WARBR ?? row.advancedBattingStats?.WARBR,
  },
  { header: "P-GP", getValue: (row) => row.pitchingStats?.gamesPlayed },
  { header: "GS", getValue: (row) => row.pitchingStats?.gamesStarted },
  { header: "W", getValue: (row) => row.pitchingStats?.wins },
  { header: "L", getValue: (row) => row.pitchingStats?.losses },
  { header: "ERA", getValue: (row) => row.pitchingStats?.ERA },
  { header: "IP", getValue: (row) => row.pitchingStats?.innings },
  { header: "P-H", getValue: (row) => row.pitchingStats?.hits },
  { header: "P-R", getValue: (row) => row.pitchingStats?.runs },
  { header: "ER", getValue: (row) => row.pitchingStats?.earnedRuns },
  { header: "P-BB", getValue: (row) => row.pitchingStats?.walks },
  { header: "P-SO", getValue: (row) => row.pitchingStats?.strikeouts },
  { header: "WHIP", getValue: (row) => row.pitchingStats?.WHIP },
  { header: "SV", getValue: (row) => row.pitchingStats?.saves },
  { header: "HLD", getValue: (row) => row.pitchingStats?.holds },
  { header: "BS", getValue: (row) => row.pitchingStats?.blownSaves },
  {
    header: "K/BB",
    getValue: (row) => row.pitchingStats?.strikeoutToWalkRatio,
  },
  { header: "pWAR", getValue: (row) => row.pitchingStats?.WARBR },
];

const numberFormatter = new Intl.NumberFormat("en-US");

const isStatMap = (value: unknown): value is BaseballStatMap => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every(
    (item) =>
      item === null || typeof item === "string" || typeof item === "number",
  );
};

const hasDisplayableStatValue = (value: BaseballStatValue | undefined) =>
  value !== null && value !== undefined && String(value).trim() !== "";

const hasUsableStatMap = (
  stats: BaseballStatMap | null | undefined,
): stats is BaseballStatMap =>
  Boolean(stats && Object.values(stats).some(hasDisplayableStatValue));

const getStatsGroup = (
  season: BaseballSeasonStats | null | undefined,
  group: StatGroupKey,
) => {
  const value = season?.stats?.[group];

  return isStatMap(value) ? value : null;
};

const hasUsableSeasonStats = (
  season: BaseballSeasonStats | null | undefined,
  group?: StatGroupKey,
) => {
  if (!season?.stats || typeof season.stats !== "object") return false;

  if (group) return hasUsableStatMap(getStatsGroup(season, group));

  return (
    hasUsableStatMap(getStatsGroup(season, "career-batting")) ||
    hasUsableStatMap(getStatsGroup(season, "advanced-batting")) ||
    hasUsableStatMap(getStatsGroup(season, "pitching"))
  );
};

const getBestSeasonStats = (player: RosterPlayer, group?: StatGroupKey) => {
  const candidates = [
    player.latestSeasonStats,
    player.currentSeasonStats,
    player.latestSeason,
  ];

  const priorityMatch = candidates.find((season) =>
    hasUsableSeasonStats(season, group),
  );

  if (priorityMatch) return priorityMatch;

  return (
    (player.seasonStats ?? []).find((season) =>
      hasUsableSeasonStats(season, group),
    ) ?? null
  );
};

const getPlayersFromRosterStats = (
  rosterStats: BaseballRosterStats | RosterPlayer[] | null | undefined,
) => {
  if (Array.isArray(rosterStats)) return rosterStats;

  return rosterStats?.players ?? [];
};

const parseNumericStat = (value: BaseballStatValue | undefined) => {
  if (!hasDisplayableStatValue(value)) return null;

  const numeric = Number(String(value).replace(/[%,$]/g, "").trim());

  return Number.isFinite(numeric) ? numeric : null;
};

const formatStatValue = (value: BaseballStatValue | undefined): string => {
  if (!hasDisplayableStatValue(value)) return "—";

  if (typeof value === "number") return numberFormatter.format(value);

  return String(value).trim();
};

const getGamesPlayed = (stats: BaseballStatMap | null | undefined) =>
  parseNumericStat(stats?.gamesPlayed) ?? 0;

const getPlayerId = (player: RosterPlayer) => player.playerId ?? player.id;

const getPlayerDisplayName = (player: RosterPlayer) =>
  player.short_name ||
  [player.first_name, player.last_name].filter(Boolean).join(" ") ||
  player.full_name;

const getPlayerRows = (players: RosterPlayer[]) => {
  return players
    .map<PlayerStatRow | null>((player) => {
      const battingSeason = getBestSeasonStats(player, "career-batting");
      const pitchingSeason = getBestSeasonStats(player, "pitching");
      const battingStats = getStatsGroup(battingSeason, "career-batting");
      const pitchingStats = getStatsGroup(pitchingSeason, "pitching");
      const advancedBattingStats = getStatsGroup(
        battingSeason,
        "advanced-batting",
      );
      const hasBattingStats =
        hasUsableStatMap(battingStats) && getGamesPlayed(battingStats) > 0;
      const hasPitchingStats =
        hasUsableStatMap(pitchingStats) && getGamesPlayed(pitchingStats) > 0;

      if (!hasBattingStats && !hasPitchingStats) return null;

      return {
        player,
        battingStats: hasBattingStats ? battingStats : null,
        advancedBattingStats,
        pitchingStats: hasPitchingStats ? pitchingStats : null,
      };
    })
    .filter((row): row is PlayerStatRow => row !== null);
};

const getStatLeader = (rows: PlayerStatRow[], definition: LeaderDefinition) => {
  return rows.reduce<StatLeader | null>((leader, row) => {
    const stats =
      definition.group === "advanced-batting"
        ? row.advancedBattingStats
        : definition.group === "pitching"
          ? row.pitchingStats
          : row.battingStats;
    const value = stats?.[definition.key];
    const numericValue = parseNumericStat(value);

    if (numericValue === null) return leader;

    const leaderValue = value ?? null;

    if (!leader) return { row, value: leaderValue, numericValue };

    const isBetter =
      definition.order === "asc"
        ? numericValue < leader.numericValue
        : numericValue > leader.numericValue;

    return isBetter ? { row, value: leaderValue, numericValue } : leader;
  }, null);
};

export default function RosterStats({
  rosterStats,
  teamId,
  teamStats,
  loading,
  error,
  refreshing = false,
  onRefresh,
  league = "mlb",
}: RosterStatsComponentProps) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = useMemo(() => rosterStatsStyles(isDark), [isDark]);
  const global = useMemo(() => globalStyles(isDark), [isDark]);

  const [selectedTab, setSelectedTab] = useState<StatTab>(STAT_TABS[0]);
  const [mountedTabs, setMountedTabs] = useState<Record<StatTab, boolean>>({
    "Player Stats": true,
    "Team Stats": false,
  });

  const players = useMemo(
    () => getPlayersFromRosterStats(rosterStats),
    [rosterStats],
  );

  const playerRows = useMemo(() => getPlayerRows(players), [players]);

  const statLeaders = useMemo(
    () =>
      LEADER_STATS.reduce<(LeaderDefinition & { leader: StatLeader })[]>(
        (acc, definition) => {
          const leader = getStatLeader(playerRows, definition);

          if (leader) {
            acc.push({ ...definition, leader });
          }

          return acc;
        },
        [],
      ),
    [playerRows],
  );

  const handleTabPress = (tab: StatTab) => {
    setSelectedTab(tab);

    setMountedTabs((previousTabs) => ({
      ...previousTabs,
      [tab]: true,
    }));
  };

  const handlePress = (player: RosterPlayer) => {
    router.push({
      pathname: "/player/baseball/[id]",
      params: {
        id: String(getPlayerId(player)),
        teamId: String(teamId),
        league,
      },
    });
  };

  const rowBg = (index: number) =>
    index % 2 === 1
      ? {
          backgroundColor: isDark
            ? Colors.dark.itemBackground
            : Colors.light.itemBackground,
        }
      : {};

  const headerBg = {
    backgroundColor: isDark
      ? Colors.dark.itemBackground
      : Colors.light.itemBackground,
  };

  const LeaderCard = ({
    row,
    label,
    value,
    index,
    total,
  }: {
    row: PlayerStatRow;
    label: string;
    value: BaseballStatValue | undefined;
    index: number;
    total: number;
  }) => {
    const { player } = row;

    return (
      <View style={styles.cardWrapper}>
        <TouchableOpacity
          activeOpacity={activeOpacity}
          onPress={() => handlePress(player)}
          style={styles.cardContainer}
        >
          <Text style={styles.cardLabel}>{label}</Text>

          <View style={styles.statCard}>
            {player.headshot_url ? (
              <Image
                source={{ uri: player.headshot_url }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatar} />
            )}

            <View style={styles.nameValue}>
              <Text style={styles.cardName}>
                {getPlayerDisplayName(player)}{" "}
                <Text style={styles.number}>
                  #{player.jersey_number ?? "—"}
                </Text>
              </Text>

              <Text style={styles.cardValue}>{formatStatValue(value)}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {index < total - 1 && <View style={styles.divider} />}
      </View>
    );
  };

  const renderPlayerStats = () => {
    if (!playerRows.length) {
      return (
        <View style={styles.center}>
          <Text style={global.emptyText}>No player stats available.</Text>
        </View>
      );
    }

    return (
      <>
        <ScrollView
          horizontal
          nestedScrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 16 }}
          snapToInterval={276}
          decelerationRate="fast"
          snapToAlignment="start"
        >
          {statLeaders.map((item, index) => (
            <LeaderCard
              key={item.label}
              row={item.leader.row}
              label={item.label}
              value={item.leader.value}
              index={index}
              total={statLeaders.length}
            />
          ))}
        </ScrollView>

        <View style={styles.tableWrapper}>
          <View style={styles.fixedColumnContainer}>
            <View style={[styles.tableRow, headerBg]}>
              <Text
                style={[
                  styles.tableCell,
                  styles.nameHeaderText,
                  { width: 140 },
                ]}
              >
                Player
              </Text>
            </View>

            {playerRows.map((row, index) => (
              <View
                key={`baseball-name-${getPlayerId(row.player)}`}
                style={[
                  styles.tableRow,
                  rowBg(index),
                  index === playerRows.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <TouchableOpacity
                  activeOpacity={activeOpacity}
                  onPress={() => handlePress(row.player)}
                  style={[styles.tableCell, { width: 140 }]}
                >
                  <Text
                    numberOfLines={1}
                    style={[styles.playerName, { width: 132 }]}
                  >
                    {getPlayerDisplayName(row.player)}{" "}
                    {row.player.jersey_number ? (
                      <Text style={styles.number}>
                        #{row.player.jersey_number}
                      </Text>
                    ) : null}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.scrollSection}
            contentContainerStyle={styles.scrollContentContainer}
          >
            <View
              style={[
                styles.statScrollContent,
                { width: PLAYER_STAT_COLUMNS.length * STAT_CELL_WIDTH },
              ]}
            >
              <View style={[styles.tableRow, headerBg]}>
                {PLAYER_STAT_COLUMNS.map((column) => (
                  <Text
                    key={column.header}
                    style={[
                      styles.tableCell,
                      styles.headerText,
                      { width: STAT_CELL_WIDTH },
                    ]}
                  >
                    {column.header}
                  </Text>
                ))}
              </View>

              {playerRows.map((row, index) => (
                <View
                  key={`baseball-stats-${getPlayerId(row.player)}`}
                  style={[
                    styles.tableRow,
                    rowBg(index),
                    index === playerRows.length - 1 && {
                      borderBottomWidth: 0,
                    },
                  ]}
                >
                  {PLAYER_STAT_COLUMNS.map((column) => (
                    <Text
                      key={`${getPlayerId(row.player)}-${column.header}`}
                      style={[
                        styles.tableCell,
                        styles.statValue,
                        { width: STAT_CELL_WIDTH },
                      ]}
                    >
                      {formatStatValue(column.getValue(row))}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </>
    );
  };

  const renderTeamTable = (rows: readonly TeamStatRow[]) => (
    <View style={styles.table}>
      {rows.map((item, idx) => (
        <View
          key={item.label}
          style={[
            styles.teamTableRow,
            idx % 2 === 1 && {
              backgroundColor: isDark
                ? Colors.dark.itemBackground
                : Colors.light.itemBackground,
            },
            idx === rows.length - 1 && { borderBottomWidth: 0 },
          ]}
        >
          <Text style={[styles.tableCell, styles.headerText]}>
            {item.label}
          </Text>

          <Text style={[styles.tableCell, styles.teamStatValue]}>
            {formatStatValue(item.value)}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderTeamStatsSection = (
    title: string,
    rows: readonly TeamStatRow[],
  ) => (
    <View>
      <Text style={styles.categoryTitle}>{title}</Text>
      {renderTeamTable(rows)}
    </View>
  );

  const renderTeamStats = () => {
    if (!teamStats) {
      return (
        <View style={styles.center}>
          <Text style={global.emptyText}>No team stats available.</Text>
        </View>
      );
    }

    const summaryRows: readonly TeamStatRow[] = [
      { label: "Record", value: teamStats.team.recordSummary },
      { label: "Standing", value: teamStats.team.standingSummary },
      { label: "Season", value: teamStats.season.displayName },
    ];

    const battingRowsForTeam: readonly TeamStatRow[] = [
      { label: "Games Played", value: teamStats.batting.gamesPlayed },
      { label: "Batting Average", value: teamStats.batting.battingAverage },
      { label: "On-base %", value: teamStats.batting.onBasePct },
      { label: "Slugging %", value: teamStats.batting.sluggingPct },
      { label: "OPS", value: teamStats.batting.ops },
      { label: "Runs", value: teamStats.batting.runs },
      { label: "Hits", value: teamStats.batting.hits },
      { label: "Doubles", value: teamStats.batting.doubles },
      { label: "Triples", value: teamStats.batting.triples },
      { label: "Home Runs", value: teamStats.batting.homeRuns },
      { label: "RBIs", value: teamStats.batting.rbis },
      { label: "Stolen Bases", value: teamStats.batting.stolenBases },
      { label: "Walks", value: teamStats.batting.walks },
      { label: "Strikeouts", value: teamStats.batting.strikeouts },
    ];

    const pitchingRowsForTeam: readonly TeamStatRow[] = [
      { label: "Games Played", value: teamStats.pitching.gamesPlayed },
      { label: "Wins", value: teamStats.pitching.wins },
      { label: "Losses", value: teamStats.pitching.losses },
      { label: "Win %", value: teamStats.pitching.winPct },
      { label: "ERA", value: teamStats.pitching.era },
      { label: "WHIP", value: teamStats.pitching.whip },
      { label: "Saves", value: teamStats.pitching.saves },
      { label: "Holds", value: teamStats.pitching.holds },
      { label: "Quality Starts", value: teamStats.pitching.qualityStarts },
      { label: "Innings", value: teamStats.pitching.innings },
      { label: "Hits Allowed", value: teamStats.pitching.hitsAllowed },
      { label: "Runs Allowed", value: teamStats.pitching.runsAllowed },
      { label: "Earned Runs", value: teamStats.pitching.earnedRuns },
      { label: "Walks Allowed", value: teamStats.pitching.walksAllowed },
      { label: "Strikeouts", value: teamStats.pitching.strikeouts },
      { label: "K/9", value: teamStats.pitching.strikeoutsPerNine },
      { label: "Opponent AVG", value: teamStats.pitching.opponentAvg },
    ];

    const fieldingRowsForTeam: readonly TeamStatRow[] = [
      { label: "Games Played", value: teamStats.fielding.gamesPlayed },
      { label: "Innings Played", value: teamStats.fielding.inningsPlayed },
      { label: "Total Chances", value: teamStats.fielding.totalChances },
      { label: "Putouts", value: teamStats.fielding.putouts },
      { label: "Assists", value: teamStats.fielding.assists },
      { label: "Errors", value: teamStats.fielding.errors },
      { label: "Double Plays", value: teamStats.fielding.doublePlays },
      { label: "Fielding %", value: teamStats.fielding.fieldingPct },
      { label: "Range Factor", value: teamStats.fielding.rangeFactor },
    ];

    return (
      <View style={styles.teamTableContainer}>
        {renderTeamStatsSection("Team Summary", summaryRows)}
        {renderTeamStatsSection("Batting", battingRowsForTeam)}
        {renderTeamStatsSection("Pitching", pitchingRowsForTeam)}
        {renderTeamStatsSection("Fielding", fieldingRowsForTeam)}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={global.emptyContainer}>
        <CustomActivityIndicator />
      </View>
    );
  }

  if (error) {
    return <Text style={global.errorText}>{error.message}</Text>;
  }

  if (!playerRows.length && !teamStats) {
    return <Text style={global.emptyText}>No player stats available.</Text>;
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
      keyboardShouldPersistTaps="handled"
    >
      <MainScrollTabBar
        tabs={STAT_TABS}
        selected={selectedTab}
        onTabPress={handleTabPress}
        isDark={isDark}
      />

      {mountedTabs["Player Stats"] && (
        <View
          style={[
            styles.tabScene,
            selectedTab !== "Player Stats" && styles.hiddenTabScene,
          ]}
          pointerEvents={selectedTab === "Player Stats" ? "auto" : "none"}
        >
          {renderPlayerStats()}
        </View>
      )}

      {mountedTabs["Team Stats"] && (
        <View
          style={[
            styles.tabScene,
            selectedTab !== "Team Stats" && styles.hiddenTabScene,
          ]}
          pointerEvents={selectedTab === "Team Stats" ? "auto" : "none"}
        >
          {renderTeamStats()}
        </View>
      )}
    </ScrollView>
  );
}
