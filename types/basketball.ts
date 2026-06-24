

export type BasketballTeam = {
  id: number;
  wid: number;
  espnId: number | null;
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

export type NBATeam = {
  id: number;
  espnId: number;
  seed?: number;
  summerLeagueId?: number;
  name: string;
  shortName: string;
  fullName: string;
  logo: any;
  logoLight: any;
  color: string;
  secondaryColor?: string;
  established?: number;
  record?: string;
  wins?: number;
  losses?: number;
  coach?: string;
  code: string;
  location: string;
  city?: string;
  state?: string;
  conference?: string;
  uniforms?: {
    home: any;
    away: any;
  };
  isActive: boolean;
  isAllStar: boolean;
};

export type BasketballGame = {
  league: {
    id: number;
    uid: string;
    code: string;
    name: string;
    slug: string;
  };
  id: string;
  uid: string;
  name: string;
  shortName: string;
  headline: string;
  date: string;
  startDate: string;
  timestamp: number;
  season: {
    year: number;
    type: number;
    slug: string;
  };
  status: {
    state: string;
    description: string;
    detail: string;
    shortDetail: string;
    period: number;
    clock: string;
    displayClock: string;
    completed: boolean;
  };
  venue: {
    id: string;
    name: string;
    city: string;
    state: string;
    indoor: boolean;
  };
  broadcasts: string[];
  geoBroadcasts: [
    {
      type: string;
      market: string;
      media: string;
      region: string;
    },
  ];
  periods: number;
  home: {
    id: number;
    wid: number | null;
    espnId: number;
    uid: string;
    name: string;
    shortName: string;
    code: string;
    city: string;
    state: string;
    location: string;
    logo: string;
    primaryColor: string;
    secondaryColor: string;
    nbaAPIID: number;
    rank: number;
    score: number;
    record: string;
    winner: boolean;
  };
  away: {
    id: number;
    wid: number | null;
    espnId: number;
    uid: string;
    name: string;
    shortName: string;
    code: string;
    city: string;
    state: string;
    location: string;
    logo: string;
    primaryColor: string;
    secondaryColor: string;
    nbaAPIID: number;
    rank: number;
    score: number;
    record: string;
    winner: boolean;
  };
  isConferenceGame: boolean;
  isNeutralSite: boolean;
  attendance: 0;
  playByPlayAvailable: boolean;
  recent: boolean;
  wasSuspended: boolean;
  raw: {
    eventId: string;
    competitionId: string;
  };
};

export type Game = {
  id: number;
  date: string;
  time: string;
  home: NBATeam;
  away: NBATeam;
  scores?: { home: { points: number }; away: { points: number } };
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

export type BasketballGameCardProps = {
  game: BasketballGame;
  isNBA?: boolean;
  isCBB?: boolean;
  isWCBB?: boolean;
  isWNBA?: boolean;
};

export interface BasketballPlayer {
  id: number;
  league: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  short_name?: string;
  jersey_number?: string;
  position: string;
  height?: string;
  weight?: string;
  experience_years?: number;
  experience_display?: string;
  experience_abbr?: string;
  team?: string;
  team_id?: string;
  headshot_url?: string;
  college: string;
  birth_place_city: string;
  birth_place_state?: string;
  birth_place_country?: string;
  date_of_birth: string;
  status: boolean;
}

export interface RecruitOffer {
  visit: string | null;
  school: string;
  status: string | null;
  hasOffer: boolean;
  signedDate: string | null;
}

export interface RecruitPredictedSchool {
  team_id: number | null;
  team_name: string;
  team_title: string | null;
  percentage: number | null;
  confidence_score: number | null;
  confidence_text: string | null;
  matched_by?: string | null;
  href?: string | null;
  image_url?: string | null;
}

export interface CBBRecruit {
  id: number;
  year?: number;
  name: string;
  first_name: string;
  last_name: string;
  short_name: string;
  profile_url: string;
  high_school: string;
  hometown: string;
  position: string;
  height: string | null;
  weight: string | null;
  score: string;
  stars: number;
  national_rank: string;
  position_rank: string;
  state_rank: string;
  committed: boolean;
  signed: boolean;
  predicted: boolean;

  projected_school: string | null;
  predicted_school: string | null;
  prediction_percentage: string | null;

  predicted_schools: RecruitPredictedSchool[];

  image_url: string | null;

  committed_team_id: number | null;
  predicted_team_id: number | null;
  projected_team_id: number | null;

  offers: RecruitOffer[];
}

export type CardLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type NBAPlayoffGamesResponse = {
  success: boolean;
  league: "nba";
  leagueInfo?: any;
  season?: {
    year?: number | null;
    type?: number | null;
    slug?: string | null;
  };
  count: number;
  roundCount: number;
  rounds: NBAPlayoffRound[];
  games: NBAPlayoffGame[];
};

export type UseNBAPlayoffGamesOptions = {
  season?: number | string;
  dates?: string;
  enabled?: boolean;
  pollLiveGames?: boolean;
  pollIntervalMs?: number;
};

export type FetchPlayoffGamesOptions = {
  forceRefresh?: boolean;
  silent?: boolean;
};

export type NormalizedRoundKey =
  | "first-round"
  | "conference-semifinals"
  | "conference-finals"
  | "finals";

export type RoundDefinition = {
  key: NormalizedRoundKey;
  label: string;
  order: number;
};

export type NBAPlayoffId = string | number;

export type NBAPlayoffTeam = {
  id: NBAPlayoffId;
  espnId?: NBAPlayoffId | null;
  name?: string;
  shortName?: string | null;
  code?: string;
  logo?: any;
  seed?: number | string | null;
  playoffSeed?: number | string | null;
  conference?: string | null;
  score?: number;
  record?: string;
  winner?: boolean | null;
};

export type NBAPlayoffGame = {
  id: string | number;
  name?: string | null;
  shortName?: string | null;
  headline?: string | null;
  date?: string | null;
  startDate?: string | null;
  timestamp?: number | null;

  season?: {
    year?: number | null;
    type?: number | null;
    slug?: string | null;
  };

  status?: {
    state?: string | null;
    description?: string | null;
    detail?: string | null;
    shortDetail?: string | null;
    period?: number | null;
    clock?: string | number | null;
    displayClock?: string | number | null;
    completed?: boolean;
  };

  home?: NBAPlayoffTeam;
  away?: NBAPlayoffTeam;

  playoff?: {
    roundKey?: string;
    roundLabel?: string;
    roundOrder?: number;
    conference?: string | null;
    seriesKey?: string;
    seriesLabel?: string;
    gameNumber?: number | null;
  };

  [key: string]: any;
};

export type NBAPlayoffSeries = {
  key: string;
  label: string;
  conference?: "east" | "west" | "finals" | string | null;
  topSeed?: number | null;
  bottomSeed?: number | null;
  winner?: any;
  leader?: any;
  seriesSummary?: string | null;
  wins?: Record<string, number>;
  teams?: {
    top?: NBAPlayoffTeam;
    bottom?: NBAPlayoffTeam;
  };
  teamIds: (string | number)[];
  teamCodes: string[];
  teamNames: string[];
  count: number;
  games: NBAPlayoffGame[];
};

export type NBAPlayoffResponse = {
  success: boolean;
  season: number;
  east: (NBAPlayoffSeries | Record<string, never>)[];
  west: (NBAPlayoffSeries | Record<string, never>)[];
  seriesCount: number;
};

export type NBABracketMatchup = {
  id: string;
  round: number;
  conference: "east" | "west" | "finals";
  topTeam?: NBAPlayoffTeam;
  bottomTeam?: NBAPlayoffTeam;
  winner?: NBAPlayoffTeam;
  wins: Record<string, number>;
  leader?: NBAPlayoffId;
  seriesSummary?: string | null;
  status?: string;
  games: NBAPlayoffGame[];
};

export type NBAPlayoffRound = {
  key: string;
  label: string;
  order: number;
  count: number;
  series: NBAPlayoffSeries[];
};

export type PlayoffBracket = {
  east: NBABracketMatchup[][];
  west: NBABracketMatchup[][];
  finals: NBABracketMatchup | null;
};
