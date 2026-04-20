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
