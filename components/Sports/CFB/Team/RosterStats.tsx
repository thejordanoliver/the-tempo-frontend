import CustomActivityIndicator from "components/CustomActivityIndicator";
import { Dropdown } from "components/Dropdown";
import HeadingTwo from "components/Headings/HeadingTwo";
import { players } from "constants/cfbPlayers";
import { players as nflPlayers } from "constants/nflPlayers";
import { Colors } from "constants/Styles";
import { useRouter } from "expo-router";
import {
  StatCategory,
  useFootballRosterStats,
} from "hooks/CFBHooks/useFootballRosterStats";
import React, { useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { footballRosterStatsStyles } from "styles/TeamStyles/FootballRosterStatsStyles";

interface CFBRosterStatsProps {
  espnID: number;
  teamID: number;
  category?: StatCategory;
  league?: "cfb" | "nfl";
}

const SHORT_HEADER_MAP: Record<string, string> = {
  // Offense
  "passing attempts": "Pass Att",
  completions: "Pass Cmp",
  "completion pct": "Comp %",
  yards: "Yards",
  "passing touchdowns": "Pass Tds",
  "rushing yards": "Rush Yds",
  "receiving yards": "Rec Yds",
  touchdowns: "TD",
  "yards per pass avg": "Yds/Pass",
  "yards per game": "Yds/Game",
  "longest pass": "Long Pass",
  "passing touchdowns pct": "Pass TD %",
  "interceptions pct": "INT %",
  "sacked yards lost": "Sack Yds",
  "quaterback rating": "QBR",
  "rushing attempts": "Rush Att",
  "yards per rush avg": "Yds/Rush",
  "longest rush": "Long Rush",
  "over 20 yards": "Rush/20+",
  "rushing touchdowns": "Rush Tds",
  fumbles: "Fumbles",
  "fumbles lost": "Fum Lost",
  "rushing first downs": "Rush/1stDwns",
  receptions: "Rec",
  "receiving targets": "Targets",
  "yards per reception avg": "Yds/Rec",
  "receiving touchdowns": "Rec TD",
  "longest reception": "Long Rec",
  "yards after catch": "YAC",
  "receiving first downs": "1stDwns",

  // Defense
  "unassisted tackles": "Solo Tkl",
  "assisted tackles": "Ast Tkl",
  "total tackles": "Tkl",
  sacks: "Sacks",
  "yards lost on sack": "Sack Yds",
  "tackles for loss": "TFL",
  "passes defended": "PD",
  interceptions: "INT",
  "intercepted returned yards": "INT Yds",
  "longest interception return": "INT Long",
  "interceptions returned for touchdowns": "INT TD",
  "forced fumbles": "FF",
  "fumbles recovered": "FR",
  "fumbles returned for touchdowns": "FR TD",
  "blocked kicks": "Blk",

  // Kicking
  "field goals made": "FG Made",
  "field goals attempts": "FG Att",
  "field goals made pct": "FG %",
  "longest goal made": "Long FG",
  "field goals from 1 19 yards": "FG 1-19",
  "field goals from 20 29 yards": "FG 20-29",
  "field goals from 30 39 yards": "FG 30-39",
  "field goals from 40 49 yards": "FG 40-49",
  "field goals from 50 yards": "FG 50+",
  "extra points made": "XP Made",
  "extra points attempts": "XP Att",
  "extra points made pct": "XP %",
};

const FootballRosterStats: React.FC<CFBRosterStatsProps> = ({
  espnID,
  teamID,
  category,
  league = "cfb", // ✅ default league
}) => {
  const [viewMode, setViewMode] = useState<"team" | "players">("players");
  const isDark = useColorScheme() === "dark";
  const styles = footballRosterStatsStyles(isDark);
  const playerDataList = league === "nfl" ? nflPlayers : players;
  const router = useRouter();

  // ✅ Pass league to the stats hook
  const { data, loading, error } = useFootballRosterStats(
    espnID?.toString(),
    teamID?.toString(),
    category,
    viewMode,
    league,
  );

  const formatDisplayName = (fullName: string, number?: string) => {
    if (!fullName) return "Unknown";

    const parts = fullName.split(" ");
    if (parts.length === 1)
      return (
        <Text>
          {parts[0]} {number && <Text style={styles.number}>#{number}</Text>}
        </Text>
      );

    const firstInitial = parts[0][0].toUpperCase();
    const lastName = parts.slice(1).join(" ");

    return (
      <Text>
        {firstInitial}. {lastName}{" "}
        {number && <Text style={styles.number}>#{number}</Text>}
      </Text>
    );
  };

  if (loading)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          margin: 20,
        }}
      >
        <CustomActivityIndicator />
      </View>
    );
  if (error)
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  if (!data)
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No stats available</Text>
      </View>
    );

  const statsToDisplay = category
    ? [data.stats[category]]
    : Object.values(data.stats);

  const playerCategoryTables = useMemo(() => {
    if (viewMode !== "players") return null;
    const tables: Record<
      string,
      {
        headers: string[];
        rows: {
          playerName: string;
          position?: string;
          values: Record<string, string | number>;
        }[];
      }
    > = {};

    for (const [catName, catData] of Object.entries(data.stats)) {
      const headersSet = new Set<string>();
      const playerMap: Record<
        string,
        { playerName: string; position?: string; values: Record<string, any> }
      > = {};

      for (const stat of catData.stats) {
        const name = stat.playerName ?? "Unknown";
        if (!playerMap[name]) {
          playerMap[name] = {
            playerName: name,
            position: stat.position,
            values: {},
          };
        }
        playerMap[name].values[stat.displayName] =
          stat.displayValue ?? stat.value ?? "-";
        headersSet.add(stat.displayName);
      }

      tables[catName] = {
        headers: Array.from(headersSet),
        rows: Object.values(playerMap),
      };
    }
    return tables;
  }, [data, viewMode]);

  const LeaderCard = ({
    player,
    stat,
    statName,
    index,
    total,
  }: {
    player: any;
    stat: string | number;
    statName: string;
    index: number;
    total: number;
  }) => {
    const handlePress = () => {
      if (!player) return;
      const leaguePath = league === "nfl" ? "nfl" : "cfb";
      router.push(`/player/${leaguePath}/${player.id}`);
    };

    return (
      <View style={styles.cardWrapper}>
        <View style={styles.cardContainer}>
          {/* Stat Name */}
          <Text style={styles.cardLabel}>{statName}</Text>

          <TouchableOpacity onPress={handlePress}>
            <View style={styles.statCard}>
              <Image source={{ uri: player.image }} style={[styles.avatar]} />
              <View style={styles.nameValue}>
                <Text style={styles.cardName}>
                  {formatDisplayName(player.playerName, player.jersey)}
                </Text>
                {/* Stat Value */}
                <Text style={styles.cardValue}>{stat}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Vertical divider between cards (except last one) */}
        {index < total - 1 && <View style={styles.divider} />}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <HeadingTwo>
        {viewMode === "team" ? "Team Stats" : "Player Stats"}
      </HeadingTwo>

      <Dropdown
        options={[
          { label: "Player Stats", value: "players" },
          { label: "Team Stats", value: "team" },
        ]}
        selectedValue={viewMode}
        onSelect={(val: string) => setViewMode(val as "team" | "players")}
        isDark={isDark}
        absolute
      />

      <ScrollView style={styles.scrollContainer}>
        {/* TEAM STATS */}
        {viewMode === "team" &&
          statsToDisplay.map((cat) => (
            <View key={cat.name} style={{ marginBottom: 20 }}>
              <Text style={styles.categoryTitle}>{cat.name.toUpperCase()}</Text>
              <View style={styles.table}>
                {cat.stats.map((stat, index) => (
                  <View
                    key={`${cat.name}-${stat.name}-${index}`}
                    style={[
                      styles.tableRow,
                      index === cat.stats.length - 1 && {
                        borderBottomWidth: 0,
                      },
                      index % 2 === 1 && {
                        backgroundColor: isDark
                          ? Colors.dark.itemBackground
                          : Colors.light.itemBackground,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.teamStatsTablecell, styles.headerText]}
                    >
                      {stat.displayName}
                    </Text>
                    <Text style={[styles.teamStatsTablecell, styles.statValue]}>
                      {stat.displayValue ?? stat.value ?? "-"}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}

        {/* PLAYER STATS */}
        {viewMode === "players" && playerCategoryTables && (
          <>
            {/* Top Players / Leader Cards at the top */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 16 }}
              snapToInterval={276} // width of card (260) + margin (16)
              decelerationRate="fast"
              snapToAlignment="start"
            >
              {(() => {
                // Define categories and stats you care about
                const statKeysMap: Record<string, string[]> = {
                  passing: ["yards", "passing touchdowns", "completion pct"],
                  rushing: [
                    "rushing yards",
                    "rushing touchdowns",
                    "yards per rush avg",
                  ],
                  receiving: [
                    "receiving yards",
                    "receiving touchdowns",
                    "yards per reception avg",
                  ],
                  defense: ["sacks", "interceptions", "tackles for loss"],
                  kicking: ["field goals made", "extra points made"],
                };

                const allTopPlayers: {
                  player: any;
                  stat: string | number;
                  statName: string;
                }[] = [];

                Object.entries(statKeysMap).forEach(
                  ([categoryName, statKeys]) => {
                    statKeys.forEach((statKey) => {
                      const allRows = Object.values(
                        playerCategoryTables,
                      ).flatMap(({ rows }) => rows);

                      const topPlayer = allRows
                        .map((row) => {
                          const playerData = playerDataList.find(
                            (p) =>
                              p.teamId === teamID && p.name === row.playerName,
                          );
                          return {
                            ...row,
                            image: playerData?.image,
                            jersey: playerData?.number,
                            id: playerData?.id, // ✅ add this
                          };
                        })
                        .filter((row) => row.values[statKey])
                        .sort(
                          (a, b) =>
                            Number(b.values[statKey] ?? 0) -
                            Number(a.values[statKey] ?? 0),
                        )[0];

                      if (topPlayer) {
                        allTopPlayers.push({
                          player: topPlayer,
                          stat: topPlayer.values[statKey],
                          statName: statKey,
                        });
                      }
                    });
                  },
                );
                // Render only one card per category (first available stat per group)
                const uniqueByCategory: { [key: string]: boolean } = {};
                const filteredLeaders = allTopPlayers.filter(({ statName }) => {
                  const cat = Object.keys(statKeysMap).find((k) =>
                    statKeysMap[k].includes(statName),
                  );
                  if (!cat) return false;
                  if (uniqueByCategory[cat]) return false;
                  uniqueByCategory[cat] = true;
                  return true;
                });

                // Helper function to title-case the stat name
                // Helper function to format stat names
                const formatStatName = (
                  statName: string,
                  categoryName?: string,
                ) => {
                  if (categoryName === "passing" && statName === "yards")
                    return "Passing Yards";
                  return statName
                    .split(" ")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ");
                };

                return filteredLeaders.map(
                  ({ player, stat, statName }, idx) => {
                    // detect the category this stat belongs to
                    const categoryName = Object.keys(statKeysMap).find((k) =>
                      statKeysMap[k].includes(statName),
                    );

                    return (
                      <LeaderCard
                        key={`${player.playerName}-${idx}`}
                        player={player}
                        stat={stat}
                        statName={formatStatName(statName, categoryName)} // ✅ pass category name
                        index={idx}
                        total={filteredLeaders.length}
                      />
                    );
                  },
                );
              })()}
            </ScrollView>

            {/* Player tables per category */}
            {Object.entries(playerCategoryTables).map(
              ([catName, { headers, rows }]) => (
                <View key={catName} style={{ marginBottom: 24 }}>
                  <Text style={styles.categoryTitle}>{catName}</Text>
                  <View style={styles.tableWrapper}>
                    <View style={{ flexDirection: "row" }}>
                      {/* Fixed Player Column */}
                      <View style={styles.fixedColumnContainer}>
                        <View>
                          <View style={[styles.tableRow, styles.headerRow]}>
                            <Text
                              style={[
                                styles.tableCell,
                                styles.headerText,
                                { width: 120 },
                              ]}
                            >
                              Player
                            </Text>
                          </View>
                          {rows.map((row, idx) => {
                            const isLast = idx === rows.length - 1;

                            return (
                              <View
                                key={`${catName}-${row.playerName}-${idx}`}
                                style={[
                                  styles.tableRow,
                                  !isLast && {
                                    borderBottomWidth: 1,
                                  },
                                  idx % 2 === 1 && {
                                    backgroundColor: isDark
                                      ? Colors.dark.itemBackground
                                      : Colors.light.itemBackground,
                                  },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.tableCell,
                                    styles.playerName,
                                    { width: 100 },
                                  ]}
                                  numberOfLines={1}
                                >
                                  {formatDisplayName(row.playerName)}
                                  {row.position ? ` (${row.position})` : ""}
                                </Text>
                              </View>
                            );
                          })}
                        </View>
                      </View>

                      {/* Scrollable Stats Columns */}
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator
                        style={{ flex: 1 }}
                      >
                        <View>
                          <View style={[styles.tableRow, styles.headerRow]}>
                            {headers.map((h, i) => (
                              <Text
                                key={`${catName}-header-${i}`}
                                style={[
                                  styles.tableCell,
                                  styles.headerText,
                                  { width: 90 },
                                ]}
                                numberOfLines={1}
                              >
                                {SHORT_HEADER_MAP[h] ?? h}
                              </Text>
                            ))}
                          </View>
                          {rows.map((row, idx) => {
                            const isLast = idx === rows.length - 1;

                            return (
                              <View
                                key={`${catName}-${row.playerName}-data-${idx}`}
                                style={[
                                  styles.tableRow,
                                  !isLast && {
                                    borderBottomWidth: 1,
                                  },
                                  idx % 2 === 1 && {
                                    backgroundColor: isDark
                                      ? Colors.dark.itemBackground
                                      : Colors.light.itemBackground,
                                  },
                                ]}
                              >
                                {headers.map((h, i) => (
                                  <Text
                                    key={`${catName}-${row.playerName}-val-${i}`}
                                    style={[
                                      styles.tableCell,
                                      styles.statValue,
                                      { width: 90 },
                                    ]}
                                  >
                                    {row.values[h] ?? "-"}
                                  </Text>
                                ))}
                              </View>
                            );
                          })}
                        </View>
                      </ScrollView>
                    </View>
                  </View>
                </View>
              ),
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default FootballRosterStats;
