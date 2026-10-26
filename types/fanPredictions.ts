import type { BaseballGame } from "./baseball/baseball";
import type { BasketballGame } from "./basketball/basketball";
import type { FootballGame } from "./football/football";
import type { HockeyGame } from "./hockey/hockey";
import type { SoccerGame } from "./soccer/soccer";
import type { MMAFight } from "./mma/mma";
import type { VolleyballGame } from "./volleyball/volleyball";

export type FanPredictionTeamId = string | number;

export type RankedPredictionContext = {
  sport:
    | "basketball"
    | "football"
    | "baseball"
    | "hockey"
    | "soccer"
    | "mma"
    | "volleyball";
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

export type FanPredictionGameTeam = Omit<
  FanPredictionPickTeam,
  "id" | "name" | "code"
> & {
  id: string | number | null;
  name?: string | null;
  shortName?: string | null;
  code?: string | null;
  rank?: number | null;
  homeRank?: number | null;
  awayRank?: number | null;
  setsWon?: number | null;
};

type FanPredictionGameBase = {
  id?: string | number;
  date?: string | null;
  league?: { code: string };
  home: FanPredictionGameTeam;
  away: FanPredictionGameTeam;
  headline?: string | null;
  broadcasts?: string[];
  status: {
    state?: string | null;
    completed?: boolean;
    description?: string | null;
    detail?: string | null;
    shortDetail?: string | null;
    period?: number | null;
    displayClock?: string | null;
  };
};

export type FanPredictionGame = FanPredictionGameBase &
  (
    | { sport: "basketball" | "hockey" | "soccer" }
    | {
        sport: "baseball";
        situation?: Partial<
          Pick<
            BaseballGame["situation"],
            "outs" | "onFirst" | "onSecond" | "onThird"
          >
        >;
      }
    | {
        sport: "football";
        situation?: Partial<
          Pick<FootballGame["situation"], "downDistanceText" | "isRedZone">
        > & { possession?: string | number | null };
      }
    | { sport: "volleyball"; sets?: VolleyballGame["sets"]; bestOf?: number }
    | {
        sport: "mma";
        competitors?: MMAFight["competitors"];
        method?: string | null;
        round?: number | null;
        time?: string | null;
      }
  );

export type FanPredictionPick = {
  game?: FanPredictionGame;
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
  pickedShortName?: string;
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
  bonusReason:
    | "ranked"
    | "playoff"
    | "championship"
    | "knockout"
    | "rivalry"
    | null;
};

export type FeedPredictionTeam = {
  id: string;
  code: string;
  name: string;
  logo: string | null;
  primaryColor: string;
};
export type FeedPrediction = {
  sport: RankedPredictionContext["sport"];
  league: string;
  gameId: number;
  startsAt: string;
  state: "pre";
  home: FeedPredictionTeam;
  away: FeedPredictionTeam;
  game?:
    | BaseballGame
    | BasketballGame
    | FootballGame
    | HockeyGame
    | SoccerGame
    | MMAFight
    | VolleyballGame;
  reason: "favorite_team" | "favorite_league";
  scoring: FanPredictionScoring;
  votes: { team_id: string; votes: number }[];
  userVote: FanPredictionTeamId | null;
};
