import type { PillTabOption } from "@/components/TabBars/PillTabs";
import type {
  BaseballLeaderDefinition as LeaderDefinition,
  BaseballPlayerStatRow as PlayerStatRow,
  BaseballRosterPlayer as RosterPlayer,
  BaseballRosterStats,
  BaseballSeasonStats,
  BaseballStatColumn as StatColumn,
  BaseballStatGroupKey as StatGroupKey,
  BaseballStatLeader as StatLeader,
  BaseballStatMap,
  BaseballStatTab as StatTab,
  BaseballStatValue,
} from "@/types/baseball/stats";

export const STAT_TABS = [
  { label: "Player Stats", value: "Player Stats" },
  { label: "Team Stats", value: "Team Stats" },
] as const satisfies readonly PillTabOption<StatTab>[];
export const STAT_CELL_WIDTH = 80;

export const LEADER_STATS: readonly LeaderDefinition[] = [
  {
    label: "Batting Average",
    group: "career-batting",
    key: "avg",
    order: "desc",
  },
  {
    label: "Home Runs",
    group: "career-batting",
    key: "homeRuns",
    order: "desc",
  },
  { label: "RBIs", group: "career-batting", key: "RBIs", order: "desc" },
  { label: "OPS", group: "career-batting", key: "OPS", order: "desc" },
  {
    label: "Stolen Bases",
    group: "career-batting",
    key: "stolenBases",
    order: "desc",
  },
  { label: "ERA", group: "pitching", key: "ERA", order: "asc" },
  { label: "Wins", group: "pitching", key: "wins", order: "desc" },
  { label: "Strikeouts", group: "pitching", key: "strikeouts", order: "desc" },
  { label: "Saves", group: "pitching", key: "saves", order: "desc" },
  { label: "WHIP", group: "pitching", key: "WHIP", order: "asc" },
];

export const BATTING_STAT_COLUMNS: readonly StatColumn[] = [
  { header: "GP", getValue: (row) => row.battingStats?.gamesPlayed },
  { header: "AB", getValue: (row) => row.battingStats?.atBats },
  { header: "R", getValue: (row) => row.battingStats?.runs },
  { header: "H", getValue: (row) => row.battingStats?.hits },
  { header: "2B", getValue: (row) => row.battingStats?.doubles },
  { header: "3B", getValue: (row) => row.battingStats?.triples },
  { header: "HR", getValue: (row) => row.battingStats?.homeRuns },
  { header: "RBI", getValue: (row) => row.battingStats?.RBIs },
  { header: "BB", getValue: (row) => row.battingStats?.walks },
  { header: "SO", getValue: (row) => row.battingStats?.strikeouts },
  { header: "SB", getValue: (row) => row.battingStats?.stolenBases },
  { header: "AVG", getValue: (row) => row.battingStats?.avg },
  { header: "OBP", getValue: (row) => row.battingStats?.onBasePct },
  { header: "SLG", getValue: (row) => row.battingStats?.slugAvg },
  { header: "OPS", getValue: (row) => row.battingStats?.OPS },
  {
    header: "bWAR",
    getValue: (row) =>
      row.battingStats?.WARBR ?? row.advancedBattingStats?.WARBR,
  },
];

export const PITCHING_STAT_COLUMNS: readonly StatColumn[] = [
  { header: "GP", getValue: (row) => row.pitchingStats?.gamesPlayed },
  { header: "GS", getValue: (row) => row.pitchingStats?.gamesStarted },
  { header: "W", getValue: (row) => row.pitchingStats?.wins },
  { header: "L", getValue: (row) => row.pitchingStats?.losses },
  { header: "ERA", getValue: (row) => row.pitchingStats?.ERA },
  { header: "IP", getValue: (row) => row.pitchingStats?.innings },
  { header: "H", getValue: (row) => row.pitchingStats?.hits },
  { header: "R", getValue: (row) => row.pitchingStats?.runs },
  { header: "ER", getValue: (row) => row.pitchingStats?.earnedRuns },
  { header: "BB", getValue: (row) => row.pitchingStats?.walks },
  { header: "SO", getValue: (row) => row.pitchingStats?.strikeouts },
  { header: "WHIP", getValue: (row) => row.pitchingStats?.WHIP },
  { header: "SV", getValue: (row) => row.pitchingStats?.saves },
  { header: "HLD", getValue: (row) => row.pitchingStats?.holds },
  { header: "BS", getValue: (row) => row.pitchingStats?.blownSaves },
  {
    header: "K/BB",
    getValue: (row) => row.pitchingStats?.strikeoutToWalkRatio,
  },
  { header: "pWAR", getValue: (row) => row.pitchingStats?.WARBR },
];

const numberFormatter = new Intl.NumberFormat("en-US");

const isStatMap = (value: unknown): value is BaseballStatMap => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every(
    (item) =>
      item === null || typeof item === "string" || typeof item === "number",
  );
};

const hasDisplayableStatValue = (value: BaseballStatValue | undefined) =>
  value !== null && value !== undefined && String(value).trim() !== "";

const hasUsableStatMap = (
  stats: BaseballStatMap | null | undefined,
): stats is BaseballStatMap =>
  Boolean(stats && Object.values(stats).some(hasDisplayableStatValue));

const getStatsGroup = (
  season: BaseballSeasonStats | null | undefined,
  group: StatGroupKey,
) => {
  const value = season?.stats?.[group];

  return isStatMap(value) ? value : null;
};

const hasUsableSeasonStats = (
  season: BaseballSeasonStats | null | undefined,
  group?: StatGroupKey,
) => {
  if (!season?.stats || typeof season.stats !== "object") return false;

  if (group) return hasUsableStatMap(getStatsGroup(season, group));

  return (
    hasUsableStatMap(getStatsGroup(season, "career-batting")) ||
    hasUsableStatMap(getStatsGroup(season, "advanced-batting")) ||
    hasUsableStatMap(getStatsGroup(season, "pitching"))
  );
};

const getBestSeasonStats = (player: RosterPlayer, group?: StatGroupKey) => {
  const candidates = [
    player.latestSeasonStats,
    player.currentSeasonStats,
    player.latestSeason,
  ];

  const priorityMatch = candidates.find((season) =>
    hasUsableSeasonStats(season, group),
  );

  if (priorityMatch) return priorityMatch;

  return (
    (player.seasonStats ?? []).find((season) =>
      hasUsableSeasonStats(season, group),
    ) ?? null
  );
};

export const getPlayersFromRosterStats = (
  rosterStats: BaseballRosterStats | RosterPlayer[] | null | undefined,
) => {
  if (Array.isArray(rosterStats)) return rosterStats;

  return rosterStats?.players ?? [];
};

const parseNumericStat = (value: BaseballStatValue | undefined) => {
  if (!hasDisplayableStatValue(value)) return null;

  const numeric = Number(String(value).replace(/[%,$]/g, "").trim());

  return Number.isFinite(numeric) ? numeric : null;
};

export const formatStatValue = (value: BaseballStatValue | undefined): string => {
  if (!hasDisplayableStatValue(value)) return "—";

  if (typeof value === "number") return numberFormatter.format(value);

  return String(value).trim();
};

const getGamesPlayed = (stats: BaseballStatMap | null | undefined) =>
  parseNumericStat(stats?.gamesPlayed) ?? 0;

export const getPlayerId = (player: RosterPlayer) => player.playerId ?? player.id;

export const getPlayerDisplayName = (player: RosterPlayer) =>
  player.short_name ||
  [player.first_name, player.last_name].filter(Boolean).join(" ") ||
  player.full_name;

export const getPlayerRows = (players: RosterPlayer[]) => {
  return players
    .map<PlayerStatRow | null>((player) => {
      const battingSeason = getBestSeasonStats(player, "career-batting");
      const pitchingSeason = getBestSeasonStats(player, "pitching");
      const battingStats = getStatsGroup(battingSeason, "career-batting");
      const pitchingStats = getStatsGroup(pitchingSeason, "pitching");
      const advancedBattingStats = getStatsGroup(
        battingSeason,
        "advanced-batting",
      );
      const hasBattingStats =
        hasUsableStatMap(battingStats) && getGamesPlayed(battingStats) > 0;
      const hasPitchingStats =
        hasUsableStatMap(pitchingStats) && getGamesPlayed(pitchingStats) > 0;

      if (!hasBattingStats && !hasPitchingStats) return null;

      return {
        player,
        battingStats: hasBattingStats ? battingStats : null,
        advancedBattingStats,
        pitchingStats: hasPitchingStats ? pitchingStats : null,
      };
    })
    .filter((row): row is PlayerStatRow => row !== null);
};

export const getStatLeader = (rows: PlayerStatRow[], definition: LeaderDefinition) => {
  return rows.reduce<StatLeader | null>((leader, row) => {
    const stats =
      definition.group === "advanced-batting"
        ? row.advancedBattingStats
        : definition.group === "pitching"
          ? row.pitchingStats
          : row.battingStats;
    const value = stats?.[definition.key];
    const numericValue = parseNumericStat(value);

    if (numericValue === null) return leader;

    const leaderValue = value ?? null;

    if (!leader) return { row, value: leaderValue, numericValue };

    const isBetter =
      definition.order === "asc"
        ? numericValue < leader.numericValue
        : numericValue > leader.numericValue;

    return isBetter ? { row, value: leaderValue, numericValue } : leader;
  }, null);
};


