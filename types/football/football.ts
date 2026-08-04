// types/nfl.ts

import PlaceholderLogo from "assets/Placeholders/teamPlaceholder.png";
import { Colors } from "constants/styles";
import type { ImageSourcePropType } from "react-native";

export type Team = {
  id: number;
  wid?: number;
  espnId?: number | null;
  summerLeagueId?: number;
  name: string;
  shortName?: string;
  fullName: string;
  code: string;
  city: string | null;
  location: string | null;
  coach?: string;
  conference?: string;
  conferenceShortName?: string;
  owner?: string;
  established: number;
  logo: any;
  logoLight?: any;
  wLogo?: any;
  color: string | null;
  secondaryColor: string | null;
  championships?: number[];
  uniforms?: {
    home?: ImageSourcePropType;
    away?: ImageSourcePropType;
  };
  isAllStar: boolean;
  isNational: boolean;
  isActive: boolean;
};

export type FootballGame = {
  league: {
    id: number;
    uid: string;
    code: string;
    name: string;
    slug: string;
  };
  id: number;
  uid: string;
  name: string;
  shortName: string;
  headline: string;
  date: string;
  startDate: string;
  timestamp: string;
  season: {
    year: number;
    type: number;
    slug: "pre-season" | "regular-season" | "post-season";
  };
  week: {
    number: string;
  };
  status: {
    state: string;
    description: string;
    detail: string;
    shortDetail: string;
    period: number;
    quarter: number;
    clock: number;
    displayClock: string;
    completed: boolean;
  };
  venueName: {
    id: number;
    name: string;
    city: string;
    state: string;
    country: string;
    indoor: string;
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
  odds: {
    provider: string;
    details: string;
    spread: number;
    overUnder: number;
    homeMoneyline: null;
    awayMoneyline: null;
  };
  periods: number;
  period: number;
  quarter: number;
  clock: number;
  displayClock: string;
  down: null;
  distance: null;
  yardLine: null;
  possession: null;
  possessionText: null;
  redZone: boolean;
  drive: null;
  lastPlay: null;
  teamWithPossession: null;
  home: {
    id: number;
    espnId: number;
    uid: string;
    name: string;
    code: string;
    location: string;
    logo: string;
    primaryColor: string;
    secondaryColor: string;
    conferenceId: number | null;
    record: string;
    rank: number | null;
    score: number;
    winner: boolean;
  };
  away: {
    id: number;
    espnId: number;
    uid: string;
    name: string;
    code: string;
    location: string;
    logo: string;
    primaryColor: string;
    secondaryColor: string;
    conferenceId: number | null;
    record: string;
    rank: number | null;
    score: number;
    winner: boolean;
  };
  isConferenceGame: boolean;
  isNeutralSite: boolean;
  attendance: number;
  playByPlayAvailable: boolean;
  recent: boolean;
  wasSuspended: boolean;
  situation: {
    down: null;
    distance: null;
    downDistanceText: string | null;
    shortDownDistanceText: string | null;
    yardLine: null;
    possession: null;
    possessionText: null;
    isRedZone: false;
    drive: null;
    lastPlay: null;
    teamWithPossession: null;
  };
  raw: {
    eventId: string;
    competitionId: string;
  };
};

export type FootballGameCardProps = {
  game: FootballGame;
  isNFL?: boolean;
  isCFB?: boolean;
};

export const emptyAwayTeam = {
  id: 0,
  espnId: -2,
  logo: PlaceholderLogo,
  logoLight: PlaceholderLogo,
  name: "TBD",
  fullName: "TBD",
  code: "TBD",
  city: "Unknown",
  location: "Unknown",
  conference: "Unknown",
  owner: "Unknown",
  venueName: "Unknown",
  established: 0,
  color: Colors.darkGray,
  secondaryColor: Colors.black,
  latitude: 0,
  longitude: 0,
  venueImage: null,
  venueCapacity: "",
  isAllStar: false,
  isActive: false,
};

export const emptyHomeTeam = {
  id: 0,
  espnId: -1,
  logo: PlaceholderLogo,
  logoLight: PlaceholderLogo,
  name: "TBD",
  fullName: "TBD",
  code: "TBD",
  city: "Unknown",
  location: "Unknown",
  conference: "Unknown",
  owner: "Unknown",
  venueName: "Unknown",
  established: 0,
  color: Colors.lightGray,
  secondaryColor: Colors.black,
  latitude: 0,
  longitude: 0,
  venueImage: null,
  venueCapacity: "",
  isAllStar: false,
  isActive: false,
};

export type Conference = {
  name: string;
  logo: any | null;
  teams: string[];
  color?: {
    primary: string;
    secondary: string;
  };
};

export interface CFBPlayoffBracketTeam {
  id: number | string;
  espnId?: string | number;
  oddsId?: string;
  name: string;
  shortName?: string;
  fullName?: string;
  code: string;
  logo: any;
  logoLight?: any;
  abbreviation?: string;
  city?: string;
  location?: string;
  address?: string;
  coach?: string;
  coachImage?: string;
  venueName?: string;
  established?: number;
  seed?: number | null;
  score?: number;
  record?: string | null; // "12-1"
}

export interface CFBPlayoffBracketBroadcast {
  name: string;
  type: string;
}

export type Round = "first" | "quarterfinal" | "semifinal" | "championship";

export interface CFBPlayoffBracketGame {
  id: string;
  top: CFBPlayoffBracketTeam | null;
  bottom: CFBPlayoffBracketTeam | null;
  round: Round;
  status: "scheduled" | "live" | "final";
  startTime?: string;
  topScore?: number | null;
  bottomScore?: number | null;
  broadcasts?: CFBPlayoffBracketBroadcast[];
}

export interface CFBPlayoffBracketRound {
  title: string;
  games: CFBPlayoffBracketGame[];
}

export type BracketTeam = CFBPlayoffBracketTeam;
export type BracketGame = CFBPlayoffBracketGame;
export type BracketRound = CFBPlayoffBracketRound;
export type Game = FootballGame;

export interface BracketData {
  first: CFBPlayoffBracketRound;
  quarterfinal: CFBPlayoffBracketRound;
  semifinal: CFBPlayoffBracketRound;
  championship: CFBPlayoffBracketRound;
}

export type NFLPlayoffLeagueInfo = {
  id: number;
  uid: string;
  code: string;
  name: string;
  slug: string;
};

export type NFLPlayoffSeason = {
  year: number;
  type: number;
  slug?: string | null;
};

export type NFLPlayoffWeek = {
  number: number;
};

export type NFLPlayoffStatus = {
  state: string;
  description: string;
  detail: string;
  shortDetail: string;
  period: number | null;
  quarter: number | null;
  clock: number | string | null;
  displayClock: string | null;
  completed: boolean;
};

export type NFLPlayoffVenue = {
  id: number;
  name: string;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  indoor?: boolean;
};

export type NFLPlayoffTeam = {
  id: number;
  espnId: number;
  uid: string;
  name: string;
  code: string;
  location?: string | null;
  logo?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  conferenceId?: number | null;
  record?: string | null;
  rank?: number | null;
  score?: number | null;
  winner?: boolean;
};

export type NFLPlayoffGeoBroadcast = {
  type?: string | null;
  market?: string | null;
  media?: string | null;
  region?: string | null;
};

export type NFLPlayoffSituation = {
  down?: number | null;
  distance?: number | null;
  shortDownDistanceText?: string | null;
  downDistanceText?: string | null;
  yardLine?: number | null;
  possession?: number | string | null;
  possessionText?: string | null;
  isRedZone?: boolean;
  drive?: unknown;
  lastPlay?: unknown;
  teamWithPossession?: unknown;
};

export type NFLPlayoffGame = {
  league: NFLPlayoffLeagueInfo;

  id: number;
  uid: string;

  name: string;
  shortName: string;
  headline?: string | null;

  date: string;
  startDate: string;
  timestamp: number;

  season: NFLPlayoffSeason;
  week: NFLPlayoffWeek;

  status: NFLPlayoffStatus;
  venue?: NFLPlayoffVenue | null;

  broadcasts?: string[];
  geoBroadcasts?: NFLPlayoffGeoBroadcast[];

  odds?: unknown;

  periods?: number | null;
  period?: number | null;
  quarter?: number | null;
  clock?: number | string | null;
  displayClock?: string | null;

  down?: number | null;
  distance?: number | null;
  yardLine?: number | null;
  possession?: number | string | null;
  possessionText?: string | null;
  redZone?: boolean;

  drive?: unknown;
  lastPlay?: unknown;
  teamWithPossession?: unknown;

  home: NFLPlayoffTeam;
  away: NFLPlayoffTeam;

  isConferenceGame?: boolean;
  isNeutralSite?: boolean;
  attendance?: number | null;
  playByPlayAvailable?: boolean;
  recent?: boolean;
  wasSuspended?: boolean;

  situation?: NFLPlayoffSituation;

  raw?: {
    eventId?: string;
    competitionId?: string;
  };
};

export type NFLPlayoffGroup = {
  key: string;
  label: string;

  season: NFLPlayoffSeason;
  week: NFLPlayoffWeek;

  count: number;
  games: NFLPlayoffGame[];
};

export type BracketApiResponse = {
  success: boolean;
  league: string;

  leagueInfo: NFLPlayoffLeagueInfo;

  season: {
    type: number;
    year: number;
  };

  week: number | null;
  weeks: number[];

  seasonType: number;
  postseason: boolean;
  playoffType: string;

  includeBowls: boolean;
  includeProBowl: boolean;

  date: string | null;
  conferenceId: number | null;

  count: number;

  groups: NFLPlayoffGroup[];
  games: NFLPlayoffGame[];
};
