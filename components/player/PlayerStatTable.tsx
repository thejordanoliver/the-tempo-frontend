import { Dropdown } from "components/Dropdown";
import HeadingTwo from "components/Headings/HeadingTwo";
import PlayerStatTableSkeleton from "components/Player/PlayerStatsTableSkeleton";
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { usePlayerSeasons } from "hooks/usePlayerSeasons";
import { useMemo, useState } from "react";

import {
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

interface Props {
  playerId: number;
}
type StatView = "totals" | "per36";

const STAT_OPTIONS = [
  { label: "Totals", value: "totals" },
  { label: "Per 36 Minutes", value: "per36" },
];

const safeDivide = (num: number | null = 0, denom: number | null = 0) =>
  !denom ? "0.0" : (num! / denom!).toFixed(1);

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
  const displayedSeasons = statView === "per36" ? per36 : seasons;

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

  if (loading) return <PlayerStatTableSkeleton />;
  if (error) return <Text style={styles.error}>Failed to load stats</Text>;
  if (!seasons.length) return <Text>No stats available</Text>;

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
            <Text style={[styles.cell, styles.headerCell]}>Season</Text>
          </View>

          {seasons.map((s, i) => {
            const isAlt = i % 2 === 1;

            const zebra = isAlt
              ? isDark
                ? styles.rowAltDark
                : styles.rowAltLight
              : null;

            const highlight =
              s.season === bestSeason
                ? isDark
                  ? styles.bestDark
                  : styles.bestLight
                : null;

            return (
              <View key={s.season} style={[styles.row, zebra, highlight]}>
                <Text style={styles.seasonText}>{s.season}</Text>
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
            <View style={[styles.row, styles.headerRow]}>
              {[
                "TEAM",
                "GP",
                "PTS",
                "MIN",
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

              const highlight =
                s.season === bestSeason
                  ? isDark
                    ? styles.bestDark
                    : styles.bestLight
                  : null;

              return (
                <View key={s.season} style={[styles.row, zebra, highlight]}>
                  <Text style={styles.cell}>{s.team}</Text>

                  {/* GP stays GP */}
                  <Text style={styles.cell}>{s.g}</Text>

                  {/* PTS */}
                  <Text style={styles.cell}>
                    {statView === "per36"
                      ? per36(s.pts, s.mp)
                      : safeDivide(s.pts, s.g)}
                  </Text>

                  {/* MIN */}
                  <Text style={styles.cell}>
                    {statView === "per36" ? "36.0" : safeDivide(s.mp, s.g)}
                  </Text>

                  {/* FG / FGA */}
                  <Text style={styles.cell}>
                    {statView === "per36" ? per36(s.fg, s.mp) : s.fg}
                  </Text>
                  <Text style={styles.cell}>
                    {statView === "per36" ? per36(s.fga, s.mp) : s.fga}
                  </Text>

                  {/* FG% unchanged */}
                  <Text style={styles.cell}>{pct(s.fg_pct)}</Text>

                  {/* 3P / 3PA */}
                  <Text style={styles.cell}>
                    {statView === "per36" ? per36(s.three_p, s.mp) : s.three_p}
                  </Text>
                  <Text style={styles.cell}>
                    {statView === "per36"
                      ? per36(s.three_pa, s.mp)
                      : s.three_pa}
                  </Text>

                  {/* 3P% unchanged */}
                  <Text style={styles.cell}>{pct(s.three_pct)}</Text>

                  {/* FT / FTA */}
                  <Text style={styles.cell}>
                    {statView === "per36" ? per36(s.ft, s.mp) : s.ft}
                  </Text>
                  <Text style={styles.cell}>
                    {statView === "per36" ? per36(s.fta, s.mp) : s.fta}
                  </Text>

                  {/* FT% unchanged */}
                  <Text style={styles.cell}>{pct(s.ft_pct)}</Text>

                  {/* REB / AST / STL / BLK / TO */}
                  <Text style={styles.cell}>
                    {statView === "per36" ? per36(s.trb, s.mp) : s.trb}
                  </Text>
                  <Text style={styles.cell}>
                    {statView === "per36" ? per36(s.ast, s.mp) : s.ast}
                  </Text>
                  <Text style={styles.cell}>
                    {statView === "per36" ? per36(s.stl, s.mp) : s.stl}
                  </Text>
                  <Text style={styles.cell}>
                    {statView === "per36" ? per36(s.blk, s.mp) : s.blk}
                  </Text>
                  <Text style={styles.cell}>
                    {statView === "per36" ? per36(s.tov, s.mp) : s.tov}
                  </Text>

                  {/* PF */}
                  <Text style={styles.cell}>
                    {statView === "per36" ? per36(s.pf, s.mp) : s.pf}
                  </Text>
                </View>
              );
            })}

            {/* Career totals */}
            <View style={[styles.row, styles.careerRow]}>
              <Text style={styles.careerCell}>{""}</Text>
              <Text style={styles.careerCell}>{career.g}</Text>
              <Text style={styles.careerCell}>{career.pts}</Text>
              <Text style={styles.careerCell}>{career.mp}</Text>
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
    </View>
  );
}

const statsTableStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      paddingTop: 24,
      paddingHorizontal: 12,
    },

    tableWrapper: {
      flexDirection: "row",
      borderRadius: 8,
      overflow: "hidden", // 🔑 REQUIRED for clipping rows
      borderWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    headerRow: {
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    row: {
      flexDirection: "row",
      paddingVertical: 8,
      alignItems: "center",
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderBottomWidth: 1,
    },
    careerCell: {
      minWidth: 60,
      flex: 1,
      textAlign: "center",
      fontSize: 14,
      fontFamily: Fonts.OSMEDIUM,
      paddingHorizontal: 4,
      color: isDark ? Colors.black : Colors.white,
    },
    cell: {
      minWidth: 60,
      flex: 1,
      textAlign: "center",
      fontSize: 14,
      fontFamily: Fonts.OSMEDIUM,
      paddingHorizontal: 4,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    seasonHeaderCell: {
      minWidth: 60,
      flex: 1,
      fontSize: 14,
      fontFamily: Fonts.OSMEDIUM,
      paddingHorizontal: 4,
      color: isDark ? Colors.white : Colors.black,
    },
    careerHeaderCell: {
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.black : Colors.white,
      paddingHorizontal: 8,
    },
    headerCell: {
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.white : Colors.black,
      paddingHorizontal: 8,
    },
    error: {
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      textAlign: "center",
      marginVertical: 20,
      fontFamily: Fonts.OSREGULAR,
    },
    seasonCell: {
      minWidth: 80,
      justifyContent: "center",
      paddingHorizontal: 4,
      paddingVertical: 8,
      flexDirection: "row",
      alignItems: "center",
      color: isDark ? Colors.white : Colors.black,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderBottomWidth: 1,
    },
    seasons: {
      minWidth: 60,
      flex: 1,
      textAlign: "left",
      fontSize: 14,
      fontFamily: Fonts.OSMEDIUM,
      paddingHorizontal: 4,
      color: isDark ? Colors.white : Colors.black,
    },
    legendContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
      marginTop: 12,
      borderTopColor: "#ccc",
      borderTopWidth: 1,
    },
    legendContainerDark: {
      borderTopColor: Colors.white,
    },
    legendColorBox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      marginRight: 8,
    },
    legendColorBoxLight: {
      backgroundColor: "#ffd700",
    },
    legendColorBoxDark: {
      backgroundColor: "#5c4300",
    },
    legendText: {
      fontSize: 14,
      fontFamily: Fonts.OSREGULAR,
    },
    textDark: {
      color: "#eee",
    },
    legendCareerBoxLight: {
      backgroundColor: "#ccffcc",
    },
    legendCareerBoxDark: {
      backgroundColor: "#004400",
    },
    bestLight: {
      backgroundColor: "#ffd700",
    },

    bestDark: {
      backgroundColor: "#5c4300",
    },

    careerRow: {
      backgroundColor: isDark ? Colors.dark.limeGreen : Colors.light.green,
    },

    seasonText: {
      minWidth: 70,
      paddingHorizontal: 8,
      fontSize: 14,
      fontFamily: Fonts.OSMEDIUM,
      color: isDark ? Colors.white : Colors.black,
    },

    rowAltLight: {
      backgroundColor: Colors.light.itemBackground,
    },

    rowAltDark: {
      backgroundColor: Colors.dark.itemBackground,
    },
  });
