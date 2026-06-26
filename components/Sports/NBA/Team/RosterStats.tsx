import MainScrollTabBar from "@/components/TabBars/MainTabScrollBar";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { rosterStatsStyles } from "styles/TeamStyles/RosterStatStyles";
import { PlayerStats, RosterStatsProps } from "types/types";

const STAT_TABS = ["Player Stats", "Team Stats"] as const;
type StatTab = (typeof STAT_TABS)[number];

const PLAYER_NAME_WIDTH = 140;
const STAT_CELL_WIDTH = 80;

const PLAYER_STAT_HEADERS = [
  "Player",
  "GP",
  "MIN",
  "PTS",
  "FGM",
  "FGA",
  "FG%",
  "3PM",
  "3PA",
  "3P%",
  "FTM",
  "FTA",
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

export default function RosterStats({
  rosterStats,
  teamId,
  teamStats,
  loading,
  error,
  refreshing,
  onRefresh,
}: RosterStatsProps) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = rosterStatsStyles(isDark);
  const global = globalStyles(isDark);
  const league = "NBA";

  const [selectedTab, setSelectedTab] = useState<StatTab>(STAT_TABS[0]);
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

  const activeRoster = useMemo(
    () =>
      (rosterStats ?? []).filter(
        (player) => player.latestSeason !== null && player.latestSeason!.g > 0,
      ),
    [rosterStats],
  );

  const rowBg = (idx: number) =>
    idx % 2 === 1
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

  const statLeaders = [
    { label: "Points", key: "pts" as const },
    { label: "Rebounds", key: "trb" as const },
    { label: "Assists", key: "ast" as const },
    { label: "Blocks", key: "blk" as const },
    { label: "Steals", key: "stl" as const },
  ].map((item) => ({
    ...item,
    player: [...activeRoster].sort(
      (a, b) =>
        Number(b.latestSeason?.[item.key] ?? 0) -
        Number(a.latestSeason?.[item.key] ?? 0),
    )[0],
  }));

  const openPlayer = (playerId: string | number) => {
    if (!teamId) {
      console.warn(`[RosterStats] No teamId found for ${league}`);
      return;
    }

    router.push({
      pathname: "/player/[id]",
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
    statKey,
    index,
    total,
  }: {
    player: PlayerStats;
    label: string;
    statKey: keyof NonNullable<PlayerStats["latestSeason"]>;
    index: number;
    total: number;
  }) => {
    return (
      <View style={styles.cardWrapper}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => openPlayer(player.playerId)}
          style={styles.cardContainer}
        >
          <Text style={styles.cardLabel}>{label}</Text>

          <View style={styles.statCard}>
            <Image
              source={{ uri: player.headshot_url }}
              style={styles.avatar}
            />

            <View style={styles.nameValue}>
              <Text style={styles.cardName}>
                {player.short_name}{" "}
                <Text style={styles.number}>#{player.jersey_number}</Text>
              </Text>

              <Text style={styles.cardValue}>
                {formatStatValue(player.latestSeason?.[statKey])}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {index < total - 1 && <View style={styles.divider} />}
      </View>
    );
  };

  const getPlayerCells = (player: PlayerStats) => {
    const s = player.latestSeason!;

    return [
      s.g,
      s.mpg,
      s.pts,
      s.fg,
      s.fga,
      `${s.fg_pct}%`,
      s.three_p,
      s.three_pa,
      `${s.three_pct}%`,
      s.ft,
      s.fta,
      `${s.ft_pct}%`,
      s.orb,
      s.drb,
      s.trb,
      s.ast,
      s.stl,
      s.blk,
      s.tov,
      s.pf,
      "—",
    ];
  };

  const renderActiveRosterRow = ({
    item,
    index,
  }: {
    item: PlayerStats;
    index: number;
  }) => {
    const cells = getPlayerCells(item);

    return (
      <View
        style={[
          styles.tableRow,
          rowBg(index),
          index === activeRoster.length - 1 && { borderBottomWidth: 0 },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => openPlayer(item.playerId)}
          style={{ width: PLAYER_NAME_WIDTH }}
        >
          <Text
            style={[
              styles.tableCell,
              styles.playerName,
              { width: PLAYER_NAME_WIDTH },
            ]}
          >
            {item.short_name}{" "}
            <Text style={styles.number}>#{item.jersey_number}</Text>
          </Text>
        </TouchableOpacity>

        {cells.map((val, cellIndex) => (
          <Text
            key={`${item.playerId}-stat-${cellIndex}`}
            style={[
              styles.tableCell,
              styles.statValue,
              { width: STAT_CELL_WIDTH },
            ]}
          >
            {formatStatValue(val)}
          </Text>
        ))}
      </View>
    );
  };

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
          {statLeaders
            .filter((item) => item.player)
            .map((item, idx) => (
              <LeaderCard
                key={item.label}
                player={item.player!}
                label={item.label}
                statKey={item.key}
                index={idx}
                total={statLeaders.length}
              />
            ))}
        </ScrollView>

        <View style={styles.tableWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <FlatList
              data={activeRoster}
              keyExtractor={(item) => String(item.playerId)}
              scrollEnabled={false}
              removeClippedSubviews={false}
              ListHeaderComponent={
                <View style={[styles.tableRow, headerBg]}>
                  {PLAYER_STAT_HEADERS.map((header, index) => (
                    <Text
                      key={header}
                      style={[
                        styles.tableCell,
                        index === 0 ? styles.nameHeaderText : styles.headerText,
                        {
                          width:
                            index === 0 ? PLAYER_NAME_WIDTH : STAT_CELL_WIDTH,
                        },
                      ]}
                    >
                      {header}
                    </Text>
                  ))}
                </View>
              }
              renderItem={renderActiveRosterRow}
            />
          </ScrollView>
        </View>
      </>
    );
  };

  const renderTeamStats = () => {
    if (!teamStats) return null;

    const displayAverages = [
      { label: "Points Per Game", value: teamStats.pointsPerGame.toFixed(1) },
      {
        label: "Rebounds Per Game",
        value: teamStats.reboundsPerGame.toFixed(1),
      },
      { label: "Assists Per Game", value: teamStats.assistsPerGame.toFixed(1) },
      { label: "Steals Per Game", value: teamStats.stealsPerGame.toFixed(1) },
      { label: "Blocks Per Game", value: teamStats.blocksPerGame.toFixed(1) },
      {
        label: "Turnovers Per Game",
        value: teamStats.turnoversPerGame.toFixed(1),
      },
      {
        label: "Personal Fouls Per Game",
        value: teamStats.foulsPerGame.toFixed(1),
      },
      { label: "Field Goal %", value: `${teamStats.fgPercent.toFixed(1)}%` },
      { label: "3 Point %", value: `${teamStats.tpPercent.toFixed(1)}%` },
      { label: "Free Throw %", value: `${teamStats.ftPercent.toFixed(1)}%` },
    ];

    const displayTotals = [
      { label: "Total Points", value: formatStatValue(teamStats.totalPoints) },
      {
        label: "Total Rebounds",
        value: formatStatValue(teamStats.totalRebounds),
      },
      {
        label: "Total Assists",
        value: formatStatValue(teamStats.totalAssists),
      },
      {
        label: "Total Steals",
        value: formatStatValue(
          Math.round(teamStats.stealsPerGame * teamStats.gamesPlayed),
        ),
      },
      {
        label: "Total Blocks",
        value: formatStatValue(
          Math.round(teamStats.blocksPerGame * teamStats.gamesPlayed),
        ),
      },
      {
        label: "Total Turnovers",
        value: formatStatValue(
          Math.round(teamStats.turnoversPerGame * teamStats.gamesPlayed),
        ),
      },
      {
        label: "Total Fouls",
        value: formatStatValue(
          Math.round(teamStats.foulsPerGame * teamStats.gamesPlayed),
        ),
      },
    ];

    const renderTable = (rows: { label: string; value: unknown }[]) => (
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
            <Text style={[styles.tableCell, styles.statValue]}>
              {formatStatValue(item.value)}
            </Text>
          </View>
        ))}
      </View>
    );

    return (
      <View style={{ gap: 20 }}>
        <View>
          <Text style={styles.categoryTitle}>Team Summary</Text>
          {renderTable([
            {
              label: "Team",
              value: teamStats?.team?.fullName || teamStats?.team?.name,
            },
            { label: "Record", value: teamStats?.team?.recordSummary || "—" },
            {
              label: "Standing",
              value: teamStats?.team?.standingSummary || "—",
            },
            { label: "Season", value: teamStats?.season?.displayName || "—" },
          ])}
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

  if (error) return <Text style={global.errorText}>{error.name}</Text>;

  if (!activeRoster.length && !teamStats) {
    return <Text style={global.emptyText}>No player stats available.</Text>;
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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