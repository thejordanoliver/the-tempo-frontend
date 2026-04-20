export type PlayoffTeam = {
  id: number;
  name: string;
  nickname: string;
  code: string;
  logo: string;
  seed?: number;
  conference?: string;
};

export type PlayoffGame = {
  id: number;
  date: { start: string };
  status: {
    short: number;
    long: string;
    clock: string;
    halftime: boolean;
  };
  periods: {
    current: number;
    total: number;
    endOfPeriod: boolean;
  };
  scores: {
    home: { points: number };
    visitors: { points: number };
  };
  teams: {
    home: PlayoffTeam;
    visitors: PlayoffTeam;
  };
};

export type PlayoffSeries = {
  teams: {
    top: PlayoffTeam;
    bottom: PlayoffTeam;
  };
  wins: Record<string, number>;
  leader: number;
  status: string;
  games: PlayoffGame[];
};

export type PlayoffResponse = {
  success: boolean;
  season: number;
  east: (PlayoffSeries | Record<string, never>)[];
  west: (PlayoffSeries | Record<string, never>)[];
  seriesCount: number;
};

export type BracketMatchup = {
  id: string;
  round: number;
  conference: "east" | "west" | "finals";
  topTeam?: PlayoffTeam;
  bottomTeam?: PlayoffTeam;
  winner?: PlayoffTeam;
  wins: Record<string, number>;
  leader?: number;
  status?: string;
  games: PlayoffGame[];
};

export type PlayoffBracket = {
  east: BracketMatchup[][];
  west: BracketMatchup[][];
  finals: BracketMatchup | null;
};
