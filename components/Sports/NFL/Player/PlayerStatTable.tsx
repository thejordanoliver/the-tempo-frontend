import { getCFBTeam } from "@/constants/teamsCFB";
import { Dropdown } from "components/Dropdown";
import HeadingTwo from "components/Headings/HeadingTwo";
import PlayerStatTableSkeleton from "components/Skeletons/PlayerStatsTableSkeleton";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { statsTableStyles } from "styles/PlayerStyles/StatsTableStyles";

type Stat = {
  name: string;
  label?: string;
  value: number | null;
  displayValue: string;
  displayName?: string;
  description?: string;
};

type Category = {
  name: string;
  displayName: string;
  stats: Stat[];
};

type Season = {
  year: string;
  season?: number;
  displaySeason?: string;
  teamId?: string;
  espnTeamId?: string;
  teamSlug?: string;
  position?: string;
  seasonType?: number;
  seasonTypeName?: string;
  categories: Category[];
};

type Props = {
  data: Season[];
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

const isRateStat = (key: string) =>
  /pct|percentage|avg|average|rating|per/i.test(key);

const isMaxStat = (key: string) => /long/i.test(key);

const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  totals: "Totals",
  passing: "Passing",
  rushing: "Rushing",
  receiving: "Receiving",
  defensive: "Defense",
  defensiveInterceptions: "Defensive Interceptions",
  returning: "Returns",
  scoring: "Scoring",
  kicking: "Kicking",
  punting: "Punting",
  averages: "Averages",
  general: "General",
};

function getSeasonTeamCode(season: Season) {
  const localTeam = season.teamId ? getCFBTeam(Number(season.teamId)) : null;
  const espnTeam = season.espnTeamId
    ? getCFBTeam(Number(season.espnTeamId))
    : null;

  return localTeam?.code || espnTeam?.code || "—";
}

function getOrderedStatGroups(position?: string) {
  const base = [
    "Totals",
    "Passing",
    "Rushing",
    "Receiving",
    "Defense",
    "Defensive Interceptions",
    "Returns",
    "Scoring",
    "Kicking",
    "Punting",
    "Averages",
    "General",
  ];

  if (!position) return base;

  const pos = position.toUpperCase();

  if (pos === "QB") {
    return [
      "Passing",
      "Rushing",
      "Totals",
      ...base.filter((g) => !["Passing", "Rushing", "Totals"].includes(g)),
    ];
  }

  if (pos === "RB") {
    return [
      "Rushing",
      "Receiving",
      "Returns",
      "Scoring",
      "Totals",
      ...base.filter(
        (g) =>
          !["Rushing", "Receiving", "Returns", "Scoring", "Totals"].includes(g),
      ),
    ];
  }

  if (["WR", "TE"].includes(pos)) {
    return [
      "Receiving",
      "Rushing",
      "Returns",
      "Scoring",
      "Totals",
      ...base.filter(
        (g) =>
          !["Receiving", "Rushing", "Returns", "Scoring", "Totals"].includes(g),
      ),
    ];
  }

  if (
    [
      "DB",
      "CB",
      "S",
      "FS",
      "SS",
      "LB",
      "DE",
      "DT",
      "DL",
      "OLB",
      "ILB",
    ].includes(pos)
  ) {
    return [
      "Defense",
      "Defensive Interceptions",
      "Totals",
      ...base.filter(
        (g) => !["Defense", "Defensive Interceptions", "Totals"].includes(g),
      ),
    ];
  }

  if (pos === "K") {
    return [
      "Kicking",
      "Scoring",
      "Totals",
      ...base.filter((g) => !["Kicking", "Scoring", "Totals"].includes(g)),
    ];
  }

  if (pos === "P") {
    return [
      "Punting",
      "Totals",
      ...base.filter((g) => !["Punting", "Totals"].includes(g)),
    ];
  }

  return base;
}

const defaultStatKeys: Record<string, string[]> = {
  Totals: ["totalTouchdowns", "totalPoints"],
  Passing: [
    "passingYards",
    "passingTouchdowns",
    "interceptions",
    "passCompletions",
    "passAttempts",
  ],
  Rushing: [
    "rushingAttempts",
    "rushingYards",
    "yardsPerRushAttempt",
    "rushingTouchdowns",
    "longRushing",
  ],
  Receiving: [
    "receptions",
    "receivingYards",
    "yardsPerReception",
    "receivingTouchdowns",
    "longReception",
  ],
  Defense: [
    "totalTackles",
    "soloTackles",
    "assistTackles",
    "sacks",
    "interceptions",
    "passesDefended",
    "fumblesForced",
  ],
  "Defensive Interceptions": [
    "interceptions",
    "interceptionYards",
    "interceptionTouchdowns",
  ],
  Scoring: [
    "totalPoints",
    "totalTouchdowns",
    "rushingTouchdowns",
    "receivingTouchdowns",
    "passingTouchdowns",
    "returnTouchdowns",
  ],
  Kicking: ["fieldGoals", "kickExtraPoints"],
  Punting: ["punts", "puntYards", "puntAvg"],
  Returns: [
    "kickReturns",
    "kickReturnYards",
    "longKickReturn",
    "puntReturns",
    "puntReturnYards",
    "longPuntReturn",
  ],
  Averages: ["yardsPerRushAttempt", "yardsPerReception"],
  General: [],
};

function normalizeCategoryDisplayName(category: Category) {
  return (
    CATEGORY_DISPLAY_NAMES[category.name] ||
    category.displayName ||
    category.name
  );
}

function getNumericValue(stat?: Stat) {
  if (!stat) return 0;

  if (typeof stat.value === "number" && Number.isFinite(stat.value)) {
    return stat.value;
  }

  const parsed = Number(String(stat.displayValue || "").replace(/,/g, ""));

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCareerValue(key: string, values: number[]) {
  if (isRateStat(key)) return "—";

  if (isMaxStat(key)) {
    const max = values.length ? Math.max(...values) : 0;
    return Number.isInteger(max) ? String(max) : max.toFixed(1);
  }

  const total = values.reduce((sum, value) => sum + value, 0);

  return Number.isInteger(total) ? String(total) : total.toFixed(1);
}

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

  const availableGroups = useMemo(() => {
    const ordered = getOrderedStatGroups(position);

    const actualGroups = new Set<string>();

    data.forEach((season) => {
      season.categories?.forEach((category) => {
        if (category?.stats?.length > 0) {
          actualGroups.add(normalizeCategoryDisplayName(category));
        }
      });
    });

    const orderedGroups = ordered.filter((group) => actualGroups.has(group));
    const extraGroups = Array.from(actualGroups).filter(
      (group) => !orderedGroups.includes(group),
    );

    return orderedGroups.length ? [...orderedGroups, ...extraGroups] : ordered;
  }, [data, position]);

  const [selectedGroup, setSelectedGroup] = useState<string>("");

  useEffect(() => {
    if (!availableGroups.length) return;

    if (!selectedGroup || !availableGroups.includes(selectedGroup)) {
      setSelectedGroup(availableGroups[0]);
    }
  }, [availableGroups, selectedGroup]);

  const activeGroup = selectedGroup || availableGroups[0];

  const seasonsWithGroup = useMemo(() => {
    return data.map((season) => {
      const category = season.categories?.find(
        (c) => normalizeCategoryDisplayName(c) === activeGroup,
      );

      return {
        year: season.displaySeason || season.year,
        seasonNumber: season.season,
        teamId: season.teamId,
        espnTeamId: season.espnTeamId,
        teamCode: getSeasonTeamCode(season),
        stats: category?.stats || [],
      };
    });
  }, [data, activeGroup]);

  const statKeys = useMemo(() => {
    const set = new Set<string>();

    seasonsWithGroup.forEach((season) => {
      season.stats.forEach((stat) => {
        if (stat?.name) set.add(stat.name);
      });
    });

    if (set.size === 0) {
      (defaultStatKeys[activeGroup] || []).forEach((key) => set.add(key));
    }

    return Array.from(set);
  }, [seasonsWithGroup, activeGroup]);

  const careerValues = useMemo(() => {
    const values: Record<string, number[]> = {};

    statKeys.forEach((key) => {
      values[key] = seasonsWithGroup.map((season) => {
        const stat = season.stats.find((s) => s.name === key);
        return getNumericValue(stat);
      });
    });

    return values;
  }, [seasonsWithGroup, statKeys]);

  const bestSeason = useMemo(() => {
    let best: string | null = null;
    let max = -1;

    seasonsWithGroup.forEach((season) => {
      const firstStat = season.stats[0];
      const value = getNumericValue(firstStat);

      if (value > max) {
        max = value;
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

  if (!data.length) {
    return <Text style={global.errorText}>No stats available</Text>;
  }

  return (
    <View style={styles.container}>
      <HeadingTwo isDark={isDark}>Career Stats</HeadingTwo>

      <Dropdown
        options={availableGroups.map((group) => ({
          label: group,
          value: group,
        }))}
        selectedValue={activeGroup}
        onSelect={setSelectedGroup}
        isDark={isDark}
        style={{ position: "absolute", right: 0, top: 18 }}
      />

      <View style={styles.tableWrapper}>
        <View style={styles.seasonColumn}>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.fixedCell, styles.fixedHeaderCell]}>SEASON</Text>
          </View>

          {seasonsWithGroup.map((season, index) => {
            const zebra =
              index % 2 === 1
                ? isDark
                  ? styles.rowAltDark
                  : styles.rowAltLight
                : null;
            const highlight = season.year === bestSeason ? styles.best : null;
            const rowKey = `${season.year}-${season.teamCode}-${index}`;

            return (
              <View key={rowKey} style={[styles.row, zebra, highlight]}>
                <Text style={styles.fixedCell}>{season.year}</Text>
              </View>
            );
          })}

          <View style={[styles.row, styles.careerRow]}>
            <Text
              style={[
                styles.fixedCell,
                styles.fixedHeaderCell,
                { color: Colors.white },
              ]}
            >
              CAREER
            </Text>
          </View>
        </View>

        <View style={styles.teamColumn}>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.fixedTeamCell, styles.fixedHeaderCell]}>
              TEAM
            </Text>
          </View>

          {seasonsWithGroup.map((season, index) => {
            const zebra =
              index % 2 === 1
                ? isDark
                  ? styles.rowAltDark
                  : styles.rowAltLight
                : null;
            const highlight = season.year === bestSeason ? styles.best : null;
            const rowKey = `${season.year}-${season.teamCode}-${index}-team`;

            return (
              <View key={rowKey} style={[styles.row, zebra, highlight]}>
                <Text style={styles.fixedTeamCell}>{season.teamCode}</Text>
              </View>
            );
          })}

          <View style={[styles.row, styles.careerRow]}>
            <Text style={styles.fixedCareerCell}></Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.statScrollContent}>
            <View style={[styles.row, styles.headerRow]}>
              {statKeys.map((key) => {
                const stat = seasonsWithGroup
                  .flatMap((season) => season.stats)
                  .find((s) => s.name === key);

                return (
                  <Text key={key} style={[styles.cell, styles.headerCell]}>
                    {stat?.label || key}
                  </Text>
                );
              })}
            </View>

            {seasonsWithGroup.map((season, index) => {
              const zebra =
                index % 2 === 1
                  ? isDark
                    ? styles.rowAltDark
                    : styles.rowAltLight
                  : null;
              const highlight = season.year === bestSeason ? styles.best : null;
              const rowKey = `${season.year}-${season.teamCode}-${index}`;

              return (
                <View key={rowKey} style={[styles.row, zebra, highlight]}>
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

            <View style={[styles.row, styles.careerRow]}>
              {statKeys.map((key) => {
                const display = formatCareerValue(key, careerValues[key] || []);

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

      <View style={styles.glossaryContainer}>
        <Text style={styles.headerName}>Stat Glossary</Text>

        {chunk(statKeys, 2).map((row, rowIdx) => (
          <View key={rowIdx} style={{ flexDirection: "row", marginTop: 6 }}>
            {row.map((key, colIdx) => {
              const isAlt = rowIdx % 2 === 1;

              const stat = seasonsWithGroup
                .flatMap((season) => season.stats)
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
                  <Text style={styles.glossaryAbbr}>{stat?.label || key}</Text>

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
