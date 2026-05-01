export type CardLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type NBATeam = {
  id: number;
  espnID: number;
  summerLeagueId?: number;
  name: string;
  fullName: string;
  logo: any;
  logoLight: any;
  color: string;
  secondaryColor?: string;
  established?: string;
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

export type PlayoffTeam = {
  id: number;
  name: string;
  code: string;
  logo: string;
  seed?: number;
  conference?: string;
};

export type PlayoffGame = {
  id: number;
  date: { start: string };
  status: {
    short: number;
    long: string;
    clock: string;
    halftime: boolean;
  };
  periods: {
    current: number;
    total: number;
    endOfPeriod: boolean;
  };
  scores: {
    home: { points: number };
    visitors: { points: number };
  };
  teams: {
    home: NBATeam;
    visitors: NBATeam;
  };
};

export type PlayoffSeries = {
  teams: {
    top: NBATeam;
    bottom: NBATeam;
  };
  wins: Record<string, number>;
  leader: number;
  status: string;
  games: PlayoffGame[];
};

export type PlayoffResponse = {
  success: boolean;
  season: number;
  east: (PlayoffSeries | Record<string, never>)[];
  west: (PlayoffSeries | Record<string, never>)[];
  seriesCount: number;
};

export type BracketMatchup = {
  id: string;
  round: number;
  conference: "east" | "west" | "finals";
  topTeam?: NBATeam;
  bottomTeam?: NBATeam;
  winner?: NBATeam;
  wins: Record<string, number>;
  leader?: number;
  status?: string;
  games: PlayoffGame[];
};

export type PlayoffBracket = {
  east: BracketMatchup[][];
  west: BracketMatchup[][];
  finals: BracketMatchup | null;
};
