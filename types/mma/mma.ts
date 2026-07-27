export type MMALeague = "ufc" | "mma";

export type MMAAthlete = {
  id?: string | number | null;
  uid?: string | null;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  shortName?: string | null;
  nickname?: string | null;
  headshot?: string | null;
  leftStance?: string | null;
  rightStance?: string | null;
  age?: string | null;
  weight?: string | null;
  height?: string | null;
  reach?: string | null;
  color?: string | null;
  secondaryColor?: string | null;
  weightClassText?: string | null;
  weightClassShortName?: string | null;
  weightClassSlug?: string | null;
  associationName?: string | null;
  associationCountry?: string | null;
  styleText?: string | null;
  flag?: string | null;
  country?: string | null;
  record?: string | null;
  winner?: boolean | null;
  homeAway?: string | null;
  order?: number | null;
  isChampion?: boolean;
};

export type MMAFight = {
  id?: string | number | null;
  uid?: string | null;
  name?: string | null;
  shortName?: string | null;
  date?: string | null;
  startDate?: string | null;
  timestamp?: number | null;
  status: {
    state: string;
    description: string;
    detail: string;
    shortDetail: string;
    period: number | null;
    clock: number;
    displayClock: string;
    completed: boolean;
  };
  weightClass: string | null;
  cardSegment: string | null;
  headline?: string | null;
  competitors?: MMAAthlete[];
  winner?: MMAAthlete | null;
  method?: string | null;
  round?: number | null;
  time?: string | null;
  order?: number | null;
  venue?: any;
  broadcasts?: string[];
  geoBroadcasts?: any[];
  raw?: any;
  [key: string]: any;
};

export type MMAEvent = {
  league?: any;
  id: string | number;
  uid?: string | null;
  name?: string | null;
  shortName?: string | null;
  headline?: string | null;
  date?: string | null;
  startDate?: string | null;
  timestamp?: number | null;
  season?: any;
  status?: {
    state?: string | null;
    description?: string | null;
    detail?: string | null;
    shortDetail?: string | null;
    period?: number | null;
    clock?: number | string | null;
    displayClock?: string | null;
    completed?: boolean;
    statusPrimary?: string | null;
    [key: string]: any;
  } | null;
  venue?: any;
  broadcasts?: string[];
  geoBroadcasts?: any[];
  fights?: MMAFight[];
  mainEvent?: MMAFight | null;
  competitors?: MMAAthlete[];
  home?: any;
  away?: any;
  raw?: any;

  gameId?: string | number | null;
  eventId?: string | number | null;
  parentEventId?: string | number | null;
  eventName?: string | null;
  eventShortName?: string | null;
  parentEvent?: any;

  [key: string]: any;
};

export type MMAGamesResponse = {
  league?: string;
  leagueInfo?: {
    id?: string | number | null;
    uid?: string | null;
    code?: string | null;
    name?: string | null;
    slug?: string | null;
    [key: string]: any;
  } | null;
  season?: any;
  date?: string | null;
  count?: number;
  events?: MMAEvent[];
  games?: MMAEvent[];
  [key: string]: any;
};

export type MMAFightCardProps = {
  game: MMAFight;
};

export type MMADivision =
  | "Heavyweight"
  | "Light Heavyweight"
  | "Middleweight"
  | "Welterweight"
  | "Lightweight"
  | "Featherweight"
  | "Bantamweight"
  | "Flyweight"
  | "Women's Featherweight"
  | "Women's Bantamweight"
  | "Women's Flyweight"
  | "Women's Strawweight";
