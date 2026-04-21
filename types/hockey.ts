export interface NHLTeam {
  id: number;
  espnID: number;
  name: string;
  fullName: string;
  code: string;
  color: string;
  secondaryColor: string;
  logo: any;
  logoLight?: any;
  location?: string;
  established?: number;
  latitude?: number;
  longitude?: number;
  venueImage?: string;
  venueName?: string;
  venueCapacity?: string;
  address?: string;
  city?: string;
  championships?: number[];
  isAllStar: boolean;
  isActive: boolean;
  national: boolean;
}

export type NHLGame = {
  id: number;
  date: string;
  time: string;
  timestamp: number;
  timezone: string;
  week: null;
  timer: null;
  status: {
    long:
      | "Not Started"
      | "Finished"
      | "First Period"
      | "Second Period"
      | "Third Period"
      | "Over Time"
      | "Penalties Time"
      | "Break Time"
      | "Awarded"
      | "Postponed"
      | "Cancelled"
      | "Interrupted"
      | "Abandoned"
      | "After Over Time"
      | "After Penalties";

    short:
      | "NS" // Not Started
      | "P1" // First Period (In Play)
      | "P2" // Second Period (In Play)
      | "P3" // Third Period (In Play)
      | "OT" // Over Time (In Play)
      | "PT" // Penalties Time (In Play)
      | "BT" // Break Time (In Play)
      | "AW" // Awarded
      | "POST" // Postponed
      | "CANC" // Cancelled
      | "INTR" // Interrupted
      | "ABD" // Abandoned
      | "AOT" // After Over Time (Game Finished)
      | "AP" // After Penalties (Game Finished)
      | "FT"; // Finished (Game Finished)
  };
  country: {
    id: number;
    name: string;
    code: string;
    flag: string;
  };
  league: {
    id: 3;
    name: string;
    type: string;
    logo: string;
    season: 2025;
  };
  teams: {
    home: NHLTeam;
    away: NHLTeam;
  };
  scores: {
    home: number;
    away: number;
  };
  periods: {
    first: string;
    second: string;
    third: string;
    overtime: null;
    penalties: null;
  };
  events: true;
};

export type HockeyGameCardProps = {
  game: NHLGame;
};

export interface NHLPlayer {
  id: string;
  name: string;
  shortName: string;
  firstName: string;
  lastName: string;
  jersey: string | null;
  position: string;
  height: string;
  weight: string;
  age: number;
  team: string;
  teamId: string;
  imageUrl: string;
}
