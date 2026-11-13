// types/nfl.ts

import PlaceholderLogo from "assets/Placeholders/teamPlaceholder.png";
import { Colors } from "constants/styles";

export type LastPlay = {
  id: string;
  text: string;
  scoreValue: number;
  scoringPlay: null;
  clock: null;
  period: null;
  type: {
    id: string;
    text: string;
    abbreviation: string;
  };
  teamId: number;
  athletesInvolved: [
    {
      id: string;
      fullName: string;
      displayName: string;
      shortName: string;
      position: string;
    },
  ];
};

export type FootballGame = {
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
    slug: "pre-season" | "regular-season" | "post-season";
  };
  week: {
    number: string;
  };
  status: {
    state: string;
    description: string;
    detail: string;
    shortDetail: string;
    period: number;
    quarter: number;
    clock: number;
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
  odds: {
    provider: string;
    details: string;
    spread: number;
    overUnder: number;
    homeMoneyline: null;
    awayMoneyline: null;
  };

  home: {
    id: number;
    uid: string;
    name: string;
    shortName?: string | null;
    code: string;
    location: string;
    logo: string;
    primaryColor: string;
    secondaryColor: string;
    conferenceId: number | null;
    record: string;
    rank: number | null;
    score: number;
    winner: boolean;
  };
  away: {
    id: number;
    uid: string;
    name: string;
    shortName?: string | null;
    code: string;
    location: string;
    logo: string;
    primaryColor: string;
    secondaryColor: string;
    conferenceId: number | null;
    record: string;
    rank: number | null;
    score: number;
    winner: boolean;
  };
  isConferenceGame: boolean;
  isNeutralSite: boolean;
  attendance: number;
  playByPlayAvailable: boolean;
  recent: boolean;
  wasSuspended: boolean;
  situation: {
    down: number;
    distance: number;
    shortDownDistanceText: string | null;
    downDistanceText: string | null;
    yardLine: number;
    possession: number;
    possessionText: string;
    isRedZone: boolean;
    drive: null;
    lastPlay: LastPlay;
    homeTimeouts: number;
    awayTimeouts: number;
  };
};

export type FootballGameCardProps = {
  game: FootballGame;
  isNFL?: boolean;
  isCFB?: boolean;
};

export const emptyAwayTeam = {
  id: 0,
  logo: PlaceholderLogo,
  logoLight: PlaceholderLogo,
  name: "TBD",
  fullName: "TBD",
  code: "TBD",
  city: "Unknown",
  location: "Unknown",
  conference: "Unknown",
  owner: "Unknown",
  venueName: "Unknown",
  established: 0,
  color: Colors.darkGray,
  secondaryColor: Colors.black,
  latitude: 0,
  longitude: 0,
  venueImage: null,
  venueCapacity: "",
  isAllStar: false,
  isActive: false,
};

export const emptyHomeTeam = {
  id: 0,
  logo: PlaceholderLogo,
  logoLight: PlaceholderLogo,
  name: "TBD",
  fullName: "TBD",
  code: "TBD",
  city: "Unknown",
  location: "Unknown",
  conference: "Unknown",
  owner: "Unknown",
  venueName: "Unknown",
  established: 0,
  color: Colors.lightGray,
  secondaryColor: Colors.black,
  latitude: 0,
  longitude: 0,
  venueImage: null,
  venueCapacity: "",
  isAllStar: false,
  isActive: false,
};

export type Conference = {
  name: string;
  logo: any | null;
  teams: string[];
  color?: {
    primary: string;
    secondary: string;
  };
};
