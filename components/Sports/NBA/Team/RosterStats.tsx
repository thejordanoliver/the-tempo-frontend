import CustomActivityIndicator from "components/CustomActivityIndicator";
import { Dropdown } from "components/Dropdown";
import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors, globalStyles } from "constants/styles";
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
import { PlayerStats, RosterStatsProps } from "types/types";

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

  const [viewMode, setViewMode] = useState<"Player Stats" | "Team Stats">(
    "Player Stats",
  );

  const activeRoster = useMemo(
    () =>
      (rosterStats ?? []).filter(
        (p) => p.latestSeason !== null && p.latestSeason!.g > 0,
      ),
    [rosterStats],
  );

  if (!activeRoster.length && !teamStats) return null;

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
        (b.latestSeason![item.key] as number) -
        (a.latestSeason![item.key] as number),
    )[0],
  }));

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
  }) => (
    <View style={styles.cardWrapper}>
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() =>
          router.push(`/player/${player.playerId}?teamId=${teamId}`)
        }
        style={styles.cardContainer}
      >
        <Text style={styles.cardLabel}>{label}</Text>
        <View style={styles.statCard}>
          <Image
            source={{
              uri: player.headshot_url,
            }}
            style={styles.avatar}
          />
          <View style={styles.nameValue}>
            <Text style={styles.cardName}>
              {player.short_name}{" "}
              <Text style={styles.number}>#{player.jersey_number}</Text>
            </Text>
            <Text style={styles.cardValue}>
              {formatStatValue(player.latestSeason![statKey])}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {index < total - 1 && <View style={styles.divider} />}
    </View>
  );

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

    const renderTable = (rows: { label: string; value: any }[]) => (
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
              {item.value}
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

  if (loading)
    return (
      <View style={global.emptyContainer}>
        <CustomActivityIndicator />
      </View>
    );

  if (error) return <Text style={global.errorText}>{error.name}</Text>;
  if (!rosterStats?.length)
    return <Text style={global.emptyText}>No player stats available.</Text>;

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

  return (
    <ScrollView
      contentContainerStyle={[styles.scrollContainer, { flexGrow: 1 }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      keyboardShouldPersistTaps="handled"
    >
      <HeadingTwo isDark={isDark}>{viewMode}</HeadingTwo>

      <Dropdown
        options={[
          { label: "Player Stats", value: "Player Stats" },
          { label: "Team Stats", value: "Team Stats" },
        ]}
        selectedValue={viewMode}
        onSelect={(val: string) =>
          setViewMode(val as "Player Stats" | "Team Stats")
        }
        isDark={isDark}
        absolute
      />

      <View>
        {viewMode === "Player Stats" ? (
          <>
            {/* Leader Cards */}
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

            {/* Player Table */}
            <View style={styles.tableWrapper}>
              {/* Fixed name column */}
              <View style={styles.fixedColumnContainer}>
                <View style={[styles.tableRow, headerBg]}>
                  <Text
                    style={[
                      styles.tableCell,
                      styles.nameHeaderText,
                      { width: 120 },
                    ]}
                  >
                    Player
                  </Text>
                </View>
                {activeRoster.map((p, idx) => (
                  <View
                    key={p.playerId}
                    style={[
                      styles.tableRow,
                      rowBg(idx),
                      idx === activeRoster.length - 1 && {
                        borderBottomWidth: 0,
                      },
                    ]}
                  >
                    <TouchableOpacity
                      onPress={() =>
                        router.push(`/player/${p.playerId}?teamId=${teamId}`)
                      }
                    >
                      <Text
                        style={[
                          styles.tableCell,
                          styles.playerName,
                          { width: 140 },
                        ]}
                      >
                        {p.short_name}{" "}
                        <Text style={styles.number}>#{p.jersey_number}</Text>
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {/* Scrollable stats */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                  {/* Header */}
                  <View style={[styles.tableRow, headerBg]}>
                    {[
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
                    ].map((h, i) => (
                      <Text
                        key={i}
                        style={[
                          styles.tableCell,
                          styles.headerText,
                          { width: 80 },
                        ]}
                      >
                        {h}
                      </Text>
                    ))}
                  </View>

                  {/* Rows */}
                  {activeRoster.map((p, idx) => {
                    const s = p.latestSeason!;
                    const cells = [
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
                    return (
                      <View
                        key={p.playerId}
                        style={[
                          styles.tableRow,
                          rowBg(idx),
                          idx === activeRoster.length - 1 && {
                            borderBottomWidth: 0,
                          },
                        ]}
                      >
                        {cells.map((val, i) => (
                          <Text
                            key={i}
                            style={[
                              styles.tableCell,
                              styles.statValue,
                              { width: 80 },
                            ]}
                          >
                            {formatStatValue(val)}
                          </Text>
                        ))}
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          </>
        ) : (
          renderTeamStats()
        )}
      </View>
    </ScrollView>
  );
}
