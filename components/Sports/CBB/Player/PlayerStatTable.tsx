import { Dropdown } from "components/Dropdown";
import HeadingTwo from "components/Headings/HeadingTwo";
import PlayerStatTableSkeleton from "components/Sports/NBA/Player/PlayerStatsTableSkeleton";
import { useLocalSearchParams } from "expo-router";
import { useCBBPlayerStats } from "hooks/CBBHooks/useCBBPlayerStats";
import { useMemo, useState } from "react";
import { ScrollView, Text, useColorScheme, View } from "react-native";
import { statsTableStyles } from "styles/PlayerStyles/StatsTableStyles";

interface Props {
  playerId: number;
}

type StatView = "totals" | "pergame";

const STAT_OPTIONS = [
  { label: "Totals", value: "totals" },
  { label: "Per Game", value: "pergame" },
];

const safe = (v?: number | null) =>
  v == null || isNaN(v) ? "—" : Number(v).toFixed(1);

const formatTotal = (v?: number | null) =>
  v == null || isNaN(v) ? "—" : String(v);

const perGame = (stat?: number | null, gp?: number | null) =>
  !gp || gp === 0 ? "—" : (Number(stat || 0) / gp).toFixed(1);

const parseSeasonTeam = (season: string) => {
  const match = season.match(/^(\d{4}-\d{2})([A-Z]+)$/);

  if (!match) {
    return { year: season, team: "—" };
  }

  return {
    year: match[1], // "2023-24"
    team: match[2], // "FLA"
  };
};

export default function PlayerStatTable({ playerId }: Props) {
  const [statView, setStatView] = useState<StatView>("totals");

  const params = useLocalSearchParams<{ league?: string }>();
  const league =
    params.league === "WCBB" || params.league === "wcbb" ? "WCBB" : "CBB";

  const { data, loading, error } = useCBBPlayerStats(playerId, league);

  const isDark = useColorScheme() === "dark";
  const styles = statsTableStyles(isDark);

  /* ------------------------------
     LOADING / ERROR
  ------------------------------ */
  if (loading)
    return (
      <View style={styles.container}>
        <PlayerStatTableSkeleton />
      </View>
    );
  if (error)
    return (
      <Text style={[styles.cell, styles.errorText]}>Error loading stats</Text>
    );
  if (!data || !data.seasonTotals?.length)
    return <Text style={styles.errorText}>No stats available</Text>;

  /* ------------------------------
     DATA
  ------------------------------ */
  const seasons = data.seasonTotals.filter(
    (s) => !s.season.toLowerCase().includes("career")
  );

  const career = data.seasonTotals.find((s) =>
    s.season.toLowerCase().includes("career")
  );

  /* ------------------------------
     BEST SEASON (TOTAL PTS)
  ------------------------------ */
  const bestSeason = useMemo(() => {
    let best: string | null = null;
    let max = -Infinity;

    seasons.forEach((s) => {
      if ((s.pts ?? 0) > max) {
        max = s.pts ?? 0;
        best = s.season;
      }
    });

    return best;
  }, [seasons]);

  /* ------------------------------
     TEAMS PLAYED COUNT
  ------------------------------ */
  const teamsPlayedCount = useMemo(() => {
    const teams = new Set<string>();

    seasons.forEach((s) => {
      if (s.team && s.team !== "—") {
        teams.add(s.team);
      }
    });

    const count = teams.size;
    return count === 1 ? "1 TEAM" : `${count} TEAMS`;
  }, [seasons]);

  const renderStat = (stat?: number | null, gp?: number | null) => {
    if (statView === "pergame") return perGame(stat, gp);
    return formatTotal(stat);
  };

  const statLabels = [
    "TEAM",
    "GP",
    "GS",
    "MIN",
    "PTS",
    "REB",
    "AST",
    "STL",
    "BLK",
    "FG%",
    "3P%",
    "FT%",
    "TO",
    "PF",
  ];

  /* ------------------------------
     UI
  ------------------------------ */
  return (
    <View style={styles.container}>
      <HeadingTwo>Career Stats</HeadingTwo>

      <Dropdown
        isDark={isDark}
        options={STAT_OPTIONS}
        selectedValue={statView}
        onSelect={(v) => setStatView(v as StatView)}
        absolute
      />

      <View style={styles.tableWrapper}>
        {/* SEASON COLUMN */}
        <View>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.seasonHeaderCell, styles.headerCell]}>
              SEASON
            </Text>
          </View>

          {seasons.map((s, i) => {
            const zebra =
              i % 2 === 1
                ? isDark
                  ? styles.rowAltDark
                  : styles.rowAltLight
                : null;

            const highlight = s.season === bestSeason ? styles.best : null;

            return (
              <View key={s.season} style={[styles.row, zebra, highlight]}>
                <Text style={styles.seasonText}>{s.season}</Text>
              </View>
            );
          })}

          {career && (
            <View style={[styles.row, styles.careerRow]}>
              <Text style={styles.careerHeaderCell}>CAREER</Text>
            </View>
          )}
        </View>

        {/* STATS */}
        <ScrollView horizontal>
          <View>
            <View style={[styles.row, styles.headerRow]}>
              {statLabels.map((label) => (
                <Text key={label} style={[styles.cell, styles.headerCell]}>
                  {label}
                </Text>
              ))}
            </View>

            {seasons.map((s, i) => {
              const zebra =
                i % 2 === 1
                  ? isDark
                    ? styles.rowAltDark
                    : styles.rowAltLight
                  : null;

              const highlight = s.season === bestSeason ? styles.best : null;

              return (
                <View key={s.season} style={[styles.row, zebra, highlight]}>
                  <Text style={styles.cell}>{s.team}</Text>
                  <Text style={styles.cell}>{s.gp ?? "—"}</Text>
                  <Text style={styles.cell}>{s.gs ?? "—"}</Text>
                  <Text style={styles.cell}>{s.min}</Text>
                  <Text style={styles.cell}>{renderStat(s.pts, s.gp)}</Text>
                  <Text style={styles.cell}>{renderStat(s.reb, s.gp)}</Text>
                  <Text style={styles.cell}>{renderStat(s.ast, s.gp)}</Text>
                  <Text style={styles.cell}>{renderStat(s.stl, s.gp)}</Text>
                  <Text style={styles.cell}>{renderStat(s.blk, s.gp)}</Text>
                  <Text style={styles.cell}>{safe(s.fgPct)}</Text>
                  <Text style={styles.cell}>{safe(s.threePct)}</Text>
                  <Text style={styles.cell}>{safe(s.ftPct)}</Text>
                  <Text style={styles.cell}>{renderStat(s.to, s.gp)}</Text>
                  <Text style={styles.cell}>{renderStat(s.pf, s.gp)}</Text>
                </View>
              );
            })}

            {career && (
              <View style={[styles.row, styles.careerRow]}>
                <Text style={styles.careerCell}>{teamsPlayedCount}</Text>
                <Text style={styles.careerCell}>{career.gp ?? "—"}</Text>
                <Text style={styles.careerCell}>{career.gs ?? "—"}</Text>
                <Text style={styles.careerCell}>{career.min}</Text>
                <Text style={styles.careerCell}>{renderStat(career.pts, career.gp)}</Text>
                <Text style={styles.careerCell}>{renderStat(career.reb, career.gp)}</Text>
                <Text style={styles.careerCell}>{renderStat(career.ast, career.gp)}</Text>
                <Text style={styles.careerCell}>{renderStat(career.stl, career.gp)}</Text>
                <Text style={styles.careerCell}>{renderStat(career.blk, career.gp)}</Text>
                <Text style={styles.careerCell}>{safe(career.fgPct)}</Text>
                <Text style={styles.careerCell}>{safe(career.threePct)}</Text>
                <Text style={styles.careerCell}>{safe(career.ftPct)}</Text>
                <Text style={styles.careerCell}>{renderStat(career.to, career.gp)}</Text>
                <Text style={styles.careerCell}>{renderStat(career.pf, career.gp)}</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
