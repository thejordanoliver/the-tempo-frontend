// types.ts
import { AwardCategory } from "hooks/useAwardSeasons";
import { ImageSourcePropType } from "react-native";

// types/types.ts (backend User)
export type BackendUser = {
  id: number;
  username: string;
  full_name: string;
  email: string;
  profile_image?: string;
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
  full_name: string;
  first_name: string;
  last_name: string;
  short_name: string;
  team_id: number;
  position: string;
  jersey_number: string;
  headshot_url?: string;
  active: boolean;
  team: string;
  pos: string | null;
  latestSeason: {
    season: string;
    g: number;
    gs: number | null;
    mpg: number;
    fg: number;
    fga: number;
    fg_pct: string;
    three_p: number;
    three_pa: number;
    three_pct: string;
    two_p: number;
    two_pa: number;
    two_pct: string;
    efg_pct: string;
    ft: number;
    fta: number;
    ft_pct: string;
    orb: number;
    drb: number;
    trb: number;
    ast: number;
    stl: number;
    blk: number;
    tov: number;
    pf: number;
    pts: number;
  } | null;
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

export type RosterStatsProps = {
  rosterStats: PlayerStats[];
  teamId: string;
  teamStats?: TeamStats | null;
  loading?: boolean;
  error?: Error | null; // ✅ change here
  refreshing: boolean;
  onRefresh: () => void;
};

export type Team = {
  id: number;
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
  code?: string;
  city?: string;
  state?: string;
  arena_name?: string;
  primary_color?: string;
  conference_championships?: number[]; // or number[]
  conference?: string;
  displayName?: string;
  isAllStar: boolean;
  league?: string;
};

export type NBATeam = {
  id: number;
  espnID: number;
  summerLeagueId?: number;
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
  uniforms?: {
    home: any;
    away: any;
  };
  isActive: boolean;
  isAllStar: boolean;
};

export interface NHLTeam {
  id: number;
  espnID: number;
  name: string;
  fullName: string;
  code: string;
  color: string;
  secondaryColor: string;
  logo: any;
  logoLight?: any;
  location?: string;
  established?: number;
  latitude?: number;
  longitude?: number;
  venueImage?: string;
  venueName?: string;
  venueCapacity?: string;
  address?: string;
  city?: string;
  championships?: number[];
  isAllStar: boolean;
  isActive: boolean;
  national: boolean;
}

export type Arena = {
  name: string;
  city?: string | null;
  state?: string | null;
  country?: string | null;
};

export type LeagueType =
  | "NBA"
  | "WNBA"
  | "NFL"
  | "CFB"
  | "CBB"
  | "MLB"
  | "WCBB"
  | "NHL"
  | "MMA";

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

export type BasketballGame = {
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
    home: {
      id: number;
      name: string;
      logo: string;
    };
    away: {
      id: number;
      name: string;
      logo: string;
    };
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
  venueName?: string; // ✅ Add this
  isAllStar: boolean;
  isActive: boolean;
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

export type SummerGame = {
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
    home: NBATeam;
    away: NBATeam;
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
  draft_round: number;
  draft_year: number;
  draft_number: number;
  awards: string[];
  experience_years: string;
  experience_display: string;
  experience_abbr: string;
  birth_place_city: string;
  birth_place_state: string;
  birth_place_country: string;
  birth_place_display_text: string;
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
  award_team?: NBATeam | Team;
  current_team?: NBATeam | Team;
  current_team_id?: number | null;
  created_at: string;
};

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
  isNBA?: boolean;
  isMLB?: boolean;
  isCFB?: boolean;
  isCBB?: boolean;
  isWCBB?: boolean;
  isNHL?: boolean;
  type: "player";
  score: number;
};

export type TeamResult = {
  id: number;
  wid?: number;
  name: string;
  full_name: string;
  nickname: string;
  city: string;
  logo_filename: string;
  isNFL?: boolean;
  isMLB?: boolean;
  isNHL?: boolean;
  isCFB?: boolean;
  isCBB?: boolean;
  isWCBB?: boolean;
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

export const AWARD_CONFIG: Partial<
  Record<LeagueType, { label: string; value: AwardCategory; title: string }[]>
> = {
  NBA: [
    { label: "All Awards", value: "all", title: "" },
    { label: "MVP", value: "mvp", title: "NBA MVP" },
    { label: "ROTY", value: "roy", title: "NBA Rookie of the Year" },
    { label: "DPOY", value: "dpoy", title: "NBA Defensive Player of the Year" },
    { label: "6MOY", value: "sixthman", title: "NBA Sixth Man of the Year" },
    { label: "COY", value: "coy", title: "NBA Coach of the Year" },
    { label: "MIP", value: "mip", title: "NBA Most Improved Player" },
    { label: "FMVP", value: "fmvp", title: "NBA Finals MVP" },
  ],

  CFB: [
    { label: "All Awards", value: "all", title: "" },
    { label: "Heisman Trophy", value: "heisman", title: "Heisman Trophy" },
    {
      label: "AP Player of the Year",
      value: "apoy",
      title: "AP Player of the Year",
    },
    { label: "Walter Camp POY", value: "camp", title: "Walter Camp POY" },
    { label: "Maxwell Award", value: "maxwell", title: "Maxwell Award" },
    {
      label: "Fred Biletnikoff Award",
      value: "biletnikoff",
      title: "Fred Biletnikoff Award",
    },
    { label: "Doak Walker Award", value: "doak", title: "Doak Walker Award" },
    { label: "John Mackey Award", value: "mackey", title: "John Mackey Award" },
    { label: "Lou Groza Award", value: "groza", title: "Lou Groza Award" },
    {
      label: "Dave Rimington Trophy",
      value: "rimington",
      title: "Dave Rimington Trophy",
    },
    { label: "Outland Trophy", value: "outland", title: "Outland Trophy" },
    { label: "Jim Thorpe Award", value: "thorpe", title: "Jim Thorpe Award" },
    {
      label: "Bronko Nagurski Award",
      value: "nagurski",
      title: "Bronko Nagurski Award",
    },
    { label: "Dick Butkus Award", value: "butkus", title: "Dick Butkus Award" },
    {
      label: "Ted Hendricks Award",
      value: "hendricks",
      title: "Ted Hendricks Award",
    },
    { label: "Lombardi Award", value: "lombardi", title: "Lombardi Award" },
    { label: "Ronnie Lott Trophy", value: "lott", title: "Ronnie Lott Trophy" },
    {
      label: "Davey O’Brien Award",
      value: "obrien",
      title: "Davey O’Brien Award",
    },
    { label: "Manning Award", value: "manning", title: "Manning Award" },
    {
      label: "Johnny Unitas Award",
      value: "unitas",
      title: "Johnny Unitas Award",
    },
    {
      label: "AP Coach of the Year",
      value: "apcoy",
      title: "AP Coach of the Year",
    },
    {
      label: "AFCA Coach of the Year",
      value: "afca",
      title: "AFCA Coach of the Year",
    },
  ],

  CBB: [
    { label: "All Awards", value: "all", title: "" },
    {
      label: "Men's AP Player of the Year",
      value: "apoy",
      title: "Men's AP Player of The Year",
    },
    {
      label: "Men's Naismith Award",
      value: "naismith",
      title: "Men's Naismith Award",
    },
    {
      label: "Men's Kareem Abdul-Jabbar Award",
      value: "kareem",
      title: "Men's Kareem Abdul-Jabbar Award",
    },
    {
      label: "Men's Bob Cousy Award",
      value: "cousy",
      title: "Men's Bob Cousy Award",
    },
    {
      label: "Men's Julius Erving Award",
      value: "erving",
      title: "Men's Julius Erving Award",
    },
    {
      label: "Men's Karl Malone Award",
      value: "malone",
      title: "Men's Karl Malone Award",
    },
    {
      label: "Men's Jerry West Award",
      value: "west",
      title: "Men's Jerry West Award",
    },
    {
      label: "Men's Wooden Award",
      value: "wooden",
      title: "Men's Wooden Award",
    },
  ],
  NFL: [
    { label: "All Awards", value: "all", title: "" },
    { label: "MVP", value: "mvp", title: "NFL Most Valuable Player" },
    {
      label: "OROY",
      value: "ropoy",
      title: "NFL Offensive Rookie of the Year",
    },
    {
      label: "DROY",
      value: "rdpoy",
      title: "NFL Defensive Rookie of the Year",
    },
    { label: "OPOY", value: "opoy", title: "NFL Offensive Player of the Year" },
    { label: "DPOY", value: "dpoy", title: "NFL Defensive Player of the Year" },
    {
      label: "Coach of the Year",
      value: "coy",
      title: "NFL Coach of the Year",
    },
  ],
};
