// utils/NFLUtils/transformSeriesGame.ts

export interface TransformedNFLSeriesGame {
  id: number;
  year: number;
  week: string;
  day: string;
  date: string;
  time: string;

  homeTeam: string;
  awayTeam: string;

  homeScore: number | null;
  awayScore: number | null;

  winner: string;
  loser: string;

  locationType?: string;
}
