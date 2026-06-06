import { NBATeam } from "./nba";

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
  team: {
    id: string;
    name: string;
    fullName: string;
    code: string;
    recordSummary: string;
    standingSummary: string;
  };

  season: {
    year: string;
    type: string;
    name: string;
    displayName: string;
  };

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
  totalSteals: number;
  totalBlocks: number;
  totalTurnovers: number;
  totalFouls: number;
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
  error?: Error | null;
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
  secondary_color?: string;
  secondaryColor?: string;
  code?: string;
  primary_color?: string;
  conference?: string;
  displayName?: string;
  isAllStar: boolean;
  league?: string;
};

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
  | "CB"
  | "SB"
  | "CBB"
  | "MLB"
  | "WCBB"
  | "NHL"
  | "MMA";

export type LeagueTeam = Team & { league: LeagueType };

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
  experience_years: number;
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

export type AwardCategory =
  | "all"

  // NBA
  | "mvp"
  | "roy"
  | "sixthman"
  | "dpoy"
  | "coy"
  | "mip"
  | "fmvp"

  // CFB
  | "heisman"
  | "apoy"
  | "camp"
  | "maxwell"
  | "biletnikoff"
  | "doak"
  | "mackey"
  | "groza"
  | "thorpe"
  | "nagurski"
  | "butkus"
  | "hendricks"
  | "lombardi"
  | "lott"
  | "obrien"
  | "manning"
  | "rimington"
  | "outland"
  | "unitas"
  | "apcoy"
  | "afca"

  // CBB & WCBB
  | "apoy"
  | "naismith"
  | "cousy"
  | "erving"
  | "kareem"
  | "malone"
  | "west"
  | "wooden"
  | "leslie"
  | "mcclain"
  | "lieberman"

  // NFL
  | "ropoy"
  | "rdpoy"
  | "opoy"
  | "dpoy"
  | "coy"

  // NHL
  | "selke"
  | "smythe"
  | "ross"
  | "norris"

  // MLB
  | "ruth"
  | "gehrig"
  | "young"
  | "clemente";

export type AwardSeason = {
  id: number;
  season: string;
  league: LeagueType;
  award_type:
    | "mvp"
    | "roy"
    | "dpoy"
    | "sixthman"
    | "coy"
    | "mip"
    | "heisman"
    | "fmvp";

  player_id?: number | null;
  player_name: string;
  voting?: string | null;
  age?: number | null;
  summary: string;
  coach?: string;
  school: string;
  award_team?: NBATeam | Team;
  current_team?: NBATeam | Team;
  current_team_id?: number | null;
  created_at: string;
};

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

  WNBA: [
    { label: "All Awards", value: "all", title: "" },
    { label: "MVP", value: "mvp", title: "WNBA MVP" },
    { label: "ROTY", value: "roy", title: "WNBA Rookie of the Year" },
    {
      label: "DPOY",
      value: "dpoy",
      title: "WNBA Defensive Player of the Year",
    },
    { label: "6MOY", value: "sixthman", title: "WNBA Sixth Man of the Year" },
    { label: "COY", value: "coy", title: "WNBA Coach of the Year" },
    { label: "MIP", value: "mip", title: "WNBA Most Improved Player" },
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
  WCBB: [
    { label: "All Awards", value: "all", title: "" },
    {
      label: "Women's AP Player of the Year",
      value: "apoy",
      title: "Women's AP Player of The Year",
    },
    {
      label: "Women's Defensive Player of the Year",
      value: "dpoy",
      title: "Women's Defensive Player of The Year",
    },
    {
      label: "Women's Naismith Award",
      value: "naismith",
      title: "Women's Naismith Award",
    },
    {
      label: "Women's Lisa Leslie Award",
      value: "mcclain",
      title: "Women's Lisa Leslie Award",
    },
    {
      label: "Women's Nancy Lieberman Award",
      value: "lieberman",
      title: "Women's Nancy Lieberman Award",
    },

    {
      label: "Women's Wooden Award",
      value: "wooden",
      title: "Women's Wooden Award",
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
  NHL: [
    { label: "All Awards", value: "all", title: "" },
    { label: "MVP", value: "mvp", title: "NHL Most Valuable Player" },
    {
      label: "James Norris Memorial Trophy",
      value: "norris",
      title: "James Norris Memorial Trophy",
    },
    {
      label: "Frank J. Selke Trophy",
      value: "selke",
      title: "NHL Frank J. Selke Trophy",
    },
    {
      label: "Coach of the Year",
      value: "coy",
      title: "NHL Coach of the Year",
    },
  ],
  MLB: [
    { label: "All Awards", value: "all", title: "" },
    { label: "MVP", value: "mvp", title: "MLB Most Valuable Player" },
    {
      label: "Cy Young Award",
      value: "young",
      title: "Cy Young Award",
    },
    {
      label: "Jackie Robinson Rookie of The Year",
      value: "roy",
      title: "Jackie Robinson Rookie of The Year",
    },
    {
      label: "Manager of the Year",
      value: "coy",
      title: "MLB Manager of the Year",
    },
  ],
};
