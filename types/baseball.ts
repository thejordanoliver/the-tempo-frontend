import { ImageSourcePropType } from "react-native";

export interface MLBTeam {
  id: number;
  espnID: number;
  name: string;
  fullName: string;
  code: string | undefined;
  color: string;
  secondaryColor: string;
  logo: any;
  logoLight?: any;
  established?: number;
  latitude?: number;
  longitude?: number;
  venueName?: string;
  venueCapacity?: string;
  venueImage?: string;
  address?: string;
  city?: string;
  championships?: number[];
  isAllStar: boolean;
  isActive: boolean;
}

export interface MLBScoreSide {
  total: number;
  hits: number;
  errors: number;
  innings: Record<string, number | null>;
}

export interface MLBGame {
  id: number;

  league: {
    id: number;
    name: string;
    type: string;
    season: number;
    logo: string;
  };

  country: {
    id: number;
    name: string;
    code: string;
    flag: string;
  };

  date: string; // ISO string
  timestamp: number; // Unix timestamp (seconds)

  status: {
    long: string;
    short: string;
    clock: string | null;
  };

  venue?: {
    id?: number;
    name?: string;
    city?: string;
  };

  teams: {
    home: MLBTeam;
    away: MLBTeam;
  };

  scores: {
    home: MLBScoreSide;
    away: MLBScoreSide;
  };
}

export type BaseballGameCardProps = {
  game: MLBGame;
};

export interface MLBPlayer {
  id: string;
  name: string;
  shortName: string;
  firstName: string;
  lastName: string;
  jersey: string;
  position: string;
  height: string;
  weight: string;
  age: number;
  team: string;
  teamId: string;
  imageUrl: string;
}

export type CollegeBaseballTeam = {
  id: number;
  name: string;
  fullName: string;
  shortName: string;
  code: string;
  color: string | null;
  logo: ImageSourcePropType;
  logoLight?: ImageSourcePropType;
  isActive: boolean;
  isAllStar: boolean;
};

export type CollegeBaseballGame = {
  id: string;
  uid: string;
  name: string;
  shortName: string;
  date: string;
  startDate: string;
  timestamp: number;
  status: {
    state: string;
    description: string;
    detail: string;
    shortDetail: string;
    period: number;
    completed: boolean;
  };
  venue: {
    id: string;
    name: string;
    city: string;
    state: string;
    indoor: boolean;
  };
  broadcasts: [];
  geoBroadcasts: [];
  innings: 9;
  homeTeam: {
    id: string;
    uid: string;
    name: string;
    code: string;
    location: string;
    logo: any;
    color: string;
    score: number;
    hits: number;
    errors: number;
    record: string;
  };
  awayTeam: {
    id: string;
    uid: string;
    name: string;
    code: string;
    location: string;
    logo: any;
    color: string;
    score: number;
    hits: number;
    errors: number;
    record: string;
  };
  isConferenceGame: boolean;
  isNeutralSite: boolean;
  attendance: number;
  playByPlayAvailable: boolean;
  recent: true;
  wasSuspended: boolean;
  raw: {
    eventId: string;
    competitionId: string;
  };
};
export type CollegeBaseballGameCardProps = {
  game: CollegeBaseballGame;
};
