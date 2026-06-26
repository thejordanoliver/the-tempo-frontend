/**
 * Football stat/type definitions
 *
 * This file is shared by football stat tables, roster stat views, hooks,
 * and API response normalization.
 *
 * Main idea:
 * - API types keep flexible / optional fields because ESPN/backend payloads can vary.
 * - UI types are stricter because components should receive clean normalized data.
 */

/* ============================================================================
 * Shared primitives
 * ========================================================================== */

export type FootballLeague = "CFB" | "NFL";

/**
 * Stat values can arrive as numbers, strings, or be missing/null depending on
 * the endpoint and stat category.
 */
export type FootballStatValue = string | number | null | undefined;

/* ============================================================================
 * Player season stat table API shapes
 * ========================================================================== */

/**
 * Single ESPN/player stat item.
 *
 * Example:
 * {
 *   name: "passingYards",
 *   displayName: "Passing Yards",
 *   value: 3500,
 *   displayValue: "3,500"
 * }
 */
export type Stat = {
  name: string;
  label?: string;
  value: number | null;
  displayValue: string;
  displayName?: string;
  description?: string;
};

/**
 * Group of related stats returned for a season.
 *
 * Examples:
 * - passing
 * - rushing
 * - receiving
 * - defensive
 */
export type Category = {
  name: string;
  displayName: string;
  stats: Stat[];
};

/**
 * One season worth of player stats.
 *
 * Some fields are duplicated because different endpoints can use different
 * naming conventions or omit metadata.
 */
export type Season = {
  year: string;
  season?: number;
  displaySeason?: string;
  teamId?: string;
  espnTeamId?: string;
  teamSlug?: string;
  position?: string;
  seasonType?: number;
  seasonTypeName?: string;
  categories: Category[];
};

export type StatTableProps = {
  data: Season[];
  loading: boolean;
  error: string | null;
  position?: string;
  league: FootballLeague;
};

/* ============================================================================
 * Raw team stat API shapes
 * ========================================================================== */

/**
 * Individual stat item from a team stats response.
 *
 * `value` is flexible because some API responses return raw numbers while
 * others return formatted strings.
 */
export type StatItem = {
  name: string;
  displayName?: string;
  shortDisplayName?: string;
  description?: string;
  abbreviation?: string;
  value?: string | number | null;
  displayValue?: string;
};

/**
 * A group/category of team stats from the API.
 */
export type StatGroup = {
  name?: string;
  stats?: StatItem[];
};

/**
 * Raw backend/API response for team stats.
 */
export type TeamStatsApiResponse = {
  team?: {
    id?: string | number;
    name?: string;
    abbreviation?: string;
    logo?: string;
    recordSummary?: string;
    standingSummary?: string;
  };
  season?: {
    year?: string | number;
    type?: string | number;
    name?: string;
    displayName?: string;
  };
  stats?: Record<string, StatGroup | undefined>;
};

/**
 * Lookup maps built from stat groups.
 *
 * `values` stores numeric versions for sorting/calculations.
 * `displays` stores formatted labels for the UI.
 */
export type StatStore = {
  values: Record<string, number | undefined>;
  displays: Record<string, string | undefined>;
};

/**
 * Built stat maps for all team stats plus category-specific groups.
 */
export type BuiltStatMaps = {
  all: StatStore;
  groups: Record<string, StatStore | undefined>;
};

/* ============================================================================
 * Normalized team stats used by the UI
 * ========================================================================== */

/**
 * Normalized team stats object used by football stat cards/tables.
 *
 * Keep this flat because it makes table config, sorting, and display mapping
 * easier in the UI.
 */
export type TeamStats = {
  // --------------------------------------------------------------------------
  // Passing
  // --------------------------------------------------------------------------
  completionPct: number;
  completions: number;
  interceptionPct: number;
  interceptions: number;
  longPassing: number;
  netPassingYards: number;
  netPassingYardsPerGame: number;
  passingAttempts: number;
  passingTouchdownPct: number;
  passingTouchdowns: number;
  QBRating: number;
  sacks: number;
  sackYardsLost: number;
  yardsPerPassAttempt: number;
  passingYards: number;
  passingFumblesLost: number;
  passingYardsPerGame: number;
  completionAttempts: number;
  sacksYardsLost: number;

  // --------------------------------------------------------------------------
  // Rushing
  // --------------------------------------------------------------------------
  rushingAttempts: number;
  rushingYards: number;
  yardsPerRushAttempt: number;
  longRushing: number;
  rushingBigPlays: number;
  rushingTouchdowns: number;
  rushingYardsPerGame: number;
  rushingFumbles: number;
  rushingFumblesLost: number;
  rushingFirstDowns: number;

  // --------------------------------------------------------------------------
  // Receiving
  // --------------------------------------------------------------------------
  receptions: number;
  receivingTargets: number;
  receivingYards: number;
  receivingTouchdowns: number;
  longReception: number;
  receivingBigPlays: number;
  receivingYardsPerGame: number;
  receivingFumbles: number;
  receivingFumblesLost: number;
  receivingYardsAfterCatch: number;
  receivingFirstDowns: number;
  yardsPerReception: number;

  // --------------------------------------------------------------------------
  // First downs / efficiency / possession
  // --------------------------------------------------------------------------
  firstDowns: number;
  firstDownsRushing: number;
  firstDownsPassing: number;
  firstDownsPenalty: number;
  thirdDownConvs: number;
  thirdDownAttempts: number;
  thirdDownConvPct: number;
  fourthDownConvs: number;
  fourthDownAttempts: number;
  fourthDownConvPct: number;
  totalPenalties: number;
  totalPenaltyYards: number;
  possessionTimeSeconds: number;
  redzoneFieldGoalPct: number;
  redzoneScoringPct: number;
  redzoneEfficiencyPct: number;
  redzoneTouchdownPct: number;
  totalTakeaways: number;
  totalGiveaways: number;
  turnOverDifferential: number;
  fumblesLost: number;
  thirdDownEff: number;
  fourthDownEff: number;
  totalPenaltiesYards: number;

  // --------------------------------------------------------------------------
  // Defensive
  // --------------------------------------------------------------------------
  soloTackles: number;
  assistTackles: number;
  totalTackles: number;
  sackYards: number;
  stuffs: number;
  passesDefended: number;
  avgInterceptionYards: number;
  longInterception: number;
  miscTouchdowns: number;
  kicksBlocked: number;
  tacklesForLoss: number;

  // --------------------------------------------------------------------------
  // Interceptions
  // --------------------------------------------------------------------------
  interceptionYards: number;
  interceptionTouchdowns: number;
  totalInterceptionsYards: number;

  // --------------------------------------------------------------------------
  // Fumbles
  // --------------------------------------------------------------------------
  fumbles: number;
  fumblesForced: number;
  fumblesRecovered: number;
  fumblesTouchdowns: number;
  gamesPlayed: number;
  fumblesAndLost: number;

  // --------------------------------------------------------------------------
  // Returns
  // --------------------------------------------------------------------------
  kickReturns: number;
  kickReturnYards: number;
  yardsPerKickReturn: number;
  longKickReturn: number;
  kickReturnTouchdowns: number;
  puntReturns: number;
  puntReturnYards: number;
  yardsPerPuntReturn: number;
  longPuntReturn: number;
  puntReturnTouchdowns: number;
  puntReturnFairCatches: number;
  kickReturnFumblesLost: number;
  puntReturnFumblesLost: number;
  totalPuntReturnsYards: number;

  // --------------------------------------------------------------------------
  // Kicking
  // --------------------------------------------------------------------------
  fieldGoalsMade: number;
  fieldGoalAttempts: number;
  fieldGoalPct: number;
  longFieldGoalMade: number;
  fieldGoalAttempts1_19: number;
  fieldGoalAttempts20_29: number;
  fieldGoalAttempts30_39: number;
  fieldGoalAttempts40_49: number;
  fieldGoalAttempts50: number;
  extraPointsMade: number;
  extraPointAttempts: number;
  extraPointPct: number;
  fieldGoalsMade1_19: number;
  fieldGoalsMade20_29: number;
  fieldGoalsMade30_39: number;
  fieldGoalsMade40_49: number;
  fieldGoalsMade50: number;
  totalKickingPoints: number;
  touchbackPct: number;
  avgKickoffReturnYards: number;
  kickoffReturnYards: number;
  kickoffReturns: number;
  totalKickoffYards: number;
  totalGoalsVsAttemps: number;

  // --------------------------------------------------------------------------
  // Punting
  // --------------------------------------------------------------------------
  punts: number;
  puntYards: number;
  longPunt: number;
  grossAvgPuntYards: number;
  netAvgPuntYards: number;
  puntsBlocked: number;
  puntsInside20: number;
  touchbacks: number;
  fairCatches: number;
  avgPuntReturnYards: number;
  totalPuntsYards: number;

  // --------------------------------------------------------------------------
  // Scoring / totals
  // --------------------------------------------------------------------------
  teamGamesPlayed: number;
  yardsPerGame: number;
  totalYards: number;
  totalOffensivePlays: number;
  totalPointsPerGame: number;
  totalPoints: number;
  totalTouchdowns: number;
  returnTouchdowns: number;
  fieldGoals: number;
  kickExtraPoints: number;
  totalTwoPointConvs: number;
};

/* ============================================================================
 * Player stat group types
 * ========================================================================== */

/**
 * Base shape for player stat groups.
 *
 * The index signature allows stat groups to support extra fields without
 * breaking TypeScript when ESPN adds or renames a stat.
 */
export type FootballStatGroup = {
  [key: string]: FootballStatValue;
};

export interface FootballPassingStats extends FootballStatGroup {
  completions?: FootballStatValue;
  passingAttempts?: FootballStatValue;
  completionPct?: FootballStatValue;
  passingYards?: FootballStatValue;
  passingTouchdowns?: FootballStatValue;
  interceptions?: FootballStatValue;
  yardsPerPassAttempt?: FootballStatValue;
  longPassing?: FootballStatValue;
  sacks?: FootballStatValue;
  QBRating?: FootballStatValue;
}

export interface FootballRushingStats extends FootballStatGroup {
  rushingAttempts?: FootballStatValue;
  rushingYards?: FootballStatValue;
  yardsPerRushAttempt?: FootballStatValue;
  rushingTouchdowns?: FootballStatValue;
  longRushing?: FootballStatValue;
}

export interface FootballReceivingStats extends FootballStatGroup {
  receptions?: FootballStatValue;
  receivingYards?: FootballStatValue;
  yardsPerReception?: FootballStatValue;
  receivingTouchdowns?: FootballStatValue;
  longReception?: FootballStatValue;
}

export interface FootballDefensiveStats extends FootballStatGroup {
  totalTackles?: FootballStatValue;
  soloTackles?: FootballStatValue;
  assistTackles?: FootballStatValue;
  sacks?: FootballStatValue;
  interceptions?: FootballStatValue;
  passesDefended?: FootballStatValue;
  fumblesForced?: FootballStatValue;
  interceptionYards?: FootballStatValue;
  interceptionTouchdowns?: FootballStatValue;
}

export interface FootballReturningStats extends FootballStatGroup {
  kickReturns?: FootballStatValue;
  kickReturnYards?: FootballStatValue;
  longKickReturn?: FootballStatValue;
  kickReturnTouchdowns?: FootballStatValue;
  puntReturns?: FootballStatValue;
  puntReturnYards?: FootballStatValue;
  longPuntReturn?: FootballStatValue;
  puntReturnTouchdowns?: FootballStatValue;
}

export interface FootballKickingStats extends FootballStatGroup {
  fieldGoals?: FootballStatValue;
  kickExtraPoints?: FootballStatValue;
}

export interface FootballPuntingStats extends FootballStatGroup {
  punts?: FootballStatValue;
  puntYards?: FootballStatValue;
  longPunt?: FootballStatValue;
}

export interface FootballScoringStats extends FootballStatGroup {
  fieldGoals?: FootballStatValue;
  kickExtraPoints?: FootballStatValue;
}

/**
 * One season of normalized player stats.
 *
 * Each category is optional because players only receive stats for categories
 * that apply to their position or role.
 */
export interface FootballSeasonStats {
  season?: string | number | null;
  year?: string | number | null;
  displaySeason?: string;

  passing?: FootballPassingStats;
  rushing?: FootballRushingStats;
  receiving?: FootballReceivingStats;
  defensive?: FootballDefensiveStats;
  returning?: FootballReturningStats;
  kicking?: FootballKickingStats;
  punting?: FootballPuntingStats;
  scoring?: FootballScoringStats;

  /**
   * Useful for APIs that return already-computed totals or averages instead
   * of category-specific values.
   */
  totals?: FootballStatGroup;
  averages?: FootballStatGroup;

  /**
   * Allows additional backend fields without forcing a type update every time
   * a new stat group is added.
   */
  [key: string]: unknown;
}

/* ============================================================================
 * Roster stats API and normalized roster player types
 * ========================================================================== */

/**
 * Flexible API player shape.
 *
 * This intentionally supports both snake_case and camelCase because backend
 * routes and external APIs may not always return the same naming convention.
 */
export type FootballRosterApiPlayer = {
  id?: string | number | null;
  player_id?: string | number | null;
  playerId?: string | number | null;

  name?: string | null;
  full_name?: string | null;
  short_name?: string | null;
  shortName?: string | null;
  first_name?: string | null;
  firstName?: string | null;
  last_name?: string | null;
  lastName?: string | null;

  jersey_number?: string | number | null;
  jerseyNumber?: string | number | null;
  position?: string | null;

  headshot_url?: string | null;
  headshotUrl?: string | null;

  team_id?: string | number | null;
  teamId?: string | number | null;
  teamCode?: string | null;

  seasonStats?: FootballSeasonStats[] | null;
  season_stats?: FootballSeasonStats[] | null;
  latestSeasonStats?: FootballSeasonStats | null;
  latest_season_stats?: FootballSeasonStats | null;
};

/**
 * Clean roster player shape used by UI components after normalization.
 */
export interface FootballRosterStatsPlayer {
  id: string | number;
  player_id: string | number | null;
  playerId: string | number;

  full_name: string;
  short_name: string;
  first_name: string;
  last_name: string;

  jersey_number: string | number;
  position: string;
  headshot_url: string;

  team_id: string | number | null;
  teamCode: string;

  seasonStats: FootballSeasonStats[];
  latestSeasonStats: FootballSeasonStats | null;
}

/* ============================================================================
 * Football stats UI config
 * ========================================================================== */

export const STAT_TABS = ["Player Stats", "Team Stats"] as const;
export type StatTab = (typeof STAT_TABS)[number];

/**
 * Categories shown in the football stats UI.
 *
 * Note:
 * - UI uses "defense"
 * - Player stat data uses "defensive"
 */
export type FootballStatCategory =
  | "passing"
  | "rushing"
  | "receiving"
  | "efficiency"
  | "defense"
  | "returns"
  | "kicking"
  | "punting"
  | "scoring";

/**
 * Normalized row for display tables.
 */
export type StatRow = {
  name: string;
  displayName: string;
  displayValue: string | number;
  value: number;
};

/**
 * Display-ready group of stat rows.
 */
export type StatDisplayCategory = {
  key: FootballStatCategory;
  name: string;
  stats: StatRow[];
};

/**
 * Keys that match the player stat group names in FootballSeasonStats.
 */
export type FootballPlayerStatGroupKey =
  | "passing"
  | "rushing"
  | "receiving"
  | "defensive"
  | "returning"
  | "kicking"
  | "punting"
  | "scoring";

/**
 * Path to a specific player stat.
 *
 * Example:
 * {
 *   group: "passing",
 *   key: "passingYards"
 * }
 */
export type FootballStatPath = {
  group: FootballPlayerStatGroupKey;
  key: string;
};

/**
 * Table column config for player stat tables.
 *
 * `fallbacks` lets you support alternate stat names from different endpoints.
 */
export type FootballTableColumn = FootballStatPath & {
  label: string;
  width?: number;
  fallbacks?: FootballStatPath[];
};

/**
 * Full player stat table config.
 */
export type FootballPlayerStatTable = {
  title: string;
  columns: FootballTableColumn[];
};

/**
 * Leader stat config used for leader cards, highlights, or rankings.
 */
export type FootballLeaderConfig = {
  label: string;
  path: FootballStatPath;
};

/* ============================================================================
 * Component props
 * ========================================================================== */

export interface FootballRosterStatsProps {
  rosterStats: FootballRosterStatsPlayer[];
  teamStats: TeamStats | null;

  loading: boolean;
  error: Error | string | null;

  teamId: number;
  category?: FootballStatCategory;
  league: string;

  refreshing: boolean;
  onRefresh?: () => void | Promise<void>;
}
