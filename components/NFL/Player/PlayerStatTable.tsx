import { Dropdown } from "components/Dropdown";
import PlayerStatTableSkeleton from "components/player/PlayerStatsTableSkeleton";
import { Fonts } from "constants/fonts";
import { usePlayerStatsBySeason } from "hooks/NFLHooks/useNFLPlayerStatsAllSeasons";
import { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

interface Props {
  playerId: number;
  seasons: string[];
}

// Helpers
const safeDivide = (num: number | null | undefined, denom: number) =>
  denom === 0 || num == null ? "0.0" : (num / denom).toFixed(1);

/**
 * ✅ Duplicate-safe stat group map.
 * Each key can belong to one or more groups.
 */
const statGroupMap: Record<string, string[]> = {
  // 🏈 Passing
  passing_attempts: ["Passing"],
  completions: ["Passing"],
  completion_pct: ["Passing"],
  yards: ["Passing"],
  yards_per_pass_avg: ["Passing"],
  yards_per_game: ["Passing"],
  longest_pass: ["Passing"],
  passing_touchdowns: ["Passing"],
  passing_touchdowns_pct: ["Passing"],
  interceptions: ["Passing"],
  interceptions_pct: ["Passing"],
  sacks: ["Passing"],
  sacked_yards_lost: ["Passing"],
  quaterback_rating: ["Passing"],

  // 🏃‍♂️ Rushing
  rushing_attempts: ["Rushing"],
  yards_rushing: ["Rushing"],
  yards_per_rush_avg: ["Rushing"],
  longest_rush: ["Rushing"],
  over_20_yards: ["Rushing", "Receiving"], // ✅ shared
  rushing_touchdowns: ["Rushing"],
  yards_per_game_rushing: ["Rushing"],
  fumbles: ["Rushing", "Receiving"], // ✅ shared
  fumbles_lost: ["Rushing", "Receiving"], // ✅ shared
  rushing_first_downs: ["Rushing"],

  // 🎯 Receiving
  receptions: ["Receiving"],
  receiving_targets: ["Receiving"],
  receiving_yards: ["Receiving"],
  yards_per_reception_avg: ["Receiving"],
  receiving_touchdowns: ["Receiving"],
  longest_reception: ["Receiving"],
  yards_per_game: ["Receiving"],
  yards_after_catch: ["Receiving"],
  receiving_first_downs: ["Receiving"],

  // 🛡 Defense
  unassisted_tackles: ["Defense"],
  assisted_tackles: ["Defense"],
  total_tackles: ["Defense"],
  sacks_defense: ["Defense"],
  yards_lost_on_sack: ["Defense"],
  tackles_for_loss: ["Defense"],
  passes_defended: ["Defense"],
  interceptions_defense: ["Defense"],
  intercepted_returned_yards: ["Defense"],
  longest_interception_return: ["Defense"],
  interceptions_returned_for_touchdowns: ["Defense"],
  forced_fumbles: ["Defense"],
  fumbles_recovered: ["Defense"],
  fumbles_returned_for_touchdowns: ["Defense"],
  blocked_kicks: ["Defense"],

  // 🌀 Returning
  kickoff_returned_attempts: ["Returning"],
  kickoff_return_yards: ["Returning"],
  yards_per_kickoff_avg: ["Returning"],
  longest_kickoff_return: ["Returning"],
  kickoff_return_touchdowns: ["Returning"],
  punts_returned: ["Returning"],
  yards_returned_on_punts: ["Returning"],
  yards_per_punt_avg: ["Returning"],
  longest_punt_return: ["Returning"],
  punt_return_touchdowns: ["Returning"],
  fair_catches: ["Returning"],
};

/** Helper to determine the group for a stat key safely */
const getStatGroup = (statName: string, contextGroup?: string) => {
  const groups = statGroupMap[statName.toLowerCase()];
  if (!groups) return undefined;
  if (contextGroup && groups.includes(contextGroup)) return contextGroup;
  return groups[0];
};

// Format headers
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
        case "yards":
          return "PASS YDS";
        case "yards_per_pass_avg":
          return "Y/A";
        case "yards_per_game":
          return "Y/G";
        case "longest_pass":
          return "LONG";
        case "passing_touchdowns":
          return "TD";
        case "passing_touchdowns_pct":
          return "TD%";
        case "interceptions":
          return "INT";
        case "interceptions_pct":
          return "INT%";
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
          return "YDS/A";
        case "longest_rush":
          return "LONG";
        case "over_20_yards":
          return "20+";
        case "rushing_touchdowns":
          return "TD";
        case "yards_per_game_rushing":
          return "Y/G";
        case "fumbles":
          return "FUM";
        case "fumbles_lost":
          return "FUML";
        case "rushing_first_downs":
          return "1ST DWNS";
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
        case "longest_reception":
          return "LONG";
        case "over_20_yards":
          return "20+";
        case "yards_per_game":
          return "Y/G";
        case "fumbles":
          return "FUM";
        case "fumbles_lost":
          return "FUML";
        case "yards_after_catch":
          return "YAC";
        case "receiving_first_downs":
          return "1ST";
        default:
          return statName;
      }

    case "defense":
      switch (name) {
        case "unassisted_tackles":
          return "UTCK";
        case "assisted_tackles":
          return "ATCK";
        case "total_tackles":
          return "TCK";
        case "sacks_defense":
          return "SCK";
        case "yards_lost_on_sack":
          return "SCKYDS";
        case "tackles_for_loss":
          return "TFL";
        case "passes_defended":
          return "PD";
        case "interceptions_defense":
          return "INT";
        case "intercepted_returned_yards":
          return "INT YDS";
        case "longest_interception_return":
          return "INTLONG";
        case "interceptions_returned_for_touchdowns":
          return "INTTD";
        case "forced_fumbles":
          return "FF";
        case "fumbles_recovered":
          return "FR";
        case "fumbles_returned_for_touchdowns":
          return "FRTD";
        case "blocked_kicks":
          return "BLK";
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
        case "longest_kickoff_return":
          return "KO LONG";
        case "kickoff_return_touchdowns":
          return "KO TD";
        case "punts_returned":
          return "PUNT ATT";
        case "yards_returned_on_punts":
          return "PUNT YDS";
        case "yards_per_punt_avg":
          return "PUNT AVG";
        case "longest_punt_return":
          return "PUNT LONG";
        case "punt_return_touchdowns":
          return "PUNT TD";
        case "fair_catches":
          return "FAIR";
        default:
          return statName;
      }

    default:
      return statName;
  }
};

export default function PlayerStatTable({ playerId, seasons }: Props) {
  const { data, loading, error } = usePlayerStatsBySeason(playerId, seasons);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [selectedGroup, setSelectedGroup] = useState("Passing");

  const statGroups = ["Passing", "Rushing", "Receiving", "Defense", "Returning"];

  const dynamicStyles = useMemo(
    () => ({
      container: {
        borderColor: isDark ? "#555" : "#ccc",
        backgroundColor: isDark ? "#222" : "#fff",
      },
      headerRow: { backgroundColor: isDark ? "#333" : "#eee" },
      rowEven: {
        backgroundColor: isDark ? "#222" : "#fff",
        borderBottomColor: isDark ? "#555" : "#ccc",
      },
      rowOdd: {
        backgroundColor: isDark ? "#2a2a2a" : "#f3f3f3",
        borderBottomColor: isDark ? "#555" : "#ccc",
      },
      highlight: { backgroundColor: "#ffd700" },
      highlightDark: { backgroundColor: "#5c4300" },
      careerRow: {
        backgroundColor: isDark ? "#004400" : "#ccffcc",
        borderTopColor: isDark ? "#00ff00" : "#008800",
      },
      textDark: { color: "#eee" },
      errorTextDark: { color: "#ff6666" },
    }),
    [isDark]
  );

  const careerTotals = useMemo(() => {
    return data.reduce((acc, season) => {
      season.games.forEach((g) => {
        Object.keys(g).forEach((key) => {
          if (key !== "date")
            acc[key] = (acc[key] || 0) + parseFloat((g[key] as any) || 0);
        });
      });
      return acc;
    }, {} as Record<string, number>);
  }, [data]);

  const bestSeason = useMemo(() => {
    let maxPPG = -Infinity;
    let best: string | null = null;
    data.forEach((season) => {
      const games = season.games.length;
      const totalPoints = season.games.reduce(
        (sum, g) => sum + ((g.points as number) || 0),
        0
      );
      const ppg = games === 0 ? 0 : totalPoints / games;
      if (ppg > maxPPG) {
        maxPPG = ppg;
        best = season.season;
      }
    });
    return best;
  }, [data]);

  if (loading) return <PlayerStatTableSkeleton />;
  if (error)
    return (
      <Text
        style={[
          styles.cell,
          styles.errorText,
          isDark && dynamicStyles.errorTextDark,
        ]}
      >
        Error loading stats
      </Text>
    );
  if (!data.length)
    return (
      <Text style={[styles.cell, isDark && dynamicStyles.textDark]}>
        No stats available
      </Text>
    );

  const statKeys = useMemo(() => {
    if (!data.length || !data[0].games.length) return [];
    let keys = Object.keys(data[0].games[0])
      .filter((k) => k !== "date")
      .filter((k) => getStatGroup(k, selectedGroup) === selectedGroup);

    if (selectedGroup === "Passing") {
      keys = keys.filter((k) => k !== "completions");
    }

    return keys;
  }, [data, selectedGroup]);

  return (
    <>
        <Dropdown
        options={statGroups.map((g) => ({ label: g, value: g }))}
        selectedValue={selectedGroup}
        onSelect={setSelectedGroup}
        isDark={isDark}
        style={{
          position: "absolute",
          alignSelf: "flex-end",
          top: -5,
        }}
      />

      <View style={{ flexDirection: "column", borderRadius: 4, overflow: "hidden" }}>
        <View style={{ flexDirection: "row", marginTop: 8 }}>
          {/* Fixed Season Column */}
          <View>
            <View style={[styles.seasonCell, dynamicStyles.headerRow]}>
              <Text
                style={[
                  styles.cell,
                  styles.headerCell,
                  isDark && dynamicStyles.textDark,
                ]}
              >
                Season
              </Text>
            </View>
            {data.map((seasonData, index) => {
              const rowStyle = [
                index % 2 === 1 ? dynamicStyles.rowOdd : dynamicStyles.rowEven,
                seasonData.season === bestSeason
                  ? isDark
                    ? dynamicStyles.highlightDark
                    : dynamicStyles.highlight
                  : {},
              ];
              return (
                <View
                  key={seasonData.season}
                  style={[styles.seasonCell, rowStyle]}
                >
                  <Text style={[styles.cell, isDark && dynamicStyles.textDark]}>
                    {seasonData.season}
                  </Text>
                </View>
              );
            })}
            <View style={[styles.seasonCell, dynamicStyles.careerRow]}>
              <Text
                style={[
                  styles.cell,
                  styles.headerCell,
                  isDark && dynamicStyles.textDark,
                ]}
              >
                Career
              </Text>
            </View>
          </View>

          {/* Stats Table */}
          <ScrollView horizontal>
            <View style={[styles.container, dynamicStyles.container]}>
              {/* Header */}
              <View style={[styles.row, dynamicStyles.headerRow]}>
                {statKeys.map((key) => (
                  <Text
                    key={key}
                    style={[
                      styles.cell,
                      styles.headerCell,
                      isDark && dynamicStyles.textDark,
                    ]}
                  >
                    {formatNFLStat(selectedGroup, key, undefined, true)}
                  </Text>
                ))}
              </View>

              {/* Season Rows */}
              {data.map((seasonData, index) => {
                const rowStyle = [
                  styles.row,
                  index % 2 === 1
                    ? dynamicStyles.rowOdd
                    : dynamicStyles.rowEven,
                  seasonData.season === bestSeason
                    ? isDark
                      ? dynamicStyles.highlightDark
                      : dynamicStyles.highlight
                    : {},
                ];
                return (
                  <View key={seasonData.season} style={rowStyle}>
                    {statKeys.map((key) => {
                      let raw = seasonData.games.reduce(
                        (sum, g) => sum + parseFloat((g[key] as any) || 0),
                        0
                      );
                      let value = raw / (seasonData.games.length || 1);

                      if (
                        key.toLowerCase().includes("pct") ||
                        key.toLowerCase().includes("avg") ||
                        key.toLowerCase().includes("rating") ||
                        key.toLowerCase().includes("sack") ||
                        key.toLowerCase().includes("loss")
                      ) {
                        value = parseFloat(value.toFixed(1));
                      } else {
                        value = Math.round(value);
                      }

                      if (
                        selectedGroup === "Passing" &&
                        key === "passing_attempts"
                      ) {
                        const totalAtt = seasonData.games.reduce(
                          (sum, g) =>
                            sum +
                            parseFloat((g["passing_attempts"] as any) || 0),
                          0
                        );
                        const totalCmp = seasonData.games.reduce(
                          (sum, g) =>
                            sum + parseFloat((g["completions"] as any) || 0),
                          0
                        );
                        return (
                          <Text
                            key={key}
                            style={[styles.cell, isDark && dynamicStyles.textDark]}
                          >
                            {`${totalCmp}/${totalAtt}`}
                          </Text>
                        );
                      }

                      return (
                        <Text
                          key={key}
                          style={[styles.cell, isDark && dynamicStyles.textDark]}
                        >
                          {value.toString()}
                        </Text>
                      );
                    })}
                  </View>
                );
              })}

              {/* Career Row */}
              <View style={[styles.row, dynamicStyles.careerRow]}>
                {statKeys.map((key) => {
                  let value = safeDivide(
                    careerTotals[key] ?? 0,
                    careerTotals["games"] ?? 1
                  );
                  return (
                    <Text
                      key={key}
                      style={[
                        styles.cell,
                        styles.headerCell,
                        isDark && dynamicStyles.textDark,
                      ]}
                    >
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

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    flexDirection: "column",
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  row: { flexDirection: "row", paddingVertical: 8, alignItems: "center" },
  cell: {
    minWidth: 60,
    flex: 1,
    textAlign: "center",
    fontSize: 14,
    fontFamily: Fonts.OSREGULAR,
    paddingHorizontal: 4,
  },
  headerCell: { fontFamily: Fonts.OSBOLD },
  seasonCell: {
    minWidth: 80,
    justifyContent: "center",
    paddingHorizontal: 4,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  errorText: { color: "#cc0000", textAlign: "center", paddingVertical: 8 },
});
