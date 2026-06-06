import {
  CareerTotals,
  MlbSeasonStatsRow,
  MlbStatMap,
  MlbStatValue,
} from "@/hooks/BaseballHooks/usePlayerSeasons";
import HeadingWithDropdowns from "components/Headings/HeadingWithDropdowns";
import PlayerStatTableSkeleton from "components/Skeletons/PlayerStatsTableSkeleton";
import { Colors, globalStyles } from "constants/styles";
import { getMLBTeamByEspnId } from "constants/teamsMLB";
import { usePreferences } from "contexts/PreferencesContext";
import { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { statsTableStyles } from "styles/PlayerStyles/StatsTableStyles";

interface Props {
  seasonStatsFlattened: MlbSeasonStatsRow[];
  careerStatsFlattened: MlbSeasonStatsRow[];
  loading: boolean;
  error: string | null;
}

type StatView = "totals" | "pergame";
type StatType = "batting" | "pitching" | "fielding";

type TableRow = MlbSeasonStatsRow & {
  rowKey: string;
  team: number | null;
  stats: MlbStatMap;
};

const STAT_OPTIONS = [
  { label: "Totals", value: "totals" },
  { label: "Per Game", value: "pergame" },
];

const STAT_TYPE_OPTIONS = [
  { label: "Batting", value: "batting" },
  { label: "Pitching", value: "pitching" },
  { label: "Fielding", value: "fielding" },
];

const isMissing = (value: MlbStatValue) =>
  value === undefined ||
  value === null ||
  value === "" ||
  value === "--" ||
  value === "-";

const toNumber = (value: MlbStatValue) => {
  if (isMissing(value)) return 0;

  const parsed = Number(String(value).replace(/,/g, ""));

  return Number.isFinite(parsed) ? parsed : 0;
};

const displayStat = (value: MlbStatValue) => {
  if (isMissing(value)) return "—";
  return String(value);
};

const perGame = (stat?: MlbStatValue, g?: MlbStatValue) => {
  const games = toNumber(g);
  if (!games) return "0.00";
  return (toNumber(stat) / games).toFixed(2);
};

const formatRate3 = (value: number) => {
  if (!Number.isFinite(value)) return "—";

  const fixed = value.toFixed(3);

  return fixed.startsWith("0") ? fixed.slice(1) : fixed;
};

const getCategoryStats = (
  row: MlbSeasonStatsRow,
  key: string,
): MlbStatMap | null => {
  return row.categories?.[key]?.stats ?? null;
};

const mergeStats = (...sources: (MlbStatMap | null | undefined)[]) => {
  const merged: MlbStatMap = {};

  sources.forEach((source) => {
    if (!source) return;

    Object.entries(source).forEach(([key, value]) => {
      if (!isMissing(value)) {
        merged[key] = value;
      }
    });
  });

  return merged;
};

const getPitchingStats = (row: MlbSeasonStatsRow) => {
  const pitchingCategories = Object.values(row.categories ?? {}).filter(
    (category) =>
      category.statCategory === "pitching" ||
      String(category.key ?? "")
        .toLowerCase()
        .includes("pitching") ||
      String(category.name ?? "")
        .toLowerCase()
        .includes("pitching"),
  );

  return mergeStats(
    row.pitching,
    ...pitchingCategories.map((category) => category.stats),
  );
};

const getStatsForType = (row: MlbSeasonStatsRow, statType: StatType) => {
  if (statType === "batting") {
    return mergeStats(
      getCategoryStats(row, "careerBatting"),
      row.careerBatting,
      getCategoryStats(row, "expandedBatting"),
      row.expandedBatting,
      getCategoryStats(row, "advancedBatting"),
      row.advancedBatting,
    );
  }

  if (statType === "fielding") {
    return mergeStats(getCategoryStats(row, "fielding"), row.fielding);
  }

  return getPitchingStats(row);
};

const getRows = (
  seasonStatsFlattened: MlbSeasonStatsRow[],
  careerStatsFlattened: MlbSeasonStatsRow[],
) => {
  const source =
    seasonStatsFlattened?.length > 0
      ? seasonStatsFlattened
      : careerStatsFlattened;

  return (source ?? [])
    .filter((row) => row && Number.isFinite(Number(row.season)))
    .sort((a, b) => Number(b.season) - Number(a.season));
};

const getWar = (stats: MlbStatMap) =>
  stats.WAR ?? stats.WARBR ?? stats.defWARBR;

const getInnings = (value: MlbStatValue) => {
  const raw = String(value ?? "").trim();

  if (!raw) return 0;

  const [wholeRaw, outsRaw] = raw.split(".");
  const whole = Number(wholeRaw || 0);
  const outs = Number(outsRaw || 0);

  if (!Number.isFinite(whole)) return 0;

  if (!outsRaw) return whole;

  return whole + Math.min(outs, 2) / 3;
};

const renderInnings = (innings: number) => {
  if (!Number.isFinite(innings) || innings <= 0) return "0.0";

  const whole = Math.floor(innings);
  const outs = Math.round((innings - whole) * 3);

  return `${whole}.${outs}`;
};

export default function PlayerStatTable({
  seasonStatsFlattened,
  careerStatsFlattened,
  loading,
  error,
}: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = statsTableStyles(isDark);
  const global = globalStyles(isDark);

  const [statView, setStatView] = useState<StatView>("totals");
  const [statType, setStatType] = useState<StatType>("batting");

  const rows = useMemo(
    () => getRows(seasonStatsFlattened, careerStatsFlattened),
    [seasonStatsFlattened, careerStatsFlattened],
  );

  const filteredSeasons = useMemo<TableRow[]>(() => {
    return rows
      .map((row) => {
        const stats = getStatsForType(row, statType);
        const team = Number(row.espnTeamId ?? row.teamId ?? 0) || null;

        return {
          ...row,
          rowKey: `${row.season}-${row.espnTeamId ?? row.teamId ?? "team"}`,
          team,
          stats,
        };
      })
      .filter((row) => Object.keys(row.stats).length > 0);
  }, [rows, statType]);

  const bestRowKey = useMemo(() => {
    let best: string | null = null;
    let compareValue = statType === "pitching" ? Infinity : -Infinity;

    filteredSeasons.forEach((row) => {
      const stats = row.stats;

      let value = 0;

      if (statType === "batting") value = toNumber(stats.OPS);
      if (statType === "pitching") value = toNumber(stats.ERA);
      if (statType === "fielding") value = toNumber(stats.fieldingPct);

      if (!Number.isFinite(value)) return;

      if (
        (statType === "pitching" && value > 0 && value < compareValue) ||
        (statType !== "pitching" && value > compareValue)
      ) {
        compareValue = value;
        best = row.rowKey;
      }
    });

    return best;
  }, [filteredSeasons, statType]);

  const careerTotals = useMemo(() => {
    return filteredSeasons.reduce<CareerTotals>(
      (acc, row) => {
        const stats = row.stats;

        acc.g += toNumber(stats.gamesPlayed);
        acc.gs += toNumber(stats.gamesStarted);

        if (statType === "batting") {
          const doubles = toNumber(stats.doubles);
          const triples = toNumber(stats.triples);
          const homeRuns = toNumber(stats.homeRuns);
          const hits = toNumber(stats.hits);
          const singles = Math.max(hits - doubles - triples - homeRuns, 0);
          const computedTotalBases =
            singles + doubles * 2 + triples * 3 + homeRuns * 4;

          acc.ab += toNumber(stats.atBats);
          acc.h += hits;
          acc.doubles += doubles;
          acc.triples += triples;
          acc.hr += homeRuns;
          acc.rbi += toNumber(stats.RBIs);
          acc.bb += toNumber(stats.walks);
          acc.so += toNumber(stats.strikeouts);
          acc.hbp += toNumber(stats.hitByPitch);
          acc.sf += toNumber(stats.sacFlies);
          acc.totalBases += toNumber(stats.totalBases) || computedTotalBases;
        }

        if (statType === "pitching") {
          acc.w += toNumber(stats.wins);
          acc.l += toNumber(stats.losses);
          acc.so += toNumber(stats.strikeouts);
          acc.bb += toNumber(stats.walks);
          acc.war += toNumber(getWar(stats));

          const ip = getInnings(stats.inningsPitched);
          const era = toNumber(stats.ERA);

          acc.ip += ip;
          acc.hitsAllowed += toNumber(stats.hits);
          acc.runsAllowed += toNumber(stats.runs);
          acc.earnedRuns += toNumber(stats.earnedRuns);

          if (ip > 0 && era > 0 && !stats.earnedRuns) {
            acc.earnedRuns += (era * ip) / 9;
          }
        }

        if (statType === "fielding") {
          acc.fullInningsPlayed += toNumber(stats.fullInningsPlayed);
          acc.totalChances += toNumber(stats.totalChances);
          acc.pickoffs += toNumber(stats.pickoffs);
          acc.assists += toNumber(stats.assists);
          acc.errors += toNumber(stats.errors);
          acc.doublePlays += toNumber(stats.doublePlays);
          acc.passedBalls += toNumber(stats.passedBalls);
          acc.catcherStolenBasesAllowed += toNumber(
            stats.catcherStolenBasesAllowed,
          );
          acc.catcherCaughtStealing += toNumber(stats.catcherCaughtStealing);
          acc.defWARBR += toNumber(stats.defWARBR);
        }

        return acc;
      },
      {
        g: 0,
        gs: 0,
        ab: 0,
        h: 0,
        doubles: 0,
        triples: 0,
        hr: 0,
        rbi: 0,
        bb: 0,
        so: 0,
        hbp: 0,
        sf: 0,
        totalBases: 0,
        w: 0,
        l: 0,
        earnedRuns: 0,
        ip: 0,
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

  const careerAVG =
    careerTotals.ab > 0 ? formatRate3(careerTotals.h / careerTotals.ab) : "—";

  const careerOBP =
    careerTotals.ab + careerTotals.bb + careerTotals.hbp + careerTotals.sf > 0
      ? formatRate3(
          (careerTotals.h + careerTotals.bb + careerTotals.hbp) /
            (careerTotals.ab +
              careerTotals.bb +
              careerTotals.hbp +
              careerTotals.sf),
        )
      : "—";

  const careerSLG =
    careerTotals.ab > 0
      ? formatRate3(careerTotals.totalBases / careerTotals.ab)
      : "—";

  const careerOPS =
    careerOBP !== "—" && careerSLG !== "—"
      ? formatRate3(Number(careerOBP) + Number(careerSLG))
      : "—";

  const careerERA =
    careerTotals.ip > 0
      ? ((careerTotals.earnedRuns * 9) / careerTotals.ip).toFixed(2)
      : "—";

  const careerFieldingPct =
    careerTotals.totalChances > 0
      ? formatRate3(
          (careerTotals.totalChances - careerTotals.errors) /
            careerTotals.totalChances,
        )
      : "—";

  const careerCaughtStealingPct =
    careerTotals.catcherStolenBasesAllowed +
      careerTotals.catcherCaughtStealing >
    0
      ? formatRate3(
          careerTotals.catcherCaughtStealing /
            (careerTotals.catcherStolenBasesAllowed +
              careerTotals.catcherCaughtStealing),
        )
      : "—";

  const careerWinPct =
    careerTotals.w + careerTotals.l > 0
      ? formatRate3(careerTotals.w / (careerTotals.w + careerTotals.l))
      : "—";

  const careerKBB =
    careerTotals.bb > 0 ? (careerTotals.so / careerTotals.bb).toFixed(2) : "—";

  const careerWHIP =
    careerTotals.ip > 0
      ? (
          (careerTotals.hitsAllowed + careerTotals.bb) /
          careerTotals.ip
        ).toFixed(2)
      : "—";

  const careerRF =
    careerTotals.g > 0
      ? (
          (careerTotals.pickoffs + careerTotals.assists) /
          careerTotals.g
        ).toFixed(2)
      : "—";

  const renderCount = (value: MlbStatValue, games: MlbStatValue) =>
    statView === "totals" ? displayStat(value) : perGame(value, games);

  const renderCareerCount = (value: number) =>
    statView === "totals"
      ? String(value)
      : careerTotals.g > 0
        ? (value / careerTotals.g).toFixed(2)
        : "0.00";

  const headers = useMemo(() => {
    if (statType === "batting") {
      return [
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
    }

    if (statType === "pitching") {
      return [
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
    }

    return [
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
  }, [statType]);

  if (loading) {
    return (
      <View style={styles.container}>
        <PlayerStatTableSkeleton />
      </View>
    );
  }

  if (error) return <Text style={global.errorText}>Failed to load stats</Text>;

  if (!filteredSeasons.length) {
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

        <Text style={global.emptyText}>No {statType} stats available.</Text>
      </View>
    );
  }

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
        <View style={styles.seasonColumn}>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.fixedCell, styles.fixedHeaderCell]}>
              SEASON
            </Text>
          </View>

          {filteredSeasons.map((row, index) => {
            const zebra =
              index % 2 === 1
                ? isDark
                  ? styles.rowAltDark
                  : styles.rowAltLight
                : null;

            const highlight = row.rowKey === bestRowKey ? styles.best : null;

            return (
              <View key={row.rowKey} style={[styles.row, zebra, highlight]}>
                <Text style={styles.fixedCell}>
                  {row.displaySeason ?? row.season}
                </Text>
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

          {filteredSeasons.map((row, index) => {
            const zebra =
              index % 2 === 1
                ? isDark
                  ? styles.rowAltDark
                  : styles.rowAltLight
                : null;

            const highlight = row.rowKey === bestRowKey ? styles.best : null;
            const team = getMLBTeamByEspnId(row.team ?? 0);

            return (
              <View
                key={`${row.rowKey}-team`}
                style={[styles.row, zebra, highlight]}
              >
                <Text style={styles.fixedTeamCell}>
                  {team?.code ?? row.teamSlug ?? "—"}
                </Text>
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
              {headers.map((header) => (
                <Text key={header} style={[styles.cell, styles.headerCell]}>
                  {header}
                </Text>
              ))}
            </View>

            {filteredSeasons.map((row, index) => {
              const stats = row.stats;
              const games = stats.gamesPlayed;
              const zebra =
                index % 2 === 1
                  ? isDark
                    ? styles.rowAltDark
                    : styles.rowAltLight
                  : null;

              const highlight = row.rowKey === bestRowKey ? styles.best : null;

              return (
                <View
                  key={`${row.rowKey}-stats`}
                  style={[styles.row, zebra, highlight]}
                >
                  {statType === "batting" && (
                    <>
                      <Text style={styles.cell}>
                        {displayStat(stats.gamesPlayed)}
                      </Text>
                      <Text style={styles.cell}>
                        {renderCount(stats.atBats, games)}
                      </Text>
                      <Text style={styles.cell}>
                        {renderCount(stats.hits, games)}
                      </Text>
                      <Text style={styles.cell}>
                        {renderCount(stats.homeRuns, games)}
                      </Text>
                      <Text style={styles.cell}>
                        {renderCount(stats.RBIs, games)}
                      </Text>
                      <Text style={styles.cell}>
                        {renderCount(stats.walks, games)}
                      </Text>
                      <Text style={styles.cell}>
                        {renderCount(stats.strikeouts, games)}
                      </Text>
                      <Text style={styles.cell}>{displayStat(stats.avg)}</Text>
                      <Text style={styles.cell}>
                        {displayStat(stats.onBasePct)}
                      </Text>
                      <Text style={styles.cell}>
                        {displayStat(stats.slugAvg)}
                      </Text>
                      <Text style={styles.cell}>{displayStat(stats.OPS)}</Text>
                      <Text style={styles.cell}>
                        {renderCount(stats.doubles, games)}
                      </Text>
                      <Text style={styles.cell}>
                        {renderCount(stats.triples, games)}
                      </Text>
                      <Text style={styles.cell}>
                        {renderCount(stats.hitByPitch, games)}
                      </Text>
                    </>
                  )}

                  {statType === "pitching" && (
                    <>
                      <Text style={styles.cell}>
                        {displayStat(stats.gamesPlayed)}
                      </Text>
                      <Text style={styles.cell}>
                        {displayStat(stats.gamesStarted)}
                      </Text>
                      <Text style={styles.cell}>{displayStat(stats.wins)}</Text>
                      <Text style={styles.cell}>
                        {displayStat(stats.losses)}
                      </Text>
                      <Text style={styles.cell}>
                        {toNumber(stats.wins) + toNumber(stats.losses) > 0
                          ? formatRate3(
                              toNumber(stats.wins) /
                                (toNumber(stats.wins) + toNumber(stats.losses)),
                            )
                          : "—"}
                      </Text>
                      <Text style={styles.cell}>
                        {displayStat(getWar(stats))}
                      </Text>
                      <Text style={styles.cell}>{displayStat(stats.ERA)}</Text>
                      <Text style={styles.cell}>{displayStat(stats.WHIP)}</Text>
                      <Text style={styles.cell}>
                        {displayStat(stats.inningsPitched)}
                      </Text>
                      <Text style={styles.cell}>
                        {displayStat(stats.strikeouts)}
                      </Text>
                      <Text style={styles.cell}>
                        {displayStat(stats.walks)}
                      </Text>
                      <Text style={styles.cell}>
                        {toNumber(stats.walks) > 0
                          ? (
                              toNumber(stats.strikeouts) / toNumber(stats.walks)
                            ).toFixed(2)
                          : "—"}
                      </Text>
                      <Text style={styles.cell}>{displayStat(stats.hits)}</Text>
                      <Text style={styles.cell}>{displayStat(stats.runs)}</Text>
                      <Text style={styles.cell}>
                        {displayStat(stats.earnedRuns)}
                      </Text>
                    </>
                  )}

                  {statType === "fielding" && (
                    <>
                      <Text style={styles.cell}>
                        {displayStat(stats.gamesPlayed)}
                      </Text>
                      <Text style={styles.cell}>
                        {displayStat(stats.gamesStarted)}
                      </Text>
                      <Text style={styles.cell}>
                        {displayStat(stats.fullInningsPlayed)}
                      </Text>
                      <Text style={styles.cell}>
                        {displayStat(stats.totalChances)}
                      </Text>
                      <Text style={styles.cell}>
                        {displayStat(stats.pickoffs)}
                      </Text>
                      <Text style={styles.cell}>
                        {displayStat(stats.assists)}
                      </Text>
                      <Text style={styles.cell}>
                        {displayStat(stats.errors)}
                      </Text>
                      <Text style={styles.cell}>
                        {displayStat(stats.doublePlays)}
                      </Text>
                      <Text style={styles.cell}>
                        {displayStat(stats.fieldingPct)}
                      </Text>
                      <Text style={styles.cell}>
                        {displayStat(stats.rangeFactor)}
                      </Text>
                      <Text style={styles.cell}>
                        {displayStat(stats.passedBalls)}
                      </Text>
                      <Text style={styles.cell}>
                        {displayStat(stats.catcherStolenBasesAllowed)}
                      </Text>
                      <Text style={styles.cell}>
                        {displayStat(stats.catcherCaughtStealing)}
                      </Text>
                      <Text style={styles.cell}>
                        {displayStat(stats.catcherCaughtStealingPct)}
                      </Text>
                      <Text style={styles.cell}>
                        {displayStat(stats.catcherERA)}
                      </Text>
                      <Text style={styles.cell}>
                        {displayStat(stats.defWARBR)}
                      </Text>
                    </>
                  )}
                </View>
              );
            })}

            <View style={[styles.row, styles.careerRow]}>
              {statType === "batting" && (
                <>
                  <Text style={styles.careerCell}>{careerTotals.g}</Text>
                  <Text style={styles.careerCell}>
                    {renderCareerCount(careerTotals.ab)}
                  </Text>
                  <Text style={styles.careerCell}>
                    {renderCareerCount(careerTotals.h)}
                  </Text>
                  <Text style={styles.careerCell}>
                    {renderCareerCount(careerTotals.hr)}
                  </Text>
                  <Text style={styles.careerCell}>
                    {renderCareerCount(careerTotals.rbi)}
                  </Text>
                  <Text style={styles.careerCell}>
                    {renderCareerCount(careerTotals.bb)}
                  </Text>
                  <Text style={styles.careerCell}>
                    {renderCareerCount(careerTotals.so)}
                  </Text>
                  <Text style={styles.careerCell}>{careerAVG}</Text>
                  <Text style={styles.careerCell}>{careerOBP}</Text>
                  <Text style={styles.careerCell}>{careerSLG}</Text>
                  <Text style={styles.careerCell}>{careerOPS}</Text>
                  <Text style={styles.careerCell}>
                    {renderCareerCount(careerTotals.doubles)}
                  </Text>
                  <Text style={styles.careerCell}>
                    {renderCareerCount(careerTotals.triples)}
                  </Text>
                  <Text style={styles.careerCell}>
                    {renderCareerCount(careerTotals.hbp)}
                  </Text>
                </>
              )}

              {statType === "pitching" && (
                <>
                  <Text style={styles.careerCell}>{careerTotals.g}</Text>
                  <Text style={styles.careerCell}>{careerTotals.gs}</Text>
                  <Text style={styles.careerCell}>{careerTotals.w}</Text>
                  <Text style={styles.careerCell}>{careerTotals.l}</Text>
                  <Text style={styles.careerCell}>{careerWinPct}</Text>
                  <Text style={styles.careerCell}>
                    {careerTotals.war.toFixed(1)}
                  </Text>
                  <Text style={styles.careerCell}>{careerERA}</Text>
                  <Text style={styles.careerCell}>{careerWHIP}</Text>
                  <Text style={styles.careerCell}>
                    {renderInnings(careerTotals.ip)}
                  </Text>
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
                    {careerTotals.earnedRuns.toFixed(0)}
                  </Text>
                </>
              )}

              {statType === "fielding" && (
                <>
                  <Text style={styles.careerCell}>{careerTotals.g}</Text>
                  <Text style={styles.careerCell}>{careerTotals.gs}</Text>
                  <Text style={styles.careerCell}>
                    {careerTotals.fullInningsPlayed.toFixed(1)}
                  </Text>
                  <Text style={styles.careerCell}>
                    {careerTotals.totalChances}
                  </Text>
                  <Text style={styles.careerCell}>{careerTotals.pickoffs}</Text>
                  <Text style={styles.careerCell}>{careerTotals.assists}</Text>
                  <Text style={styles.careerCell}>{careerTotals.errors}</Text>
                  <Text style={styles.careerCell}>
                    {careerTotals.doublePlays}
                  </Text>
                  <Text style={styles.careerCell}>{careerFieldingPct}</Text>
                  <Text style={styles.careerCell}>{careerRF}</Text>
                  <Text style={styles.careerCell}>
                    {careerTotals.passedBalls}
                  </Text>
                  <Text style={styles.careerCell}>
                    {careerTotals.catcherStolenBasesAllowed}
                  </Text>
                  <Text style={styles.careerCell}>
                    {careerTotals.catcherCaughtStealing}
                  </Text>
                  <Text style={styles.careerCell}>
                    {careerCaughtStealingPct}
                  </Text>
                  <Text style={styles.careerCell}>
                    {careerTotals.catcherERA}
                  </Text>
                  <Text style={styles.careerCell}>
                    {careerTotals.defWARBR.toFixed(1)}
                  </Text>
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
