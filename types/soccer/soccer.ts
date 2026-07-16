export type SoccerGame = {
  league: {
    id: number;
    uid: string;
    code: string;
    name: string;
    slug: string;
  };
  id: number;
  uid: string;
  name: string;
  shortName: string;
  headline: string;
  date: string;
  startDate: string;
  timestamp: string;
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
    period: number | string;
    clock: string;
    displayClock: string;
    completed: boolean;
  };
  venueName: {
    id: number;
    name: string;
    city: string;
    state: string;
    country: string;
    indoor: string;
  };
  broadcasts: string[];
  geoBroadcasts: [
    {
      type: string;
      market: string;
      media: string;
      region: string;
    },
  ];
  home: {
    id: number;
    espnId: number;
    uid: string;
    name: string;
    code: string;
    location: string;
    logo: string;
    record: string;
    score: number;
    winner: boolean | null;
  };
  away: {
    id: number;
    espnId: number;
    uid: string;
    name: string;
    code: string;
    location: string;
    logo: string;
    record: string;
    score: number;
    winner: boolean | null;
  };
  isConferenceGame: boolean;
  isNeutralSite: boolean;
  attendance: number;
  playByPlayAvailable: boolean;
  recent: boolean;
  wasSuspended: boolean;
  raw: {
    eventId: string;
    competitionId: string;
  };
};

export type SoccerGameCardProps = {
  game: SoccerGame;
  isEPL?: boolean;
};

export type SoccerTeam = {
  id: number;
  espnId: number;
  name: string;
  code: string;
  fullName: string;
  shortName: string;
  city: string;
  location: string;
  address?: string;
  coach?: string;
  conference?: string;
  conferenceShortName?: string;
  owner?: string;
  venueName: string;
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
  isNational: boolean;
};
