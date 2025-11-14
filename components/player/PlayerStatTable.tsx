import PlayerStatTableSkeleton from "components/Player/PlayerStatsTableSkeleton";
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { usePlayerStatsBySeason } from "hooks/usePlayerStatsAllSeasons";
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
  seasons: string[];
}

const safeDivide = (num: number, denom: number) =>
  denom === 0 ? "0.0" : (num / denom).toFixed(1);

const percentage = (str: string | number) => `${str}%`;

export default function PlayerStatTable({ playerId, seasons }: Props) {
  const { data, loading, error } = usePlayerStatsBySeason(playerId, seasons);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
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

  // Find best season (highest PPG)
  const bestSeason = useMemo(() => {
    let maxPPG = -Infinity;
    let best: string | null = null;
    data.forEach((season) => {
      const games = season.games.length;
      const totalPoints = season.games.reduce(
        (sum, g) => sum + (g.points || 0),
        0
      );
      const ppg = games === 0 ? 0 : totalPoints / games;
      if (ppg > maxPPG) {
        maxPPG = ppg;
        best = season.season;
      }
    });
    return best;
  }, [data]);

  if (loading) return <PlayerStatTableSkeleton />;
  if (error)
    return (
      <Text style={[styles.cell, styles.errorText]}>Error loading stats</Text>
    );
  if (!data.length)
    return <Text style={[styles.cell]}>No stats available</Text>;

  // Aggregate career totals
  const careerTotals = data.reduce(
    (acc, seasonData) => {
      seasonData.games.forEach((g) => {
        const parseNum = (val: string | number | undefined) =>
          parseFloat(val as any) || 0;
        acc.games += 1;
        acc.min += parseNum(g.min);
        acc.fgm += g.fgm || 0;
        acc.fga += g.fga || 0;
        acc.fgp += parseNum(g.fgp);
        acc.tpm += g.tpm || 0;
        acc.tpa += g.tpa || 0;
        acc.tpp += parseNum(g.tpp);
        acc.ftm += g.ftm || 0;
        acc.fta += g.fta || 0;
        acc.ftp += parseNum(g.ftp);
        acc.offReb += g.offReb || 0;
        acc.defReb += g.defReb || 0;
        acc.totReb += g.totReb || 0;
        acc.ast += g.assists || 0;
        acc.stl += g.steals || 0;
        acc.blk += g.blocks || 0;
        acc.to += g.turnovers || 0;
        acc.pf += g.pFouls || 0;
        acc.plusMinus += parseNum(g.plusMinus);
        acc.pts += g.points || 0;
      });
      return acc;
    },
    {
      games: 0,
      min: 0,
      fgm: 0,
      fga: 0,
      fgp: 0,
      tpm: 0,
      tpa: 0,
      tpp: 0,
      ftm: 0,
      fta: 0,
      ftp: 0,
      offReb: 0,
      defReb: 0,
      totReb: 0,
      ast: 0,
      stl: 0,
      blk: 0,
      to: 0,
      pf: 0,
      plusMinus: 0,
      pts: 0,
    }
  );

  const statLabels = [
    "Season",
    "GP",
    "PTS",
    "MIN",
    "FGM",
    "FGA",
    "FG%",
    "3PM",
    "3PA",
    "3P%",
    "FTM",
    "FTA",
    "FT%",
    "OREB",
    "DREB",
    "REB",
    "AST",
    "STL",
    "BLK",
    "TO",
    "PF",
    "+/-",
  ];

  return (
    <>
      <View
        style={{
          flexDirection: "row",
          borderTopLeftRadius: 8,
          borderBottomLeftRadius: 8,
        }}
      >
        {/* Fixed Season Column */}
        <View
          style={{
            borderTopLeftRadius: 8,
            borderBottomLeftRadius: 8,
            overflow: "hidden", // 👈 needed for visible radius
          }}
        >
          {/* Header */}
          <View style={[styles.row, styles.headerRow, styles.seasonCell]}>
            <Text style={[styles.seasonHeaderCell, styles.headerCell]}>
              Season
            </Text>
          </View>

          {/* Season Rows */}
          {data.map((seasonData, index) => {
            const highlightStyle =
              seasonData.season === bestSeason
                ? isDark
                  ? dynamicStyles.highlightDark
                  : dynamicStyles.highlight
                : null;

            return (
              <View
                key={seasonData.season}
                style={[
                  styles.seasonCell,
                  index % 2 === 1 && dynamicStyles.rowOdd,
                  highlightStyle,
                ]}
              >
                <Text style={[styles.seasons]}>{seasonData.season}</Text>
              </View>
            );
          })}

          {/* Career Label Row */}
          <View style={[styles.seasonCell, dynamicStyles.careerRow]}>
            <Text style={[styles.careerCell, styles.headerCell]}>Career</Text>
          </View>
        </View>

        {/* Scrollable Stats Table */}
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
            {/* Header Row */}
            <View style={[styles.row, styles.headerRow]}>
              {statLabels.slice(1).map((label) => (
                <Text key={label} style={[styles.cell, styles.headerCell]}>
                  {label}
                </Text>
              ))}
            </View>

            {/* Season Rows */}
            {data.map((seasonData, index) => {
              const totalGames = seasonData.games.length;
              const totals = seasonData.games.reduce(
                (acc, g) => {
                  const parseNum = (val: string | number | undefined) =>
                    parseFloat(val as any) || 0;
                  acc.min += parseNum(g.min);
                  acc.fgm += g.fgm || 0;
                  acc.fga += g.fga || 0;
                  acc.fgp += parseNum(g.fgp);
                  acc.tpm += g.tpm || 0;
                  acc.tpa += g.tpa || 0;
                  acc.tpp += parseNum(g.tpp);
                  acc.ftm += g.ftm || 0;
                  acc.fta += g.fta || 0;
                  acc.ftp += parseNum(g.ftp);
                  acc.offReb += g.offReb || 0;
                  acc.defReb += g.defReb || 0;
                  acc.totReb += g.totReb || 0;
                  acc.ast += g.assists || 0;
                  acc.stl += g.steals || 0;
                  acc.blk += g.blocks || 0;
                  acc.to += g.turnovers || 0;
                  acc.pf += g.pFouls || 0;
                  acc.plusMinus += parseNum(g.plusMinus);
                  acc.pts += g.points || 0;
                  return acc;
                },
                {
                  min: 0,
                  fgm: 0,
                  fga: 0,
                  fgp: 0,
                  tpm: 0,
                  tpa: 0,
                  tpp: 0,
                  ftm: 0,
                  fta: 0,
                  ftp: 0,
                  offReb: 0,
                  defReb: 0,
                  totReb: 0,
                  ast: 0,
                  stl: 0,
                  blk: 0,
                  to: 0,
                  pf: 0,
                  plusMinus: 0,
                  pts: 0,
                }
              );

              const highlightStyle =
                seasonData.season === bestSeason
                  ? isDark
                    ? dynamicStyles.highlightDark
                    : dynamicStyles.highlight
                  : null;

              return (
                <View
                  key={seasonData.season}
                  style={[
                    styles.row,
                    index % 2 === 1 && dynamicStyles.rowOdd,
                    highlightStyle,
                  ]}
                >
                  <Text style={[styles.cell]}>{totalGames}</Text>
                  <Text style={[styles.cell]}>
                    {safeDivide(totals.pts, totalGames)}
                  </Text>
                  <Text style={[styles.cell]}>
                    {safeDivide(totals.min, totalGames)}
                  </Text>
                  <Text style={[styles.cell]}>
                    {safeDivide(totals.fgm, totalGames)}
                  </Text>
                  <Text style={[styles.cell]}>
                    {safeDivide(totals.fga, totalGames)}
                  </Text>
                  <Text style={[styles.cell]}>
                    {percentage(safeDivide(totals.fgp, totalGames))}
                  </Text>
                  <Text style={[styles.cell]}>
                    {safeDivide(totals.tpm, totalGames)}
                  </Text>
                  <Text style={[styles.cell]}>
                    {safeDivide(totals.tpa, totalGames)}
                  </Text>
                  <Text style={[styles.cell]}>
                    {percentage(safeDivide(totals.tpp, totalGames))}
                  </Text>
                  <Text style={[styles.cell]}>
                    {safeDivide(totals.ftm, totalGames)}
                  </Text>
                  <Text style={[styles.cell]}>
                    {safeDivide(totals.fta, totalGames)}
                  </Text>
                  <Text style={[styles.cell]}>
                    {percentage(safeDivide(totals.ftp, totalGames))}
                  </Text>
                  <Text style={[styles.cell]}>
                    {safeDivide(totals.offReb, totalGames)}
                  </Text>
                  <Text style={[styles.cell]}>
                    {safeDivide(totals.defReb, totalGames)}
                  </Text>
                  <Text style={[styles.cell]}>
                    {safeDivide(totals.totReb, totalGames)}
                  </Text>
                  <Text style={[styles.cell]}>
                    {safeDivide(totals.ast, totalGames)}
                  </Text>
                  <Text style={[styles.cell]}>
                    {safeDivide(totals.stl, totalGames)}
                  </Text>
                  <Text style={[styles.cell]}>
                    {safeDivide(totals.blk, totalGames)}
                  </Text>
                  <Text style={[styles.cell]}>
                    {safeDivide(totals.to, totalGames)}
                  </Text>
                  <Text style={[styles.cell]}>
                    {safeDivide(totals.pf, totalGames)}
                  </Text>
                  <Text style={[styles.cell]}>
                    {safeDivide(totals.plusMinus, totalGames)}
                  </Text>
                </View>
              );
            })}

            {/* Career Row */}
            <View style={[styles.row, dynamicStyles.careerRow]}>
              <Text style={[styles.cell, styles.headerCell]}>
                {careerTotals.games}
              </Text>
              <Text style={[styles.cell, styles.headerCell]}>
                {careerTotals.pts}
              </Text>
              <Text style={[styles.cell, styles.headerCell]}>
                {careerTotals.min.toFixed(1)}
              </Text>
              <Text style={[styles.cell, styles.headerCell]}>
                {careerTotals.fgm}
              </Text>
              <Text style={[styles.cell, styles.headerCell]}>
                {careerTotals.fga}
              </Text>
              <Text style={[styles.cell, styles.headerCell]}>
                {percentage((careerTotals.fgp / careerTotals.games).toFixed(1))}
              </Text>
              <Text style={[styles.cell, styles.headerCell]}>
                {careerTotals.tpm}
              </Text>
              <Text style={[styles.cell, styles.headerCell]}>
                {careerTotals.tpa}
              </Text>
              <Text style={[styles.cell, styles.headerCell]}>
                {percentage((careerTotals.tpp / careerTotals.games).toFixed(1))}
              </Text>
              <Text style={[styles.cell, styles.headerCell]}>
                {careerTotals.ftm}
              </Text>
              <Text style={[styles.cell, styles.headerCell]}>
                {careerTotals.fta}
              </Text>
              <Text style={[styles.cell, styles.headerCell]}>
                {percentage((careerTotals.ftp / careerTotals.games).toFixed(1))}
              </Text>
              <Text style={[styles.cell, styles.headerCell]}>
                {careerTotals.offReb}
              </Text>
              <Text style={[styles.cell, styles.headerCell]}>
                {careerTotals.defReb}
              </Text>
              <Text style={[styles.cell, styles.headerCell]}>
                {careerTotals.totReb}
              </Text>
              <Text style={[styles.cell, styles.headerCell]}>
                {careerTotals.ast}
              </Text>
              <Text style={[styles.cell, styles.headerCell]}>
                {careerTotals.stl}
              </Text>
              <Text style={[styles.cell, styles.headerCell]}>
                {careerTotals.blk}
              </Text>
              <Text style={[styles.cell, styles.headerCell]}>
                {careerTotals.to}
              </Text>
              <Text style={[styles.cell, styles.headerCell]}>
                {careerTotals.pf}
              </Text>
              <Text style={[styles.cell, styles.headerCell]}>
                {careerTotals.plusMinus.toFixed(1)}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Legend */}
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
