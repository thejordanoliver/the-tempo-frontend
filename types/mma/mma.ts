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
  id?: number | null;
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

/* -------------------------------------------------------------------------- */
/*                              MMA Divisions                                 */
/* -------------------------------------------------------------------------- */

export type MMADivision =
  | "Heavyweight"
  | "Light Heavyweight"
  | "Middleweight"
  | "Welterweight"
  | "Lightweight"
  | "Featherweight"
  | "Bantamweight"
  | "Flyweight"
  | "Women's Bantamweight"
  | "Women's Flyweight"
  | "Women's Strawweight";

/* -------------------------------------------------------------------------- */
/*                                MMA Fighter                                 */
/* -------------------------------------------------------------------------- */

export type MMAChampionFighter = {
  id: number;
  age: number | null;

  uid: string | null;
  guid: string | null;
  slug: string | null;

  first_name: string | null;
  last_name: string | null;
  full_name: string;
  short_name: string | null;
  nickname: string | null;

  gender: string | null;
  active: boolean;
  linked: boolean;

  height: string | null;
  weight: number | null;
  reach: string | null;

  birth_date: string | null;

  citizenship: string | null;
  citizenship_country_id: string | null;
  citizenship_country_code: string | null;
  citizenship_country_color: string | null;
  citizenship_country_alt_color: string | null;

  flag_url: string | null;
  headshot_url: string | null;
  left_stance_url: string | null;
  right_stance_url: string | null;

  style_id: string | null;
  style_text: string | null;

  stance_id: string | null;
  stance_text: string | null;

  status_id: string | null;
  status_name: string | null;
  status_type: string | null;
  status_abbreviation: string | null;

  weight_class_id: string | null;
  weight_class_slug: string | null;
  weight_class_text: string | null;
  weight_class_short_name: string | null;

  association_id: string | null;
  association_name: string | null;
  association_country: string | null;

  api_ref: string | null;
  records_ref: string | null;
  statistics_ref: string | null;

  created_at: string;
  updated_at: string;
};

/* -------------------------------------------------------------------------- */
/*                             MMA Championship                               */
/* -------------------------------------------------------------------------- */

export type MMAChampionship = {
  fighter_id: string;

  accolade_key: string;
  accolade_id: string;
  accolade_name: string;
  accolade_type: string;

  division: MMADivision | string;
  division_slug: string;

  is_current: boolean | null;

  created_at: string;
  updated_at: string;

  fighter: MMAChampionFighter;
};

/* -------------------------------------------------------------------------- */
/*                           Champions API Response                           */
/* -------------------------------------------------------------------------- */

export type MMAChampionsResponse = Partial<
  Record<MMADivision, MMAChampionship[]>
>;

export type MMAChampionsApiResponse = {
  success: boolean;
  data: MMAChampionsResponse;
  error?: string;
};