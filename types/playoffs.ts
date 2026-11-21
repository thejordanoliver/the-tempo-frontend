export type PlayoffLeague = "mlb" | "nba" | "wnba" | "nfl" | "nhl";
export type PlayoffTeamId = number | string;

export interface PlayoffTeam {
  id: number | null;
  alt_id: PlayoffTeamId | null;
  name: string | null;
  fullName: string | null;
  shortName: string | null;
  code: string | null;
  logo: string | null;
  logoDark: string | null;
  seed?: number | null;
  wins: number;
  isWinner: boolean;
}
export interface PlayoffGame {
  id: number | string | null;
  number: number | null;
  date: string | null;
  status: string | null;
  home: { teamAltId: PlayoffTeamId | null; score: number | null };
  away: { teamAltId: PlayoffTeamId | null; score: number | null };
}
export interface PlayoffMatchup {
  id: string | null;
  name: string;
  league: string | null;
  bestOf: number;
  status: "scheduled" | "in_progress" | "complete";
  winnerId: number | null;
  winnerAltId: PlayoffTeamId | null;
  nextSeriesId: string | null;
  teams: (PlayoffTeam | null)[];
  games: PlayoffGame[];
}
export interface PlayoffByeTeam extends PlayoffTeam {
  nextSeriesId: string | null;
}
export interface PlayoffRound {
  id: string;
  name: string;
  order: number;
  matchups: PlayoffMatchup[];
  byeTeams?: (PlayoffByeTeam | null)[];
}
export interface PlayoffBracketData {
  season: number;
  rounds: PlayoffRound[];
}
