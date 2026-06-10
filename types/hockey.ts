export interface NHLTeam {
  id: number;
  espnId: number;
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

export type HockeyGame = {
  league: {
    id: number;
    uid: string;
    code: string;
    name: string;
    slug: string;
  };
  id: string | number;
  uid: string;
  name: string;
  shortName: string;
  headline: string;
  date: string;
  startDate: string;
  timestamp: number;
  season: {
    year: number;
    type: number;
    slug: string;
  };
  status: {
    state: string;
    description: string;
    detail: string;
    shortDetail: string;
    period: number;
    clock: string;
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
  innings: number;
  home: {
    id: number;
    espnId: number;
    name: string;
    code: string;
    primaryColor: string;
    secondaryColor: string;
    score: number;
    hits: number;
    errors: number;
    record: string;
    homeRank: number;
    winner: boolean;
  };
  away: {
    id: number;
    espnId: number;
    name: string;
    fullName: string;
    code: string;
    primaryColor: string;
    secondaryColor: string;
    score: number;
    hits: number;
    errors: number;
    record: string;
    awayRank: number;
    winner: boolean;
  };
  isConferenceGame: boolean;
  isNeutralSite: boolean;
  attendance: number;
  playByPlayAvailable: boolean;
  recent: true;
  wasSuspended: boolean;
  situation: null;
  raw: {
    eventId: string;
    competitionId: string;
  };
};

export type HockeyGameCardProps = {
  game: HockeyGame;
  isNHL: boolean;
  isMCH: boolean;
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
