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
  correct: number;
  graded: number;
  pending: number;
  accuracy: number | null;
};
export type FanPredictionRankingsResponse = {
  rankings: FanPredictionRanking[];
  me: FanPredictionRanking | null;
};
