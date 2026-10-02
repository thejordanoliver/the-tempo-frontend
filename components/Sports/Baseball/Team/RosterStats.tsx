import PillTabs from "@/components/TabBars/PillTabs";
import type {
  BaseballStatValue,
  BaseballLeaderDefinition as LeaderDefinition,
  BaseballPlayerStatRow as PlayerStatRow,
  BaseballRosterPlayer as RosterPlayer,
  BaseballRosterStatsProps as RosterStatsComponentProps,
  BaseballStatColumn as StatColumn,
  BaseballStatLeader as StatLeader,
  BaseballStatTab as StatTab,
  BaseballTeamStatRow as TeamStatRow,
} from "@/types/baseball/stats";
import {
  BATTING_STAT_COLUMNS,
  formatStatValue,
  getPlayerDisplayName,
  getPlayerId,
  getPlayerRows,
  getPlayersFromRosterStats,
  getStatLeader,
  LEADER_STATS,
  PITCHING_STAT_COLUMNS,
  STAT_CELL_WIDTH,
  STAT_TABS,
} from "@/utils/baseballRosterStats";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { activeOpacity, Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useNavigationBarContentStyle } from "hooks/useNavigationBarContentStyle";
import { useScopedRouter } from "hooks/useScopedRouter";
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

export default function RosterStats({
  rosterStats,
  teamId,
  GameTeamStats,
  loading,
  error,
  refreshing = false,
  onRefresh,
  league = "mlb",
}: RosterStatsComponentProps) {
  const router = useScopedRouter();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const navigationContentStyle = useNavigationBarContentStyle();
  const styles = useMemo(() => rosterStatsStyles(isDark), [isDark]);
  const global = useMemo(() => globalStyles(isDark), [isDark]);

  const [selectedTab, setSelectedTab] = useState<StatTab>(STAT_TABS[0].value);
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

  const renderPlayerTable = (
    title: string,
    rows: PlayerStatRow[],
    columns: readonly StatColumn[],
  ) => (
    <View style={styles.playerTableSection}>
      <Text style={styles.categoryTitle}>{title}</Text>

      {rows.length ? (
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

            {rows.map((row, index) => (
              <View
                key={`${title}-name-${getPlayerId(row.player)}`}
                style={[
                  styles.tableRow,
                  rowBg(index),
                  index === rows.length - 1 && { borderBottomWidth: 0 },
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
                { width: columns.length * STAT_CELL_WIDTH },
              ]}
            >
              <View style={[styles.tableRow, headerBg]}>
                {columns.map((column) => (
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

              {rows.map((row, index) => (
                <View
                  key={`${title}-stats-${getPlayerId(row.player)}`}
                  style={[
                    styles.tableRow,
                    rowBg(index),
                    index === rows.length - 1 && {
                      borderBottomWidth: 0,
                    },
                  ]}
                >
                  {columns.map((column) => (
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
      ) : (
        <Text style={global.emptyText}>
          No {title.toLowerCase()} stats available.
        </Text>
      )}
    </View>
  );

  const renderPlayerStats = () => {
    if (!playerRows.length) {
      return (
        <View style={styles.center}>
          <Text style={global.emptyText}>No player stats available.</Text>
        </View>
      );
    }

    const battingRows = playerRows.filter((row) => row.battingStats !== null);
    const pitchingRows = playerRows.filter((row) => row.pitchingStats !== null);

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

        {renderPlayerTable("Batting", battingRows, BATTING_STAT_COLUMNS)}
        {renderPlayerTable("Pitching", pitchingRows, PITCHING_STAT_COLUMNS)}
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

  const renderGameTeamStatsSection = (
    title: string,
    rows: readonly TeamStatRow[],
  ) => (
    <View>
      <Text style={styles.categoryTitle}>{title}</Text>
      {renderTeamTable(rows)}
    </View>
  );

  const renderGameTeamStats = () => {
    if (!GameTeamStats) {
      return (
        <View style={styles.center}>
          <Text style={global.emptyText}>No team stats available.</Text>
        </View>
      );
    }

    const summaryRows: readonly TeamStatRow[] = [
      { label: "Record", value: GameTeamStats.team.recordSummary },
      { label: "Standing", value: GameTeamStats.team.standingSummary },
      { label: "Season", value: GameTeamStats.season.displayName },
    ];

    const battingRowsForTeam: readonly TeamStatRow[] = [
      { label: "Games Played", value: GameTeamStats.batting.gamesPlayed },
      { label: "Batting Average", value: GameTeamStats.batting.battingAverage },
      { label: "On-base %", value: GameTeamStats.batting.onBasePct },
      { label: "Slugging %", value: GameTeamStats.batting.sluggingPct },
      { label: "OPS", value: GameTeamStats.batting.ops },
      { label: "Runs", value: GameTeamStats.batting.runs },
      { label: "Hits", value: GameTeamStats.batting.hits },
      { label: "Doubles", value: GameTeamStats.batting.doubles },
      { label: "Triples", value: GameTeamStats.batting.triples },
      { label: "Home Runs", value: GameTeamStats.batting.homeRuns },
      { label: "RBIs", value: GameTeamStats.batting.rbis },
      { label: "Stolen Bases", value: GameTeamStats.batting.stolenBases },
      { label: "Walks", value: GameTeamStats.batting.walks },
      { label: "Strikeouts", value: GameTeamStats.batting.strikeouts },
    ];

    const pitchingRowsForTeam: readonly TeamStatRow[] = [
      { label: "Games Played", value: GameTeamStats.pitching.gamesPlayed },
      { label: "Wins", value: GameTeamStats.pitching.wins },
      { label: "Losses", value: GameTeamStats.pitching.losses },
      { label: "Win %", value: GameTeamStats.pitching.winPct },
      { label: "ERA", value: GameTeamStats.pitching.era },
      { label: "WHIP", value: GameTeamStats.pitching.whip },
      { label: "Saves", value: GameTeamStats.pitching.saves },
      { label: "Holds", value: GameTeamStats.pitching.holds },
      { label: "Quality Starts", value: GameTeamStats.pitching.qualityStarts },
      { label: "Innings", value: GameTeamStats.pitching.innings },
      { label: "Hits Allowed", value: GameTeamStats.pitching.hitsAllowed },
      { label: "Runs Allowed", value: GameTeamStats.pitching.runsAllowed },
      { label: "Earned Runs", value: GameTeamStats.pitching.earnedRuns },
      { label: "Walks Allowed", value: GameTeamStats.pitching.walksAllowed },
      { label: "Strikeouts", value: GameTeamStats.pitching.strikeouts },
      { label: "K/9", value: GameTeamStats.pitching.strikeoutsPerNine },
      { label: "Opponent AVG", value: GameTeamStats.pitching.opponentAvg },
    ];

    const fieldingRowsForTeam: readonly TeamStatRow[] = [
      { label: "Games Played", value: GameTeamStats.fielding.gamesPlayed },
      { label: "Innings Played", value: GameTeamStats.fielding.inningsPlayed },
      { label: "Total Chances", value: GameTeamStats.fielding.totalChances },
      { label: "Putouts", value: GameTeamStats.fielding.putouts },
      { label: "Assists", value: GameTeamStats.fielding.assists },
      { label: "Errors", value: GameTeamStats.fielding.errors },
      { label: "Double Plays", value: GameTeamStats.fielding.doublePlays },
      { label: "Fielding %", value: GameTeamStats.fielding.fieldingPct },
      { label: "Range Factor", value: GameTeamStats.fielding.rangeFactor },
    ];

    return (
      <View style={styles.teamTableContainer}>
        {renderGameTeamStatsSection("Team Summary", summaryRows)}
        {renderGameTeamStatsSection("Batting", battingRowsForTeam)}
        {renderGameTeamStatsSection("Pitching", pitchingRowsForTeam)}
        {renderGameTeamStatsSection("Fielding", fieldingRowsForTeam)}
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

  if (!playerRows.length && !GameTeamStats) {
    return <Text style={global.emptyText}>No player stats available.</Text>;
  }

  return (
    <ScrollView
      contentContainerStyle={navigationContentStyle(styles.scrollContainer)}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
      keyboardShouldPersistTaps="handled"
    >
      <PillTabs
        tabs={STAT_TABS}
        selectedValue={selectedTab}
        onChange={handleTabPress}
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
          {renderGameTeamStats()}
        </View>
      )}
    </ScrollView>
  );
}
