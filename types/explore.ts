export type PlayerResult = {
  id: number;
  player_id: number;
  name: string;
  avatarUrl: string;
  headshot_url: string;
  position: string;
  espn_team_id: string;
  team_id: number;
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