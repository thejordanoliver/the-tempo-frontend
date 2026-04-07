// types/nfl.ts

import PlaceholderLogo from "assets/Placeholders/teamPlaceholder.png";
import { Colors } from "constants/styles";
import { ImageSourcePropType } from "react-native";

export interface NFLPlayer {
  id: number;
  name: string;
  birth_date?: string;
  age?: number | null;
  height?: string;
  weight?: string;
  college?: string | null;
  group?: string;
  position?: string;
  number?: number;
  salary?: string | null;
  experience?: number | null;
  image?: string;
  teamId: number;
}

export type FootballTeam = {
  id: number;
  espnID: number;
  oddsID?: string;
  name: string;
  shortName?: string;
  fullName: string;
  code: string;
  city: string;
  location: string;
  address?: string;
  coach?: string;
  conference?: string;
  conferenceShortName?: string;
  owner?: string;
  venue: string;
  established: number;
  logo: any;
  logoLight?: any;
  color: string;
  secondaryColor: string;
  latitude: number;
  longitude: number;
  venueImage: any;
  venueCapacity: string;
  championships?: number[];
  isAllStar: boolean;
  isActive: boolean;
};

export type Game = {
  game: {
    id: string; // ✅
    stage: string;
    week: string;
    date: {
      timezone: string;
      date: string;
      time: string;
      timestamp: number;
      utc?: string;
      local?: string;
    };
    venue: {
      name: string;
      city: string;
    };
    status: {
      short: string;
      long: string;
      timer?: string | null; // allow null too
    };
  };
  league: {
    id: number;
    name: string;
    season: string;
    logo: string;
  };
  teams: {
    home: FootballTeam;
    away: FootballTeam;
  };
  scores: {
    home: {
      total: number;
      quarter_1: number;
      quarter_2: number;
      quarter_3: number;
      quarter_4: number;
      overtime: number;
    };
    away: {
      total: number;
      quarter_1: number;
      quarter_2: number;
      quarter_3: number;
      quarter_4: number;
      overtime: number;
    };
  };
};

export const emptyTeam: FootballTeam = {
  id: 0,
  espnID: 0,
  oddsID: "0",
  name: "Unknown",
  fullName: "Unknown",
  code: "UNK",
  city: "Unknown",
  location: "Unknown",
  conference: "Unknown",
  owner: "Unknown",
  venue: "Unknown",
  address: "Unknown",
  established: 0,
  logo: PlaceholderLogo,
  logoLight: PlaceholderLogo,
  color: Colors.white,
  secondaryColor: Colors.black,
  latitude: 0,
  longitude: 0,
  venueImage: null,
  venueCapacity: "",
  isAllStar: false,
  isActive: false,
};

export const emptyAwayTeam: FootballTeam = {
  id: 0,
  espnID: -2,
  logo: PlaceholderLogo,
  logoLight: PlaceholderLogo,
  name: "TBD",
  fullName: "TBD",
  code: "TBD",
  city: "Unknown",
  location: "Unknown",
  conference: "Unknown",
  owner: "Unknown",
  venue: "Unknown",
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

export const emptyHomeTeam: FootballTeam = {
  id: 0,
  espnID: -1,
  logo: PlaceholderLogo,
  logoLight: PlaceholderLogo,
  name: "TBD",
  fullName: "TBD",
  code: "TBD",
  city: "Unknown",
  location: "Unknown",
  conference: "Unknown",
  owner: "Unknown",
  venue: "Unknown",
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

// CFB
export type Conference = {
  name: string;
  logo: ImageSourcePropType | null;
  teams: string[];
  color?: {
    primary: string;
    secondary: string;
  };
};

export interface BracketTeam {
  id: number | string;
  espnID?: string | number;
  oddsID?: string;
  name: string;
  shortName?: string;
  fullName?: string;
  code: string;
  logo: ImageSourcePropType;
  logoLight?: ImageSourcePropType;
  abbreviation?: string;
  city?: string;
  location?: string;
  address?: string;
  coach?: string;
  coachImage?: string;
  venue?: string;
  established?: number;
  seed?: number | null;
  score?: number;
  record?: string | null; // "12-1"
}

export interface BracketBroadcast {
  name: string;
  type: string;
}
export type Round = "first" | "quarterfinal" | "semifinal" | "championship";

export interface BracketGame {
  id: string;

  top: BracketTeam | null;
  bottom: BracketTeam | null;
  round: Round;

  // NEW FIELDS REQUIRED BY useCFPBracket
  status: "scheduled" | "live" | "final";
  startTime?: string;

  topScore?: number | null;
  bottomScore?: number | null;
  broadcasts?: BracketBroadcast[];
}

export interface BracketRound {
  title: string;
  games: BracketGame[];
}

export interface BracketData {
  first: BracketRound;
  quarterfinal: BracketRound;
  semifinal: BracketRound;
  championship: BracketRound;
  isDark: boolean;
}
