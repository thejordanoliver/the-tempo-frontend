import MainScrollTabBar from "@/components/TabBars/MainTabScrollBar";
import {
  getTeamDisplayAverages,
  getTeamDisplayTotals,
  getTeamSummaryRows,
  TeamStatRow,
} from "@/utils/stats";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import SyncedHorizontalStatViewport from "components/Sports/shared/synced-horizontal-stat-viewport";
import { activeOpacity, Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { router } from "expo-router";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  LayoutChangeEvent,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SharedValue, useSharedValue } from "react-native-reanimated";
import { rosterStatsStyles } from "styles/TeamStyles/RosterStatStyles";

type StatValue = string | number | null | undefined;
type StatMap = Record<string, StatValue>;

type BasketballSeasonStats = {
  id: number;
  season: number;
  totals: StatMap | null;
  averages: StatMap | null;
  miscellaneous: StatMap | null;
  team_id: string | number | null;
  team_slug: string | null;
  position: string | null;
  player_id: number;
  player_name: string;
  season_type: string | null;
  season_type_label: string | null;
  season_type_value: string | number | null;
  display_season: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type RosterPlayer = {
  id: number;
  playerId: number;
  full_name: string;
  first_name: string;
  last_name: string;
  team_id: number;
  position: string | null;
  jersey_number: number | null;
  headshot_url: string | null;
  active: boolean;
  short_name: string;
  team: string;
  currentSeasonStats: BasketballSeasonStats | null;
  latestSeason: BasketballSeasonStats | null;
  latestSeasonStats: BasketballSeasonStats | null;
  seasonStats: BasketballSeasonStats[];
  careerStats: BasketballSeasonStats[];
};

type RosterStatsResponse = {
  teamId: string;
  count: number;
  players: RosterPlayer[];
};

type RosterStatsComponentProps = {
  rosterStats: RosterStatsResponse | RosterPlayer[] | null | undefined;
  teamId: string | number;
  teamStats?: Parameters<typeof getTeamSummaryRows>[0] | null;
  loading: boolean;
  error: Error | null;
  refreshing?: boolean;
  onRefresh?: () => void;
  league?: string;
};

const STAT_TABS = ["Player Stats", "Team Stats"] as const;
type StatTab = (typeof STAT_TABS)[number];

const STAT_CELL_WIDTH = 80;
const ROW_HEIGHT = 40;
const INITIAL_ROWS_TO_RENDER = 12;
const MAX_ROWS_PER_BATCH = 10;
const VIRTUALIZATION_WINDOW_SIZE = 7;

const STAT_HEADERS = [
  "GP",
  "MIN",
  "PTS",
  "FGM-A",
  "FG%",
  "3PM-A",
  "3P%",
  "FTM-A",
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

const LEADER_STATS = [
  { label: "Points", averageKey: "avgPoints" },
  { label: "Rebounds", averageKey: "avgRebounds" },
  { label: "Assists", averageKey: "avgAssists" },
  { label: "Blocks", averageKey: "avgBlocks" },
  { label: "Steals", averageKey: "avgSteals" },
] as const;

const numberFormatter = new Intl.NumberFormat("en-US");

const formatStatValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "—";

  if (typeof value === "number") {
    return numberFormatter.format(value);
  }

  const raw = String(value).trim();

  if (raw.endsWith("%")) {
    const numeric = Number(raw.replace("%", ""));

    return Number.isFinite(numeric)
      ? `${numberFormatter.format(numeric)}%`
      : raw;
  }

  const numeric = Number(raw);

  return Number.isFinite(numeric) ? numberFormatter.format(numeric) : raw;
};

const getNumericStatValue = (value: StatValue) => {
  if (value === null || value === undefined || value === "") return 0;

  const numeric = Number(String(value).replace("%", ""));

  return Number.isFinite(numeric) ? numeric : 0;
};

const getPlayersFromRosterStats = (
  rosterStats: RosterStatsResponse | RosterPlayer[] | null | undefined,
) => {
  if (Array.isArray(rosterStats)) return rosterStats;

  return rosterStats?.players ?? [];
};

const getBestSeasonStats = (player: RosterPlayer) => {
  return (
    player.latestSeasonStats ??
    player.latestSeason ??
    player.currentSeasonStats ??
    null
  );
};

const getAverages = (player: RosterPlayer) => {
  return getBestSeasonStats(player)?.averages ?? {};
};

const getTotals = (player: RosterPlayer) => {
  return getBestSeasonStats(player)?.totals ?? {};
};

const getGamesPlayed = (player: RosterPlayer) => {
  return getNumericStatValue(getAverages(player).gamesPlayed);
};

const getMadeAttemptedStat = (
  averages: StatMap,
  totals: StatMap,
  averageKey: string,
  totalKey: string,
) => {
  return averages[averageKey] ?? totals[totalKey] ?? null;
};

const getBasketballPlayerCells = (player: RosterPlayer) => {
  const averages = getAverages(player);
  const totals = getTotals(player);

  return [
    averages.gamesPlayed,
    averages.avgMinutes,
    averages.avgPoints,
    getMadeAttemptedStat(
      averages,
      totals,
      "avgFieldGoalsMade-avgFieldGoalsAttempted",
      "fieldGoalsMade-fieldGoalsAttempted",
    ),
    averages.fieldGoalPct ?? totals.fieldGoalPct,
    getMadeAttemptedStat(
      averages,
      totals,
      "avgThreePointFieldGoalsMade-avgThreePointFieldGoalsAttempted",
      "threePointFieldGoalsMade-threePointFieldGoalsAttempted",
    ),
    averages.threePointFieldGoalPct ?? totals.threePointFieldGoalPct,
    getMadeAttemptedStat(
      averages,
      totals,
      "avgFreeThrowsMade-avgFreeThrowsAttempted",
      "freeThrowsMade-freeThrowsAttempted",
    ),
    averages.freeThrowPct ?? totals.freeThrowPct,
    averages.avgOffensiveRebounds,
    averages.avgDefensiveRebounds,
    averages.avgRebounds,
    averages.avgAssists,
    averages.avgSteals,
    averages.avgBlocks,
    averages.avgTurnovers,
    averages.avgFouls,
    "—",
  ];
};

type BasketballRosterRowProps = {
  cells: StatValue[];
  index: number;
  isDark: boolean;
  isLast: boolean;
  onPlayerPress: (playerId: string | number) => void;
  player: RosterPlayer;
  scrollX: SharedValue<number>;
  viewportWidth: number;
};

const BasketballRosterRow = memo(function BasketballRosterRow({
  cells,
  index,
  isDark,
  isLast,
  onPlayerPress,
  player,
  scrollX,
  viewportWidth,
}: BasketballRosterRowProps) {
  const styles = useMemo(() => rosterStatsStyles(isDark), [isDark]);
  const rowBackground =
    index % 2 === 1
      ? isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground
      : undefined;

  return (
    <View
      style={[
        styles.virtualizedTableRow,
        rowBackground ? { backgroundColor: rowBackground } : undefined,
        isLast && { borderBottomWidth: 0 },
      ]}
    >
      <TouchableOpacity
        activeOpacity={activeOpacity}
        onPress={() => onPlayerPress(player.playerId)}
        style={[
          styles.frozenPlayerCell,
          {
            backgroundColor: rowBackground ??
              (isDark ? Colors.dark.background : Colors.light.background),
          },
        ]}
      >
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[styles.tableCell, styles.playerName]}
        >
          {player.short_name}{" "}
          <Text style={styles.number}>#{player.jersey_number ?? "—"}</Text>
        </Text>
      </TouchableOpacity>

      <SyncedHorizontalStatViewport
        contentWidth={STAT_HEADERS.length * STAT_CELL_WIDTH}
        scrollX={scrollX}
        viewportWidth={viewportWidth}
      >
        {cells.map((value, cellIndex) => (
          <Text
            key={`${player.playerId}-stat-${cellIndex}`}
            style={[styles.tableCell, styles.statValue]}
          >
            {formatStatValue(value)}
          </Text>
        ))}
      </SyncedHorizontalStatViewport>
    </View>
  );
});

export default function RosterStats({
  rosterStats,
  teamId,
  teamStats,
  loading,
  error,
  refreshing = false,
  onRefresh,
  league = "NBA",
}: RosterStatsComponentProps) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = useMemo(() => rosterStatsStyles(isDark), [isDark]);
  const global = useMemo(() => globalStyles(isDark), [isDark]);

  const [selectedTab, setSelectedTab] = useState<StatTab>(STAT_TABS[0]);
  const horizontalOffset = useSharedValue(0);
  const [statsViewportWidth, setStatsViewportWidth] = useState(0);

  const players = useMemo(
    () => getPlayersFromRosterStats(rosterStats),
    [rosterStats],
  );

  const activeRoster = useMemo(
    () => players.filter((player) => getGamesPlayed(player) > 0),
    [players],
  );

  const handleTabPress = useCallback((tab: StatTab) => {
    setSelectedTab(tab);
  }, []);

  const headerBg = {
    backgroundColor: isDark
      ? Colors.dark.itemBackground
      : Colors.light.itemBackground,
  };

  const stickyColumnBg = {
    backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
  };

  const statLeaders = useMemo(
    () =>
      LEADER_STATS.map((item) => {
        const player = [...activeRoster].sort(
          (a, b) =>
            getNumericStatValue(getAverages(b)[item.averageKey]) -
            getNumericStatValue(getAverages(a)[item.averageKey]),
        )[0];

        return {
          ...item,
          player,
          value: player ? getAverages(player)[item.averageKey] : null,
        };
      }),
    [activeRoster],
  );

  const handlePress = useCallback(
    (playerId: string | number) => {
      router.push({
        pathname: "/player/basketball/[id]",
        params: {
          id: String(playerId),
          teamId: String(teamId),
          league,
        },
      });
    },
    [league, teamId],
  );

  const handleStatsViewportLayout = useCallback(
    (event: LayoutChangeEvent) => {
      setStatsViewportWidth(event.nativeEvent.layout.width);
    },
    [],
  );

  useEffect(() => {
    horizontalOffset.value = 0;
  }, [horizontalOffset, activeRoster]);

  const LeaderCard = ({
    player,
    label,
    value,
    index,
    total,
  }: {
    player: RosterPlayer;
    label: string;
    value: StatValue;
    index: number;
    total: number;
  }) => {
    return (
      <View style={styles.cardWrapper}>
        <TouchableOpacity
          activeOpacity={activeOpacity}
          onPress={() => handlePress(player.playerId)}
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
                {player.short_name}{" "}
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

  const playerCellsById = useMemo(
    () =>
      new Map(
        activeRoster.map((player) => [
          player.playerId,
          getBasketballPlayerCells(player),
        ]),
      ),
    [activeRoster],
  );

  const visibleLeaders = useMemo(
    () => statLeaders.filter((item) => item.player),
    [statLeaders],
  );

  const renderRosterRow = useCallback(
    ({ item, index }: { item: RosterPlayer; index: number }) => (
      <BasketballRosterRow
        cells={playerCellsById.get(item.playerId) ?? []}
        index={index}
        isDark={isDark}
        isLast={index === activeRoster.length - 1}
        onPlayerPress={handlePress}
        player={item}
        scrollX={horizontalOffset}
        viewportWidth={statsViewportWidth}
      />
    ),
    [
      activeRoster.length,
      handlePress,
      horizontalOffset,
      isDark,
      playerCellsById,
      statsViewportWidth,
    ],
  );

  const playerListHeader = (
    <>
      <MainScrollTabBar
        tabs={STAT_TABS}
        selected={selectedTab}
        onTabPress={handleTabPress}
        isDark={isDark}
      />
      <ScrollView
        horizontal
        nestedScrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 16 }}
        snapToInterval={276}
        decelerationRate="fast"
        snapToAlignment="start"
      >
        {visibleLeaders.map((item, index) => (
          <LeaderCard
            key={item.label}
            player={item.player}
            label={item.label}
            value={item.value}
            index={index}
            total={visibleLeaders.length}
          />
        ))}
      </ScrollView>
      <View style={styles.virtualizedTableHeader}>
        <View style={[styles.frozenPlayerCell, headerBg, stickyColumnBg]}>
          <Text style={[styles.tableCell, styles.nameHeaderText]}>NAME</Text>
        </View>
        <View style={{ flex: 1 }} onLayout={handleStatsViewportLayout}>
          <SyncedHorizontalStatViewport
            contentWidth={STAT_HEADERS.length * STAT_CELL_WIDTH}
            scrollX={horizontalOffset}
            viewportWidth={statsViewportWidth}
          >
            {STAT_HEADERS.map((header) => (
              <Text
                key={header}
                style={[
                  styles.tableCell,
                  styles.headerText,
                  headerBg,
                  { width: STAT_CELL_WIDTH },
                ]}
              >
                {header}
              </Text>
            ))}
          </SyncedHorizontalStatViewport>
        </View>
      </View>
    </>
  );

  const renderTeamStats = () => {
    if (!teamStats) return null;

    const summaryRows = getTeamSummaryRows(teamStats);
    const displayAverages = getTeamDisplayAverages(teamStats);
    const displayTotals = getTeamDisplayTotals(teamStats);

    const renderTable = (rows: TeamStatRow[]) => (
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
              {item.value}
            </Text>
          </View>
        ))}
      </View>
    );

    return (
      <View style={styles.teamTableContainer}>
        <View>
          <Text style={styles.categoryTitle}>Team Summary</Text>
          {renderTable(summaryRows)}
        </View>

        <View>
          <Text style={styles.categoryTitle}>Per-Game Averages</Text>
          {renderTable(displayAverages)}
        </View>

        <View>
          <Text style={styles.categoryTitle}>Team Totals</Text>
          {renderTable(displayTotals)}
        </View>
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

  if (!activeRoster.length && !teamStats) {
    return <Text style={global.emptyText}>No player stats available.</Text>;
  }

  if (selectedTab === "Player Stats") {
    return (
      <FlatList
        data={activeRoster}
        renderItem={renderRosterRow}
        keyExtractor={(player) => String(player.playerId)}
        ListHeaderComponent={playerListHeader}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={global.emptyText}>No player stats available.</Text>
          </View>
        }
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          ) : undefined
        }
        keyboardShouldPersistTaps="handled"
        getItemLayout={(_, index) => ({
          length: ROW_HEIGHT,
          offset: ROW_HEIGHT * index,
          index,
        })}
        initialNumToRender={INITIAL_ROWS_TO_RENDER}
        maxToRenderPerBatch={MAX_ROWS_PER_BATCH}
        windowSize={VIRTUALIZATION_WINDOW_SIZE}
      />
    );
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

      <View style={styles.tabScene}>{renderTeamStats()}</View>
    </ScrollView>
  );
}
