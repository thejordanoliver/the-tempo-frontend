export type PlayerResult = {
  id: number;
  team_id: number;
  full_name: string | null;
  headshot_url: string | null;
  nickname: string | null;
  association_name: string | null;
  affiliation: string;
  position: string | null;
  isNFL?: boolean;
  isMMA?: boolean;
  isNBA?: boolean;
  isMLB?: boolean;
  isCFB?: boolean;
  isCBB?: boolean;
  isWCBB?: boolean;
  isWNBA?: boolean;
  isNHL?: boolean;
  isSOCC?: boolean;
  type: "player";
  score: number;
};

export type TeamResult = {
  id: number;
  name: string;
  full_name: string;
  short_name: string;
  logo?: string | null;
  logoLight?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  league?: string;
  isNFL?: boolean;
  isMLB?: boolean;
  isNHL?: boolean;
  isCFB?: boolean;
  isCBB?: boolean;
  isWCBB?: boolean;
  isWNBA?: boolean;
  isSOCC?: boolean;
  is_active?: boolean;
  type: "team";
  score: number;
};

export type UserResult = {
  id: number;
  full_name: string;
  username: string;
  profileImageUrl: string;
  type: "user";
  score: number;
};

export type ResultItem = PlayerResult | TeamResult | UserResult;
