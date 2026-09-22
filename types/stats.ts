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
  rank: number;
  id: number | string | null;
  headshot: string | null;
  full_name: string | null;
  short_name: string | null;
  team_id: number | string | null;
  stat_value: number | null;
}

export interface SeasonLeaderCategory {
  categoryName: string;
  shortName: string;
  abbreviation: string;
  leaders: PlayerLeader[];
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
