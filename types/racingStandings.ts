import type { Season } from "hooks/LeagueHooks/useLeagueStandings";

export type RacingStanding = {
  id: string | null;
  athleteId?: string | null;
  teamId?: string | null;
  name: string | null;
  shortName: string | null;
  code: string | null;
  logo: string | null;
  flag: string | null;
  country: string | null;
  color: string | null;
  rank: number | null;
  points: number;
  races: {
    id: string;
    name: string;
    shortName: string | null;
    code: string;
    played: boolean;
    points: number | null;
    displayValue: string | null;
  }[];
};

export type RacingStandingsData = {
  season: number | null;
  seasonDisplayName: string | null;
  seasonType: number;
  availableSeasons: Season[];
  conferences: {
    id: string;
    name: string;
    code: string;
    abbreviation: string;
    standings: RacingStanding[];
  }[];
};
