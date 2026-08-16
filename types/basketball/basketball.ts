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
    espnId: number;
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
    nbaAPIID: number;
    rank: number;
    score: number;
    record: string;
    winner: boolean;
  };
  away: {
    id: number;
    espnId: number;
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
    nbaAPIID: number;
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
  isCBB?: boolean;
  isWCBB?: boolean;
  isWNBA?: boolean;
};

export type CardLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type NBAPlayoffGamesResponse = {
  success: boolean;
  league: "nba";
  leagueInfo?: any;
  season?: {
    year?: number | null;
    type?: number | null;
    slug?: string | null;
  };
  count: number;
  roundCount: number;
  rounds: NBAPlayoffRound[];
  games: NBAPlayoffGame[];
};

export type UseNBAPlayoffGamesOptions = {
  season?: number | string;
  dates?: string;
  enabled?: boolean;
  pollLiveGames?: boolean;
  pollIntervalMs?: number;
};

export type FetchPlayoffGamesOptions = {
  forceRefresh?: boolean;
  silent?: boolean;
};

export type NormalizedRoundKey =
  | "first-round"
  | "conference-semifinals"
  | "conference-finals"
  | "finals";

export type RoundDefinition = {
  key: NormalizedRoundKey;
  label: string;
  order: number;
};

export type NBAPlayoffId = string | number;

export type NBAPlayoffTeam = {
  id: NBAPlayoffId;
  espnId?: NBAPlayoffId | null;
  name?: string;
  shortName?: string | null;
  code?: string;
  logo?: any;
  seed?: number | string | null;
  playoffSeed?: number | string | null;
  conference?: string | null;
  score?: number;
  record?: string;
  winner?: boolean | null;
};

export type NBAPlayoffGame = {
  id: string | number;
  name?: string | null;
  shortName?: string | null;
  headline?: string | null;
  date?: string | null;
  startDate?: string | null;
  timestamp?: number | null;

  season?: {
    year?: number | null;
    type?: number | null;
    slug?: string | null;
  };

  status?: {
    state?: string | null;
    description?: string | null;
    detail?: string | null;
    shortDetail?: string | null;
    period?: number | null;
    clock?: string | number | null;
    displayClock?: string | number | null;
    completed?: boolean;
  };

  home?: NBAPlayoffTeam;
  away?: NBAPlayoffTeam;

  playoff?: {
    roundKey?: string;
    roundLabel?: string;
    roundOrder?: number;
    conference?: string | null;
    seriesKey?: string;
    seriesLabel?: string;
    gameNumber?: number | null;
  };

  [key: string]: any;
};

export type NBAPlayoffSeries = {
  key: string;
  label: string;
  conference?: "east" | "west" | "finals" | string | null;
  topSeed?: number | null;
  bottomSeed?: number | null;
  winner?: any;
  leader?: any;
  seriesSummary?: string | null;
  wins?: Record<string, number>;
  teams?: {
    top?: NBAPlayoffTeam;
    bottom?: NBAPlayoffTeam;
  };
  teamIds: (string | number)[];
  teamCodes: string[];
  teamNames: string[];
  count: number;
  games: NBAPlayoffGame[];
};

export type NBAPlayoffResponse = {
  success: boolean;
  season: number;
  east: (NBAPlayoffSeries | Record<string, never>)[];
  west: (NBAPlayoffSeries | Record<string, never>)[];
  seriesCount: number;
};

export type NBABracketMatchup = {
  id: string;
  round: number;
  conference: "east" | "west" | "finals";
  topTeam?: NBAPlayoffTeam;
  bottomTeam?: NBAPlayoffTeam;
  winner?: NBAPlayoffTeam;
  wins: Record<string, number>;
  leader?: NBAPlayoffId;
  seriesSummary?: string | null;
  status?: string;
  games: NBAPlayoffGame[];
};

export type NBAPlayoffRound = {
  key: string;
  label: string;
  order: number;
  count: number;
  series: NBAPlayoffSeries[];
};

export type PlayoffBracket = {
  east: NBABracketMatchup[][];
  west: NBABracketMatchup[][];
  finals: NBABracketMatchup | null;
};
