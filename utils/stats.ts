import type {
  BasketballGameTeamStats as GameTeamStats,
  BasketballTeamStatRow as TeamStatRow,
} from "@/types/basketball/stats";

export type {
  GameTeamStats,
  BasketballPlayerStats as PlayerStats,
  BasketballLegacyRosterStatsProps as RosterStatsProps,
  TeamStatRow,
} from "@/types/basketball/stats";

// Team Stats
export const numberFormatter = new Intl.NumberFormat("en-US");
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

const formatFixedStat = (value: number | null | undefined): string => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "—";
  }

  return value.toFixed(1);
};

const formatPercentStat = (value: number | null | undefined): string => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "—";
  }

  return `${value.toFixed(1)}%`;
};

export const getTeamSummaryRows = (
  GameTeamStats: GameTeamStats,
): TeamStatRow[] => [
  {
    label: "Team",
    value: GameTeamStats?.team?.fullName || GameTeamStats?.team?.name || "—",
  },
  {
    label: "Record",
    value: GameTeamStats?.team?.recordSummary || "—",
  },
  {
    label: "Standing",
    value: GameTeamStats?.team?.standingSummary || "—",
  },
  {
    label: "Season",
    value: GameTeamStats?.season?.displayName || "—",
  },
];

export const getTeamDisplayAverages = (
  GameTeamStats: GameTeamStats,
): TeamStatRow[] => [
  {
    label: "Points Per Game",
    value: formatFixedStat(GameTeamStats.pointsPerGame),
  },
  {
    label: "Rebounds Per Game",
    value: formatFixedStat(GameTeamStats.reboundsPerGame),
  },
  {
    label: "Assists Per Game",
    value: formatFixedStat(GameTeamStats.assistsPerGame),
  },
  {
    label: "Steals Per Game",
    value: formatFixedStat(GameTeamStats.stealsPerGame),
  },
  {
    label: "Blocks Per Game",
    value: formatFixedStat(GameTeamStats.blocksPerGame),
  },
  {
    label: "Turnovers Per Game",
    value: formatFixedStat(GameTeamStats.turnoversPerGame),
  },
  {
    label: "Personal Fouls Per Game",
    value: formatFixedStat(GameTeamStats.foulsPerGame),
  },
  {
    label: "Field Goal %",
    value: formatPercentStat(GameTeamStats.fgPercent),
  },
  {
    label: "3 Point %",
    value: formatPercentStat(GameTeamStats.tpPercent),
  },
  {
    label: "Free Throw %",
    value: formatPercentStat(GameTeamStats.ftPercent),
  },
];

export const getTeamDisplayTotals = (
  GameTeamStats: GameTeamStats,
): TeamStatRow[] => [
  {
    label: "Total Points",
    value: formatStatValue(GameTeamStats.totalPoints),
  },
  {
    label: "Total Rebounds",
    value: formatStatValue(GameTeamStats.totalRebounds),
  },
  {
    label: "Total Assists",
    value: formatStatValue(GameTeamStats.totalAssists),
  },
  {
    label: "Total Steals",
    value: formatStatValue(
      Math.round(GameTeamStats.stealsPerGame * GameTeamStats.gamesPlayed),
    ),
  },
  {
    label: "Total Blocks",
    value: formatStatValue(
      Math.round(GameTeamStats.blocksPerGame * GameTeamStats.gamesPlayed),
    ),
  },
  {
    label: "Total Turnovers",
    value: formatStatValue(
      Math.round(GameTeamStats.turnoversPerGame * GameTeamStats.gamesPlayed),
    ),
  },
  {
    label: "Total Fouls",
    value: formatStatValue(
      Math.round(GameTeamStats.foulsPerGame * GameTeamStats.gamesPlayed),
    ),
  },
];
