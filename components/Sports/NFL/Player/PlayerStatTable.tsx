import { Dropdown } from "components/Dropdown";
import HeadingTwo from "components/Headings/HeadingTwo";
import PlayerStatTableSkeleton from "components/Sports/NBA/Player/PlayerStatsTableSkeleton";
import { Colors, globalStyles } from "constants/Styles";
import {
  PlayerSeasonStat,
  Props,
  useNFLPlayerSeasons,
} from "hooks/NFLHooks/useNFLPlayerSeasons";
import { useMemo, useState } from "react";
import { ScrollView, Text, useColorScheme, View } from "react-native";
import { statsTableStyles } from "styles/PlayerStyles/StatsTableStyles";

const safeDivide = (num: number | null | undefined, denom: number) =>
  denom === 0 || num == null ? "0.0" : (num / denom).toFixed(1);

const chunk = <T,>(arr: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

export default function PlayerStatTable({ playerId }: Props) {
  const { careerStats, loading, error } = useNFLPlayerSeasons(playerId);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = statsTableStyles(isDark);
  const global = globalStyles(isDark);

  const statGroups = [
    "Passing",
    "Rushing",
    "Receiving",
    "Defense",
    "Kicking",
    "Punting",
    "Returns",
  ];
  const [selectedGroup, setSelectedGroup] = useState("Passing");

  // Dynamic stat keys for selected group
  const statKeys = useMemo(() => {
    const keys = new Set<string>();
    Object.values(careerStats).forEach((seasonData) => {
      seasonData.stats[selectedGroup]?.forEach((s) => keys.add(s.statId));
    });
    return Array.from(keys);
  }, [careerStats, selectedGroup]);

  // Career totals
  const careerTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    let totalGames = 0;

    Object.values(careerStats).forEach((data) => {
      const stats: PlayerSeasonStat[] = data.stats[selectedGroup] || [];
      totalGames += stats.length;

      stats.forEach((stat) => {
        totals[stat.statId] =
          (totals[stat.statId] || 0) + Number(stat.value || 0);
      });
    });

    totals["games"] = totalGames;
    return totals;
  }, [careerStats, selectedGroup]);

  // Highlight best season based on first stat (e.g., passing yards)
  const bestSeason = useMemo(() => {
    let best: string | null = null;
    let max = -1;

    Object.entries(careerStats).forEach(([season, data]) => {
      const stats = data.stats[selectedGroup] || [];
      const primaryStat = stats[0]?.value ? Number(stats[0].value) : 0;
      if (primaryStat > max) {
        max = primaryStat;
        best = season;
      }
    });

    return best;
  }, [careerStats, selectedGroup]);

  if (loading) return;

  <View style={styles.container}>
    <PlayerStatTableSkeleton />;
  </View>;

  if (error) return <Text style={global.errorText}>{error}</Text>;
  if (!Object.keys(careerStats).length)
    return <Text style={global.errorText}>No stats available</Text>;

  return (
    <View style={styles.container}>
      <HeadingTwo>Career Stats</HeadingTwo>

      <Dropdown
        options={statGroups.map((g) => ({ label: g, value: g }))}
        selectedValue={selectedGroup}
        onSelect={setSelectedGroup}
        isDark={isDark}
        absolute
      />

      {/* Stats Table */}
      <View style={styles.tableWrapper}>
        {/* Season Column */}
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
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.seasonHeaderCell, styles.headerCell]}>
              Season
            </Text>
          </View>

          {Object.keys(careerStats).map((season, idx) => {
            const isAlt = idx % 2 === 1;
            const zebra = isAlt
              ? isDark
                ? styles.rowAltDark
                : styles.rowAltLight
              : null;
            const highlight = season === bestSeason ? styles.best : null;

            return (
              <View key={season} style={[styles.row, zebra, highlight]}>
                <Text style={styles.seasonText}>{season}</Text>
              </View>
            );
          })}

          <View style={[styles.row, styles.careerRow]}>
            <Text style={styles.careerHeaderCell}>Career</Text>
          </View>
        </View>

        {/* Stats Columns */}
        <ScrollView horizontal>
          <View>
            {/* Header */}
            <View style={[styles.row, styles.headerRow]}>
              {statKeys.map((key, i) => {
                let abbr = key.toUpperCase();
                for (const seasonData of Object.values(careerStats)) {
                  const stat = seasonData.stats[selectedGroup]?.find(
                    (s) => s.statId.toLowerCase() === key.toLowerCase()
                  );
                  if (stat?.abbreviation) {
                    abbr = stat.abbreviation;
                    break;
                  }
                }
                return (
                  <Text key={i} style={[styles.cell, styles.headerCell]}>
                    {abbr}
                  </Text>
                );
              })}
            </View>

            {/* Season Rows */}
            {Object.entries(careerStats).map(([season, data], idx) => {
              const isAlt = idx % 2 === 1;
              const zebra = isAlt
                ? isDark
                  ? styles.rowAltDark
                  : styles.rowAltLight
                : null;
              const highlight = season === bestSeason ? styles.best : null;

              return (
                <View key={season} style={[styles.row, zebra, highlight]}>
                  {statKeys.map((key, i) => {
                    const stat = data.stats[selectedGroup]?.find(
                      (s) => s.statId.toLowerCase() === key.toLowerCase()
                    );
                    return (
                      <Text key={i} style={styles.cell}>
                        {stat?.value ?? "0"}
                      </Text>
                    );
                  })}
                </View>
              );
            })}

            {/* Career Totals */}
            <View style={[styles.row, styles.careerRow]}>
              {statKeys.map((key, i) => (
                <Text key={i} style={styles.careerCell}>
                  {safeDivide(
                    careerTotals[key] ?? 0,
                    careerTotals["games"] || 1
                  )}
                </Text>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* --- Stat Glossary --- */}
      <View style={styles.glossaryContainer}>
        <Text style={styles.headerName}>Stat Glossary</Text>

        {chunk(statKeys, 2).map((row, rowIdx) => (
          <View
            key={rowIdx}
            style={{
              flexDirection: "row",
            }}
          >
            {row.map((key, colIdx) => {
              let displayName = key;
              let abbr = key.toUpperCase();

              for (const seasonData of Object.values(careerStats)) {
                const stat = seasonData.stats[selectedGroup]?.find(
                  (s) => s.statId.toLowerCase() === key.toLowerCase()
                );
                if (stat) {
                  displayName = stat.displayName;
                  if (stat.abbreviation) abbr = stat.abbreviation;
                  break;
                }
              }

              const isAlt = rowIdx % 2 === 1;
              const backgroundColor = isAlt
                ? isDark
                  ? Colors.dark.itemBackground
                  : Colors.light.itemBackground
                : "transparent";

              return (
                <View
                  key={key}
                  style={{
                    flex: 1, // 👈 exactly 2 columns
                    flexDirection: "row",
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    backgroundColor,
                    borderRightWidth: colIdx === 0 ? 1 : 0,
                    borderRightColor: isDark
                      ? Colors.darkGray
                      : Colors.lightGray,
                  }}
                >
                  <Text style={styles.glossaryAbbr}>{abbr}</Text>

                  <Text style={styles.glossaryDisplayName}>{displayName}</Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}