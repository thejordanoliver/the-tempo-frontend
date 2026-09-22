import type { PillTabOption } from "@/components/TabBars/PillTabs";
import type {
  FootballLeaderConfig,
  FootballPlayerStatTable,
  FootballRosterStatsPlayer,
  FootballRosterStatsResponse,
  FootballSeasonStats,
  FootballStatGroup,
  FootballStatPath,
  FootballStatValue,
  FootballTableColumn,
  StatDisplayCategory,
  StatRow,
  StatTab,
  TeamStats,
} from "@/types/football/stats";

export const STAT_TABS = [
  { label: "Player Stats", value: "Player Stats" },
  { label: "Team Stats", value: "Team Stats" },
] as const satisfies readonly PillTabOption<StatTab>[];

const formatValue = (value: number | undefined | null, suffix = "") => {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;

  return `${safeValue}${suffix}`;
};

const formatTime = (seconds: number | undefined | null) => {
  const safeSeconds = Number.isFinite(Number(seconds)) ? Number(seconds) : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = Math.floor(safeSeconds % 60);

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
};

const createRow = (
  name: string,
  displayName: string,
  value: number,
  suffix = "",
): StatRow => ({
  name,
  displayName,
  value,
  displayValue: formatValue(value, suffix),
});

export const parseStatNumber = (value: FootballStatValue) => {
  if (value === null || value === undefined || value === "") return 0;

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const normalized = String(value).trim().replace(/,/g, "").replace(/%$/, "");
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
};

const isStatGroup = (value: unknown): value is FootballStatGroup =>
  !!value && typeof value === "object" && !Array.isArray(value);

const hasStatValue = (value: FootballStatValue) =>
  value !== null && value !== undefined && value !== "";

export const getPlayersFromRosterStats = (
  rosterStats:
    | FootballRosterStatsResponse
    | FootballRosterStatsPlayer[]
    | null
    | undefined,
) => {
  if (Array.isArray(rosterStats)) return rosterStats;

  return rosterStats?.players ?? [];
};

export const getStatByPath = (
  stats: FootballSeasonStats | null | undefined,
  path: FootballStatPath,
): FootballStatValue => {
  const nestedGroup = stats?.stats?.[path.group];

  if (isStatGroup(nestedGroup)) {
    return nestedGroup[path.key];
  }

  const legacyGroup = stats?.[path.group];

  return isStatGroup(legacyGroup) ? legacyGroup[path.key] : undefined;
};

export const getPlayerStatValue = (
  player: FootballRosterStatsPlayer,
  column: FootballTableColumn,
): FootballStatValue => {
  const paths = [column, ...(column.fallbacks ?? [])];

  for (const path of paths) {
    const value = getStatByPath(player.latestSeasonStats, path);

    if (hasStatValue(value)) {
      return value;
    }
  }

  return undefined;
};

export const hasAnyStatForTable = (
  player: FootballRosterStatsPlayer,
  columns: FootballTableColumn[],
) => columns.some((column) => hasStatValue(getPlayerStatValue(player, column)));

export const getPlayerName = (player: FootballRosterStatsPlayer) =>
  player.short_name ||
  player.full_name ||
  [player.first_name, player.last_name].filter(Boolean).join(" ") ||
  "Unknown Player";

export const getPlayerKey = (player: FootballRosterStatsPlayer, index: number) =>
  String(player.playerId || player.player_id || player.id || index);

export const getPlayerInitials = (player: FootballRosterStatsPlayer) => {
  const nameParts = getPlayerName(player).split(/\s+/).filter(Boolean);
  const initials = nameParts
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

  return initials || "?";
};

export const LEADER_STATS: FootballLeaderConfig[] = [
  {
    label: "Passing",
    path: { group: "passing", key: "passingYards" },
  },
  {
    label: "Rushing",
    path: { group: "rushing", key: "rushingYards" },
  },
  {
    label: "Receiving",
    path: { group: "receiving", key: "receivingYards" },
  },
  {
    label: "Tackles",
    path: { group: "defensive", key: "totalTackles" },
  },
  {
    label: "Interceptions",
    path: { group: "defensive", key: "interceptions" },
  },
];

export const PLAYER_STAT_TABLES: FootballPlayerStatTable[] = [
  {
    title: "Passing",
    columns: [
      { label: "CMP", group: "passing", key: "completions" },
      { label: "ATT", group: "passing", key: "passingAttempts" },
      { label: "CMP%", group: "passing", key: "completionPct" },
      { label: "YDS", group: "passing", key: "passingYards" },
      { label: "TD", group: "passing", key: "passingTouchdowns" },
      { label: "INT", group: "passing", key: "interceptions" },
      { label: "AVG", group: "passing", key: "yardsPerPassAttempt" },
      { label: "LNG", group: "passing", key: "longPassing" },
      { label: "SACK", group: "passing", key: "sacks" },
      { label: "RTG", group: "passing", key: "QBRating" },
    ],
  },
  {
    title: "Rushing",
    columns: [
      { label: "CAR", group: "rushing", key: "rushingAttempts" },
      { label: "YDS", group: "rushing", key: "rushingYards" },
      { label: "AVG", group: "rushing", key: "yardsPerRushAttempt" },
      { label: "TD", group: "rushing", key: "rushingTouchdowns" },
      { label: "LNG", group: "rushing", key: "longRushing" },
    ],
  },
  {
    title: "Receiving",
    columns: [
      { label: "REC", group: "receiving", key: "receptions" },
      { label: "YDS", group: "receiving", key: "receivingYards" },
      { label: "AVG", group: "receiving", key: "yardsPerReception" },
      { label: "TD", group: "receiving", key: "receivingTouchdowns" },
      { label: "LNG", group: "receiving", key: "longReception" },
    ],
  },
  {
    title: "Defense",
    columns: [
      { label: "TOT", group: "defensive", key: "totalTackles" },
      { label: "SOLO", group: "defensive", key: "soloTackles" },
      { label: "AST", group: "defensive", key: "assistTackles" },
      { label: "SACK", group: "defensive", key: "sacks" },
      { label: "INT", group: "defensive", key: "interceptions" },
      { label: "PD", group: "defensive", key: "passesDefended" },
      { label: "FF", group: "defensive", key: "fumblesForced" },
      { label: "INT YDS", group: "defensive", key: "interceptionYards" },
      { label: "INT TD", group: "defensive", key: "interceptionTouchdowns" },
    ],
  },
  {
    title: "Special Teams",
    columns: [
      { label: "KR", group: "returning", key: "kickReturns" },
      { label: "KR YDS", group: "returning", key: "kickReturnYards" },
      { label: "KR LNG", group: "returning", key: "longKickReturn" },
      { label: "KR TD", group: "returning", key: "kickReturnTouchdowns" },
      { label: "PR", group: "returning", key: "puntReturns" },
      { label: "PR YDS", group: "returning", key: "puntReturnYards" },
      { label: "PR LNG", group: "returning", key: "longPuntReturn" },
      { label: "PR TD", group: "returning", key: "puntReturnTouchdowns" },
      {
        label: "FG",
        group: "scoring",
        key: "fieldGoals",
        fallbacks: [{ group: "kicking", key: "fieldGoals" }],
      },
      {
        label: "PAT",
        group: "scoring",
        key: "kickExtraPoints",
        fallbacks: [{ group: "kicking", key: "kickExtraPoints" }],
      },
      { label: "PUNTS", group: "punting", key: "punts" },
      { label: "P YDS", group: "punting", key: "puntYards" },
      { label: "P LNG", group: "punting", key: "longPunt" },
    ],
  },
];

export const buildFootballStatCategories = (
  stats: TeamStats,
): StatDisplayCategory[] => [
  {
    key: "passing",
    name: "Passing",
    stats: [
      createRow("completionPct", "Completion %", stats.completionPct, "%"),
      createRow("completions", "Completions", stats.completions),
      createRow("passingAttempts", "Passing Attempts", stats.passingAttempts),
      createRow("passingYards", "Passing Yards", stats.passingYards),
      createRow(
        "passingYardsPerGame",
        "Passing Yards/Game",
        stats.passingYardsPerGame,
      ),
      createRow(
        "yardsPerPassAttempt",
        "Yards/Pass Attempt",
        stats.yardsPerPassAttempt,
      ),
      createRow(
        "passingTouchdowns",
        "Passing Touchdowns",
        stats.passingTouchdowns,
      ),
      createRow("interceptions", "Interceptions", stats.interceptions),
      createRow(
        "interceptionPct",
        "Interception %",
        stats.interceptionPct,
        "%",
      ),
      createRow("QBRating", "QB Rating", stats.QBRating),
      createRow("sacks", "Sacks Taken", stats.sacks),
      createRow("sackYardsLost", "Sack Yards Lost", stats.sackYardsLost),
      createRow("longPassing", "Long Pass", stats.longPassing),
    ],
  },
  {
    key: "rushing",
    name: "Rushing",
    stats: [
      createRow("rushingAttempts", "Rushing Attempts", stats.rushingAttempts),
      createRow("rushingYards", "Rushing Yards", stats.rushingYards),
      createRow(
        "rushingYardsPerGame",
        "Rushing Yards/Game",
        stats.rushingYardsPerGame,
      ),
      createRow(
        "yardsPerRushAttempt",
        "Yards/Rush Attempt",
        stats.yardsPerRushAttempt,
      ),
      createRow(
        "rushingTouchdowns",
        "Rushing Touchdowns",
        stats.rushingTouchdowns,
      ),
      createRow("longRushing", "Long Rush", stats.longRushing),
      createRow("rushingBigPlays", "Rushing Big Plays", stats.rushingBigPlays),
      createRow("rushingFumbles", "Rushing Fumbles", stats.rushingFumbles),
      createRow(
        "rushingFumblesLost",
        "Rushing Fumbles Lost",
        stats.rushingFumblesLost,
      ),
      createRow(
        "rushingFirstDowns",
        "Rushing First Downs",
        stats.rushingFirstDowns,
      ),
    ],
  },
  {
    key: "receiving",
    name: "Receiving",
    stats: [
      createRow("receptions", "Receptions", stats.receptions),
      createRow("receivingTargets", "Targets", stats.receivingTargets),
      createRow("receivingYards", "Receiving Yards", stats.receivingYards),
      createRow(
        "receivingYardsPerGame",
        "Receiving Yards/Game",
        stats.receivingYardsPerGame,
      ),
      createRow(
        "yardsPerReception",
        "Yards/Reception",
        stats.yardsPerReception,
      ),
      createRow(
        "receivingTouchdowns",
        "Receiving Touchdowns",
        stats.receivingTouchdowns,
      ),
      createRow("longReception", "Long Reception", stats.longReception),
      createRow(
        "receivingBigPlays",
        "Receiving Big Plays",
        stats.receivingBigPlays,
      ),
      createRow(
        "receivingYardsAfterCatch",
        "Yards After Catch",
        stats.receivingYardsAfterCatch,
      ),
      createRow(
        "receivingFirstDowns",
        "Receiving First Downs",
        stats.receivingFirstDowns,
      ),
      createRow(
        "receivingFumbles",
        "Receiving Fumbles",
        stats.receivingFumbles,
      ),
      createRow(
        "receivingFumblesLost",
        "Receiving Fumbles Lost",
        stats.receivingFumblesLost,
      ),
    ],
  },
  {
    key: "efficiency",
    name: "First Downs / Efficiency",
    stats: [
      createRow("firstDowns", "First Downs", stats.firstDowns),
      createRow(
        "firstDownsRushing",
        "Rushing First Downs",
        stats.firstDownsRushing,
      ),
      createRow(
        "firstDownsPassing",
        "Passing First Downs",
        stats.firstDownsPassing,
      ),
      createRow(
        "firstDownsPenalty",
        "Penalty First Downs",
        stats.firstDownsPenalty,
      ),
      createRow(
        "thirdDownConvs",
        "Third Down Conversions",
        stats.thirdDownConvs,
      ),
      createRow(
        "thirdDownAttempts",
        "Third Down Attempts",
        stats.thirdDownAttempts,
      ),
      createRow(
        "thirdDownConvPct",
        "Third Down %",
        stats.thirdDownConvPct,
        "%",
      ),
      createRow(
        "fourthDownConvs",
        "Fourth Down Conversions",
        stats.fourthDownConvs,
      ),
      createRow(
        "fourthDownAttempts",
        "Fourth Down Attempts",
        stats.fourthDownAttempts,
      ),
      createRow(
        "fourthDownConvPct",
        "Fourth Down %",
        stats.fourthDownConvPct,
        "%",
      ),
      {
        name: "possessionTimeSeconds",
        displayName: "Possession Time",
        value: stats.possessionTimeSeconds,
        displayValue: formatTime(stats.possessionTimeSeconds),
      },
      createRow(
        "redzoneScoringPct",
        "Red Zone Scoring %",
        stats.redzoneScoringPct,
        "%",
      ),
      createRow(
        "redzoneTouchdownPct",
        "Red Zone TD %",
        stats.redzoneTouchdownPct,
        "%",
      ),
      createRow("totalPenalties", "Penalties", stats.totalPenalties),
      createRow("totalPenaltyYards", "Penalty Yards", stats.totalPenaltyYards),
      createRow("totalTakeaways", "Takeaways", stats.totalTakeaways),
      createRow("totalGiveaways", "Giveaways", stats.totalGiveaways),
      createRow(
        "turnOverDifferential",
        "Turnover Differential",
        stats.turnOverDifferential,
      ),
    ],
  },
  {
    key: "defense",
    name: "Defense",
    stats: [
      createRow("soloTackles", "Solo Tackles", stats.soloTackles),
      createRow("assistTackles", "Assisted Tackles", stats.assistTackles),
      createRow("totalTackles", "Total Tackles", stats.totalTackles),
      createRow("tacklesForLoss", "Tackles For Loss", stats.tacklesForLoss),
      createRow("sackYards", "Sack Yards", stats.sackYards),
      createRow("stuffs", "Stuffs", stats.stuffs),
      createRow("passesDefended", "Passes Defended", stats.passesDefended),
      createRow(
        "interceptionYards",
        "Interception Yards",
        stats.interceptionYards,
      ),
      createRow(
        "interceptionTouchdowns",
        "Interception Touchdowns",
        stats.interceptionTouchdowns,
      ),
      createRow(
        "longInterception",
        "Long Interception",
        stats.longInterception,
      ),
      createRow("fumblesForced", "Fumbles Forced", stats.fumblesForced),
      createRow(
        "fumblesRecovered",
        "Fumbles Recovered",
        stats.fumblesRecovered,
      ),
      createRow(
        "fumblesTouchdowns",
        "Fumble Touchdowns",
        stats.fumblesTouchdowns,
      ),
      createRow("kicksBlocked", "Kicks Blocked", stats.kicksBlocked),
    ],
  },
  {
    key: "returns",
    name: "Returns",
    stats: [
      createRow("kickReturns", "Kick Returns", stats.kickReturns),
      createRow("kickReturnYards", "Kick Return Yards", stats.kickReturnYards),
      createRow(
        "yardsPerKickReturn",
        "Yards/Kick Return",
        stats.yardsPerKickReturn,
      ),
      createRow("longKickReturn", "Long Kick Return", stats.longKickReturn),
      createRow(
        "kickReturnTouchdowns",
        "Kick Return Touchdowns",
        stats.kickReturnTouchdowns,
      ),
      createRow("puntReturns", "Punt Returns", stats.puntReturns),
      createRow("puntReturnYards", "Punt Return Yards", stats.puntReturnYards),
      createRow(
        "yardsPerPuntReturn",
        "Yards/Punt Return",
        stats.yardsPerPuntReturn,
      ),
      createRow("longPuntReturn", "Long Punt Return", stats.longPuntReturn),
      createRow(
        "puntReturnTouchdowns",
        "Punt Return Touchdowns",
        stats.puntReturnTouchdowns,
      ),
    ],
  },
  {
    key: "kicking",
    name: "Kicking",
    stats: [
      createRow("fieldGoalsMade", "Field Goals Made", stats.fieldGoalsMade),
      createRow(
        "fieldGoalAttempts",
        "Field Goal Attempts",
        stats.fieldGoalAttempts,
      ),
      createRow("fieldGoalPct", "Field Goal %", stats.fieldGoalPct, "%"),
      createRow(
        "longFieldGoalMade",
        "Long Field Goal",
        stats.longFieldGoalMade,
      ),
      createRow("extraPointsMade", "Extra Points Made", stats.extraPointsMade),
      createRow(
        "extraPointAttempts",
        "Extra Point Attempts",
        stats.extraPointAttempts,
      ),
      createRow("extraPointPct", "Extra Point %", stats.extraPointPct, "%"),
      createRow(
        "totalKickingPoints",
        "Kicking Points",
        stats.totalKickingPoints,
      ),
      createRow("touchbackPct", "Touchback %", stats.touchbackPct, "%"),
    ],
  },
  {
    key: "punting",
    name: "Punting",
    stats: [
      createRow("punts", "Punts", stats.punts),
      createRow("puntYards", "Punt Yards", stats.puntYards),
      createRow("longPunt", "Long Punt", stats.longPunt),
      createRow(
        "grossAvgPuntYards",
        "Gross Avg Punt Yards",
        stats.grossAvgPuntYards,
      ),
      createRow("netAvgPuntYards", "Net Avg Punt Yards", stats.netAvgPuntYards),
      createRow("puntsBlocked", "Punts Blocked", stats.puntsBlocked),
      createRow("puntsInside20", "Punts Inside 20", stats.puntsInside20),
      createRow("touchbacks", "Touchbacks", stats.touchbacks),
      createRow("fairCatches", "Fair Catches", stats.fairCatches),
    ],
  },
  {
    key: "scoring",
    name: "Scoring / Totals",
    stats: [
      createRow("gamesPlayed", "Games Played", stats.gamesPlayed),
      createRow("totalPoints", "Total Points", stats.totalPoints),
      createRow("totalPointsPerGame", "Points/Game", stats.totalPointsPerGame),
      createRow("totalYards", "Total Yards", stats.totalYards),
      createRow("yardsPerGame", "Yards/Game", stats.yardsPerGame),
      createRow(
        "totalOffensivePlays",
        "Offensive Plays",
        stats.totalOffensivePlays,
      ),
      createRow("totalTouchdowns", "Total Touchdowns", stats.totalTouchdowns),
      createRow(
        "returnTouchdowns",
        "Return Touchdowns",
        stats.returnTouchdowns,
      ),
      createRow("fieldGoals", "Field Goals", stats.fieldGoals),
      createRow("kickExtraPoints", "Kick Extra Points", stats.kickExtraPoints),
      createRow(
        "totalTwoPointConvs",
        "Two Point Conversions",
        stats.totalTwoPointConvs,
      ),
    ],
  },
];


