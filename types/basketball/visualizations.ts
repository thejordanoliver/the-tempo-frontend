export type CourtPoint = { x: number; y: number };

/** Backend-normalized observations, never a pregame projection or simulated history. */
export type BasketballWinProbability = {
  playId: string;
  period: number;
  clock: string;
  homeProbability: number;
  awayProbability: number;
};

export type BasketballEventKind =
  | "made-two"
  | "made-three"
  | "miss"
  | "free-throw"
  | "rebound"
  | "assist"
  | "steal"
  | "turnover"
  | "block"
  | "foul"
  | "other";

export type BasketballChartPoint = {
  key: string;
  seconds: number;
  period: number;
  clock: string;
  home: number;
  away: number;
  homeScore?: number;
  awayScore?: number;
  description: string;
};
