import PillTabs from "@/components/TabBars/PillTabs";
import type {
  BasketballRosterPlayer as RosterPlayer,
  BasketballRosterStatsProps as RosterStatsComponentProps,
  BasketballStatTab as StatTab,
  BasketballStatValue as StatValue,
  BasketballTeamStatRow as TeamStatRow,
} from "@/types/basketball/stats";
import {
  formatStatValue,
  getAverages,
  getBasketballPlayerCells,
  getGamesPlayed,
  getNumericStatValue,
  getPlayerName,
  getPlayersFromRosterStats,
  LEADER_STATS,
  STAT_CELL_WIDTH,
  STAT_HEADERS,
  STAT_TABS,
} from "@/utils/basketballRosterStats";
import {
  getTeamDisplayAverages,
  getTeamDisplayTotals,
  getTeamSummaryRows,
} from "@/utils/stats";
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
  league = "nba",
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

  const activeRoster = useMemo(
    () => players.filter((player) => getGamesPlayed(player) > 0),
    [players],
  );

  const handleTabPress = (tab: StatTab) => {
    setSelectedTab(tab);

    setMountedTabs((previousTabs) => ({
      ...previousTabs,
      [tab]: true,
    }));
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

  const handlePress = (playerId: string | number) => {
    router.push({
      pathname: "/player/basketball/[id]",
      params: {
        id: String(playerId),
        teamId: String(teamId),
        league,
      },
    });
  };

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

  const visibleLeaders = useMemo(
    () => statLeaders.filter((item) => item.player),
    [statLeaders],
  );

  const renderPlayerStats = () => {
    if (!activeRoster.length) {
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

            {activeRoster.map((player, index) => (
              <View
                key={`basketball-name-${player.playerId}`}
                style={[
                  styles.tableRow,
                  rowBg(index),
                  index === activeRoster.length - 1 && {
                    borderBottomWidth: 0,
                  },
                ]}
              >
                <TouchableOpacity
                  activeOpacity={activeOpacity}
                  onPress={() => handlePress(player.playerId)}
                  style={[styles.tableCell, { width: 140 }]}
                >
                  <Text
                    numberOfLines={1}
                    style={[styles.playerName, { width: 132 }]}
                  >
                    {getPlayerName(player)}{" "}
                    {player.jersey_number ? (
                      <Text style={styles.number}>#{player.jersey_number}</Text>
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
                { width: STAT_HEADERS.length * STAT_CELL_WIDTH },
              ]}
            >
              <View style={[styles.tableRow, headerBg]}>
                {STAT_HEADERS.map((header) => (
                  <Text
                    key={header}
                    style={[
                      styles.tableCell,
                      styles.headerText,
                      { width: STAT_CELL_WIDTH },
                    ]}
                  >
                    {header}
                  </Text>
                ))}
              </View>

              {activeRoster.map((player, index) => (
                <View
                  key={`basketball-stats-${player.playerId}`}
                  style={[
                    styles.tableRow,
                    rowBg(index),
                    index === activeRoster.length - 1 && {
                      borderBottomWidth: 0,
                    },
                  ]}
                >
                  {getBasketballPlayerCells(player).map((value, cellIndex) => (
                    <Text
                      key={`${player.playerId}-stat-${cellIndex}`}
                      style={[
                        styles.tableCell,
                        styles.statValue,
                        { width: STAT_CELL_WIDTH },
                      ]}
                    >
                      {formatStatValue(value)}
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
