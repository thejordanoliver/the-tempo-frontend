export type RacingLeague =
  | "f1"
  | "nascarpremier"
  | "nascarsecondary"
  | "nascartruck";

export type RacingLeagueInfo = {
  id: string;
  uid: string;
  code: string;
  name: string;
  slug: string;
};

export type RacingDriverLinks = {
  profile: string | null;
  stats: string | null;
  news: string | null;
};

export type RacingDriverStatistic = {
  [key: string]: unknown;
};

export type RacingDriver = {
  id: string;
  uid: string;
  type: string;
  name: string;
  displayName: string;
  shortName: string;
  flag: string | null;
  country: string | null;
  order: number | null;
  winner: boolean;
  statistics: RacingDriverStatistic[];
  links: RacingDriverLinks;
};

export type RacingGeoBroadcast = {
  type: string | null;
  market: string | null;
  media: string | null;
  lang: string | null;
  region: string | null;
};

export type RacingEventLinks = {
  summary: string | null;
  preview: string | null;
  circuit: string | null;
  tickets: string | null;
};

export type RacingEventStatus = {
  state?: string | null;
  name?: string | null;
  description?: string | null;
  detail?: string | null;
  shortDetail?: string | null;
  completed?: boolean;
  [key: string]: unknown;
};

export type RacingSeason = {
  [key: string]: unknown;
};

export type RacingCompetition = {
  [key: string]: unknown;
};

export type RacingEvent = {
  id: string;
  uid: string;
  league: string;
  leagueInfo: RacingLeagueInfo;
  name: string;
  shortName: string;
  date: string;
  startDate: string;
  endDate: string | null;
  timestamp: number;
  season: RacingSeason;
  status: RacingEventStatus;
  competitions: RacingCompetition[];
  drivers: RacingDriver[];
  competitors: RacingDriver[];
  winner: RacingDriver | null;
  broadcasts: string[];
  broadcast: string | null;
  geoBroadcasts: RacingGeoBroadcast[];
  links: RacingEventLinks;
};

export type RacingEventsResponse = {
  league: string;
  leagueInfo: RacingLeagueInfo;
  season: RacingSeason | null;
  date: string;
  count: number;
  events: RacingEvent[];
};

export type UseRacingEventsOptions = {
  date?: Date | string | number | null;
  league?: string;
  enabled?: boolean;
  pollLiveEvents?: boolean;
  pollIntervalMs?: number;
};

export type FetchRacingEventsOptions = {
  forceRefresh?: boolean;
  silent?: boolean;
};
