import PillTabs from "@/components/TabBars/PillTabs";
import type {
  BaseballLeaderDefinition as LeaderDefinition,
  BaseballPlayerStatRow as PlayerStatRow,
  BaseballRosterPlayer as RosterPlayer,
  BaseballRosterStatsProps as RosterStatsComponentProps,
  BaseballStatColumn as StatColumn,
  BaseballStatLeader as StatLeader,
  BaseballStatTab as StatTab,
  BaseballStatValue,
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
          {renderTeamStats()}
        </View>
      )}
    </ScrollView>
  );
}
