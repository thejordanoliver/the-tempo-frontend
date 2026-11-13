export type BasketballGame = {
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
    displayClock: string;
    completed: boolean;
  };
  venue: {
    id: string;
    name: string;
    city: string;
    state: string;
    indoor: boolean;
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
  periods: number;
  home: {
    id: number;
    uid: string;
    name: string;
    shortName: string;
    code: string;
    city: string;
    state: string;
    location: string;
    logo: string;
    primaryColor: string;
    secondaryColor: string;
    alt_id: number;
    rank: number;
    score: number;
    record: string;
    winner: boolean;
  };
  away: {
    id: number;
    uid: string;
    name: string;
    shortName: string;
    code: string;
    city: string;
    state: string;
    location: string;
    logo: string;
    primaryColor: string;
    secondaryColor: string;
    alt_id: number;
    rank: number;
    score: number;
    record: string;
    winner: boolean;
  };
  isConferenceGame: boolean;
  isNeutralSite: boolean;
  attendance: 0;
  playByPlayAvailable: boolean;
  recent: boolean;
  wasSuspended: boolean;
};

export type BasketballGameCardProps = {
  game: BasketballGame;
  isSL?: boolean;
  isNBA?: boolean;
  isMCBB?: boolean;
  isWCBB?: boolean;
  isWNBA?: boolean;
  isGLEAGUE?: boolean;
};
