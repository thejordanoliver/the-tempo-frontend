import type { UserFollowCounts } from "types/user";
export type SearchSport =
  | "basketball"
  | "baseball"
  | "football"
  | "volleyball"
  | "hockey"
  | "mma"
  | "soccer";

export type SearchMatchClass = 1 | 2 | 3 | 4;

type SearchRankingFields = {
  matchClass: SearchMatchClass;
  textScore: number;
  score: number;
};

export type SearchTeamInfo = {
  id: number | string;
  name: string;
  fullName?: string | null;
  shortName: string | null;
  league: string;
  sport: SearchSport;
  logo?: string | null;
  logoDark?: string | null;
};

export type PlayerResult = SearchRankingFields & {
  id: number | string;
  team_id: number | string | null;
  full_name: string | null;
  headshot_url: string | null;
  nickname: string | null;
  association_name: string | null;
  league: string;
  sport: SearchSport;
  team: SearchTeamInfo | null;
  position: string | null;
  active?: boolean | null;
  type: "player";
};

export type TeamResult = SearchRankingFields &
  SearchTeamInfo & {
    type: "team";
  };

export type UserResult = SearchRankingFields &
  UserFollowCounts & {
    id: number | string;
    full_name: string | null;
    username: string;
    profileImageUrl: string | null;
    bannerImage?: string | null;
    bio?: string | null;
    isFollowing?: boolean;
    followers_count?: number;
    following_count?: number;
    type: "user";
  };

export type ResultItem = PlayerResult | TeamResult | UserResult;
