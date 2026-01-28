import { Dropdown } from "components/Dropdown";
import HeadingTwo from "components/Headings/HeadingTwo";
import PlayerStatTableSkeleton from "components/Sports/NBA/Player/PlayerStatsTableSkeleton";
import { usePlayerSeasons } from "hooks/usePlayerSeasons";
import { useMemo, useState } from "react";
import { statsTableStyles } from "styles/PlayerStyles/StatsTableStyles";

import { globalStyles } from "constants/Styles";
import { ScrollView, Text, useColorScheme, View } from "react-native";

interface Props {
  playerId: number;
}
type StatView = "totals" | "pergame" | "per36";

const STAT_OPTIONS = [
  { label: "Totals", value: "totals" },
  { label: "Per Game", value: "pergame" },
  { label: "Per 36 Minutes", value: "per36" },
];

const NBA_STAT_GLOSSARY = [
  { abbr: "GP", label: "Games Played" },
  { abbr: "PTS", label: "Points" },
  { abbr: "MIN", label: "Minutes Played" },
  { abbr: "FG", label: "Field Goals Made" },
  { abbr: "FGA", label: "Field Goals Attempted" },
  { abbr: "FG%", label: "Field Goal Percentage" },
  { abbr: "3P", label: "3-Point Field Goals Made" },
  { abbr: "3PA", label: "3-Point Field Goals Attempted" },
  { abbr: "3P%", label: "3-Point Percentage" },
  { abbr: "FT", label: "Free Throws Made" },
  { abbr: "FTA", label: "Free Throws Attempted" },
  { abbr: "FT%", label: "Free Throw Percentage" },
  { abbr: "REB", label: "Total Rebounds" },
  { abbr: "AST", label: "Assists" },
  { abbr: "STL", label: "Steals" },
  { abbr: "BLK", label: "Blocks" },
  { abbr: "TO", label: "Turnovers" },
  { abbr: "PF", label: "Personal Fouls" },
];

const chunk = <T,>(arr: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
};

const perGame = (stat?: number | null, g?: number | null) =>
  !g ? "0.0" : (Number(stat || 0) / g).toFixed(1);

const pct = (val?: number | string | null) =>
  val == null || isNaN(Number(val))
    ? "—"
    : `${(Number(val) * 100).toFixed(1)}%`;

export default function PlayerStatTable({ playerId }: Props) {
  const [statView, setStatView] = useState<StatView>("totals");

  const { seasons, loading, error } = usePlayerSeasons(playerId);
  const per36 = (stat?: number | null, mp?: number | null) => {
    if (!stat || !mp) return "0.0";
    return ((stat / mp) * 36).toFixed(1);
  };

  const isDark = useColorScheme() === "dark";
  const styles = statsTableStyles(isDark);
  const global = globalStyles(isDark);

  // 🔥 Best season by PPG
  const bestSeason = useMemo(() => {
    let best: string | null = null;
    let max = -1;

    seasons.forEach((s) => {
      const g = s.g ?? 0;
      const pts = s.pts ?? 0;
      const ppg = g > 0 ? pts / g : 0;

      if (ppg > max) {
        max = ppg;
        best = s.season;
      }
    });

    return best;
  }, [seasons]);

  if (loading) return;

  <View style={styles.container}>
    <PlayerStatTableSkeleton />;
  </View>;

  if (error) return <Text style={global.errorText}>Failed to load stats</Text>;
  if (!seasons.length)
    return <Text style={global.errorText}>No stats available</Text>;

  // 🧮 Career totals (season-level)
  const career = seasons.reduce(
    (acc, s) => {
      acc.g += s.g || 0;
      acc.pts += s.pts || 0;
      acc.mp += s.mp || 0;
      acc.fg += s.fg || 0;
      acc.fga += s.fga || 0;
      acc.three_p += s.three_p || 0;
      acc.three_pa += s.three_pa || 0;
      acc.ft += s.ft || 0;
      acc.fta += s.fta || 0;
      acc.trb += s.trb || 0;
      acc.ast += s.ast || 0;
      acc.stl += s.stl || 0;
      acc.blk += s.blk || 0;
      acc.tov += s.tov || 0;
      acc.pf += s.pf || 0;
      return acc;
    },
    {
      g: 0,
      pts: 0,
      mp: 0,
      fg: 0,
      fga: 0,
      three_p: 0,
      three_pa: 0,
      ft: 0,
      fta: 0,
      trb: 0,
      ast: 0,
      stl: 0,
      blk: 0,
      tov: 0,
      pf: 0,
    }
  );

  return (
    <View style={styles.container}>
      <HeadingTwo>Career Stats</HeadingTwo>
      <Dropdown
        isDark={isDark}
        options={STAT_OPTIONS}
        selectedValue={statView}
        onSelect={(value) => setStatView(value as StatView)}
        absolute
      />

      <View style={styles.tableWrapper}>
        {/* Season column */}
        <View>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.seasonHeaderCell, styles.headerCell]}>
              SEASON
            </Text>
          </View>

          {seasons.map((s, i) => {
            const isAlt = i % 2 === 1;

            const zebra = isAlt
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

          <View style={[styles.row, styles.careerRow]}>
            <Text style={styles.careerHeaderCell}>CAREER</Text>
          </View>
        </View>

        {/* Stats */}
        <ScrollView horizontal>
          <View>
            <View style={[styles.row, styles.headerRow]}>
              {[
                "TEAM",
                "AGE",
                "GP",
                "MIN",
                "PTS",
                "FG",
                "FGA",
                "FG%",
                "3P",
                "3PA",
                "3P%",
                "FT",
                "FTA",
                "FT%",
                "REB",
                "AST",
                "STL",
                "BLK",
                "TO",
                "PF",
              ].map((h) => (
                <Text key={h} style={[styles.cell, styles.headerCell]}>
                  {h}
                </Text>
              ))}
            </View>

            {seasons.map((s, i) => {
              const isAlt = i % 2 === 1;

              const zebra = isAlt
                ? isDark
                  ? styles.rowAltDark
                  : styles.rowAltLight
                : null;

              const highlight = s.season === bestSeason ? styles.best : null;

              const renderStat = (stat?: number | null) =>
                statView === "totals"
                  ? stat
                  : statView === "pergame"
                  ? perGame(stat, s.g)
                  : per36(stat, s.mp);

              return (
                <View key={s.season} style={[styles.row, zebra, highlight]}>
                  {/* TEAM */}
                  <Text style={styles.cell}>{s.team}</Text>

                  {/* AGE */}
                  <Text style={styles.cell}>{s.age}</Text>

                  {/* GP */}
                  <Text style={styles.cell}>{s.g}</Text>

                  {/* MIN */}
                  <Text style={styles.cell}>
                    {statView === "totals"
                      ? s.mp
                      : statView === "pergame"
                      ? perGame(s.mp, s.g)
                      : "36.0"}
                  </Text>

                  {/* PTS */}
                  <Text style={styles.cell}>{renderStat(s.pts)}</Text>


                  {/* FG / FGA */}
                  <Text style={styles.cell}>{renderStat(s.fg)}</Text>
                  <Text style={styles.cell}>{renderStat(s.fga)}</Text>

                  {/* FG% */}
                  <Text style={styles.cell}>{pct(s.fg_pct)}</Text>

                  {/* 3P / 3PA */}
                  <Text style={styles.cell}>{renderStat(s.three_p)}</Text>
                  <Text style={styles.cell}>{renderStat(s.three_pa)}</Text>

                  {/* 3P% */}
                  <Text style={styles.cell}>{pct(s.three_pct)}</Text>

                  {/* FT / FTA */}
                  <Text style={styles.cell}>{renderStat(s.ft)}</Text>
                  <Text style={styles.cell}>{renderStat(s.fta)}</Text>

                  {/* FT% */}
                  <Text style={styles.cell}>{pct(s.ft_pct)}</Text>

                  {/* REB / AST / STL / BLK / TO / PF */}
                  <Text style={styles.cell}>{renderStat(s.trb)}</Text>
                  <Text style={styles.cell}>{renderStat(s.ast)}</Text>
                  <Text style={styles.cell}>{renderStat(s.stl)}</Text>
                  <Text style={styles.cell}>{renderStat(s.blk)}</Text>
                  <Text style={styles.cell}>{renderStat(s.tov)}</Text>
                  <Text style={styles.cell}>{renderStat(s.pf)}</Text>
                </View>
              );
            })}

            {/* Career totals */}
            <View style={[styles.row, styles.careerRow]}>
              <Text style={styles.careerCell}>{""}</Text>
              <Text style={styles.careerCell}>{""}</Text>
              <Text style={styles.careerCell}>{career.g}</Text>
              <Text style={styles.careerCell}>{career.mp}</Text>
              <Text style={styles.careerCell}>{career.pts}</Text>
              <Text style={styles.careerCell}>{career.fg}</Text>
              <Text style={styles.careerCell}>{career.fga}</Text>
              <Text style={styles.careerCell}>
                {pct(career.fg / career.fga)}
              </Text>
              <Text style={styles.careerCell}>{career.three_p}</Text>
              <Text style={styles.careerCell}>{career.three_pa}</Text>
              <Text style={styles.careerCell}>
                {pct(career.three_p / career.three_pa)}
              </Text>
              <Text style={styles.careerCell}>{career.ft}</Text>
              <Text style={styles.careerCell}>{career.fta}</Text>
              <Text style={styles.careerCell}>
                {pct(career.ft / career.fta)}
              </Text>
              <Text style={styles.careerCell}>{career.trb}</Text>
              <Text style={styles.careerCell}>{career.ast}</Text>
              <Text style={styles.careerCell}>{career.stl}</Text>
              <Text style={styles.careerCell}>{career.blk}</Text>
              <Text style={styles.careerCell}>{career.tov}</Text>
              <Text style={styles.careerCell}>{career.pf}</Text>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* --- Stat Glossary --- */}
      <View style={styles.glossaryContainer}>
        <Text style={styles.headerName}>Stat Glossary</Text>

        {chunk(NBA_STAT_GLOSSARY, 2).map((row, rowIdx) => (
          <View
            key={rowIdx}
            style={{
              flexDirection: "row",
              marginTop: 6,
            }}
          >
            {row.map((item, colIdx) => {
              const isAlt = rowIdx % 2 === 1;

              return (
                <View
                  key={item.abbr}
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
                  <Text style={styles.glossaryAbbr}>{item.abbr}</Text>

                  <Text style={styles.glossaryDisplayName}>{item.label}</Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}
