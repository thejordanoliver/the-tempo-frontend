import PillTabs from "@/components/TabBars/PillTabs";
import type {
  FootballLeaderConfig,
  FootballPlayerStatTable,
  FootballRosterStatsPlayer,
  FootballRosterStatsProps,
  FootballStatValue,
  StatRow,
  StatTab,
} from "@/types/football/stats";
import {
  buildFootballStatCategories,
  getPlayerInitials,
  getPlayerKey,
  getPlayerName,
  getPlayersFromRosterStats,
  getPlayerStatValue,
  getStatByPath,
  hasAnyStatForTable,
  LEADER_STATS,
  parseStatNumber,
  PLAYER_STAT_TABLES,
  STAT_TABS,
} from "@/utils/footballRosterStats";
import { formatStatValue } from "@/utils/stats";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { Colors, activeOpacity, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useRouter } from "expo-router";
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
  teamStats,
  league,
  loading = false,
  error = null,
  teamId,
  category,
  refreshing = false,
  onRefresh = () => undefined,
}: FootballRosterStatsProps) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = rosterStatsStyles(isDark);
  const global = globalStyles(isDark);
  const router = useRouter();
  const roster = useMemo(
    () => getPlayersFromRosterStats(rosterStats),
    [rosterStats],
  );

  const [selectedTab, setSelectedTab] = useState<StatTab>(STAT_TABS[0].value);
  const [mountedTabs, setMountedTabs] = useState<Record<StatTab, boolean>>({
    "Player Stats": true,
    "Team Stats": false,
  });

  const handleTabPress = (tab: StatTab) => {
    setSelectedTab(tab);

    setMountedTabs((prev) => ({
      ...prev,
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

  const leaders = useMemo(() => {
    type FootballLeader = FootballLeaderConfig & {
      player: FootballRosterStatsPlayer;
      value: FootballStatValue;
    };

    return LEADER_STATS.map((leader) => {
      const sortedPlayers = roster
        .map((player) => {
          const value = getStatByPath(player.latestSeasonStats, leader.path);

          return {
            player,
            value,
            numericValue: parseStatNumber(value),
          };
        })
        .filter((item) => item.numericValue > 0)
        .sort((a, b) => b.numericValue - a.numericValue);

      const leaderPlayer = sortedPlayers[0];

      return leaderPlayer
        ? {
            ...leader,
            player: leaderPlayer.player,
            value: leaderPlayer.value,
          }
        : null;
    }).filter((leader): leader is FootballLeader => Boolean(leader));
  }, [roster]);

  const playerTables = useMemo(
    () =>
      PLAYER_STAT_TABLES.map((table) => ({
        ...table,
        players: roster.filter((player) =>
          hasAnyStatForTable(player, table.columns),
        ),
      })).filter(
        (
          table,
        ): table is FootballPlayerStatTable & {
          players: FootballRosterStatsPlayer[];
        } => table.players.length > 0,
      ),
    [roster],
  );

  const route = "/player/football/[id]";
  const handlePress = (player: FootballRosterStatsPlayer) => {
    const id = player.playerId || player.player_id || player.id;

    if (!route) {
      console.warn(`[RosterStats] No player route configured for ${league}`);
      return;
    }

    if (!id) {
      console.warn("[RosterStats] Missing player id", player);
      return;
    }

    router.push({
      pathname: route,
      params: {
        id: String(id),
        teamId: String(teamId),
        league,
      },
    });
  };

  const renderPlayerName = (player: FootballRosterStatsPlayer) => (
    <Text numberOfLines={1} style={[styles.playerName, { width: 132 }]}>
      {getPlayerName(player)}{" "}
      {player.jersey_number ? (
        <Text style={styles.number}>#{player.jersey_number}</Text>
      ) : null}
    </Text>
  );

  const renderLeaderAvatar = (player: FootballRosterStatsPlayer) => {
    if (player.headshot_url) {
      return (
        <Image source={{ uri: player.headshot_url }} style={styles.avatar} />
      );
    }

    return (
      <View
        style={[
          styles.avatar,
          styles.center,
          {
            backgroundColor: isDark
              ? Colors.dark.background
              : Colors.light.background,
          },
        ]}
      >
        <Text style={styles.nameHeaderText}>{getPlayerInitials(player)}</Text>
      </View>
    );
  };

  const renderLeaderCard = (
    leader: FootballLeaderConfig & {
      player: FootballRosterStatsPlayer;
      value: FootballStatValue;
    },
    index: number,
    total: number,
  ) => (
    <View key={leader.label} style={styles.cardWrapper}>
      <TouchableOpacity
        activeOpacity={activeOpacity}
        onPress={() => handlePress(leader.player)}
        style={styles.cardContainer}
      >
        <Text style={styles.cardLabel}>{leader.label}</Text>

        <View style={styles.statCard}>
          {renderLeaderAvatar(leader.player)}

          <View style={styles.nameValue}>
            <Text numberOfLines={1} style={styles.cardName}>
              {getPlayerName(leader.player)}{" "}
              {leader.player.jersey_number ? (
                <Text style={styles.number}>
                  #{leader.player.jersey_number}
                </Text>
              ) : null}
            </Text>

            <Text style={styles.cardValue}>
              {formatStatValue(leader.value)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {index < total - 1 && <View style={styles.divider} />}
    </View>
  );

  const renderPlayerTable = (
    table: FootballPlayerStatTable & {
      players: FootballRosterStatsPlayer[];
    },
  ) => (
    <View key={table.title} style={{ marginBottom: 20 }}>
      <Text style={styles.categoryTitle}>{table.title}</Text>

      <View style={styles.tableWrapper}>
        <View style={styles.fixedColumnContainer}>
          <View style={[styles.tableRow, headerBg]}>
            <Text
              style={[styles.tableCell, styles.nameHeaderText, { width: 140 }]}
            >
              Player
            </Text>
          </View>

          {table.players.map((player, index) => (
            <View
              key={`${table.title}-name-${getPlayerKey(player, index)}`}
              style={[
                styles.tableRow,
                rowBg(index),
                index === table.players.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <TouchableOpacity
                activeOpacity={activeOpacity}
                onPress={() => handlePress(player)}
                style={[styles.tableCell, { width: 140 }]}
              >
                {renderPlayerName(player)}
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
          <View style={styles.statScrollContent}>
            <View style={[styles.tableRow, headerBg]}>
              {table.columns.map((column) => (
                <Text
                  key={`${table.title}-header-${column.label}`}
                  style={[
                    styles.tableCell,
                    styles.headerText,
                    { width: column.width ?? 82 },
                  ]}
                >
                  {column.label}
                </Text>
              ))}
            </View>

            {table.players.map((player, index) => (
              <View
                key={`${table.title}-stats-${getPlayerKey(player, index)}`}
                style={[
                  styles.tableRow,
                  rowBg(index),
                  index === table.players.length - 1 && {
                    borderBottomWidth: 0,
                  },
                ]}
              >
                {table.columns.map((column) => (
                  <Text
                    key={`${table.title}-${getPlayerKey(player, index)}-${
                      column.label
                    }`}
                    style={[
                      styles.tableCell,
                      styles.statValue,
                      { width: column.width ?? 82 },
                    ]}
                  >
                    {formatStatValue(getPlayerStatValue(player, column))}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );

  const renderPlayerStats = () => {
    if (!playerTables.length) {
      return (
        <View style={styles.center}>
          <Text style={global.emptyText}>No player stats available.</Text>
        </View>
      );
    }

    return (
      <>
        {leaders.length > 0 ? (
          <ScrollView
            horizontal
            nestedScrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 16 }}
            snapToInterval={276}
            decelerationRate="fast"
            snapToAlignment="start"
          >
            {leaders.map((leader, index) =>
              renderLeaderCard(leader, index, leaders.length),
            )}
          </ScrollView>
        ) : null}

        {playerTables.map(renderPlayerTable)}
      </>
    );
  };

  const renderTeamStatsSection = (
    title: string,
    rows: readonly { label: string; value: string | number }[],
  ) => (
    <View>
      <Text style={styles.categoryTitle}>{title}</Text>

      <View style={styles.table}>
        {rows.map((row, index) => (
          <View
            key={row.label}
            style={[
              styles.teamTableRow,
              index === rows.length - 1 && { borderBottomWidth: 0 },
              index % 2 === 1 && {
                backgroundColor: isDark
                  ? Colors.dark.itemBackground
                  : Colors.light.itemBackground,
              },
            ]}
          >
            <Text style={[styles.tableCell, styles.headerText]}>
              {row.label}
            </Text>

            <Text style={[styles.tableCell, styles.teamStatValue]}>
              {row.value === "" ? "-" : row.value}
            </Text>
          </View>
        ))}
      </View>
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

    const categories = buildFootballStatCategories(teamStats);

    const statsToDisplay = category
      ? categories.filter((statCategory) => statCategory.key === category)
      : categories;

    const summaryRows = [
      { label: "Record", value: teamStats.team.recordSummary },
      { label: "Standing", value: teamStats.team.standingSummary },
      { label: "Season", value: teamStats.season.displayName },
    ];

    return (
      <View style={styles.teamTableContainer}>
        {!category && renderTeamStatsSection("Team Summary", summaryRows)}

        {statsToDisplay.map((cat) => (
          <React.Fragment key={cat.key}>
            {renderTeamStatsSection(
              cat.name,
              cat.stats.map((stat: StatRow) => ({
                label: stat.displayName,
                value: stat.displayValue,
              })),
            )}
          </React.Fragment>
        ))}
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

  if (error && !roster.length && !teamStats) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    return (
      <View style={global.emptyContainer}>
        <Text style={global.errorText}>Error: {errorMessage}</Text>
      </View>
    );
  }

  if (!roster.length && !teamStats) {
    return (
      <View style={global.emptyContainer}>
        <Text style={global.emptyText}>No stats available</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
