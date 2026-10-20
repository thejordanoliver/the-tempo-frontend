import type { BasketballGame } from "./basketball";

export type WNBAPlayoffTeam = BasketballGame["home"] & { seed?: number };

export type WNBAPlayoffSeries = {
  id: string;
  teams: (WNBAPlayoffTeam | null)[];
  wins: Record<string, number>;
  winnerId: string | null;
  bestOf: number;
  games: BasketballGame[];
};

export type WNBAPlayoffRound = {
  id: string;
  label: string;
  series: WNBAPlayoffSeries[];
};

export type WNBAPlayoffBracketData = {
  season: number;
  count: number;
  rounds: WNBAPlayoffRound[];
};
