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

export type FanPredictionSortOrder = "newest" | "oldest";

export type FanPredictionPickTeam = {
  id: string;
  name: string;
  code: string;
  logo: string | null;
  score?: number | string | null;
  record?: string | null;
};

export type FanPredictionPick = {
  state?: string | null;
  statusDescription?: string;
  winnerId?: string | null;
  home?: FanPredictionPickTeam;
  away?: FanPredictionPickTeam;
  pickedTeamId?: string;
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
  nextOffset?: number | null;
};

export type FanPredictionScoring = {
  pointsValue: 1 | 2;
  bonusReason: "ranked" | "playoff" | "championship" | "knockout" | "rivalry" | null;
};

export type FeedPredictionTeam = {
  id: string;
  code: string;
  name: string;
  logo: string | null;
  color: string;
};
export type FeedPrediction = {
  sport: RankedPredictionContext["sport"];
  league: string;
  gameId: number;
  startsAt: string;
  state: "pre";
  home: FeedPredictionTeam;
  away: FeedPredictionTeam;
  reason: "favorite_team" | "favorite_league";
  scoring: FanPredictionScoring;
  votes: { team_id: string; votes: number }[];
  userVote: FanPredictionTeamId | null;
};
