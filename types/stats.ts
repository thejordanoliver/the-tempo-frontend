export const STAT_CATEGORIES = [
  "points",
  "assists",
  "rebounds",
  "steals",
  "blocks",
  "tpm",
  "ftm",
] as const;

export type StatCategory = (typeof STAT_CATEGORIES)[number];

export interface PlayerLeader {
  stat: string;
  value: number;
  player_name: string;
  gp: number;
  rank: number;
  player: {
    id: number;
    nba_api_id: number;
    player_id: number;
    team_id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    short_name: string;
    headshot_url?: string;
    position: string;
  };
}

export type PlayerStats = {
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
