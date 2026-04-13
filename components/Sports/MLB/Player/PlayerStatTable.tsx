import HeadingWithDropdowns from "components/Headings/HeadingWithDropdowns";
import PlayerStatTableSkeleton from "components/Skeletons/PlayerStatsTableSkeleton";
import { globalStyles } from "constants/styles";
import { getMLBTeamByEspnId } from "constants/teamsMLB";
import {
  CareerTotals,
  useMlbPlayerSeasons,
} from "hooks/MLBHooks/useMLBPlayerSeasons";
import { useMemo, useState } from "react";
import { ScrollView, Text, useColorScheme, View } from "react-native";
import { statsTableStyles } from "styles/PlayerStyles/StatsTableStyles";

interface Props {
  playerId: number;
}

type StatView = "totals" | "pergame";
type StatType = "batting" | "pitching" | "fielding";

const STAT_OPTIONS = [
  { label: "Totals", value: "totals" },
  { label: "Per Game", value: "pergame" },
];

const STAT_TYPE_OPTIONS = [
  { label: "Batting", value: "batting" },
  { label: "Pitching", value: "pitching" },
  { label: "Fielding", value: "fielding" },
];

const perGame = (stat?: number | string, g?: number | string) => {
  const games = Number(g || 0);
  if (!games) return "0.0";
  return (Number(stat || 0) / games).toFixed(2);
};

export default function PlayerStatTable({ playerId }: Props) {
  const [statView, setStatView] = useState<StatView>("totals");
  const [statType, setStatType] = useState<StatType>("batting");
  const { seasons, loading, error } = useMlbPlayerSeasons(playerId);

  const isDark = useColorScheme() === "dark";
  const styles = statsTableStyles(isDark);
  const global = globalStyles(isDark);

  const filteredSeasons = useMemo(() => {
    return seasons
      .map((s) => ({
        season: s.season,
        team: s.teamId,
        batting: (s.stats as any)?.["career-batting"] || null,
        pitching: (s.stats as any)?.["pitching"] || null,
        fielding: (s.stats as any)?.["fielding"] || null,
      }))
      .filter((s) => s[statType]);
  }, [seasons, statType]);

  const bestSeason = useMemo(() => {
    let best: number | null = null;
    let compareValue = statType === "pitching" ? Infinity : -1;

    filteredSeasons.forEach((s) => {
      const stats = s[statType];
      if (!stats) return;

      let value = 0;
      if (statType === "batting") value = Number(stats.OPS || 0);
      if (statType === "pitching") value = Number(stats.ERA || Infinity);
      if (statType === "fielding") value = Number(stats.fieldingPct || 0);

      if (
        (statType === "pitching" && value < compareValue) ||
        (statType !== "pitching" && value > compareValue)
      ) {
        compareValue = value;
        best = s.season;
      }
    });

    return best;
  }, [filteredSeasons, statType]);

  if (loading) {
    return (
      <View style={styles.container}>
        <PlayerStatTableSkeleton />
      </View>
    );
  }

  if (error) return <Text style={global.errorText}>Failed to load stats</Text>;

  const careerTotals = useMemo(() => {
    return filteredSeasons.reduce<CareerTotals>(
      (acc, s) => {
        const stats = s[statType];
        if (!stats) return acc;

        acc.g += Number(stats.gamesPlayed || 0);
        acc.gs += Number(stats.gamesStarted || 0);

        if (statType === "batting") {
          acc.ab += Number(stats.atBats || 0);
          acc.h += Number(stats.hits || 0);
          acc.hr += Number(stats.homeRuns || 0);
          acc.rbi += Number(stats.RBIs || 0);
          acc.bb += Number(stats.walks || 0);
          acc.so += Number(stats.strikeouts || 0);
          acc.hbp += Number(stats.hitByPitch || 0);
        }

        if (statType === "pitching") {
          acc.w += Number(stats.wins || 0);
          acc.l += Number(stats.losses || 0);
          acc.so += Number(stats.strikeouts || 0);
          acc.bb += Number(stats.walks || 0);

          const ip = Number(stats.inningsPitched || 0);
          const era = Number(stats.ERA || 0);

          acc.ip += ip;

          if (ip > 0) {
            acc.earnedRuns += (era * ip) / 9;
          }
        }

        if (statType === "fielding") {
          acc.fullInningsPlayed += Number(stats.fullInningsPlayed || 0);
          acc.totalChances += Number(stats.totalChances || 0);
          acc.pickoffs += Number(stats.pickoffs || 0);
          acc.assists += Number(stats.assists || 0);
          acc.errors += Number(stats.errors || 0);
          acc.doublePlays += Number(stats.doublePlays || 0);
          acc.passedBalls += Number(stats.passedBalls || 0);
          acc.catcherStolenBasesAllowed += Number(
            stats.catcherStolenBasesAllowed || 0,
          );
          acc.catcherCaughtStealing += Number(stats.catcherCaughtStealing || 0);
          acc.hitsAllowed += Number(stats.hits || 0);
          acc.runsAllowed += Number(stats.runs || 0);
          acc.earnedRuns += Number(stats.earnedRuns || 0);
          acc.war += Number(stats.WAR || 0);
          // For percentages/advanced stats — calculate after reduce instead
        }

        return acc;
      },
      {
        g: 0,
        gs: 0,
        ab: 0,
        h: 0,
        hr: 0,
        rbi: 0,
        bb: 0,
        so: 0,
        w: 0,
        l: 0,
        earnedRuns: 0,
        ip: 0,
        hbp: 0,
        war: 0,
        whip: 0,
        hitsAllowed: 0,
        runsAllowed: 0,
        fullInningsPlayed: 0,
        totalChances: 0,
        pickoffs: 0,
        assists: 0,
        errors: 0,
        doublePlays: 0,
        fieldingPct: 0,
        rangeFactor: 0,
        passedBalls: 0,
        catcherStolenBasesAllowed: 0,
        catcherCaughtStealing: 0,
        catcherCaughtStealingPct: 0,
        catcherERA: 0,
        defWARBR: 0,
      },
    );
  }, [filteredSeasons, statType]);

  const careerERA =
    careerTotals.ip > 0
      ? ((careerTotals.earnedRuns * 9) / careerTotals.ip).toFixed(2)
      : "0.00";

  const careerFieldingPct =
    careerTotals.totalChances > 0
      ? (
          (careerTotals.totalChances - careerTotals.errors) /
          careerTotals.totalChances
        ).toFixed(3)
      : "-";

  const careerCaughtStealingPct =
    careerTotals.catcherStolenBasesAllowed +
      careerTotals.catcherCaughtStealing >
    0
      ? (
          careerTotals.catcherCaughtStealing /
          (careerTotals.catcherStolenBasesAllowed +
            careerTotals.catcherCaughtStealing)
        ).toFixed(3)
      : "-";

  const careerWinPct =
    careerTotals.w + careerTotals.l > 0
      ? (careerTotals.w / (careerTotals.w + careerTotals.l)).toFixed(3)
      : "-";

  const careerKBB =
    careerTotals.bb > 0 ? (careerTotals.so / careerTotals.bb).toFixed(2) : "-";

  const careerWHIP =
    careerTotals.ip > 0
      ? (
          (careerTotals.hitsAllowed + careerTotals.bb) /
          careerTotals.ip
        ).toFixed(2)
      : "-";
  const renderStat = (val?: string | number, g?: number) =>
    statView === "totals" ? val : perGame(val, g);

  const headers = useMemo(() => {
    if (statType === "batting")
      return [
        "TEAM",
        "GP",

        "AB",
        "H",
        "HR",
        "RBI",
        "BB",
        "SO",
        "AVG",
        "OBP",
        "SLG",
        "OPS",
        "2B",
        "3B",
        "HBP",
      ];
    if (statType === "pitching")
      return [
        "TEAM",
        "GP",
        "GS",
        "W",
        "L",
        "W%",
        "WAR",
        "ERA",
        "WHIP",
        "IP",
        "K",
        "BB",
        "K/BB",
        "H",
        "R",
        "ER",
      ];
    if (statType === "fielding")
      return [
        "TEAM",
        "GP",
        "GS",
        "FIP",
        "TC",
        "PO",
        "A",
        "E",
        "DP",
        "FP",
        "RF",
        "PB",
        "SBA",
        "CS",
        "CS%",
        "ERA",
        "DWAR",
      ];
    return [];
  }, [statType]);

  return (
    <View style={styles.container}>
      <HeadingWithDropdowns
        title={statType.charAt(0).toUpperCase() + statType.slice(1)}
        dropdowns={[
          {
            options: STAT_TYPE_OPTIONS,
            selectedValue: statType,
            onSelect: (val) => setStatType(val as StatType),
          },
          {
            options: STAT_OPTIONS,
            selectedValue: statView,
            onSelect: (val) => setStatView(val as StatView),
          },
        ]}
      />

      <View style={styles.tableWrapper}>
        {/* Season Column */}
        <View>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.seasonHeaderCell, styles.headerCell]}>
              SEASON
            </Text>
          </View>

          {filteredSeasons.map((s, i) => {
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

          <View style={[styles.row, styles.careerRow]}>
            <Text style={styles.careerHeaderCell}>CAREER</Text>
          </View>
        </View>

        {/* Stats Table */}
        <ScrollView horizontal>
          <View>
            <View style={[styles.row, styles.headerRow]}>
              {headers.map((h) => (
                <Text key={h} style={[styles.cell, styles.headerCell]}>
                  {h}
                </Text>
              ))}
            </View>

            {filteredSeasons.map((s, i) => {
              const stats = s[statType];
              const zebra =
                i % 2 === 1
                  ? isDark
                    ? styles.rowAltDark
                    : styles.rowAltLight
                  : null;

              const highlight = s.season === bestSeason ? styles.best : null;

              const team = getMLBTeamByEspnId(s.team ?? 0);

              return (
                <View key={s.season} style={[styles.row, zebra, highlight]}>
                  <Text style={styles.cell}>{team?.code}</Text>

                  <Text style={styles.cell}>{stats?.gamesPlayed}</Text>

                  {statType === "batting" && (
                    <>
                      <Text style={styles.cell}>
                        {renderStat(stats?.atBats, stats?.gamesPlayed)}
                      </Text>
                      <Text style={styles.cell}>
                        {renderStat(stats?.hits, stats?.gamesPlayed)}
                      </Text>
                      <Text style={styles.cell}>
                        {renderStat(stats?.homeRuns, stats?.gamesPlayed)}
                      </Text>
                      <Text style={styles.cell}>
                        {renderStat(stats?.RBIs, stats?.gamesPlayed)}
                      </Text>
                      <Text style={styles.cell}>
                        {renderStat(stats?.walks, stats?.gamesPlayed)}
                      </Text>
                      <Text style={styles.cell}>
                        {renderStat(stats?.strikeouts, stats?.gamesPlayed)}
                      </Text>
                      <Text style={styles.cell}>{stats?.avg}</Text>
                      <Text style={styles.cell}>{stats?.onBasePct}</Text>
                      <Text style={styles.cell}>{stats?.slugAvg}</Text>
                      <Text style={styles.cell}>{stats?.OPS}</Text>
                      <Text style={styles.cell}>{stats?.doubles}</Text>
                      <Text style={styles.cell}>{stats?.triples}</Text>
                      <Text style={styles.cell}>{stats?.hitByPitch}</Text>
                    </>
                  )}

                  {statType === "pitching" && (
                    <>
                      <Text style={styles.cell}>{stats?.gamesStarted}</Text>
                      <Text style={styles.cell}>{stats?.wins}</Text>
                      <Text style={styles.cell}>{stats?.losses}</Text>

                      {/* Win % */}
                      <Text style={styles.cell}>
                        {stats?.wins && stats?.losses
                          ? (stats.wins / (stats.wins + stats.losses)).toFixed(
                              3,
                            )
                          : "-"}
                      </Text>

                      <Text style={styles.cell}>{stats?.WAR}</Text>
                      <Text style={styles.cell}>{stats?.ERA}</Text>
                      <Text style={styles.cell}>{stats?.WHIP}</Text>
                      <Text style={styles.cell}>{stats?.inningsPitched}</Text>
                      <Text style={styles.cell}>{stats?.strikeouts}</Text>
                      <Text style={styles.cell}>{stats?.walks}</Text>

                      {/* K/BB */}
                      <Text style={styles.cell}>
                        {stats?.walks > 0
                          ? (stats.strikeouts / stats.walks).toFixed(2)
                          : "-"}
                      </Text>

                      <Text style={styles.cell}>{stats?.hits}</Text>
                      <Text style={styles.cell}>{stats?.runs}</Text>
                      <Text style={styles.cell}>{stats?.earnedRuns}</Text>
                    </>
                  )}

                  {statType === "fielding" && (
                    <>
                      <Text style={styles.cell}>
                        {stats?.fullInningsPlayed}
                      </Text>
                      <Text style={styles.cell}>{stats?.totalChances}</Text>
                      <Text style={styles.cell}>{stats?.pickoffs}</Text>
                      <Text style={styles.cell}>{stats?.assists}</Text>
                      <Text style={styles.cell}>{stats?.errors}</Text>
                      <Text style={styles.cell}>{stats?.doublePlays}</Text>
                      <Text style={styles.cell}>{stats?.fieldingPct}</Text>
                      <Text style={styles.cell}>{stats?.rangeFactor}</Text>
                      <Text style={styles.cell}>{stats?.passedBalls}</Text>
                      <Text style={styles.cell}>
                        {stats?.catcherStolenBasesAllowed}
                      </Text>
                      <Text style={styles.cell}>
                        {stats?.catcherCaughtStealing}
                      </Text>
                      <Text style={styles.cell}>
                        {stats?.catcherCaughtStealingPct}
                      </Text>
                      <Text style={styles.cell}>{stats?.catcherERA}</Text>
                      <Text style={styles.cell}>{stats?.defWARBR}</Text>
                    </>
                  )}
                </View>
              );
            })}

            {/* Career Row */}
            <View style={[styles.row, styles.careerRow]}>
              <Text style={styles.careerCell}></Text>
              <Text style={styles.careerCell}>{careerTotals.g}</Text>
              <Text style={styles.careerCell}>{careerTotals.gs}</Text>

              {statType === "batting" && (
                <>
                  <Text style={styles.careerCell}>{careerTotals.ab}</Text>
                  <Text style={styles.careerCell}>{careerTotals.h}</Text>
                  <Text style={styles.careerCell}>{careerTotals.hr}</Text>
                  <Text style={styles.careerCell}>{careerTotals.rbi}</Text>
                  <Text style={styles.careerCell}>{careerTotals.bb}</Text>
                  <Text style={styles.careerCell}>{careerTotals.so}</Text>
                  <Text style={styles.careerCell}>
                    {careerTotals.ab > 0
                      ? (careerTotals.h / careerTotals.ab).toFixed(3)
                      : "-"}
                  </Text>
                  <Text style={styles.careerCell}>{careerTotals.hbp}</Text>
                </>
              )}

              {statType === "pitching" && (
                <>
                  <Text style={styles.careerCell}>{careerTotals.w}</Text>
                  <Text style={styles.careerCell}>{careerTotals.l}</Text>
                  <Text style={styles.careerCell}>{careerWinPct}</Text>
                  <Text style={styles.careerCell}>{careerTotals.war}</Text>
                  <Text style={styles.careerCell}>{careerERA}</Text>
                  <Text style={styles.careerCell}>{careerWHIP}</Text>
                  <Text style={styles.careerCell}>{careerTotals.ip}</Text>
                  <Text style={styles.careerCell}>{careerTotals.so}</Text>
                  <Text style={styles.careerCell}>{careerTotals.bb}</Text>
                  <Text style={styles.careerCell}>{careerKBB}</Text>
                  <Text style={styles.careerCell}>
                    {careerTotals.hitsAllowed}
                  </Text>
                  <Text style={styles.careerCell}>
                    {careerTotals.runsAllowed}
                  </Text>
                  <Text style={styles.careerCell}>
                    {careerTotals.earnedRuns}
                  </Text>
                </>
              )}

              {statType === "fielding" && (
                <>
                  <>
                    <Text style={styles.careerCell}>
                      {careerTotals?.fullInningsPlayed}
                    </Text>
                    <Text style={styles.careerCell}>
                      {careerTotals?.totalChances}
                    </Text>
                    <Text style={styles.careerCell}>
                      {careerTotals?.pickoffs}
                    </Text>
                    <Text style={styles.careerCell}>
                      {careerTotals?.assists}
                    </Text>
                    <Text style={styles.careerCell}>
                      {careerTotals?.errors}
                    </Text>
                    <Text style={styles.careerCell}>
                      {careerTotals?.doublePlays}
                    </Text>
                    <Text style={styles.careerCell}>{careerFieldingPct}</Text>
                    <Text style={styles.careerCell}>
                      {careerTotals?.rangeFactor}
                    </Text>
                    <Text style={styles.careerCell}>
                      {careerTotals?.passedBalls}
                    </Text>
                    <Text style={styles.careerCell}>
                      {careerTotals?.catcherStolenBasesAllowed}
                    </Text>
                    <Text style={styles.careerCell}>
                      {careerTotals?.catcherCaughtStealingPct}
                    </Text>
                    <Text style={styles.careerCell}>
                      {careerCaughtStealingPct}
                    </Text>
                    <Text style={styles.careerCell}>
                      {careerTotals?.catcherERA}
                    </Text>
                    <Text style={styles.careerCell}>
                      {careerTotals?.defWARBR}
                    </Text>
                  </>
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
