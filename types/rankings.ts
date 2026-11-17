import type { StandingsTeamInfo } from "types/standings";

export type League = "mcbb" | "wcbb" | "cfb";
export type CollegePollType = "ap" | "coaches" | "cfp" | "fcs";

export type CollegeRankingTeam = StandingsTeamInfo & {
  groups?: {
    id: string;
    shortName: string;
    parent?: {
      id: string;
      shortName: string;
      isConference: boolean;
    };
    isConference: boolean;
  };
};

export type CollegeTeamRank = {
  current: number;
  previous: number;
  points: number;
  firstPlaceVotes: number;
  trend: string;
  recordSummary: string;
  team: CollegeRankingTeam | null;
  date: string;
  lastUpdated: string;
};

export type RankPoll = {
  type: CollegePollType;
  shortName: string;
  ranks: CollegeTeamRank[];
  outsideTop25?: CollegeTeamRank[];
  droppedOut: CollegeTeamRank[];
};
