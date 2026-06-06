// PlayerStatTable.tsx
import PlayerStatTableSkeleton from "@/components/Skeletons/PlayerStatsTableSkeleton";
import { Dropdown } from "components/Dropdown";
import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors, globalStyles } from "constants/styles";
import { getCBBTeamByESPNId } from "constants/teamsCBB";
import { getWNBATeamByESPNId } from "constants/teamsWNBA";
import { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { statsTableStyles } from "styles/PlayerStyles/StatsTableStyles";

interface Props {
  seasonStatsFlattened: any[];
  careerStatsFlattened: any[];
  loading: boolean;
  error: string | null;
  isDark: boolean;
  isWNBA?: boolean;
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

export default function PlayerStatTable({
  seasonStatsFlattened,
  careerStatsFlattened,
  loading,
  error,
  isDark,
  isWNBA = false,
}: Props) {
  const [statView, setStatView] = useState<StatView>("totals");
  const styles = statsTableStyles(isDark);
  const global = globalStyles(isDark);

  // ------------------------------
  // BEST SEASON (TOTAL PTS)
  // ------------------------------
  const bestSeason = useMemo(() => {
    let best: number | null = null;
    let max = -Infinity;

    seasonStatsFlattened.forEach((s) => {
      if ((s.points ?? 0) > max) {
        max = s.points ?? 0;
        best = s.season;
      }
    });

    return best;
  }, [seasonStatsFlattened]);

  const renderStat = (stat?: number | null, gp?: number | null) =>
    statView === "pergame" ? perGame(stat, gp) : formatTotal(stat);

  const statLabels = [
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

  if (loading)
    return (
      <View style={global.emptyContainer}>
        <PlayerStatTableSkeleton />
      </View>
    );

  if (error)
    return (
      <View style={global.emptyContainer}>
        <Text style={global.errorText}>{error}</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <HeadingTwo isDark={isDark}>Career Stats</HeadingTwo>

      <Dropdown
        isDark={isDark}
        options={STAT_OPTIONS}
        selectedValue={statView}
        onSelect={(v) => setStatView(v as StatView)}
        style={styles.dropdown}
      />

      <View style={styles.tableWrapper}>
        {/* SEASON COLUMN */}
        <View style={styles.seasonColumn}>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.fixedCell, styles.fixedHeaderCell]}>
              SEASON
            </Text>
          </View>

          {seasonStatsFlattened.map((s, i) => {
            const zebra =
              i % 2 === 1
                ? isDark
                  ? styles.rowAltDark
                  : styles.rowAltLight
                : null;
            const highlight = s.season === bestSeason ? styles.best : null;

            return (
              <View key={s.season} style={[styles.row, zebra, highlight]}>
                <Text style={styles.fixedCell}>{s.displaySeason}</Text>
              </View>
            );
          })}

          {careerStatsFlattened.length > 0 && (
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
          )}
        </View>

        {/* TEAM COLUMN */}
        <View style={styles.teamColumn}>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.fixedTeamCell, styles.fixedHeaderCell]}>
              TEAM
            </Text>
          </View>

          {seasonStatsFlattened.map((s, i) => {
            const zebra =
              i % 2 === 1
                ? isDark
                  ? styles.rowAltDark
                  : styles.rowAltLight
                : null;
            const highlight = s.season === bestSeason ? styles.best : null;
            const team = isWNBA
              ? getWNBATeamByESPNId(s.teamId)?.code
              : getCBBTeamByESPNId(s.teamId)?.code;

            return (
              <View
                key={`${s.season}-team`}
                style={[styles.row, zebra, highlight]}
              >
                <Text style={styles.fixedTeamCell}>{team ?? "—"}</Text>
              </View>
            );
          })}

          {careerStatsFlattened.length > 0 && (
            <View style={[styles.row, styles.careerRow]}>
              <Text style={styles.fixedCareerCell}></Text>
            </View>
          )}
        </View>

        {/* STATS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.statScrollContent}>
            {/* Header */}
            <View style={[styles.row, styles.headerRow]}>
              {statLabels.map((label) => (
                <Text key={label} style={[styles.cell, styles.headerCell]}>
                  {label}
                </Text>
              ))}
            </View>

            {/* Season Rows */}
            {seasonStatsFlattened.map((s, i) => {
              const zebra =
                i % 2 === 1
                  ? isDark
                    ? styles.rowAltDark
                    : styles.rowAltLight
                  : null;
              const highlight = s.season === bestSeason ? styles.best : null;
              return (
                <View key={s.season} style={[styles.row, zebra, highlight]}>
                  <Text style={styles.cell}>{s.gamesPlayed}</Text>
                  <Text style={styles.cell}>{s.gamesStarted}</Text>
                  <Text style={styles.cell}>
                    {renderStat(s.points, s.gamesPlayed)}
                  </Text>
                  <Text style={styles.cell}>
                    {renderStat(s.assists, s.gamesPlayed)}
                  </Text>
                  <Text style={styles.cell}>
                    {renderStat(s.rebounds, s.gamesPlayed)}
                  </Text>
                  <Text style={styles.cell}>
                    {renderStat(s.steals, s.gamesPlayed)}
                  </Text>
                  <Text style={styles.cell}>
                    {renderStat(s.blocks, s.gamesPlayed)}
                  </Text>
                  <Text style={styles.cell}>{safe(s.fieldGoalPct)}</Text>
                  <Text style={styles.cell}>
                    {safe(s.threePointFieldGoalPct)}
                  </Text>
                  <Text style={styles.cell}>{safe(s.freeThrowPct)}</Text>
                  <Text style={styles.cell}>
                    {renderStat(s.turnovers, s.gamesPlayed)}
                  </Text>
                  <Text style={styles.cell}>
                    {renderStat(s.fouls, s.gamesPlayed)}
                  </Text>
                </View>
              );
            })}

            {/* Career Row */}
            {careerStatsFlattened.length > 0 &&
              (() => {
                const totalGP = careerStatsFlattened.reduce(
                  (acc, s) => acc + (s.gamesPlayed ?? 0),
                  0,
                );
                const totalGS = careerStatsFlattened.reduce(
                  (acc, s) => acc + (s.gamesStarted ?? 0),
                  0,
                );
                const totalPTS = careerStatsFlattened.reduce(
                  (acc, s) => acc + (s.points ?? 0),
                  0,
                );
                const totalREB = careerStatsFlattened.reduce(
                  (acc, s) => acc + (s.rebounds ?? 0),
                  0,
                );
                const totalAST = careerStatsFlattened.reduce(
                  (acc, s) => acc + (s.assists ?? 0),
                  0,
                );
                const totalSTL = careerStatsFlattened.reduce(
                  (acc, s) => acc + (s.steals ?? 0),
                  0,
                );
                const totalBLK = careerStatsFlattened.reduce(
                  (acc, s) => acc + (s.blocks ?? 0),
                  0,
                );
                const totalTO = careerStatsFlattened.reduce(
                  (acc, s) => acc + (s.turnovers ?? 0),
                  0,
                );
                const totalPF = careerStatsFlattened.reduce(
                  (acc, s) => acc + (s.fouls ?? 0),
                  0,
                );

                const fgPercent = safe(
                  careerStatsFlattened.reduce(
                    (acc, s) => acc + (s.fieldGoalPct ?? 0),
                    0,
                  ) / careerStatsFlattened.length,
                );
                const threePPercent = safe(
                  careerStatsFlattened.reduce(
                    (acc, s) => acc + (s.threePointFieldGoalPct ?? 0),
                    0,
                  ) / careerStatsFlattened.length,
                );
                const ftPercent = safe(
                  careerStatsFlattened.reduce(
                    (acc, s) => acc + (s.freeThrowPct ?? 0),
                    0,
                  ) / careerStatsFlattened.length,
                );

                return (
                  <View style={[styles.row, styles.careerRow]}>
                    <Text style={styles.careerCell}>{totalGP}</Text>
                    <Text style={styles.careerCell}>{totalGS}</Text>
                    <Text style={styles.careerCell}>
                      {statView === "pergame"
                        ? perGame(totalPTS, totalGP)
                        : totalPTS}
                    </Text>
                    <Text style={styles.careerCell}>
                      {statView === "pergame"
                        ? perGame(totalAST, totalGP)
                        : totalAST}
                    </Text>
                    <Text style={styles.careerCell}>
                      {statView === "pergame"
                        ? perGame(totalREB, totalGP)
                        : totalREB}
                    </Text>
                    <Text style={styles.careerCell}>
                      {statView === "pergame"
                        ? perGame(totalSTL, totalGP)
                        : totalSTL}
                    </Text>
                    <Text style={styles.careerCell}>
                      {statView === "pergame"
                        ? perGame(totalBLK, totalGP)
                        : totalBLK}
                    </Text>
                    <Text style={styles.careerCell}>{fgPercent}</Text>
                    <Text style={styles.careerCell}>{threePPercent}</Text>
                    <Text style={styles.careerCell}>{ftPercent}</Text>
                    <Text style={styles.careerCell}>
                      {statView === "pergame"
                        ? perGame(totalTO, totalGP)
                        : totalTO}
                    </Text>
                    <Text style={styles.careerCell}>
                      {statView === "pergame"
                        ? perGame(totalPF, totalGP)
                        : totalPF}
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
