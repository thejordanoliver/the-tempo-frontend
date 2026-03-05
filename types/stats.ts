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
