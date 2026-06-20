import placeholderImage from "assets/Placeholders/playerPlaceholder.png";
import { Venue } from "./types";
export type NullableString = string | null;

export type MMALeagueInfo = {
  id: string;
  uid?: NullableString;
  code?: NullableString;
  name: string;
  slug?: NullableString;
};

export type MMASeason = {
  year?: number | null;
  type?: number | null;
  slug?: NullableString;
};

export type MMAStatusState = "pre" | "in" | "post" | string;

export type MMAStatus = {
  state: MMAStatusState;
  description: string;
  detail: string;
  shortDetail: string;
  period: number;
  clock: number;
  displayClock: string;
  completed: boolean;
  statusPrimary: NullableString;
};

export type RawMMAStatus = {
  clock?: number;
  displayClock?: string;
  period?: number;
  type?: {
    id?: string;
    name?: string;
    state?: MMAStatusState;
    completed?: boolean;
    description?: string;
    detail?: string;
    shortDetail?: string;
  };
};

export type MMAFlag = {
  href: string;
  alt?: NullableString;
  rel?: string[];
};

export type MMAAccolade = {
  id: string;
  name: string;
  type: string;
};

export type MMARecord = {
  name?: string;
  abbreviation?: string;
  type?: string;
  summary?: string;
};

export type RawMMAAthlete = {
  id?: string;
  uid?: string;
  type?: string;
  order?: number;
  winner?: boolean;
  athlete?: {
    fullName?: string;
    displayName?: string;
    shortName?: string;
    flag?: MMAFlag | null;
    accolades?: MMAAccolade[];
  };
  records?: MMARecord[];
};

export type RawGeoBroadcast = {
  type?: {
    id?: NullableString;
    shortName?: NullableString;
  };
  market?: {
    id?: NullableString;
    type?: NullableString;
  };
  media?: {
    shortName?: NullableString;
  };
  lang?: NullableString;
  region?: NullableString;
};

export type GeoBroadcast = {
  type?: NullableString;
  market?: NullableString;
  media?: NullableString;
  lang?: NullableString;
  region?: NullableString;
};

export type MMABroadcast = {
  market?: NullableString;
  names?: string[];
};

export type MMADBEnrichedFighterFields = {
  firstName?: NullableString;
  lastName?: NullableString;
  nickname?: NullableString;
  fullName?: NullableString;

  apiRef?: NullableString;
  guid?: NullableString;
  slug?: NullableString;

  weight?: string | number | null;
  height?: NullableString;
  reach?: NullableString;
  age?: number | null;
  birthDate?: NullableString;
  gender?: "M" | "F" | "MALE" | "FEMALE" | string | null;

  weightClassId?: NullableString;
  weightClassText?: NullableString;
  weightClassShortName?: NullableString;
  weightClassSlug?: NullableString;

  stanceId?: NullableString;
  stanceText?: NullableString;

  associationId?: NullableString;
  associationName?: NullableString;
  associationCountry?: NullableString;

  styleId?: NullableString;
  styleText?: NullableString;

  statusId?: NullableString;
  statusName?: NullableString;
  statusType?: NullableString;
  statusAbbreviation?: NullableString;

  active?: boolean | null;
  linked?: boolean | null;
  isChampion?: boolean | null;

  citizenship?: NullableString;
  citizenshipCountryId?: NullableString;
  citizenshipCountryCode?: NullableString;
  citizenshipCountryColor?: NullableString;
  citizenshipCountryAltColor?: NullableString;

  flagUrl?: NullableString;
  headshotUrl?: NullableString;
  leftStanceUrl?: NullableString;
  rightStanceUrl?: NullableString;
};

export type MMACompetitor = MMADBEnrichedFighterFields & {
  id?: string;
  uid?: NullableString;
  name?: string;
  firstName?: NullableString;
  lastName?: NullableString;
  nickname?: NullableString;
  shortName: NullableString;
  headshot?: NullableString;
  leftStance?: NullableString;
  rightStance?: NullableString;
  flag?: NullableString;
  country?: NullableString;
  color: string;
  secondaryColor: string;
  record?: NullableString;
  winner?: boolean | null;
  homeAway?: NullableString;
  order?: number | null;
  result?: NullableString;
  raw?: RawMMAAthlete;
};

export type RawMMAFight = {
  id: string;
  uid: string;
  date?: NullableString;
  endDate?: NullableString;
  type?: {
    id?: string;
    abbreviation?: string;
  };
  timeValid?: boolean;
  neutralSite?: boolean;
  playByPlayAvailable?: boolean;
  recent?: boolean;
  venue?: Venue;
  competitors?: RawMMAAthlete[];
  status?: RawMMAStatus;
  broadcasts?: MMABroadcast[];
  format?: {
    regulation?: {
      periods?: number;
    };
  };
  startDate?: NullableString;
  broadcast?: NullableString;
  geoBroadcasts?: RawGeoBroadcast[];
  highlights?: any[];
};

export type MMAFight = {
  id: string;
  uid: string;
  name: string;
  shortName: string;

  status: MMAStatus;

  weightClass?: NullableString;
  cardSegment?: NullableString;
  headline?: NullableString;

  competitors: MMACompetitor[];
  winner?: MMACompetitor | null;

  method?: NullableString;
  round?: number | null;
  time?: NullableString;
  order?: number | null;

  raw?: RawMMAFight;

  gameId?: string | number | null;
  eventId?: string | number | null;
  parentEventId?: string | number | null;

  league?: MMALeagueInfo | null;
  season?: MMASeason | null;

  date?: NullableString;
  startDate?: NullableString;
  timestamp?: number | null;

  venue?: Venue;
  broadcasts?: string[];
  geoBroadcasts?: GeoBroadcast[];

  eventName?: NullableString;
  eventShortName?: NullableString;
  parentEvent?: MMAEvent | null;
  mainEvent?: MMAFight | null;
  fights?: MMAFight[];
};

export type MMATeamLikeFighter = Pick<
  MMADBEnrichedFighterFields,
  | "nickname"
  | "weightClassText"
  | "stanceText"
  | "associationName"
  | "statusType"
  | "active"
  | "isChampion"
> & {
  id?: string;
  name?: string;
  shortName?: NullableString;
  code?: NullableString;
  logo?: NullableString;
  record?: NullableString;
  winner?: boolean | null;
};

export type MMAEvent = {
  league: MMALeagueInfo;

  id: string;
  uid: string;
  name: string;
  shortName: string;
  headline?: NullableString;

  date: string;
  startDate: string;
  timestamp?: number | null;

  season?: MMASeason | null;
  status: MMAStatus;

  venue?: Venue | null;
  broadcasts: string[];
  geoBroadcasts?: GeoBroadcast[];

  fights: MMAFight[];
  mainEvent?: MMAFight | null;

  competitors?: MMACompetitor[];

  home?: MMATeamLikeFighter | null;
  away?: MMATeamLikeFighter | null;

  isNeutralSite?: boolean;
  attendance?: number | null;
  playByPlayAvailable?: boolean;
  recent?: boolean;
  wasSuspended?: boolean;

  raw?: any;
};

export type MMAGamesResponse = {
  league: string;
  leagueInfo: MMALeagueInfo;
  season: MMASeason | null;
  date: string;
  count: number;
  events: MMAEvent[];
  games?: MMAEvent[];
};

export type MMAFightCardProps = {
  game: MMAFight;
};
export type MMAAthlete = {
  id: number; // API Sports ID
  espn_id: string | null; // ESPN ID can be null
  first_name: string;
  last_name: string;
  full_name: string;
  short_name: string | null;
  nickname: string | null;
  weight: string | null;
  height: string | null;
  reach: string | null;
  stance: string | null;
  weight_class: string | null;
  team_id: number | null;
  team_name: string | null;
  gender: "M" | "F" | null;
  date_of_birth: string | null;
  citizenship: string | null;
  country_code: string | null;
  flag_url: string | null;
  active: boolean;
  slug: string | null;
  images: {
    rel: string[];
    href: string;
  }[];
  created_at: string | Date;
  updated_at: string | Date;
  record: string;
  wins: number | null;
  losses: number | null;
  draws: number | null;
  no_contests: number | null;
  color: string | null;
  alternate_color: string | null;
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

export type MMAChampionFighter = MMAAthlete & {
  api_ref?: string | null;
  uid?: string | null;
  guid?: string | null;

  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  display_name?: string | null;
  short_name?: string | null;
  nickname?: string | null;
  slug?: string | null;

  weight?: string | number | null;
  height?: string | null;
  reach?: string | null;
  age?: number | null;
  birth_date?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;

  active?: boolean | null;
  linked?: boolean | null;

  citizenship?: string | null;
  citizenship_country_id?: string | null;
  citizenship_country_code?: string | null;
  citizenship_country_color?: string | null;
  citizenship_country_alt_color?: string | null;
  flag_url?: string | null;

  headshot_url?: string | null;
  left_stance_url?: string | null;
  right_stance_url?: string | null;

  weight_class_id?: string | null;
  weight_class_text?: string | null;
  weight_class_short_name?: string | null;
  weight_class_slug?: string | null;

  stance_id?: string | null;
  stance_text?: string | null;

  association_id?: string | null;
  association_name?: string | null;
  association_country?: string | null;

  style_id?: string | null;
  style_text?: string | null;

  status_id?: string | null;
  status_name?: string | null;
  status_type?: string | null;
  status_abbreviation?: string | null;

  statistics_ref?: string | null;
  records_ref?: string | null;

  record?: string | null;
};

export type MMAChampion = {
  fighter_id: string | number;

  accolade_key: string | number | null;
  accolade_id: string | number | null;
  accolade_name: string;
  accolade_type: string | null;

  division: MMADivision | string | null;
  division_slug: string | null;

  is_current: boolean | null;

  created_at: string | null;
  updated_at: string | null;

  fighter: MMAChampionFighter;
};

export type MMAChampionsResponse = Partial<
  Record<MMADivision | string, MMAChampion[]>
>;

export const emptyFighter: MMAAthlete = {
  id: 0,
  espn_id: null,
  first_name: "Unknown",
  last_name: "Fighter",
  full_name: "Unknown Fighter",
  short_name: "UNK",
  nickname: null,
  weight: null,
  height: null,
  reach: null,
  stance: null,
  weight_class: null,
  team_id: null,
  team_name: null,
  gender: null,
  date_of_birth: null,
  citizenship: null,
  country_code: null,
  flag_url: null,
  active: false,
  slug: null,

  images: [
    {
      rel: ["player", "default"],
      href: placeholderImage,
    },
  ],

  created_at: new Date(),
  updated_at: new Date(),

  record: "0-0-0",
  wins: 0,
  losses: 0,
  draws: 0,
  no_contests: 0,
  color: null,
  alternate_color: null,
};
