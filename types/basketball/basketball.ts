import { ScoreboardOdds } from "../odds";

export type Team = {
  id: number;
  uid: string;
  name: string;
  fullName: string;
  shortName: string;
  code: string;
  location: string;
  city: string;
  state: string;
  logo: string;
  logoDark: string;
  primaryColor: string;
  secondaryColor: string;
  record: string;
  rank: number | null;
  score: number;
  winner: boolean;
};

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
  odds: ScoreboardOdds | null;
  home: Team;
  away: Team;
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
