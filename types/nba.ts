export type CardLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
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
    top: PlayoffTeam;
    bottom: PlayoffTeam;
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
  topTeam?: PlayoffTeam;
  bottomTeam?: PlayoffTeam;
  winner?: PlayoffTeam;
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
