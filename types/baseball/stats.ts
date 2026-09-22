export type BaseballRosterLeague = "mlb";

export type BaseballStatValue = string | number | null;
export type BaseballStatMap = Record<string, BaseballStatValue>;

export type BaseballSeasonStatGroups = {
  "career-batting"?: BaseballStatMap | null;
  "expanded-batting"?: BaseballStatMap | null;
  "advanced-batting"?: BaseballStatMap | null;
  pitching?: BaseballStatMap | null;
  "opponent-batting"?: BaseballStatMap | null;
  "expanded-pitching"?: BaseballStatMap | null;
};

export type BaseballSeasonStats = {
  id?: number | string | null;
  season?: number | string | null;
  stats?: BaseballSeasonStatGroups | null;
  team_id?: string | number | null;
  team_slug?: string | null;
  position?: string | null;
  player_id?: number | string | null;
  player_name?: string | null;
  season_type?: string | null;
  season_type_label?: string | null;
  season_type_value?: string | number | null;
  display_season?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type BaseballRosterPlayer = {
  id: number;
  playerId?: number | string | null;
  full_name: string;
  first_name?: string | null;
  last_name?: string | null;
  team_id?: number | string | null;
  position?: string | null;
  jersey_number?: number | string | null;
  headshot_url?: string | null;
  active?: boolean;
  short_name?: string | null;
  team?: string | null;
  currentSeasonStats?: BaseballSeasonStats | null;
  latestSeason?: BaseballSeasonStats | null;
  latestSeasonStats?: BaseballSeasonStats | null;
  seasonStats?: BaseballSeasonStats[] | null;
  careerStats?: BaseballSeasonStats[] | null;
};

export type BaseballRosterStats = {
  teamId: string;
  count: number;
  players: BaseballRosterPlayer[];
};

export type BaseballStatTab = "Player Stats" | "Team Stats";
export type BaseballStatGroupKey =
  | "career-batting"
  | "advanced-batting"
  | "pitching";

export type BaseballPlayerStatRow = {
  player: BaseballRosterPlayer;
  battingStats: BaseballStatMap | null;
  advancedBattingStats: BaseballStatMap | null;
  pitchingStats: BaseballStatMap | null;
};

export type BaseballStatLeader = {
  row: BaseballPlayerStatRow;
  value: BaseballStatValue;
  numericValue: number;
};

export type BaseballLeaderDefinition = {
  label: string;
  group: BaseballStatGroupKey;
  key: string;
  order: "asc" | "desc";
};

export type BaseballStatColumn = {
  header: string;
  getValue: (
    row: BaseballPlayerStatRow,
  ) => BaseballStatValue | undefined;
};

export type BaseballTeamStatRow = {
  label: string;
  value: BaseballStatValue | undefined;
};

export type TeamAggregatedStats = {
  team: {
    id: string;
    name: string;
    fullName: string;
    code: string;
    recordSummary: string;
    standingSummary: string;
  };

  season: {
    year: string;
    type: string;
    name: string;
    displayName: string;
  };

  batting: {
    gamesPlayed: number;
    atBats: number;
    runs: number;
    hits: number;
    doubles: number;
    triples: number;
    homeRuns: number;
    rbis: number;
    stolenBases: number;
    caughtStealing: number;
    walks: number;
    strikeouts: number;
    totalBases: number;
    plateAppearances: number;
    extraBaseHits: number;
    battingAverage: number;
    onBasePct: number;
    sluggingPct: number;
    ops: number;
  };

  pitching: {
    gamesPlayed: number;
    wins: number;
    losses: number;
    winPct: number;
    saves: number;
    saveOpportunities: number;
    holds: number;
    qualityStarts: number;
    innings: number;
    hitsAllowed: number;
    runsAllowed: number;
    earnedRuns: number;
    homeRunsAllowed: number;
    walksAllowed: number;
    strikeouts: number;
    era: number;
    whip: number;
    strikeoutsPerNine: number;
    opponentAvg: number;
    opponentOnBasePct: number;
    opponentSluggingPct: number;
    opponentOps: number;
  };

  fielding: {
    gamesPlayed: number;
    inningsPlayed: number;
    totalChances: number;
    putouts: number;
    assists: number;
    errors: number;
    doublePlays: number;
    fieldingPct: number;
    rangeFactor: number;
  };
};

export type BaseballRosterStatsProps = {
  rosterStats:
    | BaseballRosterStats
    | BaseballRosterPlayer[]
    | null
    | undefined;
  teamId: string | number;
  teamStats?: TeamAggregatedStats | null;
  loading: boolean;
  error: Error | null;
  refreshing?: boolean;
  onRefresh?: () => void;
  league?: BaseballRosterLeague;
};

// Compatibility alias for existing consumers.
export type RosterPlayer = BaseballRosterPlayer;
