export type BasketballRosterLeague = "NBA" | "WNBA" | "CBB" | "WCBB";
export type BasketballStatValue = string | number | null | undefined;
export type BasketballStatMap = Record<string, BasketballStatValue>;

export type BasketballSeasonStats = {
  id: number;
  season: number;
  totals: BasketballStatMap | null;
  averages: BasketballStatMap | null;
  miscellaneous: BasketballStatMap | null;
  team_id: string | number | null;
  team_slug: string | null;
  position: string | null;
  player_id: number;
  player_name: string;
  season_type: string | null;
  season_type_label: string | null;
  season_type_value: string | number | null;
  display_season: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type BasketballRosterPlayer = {
  id: number;
  playerId: number;
  full_name: string;
  first_name: string;
  last_name: string;
  team_id: number;
  position: string | null;
  jersey_number: number | null;
  headshot_url: string | null;
  active: boolean;
  short_name: string;
  team: string;
  currentSeasonStats: BasketballSeasonStats | null;
  latestSeason: BasketballSeasonStats | null;
  latestSeasonStats: BasketballSeasonStats | null;
  seasonStats: BasketballSeasonStats[];
  careerStats: BasketballSeasonStats[];
};

export type BasketballRosterStatsResponse = {
  teamId: string;
  count: number;
  players: BasketballRosterPlayer[];
};

export type BasketballStatTab = "Player Stats" | "Team Stats";

export type BasketballTeamStats = {
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
  gamesPlayed: number;
  pointsPerGame: number;
  reboundsPerGame: number;
  assistsPerGame: number;
  stealsPerGame: number;
  blocksPerGame: number;
  turnoversPerGame: number;
  foulsPerGame: number;
  fgPercent: number;
  ftPercent: number;
  tpPercent: number;
  totalPoints: number;
  totalRebounds: number;
  totalAssists: number;
  totalSteals: number;
  totalBlocks: number;
  totalTurnovers: number;
  totalFouls: number;
};

export type BasketballTeamStatRow = {
  label: string;
  value: string;
};

export type BasketballPlayerStats = {
  playerId: number;
  full_name: string;
  first_name: string;
  last_name: string;
  short_name: string;
  team_id: number;
  position: string;
  jersey_number: string;
  headshot_url?: string;
  active: boolean;
  team: string;
  pos: string | null;
  latestSeason: {
    season: string;
    g: number;
    gs: number | null;
    mpg: number;
    fg: number;
    fga: number;
    fg_pct: string;
    three_p: number;
    three_pa: number;
    three_pct: string;
    two_p: number;
    two_pa: number;
    two_pct: string;
    efg_pct: string;
    ft: number;
    fta: number;
    ft_pct: string;
    orb: number;
    drb: number;
    trb: number;
    ast: number;
    stl: number;
    blk: number;
    tov: number;
    pf: number;
    pts: number;
  } | null;
};

export type BasketballLegacyRosterStatsProps = {
  rosterStats: BasketballPlayerStats[] | null;
  teamId: string;
  teamStats?: BasketballTeamStats | null;
  loading?: boolean;
  error?: Error | null;
  refreshing: boolean;
  onRefresh: () => void;
};

export type BasketballRosterStatsProps = {
  rosterStats:
    | BasketballRosterStatsResponse
    | BasketballRosterPlayer[]
    | null
    | undefined;
  teamId: string | number;
  teamStats?: BasketballTeamStats | null;
  loading: boolean;
  error: Error | null;
  refreshing?: boolean;
  onRefresh?: () => void;
  league?: string;
};

// Compatibility aliases for existing consumers.
export type Player = BasketballRosterPlayer;
export type RosterStats = BasketballRosterStatsResponse;
export type TeamStats = BasketballTeamStats;
export type TeamStatRow = BasketballTeamStatRow;
