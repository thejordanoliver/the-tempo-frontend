// types/cfb.ts
const DefaultLogo = require("assets/Placeholders/teamPlaceholder.png");
import { ImageSourcePropType } from "react-native";
export interface CFBPlayer {
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

export type CFBTeam = {
  id: number | string;
  espnID?: string | number;
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
  venue?: string;
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
  logo: string;
  logoLight?: string;
  logo500x500?: string;
  logoLight500x500?: string;
  color?: string;
  secondaryColor?: string;
  championships?: number[];
  conference_championships?: string[]; // or number[]
    banner?: any; // <-- add this

};


export type CFBGame = {
  game: {
    id: string;
    date: { timestamp: number };
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
  name: "Unknown",
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
  logo: DefaultLogo, // ✅ correct type
  logo500x500: "",
  fullName: "Unknown",
  color: "#000000",
  secondaryColor: "#FFFFFF",
};
