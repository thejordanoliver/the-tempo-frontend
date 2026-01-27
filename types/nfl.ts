// types/nfl.ts

import PlaceholderLogo from "assets/Placeholders/teamPlaceholder.png";
import { Colors } from "constants/Colors";
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

export type NFLTeam = {
  id: number;
  espnID: number;
  oddsID: string;
  name: string;
  fullName: string;
  code: string;
  city: string;
  location: string;
  address?: string;
  coach: string;
  coachImage?: string;
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
  conferenceChampionships?: {
    Titles?: number[]; // or number[]
  };
};

export type NFLGame = {
  game: {
    id: string;
    stage: string;
    week: string;
    date: { date: string; time: string; timestamp: number };
    status: { short: string; long: string; timer?: string };
    venue?: { name: string; city: string };
  };
  teams: {
    home: NFLTeam;
    away: NFLTeam;
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

export type Venue = {
  name: string;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  venueCapacity?: string;
  venueImage: any;
};

export type NFLGamesResponse = {
  results: number;
  response: NFLGame[];
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
    home: NFLTeam;
    away: NFLTeam;
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

export interface RawNFLGame {
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

export const emptyTeam: NFLTeam = {
  id: 0,
  espnID: 0,
  oddsID: "0",
  name: "Unknown",
  fullName: "Unknown",
  code: "UNK",
  city: "Unknown",
  location: "Unknown",
  coach: "Unknown",
  coachImage: "",
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
};

// fallback for cards
export const emptyNFLAwayTeam: NFLTeam = {
  id: 0,
  espnID: -2,
  oddsID: "0",
  logo: PlaceholderLogo,
  logoLight: PlaceholderLogo,
  name: "TBD",
  fullName: "TBD",
  code: "TBD",
  city: "Unknown",
  location: "Unknown",
  coach: "Unknown",
  owner: "Unknown",
  venue: "Unknown",
  established: 0,
  color: Colors.darkGray,
  secondaryColor: Colors.black,
  latitude: 0,
  longitude: 0,
  venueImage: null,
  venueCapacity: "",
};

export const emptyNFLHomeTeam: NFLTeam = {
  id: 0,
  espnID: -1,
  oddsID: "0",
  logo: PlaceholderLogo,
  logoLight: PlaceholderLogo,
  name: "TBD",
  fullName: "TBD",
  code: "TBD",
  city: "Unknown",
  location: "Unknown",
  coach: "Unknown",
  owner: "Unknown",
  venue: "Unknown",
  established: 0,
  color: Colors.lightGray,
  secondaryColor: Colors.black,
  latitude: 0,
  longitude: 0,
  venueImage: null,
  venueCapacity: "",
};
