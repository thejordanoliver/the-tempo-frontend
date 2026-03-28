// types/cfb.ts
import { ImageSourcePropType } from "react-native";


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
