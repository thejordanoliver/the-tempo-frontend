// types/cfb.ts
import PlaceholderLogo from "assets/Placeholders/teamPlaceholder.png";
import { Colors } from "constants/Colors";
import { ImageSourcePropType } from "react-native";

export interface CFBPlayer {
  id: number;
  name: string;
  birth_date?: string;
  age?: number | null;
  height?: string | null;
  weight?: string | null;
  college?: string | null;
  group?: string | null;
  position?: string | null;
  number?: number | null;
  salary?: string | null;
  experience?: number | null;
  image?: string;
  teamId: number;
}

export type CFBTeam = {
  id: number;
  espnID?: string | number;
  oddsID?: string;
  name: string;
  shortName?: string;
  fullName?: string;
  code: string;
  abbreviation?: string;
  city?: string;
  location?: string;
  address?: string; // ✅ Add this
  coach?: string;
  coachImage?: string;
  venue?: string;
  firstSeason?: number;
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
  logo: any;
  logoLight?: any;
  color?: string;
  secondaryColor?: string;
  championships?: number[];
  conference_championships?: string[];
  banner?: any;
};

export type CFBGame = {
  game: {
    id: string;
    date: {
      timezone: string;
      date: string;
      time: string;
      timestamp: number;
      utc?: string;
      local?: string;
    };
    stage: string;
    status: { short: string; long: string; timer?: string | null }; // 👈 updated here
    venue?: { name: string; city: string };
    week?: string;
  };
  teams: {
    home: CFBTeam;
    away: CFBTeam;
  };
  scores: {
    home?: {
      total?: number;
      quarter_1?: number;
      quarter_2?: number;
      quarter_3?: number;
      quarter_4?: number;
      overtime?: number;
    };
    away?: {
      total?: number;
      quarter_1?: number;
      quarter_2?: number;
      quarter_3?: number;
      quarter_4?: number;
      overtime?: number;
    };
  };
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
  latitude?: number;
  longitude?: number;
  venueCapacity?: string;
  venueImage?: any;
};

export type CFBGamesResponse = {
  results: number;
  response: CFBGame[];
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
    home: CFBTeam;
    away: CFBTeam;
  };
  scores: {
    home: Record<string, number | null>;
    away: Record<string, number | null>;
  };
};

export interface RawCFBGame {
  id: string | number;
  date: string; // ISO string
  time?: string; // "HH:mm" optional
  status: {
    short: string;
    long: string;
    timer?: string | null;
  };
  venue?: {
    name: string;
    city: string;
  };
  week?: string;
  stage?: string;
  teams: {
    home: { id: string; name: string; logo?: string };
    away: { id: string; name: string; logo?: string };
  };
  scores: {
    home?: Record<string, any>;
    away?: Record<string, any>;
  };
  league?: {
    id?: number;
    name?: string;
    season?: string;
    logo?: string;
  };
}

export const emptyTeam: CFBTeam = {
  id: 0,
  espnID: "0",
  name: "TBD",
  shortName: "TBD",
  code: "UNK",
  city: "Unknown",
  location: "Unknown",
  coach: "Unknown",
  coachImage: "Unknown",
  venue: "Unknown",
  established: 0,
  latitude: 0,
  longitude: 0,
  venueImage: "Unknown",
  venueCapacity: "0",
  country: {
    name: "Unknown",
    code: "Unknown",
    flag: "Unknown",
  },
  logo: PlaceholderLogo,
  logoLight: PlaceholderLogo,
  fullName: "Unknown",
  color: Colors.white,
  secondaryColor: Colors.black,
};

export const emptyAwayTeam: CFBTeam = {
  id: 0,
  espnID: "-2",
  oddsID: "0",
  logo: PlaceholderLogo,
  name: "TBD",
  shortName: "TBD",
  fullName: "TBD",
  code: "TBD",
  city: "Unknown",
  location: "Unknown",
  address: "",
  coach: "Unknown",
  venue: "Unknown",
  established: 0,
  color: Colors.darkGray,
  secondaryColor: Colors.black,
  country: {
    name: "Unknown",
    code: "UNK",
    flag: "",
  },
  latitude: 0,
  longitude: 0,
  venueImage: null,
  venueCapacity: "",
};

export const emptyHomeTeam: CFBTeam = {
  id: 0,
  espnID: "-1",
  oddsID: "0",
  logo: PlaceholderLogo,
  name: "TBD",
  shortName: "TBD",
  fullName: "TBD",
  code: "TBD",
  city: "Unknown",
  location: "Unknown",
  address: "",
  coach: "Unknown",
  venue: "Unknown",
  established: 0,
  color: Colors.lightGray,
  secondaryColor: Colors.black,
  country: {
    name: "Unknown",
    code: "UNK",
    flag: "",
  },
  latitude: 0,
  longitude: 0,
  venueImage: null,
  venueCapacity: "",
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
