import PlayerStatTableSkeleton from "components/Player/PlayerStatsTableSkeleton";
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { useCBBPlayerStats } from "hooks/CBBHooks/useCBBPlayerStats";
import { useMemo } from "react";
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

const safe = (v: number | null) =>
  v == null || isNaN(v) ? "0.0" : Number(v).toFixed(1);

export default function PlayerStatTable({ playerId }: Props) {
  const { data, loading, error } = useCBBPlayerStats(playerId);
  const isDark = useColorScheme() === "dark";
  const styles = statsTableStyles(isDark);

  const dynamicStyles = useMemo(
    () => ({
      rowOdd: {
        backgroundColor: isDark
          ? Colors.dark.itemBackground
          : Colors.light.itemBackground,
      },
      highlight: {
        backgroundColor: "#ffd700",
      },
      highlightDark: {
        backgroundColor: "#5c4300",
      },
      careerRow: {
        backgroundColor: isDark ? "#004400" : "#ccffcc",
        borderBottomWidth: 0,
      },
    }),
    [isDark]
  );

  // ------------------------------
  //    LOADING / ERROR STATES
  // ------------------------------
  if (loading) return <PlayerStatTableSkeleton />;
  if (error)
    return (
      <Text style={[styles.cell, styles.errorText]}>Error loading stats</Text>
    );
  if (!data || !data.seasons?.length)
    return <Text style={[styles.cell]}>No stats available</Text>;

  const seasons = data.seasons;

  // ------------------------------
  //     BEST SEASON BY PPG
  // ------------------------------
  const bestSeason = useMemo(() => {
    let maxPPG = -Infinity;
    let best: string | null = null;

    for (const s of seasons) {
      const ppg = s.pts ?? 0;
      if (ppg > maxPPG) {
        maxPPG = ppg;
        best = s.season;
      }
    }
    return best;
  }, [seasons]);

  // ------------------------------
  //     CAREER TOTALS
  // ------------------------------
  const career = seasons.reduce(
    (acc, s) => {
      acc.games += s.gp ?? 0;
      acc.min += s.min ?? 0;
      acc.pts += s.pts ?? 0;
      acc.reb += s.reb ?? 0;
      acc.ast += s.ast ?? 0;
      acc.blk += s.blk ?? 0;
      acc.stl += s.stl ?? 0;
      acc.pf += s.pf ?? 0;
      acc.to += s.to ?? 0;
      return acc;
    },
    {
      games: 0,
      min: 0,
      pts: 0,
      reb: 0,
      ast: 0,
      blk: 0,
      stl: 0,
      pf: 0,
      to: 0,
    }
  );

  const statLabels = [
    "Season",
    "GP",
    "PTS",
    "MIN",
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

  // ------------------------------
  //         UI RENDER
  // ------------------------------
  return (
    <>
      <View
        style={{
          flexDirection: "row",
          borderTopLeftRadius: 8,
          borderBottomLeftRadius: 8,
        }}
      >
        {/* LEFT FIXED COLUMN */}
        <View
          style={{
            borderTopLeftRadius: 8,
            borderBottomLeftRadius: 8,
            overflow: "hidden",
          }}
        >
          <View style={[styles.row, styles.headerRow, styles.seasonCell]}>
            <Text style={[styles.seasonHeaderCell, styles.headerCell]}>
              Season
            </Text>
          </View>

          {seasons.map((s, i) => {
            const highlightStyle =
              s.season === bestSeason
                ? isDark
                  ? dynamicStyles.highlightDark
                  : dynamicStyles.highlight
                : null;

            return (
              <View
                key={s.season}
                style={[
                  styles.seasonCell,
                  i % 2 === 1 && dynamicStyles.rowOdd,
                  highlightStyle,
                ]}
              >
                <Text style={[styles.seasons]}>{s.season}</Text>
              </View>
            );
          })}

          {/* Career Label */}
          <View style={[styles.seasonCell, dynamicStyles.careerRow]}>
            <Text style={[styles.cell, styles.headerCell]}>Career</Text>
          </View>
        </View>

        {/* STATS SCROLLABLE SECTION */}
        <ScrollView
          horizontal
          style={{ borderTopRightRadius: 8, borderBottomRightRadius: 8 }}
          contentContainerStyle={{
            borderTopRightRadius: 8,
            borderBottomRightRadius: 8,
            overflow: "hidden",
          }}
        >
          <View style={styles.container}>
            {/* Header */}
            <View style={[styles.row, styles.headerRow]}>
              {statLabels.slice(1).map((label) => (
                <Text key={label} style={[styles.cell, styles.headerCell]}>
                  {label}
                </Text>
              ))}
            </View>

            {/* SEASON ROWS */}
            {seasons.map((s, i) => {
              const highlightStyle =
                s.season === bestSeason
                  ? isDark
                    ? dynamicStyles.highlightDark
                    : dynamicStyles.highlight
                  : null;

              return (
                <View
                  key={s.season}
                  style={[
                    styles.row,
                    i % 2 === 1 && dynamicStyles.rowOdd,
                    highlightStyle,
                  ]}
                >
                  <Text style={styles.cell}>{s.gp ?? 0}</Text>
                  <Text style={styles.cell}>{safe(s.pts)}</Text>
                  <Text style={styles.cell}>{safe(s.min)}</Text>
                  <Text style={styles.cell}>{safe(s.reb)}</Text>
                  <Text style={styles.cell}>{safe(s.ast)}</Text>
                  <Text style={styles.cell}>{safe(s.stl)}</Text>
                  <Text style={styles.cell}>{safe(s.blk)}</Text>
                  <Text style={styles.cell}>{safe(s.fgPct)}</Text>
                  <Text style={styles.cell}>{safe(s.threePct)}</Text>
                  <Text style={styles.cell}>{safe(s.ftPct)}</Text>
                  <Text style={styles.cell}>{safe(s.to)}</Text>
                  <Text style={styles.cell}>{safe(s.pf)}</Text>
                </View>
              );
            })}

            {/* CAREER ROW */}
            <View style={[styles.row, dynamicStyles.careerRow]}>
              <Text style={[styles.cell, styles.headerCell]}>
                {career.games}
              </Text>
              <Text style={[styles.cell, styles.headerCell]}>
                {career.pts.toFixed(1)}
              </Text>
              <Text style={[styles.cell, styles.headerCell]}>
                {career.min.toFixed(1)}
              </Text>
              <Text style={[styles.cell, styles.headerCell]}>
                {career.reb.toFixed(1)}
              </Text>
              <Text style={[styles.cell, styles.headerCell]}>
                {career.ast.toFixed(1)}
              </Text>
              <Text style={[styles.cell, styles.headerCell]}>
                {career.stl.toFixed(1)}
              </Text>
              <Text style={[styles.cell, styles.headerCell]}>
                {career.blk.toFixed(1)}
              </Text>
              <Text style={[styles.cell, styles.headerCell]}>—</Text>
              <Text style={[styles.cell, styles.headerCell]}>—</Text>
              <Text style={[styles.cell, styles.headerCell]}>—</Text>
              <Text style={[styles.cell, styles.headerCell]}>
                {career.to.toFixed(1)}
              </Text>
              <Text style={[styles.cell, styles.headerCell]}>
                {career.pf.toFixed(1)}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* LEGEND */}
      <View
        style={[styles.legendContainer, isDark && styles.legendContainerDark]}
      >
        <View
          style={[
            styles.legendColorBox,
            isDark ? styles.legendColorBoxDark : styles.legendColorBoxLight,
          ]}
        />
        <Text style={[styles.legendText, isDark && styles.textDark]}>
          Best Season (highlighted)
        </Text>

        <View style={{ width: 24 }} />

        <View
          style={[
            styles.legendColorBox,
            isDark ? styles.legendCareerBoxDark : styles.legendCareerBoxLight,
          ]}
        />
        <Text style={[styles.legendText, isDark && styles.textDark]}>
          Career Totals
        </Text>
      </View>
    </>
  );
}

const statsTableStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: "column",
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
      paddingHorizontal: 4,
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
    headerCell: {
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.white : Colors.black,
    },
    errorText: {
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
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
  });
