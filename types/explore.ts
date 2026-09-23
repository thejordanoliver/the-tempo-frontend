export type SearchAffiliation =
  | "nba"
  | "gleague"
  | "wnba"
  | "mlb"
  | "nhl"
  | "nfl"
  | "cfb"
  | "cbb"
  | "wcbb"
  | "mma"
  | "soccer";

export type SearchMatchClass = 1 | 2 | 3 | 4;

type SearchRankingFields = {
  matchClass: SearchMatchClass;
  textScore: number;
  score: number;
};

export type PlayerResult = SearchRankingFields & {
  id: number | string;
  team_id: number | string | null;
  full_name: string | null;
  headshot_url: string | null;
  nickname: string | null;
  association_name: string | null;
  affiliation: SearchAffiliation;
  position: string | null;
  isNFL?: boolean;
  isMMA?: boolean;
  isNBA?: boolean;
  isGLEAGUE?: boolean;
  isMLB?: boolean;
  isCFB?: boolean;
  isCBB?: boolean;
  isWCBB?: boolean;
  isWNBA?: boolean;
  isNHL?: boolean;
  isSOCC?: boolean;
  type: "player";
};

export type TeamResult = SearchRankingFields & {
  id: number | string;
  name: string;
  full_name?: string | null;
  short_name: string;
  affiliation: SearchAffiliation;
  logo?: string | null;
  logoLight?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  league?: string;
  leagueKey?: string | null;
  isNFL?: boolean;
  isNBA?: boolean;
  isGLEAGUE?: boolean;
  isMLB?: boolean;
  isNHL?: boolean;
  isCFB?: boolean;
  isCBB?: boolean;
  isWCBB?: boolean;
  isWNBA?: boolean;
  isSOCC?: boolean;
  is_active?: boolean;
  type: "team";
};

export type UserResult = SearchRankingFields & {
  id: number | string;
  full_name: string | null;
  username: string;
  profileImageUrl: string | null;
  type: "user";
};

export type ResultItem = PlayerResult | TeamResult | UserResult;
