export type FanPredictionTeamId = string | number;

export type RankedPredictionContext = {
  sport: "basketball" | "football" | "baseball" | "hockey" | "soccer" | "mma";
  league: string;
  date?: string;
  state?: string;
};
export type FanPredictionRanking = {
  userId: number;
  username: string;
  profileImage: string | null;
  rank: number | null;
  points?: number;
  correct: number;
  graded: number;
  pending: number;
  accuracy: number | null;
};
export type FanPredictionRankingsResponse = {
  rankings: FanPredictionRanking[];
  me: FanPredictionRanking | null;
};

export type FanPredictionPick = {
  sport: RankedPredictionContext["sport"];
  league: string;
  gameId: string;
  startsAt: string;
  pickedName: string;
  matchup: string;
  outcome: "pending" | "void" | "correct" | "incorrect";
};

export type FanPredictionPicksResponse = {
  record: FanPredictionRanking | null;
  picks: FanPredictionPick[];
};

export type FanPredictionScoring = {
  pointsValue: 1 | 2;
  bonusReason: "ranked" | "playoff" | "championship" | "knockout" | null;
};
