export type PlayerResult = {
  id: number;
  team_id: number;
  full_name: string;
  headshot_url: string;
  nickname: string;
  association_name: string;
  position: string;
  isNFL?: boolean;
  isMMA?: boolean;
  isNBA?: boolean;
  isMLB?: boolean;
  isCFB?: boolean;
  isCBB?: boolean;
  isWCBB?: boolean;
  isWNBA?: boolean;
  isNHL?: boolean;
  type: "player";
  score: number;
};

export type TeamResult = {
  id: number;
  wid?: number;
  name: string;
  full_name: string;
  short_name: string;
  isNFL?: boolean;
  isMLB?: boolean;
  isNHL?: boolean;
  isCFB?: boolean;
  isCBB?: boolean;
  isWCBB?: boolean;
  isWNBA?: boolean;
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
