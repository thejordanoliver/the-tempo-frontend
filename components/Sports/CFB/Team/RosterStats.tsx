import CustomActivityIndicator from "components/CustomActivityIndicator";
import { Dropdown } from "components/Dropdown";
import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors, globalStyles } from "constants/Styles";
import {
  StatCategory,
  useFootballRosterStats,
} from "hooks/CFBHooks/useFootballRosterStats";
import React, { useState } from "react";
import { ScrollView, Text, useColorScheme, View } from "react-native";
import { rosterStatsStyles } from "styles/TeamStyles/RosterStatStyles";

interface CFBRosterStatsProps {
  espnID: number;
  teamID: number;
  category?: StatCategory;
  league?: "CFB" | "NFL";
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

export const FootballRosterStats: React.FC<CFBRosterStatsProps> = ({
  espnID,
  category,
  league = "CFB", // ✅ default league
}) => {
  const [viewMode, setViewMode] = useState<"team" | "players">("team");
  const isDark = useColorScheme() === "dark";
  const styles = rosterStatsStyles(isDark);
  const global = globalStyles(isDark);
  const { data, loading, error } = useFootballRosterStats(
    espnID?.toString(),
    league,
  );

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
        <CustomActivityIndicator isDark={isDark} />
      </View>
    );
  if (error)
    return (
      <View style={styles.center}>
        <Text style={global.errorText}>Error: {error}</Text>
      </View>
    );
  if (!data)
    return (
      <View style={styles.center}>
        <Text style={global.emptyText}>No stats available</Text>
      </View>
    );

  const statsToDisplay = category
    ? [data.stats[category]]
    : Object.values(data.stats);

  return (
    <View>
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
        <HeadingTwo isDark={isDark}>Team Stats</HeadingTwo>

        {/* TEAM STATS */}
        {viewMode === "team" &&
          statsToDisplay.map((cat) => (
            <View key={cat.name} style={{ marginBottom: 20 }}>
              <Text style={styles.categoryTitle}>{cat.name}</Text>
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
                          <Text style={[styles.tableCell, styles.headerText]}>
                      {stat.displayName}
                    </Text>
                    <Text style={[styles.tableCell, styles.statValue]}>
                      {stat.displayValue ?? stat.value ?? "-"}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
      </ScrollView>
    </View>
  );
};
