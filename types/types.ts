// types.ts
import { ImageSourcePropType } from "react-native";

// types/types.ts (backend User)
export type BackendUser = {
  id: number;
  username: string;
  full_name: string;
  email: string;
  profile_image?: string;
  // ...
};

// types/forum.ts (forum User)
export type ForumUser = {
  id: string;
  username: string;
  name: string; // display name
  avatar: string; // URL
};

export type User = {
  id: number;
  username: string;
  full_name: string;
  email: string;
  profile_image?: string;
  banner_image?: string | null; // add this
  bio?: string | null;
  favorites?: string[];
};

export type Follow = {
  followersCount: number;
  followingCount: number;
  isDark: boolean;
  currentUserId: string;
  targetUserId: string;
  onFollowersPress: () => void;
  onFollowingPress: () => void;
};

export type PlayerStats = {
  playerId: number;
  name: string;
  headshot_url?: string;
  gamesPlayed: number;
  minutesPlayed: number;
  totalPoints: number;
  totalRebounds: number;
  totalAssists: number;
  totalSteals: number;
  totalBlocks: number;
  totalTurnovers: number;
  totalFouls: number;
  totalFGM: number;
  totalFGA: number;
  totalFGP: number;
  total3PM: number;
  total3PA: number;
  total3PP: number;
  totalFTM: number;
  totalFTA: number;
  totalFTP: number;
  totalOffReb: number;
  totalDefReb: number;
  plusMinus: number;
};

export type TeamStats = {
  gamesPlayed: number;
  pointsPerGame: number;
  reboundsPerGame: number;
  assistsPerGame: number;
  stealsPerGame: number;
  blocksPerGame: number;
  turnoversPerGame: number;
  foulsPerGame: number;
  fgPercent: number;
  ftPercent: number;
  tpPercent: number;
  totalPoints: number;
  totalRebounds: number;
  totalAssists: number;
};

export type PlayerInfo = {
  player_id: number;
  first_name: string;
  last_name: string;
  jersey_number: string;
  headshot_url?: string;
  active?: boolean;
};

export interface CBBPlayer {
  id: string;
  uid?: string;
  name?: string;
  firstname?: string;
  lastname?: string;
  fullName?: string;
  experience?: {
    years: number;
    displayValue: string;
    abbreviation: string;
  };
  displayName?: string;
  shortName?: string;
  jersey?: string;
  height?: string;
  weight?: string;
  displayHeight?: string;
  displayWeight?: string;
  team?: string;
  teamId?: string;
  position?: string;
  imageUrl?: string;

  birthPlace?: {
    city?: string;
    state?: string;
    country?: string;
    displayText: string;
  };
  links?: {
    href: string;
    rel: string[];
  }[];
}

export type Props = {
  rosterStats: PlayerStats[];
  playersDb: PlayerInfo[];
  teamId: string; // Add this
};

export type Team = {
  id: number ;
  wid?: any;
  espnID?: string | number;
  name: string;
  fullName?: string;
  logo?: any;
  logoLight?: any;
  color?: string;
  first_season?: string;
  firstSeason?: string;
  transparent_color?: string;
  secondary_color?: string;
  secondaryColor?: string;
  record?: string;
  wins?: number;
  losses?: number;
  code?: string;
  city?: string;
  state?: string;
  arena_name?: string;
  primary_color?: string;
  conference_championships?: number[]; // or number[]
  conference?: string;
  displayName?: string;
  banner?: any; // <-- add this
};

export type NBATeam = {
  id: number;
  espnID: number;
  oddsID: string;
  name: string;
  fullName: string;
  logo?: any;
  logoLight?: any;
  color: string;
  established?: string;
  secondaryColor?: string;
  record?: string;
  wins?: number;
  losses?: number;
  coach?: string;
  code: string;
  location: string;
  address: string;
  city?: string;
  state?: string;
  latitude: number;
  longitude: number;
  venueName: string;
  venueImage: any;
  venueCapacity: string;
  conference?: string;
  uniforms: {
    home: any;
    away: any;
  };
};

export type Arena = {
  name: string;
  city?: string | null;
  state?: string | null;
  country?: string | null;
};

export type LeagueType = "NBA" | "NFL" | "CFB" | "CBB" | "MLB" | "WCBB";

export type LeagueTeam = Team & { league: LeagueType };

export type Game = {
  id: number;
  date: string;
  time: string;
  home: Team;
  away: Team;
  scores?: { home: { points: number }; visitors: { points: number } };
  homeScore?: number;
  awayScore?: number;
  period?: string;
  status: {
    clock?: string;
    halftime: boolean;
    short: number;
    long: string;
  };
  isPlayoff?: boolean;
  stage?: number;
  isHalftime?: boolean;
  linescore?: { home: string[]; away: string[] };
  periods?: { current: number; total: number; endOfPeriod: boolean };
  venue?: {
    name: string;
    city: string;
    state?: string;
    country?: string;
    capacity?: number;
  };
};

export type CBBGame = {
  id: number;
  date: string; // "2025-12-16T21:00:00+00:00"
  time: string; // "21:00"
  timestamp: number; // 1765918800
  timezone: string; // "UTC"

  stage: string | null;
  week: string | null;
  venue: string | null;

  status: {
    long: string; // "Not Started"
    short: string; // "NS"
    timer: string | null;
  };

  league: {
    id: number;
    name: string;
    type: string;
    season: string;
    logo: string;
    country: {
      id: number;
      name: string;
      code: string;
      flag: string;
    };
    isWomen?: boolean;
  };

  // ✅ Use shared CBBTeam type here
  teams: {
    home: CBBTeam;
    away: CBBTeam;
  };

  scores: {
    home: {
      quarter_1: number | null;
      quarter_2: number | null;
      quarter_3: number | null;
      quarter_4: number | null;
      over_time: number | null;
      total: number | null;
    };
    away: {
      quarter_1: number | null;
      quarter_2: number | null;
      quarter_3: number | null;
      quarter_4: number | null;
      over_time: number | null;
      total: number | null;
    };
  };
};

export type CBBTeam = {
  id: number;
  wid?: number;
  espnID?: number;
  name: string;
  shortName?: string;
  fullName?: string;
  code?: string;
  abbreviation?: string;
  city?: string;
  location?: string;
  address?: string;
  coach?: string;
  coachImage?: string;
  established?: number;
  country?: {
    name: string;
    code: string;
    flag: string;
  };
  latitude?: number;
  longitude?: number;
  venueImage?: any;
  venueCapacity?: string;
  wLogo?: any;
  logo: any;
  logoLight?: any;
  color?: string;
  secondaryColor?: string;
  championships?: number[];
  conference_championships?: string[]; // or number[]
  venueName?: string; // ✅ Add this
  banner?: any; // <-- add this
};

export type Conference = {
  name: string;
  logo: ImageSourcePropType | null;
  teams: string[];
  color?: {
    primary: string;
    secondary: string;
  };
};

export type Venue = {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  venueCapacity?: string;
  venueImage?: any;
};

export type GameStatus = {
  long: string;
  short: string;
  timer: string | null;
};

export interface summerGame {
  id: number;
  date: string;
  time: string;
  status: GameStatus;
  period?: number;
  clock?: string;
  timezone?: string;
  homeScore?: number;
  awayScore?: number;
  isHalftime?: boolean;
  stage?: number;
  league?: {
    name: string;
  };
  home: {
    id: string;
    name: string;
    record?: string;
    logo?: any;
    code?: string;
    fullName?: string;
    logoLight?: any;
  };
  away: {
    id: string;
    name: string;
    record?: string;
    logo?: any;
    code?: string;
    fullName?: string;
    logoLight?: any;
  };
  venue?: string;
  currentHomeScore?: number;
  currentAwayScore?: number;
  scores?: {
    home: {
      q1?: number;
      q2?: number;
      q3?: number;
      q4?: number;
      ot?: number;
      total?: number;
    };
    away: {
      q1?: number;
      q2?: number;
      q3?: number;
      q4?: number;
      ot?: number;
      total?: number;
    };
  };
}

export interface GameOddsCardProps {
  team1: {
    name: string;
    record: string;
    logo: any;
    open: string;
    spread: string;
    total: string;
    moneyline: string;
    isAway: boolean;
  };
  team2: {
    name: string;
    record: string;
    logo: any;
    open: string;
    spread: string;
    total: string;
    moneyline: string;
    isAway: boolean;
  };
}

export type DBPlayer = {
  id: number;
  player_id: number;
  name: string;
  first_name: string;
  last_name: string;
  team_id: number;
  position: string;
  headshot_url: string;
  jersey_number: string;
  weight: string;
  height: string;
  birth_date: string;
  college: string;
  active: boolean;
  nba_start: number;
  nba_pro: number;
};

export type APIGame = {
  id: number;
  date: { start: string };
  status: {
    long: string;
    short: string;
    clock?: string;
  };
  periods: {
    current: number;
    total: number;
    endOfPeriod: boolean;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
      logoLight: any;
    };
    visitors: {
      id: number;
      name: string;
      logo: string;
      logoLight: any;
    };
  };
  scores: {
    home: {
      points: number | null;
      win?: number;
      loss?: number;
      series?: { win: number; loss: number };
      linescore?: string[];
    };
    visitors: {
      points: number | null;
      win?: number;
      loss?: number;
      series?: { win: number; loss: number };
      linescore?: string[];
    };
  };
};

export type TeamRecord = {
  wins: number;
  losses: number;
  record: string;
};

export type NewsItem = {
  id: string;
  title: string;
  source: string;
  url: string;
  thumbnail: string;
  content: string;
  publishedAt?: string;
  date?: string;
};

export type Highlight = {
  id: string;
  headline: string;
  description: string;
  thumbnail: string;
  links: {
    source: {
      HLS: {
        href: string;
      };
      href: string;
    };
    href: string;
    web: string;
    mobile: string;
    hls?: string;
    mp4?: string;
  };
};

export type GameHighlights = {
  gameId: string;
  highlights: Highlight[];
};

export type NBAOrNFLTeam = {
  id: string | number;
  name: string;
  fullName: string;
  location?: string;
  logo: any;
  logoLight?: any;
  city?: string;
};

export type AwardStats = {
  games?: number;
  minutes_per_game?: number;
  points?: number;
  rebounds?: number;
  assists?: number;
  steals?: number;
  blocks?: number;
  fg_pct?: number;
  three_pct?: number;
  ft_pct?: number;
  win_shares?: number;
  ws_per_48?: number;

  // COY / coach-style stats
  wins?: number;
  losses?: number;
  win_pct?: number;

  // Allow future expansion
  [key: string]: number | string | undefined;
};

export type AwardSeason = {
  id: number;

  season: string;
  league: "NBA" | "CFB";

  award_type:
    | "mvp"
    | "roy"
    | "dpoy"
    | "sixthman"
    | "coy"
    | "mip"
    | "fmvp"
    | "heisman";

  player_id?: number | null;
  player_name: string;
  bbref_id?: string | null;
  team_abbr?: string | null;
  voting?: string | null;
  age?: number | null;
  summary: string;
  coach?: string;
  stats: AwardStats | null;
  school: string;
  award_team?: NBATeam | null;
  current_team?: NBATeam | null;
  current_team_id?: number | null;
  created_at: string;
};
export type PlayerResult = {
  id: number;
  player_id: number;
  name: string;
  avatarUrl: string;
  position: string;
  espn_team_id: string;
  team_id: number;
  isNFL?: boolean;
  isMLB?: boolean;
  isCFB?: boolean;
  isCBB?: boolean;
  isWCBB?: boolean;
  type: "player";
};

export type TeamResult = {
  id: number;
  wid?: number;
  name: string;
  nickname: string;
  city: string;
  logo_filename: string;
  isNFL?: boolean;
  isMLB?: boolean;
  isCFB?: boolean;
  isCBB?: boolean;
  isWCBB?: boolean;
  type: "team";
};

export type UserResult = {
  id: number;
  full_name: string;
  username: string;
  profileImageUrl: string;
  type: "user";
};

export type ResultItem = PlayerResult | TeamResult | UserResult;
