export type PlayerStatRanking = {
  rank: number;
  fieldSize: number;
};

export type PlayerSeasonRankings = Record<string, PlayerStatRanking>;
