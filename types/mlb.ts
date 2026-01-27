export interface MLBTeam {
  id: number;
  espnID: number;
  name: string;
  fullName: string;
  code: string;
  color: string;
  secondaryColor: string;
  logo: any;
  logoLight?: any;
  firstSeason?: number;
  latitude?: number;
  longitude?: number;
  venue?: string;
  venueCapacity?: string;
  address?: string;
  city?: string;
  championships?: number[];
}

export interface MLBScoreSide {
  hits: number;
  errors: number;
  innings: Record<string, number | null>;
  total: number;
}

export interface MLBGame {
  id: number;
  league: any;
  country: any;
  date: {
    utc: string | null;
    time: string | null;
    timestamp: number | null;
    timezone: string | null;
  };

  status: {
    long: string;
    short: string;
    clock: string | null;
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
