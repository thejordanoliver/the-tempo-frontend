export type RacingLeague =
  | "f1"
  | "nascarpremier"
  | "nascarsecondary"
  | "nascartruck";

export type RacingLeagueInfo = {
  key: RacingLeague;
  label: string;
  name?: string | null;
  sport: "racing";
  espnLeague: string;
};

export type RacingProvider = {
  name: string;
  fetchedAt: string;
};

export type RacingSeason = {
  year: number | null;
  type: number | null;
  slug: string | null;
};

export type RacingStatus = {
  state: string | null;
  name: string | null;
  description: string | null;
  detail: string | null;
  shortDetail: string | null;
  period: number | null;
  clock: number | string | null;
  displayClock: string | null;
  completed: boolean;
};

/**
 * Temporary alias for components still importing RacingEventStatus.
 */
export type RacingEventStatus = RacingStatus;

// ---------- IMAGE TYPES ----------

export type RacingImageAsset = {
  href: string;
  width: number | null;
  height: number | null;
  alt: string | null;
  rel: string[];
};

// ---------- VENUE TYPES ----------

export type RacingVenue = {
  id: string | null;
  name: string | null;

  city: string | null;
  state: string | null;
  country: string | null;

  image: RacingImageAsset | null;
  images: RacingImageAsset[];

  countryFlag: RacingImageAsset | null;
};

// ---------- CIRCUIT TYPES ----------

export type RacingFastestLapDriver = {
  fullName: string | null;

  headshot: RacingImageAsset | null;
  flag: RacingImageAsset | null;

  year: number | null;
  time: string | null;
};

export type RacingCircuit = {
  id: string | null;

  name: string | null;
  shortName: string | null;
  type: string | null;

  city: string | null;
  state: string | null;
  country: string | null;

  /**
   * Display-ready measurement returned by the API.
   *
   * Example: "7.004 km"
   */
  length: string | null;

  /**
   * Numeric circuit length in kilometers.
   *
   * Example: 7.004
   */
  lengthKm: number | null;

  /**
   * Display-ready race distance.
   *
   * Example: "308.052 km"
   */
  distance: string | null;

  /**
   * Numeric race distance in kilometers.
   *
   * Example: 308.052
   */
  distanceKm: number | null;

  laps: number | null;
  turns: number | null;

  direction: string | null;
  established: number | null;

  diagram: RacingImageAsset | null;
  diagrams: RacingImageAsset[];

  image: RacingImageAsset | null;
  countryFlag: RacingImageAsset | null;

  fastestLapDriver: RacingFastestLapDriver | null;
};

/**
 * Temporary alias for existing components importing Circuit.
 */
export type Circuit = RacingCircuit;

// ---------- STATISTIC TYPES ----------

export type RacingStatisticValue =
  | number
  | string
  | boolean
  | null;

export type RacingStatistic = {
  name: string | null;
  displayName: string | null;
  shortDisplayName: string | null;
  description: string | null;
  abbreviation: string | null;

  value: RacingStatisticValue;
  displayValue: RacingStatisticValue;

  rank: number | null;
};

/**
 * Temporary alias for older components.
 */
export type RacingDriverStatistic = RacingStatistic;

// ---------- DRIVER TYPES ----------

export type RacingDriverLinks = {
  profile: string | null;
  stats: string | null;
  news: string | null;
  bio: string | null;
  splits: string | null;
  gamelog: string | null;
};

export type RacingDriver = {
  /**
   * ESPN may omit driver IDs in incomplete race-package responses.
   */
  id: string | null;

  uid: string | null;

  type: string | null;

  headshot: string | null;

  fullName: string | null;
  name?: string | null;
  displayName?: string | null;
  abbreviation: string | null;

  team: string | null;
  teamColor: string | null;

  shortName: string | null;

  position: number | null;
  order?: number | null;

  winner: boolean;

  flag: string | null;
  country: string | null;

  statistics: RacingStatistic[];

  /**
   * Optional because the current racing normalizer does not always
   * receive or return driver links.
   */
  links?: RacingDriverLinks;
};

// ---------- BROADCAST TYPES ----------

export type RacingGeoBroadcast = {
  type: string | null;
  market: string | null;
  media: string | null;
  lang: string | null;
  region: string | null;
};

// ---------- COMPETITION TYPES ----------

export type RacingCompetitionType = {
  id: string | null;
  name: string | null;
  abbreviation: string | null;
  text: string | null;
};

export type RacingCompetition = {
  id: string | null;
  uid: string | null;

  date: string | null;
  startDate: string | null;
  timestamp: number | null;

  timeValid: boolean | null;
  recent: boolean | null;

  type: RacingCompetitionType;

  status: RacingStatus;

  broadcasts: string[];
  broadcast: string | null;

  geoBroadcasts: RacingGeoBroadcast[];

  venue: RacingVenue;
  circuit: RacingCircuit;

  /**
   * Canonical normalized driver array.
   */
  drivers: RacingDriver[];

  /**
   * Temporary alias while older components are migrated.
   */
  competitors?: RacingDriver[];

  winner: RacingDriver | null;
};

export type RacingCompetitionSummary = {
  id: string | null;
  uid: string | null;

  date: string | null;
  startDate: string | null;
  timestamp: number | null;

  type: RacingCompetitionType;

  status: RacingStatus;

  broadcasts: string[];
  broadcast: string | null;

  driverCount: number;
};

// ---------- EVENT TYPES ----------

export type RacingEventLinks = {
  summary: string | null;
  preview: string | null;
  circuit: string | null;
  tickets: string | null;
};

/**
 * Supplemental race-package objects differ between F1 and NASCAR.
 * Keep their raw values available while individual UI types are added.
 */
export type RacingSupplementalRecord = Record<string, unknown>;

export type RacingEvent = {
  id: string | null;
  uid: string | null;

  league: RacingLeague;
  leagueInfo?: RacingLeagueInfo | null;

  name: string | null;
  shortName: string | null;

  date: string | null;
  startDate: string | null;
  endDate: string | null;

  timestamp: number | null;

  season: RacingSeason;
  status: RacingStatus;

  venue: RacingVenue;
  circuit: RacingCircuit;

  competitions: RacingCompetition[];

  primaryCompetition: RacingCompetitionSummary | null;
  driverCompetition: RacingCompetitionSummary | null;

  drivers: RacingDriver[];

  /**
   * Temporary alias while older components are migrated.
   */
  competitors?: RacingDriver[];

  winner: RacingDriver | null;

  broadcasts: string[];
  broadcast: string | null;

  geoBroadcasts: RacingGeoBroadcast[];

  links: RacingEventLinks;

  /**
   * Supplemental fields are returned by the detailed ESPN
   * race-package endpoint, but not always by scoreboard endpoints.
   */
  articles?: RacingSupplementalRecord[];
  news?: RacingSupplementalRecord;
  videos?: RacingSupplementalRecord[];
  commentaries?: RacingSupplementalRecord[];
  positions?: RacingSupplementalRecord[];
};

// ---------- API RESPONSE TYPES ----------

export type RacingEventsResponse = {
  league: RacingLeagueInfo;

  date: string | null;

  season: RacingSeason;

  events: RacingEvent[];

  count: number;

  provider: RacingProvider;
};

// ---------- HOOK TYPES ----------

export type UseRacingEventsOptions = {
  date?: Date | string | number | null;
  league?: RacingLeague | string;
  enabled?: boolean;
  pollLiveEvents?: boolean;
  pollIntervalMs?: number;
};

export type FetchRacingEventsOptions = {
  forceRefresh?: boolean;
  silent?: boolean;
};

// ---------- COMPONENT PROP TYPES ----------

export type RacingEventCardProps = {
  game: RacingEvent;
};
