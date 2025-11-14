import { Dropdown } from "components/Dropdown";
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { usePlayerStatsBySeason } from "hooks/NFLHooks/useNFLPlayerCareerStats";
import { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

interface GameStat {
  [key: string]: string | number | null | undefined;
  date?: string;
  points?: number;
  completions?: number;
  passing_attempts?: number;
}

interface SeasonData {
  season: string;
  games: GameStat[];
}

interface Props {
  playerId: number;
  seasons: string[];
}

const safeDivide = (num: number | null | undefined, denom: number) =>
  denom === 0 || num == null ? "0.0" : (num / denom).toFixed(1);

/**
 * ✅ Grouped stat categories
 */
const statGroupMap: Record<string, string[]> = {
  passing_attempts: ["Passing"],
  completions: ["Passing"],
  completion_pct: ["Passing"],
  yards_passing: ["Passing"],
  yards_per_pass_avg: ["Passing"],
  passing_touchdowns: ["Passing"],
  interceptions: ["Passing"],
  sacks: ["Passing"],
  sacked_yards_lost: ["Passing"],
  quaterback_rating: ["Passing"],

  rushing_attempts: ["Rushing"],
  yards_rushing: ["Rushing"],
  yards_per_rush_avg: ["Rushing"],
  rushing_touchdowns: ["Rushing"],
  longest_rush: ["Rushing"],
  yards_per_game_rushing: ["Rushing"],
  fumbles: ["Rushing"],
  fumbles_lost: ["Rushing"],

  receptions: ["Receiving"],
  receiving_targets: ["Receiving"],
  receiving_yards: ["Receiving"],
  yards_per_reception_avg: ["Receiving"],
  receiving_touchdowns: ["Receiving"],
  longest_reception: ["Receiving"],
  yards_per_game_receiving: ["Receiving"],
  yards_after_catch: ["Receiving"],

  total_tackles: ["Defense"],
  sacks_defense: ["Defense"],
  interceptions_defense: ["Defense"],
  passes_defended: ["Defense"],
  forced_fumbles: ["Defense"],
  fumbles_recovered: ["Defense"],
  tackles_for_loss: ["Defense"],

  kickoff_returned_attempts: ["Returning"],
  kickoff_return_yards: ["Returning"],
  yards_per_kickoff_avg: ["Returning"],
  kickoff_return_touchdowns: ["Returning"],
  punts_returned: ["Returning"],
  yards_returned_on_punts: ["Returning"],
  punt_return_touchdowns: ["Returning"],
};

const getStatGroup = (statName: string, contextGroup?: string) => {
  const groups = statGroupMap[statName.toLowerCase()];
  if (!groups) return undefined;
  if (contextGroup && groups.includes(contextGroup)) return contextGroup;
  return groups[0];
};

const formatNFLStat = (
  groupName: string,
  statName: string,
  passingTotals?: { att?: string; cmp?: string },
  isHeader = false
) => {
  const name = statName.toLowerCase();
  switch (groupName.toLowerCase()) {
    case "passing":
      switch (name) {
        case "passing_attempts":
          return isHeader
            ? "CMP/ATT"
            : passingTotals
            ? `${passingTotals.cmp}/${passingTotals.att}`
            : statName;
        case "completion_pct":
          return "CMP%";
        case "yards_passing":
          return "PASS YDS";
        case "yards_per_pass_avg":
          return "Y/A";
        case "passing_touchdowns":
          return "TD";
        case "interceptions":
          return "INT";
        case "sacks":
          return "SCK";
        case "sacked_yards_lost":
          return "SCK YDS";
        case "quaterback_rating":
          return "QBR";
        default:
          return statName;
      }
    case "rushing":
      switch (name) {
        case "rushing_attempts":
          return "ATT";
        case "yards_rushing":
          return "YDS";
        case "yards_per_rush_avg":
          return "Y/A";
        case "rushing_touchdowns":
          return "TD";
        case "longest_rush":
          return "LONG";
        case "yards_per_game_rushing":
          return "Y/G";
        case "fumbles":
          return "FUM";
        case "fumbles_lost":
          return "FUML";
        default:
          return statName;
      }
    case "receiving":
      switch (name) {
        case "receptions":
          return "REC";
        case "receiving_targets":
          return "TGT";
        case "receiving_yards":
          return "YDS";
        case "yards_per_reception_avg":
          return "AVG";
        case "receiving_touchdowns":
          return "TD";
        case "yards_after_catch":
          return "YAC";
        case "fumbles":
          return "FUM";
        default:
          return statName;
      }
    case "defense":
      switch (name) {
        case "total_tackles":
          return "TCK";
        case "sacks_defense":
          return "SCK";
        case "interceptions_defense":
          return "INT";
        case "passes_defended":
          return "PD";
        case "forced_fumbles":
          return "FF";
        case "fumbles_recovered":
          return "FR";
        case "tackles_for_loss":
          return "TFL";
        default:
          return statName;
      }
    case "returning":
      switch (name) {
        case "kickoff_returned_attempts":
          return "KO ATT";
        case "kickoff_return_yards":
          return "KO YDS";
        case "yards_per_kickoff_avg":
          return "KO AVG";
        case "kickoff_return_touchdowns":
          return "KO TD";
        case "punts_returned":
          return "PUNT ATT";
        case "yards_returned_on_punts":
          return "PUNT YDS";
        case "punt_return_touchdowns":
          return "PUNT TD";
        default:
          return statName;
      }
    default:
      return statName;
  }
};

export default function PlayerStatTable({ playerId, seasons }: Props) {
  const { data, loading } = usePlayerStatsBySeason(playerId, seasons);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = statsTableStyles(isDark);
  const [selectedGroup, setSelectedGroup] = useState("Passing");
  const statGroups = [
    "Passing",
    "Rushing",
    "Receiving",
    "Defense",
    "Returning",
  ];

  const dynamicStyles = useMemo(
    () => ({
      rowOdd: {
        backgroundColor: isDark
          ? Colors.dark.itemBackground
          : Colors.light.itemBackground,
        borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
      },
      careerRow: {
        backgroundColor: isDark ? "#004400" : "#ccffcc",
        borderBottomWidth: 0,
        borderTopColor: isDark ? "#00ff00" : "#008800",
      },
    }),
    [isDark]
  );

  const careerTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    let totalGames = 0;

    data.forEach((season: SeasonData) => {
      season.games.forEach((game: GameStat) => {
        totalGames += 1;
        Object.keys(game).forEach((key) => {
          if (key !== "date") {
            totals[key] =
              (totals[key] || 0) + parseFloat((game[key] || 0).toString());
          }
        });
      });
    });

    totals["games"] = totalGames;
    return totals;
  }, [data]);

  const groupStatKeys: Record<string, string[]> = {
    Passing: [
      "passing_attempts",
      "completion_pct",
      "yards_passing",
      "yards_per_pass_avg",
      "passing_touchdowns",
      "interceptions",
      "sacks",
      "quaterback_rating",
    ],
    Rushing: [
      "rushing_attempts",
      "yards_rushing",
      "yards_per_rush_avg",
      "rushing_touchdowns",
      "longest_rush",
      "yards_per_game_rushing",
      "fumbles",
    ],
    Receiving: [
      "receptions",
      "receiving_targets",
      "receiving_yards",
      "yards_per_reception_avg",
      "receiving_touchdowns",
      "yards_after_catch",
      "fumbles",
    ],
    Defense: [
      "total_tackles",
      "sacks_defense",
      "interceptions_defense",
      "passes_defended",
      "forced_fumbles",
      "fumbles_recovered",
      "tackles_for_loss",
    ],
    Returning: [
      "kickoff_returned_attempts",
      "kickoff_return_yards",
      "yards_per_kickoff_avg",
      "kickoff_return_touchdowns",
      "punts_returned",
      "yards_returned_on_punts",
      "punt_return_touchdowns",
    ],
  };

  const statKeys = useMemo(() => {
    return groupStatKeys[selectedGroup] || [];
  }, [selectedGroup]);

  return (
    <>
      <Dropdown
        options={statGroups.map((g) => ({ label: g, value: g }))}
        selectedValue={selectedGroup}
        onSelect={setSelectedGroup}
        isDark={isDark}
        style={{ position: "absolute", alignSelf: "flex-end", top: -5 }}
      />
      <View
        style={{ flexDirection: "column", borderRadius: 4, overflow: "hidden" }}
      >
        <View style={{ flexDirection: "row", marginTop: 8 }}>
          <View
            style={{
              borderTopLeftRadius: 8,
              borderBottomLeftRadius: 8,
              overflow: "hidden",
              backgroundColor: isDark
                ? Colors.dark.background
                : Colors.light.background,
            }}
          >
            <View style={[styles.row, styles.headerRow, styles.seasonCell]}>
              <Text style={[styles.seasonHeaderCell, styles.headerCell]}>
                Season
              </Text>
            </View>
            {(loading ? Array(3).fill(null) : data).map(
              (seasonData: SeasonData | null, idx: number) => {
                const seasonName = seasonData?.season || "—";
                const rowStyle = [idx % 2 === 1 && dynamicStyles.rowOdd];
                return (
                  <View key={idx} style={[styles.seasonCell, rowStyle]}>
                    <Text style={styles.seasons}>{seasonName}</Text>
                  </View>
                );
              }
            )}
            <View style={[styles.seasonCell, dynamicStyles.careerRow]}>
              <Text style={[styles.cell, styles.careerHeaderCell]}>Career</Text>
            </View>
          </View>

          <ScrollView horizontal>
            <View style={styles.container}>
              <View style={[styles.row, styles.headerRow, styles.seasonCell]}>
                {statKeys.map((key, i) => (
                  <Text key={i} style={[styles.cell, styles.headerCell]}>
                    {formatNFLStat(selectedGroup, key, undefined, true)}
                  </Text>
                ))}
              </View>

              {(loading ? Array(3).fill(null) : data).map(
                (seasonData: SeasonData | null, idx: number) => {
                  const rowStyle = [
                    styles.row,
                    idx % 2 === 1 && dynamicStyles.rowOdd,
                  ];
                  return (
                    <View key={idx} style={rowStyle}>
                      {statKeys.map((key, i) => {
                        if (!seasonData)
                          return (
                            <Text key={i} style={[styles.cell]}>
                              —
                            </Text>
                          );

                        if (
                          selectedGroup === "Passing" &&
                          key === "passing_attempts"
                        ) {
                          const totalAtt = seasonData.games.reduce(
                            (sum: number, g: GameStat) =>
                              sum + Number(g.passing_attempts || 0),
                            0
                          );
                          const totalCmp = seasonData.games.reduce(
                            (sum: number, g: GameStat) =>
                              sum + Number(g.completions || 0),
                            0
                          );
                          return (
                            <Text key={i} style={[styles.cell]}>
                              {`${parseInt(totalCmp.toString(), 10)}/${parseInt(
                                totalAtt.toString(),
                                10
                              )}`}
                            </Text>
                          );
                        }

                        const total = seasonData.games.reduce(
                          (sum: number, g: GameStat) =>
                            sum + (Number(g[key]) || 0),
                          0
                        );
                        const avg =
                          seasonData.games.length > 0
                            ? total / seasonData.games.length
                            : 0;

                        let value: string | number;
                        if (
                          key.includes("pct") ||
                          key.includes("avg") ||
                          key.includes("rating")
                        ) {
                          value = avg.toFixed(1);
                        } else {
                          value = Math.round(avg);
                        }

                        return (
                          <Text key={i} style={[styles.cell]}>
                            {value}
                          </Text>
                        );
                      })}
                    </View>
                  );
                }
              )}

              <View style={[styles.row, dynamicStyles.careerRow]}>
                {statKeys.map((key, i) => {
                  let value = safeDivide(
                    careerTotals[key] ?? 0,
                    careerTotals["games"] ?? 1
                  );
                  if (value === "NaN" || value === "Infinity") value = "0.0";
                  return (
                    <Text key={i} style={[styles.cell, styles.headerCell]}>
                      {value}
                    </Text>
                  );
                })}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </>
  );
}

const statsTableStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      overflow: "hidden",
      flexDirection: "column",
      borderTopRightRadius: 8,
      borderBottomRightRadius: 8,
    },
    headerRow: {
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    row: {
      flexDirection: "row",
      paddingVertical: 8,
      alignItems: "center",
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderBottomWidth: 1,
    },
    cell: {
      minWidth: 60,
      flex: 1,
      textAlign: "center",
      fontSize: 14,
      fontFamily: Fonts.OSMEDIUM,
      paddingHorizontal: 4,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    seasonHeaderCell: {
      minWidth: 60,
      flex: 1,
      fontSize: 14,
      fontFamily: Fonts.OSMEDIUM,
      paddingHorizontal: 4,
      color: isDark ? Colors.white : Colors.black,
    },
    careerHeaderCell: {
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "left",
    },
    headerCell: {
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.white : Colors.black,
    },
    seasonCell: {
      minWidth: 80,
      justifyContent: "center",
      paddingHorizontal: 4,
      paddingVertical: 8,
      flexDirection: "row",
      alignItems: "center",
      color: isDark ? Colors.white : Colors.black,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderBottomWidth: 1,
    },
    seasons: {
      minWidth: 60,
      flex: 1,
      textAlign: "left",
      fontSize: 14,
      fontFamily: Fonts.OSMEDIUM,
      paddingHorizontal: 4,
      color: isDark ? Colors.white : Colors.black,
    },
  });
