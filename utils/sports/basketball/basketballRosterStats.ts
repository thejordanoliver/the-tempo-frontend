import type { PillTabOption } from "@/components/TabBars/PillTabs";
import type {
  BasketballRosterPlayer as RosterPlayer,
  BasketballRosterStatsResponse as RosterStatsResponse,
  BasketballStatMap as StatMap,
  BasketballStatTab as StatTab,
  BasketballStatValue as StatValue,
} from "@/types/basketball/stats";

export const STAT_TABS = [
  { label: "Player Stats", value: "Player Stats" },
  { label: "Team Stats", value: "Team Stats" },
] as const satisfies readonly PillTabOption<StatTab>[];

export const STAT_CELL_WIDTH = 80;

export const STAT_HEADERS = [
  "GP",
  "MIN",
  "PTS",
  "FGM-A",
  "FG%",
  "3PM-A",
  "3P%",
  "FTM-A",
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

export const LEADER_STATS = [
  { label: "Points", averageKey: "avgPoints" },
  { label: "Rebounds", averageKey: "avgRebounds" },
  { label: "Assists", averageKey: "avgAssists" },
  { label: "Blocks", averageKey: "avgBlocks" },
  { label: "Steals", averageKey: "avgSteals" },
] as const;

const numberFormatter = new Intl.NumberFormat("en-US");

export const formatStatValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "—";

  if (typeof value === "number") {
    return numberFormatter.format(value);
  }

  const raw = String(value).trim();

  if (raw.endsWith("%")) {
    const numeric = Number(raw.replace("%", ""));

    return Number.isFinite(numeric)
      ? `${numberFormatter.format(numeric)}%`
      : raw;
  }

  const numeric = Number(raw);

  return Number.isFinite(numeric) ? numberFormatter.format(numeric) : raw;
};

export const getNumericStatValue = (value: StatValue) => {
  if (value === null || value === undefined || value === "") return 0;

  const numeric = Number(String(value).replace("%", ""));

  return Number.isFinite(numeric) ? numeric : 0;
};

export const getPlayersFromRosterStats = (
  rosterStats: RosterStatsResponse | RosterPlayer[] | null | undefined,
) => {
  if (Array.isArray(rosterStats)) return rosterStats;

  return rosterStats?.players ?? [];
};

const getBestSeasonStats = (player: RosterPlayer) => {
  return (
    player.latestSeasonStats ??
    player.latestSeason ??
    player.currentSeasonStats ??
    null
  );
};

export const getAverages = (player: RosterPlayer) => {
  return getBestSeasonStats(player)?.averages ?? {};
};

const getTotals = (player: RosterPlayer) => {
  return getBestSeasonStats(player)?.totals ?? {};
};

export const getGamesPlayed = (player: RosterPlayer) => {
  return getNumericStatValue(getAverages(player).gamesPlayed);
};

const getMadeAttemptedStat = (
  averages: StatMap,
  totals: StatMap,
  averageKey: string,
  totalKey: string,
) => {
  return averages[averageKey] ?? totals[totalKey] ?? null;
};

export const getBasketballPlayerCells = (player: RosterPlayer) => {
  const averages = getAverages(player);
  const totals = getTotals(player);

  return [
    averages.gamesPlayed,
    averages.avgMinutes,
    averages.avgPoints,
    getMadeAttemptedStat(
      averages,
      totals,
      "avgFieldGoalsMade-avgFieldGoalsAttempted",
      "fieldGoalsMade-fieldGoalsAttempted",
    ),
    averages.fieldGoalPct ?? totals.fieldGoalPct,
    getMadeAttemptedStat(
      averages,
      totals,
      "avgThreePointFieldGoalsMade-avgThreePointFieldGoalsAttempted",
      "threePointFieldGoalsMade-threePointFieldGoalsAttempted",
    ),
    averages.threePointFieldGoalPct ?? totals.threePointFieldGoalPct,
    getMadeAttemptedStat(
      averages,
      totals,
      "avgFreeThrowsMade-avgFreeThrowsAttempted",
      "freeThrowsMade-freeThrowsAttempted",
    ),
    averages.freeThrowPct ?? totals.freeThrowPct,
    averages.avgOffensiveRebounds,
    averages.avgDefensiveRebounds,
    averages.avgRebounds,
    averages.avgAssists,
    averages.avgSteals,
    averages.avgBlocks,
    averages.avgTurnovers,
    averages.avgFouls,
    "—",
  ];
};

export const getPlayerName = (player: RosterPlayer) =>
  player.short_name ||
  player.full_name ||
  [player.first_name, player.last_name].filter(Boolean).join(" ") ||
  "Unknown Player";


