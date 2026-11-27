import type { ScoreboardOdds } from "types/odds";

type Team = {
  id: number;
  uid: string;
  name: string;
  shortName: string;
  fullName: string;
  code: string;
  location: string;
  logo: string;
  logoDark: string;
  primaryColor: string | null;
  secondaryColor: string | null;
  record: string;
  rank: number;
  score: number;
  winner: boolean | null;
};

export type HockeyGame = {
  odds?: ScoreboardOdds | null;
  league: { id: number; uid: string; code: string; name: string; slug: string };
  id: number;
  uid: string;
  name: string;
  shortName: string;
  headline: string;
  date: string;
  startDate: string;
  timestamp: number;
  season: { year: number; type: number; slug: string };
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
  broadcasts: string[];
  geoBroadcasts: unknown[];
  home: Team;
  away: Team;
  isConferenceGame: boolean;
  isNeutralSite: boolean;
  attendance: number;
  playByPlayAvailable: boolean;
  recent: true;
  wasSuspended: boolean;
  raw: { eventId: string; competitionId: string };
};

export type HockeyGameCardProps = {
  game: HockeyGame;
  isNHL?: boolean;
  isMCH?: boolean;
  isWCH?: boolean;
};
