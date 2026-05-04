import CustomActivityIndicator from "components/CustomActivityIndicator";
import { Dropdown } from "components/Dropdown";
import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import {
  StatCategory,
  useFootballRosterStats,
} from "hooks/FootballHooks/useFootballRosterStats";
import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { rosterStatsStyles } from "styles/TeamStyles/RosterStatStyles";

interface CFBRosterStatsProps {
  espnID: number;
  teamID: number;
  category?: StatCategory;
  league?: "CFB" | "NFL";
}

export const FootballRosterStats: React.FC<CFBRosterStatsProps> = ({
  espnID,
  category,
  league = "CFB", // ✅ default league
}) => {
  const [viewMode, setViewMode] = useState<"team" | "players">("team");
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
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
        <CustomActivityIndicator />
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
