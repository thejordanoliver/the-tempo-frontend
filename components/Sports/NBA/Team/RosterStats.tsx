import CustomActivityIndicator from "components/CustomActivityIndicator";
import { Dropdown } from "components/Dropdown";
import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors, globalStyles } from "constants/Styles";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { rosterStatsStyles } from "styles/TeamStyles/RosterStatStyles";
import { PlayerInfo, PlayerStats, RosterStatsProps } from "types/types";

export default function RosterStats({
  rosterStats,
  players,
  teamId,
  teamStats,
  loading,
  error,
  refreshing,
  onRefresh,
}: RosterStatsProps) {
  const isDark = useColorScheme() === "dark";
  const styles = rosterStatsStyles(isDark);
  const global = globalStyles(isDark);

  const [viewMode, setViewMode] = useState<"Player Stats" | "Team Stats">(
    "Player Stats",
  );

  if (!rosterStats?.length && !teamStats) return null;

  const getPG = (val: number, gp: number) =>
    gp ? (val / gp).toFixed(1) : "0.0";

  const playersMap = useMemo(() => {
    const map = new Map<number, PlayerInfo>();
    players.forEach((p) => {
      if (typeof p.player_id === "number") map.set(p.player_id, p);
    });
    return map;
  }, [players]);

  const mergedRoster = useMemo(() => {
    return rosterStats
      ?.map((stat) => {
        const key = Number(stat.playerId);
        let player = playersMap.get(key);

        if (!player) {
          player = players.find(
            (p) =>
              p.first_name.toLowerCase() ===
                stat.name.split(" ")[0].toLowerCase() &&
              p.last_name.toLowerCase() ===
                stat.name.split(" ").slice(1).join(" ").toLowerCase(),
          );
        }

        if (!player || stat.gamesPlayed === 0) return null;

        return {
          ...stat,
          first_name: player.first_name,
          last_name: player.last_name,
          full_name: player.full_name,
          short_name: player.short_name,
          jersey_number: player.jersey_number,
          headshot_url: player.headshot_url,
        };
      })
      .filter(Boolean) as (PlayerStats & PlayerInfo)[];
  }, [rosterStats, players, playersMap]);

  if (!mergedRoster?.length && !teamStats) return null;

  const formatDisplayName = (name: string, jersey: string) => {
    return (
      <Text style={styles.playerName}>
        {name} <Text style={styles.number}>#{jersey}</Text>
      </Text>
    );
  };
  const formatCardName = (short_name: string, jersey: string) => {
    return (
      <Text style={styles.cardName}>
        {short_name} <Text style={styles.number}>#{jersey}</Text>
      </Text>
    );
  };

  // Leader Cards
  const statLeaders = [
    {
      label: "Points",
      stat: "totalPoints",
      player: [...mergedRoster].sort(
        (a, b) => b.totalPoints / b.gamesPlayed - a.totalPoints / a.gamesPlayed,
      )[0],
    },
    {
      label: "Rebounds",
      stat: "totalRebounds",
      player: [...mergedRoster].sort(
        (a, b) =>
          b.totalRebounds / b.gamesPlayed - a.totalRebounds / a.gamesPlayed,
      )[0],
    },
    {
      label: "Assists",
      stat: "totalAssists",
      player: [...mergedRoster].sort(
        (a, b) =>
          b.totalAssists / b.gamesPlayed - a.totalAssists / a.gamesPlayed,
      )[0],
    },
    {
      label: "Blocks",
      stat: "totalBlocks",
      player: [...mergedRoster].sort(
        (a, b) => b.totalBlocks / b.gamesPlayed - a.totalBlocks / a.gamesPlayed,
      )[0],
    },
    {
      label: "Steals",
      stat: "totalSteals",
      player: [...mergedRoster].sort(
        (a, b) => b.totalSteals / b.gamesPlayed - a.totalSteals / a.gamesPlayed,
      )[0],
    },
  ];
  const LeaderCard = ({
    player,
    statName,
    label, // <-- add this,
    index,
    total,
  }: {
    player: PlayerStats & PlayerInfo;
    statName: keyof PlayerStats;
    label: string; // <-- add

    index: number;
    total: number;
  }) => {
    return (
      <View style={styles.cardWrapper}>
        <View style={styles.cardContainer}>
          <Text style={styles.cardLabel}>{label}</Text>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() =>
              router.push(`/player/${player.playerId}?teamId=${teamId}`)
            }
          >
            <View style={styles.statCard}>
              <Image
                source={{
                  uri: player.headshot_url ?? "https://via.placeholder.com/60",
                }}
                style={styles.avatar}
              />
              <View style={styles.nameValue}>
                <Text style={styles.cardName}>
                  {formatCardName(player.short_name, player.jersey_number)}
                </Text>
                <Text style={styles.cardValue}>
                  {getPG(player[statName] as number, player.gamesPlayed)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {index < total - 1 && <View style={styles.divider} />}
      </View>
    );
  };

  // Render Team Stats in a CFB-like table (Averages + Totals)
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
      { label: "Total Points", value: teamStats.totalPoints },
      { label: "Total Rebounds", value: teamStats.totalRebounds },
      { label: "Total Assists", value: teamStats.totalAssists },
      {
        label: "Total Steals",
        value: Math.round(teamStats.stealsPerGame * teamStats.gamesPlayed),
      },
      {
        label: "Total Blocks",
        value: Math.round(teamStats.blocksPerGame * teamStats.gamesPlayed),
      },
      {
        label: "Total Turnovers",
        value: Math.round(teamStats.turnoversPerGame * teamStats.gamesPlayed),
      },
      {
        label: "Total Fouls",
        value: Math.round(teamStats.foulsPerGame * teamStats.gamesPlayed),
      },
    ];

    return (
      <View style={{ gap: 20 }}>
        {/* Averages Table */}
        <View>
          <Text style={styles.categoryTitle}>Per-Game Averages</Text>

          <View style={styles.table}>
            {displayAverages.map((item, idx) => (
              <View
                key={item.label}
                style={[
                  styles.teamTableRow,
                  idx % 2 === 1 && {
                    backgroundColor: isDark
                      ? Colors.dark.itemBackground
                      : Colors.light.itemBackground,
                  },
                  idx === displayAverages.length - 1 && {
                    borderBottomWidth: 0,
                  }, // ← remove border on LAST row
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
        </View>

        {/* Totals Table */}
        <View>
          <Text style={styles.categoryTitle}>Team Totals</Text>

          <View style={styles.table}>
            {displayTotals.map((item, idx) => (
              <View
                key={item.label}
                style={[
                  styles.teamTableRow,
                  idx % 2 === 1 && {
                    backgroundColor: isDark
                      ? Colors.dark.itemBackground
                      : Colors.light.itemBackground,
                  },
                  idx === displayTotals.length - 1 && { borderBottomWidth: 0 }, // ← same here
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
        </View>
      </View>
    );
  };

  if (loading)
    return (
      <View style={styles.container}>
        <CustomActivityIndicator />
      </View>
    );
  if (error) return <Text style={global.errorText}>{error.name}</Text>;

  if (rosterStats.length === 0)
    return <Text style={global.emptyText}>No player stats available.</Text>;

  return (
    <ScrollView
      contentContainerStyle={[styles.scrollContainer, { flexGrow: 1 }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      keyboardShouldPersistTaps="handled"
    >
      <HeadingTwo>{viewMode}</HeadingTwo>

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
            <ScrollView
              horizontal
              nestedScrollEnabled={false} // 🔥 important
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 16 }}
              snapToInterval={276} // width of card (260) + margin (16)
              decelerationRate="fast"
              snapToAlignment="start"
            >
              {statLeaders
                .filter((item) => item.player) // <-- ignore undefined
                .map((item, idx) => (
                  <LeaderCard
                    key={item.stat}
                    player={item.player!} // non-null assertion
                    label={item.label}
                    statName={item.stat as keyof PlayerStats}
                    index={idx}
                    total={statLeaders.length}
                  />
                ))}
            </ScrollView>

            {/* Player Table */}
            <View style={styles.tableWrapper}>
              {/* Fixed name column */}
              <View style={styles.fixedColumnContainer}>
                {/* Header for name column */}
                <View
                  style={[
                    styles.tableRow,
                    {
                      backgroundColor: isDark
                        ? Colors.dark.itemBackground
                        : Colors.light.itemBackground,
                    },
                  ]}
                >
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

                {/* Player names */}
                {mergedRoster.map((p, idx) => (
                  <View
                    key={p.playerId}
                    style={[
                      styles.tableRow,
                      idx % 2 === 1 && {
                        backgroundColor: isDark
                          ? Colors.dark.itemBackground
                          : Colors.light.itemBackground,
                      },
                      idx === mergedRoster.length - 1 && {
                        borderBottomWidth: 0,
                      },
                    ]}
                  >
                    <TouchableOpacity
                      onPress={() =>
                        router.push(`/player/${p.playerId}?teamId=${teamId}`)
                      }
                    >
                      <Text style={[styles.tableCell, { width: 140 }]}>
                        {formatDisplayName(p.short_name, p.jersey_number)}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {/* Scrollable stats */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                  {/* Header for stats columns */}
                  <View
                    style={[
                      styles.tableRow,
                      {
                        backgroundColor: isDark
                          ? Colors.dark.itemBackground
                          : Colors.light.itemBackground,
                      },
                    ]}
                  >
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
                    ].map((header, i) => (
                      <Text
                        key={i}
                        style={[
                          styles.tableCell,
                          styles.headerText,
                          { width: 80 },
                        ]}
                      >
                        {header}
                      </Text>
                    ))}
                  </View>

                  {/* Stats rows */}
                  {mergedRoster.map((p, idx) => (
                    <View
                      key={p.playerId}
                      style={[
                        styles.tableRow,
                        idx % 2 === 1 && {
                          backgroundColor: isDark
                            ? Colors.dark.itemBackground
                            : Colors.light.itemBackground,
                        },
                        idx === mergedRoster.length - 1 && {
                          borderBottomWidth: 0,
                        },
                      ]}
                    >
                      {[
                        p.gamesPlayed,
                        (p.minutesPlayed / p.gamesPlayed).toFixed(1),
                        getPG(p.totalPoints, p.gamesPlayed),
                        getPG(p.totalFGM, p.gamesPlayed),
                        getPG(p.totalFGA, p.gamesPlayed),
                        p.totalFGA
                          ? ((p.totalFGM / p.totalFGA) * 100).toFixed(1) + "%"
                          : "0.0%",
                        getPG(p.total3PM, p.gamesPlayed),
                        getPG(p.total3PA, p.gamesPlayed),
                        p.total3PA
                          ? ((p.total3PM / p.total3PA) * 100).toFixed(1) + "%"
                          : "0.0%",
                        getPG(p.totalFTM, p.gamesPlayed),
                        getPG(p.totalFTA, p.gamesPlayed),
                        p.totalFTA
                          ? ((p.totalFTM / p.totalFTA) * 100).toFixed(1) + "%"
                          : "0.0%",
                        getPG(p.totalOffReb, p.gamesPlayed),
                        getPG(p.totalDefReb, p.gamesPlayed),
                        getPG(p.totalRebounds, p.gamesPlayed),
                        getPG(p.totalAssists, p.gamesPlayed),
                        getPG(p.totalSteals, p.gamesPlayed),
                        getPG(p.totalBlocks, p.gamesPlayed),
                        getPG(p.totalTurnovers, p.gamesPlayed),
                        getPG(p.totalFouls, p.gamesPlayed),
                        p.plusMinus
                          ? (p.plusMinus / p.gamesPlayed).toFixed(1)
                          : "0.0",
                      ].map((val, i) => (
                        <Text
                          key={i}
                          style={[
                            styles.tableCell,
                            styles.statValue,
                            { width: 80 },
                          ]}
                        >
                          {val}
                        </Text>
                      ))}
                    </View>
                  ))}
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
