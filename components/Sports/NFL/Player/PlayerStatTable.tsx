import { Dropdown } from "components/Dropdown";
import HeadingTwo from "components/Headings/HeadingTwo";
import PlayerStatTableSkeleton from "components/Skeletons/PlayerStatsTableSkeleton";
import { globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { statsTableStyles } from "styles/PlayerStyles/StatsTableStyles";

type Props = {
  data: any[];
  loading: boolean;
  error: string | null;
  position?: string;
};

const chunk = <T,>(arr: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
};

// Stats that shouldn't be summed — show a dash in the Career row
const isRateStat = (key: string) =>
  /pct|percentage|avg|average|rating|per/i.test(key);

function getOrderedStatGroups(position?: string) {
  const base = [
    "Passing",
    "Rushing",
    "Receiving",
    "Defense",
    "Scoring",
    "Kicking",
    "Punting",
    "Returns",
  ];

  if (!position) return base;

  const pos = position.toUpperCase();

  if (pos === "QB") return ["Passing", ...base.filter((g) => g !== "Passing")];
  if (pos === "RB") return ["Rushing", ...base.filter((g) => g !== "Rushing")];
  if (["WR", "TE"].includes(pos))
    return ["Receiving", ...base.filter((g) => g !== "Receiving")];
  if (["DB", "CB", "S", "FS", "SS", "LB", "DE", "DT"].includes(pos))
    return ["Defense", ...base.filter((g) => g !== "Defense")];
  if (pos === "K") return ["Kicking"];
  if (pos === "P") return ["Punting"];

  return base;
}

// Default stats for each group (ensures table renders even if no stats exist)
const defaultStatKeys: Record<string, string[]> = {
  Passing: [
    "passAttempts",
    "passCompletions",
    "passYards",
    "passTDs",
    "interceptions",
  ],
  Rushing: ["rushAttempts", "rushYards", "rushTDs", "fumbles"],
  Receiving: ["receptions", "receivingYards", "receivingTDs", "fumbles"],
  Defense: ["tackles", "sacks", "interceptions", "forcedFumbles", "defTDs"],
  Scoring: ["points", "touchdowns"],
  Kicking: ["fgMade", "fgAttempted", "xpMade", "xpAttempted"],
  Punting: ["punts", "puntYards", "puntAvg"],
  Returns: ["kickReturns", "kickReturnYards", "puntReturns", "puntReturnYards"],
};

export default function PlayerStatTable({
  data,
  loading,
  error,
  position,
}: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = statsTableStyles(isDark);
  const global = globalStyles(isDark);

  // Determine which groups the player actually has stats for
  const availableGroups = useMemo(() => {
    const ordered = getOrderedStatGroups(position);
    const groupsWithData = ordered.filter((group) =>
      data.some((season) =>
        season.categories?.some((c: any) => c.displayName === group),
      ),
    );
    return groupsWithData.length ? groupsWithData : ordered;
  }, [data, position]);

  const [selectedGroup, setSelectedGroup] = useState(availableGroups[0]);

  useEffect(() => {
    setSelectedGroup(availableGroups[0]);
  }, [availableGroups]);

  const seasonsWithGroup = useMemo(() => {
    return data.map((season) => {
      const category = season.categories?.find(
        (c: any) => c.displayName === selectedGroup,
      );
      return {
        year: season.year,
        stats: category?.stats || [],
      };
    });
  }, [data, selectedGroup]);

  const statKeys = useMemo(() => {
    const set = new Set<string>();
    seasonsWithGroup.forEach((s) =>
      s.stats.forEach((stat: any) => set.add(stat.name)),
    );
    if (set.size === 0) {
      (defaultStatKeys[selectedGroup] || []).forEach((k) => set.add(k));
    }
    return Array.from(set);
  }, [seasonsWithGroup, selectedGroup]);

  const careerTotals = useMemo(() => {
    const totals: Record<string, number> = {};

    seasonsWithGroup.forEach((season) => {
      statKeys.forEach((key) => {
        const stat = season.stats.find((s: any) => s.name === key);
        totals[key] = (totals[key] || 0) + Number(stat?.value || 0);
      });
    });

    return totals;
  }, [seasonsWithGroup, statKeys]);

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
  if (!data.length)
    return <Text style={global.errorText}>No stats available</Text>;

  return (
    <View style={styles.container}>
      <HeadingTwo isDark={isDark}>Career Stats</HeadingTwo>

      <Dropdown
        options={availableGroups.map((g) => ({ label: g, value: g }))}
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

          {seasonsWithGroup.map((season) => {
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

        {/* Stats Columns */}
        <ScrollView horizontal>
          <View>
            {/* Header */}
            <View style={[styles.row, styles.headerRow]}>
              {statKeys.map((key) => {
                const stat = seasonsWithGroup
                  .flatMap((s) => s.stats)
                  .find((s: any) => s.name === key);
                return (
                  <Text key={key} style={[styles.cell, styles.headerCell]}>
                    {stat?.abbreviation || key}
                  </Text>
                );
              })}
            </View>

            {/* Season Rows */}
            {seasonsWithGroup.map((season) => {
              const highlight = season.year === bestSeason ? styles.best : null;
              return (
                <View key={season.year} style={[styles.row, highlight]}>
                  {statKeys.map((key) => {
                    const stat = season.stats.find((s: any) => s.name === key);
                    return (
                      <Text key={key} style={styles.cell}>
                        {stat?.displayValue || "0"}
                      </Text>
                    );
                  })}
                </View>
              );
            })}

            {/* Career Row — show totals for counting stats, dash for rate/percentage stats */}
            <View style={[styles.row, styles.careerRow]}>
              {statKeys.map((key) => {
                const total = careerTotals[key] || 0;
                const display = isRateStat(key)
                  ? "—"
                  : Number.isInteger(total)
                    ? String(total)
                    : total.toFixed(1);
                return (
                  <Text key={key} style={styles.careerCell}>
                    {display}
                  </Text>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* GLOSSARY */}
      <View style={styles.glossaryContainer}>
        <Text style={styles.headerName}>Stat Glossary</Text>

        {chunk(statKeys, 2).map((row, rowIdx) => (
          <View key={rowIdx} style={{ flexDirection: "row", marginTop: 6 }}>
            {row.map((key, colIdx) => {
              const isAlt = rowIdx % 2 === 1;
              const stat = seasonsWithGroup
                .flatMap((s) => s.stats)
                .find((s: any) => s.name === key);

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
