import type { ScheduleMonthGroup } from "../schedule";
import type { GameVenueInfo } from "../gameVenue";
import type { Highlight } from "../types";
import type { Official } from "hooks/FootballHooks/useFootballGameDetails";

export type VolleyballLeagueKey = "mcvb" | "wcvb";

export type VolleyballLeague = {
  id: number;
  uid: string;
  code: VolleyballLeagueKey;
  name: string;
  slug: string;
};

export type VolleyballSeason = {
  year: number | null;
  type: number | null;
  slug: string | null;
};

export type VolleyballTeam = {
  id: string | null;
  name: string | null;
  fullName: string | null;
  code: string | null;
  league: VolleyballLeagueKey;
  primaryColor: string | null;
  secondaryColor: string | null;
  logo?: string | null;
  logoDark?: string | null;
  score?: number | null;
  setsWon?: number | null;
  winner?: boolean | null;
  record?: string | null;
  rank?: number | null;
};

export type VolleyballGame = {
  id: string;
  uid?: string | null;
  league: VolleyballLeague;
  season: VolleyballSeason;
  name: string | null;
  shortName: string | null;
  date: string | null;
  startDate: string | null;
  timestamp: number | null;
  state: string;
  status: {
    state: string;
    completed: boolean;
    period: number;
    description: string | null;
    detail: string | null;
    shortDetail: string | null;
    name: string | null;
  };
  home: VolleyballTeam;
  away: VolleyballTeam;
  sets: {
    number: number;
    home: number | null;
    away: number | null;
    completed: boolean;
  }[];
  bestOf: number;
  venue: {
    id: string | null;
    name: string | null;
    city: string | null;
    state: string | null;
    indoor: boolean;
  } | null;
  broadcasts: string[];
  headline: string | null;
};

export type VolleyballGameCardProps = {
  game: VolleyballGame;
  isMCVB?: boolean;
  isWCVB?: boolean;
  compact?: boolean;
};

export type VolleyballScoreboard = {
  league: VolleyballLeagueKey;
  leagueInfo: VolleyballLeague;
  season: VolleyballSeason;
  games: VolleyballGame[];
  calendar?: unknown[] | null;
  calendarStartDate?: string | null;
  calendarEndDate?: string | null;
};

export type VolleyballSchedule = {
  league: VolleyballLeagueKey;
  team: VolleyballTeam;
  games: VolleyballGame[];
  months: ScheduleMonthGroup<VolleyballGame>[];
  season: VolleyballSeason;
};

export type VolleyballStanding = {
  team: VolleyballTeam;
  stats: {
    name: string | null;
    label: string | null;
    value: number | null;
    displayValue: string | null;
  }[];
};
export type VolleyballStandingsGroup = {
  id: string | null;
  name: string | null;
  standings: VolleyballStanding[];
  children: VolleyballStandingsGroup[];
};
export type VolleyballStandings = {
  league: VolleyballLeagueKey;
  groups: VolleyballStandingsGroup[];
  standings: VolleyballStanding[];
};
export type VolleyballRankings = {
  available: boolean;
  rankings: {
    all: {
      id: string;
      name: string | null;
      date: string | null;
      ranks: {
        current: number | null;
        previous: number | null;
        recordSummary: string | null;
        team: VolleyballTeam;
      }[];
    }[];
  };
};
export type VolleyballGameDetails = {
  league: VolleyballLeagueKey;
  season: VolleyballSeason;
  game: VolleyballGame;
  score: VolleyballScore;
  details: VolleyballMatchDetails;
  attendance: number | null;
  boxscore: {
    teams: {
      team: VolleyballTeam;
      statistics: {
        name: string | null;
        label: string | null;
        displayValue: string | null;
      }[];
    }[];
    players: {
      team: VolleyballTeam;
      statistics: {
        name: string | null;
        labels: string[];
        athletes: {
          athlete: {
            id: string | null;
            name: string | null;
            position: string | null;
          };
          stats: string[];
        }[];
      }[];
    }[];
  };
  videos: VolleyballVideo[];
};

export type VolleyballVideo = {
  id: string;
  title: string | null;
  description: string | null;
  thumbnail: string | null;
  duration: number | null;
  url: string | null;
  mp4: string | null;
  hls: string | null;
  webUrl: string | null;
};

export type VolleyballPlay = {
  id: string;
  text: string | null;
  period: number | null;
  homeScore: number | null;
  awayScore: number | null;
  scoringPlay: boolean;
  team: VolleyballTeam | null;
};

export type VolleyballScore = VolleyballGame & {
  gameId: string;
  lastUpdated: number;
  status: VolleyballGame["status"] & {
    id: string | null;
    clock: number | null;
    displayClock: string | null;
    gameStatusDescription: string | null;
    gameStatusDetail: string | null;
  };
  periodScores: { period: number; home: number | null; away: number | null }[];
  teamStats: {
    team: VolleyballTeam;
    homeAway: string | null;
    stats: { name: string; displayName: string; displayValue: string | null }[];
  }[];
  playerStats: VolleyballGameDetails["boxscore"]["players"];
  plays: VolleyballPlay[];
  lastPlay: VolleyballPlay | null;
};

export type VolleyballMatchDetails = {
  headline: string | null;
  broadcast: string | null;
  broadcasts: string[];
  seasonState: string | null;
  neutralSite: boolean;
  conferenceCompetition: boolean;
  venue: {
    id: string | null;
    fullName: string | null;
    address: { city: string | null; state: string | null; zipCode: string | null; country: string | null };
    images: { href: string | null }[];
  } | null;
  venueInfo: GameVenueInfo | null;
  attendance: number | null;
  officials: Official[];
  highlights: Highlight[];
  available: { teamStats: boolean; playerStats: boolean; plays: boolean; highlights: boolean };
};

export type VolleyballGameDetailsResponse = Pick<VolleyballGameDetails, "score" | "details">;

export type VolleyballDirectoryTeam = {
  id: number;
  shortName: string;
  name: string | null;
  code: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  logo: string | null;
  logoDark: string | null;
  isActive: boolean;
  isAllStar: boolean;
  isNational: boolean;
};
