import { getNHLTeamByEspnId } from "@/constants/teamsNHL";
import {
  CareerTotals,
  NhlSeasonStatsRow,
  NhlStatMap,
  NhlStatValue,
} from "@/hooks/HockeyHooks/usePlayerSeasons";
import HeadingWithDropdowns from "components/Headings/HeadingWithDropdowns";
import PlayerStatTableSkeleton from "components/Skeletons/PlayerStatsTableSkeleton";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { statsTableStyles } from "styles/PlayerStyles/StatsTableStyles";

interface Props {
  seasonStatsFlattened: NhlSeasonStatsRow[];
  careerStatsFlattened: NhlSeasonStatsRow[];
  loading: boolean;
  error: string | null;
}

type StatView = "totals" | "pergame";
type StatType = "skater" | "goalie";

type NhlPositionBucket =
  | "center"
  | "leftWing"
  | "rightWing"
  | "defense"
  | "defenseman"
  | "goalie"
  | "goaltending"
  | "skater"
  | "forward";

type TableRow = NhlSeasonStatsRow & {
  rowKey: string;
  team: number | null;
  stats: NhlStatMap;
};

interface GoalieCareerTotals {
  games: number;
  gamesStarted: number;
  wins: number;
  losses: number;
  overtimeLosses: number;
  goalsAgainst: number;
  shotsAgainst: number;
  saves: number;
  shutouts: number;
  minutes: number;
}

const STAT_OPTIONS = [
  { label: "Totals", value: "totals" },
  { label: "Per Game", value: "pergame" },
];

const STAT_TYPE_OPTIONS = [
  { label: "Skater", value: "skater" },
  { label: "Goalie", value: "goalie" },
];

const isMissing = (value: NhlStatValue) =>
  value === undefined ||
  value === null ||
  value === "" ||
  value === "--" ||
  value === "-";

const toNumber = (value: NhlStatValue) => {
  if (isMissing(value)) return 0;

  const parsed = Number(String(value).replace(/,/g, ""));

  return Number.isFinite(parsed) ? parsed : 0;
};

const displayStat = (value: NhlStatValue) => {
  if (isMissing(value)) return "—";
  return String(value);
};

const perGame = (stat?: NhlStatValue, gamesPlayed?: NhlStatValue) => {
  const games = toNumber(gamesPlayed);
  if (!games) return "0.00";

  return (toNumber(stat) / games).toFixed(2);
};

const renderCount = (
  value: NhlStatValue,
  gamesPlayed: NhlStatValue,
  statView: StatView,
) => {
  return statView === "totals"
    ? displayStat(value)
    : perGame(value, gamesPlayed);
};

const renderCareerCount = (
  value: number,
  gamesPlayed: number,
  statView: StatView,
) => {
  return statView === "totals"
    ? String(value)
    : gamesPlayed > 0
      ? (value / gamesPlayed).toFixed(2)
      : "0.00";
};

const formatDecimal = (value: number, digits = 1) => {
  if (!Number.isFinite(value)) return "—";
  return value.toFixed(digits);
};

const formatRate3 = (value: number) => {
  if (!Number.isFinite(value)) return "—";

  const fixed = value.toFixed(3);

  return fixed.startsWith("0") ? fixed.slice(1) : fixed;
};

const parseTimeToSeconds = (value: NhlStatValue) => {
  if (isMissing(value)) return 0;

  const raw = String(value).trim();

  if (!raw.includes(":")) return 0;

  const [minutesRaw, secondsRaw] = raw.split(":");
  const minutes = Number(minutesRaw);
  const seconds = Number(secondsRaw);

  if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) return 0;

  return minutes * 60 + seconds;
};

const formatSecondsToTime = (totalSeconds: number) => {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return "—";

  const rounded = Math.round(totalSeconds);
  const minutes = Math.floor(rounded / 60);
  const seconds = rounded % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

const getFirst = (stats: NhlStatMap, keys: string[]) => {
  for (const key of keys) {
    if (!isMissing(stats[key])) return stats[key];
  }

  return null;
};

const isStatMap = (value: unknown): value is NhlStatMap => {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
};

const getPositionBucket = (position?: string | null): NhlPositionBucket => {
  const normalized = String(position ?? "")
    .trim()
    .toUpperCase();

  switch (normalized) {
    case "C":
      return "center";
    case "LW":
      return "leftWing";
    case "RW":
      return "rightWing";
    case "D":
    case "DEF":
      return "defense";
    case "G":
    case "GK":
      return "goalie";
    default:
      return "skater";
  }
};

const mergeStats = (...sources: (NhlStatMap | null | undefined)[]) => {
  const merged: NhlStatMap = {};

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

const getCategoryStatsByType = (
  row: NhlSeasonStatsRow,
  type: StatType,
): NhlStatMap[] => {
  const categories = Object.values(row.categories ?? {});

  return categories
    .filter((category) => {
      const statCategory = String(category.statCategory ?? "").toLowerCase();
      const key = String(category.key ?? "").toLowerCase();
      const name = String(category.name ?? "").toLowerCase();

      if (type === "goalie") {
        return (
          statCategory.includes("goal") ||
          key.includes("goal") ||
          name.includes("goal")
        );
      }

      return (
        statCategory.includes("skater") ||
        statCategory.includes("forward") ||
        statCategory.includes("defense") ||
        key.includes("skater") ||
        key.includes("forward") ||
        key.includes("defense") ||
        name.includes("skater") ||
        name.includes("forward") ||
        name.includes("defense")
      );
    })
    .map((category) => category.stats)
    .filter(isStatMap);
};

const getSkaterStats = (row: NhlSeasonStatsRow) => {
  const bucket = getPositionBucket(row.position);
  const bucketStats = row[bucket];

  const fallbackBuckets: NhlPositionBucket[] = [
    "center",
    "leftWing",
    "rightWing",
    "defense",
    "defenseman",
    "forward",
    "skater",
  ];

  const fallbackStats = fallbackBuckets
    .map((key) => row[key])
    .filter(isStatMap);

  return mergeStats(
    row.totals,
    isStatMap(bucketStats) ? bucketStats : null,
    ...fallbackStats,
    ...getCategoryStatsByType(row, "skater"),
  );
};

const getGoalieStats = (row: NhlSeasonStatsRow) => {
  return mergeStats(
    row.totals,
    row.goalie,
    row.goaltending,
    ...getCategoryStatsByType(row, "goalie"),
  );
};

const getStatsForType = (row: NhlSeasonStatsRow, statType: StatType) => {
  return statType === "goalie" ? getGoalieStats(row) : getSkaterStats(row);
};

const hasSkaterStats = (stats: NhlStatMap) => {
  return (
    !isMissing(stats.games) ||
    !isMissing(stats.goals) ||
    !isMissing(stats.assists) ||
    !isMissing(stats.points)
  );
};

const hasGoalieStats = (stats: NhlStatMap) => {
  return (
    !isMissing(getFirst(stats, ["wins", "losses", "goalsAgainst", "saves"])) ||
    !isMissing(
      getFirst(stats, ["savePct", "savePercentage", "goalsAgainstAverage"]),
    )
  );
};

const getRows = (
  seasonStatsFlattened: NhlSeasonStatsRow[],
  careerStatsFlattened: NhlSeasonStatsRow[],
) => {
  const source =
    seasonStatsFlattened?.length > 0
      ? seasonStatsFlattened
      : careerStatsFlattened;

  return (source ?? [])
    .filter((row) => row && Number.isFinite(Number(row.season)))
    .sort((a, b) => Number(b.season) - Number(a.season));
};

const getGames = (stats: NhlStatMap) =>
  getFirst(stats, ["games", "gamesPlayed", "GP"]);

const getGoals = (stats: NhlStatMap) => getFirst(stats, ["goals", "G"]);

const getAssists = (stats: NhlStatMap) => getFirst(stats, ["assists", "A"]);

const getPoints = (stats: NhlStatMap) => getFirst(stats, ["points", "PTS"]);

const getPlusMinus = (stats: NhlStatMap) =>
  getFirst(stats, ["plusMinus", "plusMinusRating"]);

const getPenaltyMinutes = (stats: NhlStatMap) =>
  getFirst(stats, ["penaltyMinutes", "PIM"]);

const getPowerPlayGoals = (stats: NhlStatMap) =>
  getFirst(stats, ["powerPlayGoals", "PPG"]);

const getPowerPlayAssists = (stats: NhlStatMap) =>
  getFirst(stats, ["powerPlayAssists", "PPA"]);

const getShortHandedGoals = (stats: NhlStatMap) =>
  getFirst(stats, ["shortHandedGoals", "shorthandedGoals", "SHG"]);

const getShortHandedAssists = (stats: NhlStatMap) =>
  getFirst(stats, ["shortHandedAssists", "shorthandedAssists", "SHA"]);

const getGameWinningGoals = (stats: NhlStatMap) =>
  getFirst(stats, ["gameWinningGoals", "GWG"]);

const getShots = (stats: NhlStatMap) =>
  getFirst(stats, ["shots", "shotsOnGoal", "SOG"]);

const getShootingPct = (stats: NhlStatMap) =>
  getFirst(stats, ["shootingPct", "shotPct"]);

const getTimeOnIcePerGame = (stats: NhlStatMap) =>
  getFirst(stats, ["timeOnIcePerGame", "avgTimeOnIce"]);

const getGoalieGamesStarted = (stats: NhlStatMap) =>
  getFirst(stats, ["gamesStarted", "starts", "GS"]);

const getGoalieWins = (stats: NhlStatMap) => getFirst(stats, ["wins", "W"]);

const getGoalieLosses = (stats: NhlStatMap) => getFirst(stats, ["losses", "L"]);

const getGoalieOvertimeLosses = (stats: NhlStatMap) =>
  getFirst(stats, ["overtimeLosses", "OTL", "otLosses"]);

const getGoalsAgainst = (stats: NhlStatMap) =>
  getFirst(stats, ["goalsAgainst", "GA"]);

const getGoalsAgainstAverage = (stats: NhlStatMap) =>
  getFirst(stats, ["goalsAgainstAverage", "GAA"]);

const getShotsAgainst = (stats: NhlStatMap) =>
  getFirst(stats, ["shotsAgainst", "SA"]);

const getSaves = (stats: NhlStatMap) => getFirst(stats, ["saves", "SV"]);

const getSavePct = (stats: NhlStatMap) =>
  getFirst(stats, ["savePct", "savePercentage", "SVPct"]);

const getShutouts = (stats: NhlStatMap) => getFirst(stats, ["shutouts", "SO"]);

const getGoalieMinutes = (stats: NhlStatMap) =>
  getFirst(stats, ["minutes", "minutesPlayed", "timeOnIce"]);

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
  const [statType, setStatType] = useState<StatType>("skater");

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
          rowKey: `${row.season}-${row.seasonType ?? "type"}-${
            row.espnTeamId ?? row.teamId ?? "team"
          }`,
          team,
          stats,
        };
      })
      .filter((row) =>
        statType === "goalie"
          ? hasGoalieStats(row.stats)
          : hasSkaterStats(row.stats),
      );
  }, [rows, statType]);

  const bestRowKey = useMemo(() => {
    let best: string | null = null;
    let compareValue = statType === "goalie" ? Infinity : -Infinity;

    filteredSeasons.forEach((row) => {
      const stats = row.stats;

      const value =
        statType === "goalie"
          ? toNumber(getGoalsAgainstAverage(stats))
          : toNumber(getPoints(stats));

      if (!Number.isFinite(value)) return;

      if (
        (statType === "goalie" && value > 0 && value < compareValue) ||
        (statType === "skater" && value > compareValue)
      ) {
        compareValue = value;
        best = row.rowKey;
      }
    });

    return best;
  }, [filteredSeasons, statType]);

  const skaterCareerTotals = useMemo(() => {
    return filteredSeasons.reduce<CareerTotals>(
      (acc, row) => {
        const stats = row.stats;
        const games = toNumber(getGames(stats));

        acc.games += games;
        acc.goals += toNumber(getGoals(stats));
        acc.assists += toNumber(getAssists(stats));
        acc.points += toNumber(getPoints(stats));
        acc.plusMinus += toNumber(getPlusMinus(stats));
        acc.penaltyMinutes += toNumber(getPenaltyMinutes(stats));

        acc.powerPlayGoals += toNumber(getPowerPlayGoals(stats));
        acc.powerPlayAssists += toNumber(getPowerPlayAssists(stats));
        acc.shortHandedGoals += toNumber(getShortHandedGoals(stats));
        acc.shortHandedAssists += toNumber(getShortHandedAssists(stats));
        acc.gameWinningGoals += toNumber(getGameWinningGoals(stats));

        acc.shots += toNumber(getShots(stats));

        const shootingPct = toNumber(getShootingPct(stats));

        if (shootingPct > 0) {
          acc.shootingPctTotal += shootingPct;
          acc.shootingPctCount += 1;
        }

        const toiSeconds = parseTimeToSeconds(getTimeOnIcePerGame(stats));

        if (toiSeconds > 0 && games > 0) {
          acc.timeOnIceSeconds += toiSeconds * games;
          acc.timeOnIceGames += games;
        }

        return acc;
      },
      {
        games: 0,
        goals: 0,
        assists: 0,
        points: 0,
        plusMinus: 0,
        penaltyMinutes: 0,
        powerPlayGoals: 0,
        powerPlayAssists: 0,
        shortHandedGoals: 0,
        shortHandedAssists: 0,
        gameWinningGoals: 0,
        shootoutGoals: 0,
        shots: 0,
        shootingPctTotal: 0,
        shootingPctCount: 0,
        timeOnIceSeconds: 0,
        timeOnIceGames: 0,
      },
    );
  }, [filteredSeasons]);

  const goalieCareerTotals = useMemo(() => {
    return filteredSeasons.reduce<GoalieCareerTotals>(
      (acc, row) => {
        const stats = row.stats;

        acc.games += toNumber(getGames(stats));
        acc.gamesStarted += toNumber(getGoalieGamesStarted(stats));
        acc.wins += toNumber(getGoalieWins(stats));
        acc.losses += toNumber(getGoalieLosses(stats));
        acc.overtimeLosses += toNumber(getGoalieOvertimeLosses(stats));
        acc.goalsAgainst += toNumber(getGoalsAgainst(stats));
        acc.shotsAgainst += toNumber(getShotsAgainst(stats));
        acc.saves += toNumber(getSaves(stats));
        acc.shutouts += toNumber(getShutouts(stats));
        acc.minutes += toNumber(getGoalieMinutes(stats));

        return acc;
      },
      {
        games: 0,
        gamesStarted: 0,
        wins: 0,
        losses: 0,
        overtimeLosses: 0,
        goalsAgainst: 0,
        shotsAgainst: 0,
        saves: 0,
        shutouts: 0,
        minutes: 0,
      },
    );
  }, [filteredSeasons]);

  const careerShootingPct =
    skaterCareerTotals.shots > 0
      ? formatDecimal(
          (skaterCareerTotals.goals / skaterCareerTotals.shots) * 100,
        )
      : skaterCareerTotals.shootingPctCount > 0
        ? formatDecimal(
            skaterCareerTotals.shootingPctTotal /
              skaterCareerTotals.shootingPctCount,
          )
        : "—";

  const careerTimeOnIce =
    skaterCareerTotals.timeOnIceGames > 0
      ? formatSecondsToTime(
          skaterCareerTotals.timeOnIceSeconds /
            skaterCareerTotals.timeOnIceGames,
        )
      : "—";

  const careerGoalieGAA =
    goalieCareerTotals.minutes > 0
      ? formatDecimal(
          (goalieCareerTotals.goalsAgainst * 60) / goalieCareerTotals.minutes,
          2,
        )
      : "—";

  const careerGoalieSavePct =
    goalieCareerTotals.shotsAgainst > 0
      ? formatRate3(goalieCareerTotals.saves / goalieCareerTotals.shotsAgainst)
      : "—";

  const headers = useMemo(() => {
    if (statType === "goalie") {
      return [
        "GP",
        "GS",
        "W",
        "L",
        "OTL",
        "GA",
        "GAA",
        "SA",
        "SV",
        "SV%",
        "SO",
        "MIN",
      ];
    }

    return [
      "GP",
      "G",
      "A",
      "PTS",
      "+/-",
      "PIM",
      "PPG",
      "PPA",
      "SHG",
      "SHA",
      "GWG",
      "SOG",
      "S%",
      "TOI/G",
    ];
  }, [statType]);

  if (loading) {
    return (
      <View style={styles.container}>
        <PlayerStatTableSkeleton />
      </View>
    );
  }

  if (error) {
    return <Text style={global.errorText}>Failed to load stats</Text>;
  }

  if (!filteredSeasons.length) {
    return (
      <View style={styles.container}>
        <HeadingWithDropdowns
          title={statType === "goalie" ? "Goalie" : "Skater"}
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

        <Text style={global.errorText}>No {statType} stats available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeadingWithDropdowns
        title={statType === "goalie" ? "Goalie" : "Skater"}
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
            const formatNHLSeason = (row: NhlSeasonStatsRow) => {
              const season = Number(row.season);

              if (Number.isFinite(season)) {
                const startYear = season - 1;
                const endYearShort = String(season).slice(-2);

                return `${startYear}-${endYearShort}`;
              }

              return row.displaySeason ?? "—";
            };
            return (
              <View key={row.rowKey} style={[styles.row, zebra, highlight]}>
                <Text style={styles.fixedCell}>{formatNHLSeason(row)}</Text>
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
            const team = getNHLTeamByEspnId(row.team ?? 0);

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
              const games = getGames(stats);
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
                  {statType === "skater" && (
                    <>
                      <Text style={styles.cell}>{displayStat(games)}</Text>
                      <Text style={styles.cell}>
                        {renderCount(getGoals(stats), games, statView)}
                      </Text>
                      <Text style={styles.cell}>
                        {renderCount(getAssists(stats), games, statView)}
                      </Text>
                      <Text style={styles.cell}>
                        {renderCount(getPoints(stats), games, statView)}
                      </Text>
                      <Text style={styles.cell}>
                        {displayStat(getPlusMinus(stats))}
                      </Text>
                      <Text style={styles.cell}>
                        {renderCount(getPenaltyMinutes(stats), games, statView)}
                      </Text>
                      <Text style={styles.cell}>
                        {renderCount(getPowerPlayGoals(stats), games, statView)}
                      </Text>
                      <Text style={styles.cell}>
                        {renderCount(
                          getPowerPlayAssists(stats),
                          games,
                          statView,
                        )}
                      </Text>
                      <Text style={styles.cell}>
                        {renderCount(
                          getShortHandedGoals(stats),
                          games,
                          statView,
                        )}
                      </Text>
                      <Text style={styles.cell}>
                        {renderCount(
                          getShortHandedAssists(stats),
                          games,
                          statView,
                        )}
                      </Text>
                      <Text style={styles.cell}>
                        {renderCount(
                          getGameWinningGoals(stats),
                          games,
                          statView,
                        )}
                      </Text>
                      <Text style={styles.cell}>
                        {renderCount(getShots(stats), games, statView)}
                      </Text>
                      <Text style={styles.cell}>
                        {displayStat(getShootingPct(stats))}
                      </Text>
                      <Text style={styles.cell}>
                        {displayStat(getTimeOnIcePerGame(stats))}
                      </Text>
                    </>
                  )}

                  {statType === "goalie" && (
                    <>
                      <Text style={styles.cell}>{displayStat(games)}</Text>
                      <Text style={styles.cell}>
                        {displayStat(getGoalieGamesStarted(stats))}
                      </Text>
                      <Text style={styles.cell}>
                        {displayStat(getGoalieWins(stats))}
                      </Text>
                      <Text style={styles.cell}>
                        {displayStat(getGoalieLosses(stats))}
                      </Text>
                      <Text style={styles.cell}>
                        {displayStat(getGoalieOvertimeLosses(stats))}
                      </Text>
                      <Text style={styles.cell}>
                        {displayStat(getGoalsAgainst(stats))}
                      </Text>
                      <Text style={styles.cell}>
                        {displayStat(getGoalsAgainstAverage(stats))}
                      </Text>
                      <Text style={styles.cell}>
                        {displayStat(getShotsAgainst(stats))}
                      </Text>
                      <Text style={styles.cell}>
                        {displayStat(getSaves(stats))}
                      </Text>
                      <Text style={styles.cell}>
                        {displayStat(getSavePct(stats))}
                      </Text>
                      <Text style={styles.cell}>
                        {displayStat(getShutouts(stats))}
                      </Text>
                      <Text style={styles.cell}>
                        {displayStat(getGoalieMinutes(stats))}
                      </Text>
                    </>
                  )}
                </View>
              );
            })}

            <View style={[styles.row, styles.careerRow]}>
              {statType === "skater" && (
                <>
                  <Text style={styles.careerCell}>
                    {skaterCareerTotals.games}
                  </Text>
                  <Text style={styles.careerCell}>
                    {renderCareerCount(
                      skaterCareerTotals.goals,
                      skaterCareerTotals.games,
                      statView,
                    )}
                  </Text>
                  <Text style={styles.careerCell}>
                    {renderCareerCount(
                      skaterCareerTotals.assists,
                      skaterCareerTotals.games,
                      statView,
                    )}
                  </Text>
                  <Text style={styles.careerCell}>
                    {renderCareerCount(
                      skaterCareerTotals.points,
                      skaterCareerTotals.games,
                      statView,
                    )}
                  </Text>
                  <Text style={styles.careerCell}>
                    {skaterCareerTotals.plusMinus}
                  </Text>
                  <Text style={styles.careerCell}>
                    {renderCareerCount(
                      skaterCareerTotals.penaltyMinutes,
                      skaterCareerTotals.games,
                      statView,
                    )}
                  </Text>
                  <Text style={styles.careerCell}>
                    {renderCareerCount(
                      skaterCareerTotals.powerPlayGoals,
                      skaterCareerTotals.games,
                      statView,
                    )}
                  </Text>
                  <Text style={styles.careerCell}>
                    {renderCareerCount(
                      skaterCareerTotals.powerPlayAssists,
                      skaterCareerTotals.games,
                      statView,
                    )}
                  </Text>
                  <Text style={styles.careerCell}>
                    {renderCareerCount(
                      skaterCareerTotals.shortHandedGoals,
                      skaterCareerTotals.games,
                      statView,
                    )}
                  </Text>
                  <Text style={styles.careerCell}>
                    {renderCareerCount(
                      skaterCareerTotals.shortHandedAssists,
                      skaterCareerTotals.games,
                      statView,
                    )}
                  </Text>
                  <Text style={styles.careerCell}>
                    {renderCareerCount(
                      skaterCareerTotals.gameWinningGoals,
                      skaterCareerTotals.games,
                      statView,
                    )}
                  </Text>
                  <Text style={styles.careerCell}>
                    {renderCareerCount(
                      skaterCareerTotals.shots,
                      skaterCareerTotals.games,
                      statView,
                    )}
                  </Text>
                  <Text style={styles.careerCell}>{careerShootingPct}</Text>
                  <Text style={styles.careerCell}>{careerTimeOnIce}</Text>
                </>
              )}

              {statType === "goalie" && (
                <>
                  <Text style={styles.careerCell}>
                    {goalieCareerTotals.games}
                  </Text>
                  <Text style={styles.careerCell}>
                    {goalieCareerTotals.gamesStarted}
                  </Text>
                  <Text style={styles.careerCell}>
                    {goalieCareerTotals.wins}
                  </Text>
                  <Text style={styles.careerCell}>
                    {goalieCareerTotals.losses}
                  </Text>
                  <Text style={styles.careerCell}>
                    {goalieCareerTotals.overtimeLosses}
                  </Text>
                  <Text style={styles.careerCell}>
                    {goalieCareerTotals.goalsAgainst}
                  </Text>
                  <Text style={styles.careerCell}>{careerGoalieGAA}</Text>
                  <Text style={styles.careerCell}>
                    {goalieCareerTotals.shotsAgainst}
                  </Text>
                  <Text style={styles.careerCell}>
                    {goalieCareerTotals.saves}
                  </Text>
                  <Text style={styles.careerCell}>{careerGoalieSavePct}</Text>
                  <Text style={styles.careerCell}>
                    {goalieCareerTotals.shutouts}
                  </Text>
                  <Text style={styles.careerCell}>
                    {goalieCareerTotals.minutes}
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
