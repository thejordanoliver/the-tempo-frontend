import { Dropdown } from "components/Dropdown";
import HeadingTwo from "components/Headings/HeadingTwo";
import PlayerStatTableSkeleton from "components/Skeletons/PlayerStatsTableSkeleton";
import { globalStyles } from "constants/Styles";
import { useCFBPlayerSeasons } from "hooks/CFBHooks/useCFBPlayerSeasons";
import { useMemo, useState } from "react";
import { ScrollView, Text, useColorScheme, View } from "react-native";
import { statsTableStyles } from "styles/PlayerStyles/StatsTableStyles";

type Props = {
  playerId: number;
};

const safeDivide = (num: number, denom: number) =>
  denom === 0 ? "0.0" : (num / denom).toFixed(1);

const chunk = <T,>(arr: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
};

export default function PlayerStatTable({ playerId }: Props) {
  const { data, player, loading, error } = useCFBPlayerSeasons(playerId);
  const isDark = useColorScheme() === "dark";
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

  /**
   * 🔑 Get seasons WITH selected category
   */
  const seasonsWithGroup = useMemo(() => {
    return data
      .map((season) => {
        const category = season.categories.find(
          (c) => c.displayName === selectedGroup,
        );
        return category
          ? {
              year: season.year,
              stats: category.stats,
            }
          : null;
      })
      .filter(Boolean) as { year: string; stats: any[] }[];
  }, [data, selectedGroup]);

  /**
   * 🔑 All stat keys for selected group
   */
  const statKeys = useMemo(() => {
    const set = new Set<string>();
    seasonsWithGroup.forEach((s) =>
      s.stats.forEach((stat) => set.add(stat.name)),
    );
    return Array.from(set);
  }, [seasonsWithGroup]);

  /**
   * 🔑 Career totals
   */
  const careerTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    let games = 0;

    seasonsWithGroup.forEach((season) => {
      const gamesStat = season.stats.find((s) => s.name === "teamGamesPlayed");
      games += Number(gamesStat?.value || 0);

      season.stats.forEach((stat) => {
        totals[stat.name] = (totals[stat.name] || 0) + Number(stat.value || 0);
      });
    });

    totals["games"] = games;
    return totals;
  }, [seasonsWithGroup]);

  /**
   * 🔑 Best season (based on first stat)
   */
  const bestSeason = useMemo(() => {
    let best: string | null = null;
    let max = -1;

    seasonsWithGroup.forEach((season) => {
      const val = Number(season.stats[0]?.value || 0);
      if (val > max) {
        max = val;
        best = season.year;
      }
    });

    return best;
  }, [seasonsWithGroup]);

  if (loading) {
    return (
      <View style={styles.container}>
        <PlayerStatTableSkeleton />
      </View>
    );
  }

  if (error) return <Text style={global.errorText}>{error}</Text>;
  if (!seasonsWithGroup.length)
    return <Text style={global.errorText}>No stats available</Text>;

  return (
    <View style={styles.container}>
      <HeadingTwo isDark={isDark}>Career Stats</HeadingTwo>

      <Dropdown
        options={statGroups.map((g) => ({ label: g, value: g }))}
        selectedValue={selectedGroup}
        onSelect={setSelectedGroup}
        isDark={isDark}
        style={{ position: "absolute", right: 0, top: 18 }}
      />

      {/* TABLE */}
      <View style={styles.tableWrapper}>
        {/* Season Column */}
        <View>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.seasonHeaderCell, styles.headerCell]}>
              Season
            </Text>
          </View>

          {seasonsWithGroup.map((season, idx) => {
            const highlight = season.year === bestSeason ? styles.best : null;

            return (
              <View key={season.year} style={[styles.row, highlight]}>
                <Text style={styles.seasonText}>{season.year}</Text>
              </View>
            );
          })}

          <View style={[styles.row, styles.careerRow]}>
            <Text style={styles.careerHeaderCell}>Career</Text>
          </View>
        </View>

        {/* Stats */}
        <ScrollView horizontal>
          <View>
            {/* Header */}
            <View style={[styles.row, styles.headerRow]}>
              {statKeys.map((key) => {
                const stat = seasonsWithGroup
                  .flatMap((s) => s.stats)
                  .find((s) => s.name === key);

                return (
                  <Text key={key} style={[styles.cell, styles.headerCell]}>
                    {stat?.abbreviation || key}
                  </Text>
                );
              })}
            </View>

            {/* Rows */}
            {seasonsWithGroup.map((season, idx) => {
              const highlight = season.year === bestSeason ? styles.best : null;

              return (
                <View key={season.year} style={[styles.row, highlight]}>
                  {statKeys.map((key) => {
                    const stat = season.stats.find((s) => s.name === key);

                    return (
                      <Text key={key} style={styles.cell}>
                        {stat?.displayValue || "0"}
                      </Text>
                    );
                  })}
                </View>
              );
            })}

            {/* Career */}
            <View style={[styles.row, styles.careerRow]}>
              {statKeys.map((key) => (
                <Text key={key} style={styles.careerCell}>
                  {safeDivide(
                    careerTotals[key] || 0,
                    careerTotals["games"] || 1,
                  )}
                </Text>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* GLOSSARY */}
      <View style={styles.glossaryContainer}>
        <Text style={styles.headerName}>Stat Glossary</Text>

        {chunk(statKeys, 2).map((row, rowIdx) => (
          <View
            key={rowIdx}
            style={{
              flexDirection: "row",
              marginTop: 6,
            }}
          >
            {row.map((key, colIdx) => {
              const isAlt = rowIdx % 2 === 1;
              const stat = seasonsWithGroup
                .flatMap((s) => s.stats)
                .find((s) => s.name === key);

              return (
                <View
                  key={key}
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    backgroundColor: isAlt
                      ? isDark
                        ? styles.rowAltDark.backgroundColor
                        : styles.rowAltLight.backgroundColor
                      : "transparent",
                    borderRightWidth: colIdx === 0 ? 1 : 0,
                    borderRightColor: isDark
                      ? "rgba(255,255,255,0.15)"
                      : "rgba(0,0,0,0.1)",
                  }}
                >
                  <Text style={styles.glossaryAbbr}>
                    {stat?.abbreviation || key}
                  </Text>
                  <Text style={styles.glossaryDisplayName}>
                    {stat?.displayName || key}
                  </Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}
