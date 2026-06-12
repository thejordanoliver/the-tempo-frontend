export type PlayerOutcome = {
  name: "Over" | "Under";
  description: string; // Player name
  price: number;
  point: number;
};

type Market = {
  key: string;
  last_update: string;
  outcomes: PlayerOutcome[];
};

type Bookmaker = {
  key: string;
  title: string;
  markets: Market[];
};

export type EventOdds = {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team_id?: number;
  away_team_id?: number;
  neutral: boolean;
  home_team: string;
  away_team: string;
  bookmakers: Bookmaker[];
};

export type UseEventOddsParams = {
  homeId: number | string;
  awayId: number | string;
  date: string; // YYYYMMDD
  markets?: string; // comma-separated
  bookmakers?: string;
  regions?: string;
  oddsFormat?: "american" | "decimal";
  enabled?: boolean;
};

export type GameOddsSectionProps = {
  date: string | number | undefined | null;
  gameDate: string;
  neutralSite?: boolean;
  league?: string;
  isDark: boolean;
  awayLogo: any;
  homeLogo: any;
  homeCode: string | undefined;
  awayCode: string | undefined;
  gameStatusDescription: string | undefined;
};
