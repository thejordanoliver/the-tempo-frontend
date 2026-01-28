import { Dropdown } from "components/Dropdown";
import HeadingTwo from "components/Headings/HeadingTwo";
import PlayerStatTableSkeleton from "components/Sports/NBA/Player/PlayerStatsTableSkeleton";
import { useLocalSearchParams } from "expo-router";
import { useCBBPlayerSeasons, PlayerSeasonStat } from "hooks/CBBHooks/useCBBPlayerSeasons";
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

const safe = (v?: number | null) => (v == null || isNaN(v) ? "—" : Number(v).toFixed(1));
const formatTotal = (v?: number | null) => (v == null || isNaN(v) ? "—" : String(v));
const perGame = (stat?: number | null, gp?: number | null) =>
  !gp || gp === 0 ? "—" : (Number(stat || 0) / gp).toFixed(1);

export default function PlayerStatTable({ playerId }: Props) {
  const [statView, setStatView] = useState<StatView>("totals");

  const params = useLocalSearchParams<{ league?: string }>();
  const league = params.league?.toUpperCase() === "WCBB" ? "WCBB" : "CBB";

  const { player, careerStats, seasonStats, loading, error } = useCBBPlayerSeasons(playerId);

  const isDark = useColorScheme() === "dark";
  const styles = statsTableStyles(isDark);

  // ------------------------------
  // LOADING / ERROR STATES
  // ------------------------------
  if (loading)
    return (
      <View style={styles.container}>
        <PlayerStatTableSkeleton />
      </View>
    );

  if (error)
    return <Text style={[styles.cell, styles.errorText]}>Error loading stats</Text>;

  if (!careerStats?.length)
    return <Text style={styles.errorText}>No stats available</Text>;

  // ------------------------------
  // BEST SEASON (TOTAL PTS)
  // ------------------------------
  const bestSeason = useMemo(() => {
    let best: string | null = null;
    let max = -Infinity;

    seasonStats.forEach((s) => {
      if ((s.pts ?? 0) > max) {
        max = s.pts ?? 0;
        best = s.season;
      }
    });

    return best;
  }, [seasonStats]);

  // ------------------------------
  // TEAMS PLAYED COUNT
  // ------------------------------
  const teamsPlayedCount = useMemo(() => {
    const teams = new Set<string>();
    seasonStats.forEach((s) => {
      if (s.team && s.team !== "—") teams.add(s.team);
    });
    const count = teams.size;
    return count === 1 ? "1 TEAM" : `${count} TEAMS`;
  }, [seasonStats]);

  const renderStat = (stat?: number | null, gp?: number | null) =>
    statView === "pergame" ? perGame(stat, gp) : formatTotal(stat);

  const statLabels = [
    "TEAM",
    "GP",
    "GS",
    "PTS",
    "AST",
    "REB",
    "STL",
    "BLK",
    "FG%",
    "3P%",
    "FT%",
    "TO",
    "PF",
  ];

  // ------------------------------
  // UI
  // ------------------------------
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
            <Text style={[styles.seasonHeaderCell, styles.headerCell]}>SEASON</Text>
          </View>

          {seasonStats.map((s, i) => {
            const zebra = i % 2 === 1 ? (isDark ? styles.rowAltDark : styles.rowAltLight) : null;
            const highlight = s.season === bestSeason ? styles.best : null;

            return (
              <View key={s.season} style={[styles.row, zebra, highlight]}>
                <Text style={styles.seasonText}>{s.season}</Text>
              </View>
            );
          })}

          {careerStats.length > 0 && (
            <View style={[styles.row, styles.careerRow]}>
              <Text style={styles.careerHeaderCell}>CAREER</Text>
            </View>
          )}
        </View>

        {/* STATS */}
        <ScrollView horizontal>
          <View>
            {/* Header */}
            <View style={[styles.row, styles.headerRow]}>
              {statLabels.map((label) => (
                <Text key={label} style={[styles.cell, styles.headerCell]}>
                  {label}
                </Text>
              ))}
            </View>

            {/* Season Rows */}
            {seasonStats.map((s, i) => {
              const zebra = i % 2 === 1 ? (isDark ? styles.rowAltDark : styles.rowAltLight) : null;
              const highlight = s.season === bestSeason ? styles.best : null;

              return (
                <View key={s.season} style={[styles.row, zebra, highlight]}>
                  <Text style={styles.cell}>{s.team}</Text>
                  <Text style={styles.cell}>{s.gp ?? "—"}</Text>
                  <Text style={styles.cell}>{s.gs ?? "—"}</Text>
                  <Text style={styles.cell}>{renderStat(s.pts, s.gp)}</Text>
                  <Text style={styles.cell}>{renderStat(s.ast, s.gp)}</Text>
                  <Text style={styles.cell}>{renderStat(s.reb, s.gp)}</Text>
                  <Text style={styles.cell}>{renderStat(s.stl, s.gp)}</Text>
                  <Text style={styles.cell}>{renderStat(s.blk, s.gp)}</Text>
                  <Text style={styles.cell}>{safe(s["fg%"])}</Text>
                  <Text style={styles.cell}>{safe(s["3p%"])}</Text>
                  <Text style={styles.cell}>{safe(s["ft%"])}</Text>
                  <Text style={styles.cell}>{renderStat(s.to, s.gp)}</Text>
                  <Text style={styles.cell}>{renderStat(s.pf, s.gp)}</Text>
                </View>
              );
            })}

            {/* Career Row */}
          {careerStats.length > 0 && (() => {
  const totalGP = careerStats.reduce((acc, s) => acc + (s.gp ?? 0), 0) || 0;
  const totalGS = careerStats.reduce((acc, s) => acc + (s.gs ?? 0), 0) || 0;
  const totalPTS = careerStats.reduce((acc, s) => acc + (s.pts ?? 0), 0);
  const totalREB = careerStats.reduce((acc, s) => acc + (s.reb ?? 0), 0);
  const totalAST = careerStats.reduce((acc, s) => acc + (s.ast ?? 0), 0);
  const totalSTL = careerStats.reduce((acc, s) => acc + (s.stl ?? 0), 0);
  const totalBLK = careerStats.reduce((acc, s) => acc + (s.blk ?? 0), 0);
  const totalTO = careerStats.reduce((acc, s) => acc + (s.to ?? 0), 0);
  const totalPF = careerStats.reduce((acc, s) => acc + (s.pf ?? 0), 0);

  // Percentages (simple average if you don't have attempts)
  const fgPercent = safe(
    careerStats.reduce((acc, s) => acc + (s["fg%"] ?? 0), 0) /
      careerStats.length
  );
  const threePPercent = safe(
    careerStats.reduce((acc, s) => acc + (s["3p%"] ?? 0), 0) /
      careerStats.length
  );
  const ftPercent = safe(
    careerStats.reduce((acc, s) => acc + (s["ft%"] ?? 0), 0) /
      careerStats.length
  );

  return (
    <View style={[styles.row, styles.careerRow]}>
      <Text style={styles.careerCell}>{teamsPlayedCount}</Text>
      <Text style={styles.careerCell}>{totalGP}</Text>
      <Text style={styles.careerCell}>{totalGS}</Text>
      <Text style={styles.careerCell}>
        {statView === "pergame" ? perGame(totalPTS, totalGP) : totalPTS}
      </Text>
      <Text style={styles.careerCell}>
        {statView === "pergame" ? perGame(totalAST, totalGP) : totalAST}
      </Text>
      <Text style={styles.careerCell}>
        {statView === "pergame" ? perGame(totalREB, totalGP) : totalREB}
      </Text>
      <Text style={styles.careerCell}>
        {statView === "pergame" ? perGame(totalSTL, totalGP) : totalSTL}
      </Text>
      <Text style={styles.careerCell}>
        {statView === "pergame" ? perGame(totalBLK, totalGP) : totalBLK}
      </Text>
      <Text style={styles.careerCell}>{fgPercent}</Text>
      <Text style={styles.careerCell}>{threePPercent}</Text>
      <Text style={styles.careerCell}>{ftPercent}</Text>
      <Text style={styles.careerCell}>
        {statView === "pergame" ? perGame(totalTO, totalGP) : totalTO}
      </Text>
      <Text style={styles.careerCell}>
        {statView === "pergame" ? perGame(totalPF, totalGP) : totalPF}
      </Text>
    </View>
  );
})()}

          </View>
        </ScrollView>
      </View>
    </View>
  );
}
